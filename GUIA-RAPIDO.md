# Guia Rápido - Conceitos TypeScript/React/Next.js

## 📚 Conceitos Importantes para quem vem do PHP

### 1. **TypeScript - Tipos e Interfaces**

No PHP você usa arrays associativos, no TypeScript usamos **interfaces**:

```typescript
// TypeScript (types/anamnese.ts)
export interface Anamnese {
  nome: string;
  idade: number;
  sexo: 'masculino' | 'feminino' | 'outro';
}

// Equivalente em PHP seria:
// $anamnese = [
//   'nome' => 'string',
//   'idade' => 'int',
//   'sexo' => 'masculino|feminino|outro'
// ];
```

### 2. **React Hooks - useState**

No PHP você usa variáveis normais, no React usamos **estado**:

```typescript
// React com useState
const [formData, setFormData] = useState<Anamnese>({
  nome: '',
  idade: 0
})

// Para atualizar:
setFormData({ ...formData, nome: 'João' })

// Equivalente em PHP seria:
// $formData = ['nome' => '', 'idade' => 0];
// $formData['nome'] = 'João';
```

### 3. **Event Handlers**

No PHP você processa formulários no servidor, no React fazemos no cliente:

```typescript
// React
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const { name, value } = e.target
  setFormData(prev => ({ ...prev, [name]: value }))
}

// No HTML:
<input onChange={handleChange} />

// Equivalente em PHP seria:
// if ($_POST['nome']) { $formData['nome'] = $_POST['nome']; }
```

### 4. **Async/Await - Requisições**

No PHP você usa cURL ou file_get_contents, no JavaScript usamos **fetch**:

```typescript
// JavaScript/TypeScript
const response = await fetch('/api/anamnese', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(formData)
})
const result = await response.json()

// Equivalente em PHP seria:
// $ch = curl_init('/api/anamnese');
// curl_setopt($ch, CURLOPT_POST, true);
// curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($formData));
// $result = json_decode(curl_exec($ch));
```

### 5. **Next.js - API Routes**

No PHP você cria arquivos `.php`, no Next.js criamos **API Routes**:

```typescript
// app/api/anamnese/route.ts
export async function POST(request: NextRequest) {
  const data = await request.json()
  // Salvar no banco aqui
  return NextResponse.json({ success: true })
}

// Equivalente em PHP seria:
// anamnese.php
// if ($_SERVER['REQUEST_METHOD'] === 'POST') {
//   $data = json_decode(file_get_contents('php://input'));
//   // Salvar no banco
//   echo json_encode(['success' => true]);
// }
```

## 🔄 Diferenças Principais

| PHP | TypeScript/React |
|-----|------------------|
| `$_POST['campo']` | `formData.campo` |
| `$array['chave']` | `object.chave` |
| `array_merge()` | `{ ...obj1, ...obj2 }` |
| `isset($var)` | `var !== undefined` |
| `empty($var)` | `!var` ou `var === ''` |
| `json_encode()` | `JSON.stringify()` |
| `json_decode()` | `JSON.parse()` |

## 🎯 Próximos Passos para Aprender

1. **Estudar React Hooks**: useState, useEffect, useContext
2. **Aprender TypeScript**: tipos, interfaces, generics
3. **Next.js**: App Router, Server Components, API Routes
4. **Banco de Dados**: Prisma ORM (similar ao Eloquent do Laravel)

## 💡 Dicas

- Use `console.log()` para debugar (equivalente ao `var_dump()` do PHP)
- TypeScript te ajuda a evitar erros antes de executar
- React atualiza a UI automaticamente quando o estado muda
- Next.js combina frontend e backend no mesmo projeto
