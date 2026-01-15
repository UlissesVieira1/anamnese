'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { AnamneseTipagem } from '@/types/anamnese'
import './globals.css'

function HomeContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const profissionalId = searchParams?.get('profissional_id')
  
  // Redireciona para login se não tiver profissional_id na URL
  useEffect(() => {
    if (!profissionalId) {
      router.push('/login-profissional')
      return
    }
  }, [profissionalId, router])
  
  const [formData, setFormData] = useState<AnamneseTipagem>({
    nome: '',
    endereco: '',
    rg: '',
    cpf: '',
    dataNascimento: '',
    idade: '',
    comoNosConheceu: {
      instagram: false,
      facebook: false,
      outro: false,
      indicacao: '',
    },
    telefone: '',
    celular: '',
    email: '',
    avaliacaoMedica: {
      tratamentoMedico: { sim: false, nao: false, especifique: '' },
      diabetes: { sim: false, nao: false, especifique: '' },
      cirurgiaRecente: { sim: false, nao: false, especifique: '' },
      alergia: { sim: false, nao: false, especifique: '' },
      problemaPeleCicatrizacao: { sim: false, nao: false, especifique: '' },
      depressaoPanicoAnsiedade: { sim: false, nao: false, especifique: '' },
      doencaInfectocontagiosa: { sim: false, nao: false, especifique: '' },
      historicoConvulsaoEpilepsia: { sim: false, nao: false, especifique: '' },
    },
    outrasQuestoesMedicas: {
      cancer: false,
      disturbioCirculatorio: false,
      usoDrogas: false,
      efeitoAlcool: false,
      dormiuUltimaNoite: false,
      emJejum: false,
      cardiopatia: false,
      hipertensao: false,
      hipotensao: false,
      marcapasso: false,
      hemofilia: false,
      hepatite: false,
      anemia: false,
      queloid: false,
      vitiligo: false,
      gestante: false,
      amamentando: false,
    },
    outroProblema: '',
    tipoSanguineo: '',
    declaracoes: {
      veracidadeInformacoes: false,
      seguirCuidados: false,
      permanenciaTatuagem: false,
      condicoesHigienicas: false,
    },
    aceiteTermos: false,
    procedimento: {
      local: '',
      estilo: '',
      observacoes: '',
      profissional: '',
      data: '',
      valor: '',
    },
  })

  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Auto-fecha o toast após 7 segundos
  useEffect(() => {
    if (message) {
      console.log('[DEBUG] Mensagem definida:', message)
      const timer = setTimeout(() => {
        console.log('[DEBUG] Limpando mensagem após timeout')
        setMessage(null)
      }, 7000) // Aumentado para 7 segundos
      return () => clearTimeout(timer)
    }
  }, [message])

  // Funções de máscara
  const maskCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    if (numbers.length <= 11) {
      return numbers
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
    }
    return value
  }

  const maskPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    if (numbers.length <= 10) {
      // Telefone fixo: (00) 0000-0000
      return numbers
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{4})(\d)/, '$1-$2')
    }
    return value
  }

  const maskCellphone = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    if (numbers.length <= 11) {
      // Celular: (00) 00000-0000
      return numbers
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d)/, '$1-$2')
    }
    return value
  }

  const maskRG = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    if (numbers.length <= 9) {
      return numbers
        .replace(/(\d{2})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1})$/, '$1-$2')
    }
    return value
  }

  // Função para atualizar campos simples
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    
    // Aplica máscaras conforme o campo
    let maskedValue = value
    if (name === 'cpf') {
      maskedValue = maskCPF(value)
    } else if (name === 'telefone') {
      maskedValue = maskPhone(value)
    } else if (name === 'celular') {
      maskedValue = maskCellphone(value)
    } else if (name === 'rg') {
      maskedValue = maskRG(value)
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: maskedValue,
    }))
  }

  // Função para atualizar "Como nos conheceu"
  const handleComoNosConheceuChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, type, checked, value } = e.target
    setFormData(prev => ({
      ...prev,
      comoNosConheceu: {
        ...prev.comoNosConheceu,
        [name]: type === 'checkbox' ? checked : value,
      },
    }))
  }

  // Função para atualizar avaliação médica (Sim/Não)
  const handleAvaliacaoMedicaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked } = e.target
    const campo = name
    const opcao = value as 'sim' | 'nao'

    setFormData(prev => ({
      ...prev,
      avaliacaoMedica: {
        ...prev.avaliacaoMedica,
        [campo]: {
          ...prev.avaliacaoMedica[campo as keyof typeof prev.avaliacaoMedica],
          [opcao]: checked,
          ...(opcao === 'sim' && checked ? { nao: false } : {}),
          ...(opcao === 'nao' && checked ? { sim: false } : {}),
        },
      },
    }))
  }

  // Função para atualizar especificação da avaliação médica
  const handleAvaliacaoMedicaEspecifique = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    const campo = name.replace('.especifique', '')

    setFormData(prev => ({
      ...prev,
      avaliacaoMedica: {
        ...prev.avaliacaoMedica,
        [campo]: {
          ...prev.avaliacaoMedica[campo as keyof typeof prev.avaliacaoMedica],
          especifique: value,
        },
      },
    }))
  }

  // Função para atualizar outras questões médicas
  const handleOutrasQuestoesMedicasChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target
    setFormData(prev => ({
      ...prev,
      outrasQuestoesMedicas: {
        ...prev.outrasQuestoesMedicas,
        [name]: checked,
      },
    }))
  }

  // Função para atualizar declarações
  const handleDeclaracoesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target
    setFormData(prev => ({
      ...prev,
      declaracoes: {
        ...prev.declaracoes,
        [name]: checked,
      },
    }))
  }

  // Função para atualizar procedimento
  const handleProcedimentoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      procedimento: {
        ...prev.procedimento,
        [name]: value,
      },
    }))
  }

  // Função para calcular idade automaticamente a partir da data de nascimento
  const handleDataNascimentoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dataNascimento = e.target.value
    if (dataNascimento) {
      const hoje = new Date()
      const nascimento = new Date(dataNascimento)
      let idade = hoje.getFullYear() - nascimento.getFullYear()
      const mes = hoje.getMonth() - nascimento.getMonth()
      if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
        idade--
      }
      setFormData(prev => ({
        ...prev,
        dataNascimento,
        idade: idade.toString(),
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        dataNascimento: '',
        idade: '',
      }))
    }
  }

  // Função para validar o formulário
  const validateForm = (): boolean => {
    if (!formData.nome.trim()) {
      setMessage({ type: 'error', text: 'Por favor, preencha o nome.' })
      return false
    }
    if (!formData.cpf.trim()) {
      setMessage({ type: 'error', text: 'Por favor, preencha o CPF.' })
      return false
    }
    if (!formData.telefone.trim() && !formData.celular.trim()) {
      setMessage({ type: 'error', text: 'Por favor, preencha pelo menos um telefone.' })
      return false
    }
    if (!formData.declaracoes.veracidadeInformacoes) {
      setMessage({ type: 'error', text: 'É necessário aceitar a declaração de veracidade das informações.' })
      return false
    }
    if (!formData.declaracoes.seguirCuidados) {
      setMessage({ type: 'error', text: 'É necessário aceitar o compromisso de seguir os cuidados pós-procedimento.' })
      return false
    }
    if (!formData.declaracoes.condicoesHigienicas) {
      setMessage({ type: 'error', text: 'É necessário aceitar a declaração sobre condições higiênicas.' })
      return false
    }
    if (!formData.declaracoes.permanenciaTatuagem) {
      setMessage({ type: 'error', text: 'É necessário aceitar a declaração sobre a permanência da tatuagem.' })
      return false
    }
    if (!formData.aceiteTermos) {
      setMessage({ type: 'error', text: 'É necessário aceitar os termos e condições para continuar.' })
      return false
    }
    return true
  }

  // Função para enviar o formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      // Prepara os dados para envio, incluindo profissional_id se presente na URL
      let profissionalIdNum: number | undefined = undefined
      if (profissionalId) {
        const parsed = parseInt(profissionalId)
        if (!isNaN(parsed)) {
          profissionalIdNum = parsed
        }
      }

      const dadosParaEnvio = {
        ...formData,
        ...(profissionalIdNum !== undefined && { profissional_id: profissionalIdNum }),
      }

      console.log('[DEBUG] Dados para envio:', {
        nome: dadosParaEnvio.nome,
        cpf: dadosParaEnvio.cpf,
        profissional_id: profissionalIdNum,
        temProcedimento: !!dadosParaEnvio.procedimento,
        temDeclaracoes: !!dadosParaEnvio.declaracoes,
      })

      // Prepara headers com token se disponível
      const token = localStorage.getItem('profissional_token')
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      // Chama a API Route do Next.js
      const response = await fetch('/api/inserirDadosAnamnese', {
        method: 'POST',
        headers,
        body: JSON.stringify(dadosParaEnvio),
      })

      console.log('[DEBUG] Response status:', response.status, response.statusText)

      const result = await response.json()
      
      console.log('[DEBUG] Resposta da API:', { ok: response.ok, status: response.status, result })

      if (response.ok && result.success) {
        console.log('[DEBUG] ✅ Sucesso! Definindo mensagem de sucesso')
        // Limpa o formulário ANTES de definir a mensagem
        handleReset(true) // Limpa formulário e mensagem
        // Depois define a nova mensagem de sucesso
        setTimeout(() => {
          setMessage({ type: 'success', text: result.message || 'Ficha de anamnese salva com sucesso!' })
        }, 50)
      } else {
        console.log('[DEBUG] ❌ Erro! Definindo mensagem de erro')
        const errorMessage = result.message || result.error?.message || 'Erro ao salvar a ficha. Tente novamente.'
        console.error('[DEBUG] Detalhes do erro:', result.error)
        setMessage({ type: 'error', text: errorMessage })
      }
    } catch (error: any) {
      console.error('[DEBUG] ❌ Erro no catch:', error)
      const errorMessage = error?.message || 'Erro ao salvar a ficha. Verifique se o servidor está rodando.'
      setMessage({ type: 'error', text: errorMessage })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Função para limpar o formulário
  const handleReset = (limparMensagem: boolean = true) => {
    if (limparMensagem) {
      setMessage(null)
    }
    setFormData({
      nome: '',
      endereco: '',
      rg: '',
      cpf: '',
      dataNascimento: '',
      idade: '',
      comoNosConheceu: {
        instagram: false,
        facebook: false,
        outro: false,
        indicacao: '',
      },
      telefone: '',
      celular: '',
      email: '',
      avaliacaoMedica: {
        tratamentoMedico: { sim: false, nao: false, especifique: '' },
        diabetes: { sim: false, nao: false, especifique: '' },
        cirurgiaRecente: { sim: false, nao: false, especifique: '' },
        alergia: { sim: false, nao: false, especifique: '' },
        problemaPeleCicatrizacao: { sim: false, nao: false, especifique: '' },
        depressaoPanicoAnsiedade: { sim: false, nao: false, especifique: '' },
        doencaInfectocontagiosa: { sim: false, nao: false, especifique: '' },
        historicoConvulsaoEpilepsia: { sim: false, nao: false, especifique: '' },
      },
      outrasQuestoesMedicas: {
        cancer: false,
        disturbioCirculatorio: false,
        usoDrogas: false,
        efeitoAlcool: false,
        dormiuUltimaNoite: false,
        emJejum: false,
        cardiopatia: false,
        hipertensao: false,
        hipotensao: false,
        marcapasso: false,
        hemofilia: false,
        hepatite: false,
        anemia: false,
        queloid: false,
        vitiligo: false,
        gestante: false,
        amamentando: false,
      },
      outroProblema: '',
      tipoSanguineo: '',
      declaracoes: {
        veracidadeInformacoes: false,
        seguirCuidados: false,
        permanenciaTatuagem: false,
        condicoesHigienicas: false,
      },
      aceiteTermos: false,
      procedimento: {
        local: '',
        estilo: '',
        observacoes: '',
        profissional: '',
        data: '',
        valor: '',
      },
    })
    setMessage(null)
  }

  // Se não tiver profissional_id, não renderiza nada (já redirecionou)
  if (!profissionalId) {
    return (
      <div className="container">
        <h1>ANAMNESE TATUAGEM</h1>
        <p>Redirecionando para login...</p>
      </div>
    )
  }

  return (
    <div className="container">
      <h1>ANAMNESE TATUAGEM</h1>



      <form onSubmit={handleSubmit}>
        {/* Dados Pessoais */}
        <div className="form-section">
          <h2>DADOS PESSOAIS</h2>

          <div className="form-group">
            <label htmlFor="nome">Nome <span style={{ color: 'red', fontSize: '1.3em', fontWeight: 'bold', verticalAlign: 'middle', display: 'inline-block', lineHeight: '1' }}>*</span></label>
            <input
              type="text"
              id="nome"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="endereco">Endereço</label>
            <input
              type="text"
              id="endereco"
              name="endereco"
              value={formData.endereco}
              onChange={handleChange}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="rg">RG</label>
              <input
                type="text"
                id="rg"
                name="rg"
                value={formData.rg}
                onChange={handleChange}
                placeholder="00.000.000-0"
                maxLength={12}
              />
            </div>

            <div className="form-group">
              <label htmlFor="cpf">CPF <span style={{ color: 'red', fontSize: '1.3em', fontWeight: 'bold', verticalAlign: 'middle', display: 'inline-block', lineHeight: '1' }}>*</span></label>
              <input
                type="text"
                id="cpf"
                name="cpf"
                value={formData.cpf}
                onChange={handleChange}
                placeholder="000.000.000-00"
                maxLength={14}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="dataNascimento">Data de Nascimento <span style={{ color: 'red', fontSize: '1.3em', fontWeight: 'bold', verticalAlign: 'middle', display: 'inline-block', lineHeight: '1' }}>*</span></label>
              <input
                type="date"
                id="dataNascimento"
                name="dataNascimento"
                value={formData.dataNascimento}
                onChange={handleDataNascimentoChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="idade">Idade</label>
              <input
                type="text"
                id="idade"
                name="idade"
                value={formData.idade}
                readOnly
                style={{ backgroundColor: '#f7fafc', cursor: 'not-allowed' }}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Como nos conheceu?</label>
            <div className="checkbox-group">
              <div>
                <input
                  type="checkbox"
                  id="instagram"
                  name="instagram"
                  checked={formData.comoNosConheceu.instagram}
                  onChange={handleComoNosConheceuChange}
                />
                <label htmlFor="instagram">Instagram</label>
              </div>

              <div>
                <input
                  type="checkbox"
                  id="facebook"
                  name="facebook"
                  checked={formData.comoNosConheceu.facebook}
                  onChange={handleComoNosConheceuChange}
                />
                <label htmlFor="facebook">Facebook</label>
              </div>

              <div>
                <input
                  type="checkbox"
                  id="outro"
                  name="outro"
                  checked={formData.comoNosConheceu.outro}
                  onChange={handleComoNosConheceuChange}
                />
                <label htmlFor="outro">Outro</label>
              </div>

              <label htmlFor="indicacao">
                Indicação:
                <input
                  type="text"
                  id="indicacao"
                  name="indicacao"
                  value={formData.comoNosConheceu.indicacao}
                  onChange={handleComoNosConheceuChange}
                />
              </label>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="telefone">Tel.</label>
              <input
                type="tel"
                id="telefone"
                name="telefone"
                value={formData.telefone}
                onChange={handleChange}
                placeholder="(00) 0000-0000"
                maxLength={14}
              />
            </div>

            <div className="form-group">
              <label htmlFor="celular">Cel. <span style={{ color: 'red', fontSize: '1.3em', fontWeight: 'bold', verticalAlign: 'middle', display: 'inline-block', lineHeight: '1' }}>*</span></label>
              <input
                type="tel"
                id="celular"
                name="celular"
                value={formData.celular}
                onChange={handleChange}
                placeholder="(00) 00000-0000"
                maxLength={15}
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">E-mail <span style={{ color: 'red', fontSize: '1.3em', fontWeight: 'bold', verticalAlign: 'middle', display: 'inline-block', lineHeight: '1' }}>*</span></label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* Avaliação Médica */}
        <div className="form-section">
          <h2>- AVALIAÇÃO -</h2>

          {/* Tratamento Médico */}
          <div className="form-group">
            <label>ESTÁ EM TRATAMENTO MÉDICO?</label>
            <div className="radio-group">
              <div>
                <input
                  type="radio"
                  id="tratamentoMedico.sim"
                  name="tratamentoMedico"
                  value="sim"
                  checked={formData.avaliacaoMedica.tratamentoMedico.sim}
                  onChange={handleAvaliacaoMedicaChange}
                />
                <label htmlFor="tratamentoMedico.sim">Sim</label>
              </div>
              <div>
                <input
                  type="radio"
                  id="tratamentoMedico.nao"
                  name="tratamentoMedico"
                  value="nao"
                  checked={formData.avaliacaoMedica.tratamentoMedico.nao}
                  onChange={handleAvaliacaoMedicaChange}
                />
                <label htmlFor="tratamentoMedico.nao">Não</label>
              </div>
            </div>
            <input
              type="text"
              placeholder="Especifique:"
              value={formData.avaliacaoMedica.tratamentoMedico.especifique}
              onChange={(e) => {
                const newEvent = { ...e, target: { ...e.target, name: 'tratamentoMedico.especifique' } } as React.ChangeEvent<HTMLInputElement>
                handleAvaliacaoMedicaEspecifique(newEvent)
              }}
              style={{ marginTop: '5px', width: '100%' }}
            />
          </div>

          {/* Diabetes */}
          <div className="form-group">
            <label>DIABETES?</label>
            <div className="radio-group">
              <div>
                <input
                  type="radio"
                  id="diabetes.sim"
                  name="diabetes"
                  value="sim"
                  checked={formData.avaliacaoMedica.diabetes.sim}
                  onChange={handleAvaliacaoMedicaChange}
                />
                <label htmlFor="diabetes.sim">Sim</label>
              </div>
              <div>
                <input
                  type="radio"
                  id="diabetes.nao"
                  name="diabetes"
                  value="nao"
                  checked={formData.avaliacaoMedica.diabetes.nao}
                  onChange={handleAvaliacaoMedicaChange}
                />
                <label htmlFor="diabetes.nao">Não</label>
              </div>
            </div>
            <input
              type="text"
              placeholder="Especifique:"
              value={formData.avaliacaoMedica.diabetes.especifique}
              onChange={(e) => {
                const newEvent = { ...e, target: { ...e.target, name: 'diabetes.especifique' } } as React.ChangeEvent<HTMLInputElement>
                handleAvaliacaoMedicaEspecifique(newEvent)
              }}
              style={{ marginTop: '5px', width: '100%' }}
            />
          </div>

          {/* Cirurgia Recente */}
          <div className="form-group">
            <label>CIRURGIA RECENTE?</label>
            <div className="radio-group">
              <div>
                <input
                  type="radio"
                  id="cirurgiaRecente.sim"
                  name="cirurgiaRecente"
                  value="sim"
                  checked={formData.avaliacaoMedica.cirurgiaRecente.sim}
                  onChange={handleAvaliacaoMedicaChange}
                />
                <label htmlFor="cirurgiaRecente.sim">Sim</label>
              </div>
              <div>
                <input
                  type="radio"
                  id="cirurgiaRecente.nao"
                  name="cirurgiaRecente"
                  value="nao"
                  checked={formData.avaliacaoMedica.cirurgiaRecente.nao}
                  onChange={handleAvaliacaoMedicaChange}
                />
                <label htmlFor="cirurgiaRecente.nao">Não</label>
              </div>
            </div>
            <input
              type="text"
              placeholder="Especifique:"
              value={formData.avaliacaoMedica.cirurgiaRecente.especifique}
              onChange={(e) => {
                const newEvent = { ...e, target: { ...e.target, name: 'cirurgiaRecente.especifique' } } as React.ChangeEvent<HTMLInputElement>
                handleAvaliacaoMedicaEspecifique(newEvent)
              }}
              style={{ marginTop: '5px', width: '100%' }}
            />
          </div>

          {/* Alergia */}
          <div className="form-group">
            <label>ALERGIA?</label>
            <div className="radio-group">
              <div>
                <input
                  type="radio"
                  id="alergia.sim"
                  name="alergia"
                  value="sim"
                  checked={formData.avaliacaoMedica.alergia.sim}
                  onChange={handleAvaliacaoMedicaChange}
                />
                <label htmlFor="alergia.sim">Sim</label>
              </div>
              <div>
                <input
                  type="radio"
                  id="alergia.nao"
                  name="alergia"
                  value="nao"
                  checked={formData.avaliacaoMedica.alergia.nao}
                  onChange={handleAvaliacaoMedicaChange}
                />
                <label htmlFor="alergia.nao">Não</label>
              </div>
            </div>
            <input
              type="text"
              placeholder="Especifique:"
              value={formData.avaliacaoMedica.alergia.especifique}
              onChange={(e) => {
                const newEvent = { ...e, target: { ...e.target, name: 'alergia.especifique' } } as React.ChangeEvent<HTMLInputElement>
                handleAvaliacaoMedicaEspecifique(newEvent)
              }}
              style={{ marginTop: '5px', width: '100%' }}
            />
          </div>

          {/* Problema de Pele/Cicatrização */}
          <div className="form-group">
            <label>PROBLEMA DE PELE / CICATRIZAÇÃO?</label>
            <div className="radio-group">
              <div>
                <input
                  type="radio"
                  id="problemaPeleCicatrizacao.sim"
                  name="problemaPeleCicatrizacao"
                  value="sim"
                  checked={formData.avaliacaoMedica.problemaPeleCicatrizacao.sim}
                  onChange={handleAvaliacaoMedicaChange}
                />
                <label htmlFor="problemaPeleCicatrizacao.sim">Sim</label>
              </div>
              <div>
                <input
                  type="radio"
                  id="problemaPeleCicatrizacao.nao"
                  name="problemaPeleCicatrizacao"
                  value="nao"
                  checked={formData.avaliacaoMedica.problemaPeleCicatrizacao.nao}
                  onChange={handleAvaliacaoMedicaChange}
                />
                <label htmlFor="problemaPeleCicatrizacao.nao">Não</label>
              </div>
            </div>
            <input
              type="text"
              placeholder="Especifique:"
              value={formData.avaliacaoMedica.problemaPeleCicatrizacao.especifique}
              onChange={(e) => {
                const newEvent = { ...e, target: { ...e.target, name: 'problemaPeleCicatrizacao.especifique' } } as React.ChangeEvent<HTMLInputElement>
                handleAvaliacaoMedicaEspecifique(newEvent)
              }}
              style={{ marginTop: '5px', width: '100%' }}
            />
          </div>

          {/* Depressão/Pânico/Ansiedade */}
          <div className="form-group">
            <label>DEPRESSÃO / PÂNICO / ANSIEDADE?</label>
            <div className="radio-group">
              <div>
                <input
                  type="radio"
                  id="depressaoPanicoAnsiedade.sim"
                  name="depressaoPanicoAnsiedade"
                  value="sim"
                  checked={formData.avaliacaoMedica.depressaoPanicoAnsiedade.sim}
                  onChange={handleAvaliacaoMedicaChange}
                />
                <label htmlFor="depressaoPanicoAnsiedade.sim">Sim</label>
              </div>
              <div>
                <input
                  type="radio"
                  id="depressaoPanicoAnsiedade.nao"
                  name="depressaoPanicoAnsiedade"
                  value="nao"
                  checked={formData.avaliacaoMedica.depressaoPanicoAnsiedade.nao}
                  onChange={handleAvaliacaoMedicaChange}
                />
                <label htmlFor="depressaoPanicoAnsiedade.nao">Não</label>
              </div>
            </div>
            <input
              type="text"
              placeholder="Especifique:"
              value={formData.avaliacaoMedica.depressaoPanicoAnsiedade.especifique}
              onChange={(e) => {
                const newEvent = { ...e, target: { ...e.target, name: 'depressaoPanicoAnsiedade.especifique' } } as React.ChangeEvent<HTMLInputElement>
                handleAvaliacaoMedicaEspecifique(newEvent)
              }}
              style={{ marginTop: '5px', width: '100%' }}
            />
          </div>

          {/* Doença Infectocontagiosa */}
          <div className="form-group">
            <label>DOENÇA INFECTOCONTAGIOSA?</label>
            <div className="radio-group">
              <div>
                <input
                  type="radio"
                  id="doencaInfectocontagiosa.sim"
                  name="doencaInfectocontagiosa"
                  value="sim"
                  checked={formData.avaliacaoMedica.doencaInfectocontagiosa.sim}
                  onChange={handleAvaliacaoMedicaChange}
                />
                <label htmlFor="doencaInfectocontagiosa.sim">Sim</label>
              </div>
              <div>
                <input
                  type="radio"
                  id="doencaInfectocontagiosa.nao"
                  name="doencaInfectocontagiosa"
                  value="nao"
                  checked={formData.avaliacaoMedica.doencaInfectocontagiosa.nao}
                  onChange={handleAvaliacaoMedicaChange}
                />
                <label htmlFor="doencaInfectocontagiosa.nao">Não</label>
              </div>
            </div>
            <input
              type="text"
              placeholder="Especifique:"
              value={formData.avaliacaoMedica.doencaInfectocontagiosa.especifique}
              onChange={(e) => {
                const newEvent = { ...e, target: { ...e.target, name: 'doencaInfectocontagiosa.especifique' } } as React.ChangeEvent<HTMLInputElement>
                handleAvaliacaoMedicaEspecifique(newEvent)
              }}
              style={{ marginTop: '5px', width: '100%' }}
            />
          </div>

          {/* Histórico de Convulsão/Epilepsia */}
          <div className="form-group">
            <label>HISTÓRICO DE CONVULSÃO / EPILEPSIA?</label>
            <div className="radio-group">
              <div>
                <input
                  type="radio"
                  id="historicoConvulsaoEpilepsia.sim"
                  name="historicoConvulsaoEpilepsia"
                  value="sim"
                  checked={formData.avaliacaoMedica.historicoConvulsaoEpilepsia.sim}
                  onChange={handleAvaliacaoMedicaChange}
                />
                <label htmlFor="historicoConvulsaoEpilepsia.sim">Sim</label>
              </div>
              <div>
                <input
                  type="radio"
                  id="historicoConvulsaoEpilepsia.nao"
                  name="historicoConvulsaoEpilepsia"
                  value="nao"
                  checked={formData.avaliacaoMedica.historicoConvulsaoEpilepsia.nao}
                  onChange={handleAvaliacaoMedicaChange}
                />
                <label htmlFor="historicoConvulsaoEpilepsia.nao">Não</label>
              </div>
            </div>
            <input
              type="text"
              placeholder="Especifique:"
              value={formData.avaliacaoMedica.historicoConvulsaoEpilepsia.especifique}
              onChange={(e) => {
                const newEvent = { ...e, target: { ...e.target, name: 'historicoConvulsaoEpilepsia.especifique' } } as React.ChangeEvent<HTMLInputElement>
                handleAvaliacaoMedicaEspecifique(newEvent)
              }}
              style={{ marginTop: '5px', width: '100%' }}
            />
          </div>
        </div>

        {/* Outras Questões Médicas */}
        <div className="form-section">
          <h2>OUTRAS QUESTÕES MÉDICAS</h2>
          <div className="medical-questions-grid">
            <div className="checkbox-group">
              <input
                type="checkbox"
                id="cancer"
                name="cancer"
                checked={formData.outrasQuestoesMedicas.cancer}
                onChange={handleOutrasQuestoesMedicasChange}
              />
              <label htmlFor="cancer">Algum tipo de câncer?</label>
            </div>
            <div className="checkbox-group">
              <input
                type="checkbox"
                id="disturbioCirculatorio"
                name="disturbioCirculatorio"
                checked={formData.outrasQuestoesMedicas.disturbioCirculatorio}
                onChange={handleOutrasQuestoesMedicasChange}
              />
              <label htmlFor="disturbioCirculatorio">Distúrbio circulatório?</label>
            </div>
            <div className="checkbox-group">
              <input
                type="checkbox"
                id="usoDrogas"
                name="usoDrogas"
                checked={formData.outrasQuestoesMedicas.usoDrogas}
                onChange={handleOutrasQuestoesMedicasChange}
              />
              <label htmlFor="usoDrogas">Fez/faz uso de drogas?</label>
            </div>
            <div className="checkbox-group">
              <input
                type="checkbox"
                id="efeitoAlcool"
                name="efeitoAlcool"
                checked={formData.outrasQuestoesMedicas.efeitoAlcool}
                onChange={handleOutrasQuestoesMedicasChange}
              />
              <label htmlFor="efeitoAlcool">Está sob efeito de álcool?</label>
            </div>
            <div className="checkbox-group">
              <input
                type="checkbox"
                id="dormiuUltimaNoite"
                name="dormiuUltimaNoite"
                checked={formData.outrasQuestoesMedicas.dormiuUltimaNoite}
                onChange={handleOutrasQuestoesMedicasChange}
              />
              <label htmlFor="dormiuUltimaNoite">Dormiu a última noite?</label>
            </div>
            <div className="checkbox-group">
              <input
                type="checkbox"
                id="emJejum"
                name="emJejum"
                checked={formData.outrasQuestoesMedicas.emJejum}
                onChange={handleOutrasQuestoesMedicasChange}
              />
              <label htmlFor="emJejum">Está em jejum?</label>
            </div>
            <div className="checkbox-group">
              <input
                type="checkbox"
                id="cardiopatia"
                name="cardiopatia"
                checked={formData.outrasQuestoesMedicas.cardiopatia}
                onChange={handleOutrasQuestoesMedicasChange}
              />
              <label htmlFor="cardiopatia">Cardiopatia?</label>
            </div>
            <div className="checkbox-group">
              <input
                type="checkbox"
                id="hipertensao"
                name="hipertensao"
                checked={formData.outrasQuestoesMedicas.hipertensao}
                onChange={handleOutrasQuestoesMedicasChange}
              />
              <label htmlFor="hipertensao">Hipertensão?</label>
            </div>
            <div className="checkbox-group">
              <input
                type="checkbox"
                id="hipotensao"
                name="hipotensao"
                checked={formData.outrasQuestoesMedicas.hipotensao}
                onChange={handleOutrasQuestoesMedicasChange}
              />
              <label htmlFor="hipotensao">Hipotensão?</label>
            </div>
            <div className="checkbox-group">
              <input
                type="checkbox"
                id="marcapasso"
                name="marcapasso"
                checked={formData.outrasQuestoesMedicas.marcapasso}
                onChange={handleOutrasQuestoesMedicasChange}
              />
              <label htmlFor="marcapasso">Marcapasso?</label>
            </div>
            <div className="checkbox-group">
              <input
                type="checkbox"
                id="hemofilia"
                name="hemofilia"
                checked={formData.outrasQuestoesMedicas.hemofilia}
                onChange={handleOutrasQuestoesMedicasChange}
              />
              <label htmlFor="hemofilia">Hemofilia?</label>
            </div>
            <div className="checkbox-group">
              <input
                type="checkbox"
                id="hepatite"
                name="hepatite"
                checked={formData.outrasQuestoesMedicas.hepatite}
                onChange={handleOutrasQuestoesMedicasChange}
              />
              <label htmlFor="hepatite">Hepatite?</label>
            </div>
            <div className="checkbox-group">
              <input
                type="checkbox"
                id="anemia"
                name="anemia"
                checked={formData.outrasQuestoesMedicas.anemia}
                onChange={handleOutrasQuestoesMedicasChange}
              />
              <label htmlFor="anemia">Anemia?</label>
            </div>
            <div className="checkbox-group">
              <input
                type="checkbox"
                id="queloid"
                name="queloid"
                checked={formData.outrasQuestoesMedicas.queloid}
                onChange={handleOutrasQuestoesMedicasChange}
              />
              <label htmlFor="queloid">Quelóide?</label>
            </div>
            <div className="checkbox-group">
              <input
                type="checkbox"
                id="vitiligo"
                name="vitiligo"
                checked={formData.outrasQuestoesMedicas.vitiligo}
                onChange={handleOutrasQuestoesMedicasChange}
              />
              <label htmlFor="vitiligo">Vitiligo?</label>
            </div>
            <div className="checkbox-group">
              <input
                type="checkbox"
                id="gestante"
                name="gestante"
                checked={formData.outrasQuestoesMedicas.gestante}
                onChange={handleOutrasQuestoesMedicasChange}
              />
              <label htmlFor="gestante">Gestante?</label>
            </div>
            <div className="checkbox-group">
              <input
                type="checkbox"
                id="amamentando"
                name="amamentando"
                checked={formData.outrasQuestoesMedicas.amamentando}
                onChange={handleOutrasQuestoesMedicasChange}
              />
              <label htmlFor="amamentando">Amamentando?</label>
            </div>
          </div>
        </div>

        {/* Outro Problema */}
        <div className="form-section">
          <h2>ALGUM OUTRO PROBLEMA QUE SEJA NECESSÁRIO NOS INFORMAR?</h2>
          <div className="form-group">
            <label htmlFor="outroProblema">Especifique:</label>
            <input
              type="text"
              id="outroProblema"
              name="outroProblema"
              value={formData.outroProblema}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Tipo Sanguíneo */}
        <div className="form-section">
          <h2>TIPO SANGUÍNEO E FATOR RH:</h2>
          <div className="blood-type-grid">
            <div className="radio-group">
              <input
                type="radio"
                id="tipoSanguineo-O-"
                name="tipoSanguineo"
                value="O-"
                checked={formData.tipoSanguineo === 'O-'}
                onChange={handleChange}
              />
              <label htmlFor="tipoSanguineo-O-">O-</label>
            </div>
            <div className="radio-group">
              <input
                type="radio"
                id="tipoSanguineo-O+"
                name="tipoSanguineo"
                value="O+"
                checked={formData.tipoSanguineo === 'O+'}
                onChange={handleChange}
              />
              <label htmlFor="tipoSanguineo-O+">O+</label>
            </div>
            <div className="radio-group">
              <input
                type="radio"
                id="tipoSanguineo-A-"
                name="tipoSanguineo"
                value="A-"
                checked={formData.tipoSanguineo === 'A-'}
                onChange={handleChange}
              />
              <label htmlFor="tipoSanguineo-A-">A-</label>
            </div>
            <div className="radio-group">
              <input
                type="radio"
                id="tipoSanguineo-A+"
                name="tipoSanguineo"
                value="A+"
                checked={formData.tipoSanguineo === 'A+'}
                onChange={handleChange}
              />
              <label htmlFor="tipoSanguineo-A+">A+</label>
            </div>
            <div className="radio-group">
              <input
                type="radio"
                id="tipoSanguineo-B-"
                name="tipoSanguineo"
                value="B-"
                checked={formData.tipoSanguineo === 'B-'}
                onChange={handleChange}
              />
              <label htmlFor="tipoSanguineo-B-">B-</label>
            </div>
            <div className="radio-group">
              <input
                type="radio"
                id="tipoSanguineo-B+"
                name="tipoSanguineo"
                value="B+"
                checked={formData.tipoSanguineo === 'B+'}
                onChange={handleChange}
              />
              <label htmlFor="tipoSanguineo-B+">B+</label>
            </div>
            <div className="radio-group">
              <input
                type="radio"
                id="tipoSanguineo-AB-"
                name="tipoSanguineo"
                value="AB-"
                checked={formData.tipoSanguineo === 'AB-'}
                onChange={handleChange}
              />
              <label htmlFor="tipoSanguineo-AB-">AB-</label>
            </div>
            <div className="radio-group">
              <input
                type="radio"
                id="tipoSanguineo-AB+"
                name="tipoSanguineo"
                value="AB+"
                checked={formData.tipoSanguineo === 'AB+'}
                onChange={handleChange}
              />
              <label htmlFor="tipoSanguineo-AB+">AB+</label>
            </div>
          </div>
        </div>

        {/* Declarações */}
        <div className="form-section">
          <h2>DECLARAÇÕES</h2>
          <div className="declaracoes-group">
            <div className="checkbox-group">
              <input
                type="checkbox"
                id="veracidadeInformacoes"
                name="veracidadeInformacoes"
                checked={formData.declaracoes.veracidadeInformacoes}
                onChange={handleDeclaracoesChange}
                required
              />
              <label htmlFor="veracidadeInformacoes">
                Declaro que as informações fornecidas são verdadeiras e eximo o profissional de qualquer responsabilidade por omissões.
              </label>
            </div>
            <div className="checkbox-group">
              <input
                type="checkbox"
                id="seguirCuidados"
                name="seguirCuidados"
                checked={formData.declaracoes.seguirCuidados}
                onChange={handleDeclaracoesChange}
                required
              />
              <label htmlFor="seguirCuidados">
                Comprometo-me a seguir os cuidados pós-procedimento conforme orientações.
              </label>
            </div>
            <div className="checkbox-group">
              <input
                type="checkbox"
                id="permanenciaTatuagem"
                name="permanenciaTatuagem"
                checked={formData.declaracoes.permanenciaTatuagem}
                onChange={handleDeclaracoesChange}
                required
              />
              <label htmlFor="permanenciaTatuagem">
                Estou ciente de que a tatuagem é permanente e que a remoção completa não é garantida, mesmo com tecnologia avançada.
              </label>
            </div>
            <div className="checkbox-group">
              <input
                type="checkbox"
                id="condicoesHigienicas"
                name="condicoesHigienicas"
                checked={formData.declaracoes.condicoesHigienicas}
                onChange={handleDeclaracoesChange}
                required
              />
              <label htmlFor="condicoesHigienicas">
                Estou ciente de que o procedimento será realizado em condições seguras e higiênicas, utilizando instrumentos esterilizados e/ou descartáveis.
              </label>
            </div>
          </div>
          <div className="checkbox-group" style={{ marginTop: '20px', padding: '16px', background: '#f7fafc', borderRadius: '8px', border: '2px solid #e2e8f0' }}>
            <input
              type="checkbox"
              id="aceiteTermos"
              name="aceiteTermos"
              checked={formData.aceiteTermos}
              onChange={(e) => setFormData(prev => ({ ...prev, aceiteTermos: e.target.checked }))}
              required
            />
            <label htmlFor="aceiteTermos" style={{ fontWeight: '600', color: '#2d3748' }}>
              Aceito os termos e condições descritos acima e confirmo que todas as informações fornecidas são verdadeiras.
            </label>
          </div>
        </div>


        {/* Botões */}
        <div className="button-group">
          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <svg className="spinner" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'inline-block', marginRight: '8px' }}>
                  <circle className="spinner-circle" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
                </svg>
                <span>Salvando...</span>
              </>
            ) : (
              'Salvar Ficha'
            )}
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => handleReset(true)} disabled={isSubmitting}>
            Limpar Formulário
          </button>
        </div>
      </form>
      {/* Toast Notification */}
      {message && (
        <div className={`toast toast-${message.type} toast-show`}>
          <div className="toast-content">
            <div className="toast-icon">
              {message.type === 'success' ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="currentColor"/>
                </svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="currentColor"/>
                </svg>
              )}
            </div>
            <div className="toast-message">
              <strong>{message.type === 'success' ? 'Sucesso!' : 'Erro!'}</strong>
              <p>{message.text}</p>
            </div>
            <button 
              className="toast-close" 
              onClick={() => setMessage(null)}
              aria-label="Fechar notificação"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" fill="currentColor"/>
              </svg>
            </button>
          </div>
          <div className="toast-progress">
            <div className="toast-progress-bar"></div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="container">
        <h1>ANAMNESE TATUAGEM</h1>
        <p>Carregando...</p>
      </div>
    }>
      <HomeContent />
    </Suspense>
  )
}
