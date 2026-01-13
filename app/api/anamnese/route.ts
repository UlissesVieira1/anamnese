// Exemplo de API Route para salvar a anamnese
// Este arquivo será usado quando você criar o backend

import { NextRequest, NextResponse } from 'next/server'
import { AnamneseTipagem } from '@/types/anamnese'

// Esta é uma rota POST para salvar a anamnese
export async function POST(request: NextRequest) {
  try {
    // Recebe os dados do formulário
    const data: AnamneseTipagem = await request.json()

    // Aqui você faria a conexão com o banco de dados
    // Exemplo com Prisma (quando instalar):
    // const anamnese = await prisma.anamnese.create({ data })

    // Por enquanto, apenas retorna sucesso
    // Quando conectar com o banco, salve os dados aqui
    
    console.log('Dados recebidos:', data)

    return NextResponse.json(
      { 
        success: true, 
        message: 'Ficha de anamnese salva com sucesso!',
        data: data 
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Erro ao salvar anamnese:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Erro ao salvar a ficha de anamnese' 
      },
      { status: 500 }
    )
  }
}

// Esta é uma rota GET para buscar anamneses (opcional)
export async function GET() {
  try {
    // Aqui você buscaria as anamneses do banco
    // Exemplo: const anamneses = await prisma.anamnese.findMany()
    
    return NextResponse.json(
      { 
        success: true, 
        data: [] // Retornaria as anamneses aqui
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Erro ao buscar anamneses:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Erro ao buscar fichas de anamnese' 
      },
      { status: 500 }
    )
  }
}
