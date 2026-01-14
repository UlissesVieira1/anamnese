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
  const [todosClientes, setTodosClientes] = useState<Cliente[]>([])
  const [clientesFiltrados, setClientesFiltrados] = useState<Cliente[]>([])
  const [clienteSelecionado, setClienteSelecionado] = useState<Cliente | null>(null)
  const [isLoadingInicial, setIsLoadingInicial] = useState(true)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(20)
  const [totalClientes, setTotalClientes] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  // Carrega lista de clientes com paginação
  useEffect(() => {
    const carregarClientes = async () => {
      setIsLoadingInicial(true)
      try {
        const response = await fetch(`/api/listar-clientes?page=${currentPage}&limit=${itemsPerPage}`)
        const result = await response.json()

        if (result.success) {
          setTodosClientes(result.data || [])
          setClientesFiltrados(result.data || [])
          setTotalClientes(result.pagination?.total || 0)
          setTotalPages(result.pagination?.totalPages || 0)
        }
      } catch (error) {
        console.error('Erro ao carregar clientes:', error)
      } finally {
        setIsLoadingInicial(false)
      }
    }

    carregarClientes()
  }, [currentPage, itemsPerPage])

  // Filtra clientes quando a query muda (apenas para autocomplete)
  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setShowSuggestions(false)
      return
    }

    const queryNormalizada = query.trim().toLowerCase()
    const cpfNormalizado = query.replace(/\D/g, '')
    
    const filtrados = todosClientes.filter((cliente) => {
      const nomeMatch = cliente.nome.toLowerCase().includes(queryNormalizada)
      const cpfMatch = cliente.cpf.replace(/\D/g, '').includes(cpfNormalizado)
      return nomeMatch || cpfMatch
    })

    setClientesFiltrados(filtrados)
    setShowSuggestions(true)
  }, [query, todosClientes])

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    setClienteSelecionado(null)
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

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLimit = parseInt(e.target.value)
    setItemsPerPage(newLimit)
    setCurrentPage(1) // Reset para primeira página ao mudar limite
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
              placeholder="Digite o nome ou CPF..."
              className="search-input"
            />
          </div>

          {showSuggestions && clientesFiltrados.length > 0 && (
            <div ref={suggestionsRef} className="suggestions-list">
              {clientesFiltrados.slice(0, 10).map((cliente) => (
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

          {showSuggestions && query.length >= 2 && clientesFiltrados.length === 0 && (
            <div className="suggestions-list">
              <div className="suggestion-item no-results">
                Nenhum cliente encontrado
              </div>
            </div>
          )}
        </div>
      </div>

      {!clienteSelecionado && !isLoadingInicial && (
        <div className="clientes-lista">
          <div className="clientes-lista-header">
            <h2>Clientes Cadastrados ({totalClientes})</h2>
            <div className="pagination-controls-top">
              <label htmlFor="items-per-page">Registros por página:</label>
              <select
                id="items-per-page"
                value={itemsPerPage}
                onChange={handleItemsPerPageChange}
                className="items-per-page-select"
              >
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>
          {todosClientes.length === 0 ? (
            <div className="empty-state">
              <p>Nenhum cliente cadastrado ainda.</p>
            </div>
          ) : (
            <>
              <div className="clientes-grid">
                {todosClientes.map((cliente) => (
                  <div
                    key={cliente.id}
                    className="cliente-card"
                    onClick={() => handleClienteSelect(cliente)}
                  >
                    <div className="cliente-card-name">{cliente.nome}</div>
                    <div className="cliente-card-cpf">CPF: {formatarCPF(cliente.cpf)}</div>
                  </div>
                ))}
              </div>
              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    className="pagination-btn"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Anterior
                  </button>
                  <div className="pagination-info">
                    <span>Página {currentPage} de {totalPages}</span>
                  </div>
                  <button
                    className="pagination-btn"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Próxima
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {clienteSelecionado && (
        <div className="cliente-details">
          <div className="cliente-details-header">
            <h2>Dados do Cliente</h2>
            <button 
              className="btn-voltar"
              onClick={() => {
                setClienteSelecionado(null)
                setQuery('')
              }}
            >
              Voltar
            </button>
          </div>
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

      {isLoadingInicial && (
        <div className="loading-inicial">
          <div className="spinner"></div>
          <p>Carregando clientes...</p>
        </div>
      )}
    </div>
  )
}
