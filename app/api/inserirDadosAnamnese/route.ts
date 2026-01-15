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
  // Agrupa dados do cliente no campo JSON dados_cliente
  const dadosCliente = {
    endereco: dadosFormulario.endereco || '',
    rg: dadosFormulario.rg || '',
    dataNascimento: dadosFormulario.dataNascimento || '',
    idade: dadosFormulario.idade || '',
    comoNosConheceu: dadosFormulario.comoNosConheceu || {},
    telefone: dadosFormulario.telefone || '',
    celular: dadosFormulario.celular || '',
    email: dadosFormulario.email || '',
  }

  // Agrupa avaliação médica no campo JSON avaliacao
  const avaliacao = {
    avaliacaoMedica: dadosFormulario.avaliacaoMedica || {},
    outrasQuestoesMedicas: dadosFormulario.outrasQuestoesMedicas || {},
    outroProblema: dadosFormulario.outroProblema || '',
    tipoSanguineo: dadosFormulario.tipoSanguineo || '',
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
    procedimento: dadosFormulario.procedimento || {},
    declaracoes: dadosFormulario.declaracoes || {},
  }

    // Retorna dados formatados para a estrutura do banco
  const dadosRetorno: any = {
    nome: dadosFormulario.nome,
    cpf: normalizarCpf(dadosFormulario.cpf), // Normaliza CPF removendo pontos e traços
    dados_cliente: dadosCliente,
    avaliacao: avaliacao,
    termos: termos,
    data_preenchimento_ficha: new Date().toISOString(), // data/hora atual em ISO
    info_tattoo: infoTattoo,
  }

  // Adiciona profissional_id se fornecido
  if (dadosFormulario.profissional_id) {
    dadosRetorno.profissional_id = typeof dadosFormulario.profissional_id === 'number' 
      ? dadosFormulario.profissional_id 
      : parseInt(String(dadosFormulario.profissional_id))
  }

  return dadosRetorno
}

export async function POST(request: NextRequest) {
  try {
    const dadosRecebidos: any = await request.json()
    const { profissional_id, ...dadosFormulario } = dadosRecebidos

    // Validação básica - verifica se nome e cpf foram enviados
    if (!dadosFormulario.nome || !dadosFormulario.cpf) {
      return NextResponse.json(
        {
          success: false,
          message: 'Nome e CPF são obrigatórios',
        },
        { status: 400 }
      )
    }

    // Valida profissional_id se fornecido
    if (profissional_id) {
      const profissionalIdNum = parseInt(profissional_id)
      if (isNaN(profissionalIdNum)) {
        return NextResponse.json(
          {
            success: false,
            message: 'ID do profissional inválido',
          },
          { status: 400 }
        )
      }

      // Verifica se o profissional existe
      const { data: profissional, error: errorProf } = await supabase
        .from('profissional_anamnese')
        .select('id')
        .eq('id', profissionalIdNum)
        .maybeSingle()

      if (errorProf || !profissional) {
        return NextResponse.json(
          {
            success: false,
            message: 'Profissional não encontrado',
          },
          { status: 400 }
        )
      }
    }

    // Normaliza o CPF antes de validar e salvar
    const cpfNormalizado = normalizarCpf(dadosFormulario.cpf)
    console.log(`[DEBUG] CPF normalizado: "${dadosFormulario.cpf}" -> "${cpfNormalizado}"`)

    // Mapeia os dados do formulário para a estrutura do banco
    const dadosBanco = mapearDadosParaBanco({ ...dadosFormulario, profissional_id })

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
      console.error('Erro ao inserir dados:', errorInsert)
      return NextResponse.json(
        {
          success: false,
          message: 'Erro ao salvar a ficha. Tente novamente.',
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
  } catch (error) {
    console.error('Erro ao salvar anamnese:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Erro ao salvar a ficha. Tente novamente.',
      },
      { status: 500 }
    )
  }
}
