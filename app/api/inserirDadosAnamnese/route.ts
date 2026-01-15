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
 * Valida CPF verificando dígitos verificadores
 * @param cpf CPF normalizado (apenas números)
 * @returns true se o CPF é válido, false caso contrário
 */
function validarCPF(cpf: string): boolean {
  if (!cpf) return false
  
  const cpfLimpo = normalizarCpf(cpf)
  
  // Verifica se tem 11 dígitos
  if (cpfLimpo.length !== 11) return false
  
  // Verifica se todos os dígitos são iguais (CPF inválido)
  if (/^(\d)\1{10}$/.test(cpfLimpo)) return false
  
  // Valida primeiro dígito verificador
  let soma = 0
  for (let i = 0; i < 9; i++) {
    soma += parseInt(cpfLimpo.charAt(i)) * (10 - i)
  }
  let resto = (soma * 10) % 11
  if (resto === 10 || resto === 11) resto = 0
  if (resto !== parseInt(cpfLimpo.charAt(9))) return false
  
  // Valida segundo dígito verificador
  soma = 0
  for (let i = 0; i < 10; i++) {
    soma += parseInt(cpfLimpo.charAt(i)) * (11 - i)
  }
  resto = (soma * 10) % 11
  if (resto === 10 || resto === 11) resto = 0
  if (resto !== parseInt(cpfLimpo.charAt(10))) return false
  
  return true
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
    // Verifica se não é string vazia (se for string)
    const isStringEmpty = typeof dadosFormulario.profissional_id === 'string' && dadosFormulario.profissional_id.trim() === ''
    
    if (!isStringEmpty) {
      const profId = typeof dadosFormulario.profissional_id === 'number' 
        ? dadosFormulario.profissional_id 
        : parseInt(String(dadosFormulario.profissional_id))
      
      if (!isNaN(profId) && profId > 0) {
        dadosRetorno.id_profissional = profId
        console.log('[DEBUG] id_profissional adicionado ao dadosRetorno:', profId)
      } else {
        console.log('[DEBUG] ⚠️ profissional_id inválido ou zero:', dadosFormulario.profissional_id)
      }
    } else {
      console.log('[DEBUG] ⚠️ profissional_id é string vazia')
    }
  } else {
    console.log('[DEBUG] ⚠️ profissional_id não fornecido ou vazio')
  }

  return dadosRetorno
}

export async function POST(request: NextRequest) {
  try {
    // Verifica autenticação do profissional
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')
    
    let profissionalAutenticadoId: number | null = null
    
    if (token) {
      try {
        const decoded = Buffer.from(token, 'base64').toString('utf-8')
        const tokenData = JSON.parse(decoded)
        if (tokenData.id) {
          profissionalAutenticadoId = tokenData.id
        }
      } catch (error) {
        console.error('[DEBUG] Erro ao decodificar token:', error)
      }
    }

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

    // Normaliza o CPF antes de validar
    const cpfNormalizado = normalizarCpf(dadosFormulario.cpf)
    console.log(`[DEBUG] CPF normalizado: "${dadosFormulario.cpf}" -> "${cpfNormalizado}"`)

    // Valida CPF (formato e dígitos verificadores)
    if (!validarCPF(cpfNormalizado)) {
      console.log('[DEBUG] ❌ CPF inválido:', cpfNormalizado)
      return NextResponse.json(
        {
          success: false,
          message: 'CPF inválido. Verifique os dígitos e tente novamente.',
        },
        { status: 400 }
      )
    }
    console.log('[DEBUG] ✅ CPF válido')

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

      // Valida se o profissional_id corresponde ao profissional autenticado
      // Se há autenticação, o profissional_id deve corresponder ao autenticado
      if (profissionalAutenticadoId) {
        if (profissionalAutenticadoId !== profissionalIdNum) {
          console.log('[DEBUG] ❌ Profissional_id não corresponde ao profissional autenticado:', {
            autenticado: profissionalAutenticadoId,
            fornecido: profissionalIdNum
          })
          return NextResponse.json(
            {
              success: false,
              message: 'ID do profissional não corresponde ao profissional autenticado',
            },
            { status: 403 }
          )
        }
        console.log('[DEBUG] ✅ Profissional_id corresponde ao profissional autenticado')
      }
      
      console.log('[DEBUG] ✅ Profissional encontrado e validado:', profissional.id)
    } else if (profissionalAutenticadoId) {
      // Se não foi fornecido profissional_id mas há autenticação, usa o profissional autenticado
      profissionalIdNum = profissionalAutenticadoId
      console.log('[DEBUG] Usando profissional autenticado:', profissionalIdNum)
      
      // Verifica se o profissional autenticado existe
      const { data: profissional, error: errorProf } = await supabase
        .from('profissional_anamnese')
        .select('id')
        .eq('id', profissionalIdNum)
        .maybeSingle()

      if (errorProf || !profissional) {
        console.error('[DEBUG] Erro ao verificar profissional autenticado:', errorProf)
        return NextResponse.json(
          {
            success: false,
            message: 'Profissional autenticado não encontrado',
          },
          { status: 400 }
        )
      }
    }

    // Garante que profissionalIdNum está definido antes de mapear
    if (profissionalIdNum === undefined && profissionalAutenticadoId) {
      profissionalIdNum = profissionalAutenticadoId
      console.log('[DEBUG] Usando profissional autenticado como fallback:', profissionalIdNum)
    }

    console.log('[DEBUG] Profissional ID que será salvo:', profissionalIdNum)

    // Mapeia os dados do formulário para a estrutura do banco
    const dadosBanco = mapearDadosParaBanco({ ...dadosFormulario, profissional_id: profissionalIdNum })
    console.log('[DEBUG] Dados mapeados para banco:', JSON.stringify(dadosBanco, null, 2))
    console.log('[DEBUG] id_profissional no dadosBanco:', dadosBanco.id_profissional)

    // Valida se já existe CPF duplicado para o MESMO profissional
    // Permite o mesmo CPF para profissionais diferentes
    console.log(`[DEBUG] Verificando CPF duplicado para profissional_id: ${profissionalIdNum}`)
    
    if (profissionalIdNum !== undefined && profissionalIdNum !== null) {
      // Busca cliente com o mesmo CPF E id_profissional
      const { data: clienteDuplicado, error: errorBuscaDuplicado } = await supabase
        .from('ficha_anamnese')
        .select('cpf, id, id_profissional')
        .eq('cpf', cpfNormalizado)
        .eq('id_profissional', profissionalIdNum)
        .maybeSingle()

      if (errorBuscaDuplicado) {
        console.error('[DEBUG] Erro na busca de duplicado:', errorBuscaDuplicado)
        return NextResponse.json(
          {
            success: false,
            message: 'Erro ao verificar cliente existente.',
          },
          { status: 500 }
        )
      }

      if (clienteDuplicado) {
        console.log(`[DEBUG] 🚫 CPF duplicado encontrado para o mesmo profissional! ID: ${clienteDuplicado.id}, Profissional: ${profissionalIdNum}`)
        return NextResponse.json(
          {
            success: false,
            message: 'Já existe uma ficha de anamnese preenchida para este CPF e profissional',
          },
          { status: 400 }
        )
      }

      console.log(`[DEBUG] ✅ CPF único para este profissional, prosseguindo com inserção`)
    } else {
      // Se não há profissional_id, busca apenas por CPF (compatibilidade com registros antigos)
      console.log(`[DEBUG] Sem profissional_id, verificando apenas CPF...`)
      const { data: clienteExato, error: errorBuscaExata } = await supabase
        .from('ficha_anamnese')
        .select('cpf, id, id_profissional')
        .eq('cpf', cpfNormalizado)
        .is('id_profissional', null)
        .maybeSingle()

      if (errorBuscaExata) {
        console.error('[DEBUG] Erro na busca exata:', errorBuscaExata)
      }

      if (clienteExato) {
        console.log(`[DEBUG] 🚫 CPF duplicado encontrado (sem profissional)! ID: ${clienteExato.id}`)
        return NextResponse.json(
          {
            success: false,
            message: 'Já existe uma ficha de anamnese preenchida para este CPF',
          },
          { status: 400 }
        )
      }

      console.log(`[DEBUG] ✅ CPF único (sem profissional_id), prosseguindo com inserção`)
    }

    // Insere os dados mapeados no banco Supabase
    console.log('[DEBUG] Inserindo dados no banco:', {
      nome: dadosBanco.nome,
      cpf: dadosBanco.cpf,
      id_profissional: dadosBanco.id_profissional
    })

    const { data: registroInserido, error: errorInsert } = await supabase
      .from('ficha_anamnese')
      .insert([dadosBanco])
      .select('id, nome, cpf, id_profissional')
      .single()

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

    console.log('[DEBUG] ✅ Registro inserido com sucesso:', {
      id: registroInserido?.id,
      nome: registroInserido?.nome,
      cpf: registroInserido?.cpf,
      id_profissional: registroInserido?.id_profissional
    })

    return NextResponse.json(
      {
        success: true,
        message: 'Ficha de anamnese salva com sucesso!',
        data: {
          id: registroInserido?.id,
          id_profissional: registroInserido?.id_profissional
        }
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
