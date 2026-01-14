import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

/**
 * API para listar clientes cadastrados com paginação
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    
    // Validação
    const pageNumber = Math.max(1, page)
    const limitNumber = [20, 50, 100].includes(limit) ? limit : 20
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

    // Busca registros paginados
    const { data: registros, error } = await supabase
      .from('ficha_anamnese')
      .select('id, nome, cpf, dados_cliente')
      .order('nome', { ascending: true })
      .range(offset, offset + limitNumber - 1)

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
