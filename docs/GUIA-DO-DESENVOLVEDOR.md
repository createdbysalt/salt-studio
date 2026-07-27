# Guia do Desenvolvedor

> **English Version:** [DEVELOPER-GUIDE.md](./DEVELOPER-GUIDE.md)

Este guia cobre tudo que você precisa saber para trabalhar em projetos de clientes da Salt Studio construídos com este template.

## Início Rápido

```bash
# Clonar e instalar
git clone <url-do-repo>
cd <nome-do-projeto>
npm install

# Configurar ambiente
cp .env.example .env.local
# Preencha as credenciais do Sanity (peça ao líder técnico)

# Iniciar desenvolvimento
npm run dev
# Abre em http://localhost:4000
```

## Stack Tecnológica

| Tecnologia   | Versão | Propósito                              |
| ------------ | ------ | -------------------------------------- |
| Next.js      | 16     | Framework React com App Router         |
| React        | 19     | Biblioteca UI (React Compiler ativado) |
| Sanity       | 5      | CMS headless em `/admin`               |
| Tailwind CSS | 4      | CSS utility-first                      |
| TypeScript   | 5.9    | Tipagem segura                         |

## Estrutura do Projeto

```
├── app/                    # Next.js App Router
│   ├── (personal)/         # Rotas do site público
│   │   ├── page.tsx        # Página inicial
│   │   ├── [slug]/         # Páginas dinâmicas
│   │   └── layout.tsx      # Layout do site (navbar, footer)
│   └── admin/              # Sanity Studio
├── components/             # Componentes React (estrutura plana)
├── sanity/
│   ├── schemas/            # Schemas de conteúdo
│   │   ├── documents/      # Page, Project, etc.
│   │   ├── singletons/     # Home, Settings
│   │   └── objects/        # Hero, CTA, FAQ, etc.
│   └── lib/                # Utilitários do Sanity
├── lib/
│   ├── analytics/          # GTM, consentimento, tracking
│   └── seo/                # Dados estruturados, sitemap
└── docs/                   # Documentação para desenvolvedores
```

## Convenções Principais

### 1. Server Components por Padrão

Todo componente é um server component a menos que precise de interatividade no cliente:

```tsx
import {useState} from 'react'

// Server component (padrão) - não precisa de diretiva
export function Header({title}: {title: string}) {
  return <h1>{title}</h1>
}

// Client component - apenas quando necessário
;('use client')

export function Counter() {
  const [count, setCount] = useState(0)
  return <button onClick={() => setCount(count + 1)}>{count}</button>
}
```

### 2. Busca de Dados do Sanity

Sempre use `sanityFetch` de `@/sanity/lib/live`, nunca `client.fetch`:

```tsx
import {sanityFetch} from '@/sanity/lib/live'
import {homePageQuery} from '@/sanity/lib/queries'

export default async function HomePage() {
  const {data} = await sanityFetch({query: homePageQuery})
  return <div>{data.title}</div>
}
```

### 3. Estilização com Tailwind

Use classes inline, template literals para condicionais. Sem `cn()` ou `clsx`:

```tsx
// Bom
<div className="flex items-center gap-4">
<div className={`text-lg ${isActive ? 'font-bold' : 'font-normal'}`}>

// Evite
<div className={cn('flex', isActive && 'font-bold')}>
```

### 4. Tokens de Design

Use variáveis CSS para cores, não classes de cor do Tailwind:

```tsx
// Bom - usa tokens de design
<button style={{backgroundColor: 'var(--color-primary)'}}>

// Evite - cores hardcoded
<button className="bg-blue-600">
```

## Tarefas Comuns

### Adicionando uma Nova Página

1. Criar arquivo: `app/(personal)/sua-pagina/page.tsx`
2. Buscar dados com `sanityFetch`
3. Adicionar em `sanity/plugins/resolve.ts` para a ferramenta de Apresentação

### Adicionando um Novo Tipo de Bloco

1. Criar schema: `sanity/schemas/objects/seu-bloco.ts`
2. Registrar em `sanity.config.ts`
3. Adicionar handler em `components/CustomPortableText.tsx`
4. Criar componente: `components/SeuBloco.tsx`
5. Executar `npm run typegen`

### Modificando um Schema

1. Editar o arquivo de schema em `sanity/schemas/`
2. Executar `npm run typegen` para regenerar tipos
3. Atualizar componentes que usam os campos alterados
4. Testar no Sanity Studio

## Fluxo de Git

### Nomeação de Branches

```
feat/secao-hero        # Nova funcionalidade
fix/bug-formulario     # Correção de bug
docs/guia-setup        # Documentação
chore/atualizar-deps   # Manutenção
```

### Mensagens de Commit

Usamos [Conventional Commits](https://www.conventionalcommits.org/):

```bash
feat(hero): adicionar suporte a imagem de fundo
fix(contact): resolver bug de validação de email
docs(readme): atualizar instruções de setup
style(navbar): ajustar espaçamento mobile
refactor(analytics): simplificar lógica de consentimento
chore(deps): atualizar dependências
```

**Tipos permitidos:**

- `feat` - Nova funcionalidade
- `fix` - Correção de bug
- `docs` - Apenas documentação
- `style` - Formatação, sem mudança de código
- `refactor` - Reestruturação de código
- `perf` - Melhoria de performance
- `test` - Adição de testes
- `chore` - Tarefas de manutenção

### Processo de Pull Request

1. Criar branch a partir de `main`
2. Fazer alterações, commit frequente
3. Push e abrir PR usando o template
4. Solicitar revisão do líder técnico
5. Resolver feedback
6. Merge quando aprovado

## Resolução de Problemas

### Tipos estão desatualizados

```bash
npm run typegen
```

### Porta 4000 está em uso

```bash
lsof -ti:4000 | xargs kill -9
npm run dev
```

### Sanity Studio não carrega

Verifique se `.env.local` tem corretos:

- `NEXT_PUBLIC_SANITY_PROJECT_ID`
- `NEXT_PUBLIC_SANITY_DATASET`
- `SANITY_API_READ_TOKEN`

### Alterações não refletem

1. Hard refresh: `Cmd+Shift+R`
2. Limpar cache do Next.js: `rm -rf .next`
3. Reiniciar servidor de desenvolvimento

## Comandos Úteis

| Comando              | Descrição                             |
| -------------------- | ------------------------------------- |
| `npm run dev`        | Inicia servidor de desenvolvimento    |
| `npm run build`      | Build de produção                     |
| `npm run typegen`    | Regenera tipos do Sanity              |
| `npm run type-check` | Verifica tipos TypeScript             |
| `npm run lint`       | Executa ESLint                        |
| `npm run lint:fix`   | Corrige erros de lint automaticamente |

## Recursos

- [Documentação Next.js 16](https://nextjs.org/docs)
- [Documentação Sanity](https://www.sanity.io/docs)
- [Tailwind CSS v4](https://tailwindcss.com/docs)
- [CLAUDE.md do Projeto](../CLAUDE.md) - Documentação completa do código

## Precisa de Ajuda?

- Consulte os arquivos `CLAUDE.md` em cada pasta para convenções detalhadas
- Pergunte no canal do Slack da equipe
- Marque `@tech-lead` para questões de arquitetura
