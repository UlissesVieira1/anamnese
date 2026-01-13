# 🚀 Guia de Deploy - Ficha Anamnese

Este guia explica como fazer o deploy do projeto na Vercel usando Supabase como banco de dados.

## 📋 Pré-requisitos

1. Conta no [Supabase](https://supabase.com)
2. Conta no [Vercel](https://vercel.com)
3. Tabela `ficha_anamnese` criada no Supabase

## 🔧 Configuração do Supabase

### 1. Criar/Verificar a Tabela

Certifique-se de que sua tabela `ficha_anamnese` no Supabase tenha a seguinte estrutura:

```sql
CREATE TABLE ficha_anamnese (
  id BIGSERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  cpf VARCHAR(14) NOT NULL UNIQUE,
  dados_cliente JSONB,
  avaliacao JSONB,
  termos CHAR(1) DEFAULT 'N',
  data_preenchimento_ficha TIMESTAMP DEFAULT NOW(),
  info_tattoo JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 2. Obter Credenciais do Supabase

1. Acesse o [painel do Supabase](https://app.supabase.com)
2. Selecione seu projeto
3. Vá em **Settings** > **API**
4. Copie:
   - **Project URL** (será `NEXT_PUBLIC_SUPABASE_URL`)
   - **anon/public key** (será `NEXT_PUBLIC_SUPABASE_ANON_KEY`)

## 🌐 Deploy na Vercel

### 1. Preparar o Projeto Localmente

1. Crie um arquivo `.env.local` na raiz do projeto com:

```env
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon_do_supabase
```

2. Teste localmente:
```bash
npm run dev
```

### 2. Fazer Deploy na Vercel

#### Opção A: Via Interface Web (Recomendado)

1. Acesse [vercel.com](https://vercel.com) e faça login
2. Clique em **Add New Project**
3. Conecte seu repositório Git (GitHub, GitLab, Bitbucket)
4. Configure o projeto:
   - **Framework Preset**: Next.js (detectado automaticamente)
   - **Root Directory**: `.` (raiz do projeto)
   - **Build Command**: `npm run build` (padrão)
   - **Output Directory**: `.next` (padrão)

5. **Adicione as Variáveis de Ambiente**:
   - `NEXT_PUBLIC_SUPABASE_URL` = sua URL do Supabase
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = sua chave anônima do Supabase

6. Clique em **Deploy**

#### Opção B: Via CLI

1. Instale a CLI da Vercel:
```bash
npm i -g vercel
```

2. Faça login:
```bash
vercel login
```

3. No diretório do projeto, execute:
```bash
vercel
```

4. Siga as instruções e adicione as variáveis de ambiente quando solicitado

### 3. Configurar Variáveis de Ambiente na Vercel

Se você já fez o deploy, pode adicionar/editar variáveis de ambiente:

1. Acesse seu projeto na Vercel
2. Vá em **Settings** > **Environment Variables**
3. Adicione:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Clique em **Save**
5. Faça um novo deploy (ou aguarde o redeploy automático)

## 🔒 Configuração de Segurança no Supabase

### Habilitar Row Level Security (RLS)

Para produção, é recomendado configurar RLS no Supabase:

1. No Supabase, vá em **Authentication** > **Policies**
2. Para a tabela `ficha_anamnese`, você pode:
   - **Opção 1**: Desabilitar RLS se a aplicação for pública (não recomendado para dados sensíveis)
   - **Opção 2**: Criar políticas específicas para inserção e leitura

Exemplo de política para permitir inserção pública (apenas para este caso específico):

```sql
-- Permitir inserção pública
CREATE POLICY "Permitir inserção pública" ON ficha_anamnese
FOR INSERT
TO anon
WITH CHECK (true);

-- Permitir leitura pública (opcional, ajuste conforme necessário)
CREATE POLICY "Permitir leitura pública" ON ficha_anamnese
FOR SELECT
TO anon
USING (true);
```

## ✅ Verificação Pós-Deploy

1. Acesse a URL fornecida pela Vercel
2. Teste o formulário de anamnese
3. Verifique no Supabase se os dados estão sendo salvos corretamente

## 🐛 Troubleshooting

### Erro: "Missing Supabase environment variables"
- Verifique se as variáveis de ambiente estão configuradas na Vercel
- Certifique-se de que os nomes estão corretos: `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Erro: "relation does not exist"
- Verifique se a tabela `ficha_anamnese` existe no Supabase
- Verifique se o nome da tabela está correto (case-sensitive)

### Erro: "permission denied"
- Verifique as políticas RLS no Supabase
- Certifique-se de que as políticas permitem INSERT e SELECT para usuários anônimos

## 📝 Notas Importantes

- O backend Express (`backend/`) não é mais necessário, pois as rotas foram migradas para Next.js API Routes
- Todas as requisições agora são feitas para `/api/*` ao invés de `http://localhost:3001/*`
- O projeto está totalmente serverless e pronto para produção na Vercel
