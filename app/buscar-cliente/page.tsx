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

interface ClienteCompleto {
  id: number
  nome: string
  cpf: string
  dados_cliente?: any
  avaliacao?: any
  info_tattoo?: any
  termos?: string
  data_preenchimento_ficha?: string
}

export default function BuscarCliente() {
  const [query, setQuery] = useState('')
  const [todosClientes, setTodosClientes] = useState<Cliente[]>([])
  const [clientesFiltrados, setClientesFiltrados] = useState<Cliente[]>([])
  const [clienteSelecionado, setClienteSelecionado] = useState<Cliente | null>(null)
  const [clienteCompleto, setClienteCompleto] = useState<ClienteCompleto | null>(null)
  const [isLoadingCompleto, setIsLoadingCompleto] = useState(false)
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
        const url = `/api/listar-clientes?page=${currentPage}&limit=${itemsPerPage}`
        console.log('[Frontend] Carregando:', { url, currentPage, itemsPerPage })
        const response = await fetch(url)
        const result = await response.json()

        console.log('[Frontend] Resposta recebida:', {
          success: result.success,
          dataLength: result.data?.length || 0,
          pagination: result.pagination,
          firstItem: result.data?.[0]?.nome || 'N/A'
        })

        if (result.success) {
          setTodosClientes(result.data || [])
          setClientesFiltrados(result.data || [])
          setTotalClientes(result.pagination?.total || 0)
          setTotalPages(result.pagination?.totalPages || 0)
        } else {
          console.error('Erro na resposta da API:', result.message)
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

  const handleClienteSelect = async (cliente: Cliente) => {
    setClienteSelecionado(cliente)
    setShowSuggestions(false)
    setIsLoadingCompleto(true)
    setClienteCompleto(null)
    
    try {
      const response = await fetch(`/api/consultarCliente?id=${cliente.id}`)
      const result = await response.json()
      
      if (result.success && result.data) {
        setClienteCompleto(result.data)
      }
    } catch (error) {
      console.error('Erro ao buscar dados completos:', error)
    } finally {
      setIsLoadingCompleto(false)
    }
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

  const traduzirDeclaracao = (key: string): string => {
    const traducoes: { [key: string]: string } = {
      seguirCuidados: 'Seguir Cuidados',
      condicoesHigienicas: 'Condições Higiênicas',
      permanenciaTatuagem: 'Permanência da Tatuagem',
      veracidadeInformacoes: 'Veracidade das Informações'
    }
    return traducoes[key] || key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
  }

  const traduzirAvaliacaoMedica = (key: string): string => {
    const traducoes: { [key: string]: string } = {
      tratamentoMedico: 'Tratamento Médico',
      diabetes: 'Diabetes',
      cirurgiaRecente: 'Cirurgia Recente',
      alergia: 'Alergia',
      problemaPeleCicatrizacao: 'Problema de Pele/Cicatrização',
      depressaoPanicoAnsiedade: 'Depressão/Pânico/Ansiedade',
      doencaInfectocontagiosa: 'Doença Infectocontagiosa',
      historicoConvulsaoEpilepsia: 'Histórico de Convulsão/Epilepsia'
    }
    return traducoes[key] || key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
  }

  const traduzirQuestaoMedica = (key: string): string => {
    const traducoes: { [key: string]: string } = {
      cancer: 'Câncer',
      disturbioCirculatorio: 'Distúrbio Circulatório',
      usoDrogas: 'Uso de Drogas',
      efeitoAlcool: 'Efeito do Álcool',
      dormiuUltimaNoite: 'Dormiu na Última Noite',
      emJejum: 'Em Jejum',
      cardiopatia: 'Cardiopatia',
      hipertensao: 'Hipertensão',
      hipotensao: 'Hipotensão',
      marcapasso: 'Marca-passo',
      hemofilia: 'Hemofilia',
      hepatite: 'Hepatite',
      anemia: 'Anemia',
      queloid: 'Queloide',
      vitiligo: 'Vitiligo',
      gestante: 'Gestante',
      amamentando: 'Amamentando'
    }
    return traducoes[key] || key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
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
            <h2>Ficha Completa do Cliente</h2>
            <button 
              className="btn-voltar"
              onClick={() => {
                setClienteSelecionado(null)
                setClienteCompleto(null)
                setQuery('')
              }}
            >
              Voltar
            </button>
          </div>
          
          {isLoadingCompleto ? (
            <div className="loading-completo">
              <div className="spinner"></div>
              <p>Carregando dados completos...</p>
            </div>
          ) : clienteCompleto ? (
            <>
              {/* Dados Pessoais */}
              <div className="details-section">
                <h3>Dados Pessoais</h3>
                <div className="details-grid">
                  <div className="detail-item">
                    <label>Nome:</label>
                    <span>{clienteCompleto.nome}</span>
                  </div>
                  <div className="detail-item">
                    <label>CPF:</label>
                    <span>{formatarCPF(clienteCompleto.cpf)}</span>
                  </div>
                  {clienteCompleto.dados_cliente?.rg && (
                    <div className="detail-item">
                      <label>RG:</label>
                      <span>{clienteCompleto.dados_cliente.rg}</span>
                    </div>
                  )}
                  {clienteCompleto.dados_cliente?.dataNascimento && (
                    <div className="detail-item">
                      <label>Data de Nascimento:</label>
                      <span>{formatarData(clienteCompleto.dados_cliente.dataNascimento)}</span>
                    </div>
                  )}
                  {clienteCompleto.dados_cliente?.idade && (
                    <div className="detail-item">
                      <label>Idade:</label>
                      <span>{clienteCompleto.dados_cliente.idade}</span>
                    </div>
                  )}
                  {clienteCompleto.dados_cliente?.endereco && (
                    <div className="detail-item full-width">
                      <label>Endereço:</label>
                      <span>{clienteCompleto.dados_cliente.endereco}</span>
                    </div>
                  )}
                  {clienteCompleto.dados_cliente?.telefone && (
                    <div className="detail-item">
                      <label>Telefone:</label>
                      <span>{clienteCompleto.dados_cliente.telefone}</span>
                    </div>
                  )}
                  {clienteCompleto.dados_cliente?.celular && (
                    <div className="detail-item">
                      <label>Celular:</label>
                      <span>{clienteCompleto.dados_cliente.celular}</span>
                    </div>
                  )}
                  {clienteCompleto.dados_cliente?.email && (
                    <div className="detail-item">
                      <label>E-mail:</label>
                      <span>{clienteCompleto.dados_cliente.email}</span>
                    </div>
                  )}
                  {clienteCompleto.dados_cliente?.comoNosConheceu && (
                    <div className="detail-item full-width">
                      <label>Como nos conheceu:</label>
                      <div className="como-nos-conheceu">
                        {clienteCompleto.dados_cliente.comoNosConheceu.instagram && <span>Instagram</span>}
                        {clienteCompleto.dados_cliente.comoNosConheceu.facebook && <span>Facebook</span>}
                        {clienteCompleto.dados_cliente.comoNosConheceu.outro && <span>Outro</span>}
                        {clienteCompleto.dados_cliente.comoNosConheceu.indicacao && (
                          <span>Indicação: {clienteCompleto.dados_cliente.comoNosConheceu.indicacao}</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Avaliação Médica */}
              {clienteCompleto.avaliacao && (
                <div className="details-section">
                  <h3>Avaliação Médica</h3>
                  <div className="details-grid">
                    {clienteCompleto.avaliacao.tipoSanguineo && (
                      <div className="detail-item">
                        <label>Tipo Sanguíneo:</label>
                        <span>{clienteCompleto.avaliacao.tipoSanguineo}</span>
                      </div>
                    )}
                    {clienteCompleto.avaliacao.outroProblema && (
                      <div className="detail-item full-width">
                        <label>Outro Problema:</label>
                        <span>{clienteCompleto.avaliacao.outroProblema}</span>
                      </div>
                    )}
                  </div>
                  
                  {clienteCompleto.avaliacao.avaliacaoMedica && (
                    <div className="avaliacao-medica-list">
                      {Object.entries(clienteCompleto.avaliacao.avaliacaoMedica).map(([key, value]: [string, any]) => {
                        if (value?.sim || value?.nao) {
                          return (
                            <div key={key} className="avaliacao-item">
                              <label>{traduzirAvaliacaoMedica(key)}:</label>
                              <span>{value.sim ? 'Sim' : 'Não'}</span>
                              {value.especifique && (
                                <span className="especifique"> - {value.especifique}</span>
                              )}
                            </div>
                          )
                        }
                        return null
                      })}
                    </div>
                  )}

                  {clienteCompleto.avaliacao.outrasQuestoesMedicas && (
                    <div className="outras-questoes">
                      <h4>Outras Questões Médicas:</h4>
                      <div className="questoes-grid">
                        {Object.entries(clienteCompleto.avaliacao.outrasQuestoesMedicas).map(([key, value]: [string, any]) => {
                          if (value) {
                            return (
                              <div key={key} className="questao-item">
                                {traduzirQuestaoMedica(key)}
                              </div>
                            )
                          }
                          return null
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Informações do Procedimento */}
              {clienteCompleto.info_tattoo && (
                <div className="details-section">
                  <h3>Informações do Procedimento</h3>
                  {clienteCompleto.info_tattoo.procedimento && (
                    <div className="details-grid">
                      {clienteCompleto.info_tattoo.procedimento.local && (
                        <div className="detail-item">
                          <label>Local:</label>
                          <span>{clienteCompleto.info_tattoo.procedimento.local}</span>
                        </div>
                      )}
                      {clienteCompleto.info_tattoo.procedimento.estilo && (
                        <div className="detail-item">
                          <label>Estilo:</label>
                          <span>{clienteCompleto.info_tattoo.procedimento.estilo}</span>
                        </div>
                      )}
                      {clienteCompleto.info_tattoo.procedimento.profissional && (
                        <div className="detail-item">
                          <label>Profissional:</label>
                          <span>{clienteCompleto.info_tattoo.procedimento.profissional}</span>
                        </div>
                      )}
                      {clienteCompleto.info_tattoo.procedimento.data && (
                        <div className="detail-item">
                          <label>Data:</label>
                          <span>{formatarData(clienteCompleto.info_tattoo.procedimento.data)}</span>
                        </div>
                      )}
                      {clienteCompleto.info_tattoo.procedimento.valor && (
                        <div className="detail-item">
                          <label>Valor:</label>
                          <span>{clienteCompleto.info_tattoo.procedimento.valor}</span>
                        </div>
                      )}
                      {clienteCompleto.info_tattoo.procedimento.observacoes && (
                        <div className="detail-item full-width">
                          <label>Observações:</label>
                          <span>{clienteCompleto.info_tattoo.procedimento.observacoes}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {clienteCompleto.info_tattoo.declaracoes && (
                    <div className="declaracoes-list">
                      <h4>Declarações:</h4>
                      {Object.entries(clienteCompleto.info_tattoo.declaracoes).map(([key, value]: [string, any]) => {
                        if (value) {
                          return (
                            <div key={key} className="declaracao-item">
                              ✓ {traduzirDeclaracao(key)}
                            </div>
                          )
                        }
                        return null
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Informações Adicionais */}
              <div className="details-section">
                <h3>Informações Adicionais</h3>
                <div className="details-grid">
                  <div className="detail-item">
                    <label>Termos Aceitos:</label>
                    <span>
                      {(() => {
                        const termos = clienteCompleto.termos?.trim() || ''
                        if (termos.toUpperCase() === 'S') return 'Aceitou'
                        if (termos.toUpperCase() === 'N') return 'Não aceitou'
                        return 'Não informado'
                      })()}
                    </span>
                  </div>
                  {clienteCompleto.data_preenchimento_ficha && (
                    <div className="detail-item">
                      <label>Data de Preenchimento:</label>
                      <span>{formatarData(clienteCompleto.data_preenchimento_ficha)}</span>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
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
          )}
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
