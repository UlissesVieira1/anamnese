'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import './criar-conta.css'

export default function CriarContaProfissional() {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [telefone, setTelefone] = useState('')
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErro('')
    setSucesso('')

    // Validações
    if (!nome || !email || !senha || !confirmarSenha) {
      setErro('Todos os campos são obrigatórios')
      return
    }

    if (senha !== confirmarSenha) {
      setErro('As senhas não coincidem')
      return
    }

    if (senha.length < 6) {
      setErro('A senha deve ter no mínimo 6 caracteres')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/criar-profissional', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nome,
          email,
          senha,
          telefone: telefone || null,
        }),
      })

      const result = await response.json()

      if (result.success) {
        setSucesso('Conta criada com sucesso! Redirecionando para login...')
        setTimeout(() => {
          router.push('/login-profissional')
        }, 2000)
      } else {
        setErro(result.message || 'Erro ao criar conta. Tente novamente.')
      }
    } catch (error) {
      console.error('Erro ao criar conta:', error)
      setErro('Erro ao processar cadastro. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="criar-conta-container">
      <div className="criar-conta-box">
        <h1>Criar Conta Profissional</h1>
        <p className="criar-conta-subtitle">Preencha os dados para criar sua conta</p>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="nome">Nome Completo <span className="required">*</span></label>
            <input
              type="text"
              id="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Digite seu nome completo"
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email <span className="required">*</span></label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Digite seu email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="telefone">Telefone</label>
            <input
              type="tel"
              id="telefone"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              placeholder="(00) 00000-0000"
            />
          </div>

          <div className="form-group">
            <label htmlFor="senha">Senha <span className="required">*</span></label>
            <input
              type="password"
              id="senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              required
              minLength={6}
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmarSenha">Confirmar Senha <span className="required">*</span></label>
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

          <button type="submit" className="btn-criar" disabled={isLoading}>
            {isLoading ? 'Criando conta...' : 'Criar Conta'}
          </button>
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <button 
            type="button"
            className="btn-voltar-login"
            onClick={() => router.push('/login-profissional')}
          >
            Já tem uma conta? Faça login
          </button>
        </div>
      </div>
    </div>
  )
}
