import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { AnamneseTipagem } from '@/types/anamnese'

export const dynamic = 'force-dynamic'

/**
 * Normaliza o CPF removendo pontos e traços
 * @param cpf CPF formatado ou não
 * @returns CPF apenas com números
 */
function normalizarCpf(cpf: string): string {
  if (!cpf) return ''
  // Remove todos os caracteres não numéricos (pontos, traços, espaços, etc)
  return String(cpf).replace(/\D/g, '')
}

/**
 * Mapeia os dados do formulário para a estrutura do banco de dados
 * @param dadosFormulario Dados recebidos do frontend
 * @returns Dados formatados para inserção no banco
 */
function mapearDadosParaBanco(dadosFormulario: AnamneseTipagem & { profissional_id?: number }) {
  // Garante que campos string não sejam undefined
  const safeString = (value: any): string => {
    if (value === null || value === undefined) return ''
    return String(value)
  }

  // Garante que campos objeto não sejam undefined
  const safeObject = (value: any): any => {
    if (value === null || value === undefined) return {}
    if (typeof value === 'object' && !Array.isArray(value)) return value
    return {}
  }

  // Agrupa dados do cliente no campo JSON dados_cliente
  const dadosCliente = {
    endereco: safeString(dadosFormulario.endereco),
    rg: safeString(dadosFormulario.rg),
    dataNascimento: safeString(dadosFormulario.dataNascimento),
    idade: safeString(dadosFormulario.idade),
    comoNosConheceu: safeObject(dadosFormulario.comoNosConheceu),
    telefone: safeString(dadosFormulario.telefone),
    celular: safeString(dadosFormulario.celular),
    email: safeString(dadosFormulario.email),
  }

  // Agrupa avaliação médica no campo JSON avaliacao
  const avaliacao = {
    avaliacaoMedica: safeObject(dadosFormulario.avaliacaoMedica),
    outrasQuestoesMedicas: safeObject(dadosFormulario.outrasQuestoesMedicas),
    outroProblema: safeString(dadosFormulario.outroProblema),
    tipoSanguineo: safeString(dadosFormulario.tipoSanguineo),
  }

  // Determina o campo termos (char(2))
  // Se aceitou termos e todas as declarações estão marcadas, retorna "S", senão "N"
  let termos = 'N'
  if (dadosFormulario.aceiteTermos && dadosFormulario.declaracoes) {
    const todasDeclaracoes = Object.values(dadosFormulario.declaracoes).every(
      (valor: any) => valor === true
    )
    if (todasDeclaracoes) {
      termos = 'S'
    }
  }

  // Agrupa informações da tatuagem no campo JSON info_tattoo
  const infoTattoo = {
    procedimento: safeObject(dadosFormulario.procedimento),
    declaracoes: safeObject(dadosFormulario.declaracoes),
  }

  // Normaliza nome e cpf (validação já foi feita antes de chamar esta função)
  const nome = safeString(dadosFormulario.nome).trim()
  const cpf = normalizarCpf(dadosFormulario.cpf)

  // Retorna dados formatados para a estrutura do banco
  const dadosRetorno: any = {
    nome: nome,
    cpf: cpf,
    dados_cliente: dadosCliente,
    avaliacao: avaliacao,
    termos: termos,
    data_preenchimento_ficha: new Date().toISOString(),
    info_tattoo: infoTattoo,
  }

  // Adiciona id_profissional se fornecido e válido (nome correto da coluna no banco)
  if (dadosFormulario.profissional_id !== undefined && dadosFormulario.profissional_id !== null) {
    const profId = typeof dadosFormulario.profissional_id === 'number' 
      ? dadosFormulario.profissional_id 
      : parseInt(String(dadosFormulario.profissional_id))
    
    if (!isNaN(profId)) {
      dadosRetorno.id_profissional = profId
    }
  }

  return dadosRetorno
}

export async function POST(request: NextRequest) {
  try {
    const dadosRecebidos: any = await request.json()
    console.log('[DEBUG] Dados recebidos:', JSON.stringify(dadosRecebidos, null, 2))
    
    const { profissional_id, ...dadosFormulario } = dadosRecebidos

    // Validação básica - verifica se nome e cpf foram enviados
    if (!dadosFormulario.nome || !dadosFormulario.cpf) {
      console.log('[DEBUG] ❌ Validação falhou: nome ou cpf ausente')
      return NextResponse.json(
        {
          success: false,
          message: 'Nome e CPF são obrigatórios',
        },
        { status: 400 }
      )
    }

    // Valida e converte profissional_id se fornecido
    let profissionalIdNum: number | undefined = undefined
    if (profissional_id !== undefined && profissional_id !== null && profissional_id !== '') {
      profissionalIdNum = typeof profissional_id === 'number' 
        ? profissional_id 
        : parseInt(String(profissional_id))
      
      if (isNaN(profissionalIdNum)) {
        console.log('[DEBUG] ❌ ID do profissional inválido:', profissional_id)
        return NextResponse.json(
          {
            success: false,
            message: 'ID do profissional inválido',
          },
          { status: 400 }
        )
      }

      // Verifica se o profissional existe
      console.log('[DEBUG] Verificando profissional_id:', profissionalIdNum)
      const { data: profissional, error: errorProf } = await supabase
        .from('profissional_anamnese')
        .select('id')
        .eq('id', profissionalIdNum)
        .maybeSingle()

      if (errorProf) {
        console.error('[DEBUG] Erro ao verificar profissional:', errorProf)
        return NextResponse.json(
          {
            success: false,
            message: 'Erro ao verificar profissional',
          },
          { status: 500 }
        )
      }

      if (!profissional) {
        console.log('[DEBUG] ❌ Profissional não encontrado:', profissionalIdNum)
        return NextResponse.json(
          {
            success: false,
            message: 'Profissional não encontrado',
          },
          { status: 400 }
        )
      }
      
      console.log('[DEBUG] ✅ Profissional encontrado:', profissional.id)
    }

    // Normaliza o CPF antes de validar e salvar
    const cpfNormalizado = normalizarCpf(dadosFormulario.cpf)
    console.log(`[DEBUG] CPF normalizado: "${dadosFormulario.cpf}" -> "${cpfNormalizado}"`)

    // Mapeia os dados do formulário para a estrutura do banco
    const dadosBanco = mapearDadosParaBanco({ ...dadosFormulario, profissional_id: profissionalIdNum })
    console.log('[DEBUG] Dados mapeados para banco:', JSON.stringify(dadosBanco, null, 2))

    // Tenta buscar um cliente com o CPF normalizado exato
    console.log(`[DEBUG] Buscando CPF normalizado: "${cpfNormalizado}"`)
    
    const { data: clienteExato, error: errorBuscaExata } = await supabase
      .from('ficha_anamnese')
      .select('cpf, id')
      .eq('cpf', cpfNormalizado)
      .maybeSingle()

    if (errorBuscaExata) {
      console.error('[DEBUG] Erro na busca exata:', errorBuscaExata)
    }

    // Se encontrou com busca exata, já existe
    if (clienteExato) {
      console.log(`[DEBUG] 🚫 CPF duplicado encontrado (busca exata)! ID: ${clienteExato.id}`)
      return NextResponse.json(
        {
          success: false,
          message: 'Já existe uma ficha de anamnese preenchida para este CPF',
        },
        { status: 400 }
      )
    }

    // Se não encontrou com busca exata, busca TODOS para comparar normalizados
    // (para compatibilidade com registros antigos formatados)
    console.log(`[DEBUG] Não encontrou com busca exata, buscando todos os registros...`)
    const { data: todosClientes, error: errorConsulta } = await supabase
      .from('ficha_anamnese')
      .select('cpf, id')

    if (errorConsulta) {
      console.error('Erro ao consultar clientes:', errorConsulta)
      return NextResponse.json(
        {
          success: false,
          message: 'Erro ao verificar cliente existente.',
        },
        { status: 500 }
      )
    }

    console.log(`[DEBUG] Total de registros encontrados: ${todosClientes?.length || 0}`)

    // Verifica se existe algum cliente com o mesmo CPF (comparando CPFs normalizados)
    if (todosClientes && todosClientes.length > 0) {
      for (const cliente of todosClientes) {
        const cpfBancoNormalizado = normalizarCpf(cliente.cpf || '')
        
        if (cpfBancoNormalizado === cpfNormalizado && cpfBancoNormalizado !== '' && cpfNormalizado.length === 11) {
          console.log(`[DEBUG] 🚫 CPF DUPLICADO encontrado! ID: ${cliente.id}, CPF banco: "${cliente.cpf}" -> normalizado: "${cpfBancoNormalizado}"`)
          return NextResponse.json(
            {
              success: false,
              message: 'Já existe uma ficha de anamnese preenchida para este CPF',
            },
            { status: 400 }
          )
        }
      }
    }

    console.log(`[DEBUG] ✅ CPF único, prosseguindo com inserção`)

    // Insere os dados mapeados no banco Supabase
    const { error: errorInsert } = await supabase
      .from('ficha_anamnese')
      .insert([dadosBanco])

    if (errorInsert) {
      console.error('[DEBUG] ❌ Erro ao inserir dados no Supabase:', errorInsert)
      console.error('[DEBUG] Detalhes do erro:', {
        message: errorInsert.message,
        details: errorInsert.details,
        hint: errorInsert.hint,
        code: errorInsert.code
      })
      return NextResponse.json(
        {
          success: false,
          message: `Erro ao salvar a ficha: ${errorInsert.message || 'Erro desconhecido'}`,
          error: process.env.NODE_ENV === 'development' ? errorInsert : undefined,
        },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Ficha de anamnese salva com sucesso!',
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('[DEBUG] ❌ Erro capturado no catch:', error)
    console.error('[DEBUG] Stack trace:', error?.stack)
    return NextResponse.json(
      {
        success: false,
        message: `Erro ao salvar a ficha: ${error?.message || 'Erro desconhecido'}`,
        error: process.env.NODE_ENV === 'development' ? {
          message: error?.message,
          stack: error?.stack,
          name: error?.name
        } : undefined,
      },
      { status: 500 }
    )
  }
}
