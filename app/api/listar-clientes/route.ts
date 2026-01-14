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

    // Busca total de registros
    const { count, error: countError } = await supabase
      .from('ficha_anamnese')
      .select('*', { count: 'exact', head: true })

    if (countError) {
      console.error('Erro ao contar registros:', countError)
      throw countError
    }

    const total = count || 0

    // Calcula o range correto (range é inclusivo em ambos os lados)
    // Para 50 registros: offset=0, from=0, to=49 (retorna 50 registros)
    const from = offset
    // Garante que o 'to' não seja maior que o total de registros disponíveis
    // O range do Supabase é inclusivo, então se temos 2 registros (índices 0 e 1),
    // devemos usar range(0, 1) para obter ambos
    // IMPORTANTE: Se não há registros, não fazemos a query
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
    
    const maxTo = Math.max(0, total - 1) // máximo índice disponível
    const to = Math.min(offset + limitNumber - 1, maxTo)
    
    // Garante que 'from' não seja maior que 'to' (caso o offset seja maior que o total)
    if (from > maxTo) {
      return NextResponse.json(
        {
          success: true,
          message: 'Página não encontrada',
          data: [],
          pagination: {
            page: pageNumber,
            limit: limitNumber,
            total,
            totalPages: Math.ceil(total / limitNumber),
          },
        },
        { status: 200 }
      )
    }

    console.log('[API] Parâmetros de paginação:', {
      pageNumber,
      limitNumber,
      offset,
      from,
      to,
      maxTo,
      total,
      expectedRecords: limitNumber
    })

    // Busca registros paginados usando range
    // O range do Supabase é inclusivo: range(0, 49) retorna 50 registros (índices 0 a 49)
    // IMPORTANTE: A ordem das chamadas importa - order deve vir antes do range
    let queryBuilder = supabase
      .from('ficha_anamnese')
      .select('id, nome, cpf, dados_cliente')
      .order('nome', { ascending: true })
    
    // Se o total é menor ou igual ao limite, busca todos sem range para evitar problemas
    // Caso contrário, usa range para paginação
    let registros, error
    if (total <= limitNumber && offset === 0) {
      // Busca todos os registros sem range quando o total é menor que o limite
      const result = await queryBuilder
      registros = result.data
      error = result.error
    } else {
      // Usa range para paginação normal
      const result = await queryBuilder.range(from, to)
      registros = result.data
      error = result.error
    }

    console.log('[API] Resultado da query:', {
      registrosLength: registros?.length || 0,
      error: error?.message || null,
      from,
      to,
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
            total,
            totalPages: Math.ceil(total / limitNumber),
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
