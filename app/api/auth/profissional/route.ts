import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// Senha simples para profissionais (em produção, use autenticação adequada)
// Você pode mudar essa senha ou usar variável de ambiente
const SENHA_PROFISSIONAL = process.env.SENHA_PROFISSIONAL || 'profissional123'

/**
 * API para autenticação de profissionais
 */
export async function POST(request: NextRequest) {
  try {
    const { senha } = await request.json()

    if (!senha) {
      return NextResponse.json(
        {
          success: false,
          message: 'Senha é obrigatória',
        },
        { status: 400 }
      )
    }

    if (senha === SENHA_PROFISSIONAL) {
      // Gera um token simples (em produção, use JWT ou similar)
      const token = Buffer.from(`profissional_${Date.now()}`).toString('base64')
      
      return NextResponse.json(
        {
          success: true,
          message: 'Autenticação realizada com sucesso!',
          token,
        },
        { status: 200 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        message: 'Senha incorreta',
      },
      { status: 401 }
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

    // Verifica se o token é válido (em produção, valide o JWT)
    try {
      const decoded = Buffer.from(token, 'base64').toString('utf-8')
      if (decoded.startsWith('profissional_')) {
        return NextResponse.json(
          {
            success: true,
            authenticated: true,
          },
          { status: 200 }
        )
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
