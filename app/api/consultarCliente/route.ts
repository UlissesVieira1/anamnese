import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

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

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const cpf = searchParams.get('cpf')

    if (!cpf) {
      return NextResponse.json(
        {
          success: false,
          message: 'CPF é obrigatório',
        },
        { status: 400 }
      )
    }

    // Normaliza o CPF antes de buscar
    const cpfNormalizado = normalizarCpf(cpf)
    console.log(`[DEBUG] CPF normalizado para busca: "${cpf}" -> "${cpfNormalizado}"`)

    const { data: cliente, error } = await supabase
      .from('ficha_anamnese')
      .select('*')
      .eq('cpf', cpfNormalizado)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // Nenhum resultado encontrado
        return NextResponse.json(
          {
            success: true,
            message: 'Cliente não encontrado',
            data: null,
          },
          { status: 200 }
        )
      }

      console.error('Erro ao buscar cliente:', error)
      return NextResponse.json(
        {
          success: false,
          message: 'Erro ao buscar cliente.',
        },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Cliente encontrado com sucesso!',
        data: cliente,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Erro ao buscar cliente:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Erro ao buscar cliente.',
      },
      { status: 500 }
    )
  }
}
