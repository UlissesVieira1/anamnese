import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

/**
 * API para redefinir a senha de um profissional
 */
export async function POST(request: NextRequest) {
  try {
    const { email, novaSenha } = await request.json()

    // Validações
    if (!email || !novaSenha) {
      return NextResponse.json(
        {
          success: false,
          message: 'Email e nova senha são obrigatórios',
        },
        { status: 400 }
      )
    }

    if (novaSenha.length < 6) {
      return NextResponse.json(
        {
          success: false,
          message: 'A senha deve ter no mínimo 6 caracteres',
        },
        { status: 400 }
      )
    }

    // Verifica se o profissional existe
    const { data: profissional, error: errorBusca } = await supabase
      .from('profissional_anamnese')
      .select('id, email')
      .eq('email', email)
      .maybeSingle()

    if (errorBusca) {
      console.error('Erro ao buscar profissional:', errorBusca)
      return NextResponse.json(
        {
          success: false,
          message: 'Erro ao verificar profissional. Tente novamente.',
        },
        { status: 500 }
      )
    }

    if (!profissional) {
      return NextResponse.json(
        {
          success: false,
          message: 'Profissional não encontrado',
        },
        { status: 404 }
      )
    }

    // Atualiza a senha
    const { error: errorUpdate } = await supabase
      .from('profissional_anamnese')
      .update({ senha: novaSenha })
      .eq('id', profissional.id)

    if (errorUpdate) {
      console.error('Erro ao atualizar senha:', errorUpdate)
      return NextResponse.json(
        {
          success: false,
          message: 'Erro ao redefinir senha. Tente novamente.',
          error: process.env.NODE_ENV === 'development' ? errorUpdate.message : undefined,
        },
        { status: 500 }
      )
    }

    console.log('[DEBUG] Senha redefinida com sucesso para:', email)

    return NextResponse.json(
      {
        success: true,
        message: 'Senha redefinida com sucesso!',
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Erro ao redefinir senha:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Erro ao processar redefinição de senha.',
      },
      { status: 500 }
    )
  }
}
