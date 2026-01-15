import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

/**
 * API para verificar se um email existe na tabela profissional_anamnese
 */
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        {
          success: false,
          message: 'Email é obrigatório',
        },
        { status: 400 }
      )
    }

    // Busca o profissional pelo email
    const { data: profissional, error } = await supabase
      .from('profissional_anamnese')
      .select('id, email')
      .eq('email', email)
      .maybeSingle()

    if (error) {
      console.error('Erro ao verificar email:', error)
      return NextResponse.json(
        {
          success: false,
          message: 'Erro ao verificar email. Tente novamente.',
        },
        { status: 500 }
      )
    }

    if (!profissional) {
      return NextResponse.json(
        {
          success: false,
          message: 'Email não encontrado',
        },
        { status: 404 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Email verificado com sucesso',
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Erro ao verificar email:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Erro ao processar verificação.',
      },
      { status: 500 }
    )
  }
}
