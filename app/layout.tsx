import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ANAMNESE Tattoo',
  description: 'Sistema de cadastro de fichas de anamnese para tatuagem',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
