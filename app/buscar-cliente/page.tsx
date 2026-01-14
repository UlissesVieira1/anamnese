'use client'

import { useState, useEffect, useRef } from 'react'
import './buscar-cliente.css'

interface Cliente {
  id: number
  nome: string
  cpf: string
  email: string | null
  celular: string | null
  data_nascimento: string | null
}

export default function BuscarCliente() {
  const [query, setQuery] = useState('')
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [clienteSelecionado, setClienteSelecionado] = useState<Cliente | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  // Fecha sugestões ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const buscarClientes = async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setClientes([])
      setShowSuggestions(false)
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/api/buscar-clientes?q=${encodeURIComponent(searchQuery)}&limit=10`)
      const result = await response.json()

      if (result.success) {
        setClientes(result.data || [])
        setShowSuggestions(true)
      }
    } catch (error) {
      console.error('Erro ao buscar clientes:', error)
      setClientes([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    setClienteSelecionado(null)
    buscarClientes(value)
  }

  const handleClienteSelect = (cliente: Cliente) => {
    setClienteSelecionado(cliente)
    setQuery(cliente.nome)
    setShowSuggestions(false)
  }

  const formatarCPF = (cpf: string) => {
    const cpfLimpo = cpf.replace(/\D/g, '')
    return cpfLimpo.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  }

  const formatarData = (data: string | null) => {
    if (!data) return 'N/A'
    try {
      const date = new Date(data)
      return date.toLocaleDateString('pt-BR')
    } catch {
      return data
    }
  }

  return (
    <div className="buscar-cliente-container">
      <div className="buscar-cliente-header">
        <h1>Buscar Cliente</h1>
      </div>

      <div className="search-section">
        <div className="autocomplete-wrapper">
          <label htmlFor="buscar-cliente">Buscar por nome ou CPF</label>
          <div className="input-wrapper">
            <input
              ref={inputRef}
              type="text"
              id="buscar-cliente"
              value={query}
              onChange={handleInputChange}
              onFocus={() => query.length >= 2 && setShowSuggestions(true)}
              placeholder="Digite o nome ou CPF do cliente..."
              className="search-input"
            />
            {isLoading && (
              <div className="loading-spinner">
                <div className="spinner"></div>
              </div>
            )}
          </div>

          {showSuggestions && clientes.length > 0 && (
            <div ref={suggestionsRef} className="suggestions-list">
              {clientes.map((cliente) => (
                <div
                  key={cliente.id}
                  className="suggestion-item"
                  onClick={() => handleClienteSelect(cliente)}
                >
                  <div className="suggestion-name">{cliente.nome}</div>
                  <div className="suggestion-details">
                    CPF: {formatarCPF(cliente.cpf)}
                  </div>
                </div>
              ))}
            </div>
          )}

          {showSuggestions && query.length >= 2 && !isLoading && clientes.length === 0 && (
            <div className="suggestions-list">
              <div className="suggestion-item no-results">
                Nenhum cliente encontrado
              </div>
            </div>
          )}
        </div>
      </div>

      {clienteSelecionado && (
        <div className="cliente-details">
          <h2>Dados do Cliente</h2>
          <div className="details-grid">
            <div className="detail-item">
              <label>Nome:</label>
              <span>{clienteSelecionado.nome}</span>
            </div>
            <div className="detail-item">
              <label>CPF:</label>
              <span>{formatarCPF(clienteSelecionado.cpf)}</span>
            </div>
            {clienteSelecionado.email && (
              <div className="detail-item">
                <label>E-mail:</label>
                <span>{clienteSelecionado.email}</span>
              </div>
            )}
            {clienteSelecionado.celular && (
              <div className="detail-item">
                <label>Celular:</label>
                <span>{clienteSelecionado.celular}</span>
              </div>
            )}
            {clienteSelecionado.data_nascimento && (
              <div className="detail-item">
                <label>Data de Nascimento:</label>
                <span>{formatarData(clienteSelecionado.data_nascimento)}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
