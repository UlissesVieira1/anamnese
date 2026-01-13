import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

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

    const { data: cliente, error } = await supabase
      .from('ficha_anamnese')
      .select('*')
      .eq('cpf', cpf)
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
