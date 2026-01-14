# 🔐 Variáveis de Ambiente Necessárias

Para o projeto funcionar, você precisa criar um arquivo `.env.local` na raiz do projeto com as seguintes variáveis:

```env
# Supabase Configuration
# Obtenha essas informações no painel do Supabase: https://app.supabase.com
# Vá em Settings > API

# URL do seu projeto Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url

# Chave anônima (anon/public key) do Supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Senha para acesso profissional (opcional - padrão: profissional123)
# Se não definir, a senha padrão será "profissional123"
SENHA_PROFISSIONAL=profissional123
```

## Como obter essas informações:

1. Acesse [app.supabase.com](https://app.supabase.com)
2. Selecione seu projeto
3. Vá em **Settings** > **API**
4. Copie:
   - **Project URL** → use como `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → use como `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Para Deploy na Vercel:

Adicione essas mesmas variáveis nas configurações do projeto na Vercel:
1. Acesse seu projeto na Vercel
2. Vá em **Settings** > **Environment Variables**
3. Adicione cada variável com seu respectivo valor

## 🔒 Acesso Profissional

O sistema possui uma área restrita para profissionais buscar clientes:

- **URL de acesso**: `/login-profissional`
- **Senha padrão**: `profissional123` (pode ser alterada via variável `SENHA_PROFISSIONAL`)
- **Funcionalidade**: Busca de clientes com autocomplete por nome ou CPF

**Importante**: Em produção, considere implementar um sistema de autenticação mais robusto (JWT, OAuth, etc.)
