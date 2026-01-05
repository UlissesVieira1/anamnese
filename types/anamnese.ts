// Tipos TypeScript para a ficha de anamnese
export interface Anamnese {
  // Dados pessoais
  nome: string;
  dataNascimento: string;
  idade: number;
  sexo: 'masculino' | 'feminino' | 'outro';
  telefone: string;
  email: string;
  
  // Queixa principal
  queixaPrincipal: string;
  
  // História da doença atual
  historiaDoencaAtual: string;
  
  // Antecedentes pessoais
  antecedentesPessoais: {
    hipertensao: boolean;
    diabetes: boolean;
    cardiopatia: boolean;
    outrasDoencas: string;
  };
  
  // Antecedentes familiares
  antecedentesFamiliares: string;
  
  // Medicações em uso
  medicacoesUso: string;
  
  // Alergias
  alergias: string;
  
  // Hábitos de vida
  habitosVida: {
    fuma: boolean;
    bebe: boolean;
    praticaExercicio: boolean;
    observacoes: string;
  };
  
  // Observações adicionais
  observacoes: string;
}
