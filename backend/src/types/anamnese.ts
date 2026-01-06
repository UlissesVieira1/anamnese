// Tipos TypeScript para a ficha de anamnese de Tatuagem
export interface AnamneseTipagem {
  // Dados pessoais
  nome: string;
  endereco: string;
  rg: string;
  cpf: string;
  dataNascimento: string;
  idade: string;
  comoNosConheceu: {
    instagram: boolean;
    facebook: boolean;
    outro: boolean;
    indicacao: string; // texto livre para indicação
  };
  telefone: string;
  celular: string;
  email: string;

  // Avaliação médica (Sim/Não + especificação)
  avaliacaoMedica: {
    tratamentoMedico: { sim: boolean; nao: boolean; especifique: string };
    diabetes: { sim: boolean; nao: boolean; especifique: string };
    cirurgiaRecente: { sim: boolean; nao: boolean; especifique: string };
    alergia: { sim: boolean; nao: boolean; especifique: string };
    problemaPeleCicatrizacao: { sim: boolean; nao: boolean; especifique: string };
    depressaoPanicoAnsiedade: { sim: boolean; nao: boolean; especifique: string };
    doencaInfectocontagiosa: { sim: boolean; nao: boolean; especifique: string };
    historicoConvulsaoEpilepsia: { sim: boolean; nao: boolean; especifique: string };
  };

  // Outras questões médicas (Sim/Não)
  outrasQuestoesMedicas: {
    cancer: boolean;
    disturbioCirculatorio: boolean;
    usoDrogas: boolean;
    efeitoAlcool: boolean;
    dormiuUltimaNoite: boolean;
    emJejum: boolean;
    cardiopatia: boolean;
    hipertensao: boolean;
    hipotensao: boolean;
    marcapasso: boolean;
    hemofilia: boolean;
    hepatite: boolean;
    anemia: boolean;
    queloid: boolean;
    vitiligo: boolean;
    gestante: boolean;
    amamentando: boolean;
  };

  // Outro problema
  outroProblema: string;

  // Tipo sanguíneo
  tipoSanguineo: 'O-' | 'O+' | 'A-' | 'A+' | 'B-' | 'B+' | 'AB-' | 'AB+' | '';

  // Declarações de consentimento
  declaracoes: {
    veracidadeInformacoes: boolean;
    seguirCuidados: boolean;
    permanenciaTatuagem: boolean;
    condicoesHigienicas: boolean;
  };

  // Aceite de termos
  aceiteTermos: boolean;

  // Detalhes do procedimento (preenchido pelo profissional)
  procedimento: {
    local: string;
    estilo: string;
    observacoes: string;
    profissional: string;
    data: string;
    valor: string;
  };
}
