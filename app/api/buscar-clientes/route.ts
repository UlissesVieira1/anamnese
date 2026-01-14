import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

/**
 * Normaliza o CPF removendo pontos e traços
 */
function normalizarCpf(cpf: string): string {
  if (!cpf) return ''
  return String(cpf).replace(/\D/g, '')
}

/**
 * API para buscar clientes com autocomplete
 * Busca por nome ou CPF
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q') || ''
    const limit = parseInt(searchParams.get('limit') || '10')

    if (!query || query.trim().length < 2) {
      return NextResponse.json(
        {
          success: true,
          data: [],
          message: 'Digite pelo menos 2 caracteres para buscar',
        },
        { status: 200 }
      )
    }

    const queryNormalizada = query.trim().toLowerCase()
    const cpfNormalizado = normalizarCpf(query)
    const isOnlyNumbers = /^\d+$/.test(queryNormalizada)

    let clientes: any[] = []

    try {
      // Busca por nome (campo direto na tabela)
      let queryBuilder = supabase
        .from('ficha_anamnese')
        .select('id, nome, cpf, dados_cliente')

      // Se a query é só números (provavelmente CPF), busca por CPF
      if (isOnlyNumbers && cpfNormalizado.length >= 3) {
        queryBuilder = queryBuilder.ilike('cpf', `%${cpfNormalizado}%`)
      } else {
        // Busca por nome
        queryBuilder = queryBuilder.ilike('nome', `%${queryNormalizada}%`)
      }

      const { data: registros, error } = await queryBuilder.limit(limit * 2).order('nome', { ascending: true })

      if (error) {
        console.error('Erro na busca do Supabase:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
        })
        
        // Se for erro de permissão (RLS), retorna mensagem específica
        if (error.code === 'PGRST301' || error.message?.includes('permission') || error.message?.includes('RLS')) {
          return NextResponse.json(
            {
              success: false,
              message: 'Erro de permissão. Verifique as políticas RLS no Supabase.',
              errorCode: error.code,
              data: [],
            },
            { status: 403 }
          )
        }
        
        throw error
      }

      if (!registros || registros.length === 0) {
        return NextResponse.json(
          {
            success: true,
            message: 'Nenhum cliente encontrado',
            data: [],
          },
          { status: 200 }
        )
      }

      // Mapeia os resultados extraindo dados do JSON
      const resultadosMapeados = registros
        .map((registro) => {
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
        .filter((cliente) => {
          // Filtro adicional: se a query não é só números, também verifica CPF
          if (!isOnlyNumbers && cpfNormalizado.length >= 3) {
            const cpfCliente = cliente.cpf || ''
            return cliente.nome.toLowerCase().includes(queryNormalizada) || 
                   cpfCliente.includes(cpfNormalizado)
          }
          return true
        })
        .slice(0, limit)
        .sort((a, b) => a.nome.localeCompare(b.nome))

      clientes = resultadosMapeados
    } catch (error) {
      console.error('Erro ao processar busca:', error)
      throw error
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Clientes encontrados com sucesso!',
        data: clientes,
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Erro ao buscar clientes:', error)
    
    // Retorna mensagem de erro mais detalhada para debug
    const errorMessage = error?.message || 'Erro desconhecido'
    const errorCode = error?.code || 'UNKNOWN'
    
    return NextResponse.json(
      {
        success: false,
        message: `Erro ao buscar clientes: ${errorMessage}`,
        errorCode,
        data: [],
      },
      { status: 500 }
    )
  }
}
