'use client'

import { useState } from 'react'
import { Anamnese } from '@/types/anamnese'
import './globals.css'

export default function Home() {
  const [formData, setFormData] = useState<Anamnese>({
    nome: '',
    dataNascimento: '',
    idade: 0,
    sexo: 'masculino',
    telefone: '',
    email: '',
    queixaPrincipal: '',
    historiaDoencaAtual: '',
    antecedentesPessoais: {
      hipertensao: false,
      diabetes: false,
      cardiopatia: false,
      outrasDoencas: '',
    },
    antecedentesFamiliares: '',
    medicacoesUso: '',
    alergias: '',
    habitosVida: {
      fuma: false,
      bebe: false,
      praticaExercicio: false,
      observacoes: '',
    },
    observacoes: '',
  })

  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Função para atualizar campos simples
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  // Função para atualizar campos aninhados (antecedentes pessoais)
  const handleAntecedentesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      antecedentesPessoais: {
        ...prev.antecedentesPessoais,
        [name]: type === 'checkbox' ? checked : value,
      },
    }))
  }

  // Função para atualizar hábitos de vida
  const handleHabitosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      habitosVida: {
        ...prev.habitosVida,
        [name]: type === 'checkbox' ? checked : value,
      },
    }))
  }

  // Função para calcular idade automaticamente
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
        idade,
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        dataNascimento: '',
        idade: 0,
      }))
    }
  }

  // Função para validar o formulário
  const validateForm = (): boolean => {
    if (!formData.nome.trim()) {
      setMessage({ type: 'error', text: 'Por favor, preencha o nome.' })
      return false
    }
    if (!formData.dataNascimento) {
      setMessage({ type: 'error', text: 'Por favor, preencha a data de nascimento.' })
      return false
    }
    if (!formData.telefone.trim()) {
      setMessage({ type: 'error', text: 'Por favor, preencha o telefone.' })
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

    try {
      // Chamada para a API route do Next.js
      const response = await fetch('/api/anamnese', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (response.ok && result.success) {
        setMessage({ type: 'success', text: result.message || 'Ficha de anamnese salva com sucesso!' })
        // Limpar formulário após sucesso (opcional)
        // handleReset()
      } else {
        setMessage({ type: 'error', text: result.message || 'Erro ao salvar a ficha. Tente novamente.' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao salvar a ficha. Tente novamente.' })
      console.error('Erro:', error)
    }
  }

  // Função para limpar o formulário
  const handleReset = () => {
    setFormData({
      nome: '',
      dataNascimento: '',
      idade: 0,
      sexo: 'masculino',
      telefone: '',
      email: '',
      queixaPrincipal: '',
      historiaDoencaAtual: '',
      antecedentesPessoais: {
        hipertensao: false,
        diabetes: false,
        cardiopatia: false,
        outrasDoencas: '',
      },
      antecedentesFamiliares: '',
      medicacoesUso: '',
      alergias: '',
      habitosVida: {
        fuma: false,
        bebe: false,
        praticaExercicio: false,
        observacoes: '',
      },
      observacoes: '',
    })
    setMessage(null)
  }

  return (
    <div className="container">
      <h1>Ficha de Anamnese</h1>

      {message && (
        <div className={message.type === 'success' ? 'success-message' : 'error-message'}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Dados Pessoais */}
        <div className="form-section">
          <h2>Dados Pessoais</h2>
          
          <div className="form-group">
            <label htmlFor="nome">Nome Completo *</label>
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
            <label htmlFor="dataNascimento">Data de Nascimento *</label>
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
              type="number"
              id="idade"
              name="idade"
              value={formData.idade}
              readOnly
              style={{ backgroundColor: '#f5f5f5' }}
            />
          </div>

          <div className="form-group">
            <label htmlFor="sexo">Sexo</label>
            <select
              id="sexo"
              name="sexo"
              value={formData.sexo}
              onChange={handleChange}
            >
              <option value="masculino">Masculino</option>
              <option value="feminino">Feminino</option>
              <option value="outro">Outro</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="telefone">Telefone *</label>
            <input
              type="tel"
              id="telefone"
              name="telefone"
              value={formData.telefone}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">E-mail</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Queixa Principal */}
        <div className="form-section">
          <h2>Queixa Principal</h2>
          <div className="form-group">
            <label htmlFor="queixaPrincipal">Descreva a queixa principal</label>
            <textarea
              id="queixaPrincipal"
              name="queixaPrincipal"
              value={formData.queixaPrincipal}
              onChange={handleChange}
              placeholder="Ex: Dor de cabeça há 3 dias..."
            />
          </div>
        </div>

        {/* História da Doença Atual */}
        <div className="form-section">
          <h2>História da Doença Atual</h2>
          <div className="form-group">
            <label htmlFor="historiaDoencaAtual">Descreva a história da doença atual</label>
            <textarea
              id="historiaDoencaAtual"
              name="historiaDoencaAtual"
              value={formData.historiaDoencaAtual}
              onChange={handleChange}
              placeholder="Descreva como a doença começou, evolução, sintomas..."
            />
          </div>
        </div>

        {/* Antecedentes Pessoais */}
        <div className="form-section">
          <h2>Antecedentes Pessoais</h2>
          
          <div className="checkbox-group">
            <input
              type="checkbox"
              id="hipertensao"
              name="hipertensao"
              checked={formData.antecedentesPessoais.hipertensao}
              onChange={handleAntecedentesChange}
            />
            <label htmlFor="hipertensao">Hipertensão</label>
          </div>

          <div className="checkbox-group">
            <input
              type="checkbox"
              id="diabetes"
              name="diabetes"
              checked={formData.antecedentesPessoais.diabetes}
              onChange={handleAntecedentesChange}
            />
            <label htmlFor="diabetes">Diabetes</label>
          </div>

          <div className="checkbox-group">
            <input
              type="checkbox"
              id="cardiopatia"
              name="cardiopatia"
              checked={formData.antecedentesPessoais.cardiopatia}
              onChange={handleAntecedentesChange}
            />
            <label htmlFor="cardiopatia">Cardiopatia</label>
          </div>

          <div className="form-group" style={{ marginTop: '15px' }}>
            <label htmlFor="outrasDoencas">Outras Doenças</label>
            <input
              type="text"
              id="outrasDoencas"
              name="outrasDoencas"
              value={formData.antecedentesPessoais.outrasDoencas}
              onChange={handleAntecedentesChange}
              placeholder="Descreva outras doenças..."
            />
          </div>
        </div>

        {/* Antecedentes Familiares */}
        <div className="form-section">
          <h2>Antecedentes Familiares</h2>
          <div className="form-group">
            <label htmlFor="antecedentesFamiliares">Descreva os antecedentes familiares</label>
            <textarea
              id="antecedentesFamiliares"
              name="antecedentesFamiliares"
              value={formData.antecedentesFamiliares}
              onChange={handleChange}
              placeholder="Doenças na família, histórico médico familiar..."
            />
          </div>
        </div>

        {/* Medicações em Uso */}
        <div className="form-section">
          <h2>Medicações em Uso</h2>
          <div className="form-group">
            <label htmlFor="medicacoesUso">Liste as medicações em uso</label>
            <textarea
              id="medicacoesUso"
              name="medicacoesUso"
              value={formData.medicacoesUso}
              onChange={handleChange}
              placeholder="Ex: Losartana 50mg 1x ao dia..."
            />
          </div>
        </div>

        {/* Alergias */}
        <div className="form-section">
          <h2>Alergias</h2>
          <div className="form-group">
            <label htmlFor="alergias">Descreva alergias conhecidas</label>
            <textarea
              id="alergias"
              name="alergias"
              value={formData.alergias}
              onChange={handleChange}
              placeholder="Ex: Penicilina, dipirona..."
            />
          </div>
        </div>

        {/* Hábitos de Vida */}
        <div className="form-section">
          <h2>Hábitos de Vida</h2>
          
          <div className="checkbox-group">
            <input
              type="checkbox"
              id="fuma"
              name="fuma"
              checked={formData.habitosVida.fuma}
              onChange={handleHabitosChange}
            />
            <label htmlFor="fuma">Fuma</label>
          </div>

          <div className="checkbox-group">
            <input
              type="checkbox"
              id="bebe"
              name="bebe"
              checked={formData.habitosVida.bebe}
              onChange={handleHabitosChange}
            />
            <label htmlFor="bebe">Consome bebidas alcoólicas</label>
          </div>

          <div className="checkbox-group">
            <input
              type="checkbox"
              id="praticaExercicio"
              name="praticaExercicio"
              checked={formData.habitosVida.praticaExercicio}
              onChange={handleHabitosChange}
            />
            <label htmlFor="praticaExercicio">Pratica exercícios físicos</label>
          </div>

          <div className="form-group" style={{ marginTop: '15px' }}>
            <label htmlFor="observacoesHabitos">Observações sobre hábitos</label>
            <textarea
              id="observacoesHabitos"
              name="observacoes"
              value={formData.habitosVida.observacoes}
              onChange={handleHabitosChange}
              placeholder="Observações adicionais sobre hábitos de vida..."
            />
          </div>
        </div>

        {/* Observações Adicionais */}
        <div className="form-section">
          <h2>Observações Adicionais</h2>
          <div className="form-group">
            <label htmlFor="observacoes">Observações gerais</label>
            <textarea
              id="observacoes"
              name="observacoes"
              value={formData.observacoes}
              onChange={handleChange}
              placeholder="Qualquer informação adicional relevante..."
            />
          </div>
        </div>

        {/* Botões */}
        <div className="button-group">
          <button type="submit" className="btn btn-primary">
            Salvar Ficha
          </button>
          <button type="button" className="btn btn-secondary" onClick={handleReset}>
            Limpar Formulário
          </button>
        </div>
      </form>
    </div>
  )
}
