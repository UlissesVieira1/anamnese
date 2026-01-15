import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

/**
 * API para autenticação de profissionais
 */
export async function POST(request: NextRequest) {
  try {
    const { email, senha } = await request.json()

    if (!email || !senha) {
      return NextResponse.json(
        {
          success: false,
          message: 'Email e senha são obrigatórios',
        },
        { status: 400 }
      )
    }

    // Busca o profissional no banco de dados
    const { data: profissional, error } = await supabase
      .from('profissional_anamnese')
      .select('id, nome, email')
      .eq('email', email)
      .eq('senha', senha)
      .maybeSingle()

    if (error) {
      console.error('Erro ao buscar profissional:', error)
      return NextResponse.json(
        {
          success: false,
          message: 'Erro ao processar autenticação.',
        },
        { status: 500 }
      )
    }

    if (!profissional) {
      return NextResponse.json(
        {
          success: false,
          message: 'Email ou senha incorretos',
        },
        { status: 401 }
      )
    }

    // Gera um token simples com o ID do profissional (em produção, use JWT ou similar)
    const tokenData = {
      id: profissional.id,
      nome: profissional.nome,
      email: profissional.email,
      timestamp: Date.now()
    }
    const token = Buffer.from(JSON.stringify(tokenData)).toString('base64')
    
    return NextResponse.json(
      {
        success: true,
        message: 'Autenticação realizada com sucesso!',
        token,
        profissional: {
          id: profissional.id,
          nome: profissional.nome,
          email: profissional.email,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Erro na autenticação:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Erro ao processar autenticação.',
      },
      { status: 500 }
    )
  }
}

/**
 * API para verificar se o profissional está autenticado
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '') || request.cookies.get('profissional_token')?.value

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          authenticated: false,
        },
        { status: 401 }
      )
    }

    // Verifica se o token é válido
    try {
      const decoded = Buffer.from(token, 'base64').toString('utf-8')
      const tokenData = JSON.parse(decoded)
      
      if (tokenData.id && tokenData.email) {
        // Verifica se o profissional ainda existe no banco
        const { data: profissional } = await supabase
          .from('profissional_anamnese')
          .select('id, nome, email')
          .eq('id', tokenData.id)
          .eq('email', tokenData.email)
          .maybeSingle()

        if (profissional) {
          return NextResponse.json(
            {
              success: true,
              authenticated: true,
              profissional: {
                id: profissional.id,
                nome: profissional.nome,
                email: profissional.email,
              },
            },
            { status: 200 }
          )
        }
      }
    } catch {
      // Token inválido
    }

    return NextResponse.json(
      {
        success: false,
        authenticated: false,
      },
      { status: 401 }
    )
  } catch (error) {
    console.error('Erro ao verificar autenticação:', error)
    return NextResponse.json(
      {
        success: false,
        authenticated: false,
      },
      { status: 500 }
    )
  }
}
