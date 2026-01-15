'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import './login.css'

export default function LoginProfissional() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Verifica se já está autenticado
    const token = localStorage.getItem('profissional_token')
    if (token) {
      router.push('/buscar-cliente')
    }
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErro('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/profissional', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, senha }),
      })

      const result = await response.json()

      if (result.success && result.token) {
        // Salva o token e dados do profissional no localStorage
        localStorage.setItem('profissional_token', result.token)
        if (result.profissional) {
          localStorage.setItem('profissional_data', JSON.stringify(result.profissional))
        }
        // Redireciona para a página de busca
        router.push('/buscar-cliente')
      } else {
        setErro(result.message || 'Email ou senha incorretos')
      }
    } catch (error) {
      console.error('Erro ao fazer login:', error)
      setErro('Erro ao processar login. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>Acesso Profissional</h1>
        <p className="login-subtitle">Digite seu email e senha para acessar</p>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Digite seu email"
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="senha">Senha</label>
            <input
              type="password"
              id="senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="Digite sua senha"
              required
            />
          </div>

          {erro && (
            <div className="error-message">
              {erro}
            </div>
          )}

          <button type="submit" className="btn-login" disabled={isLoading}>
            {isLoading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <button 
            type="button"
            className="btn-criar-conta"
            onClick={() => router.push('/criar-conta-profissional')}
          >
            Não tem uma conta? Crie uma agora
          </button>
        </div>
      </div>
    </div>
  )
}
