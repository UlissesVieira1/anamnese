import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

/**
 * API para listar clientes cadastrados com paginação
 */
export async function GET(request: NextRequest) {
  try {
    // Verifica autenticação do profissional
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')
    
    let profissionalId: number | null = null
    
    if (token) {
      try {
        const decoded = Buffer.from(token, 'base64').toString('utf-8')
        const tokenData = JSON.parse(decoded)
        if (tokenData.id) {
          profissionalId = tokenData.id
        }
      } catch (error) {
        console.error('[API] Erro ao decodificar token:', error)
      }
    }

    if (!profissionalId) {
      return NextResponse.json(
        {
          success: false,
          message: 'Autenticação necessária',
        },
        { status: 401 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const pageParam = searchParams.get('page') || '1'
    const limitParam = searchParams.get('limit') || '20'
    
    const page = parseInt(pageParam, 10)
    const limit = parseInt(limitParam, 10)
    
    // Validação
    const pageNumber = Math.max(1, isNaN(page) ? 1 : page)
    let limitNumber = 20
    if (!isNaN(limit) && [20, 50, 100].includes(limit)) {
      limitNumber = limit
    }
    const offset = (pageNumber - 1) * limitNumber

    console.log('[API] Listando clientes para profissional_id:', profissionalId)

    // Busca registros válidos filtrados por profissional
    const { data: todosRegistrosQuery, error: queryError } = await supabase
      .from('ficha_anamnese')
      .select('id, nome, cpf, dados_cliente, id_profissional')
      .eq('id_profissional', profissionalId)

    if (queryError) {
      console.error('[API] Erro na busca do Supabase:', queryError)
      throw queryError
    }

    console.log('[API] Registros brutos encontrados:', {
      total: todosRegistrosQuery?.length || 0,
      registros: todosRegistrosQuery?.map(r => ({
        id: r.id,
        nome: r.nome,
        cpf: r.cpf,
        id_profissional: r.id_profissional
      })) || []
    })

    // Filtra apenas registros válidos (com nome e cpf não nulos/vazios)
    // Validação mais rigorosa: nome e cpf devem existir, não serem vazios após trim, e cpf deve ter pelo menos 11 dígitos
    const registrosFiltrados = (todosRegistrosQuery || []).filter((r) => {
      const nomeValido = r.nome && typeof r.nome === 'string' && r.nome.trim().length > 0
      const cpfValido = r.cpf && typeof r.cpf === 'string' && r.cpf.trim().length >= 11
      return nomeValido && cpfValido
    })
    
    const total = registrosFiltrados.length

    // Log detalhado para debug
    const registrosInvalidos = (todosRegistrosQuery || []).filter((r) => {
      const nomeValido = r.nome && typeof r.nome === 'string' && r.nome.trim().length > 0
      const cpfValido = r.cpf && typeof r.cpf === 'string' && r.cpf.trim().length >= 11
      return !nomeValido || !cpfValido
    })

    console.log('[API] Contagem de registros:', {
      totalBruto: todosRegistrosQuery?.length || 0,
      totalFiltrado: total,
      registrosInvalidos: registrosInvalidos.length,
      detalhesInvalidos: registrosInvalidos.map(r => ({
        id: r.id,
        nome: r.nome,
        cpf: r.cpf,
        nomeValido: r.nome && typeof r.nome === 'string' && r.nome.trim().length > 0,
        cpfValido: r.cpf && typeof r.cpf === 'string' && r.cpf.trim().length >= 11
      }))
    })

    // Se não há registros válidos, retorna vazio
    if (total === 0) {
      return NextResponse.json(
        {
          success: true,
          message: 'Nenhum cliente cadastrado',
          data: [],
          pagination: {
            page: pageNumber,
            limit: limitNumber,
            total: 0,
            totalPages: 0,
          },
        },
        { status: 200 }
      )
    }

    console.log('[API] Parâmetros de paginação:', {
      pageNumber,
      limitNumber,
      offset,
      total,
      expectedRecords: limitNumber
    })

    // Ordena por nome
    registrosFiltrados.sort((a, b) => {
      const nomeA = (a.nome || '').toLowerCase()
      const nomeB = (b.nome || '').toLowerCase()
      return nomeA.localeCompare(nomeB)
    })

    // Aplica paginação manualmente
    const registros = registrosFiltrados.slice(offset, offset + limitNumber)

    console.log('[API] Resultado da query:', {
      registrosLength: registros?.length || 0,
      offset,
      expected: limitNumber,
      firstRecord: registros?.[0]?.nome || 'N/A'
    })

    if (!registros || registros.length === 0) {
      return NextResponse.json(
        {
          success: true,
          message: 'Nenhum cliente cadastrado',
          data: [],
          pagination: {
            page: pageNumber,
            limit: limitNumber,
            total: 0,
            totalPages: 0,
          },
        },
        { status: 200 }
      )
    }

    // Mapeia os resultados extraindo dados do JSON
    const clientes = registros.map((registro) => {
      const dadosCliente = registro.dados_cliente || {}
      return {
        id: registro.id,
        nome: registro.nome,
        cpf: registro.cpf,
        email: dadosCliente.email || null,
        celular: dadosCliente.celular || null,
        data_nascimento: dadosCliente.dataNascimento || null,
      }
    })

    return NextResponse.json(
      {
        success: true,
        message: 'Clientes listados com sucesso!',
        data: clientes,
        pagination: {
          page: pageNumber,
          limit: limitNumber,
          total,
          totalPages: Math.ceil(total / limitNumber),
        },
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Erro ao listar clientes:', error)
    
    return NextResponse.json(
      {
        success: false,
        message: `Erro ao listar clientes: ${error?.message || 'Erro desconhecido'}`,
        data: [],
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0,
        },
      },
      { status: 500 }
    )
  }
}
