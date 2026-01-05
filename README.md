# Ficha de Anamnese - Next.js + TypeScript

Sistema simples de cadastro de fichas de anamnese desenvolvido com Next.js e TypeScript.

## 🚀 Como começar

### 1. Instalar as dependências

```bash
npm install
```

### 2. Executar o servidor de desenvolvimento

```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no seu navegador para ver o resultado.

## 📁 Estrutura do Projeto

```
ficha-anamnese/
├── app/
│   ├── layout.tsx          # Layout principal da aplicação
│   ├── page.tsx            # Página principal com o formulário
│   └── globals.css         # Estilos globais
├── types/
│   └── anamnese.ts         # Tipos TypeScript para a anamnese
├── package.json
├── tsconfig.json
└── next.config.js
```

## 🎯 Funcionalidades

- ✅ Formulário completo de anamnese
- ✅ Validação de campos obrigatórios
- ✅ Cálculo automático de idade
- ✅ Interface responsiva
- ✅ TypeScript para type safety
- ✅ Componentes React funcionais com hooks

## 📝 Próximos Passos

Para conectar com o backend:

1. Criar uma API route no Next.js (`app/api/anamnese/route.ts`)
2. Ou criar um backend separado com Node.js/Express
3. Atualizar a função `handleSubmit` em `app/page.tsx` para fazer a chamada real à API

## 🛠️ Tecnologias Utilizadas

- **Next.js 14** - Framework React
- **TypeScript** - Tipagem estática
- **React 18** - Biblioteca UI
- **CSS** - Estilização (sem dependências externas)

## 📚 Conceitos TypeScript/React Aprendidos

- **Interfaces TypeScript**: Definição de tipos para os dados
- **Hooks React**: `useState` para gerenciar estado
- **Event Handlers**: Manipulação de eventos de formulário
- **Type Safety**: TypeScript garantindo tipos corretos
- **Componentes Funcionais**: Uso de componentes modernos do React
