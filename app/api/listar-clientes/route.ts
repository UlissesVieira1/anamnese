import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

/**
 * API para listar clientes cadastrados com paginação
 */
export async function GET(request: NextRequest) {
  try {
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

    // Busca todos os registros válidos (com nome e cpf)
    // Filtra apenas registros que têm os campos necessários
    const { data: todosRegistrosQuery, error: queryError } = await supabase
      .from('ficha_anamnese')
      .select('id, nome, cpf, dados_cliente')

    if (queryError) {
      console.error('Erro na busca do Supabase:', queryError)
      throw queryError
    }

    // Filtra apenas registros válidos (com nome e cpf não nulos/vazios)
    const registrosFiltrados = (todosRegistrosQuery || []).filter(
      (r) => r.nome && r.nome.trim() && r.cpf && r.cpf.trim()
    )
    
    const total = registrosFiltrados.length

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
    const error = null

    console.log('[API] Resultado da query:', {
      registrosLength: registros?.length || 0,
      error: error?.message || null,
      offset,
      expected: limitNumber,
      firstRecord: registros?.[0]?.nome || 'N/A'
    })

    if (error) {
      console.error('Erro na busca do Supabase:', error)
      throw error
    }

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
