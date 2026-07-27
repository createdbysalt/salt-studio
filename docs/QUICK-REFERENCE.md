# Quick Reference / Referência Rápida

## Commands / Comandos

| Command              | Description             | Descrição                 |
| -------------------- | ----------------------- | ------------------------- |
| `npm run dev`        | Start dev server        | Iniciar servidor de dev   |
| `npm run build`      | Production build        | Build de produção         |
| `npm run typegen`    | Regenerate Sanity types | Regenerar tipos do Sanity |
| `npm run type-check` | TypeScript check        | Verificar TypeScript      |
| `npm run lint`       | Run ESLint              | Executar ESLint           |
| `npm run lint:fix`   | Fix lint + format       | Corrigir lint + formatar  |

## Commit Types / Tipos de Commit

| Type       | When to use      | Quando usar         |
| ---------- | ---------------- | ------------------- |
| `feat`     | New feature      | Nova funcionalidade |
| `fix`      | Bug fix          | Correção de bug     |
| `docs`     | Documentation    | Documentação        |
| `style`    | Formatting only  | Apenas formatação   |
| `refactor` | Code restructure | Reestruturação      |
| `perf`     | Performance      | Performance         |
| `test`     | Adding tests     | Adição de testes    |
| `chore`    | Maintenance      | Manutenção          |

## Examples / Exemplos

```bash
feat(hero): add video background support
fix(form): resolve validation on mobile
docs(readme): add deployment instructions
chore(deps): update next to 16.3
```

## Key Files / Arquivos Chave

| File               | Purpose          | Propósito             |
| ------------------ | ---------------- | --------------------- |
| `CLAUDE.md`        | AI instructions  | Instruções para IA    |
| `sanity.config.ts` | Sanity setup     | Configuração Sanity   |
| `app/globals.css`  | Design tokens    | Tokens de design      |
| `.env.local`       | Environment vars | Variáveis de ambiente |

## Shortcuts / Atalhos

| Trigger    | Action              | Ação                    |
| ---------- | ------------------- | ----------------------- |
| `qplan`    | Plan before coding  | Planejar antes de codar |
| `qcode`    | Implement plan      | Implementar plano       |
| `qcheck`   | Review changes      | Revisar mudanças        |
| `qfix`     | Debug error         | Debugar erro            |
| `qrestart` | Kill port + restart | Matar porta + reiniciar |
| `qtypes`   | Regenerate types    | Regenerar tipos         |

## Emergency / Emergência

```bash
# Port 4000 stuck / Porta 4000 travada
lsof -ti:4000 | xargs kill -9

# Clear cache / Limpar cache
rm -rf .next

# Reset types / Resetar tipos
npm run typegen

# Full reset / Reset completo
rm -rf .next node_modules && npm install
```
