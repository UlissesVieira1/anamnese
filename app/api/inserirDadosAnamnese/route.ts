import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { AnamneseTipagem } from '@/types/anamnese'

export const dynamic = 'force-dynamic'

/**
 * Mapeia os dados do formulário para a estrutura do banco de dados
 * @param dadosFormulario Dados recebidos do frontend
 * @returns Dados formatados para inserção no banco
 */
function mapearDadosParaBanco(dadosFormulario: AnamneseTipagem) {
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
  return {
    nome: dadosFormulario.nome,
    cpf: dadosFormulario.cpf,
    dados_cliente: dadosCliente,
    avaliacao: avaliacao,
    termos: termos,
    data_preenchimento_ficha: new Date().toISOString(), // data/hora atual em ISO
    info_tattoo: infoTattoo,
  }
}

export async function POST(request: NextRequest) {
  try {
    const dadosFormulario: AnamneseTipagem = await request.json()

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

    // Mapeia os dados do formulário para a estrutura do banco
    const dadosBanco = mapearDadosParaBanco(dadosFormulario)

    // Verifica se o cliente já preencheu a ficha de anamnese
    const { data: clienteExistente, error: errorConsulta } = await supabase
      .from('ficha_anamnese')
      .select('cpf')
      .eq('cpf', dadosFormulario.cpf)
      .single()

    if (errorConsulta && errorConsulta.code !== 'PGRST116') {
      // PGRST116 é o código de "nenhum resultado encontrado", que é esperado
      console.error('Erro ao consultar cliente:', errorConsulta)
      return NextResponse.json(
        {
          success: false,
          message: 'Erro ao verificar cliente existente.',
        },
        { status: 500 }
      )
    }

    // Se o cliente já existe, retorna erro
    if (clienteExistente) {
      return NextResponse.json(
        {
          success: false,
          message: 'Já existe uma ficha de anamnese preenchida para este CPF',
        },
        { status: 400 }
      )
    }

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
