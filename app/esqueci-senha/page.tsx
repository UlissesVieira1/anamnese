'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import './esqueci-senha.css'

export default function EsqueciSenha() {
  const [email, setEmail] = useState('')
  const [novaSenha, setNovaSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState<'email' | 'senha'>('email')
  const router = useRouter()

  const handleVerificarEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    setErro('')
    setSucesso('')

    if (!email) {
      setErro('Email é obrigatório')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/verificar-email-profissional', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const result = await response.json()

      if (result.success) {
        setStep('senha')
        setSucesso('Email verificado! Agora defina sua nova senha.')
      } else {
        setErro(result.message || 'Email não encontrado')
      }
    } catch (error) {
      console.error('Erro ao verificar email:', error)
      setErro('Erro ao processar. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRedefinirSenha = async (e: React.FormEvent) => {
    e.preventDefault()
    setErro('')
    setSucesso('')

    if (!novaSenha || !confirmarSenha) {
      setErro('Todos os campos são obrigatórios')
      return
    }

    if (novaSenha !== confirmarSenha) {
      setErro('As senhas não coincidem')
      return
    }

    if (novaSenha.length < 6) {
      setErro('A senha deve ter no mínimo 6 caracteres')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/redefinir-senha', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          novaSenha,
        }),
      })

      const result = await response.json()

      if (result.success) {
        setSucesso('Senha redefinida com sucesso! Redirecionando para login...')
        setTimeout(() => {
          router.push('/login-profissional')
        }, 2000)
      } else {
        setErro(result.message || 'Erro ao redefinir senha. Tente novamente.')
      }
    } catch (error) {
      console.error('Erro ao redefinir senha:', error)
      setErro('Erro ao processar. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="esqueci-senha-container">
      <div className="esqueci-senha-box">
        <h1>Redefinir Senha</h1>
        <p className="esqueci-senha-subtitle">
          {step === 'email' 
            ? 'Digite seu email para verificar sua conta'
            : 'Digite sua nova senha'
          }
        </p>
        
        {step === 'email' ? (
          <form onSubmit={handleVerificarEmail}>
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

            {erro && (
              <div className="error-message">
                {erro}
              </div>
            )}

            {sucesso && (
              <div className="success-message">
                {sucesso}
              </div>
            )}

            <button type="submit" className="btn-continuar" disabled={isLoading}>
              {isLoading ? 'Verificando...' : 'Continuar'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRedefinirSenha}>
            <div className="form-group">
              <label htmlFor="novaSenha">Nova Senha</label>
              <input
                type="password"
                id="novaSenha"
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                required
                minLength={6}
                autoFocus
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmarSenha">Confirmar Nova Senha</label>
              <input
                type="password"
                id="confirmarSenha"
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                placeholder="Digite a senha novamente"
                required
                minLength={6}
              />
            </div>

            {erro && (
              <div className="error-message">
                {erro}
              </div>
            )}

            {sucesso && (
              <div className="success-message">
                {sucesso}
              </div>
            )}

            <button type="submit" className="btn-redefinir" disabled={isLoading}>
              {isLoading ? 'Redefinindo...' : 'Redefinir Senha'}
            </button>
          </form>
        )}

        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <button 
            type="button"
            className="btn-voltar-login"
            onClick={() => router.push('/login-profissional')}
          >
            Voltar para login
          </button>
        </div>
      </div>
    </div>
  )
}
