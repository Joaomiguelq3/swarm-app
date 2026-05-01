# CLAUDE.md - Regras do Projeto SWARM

## SEGURANCA

- NUNCA exibir API keys ou tokens no output.
- Credenciais sempre em `.env` e nunca commitadas.
- Nao habilitar acesso Node direto no renderer.
- Toda comunicacao main-renderer deve passar por `preload.js`.

## CODIGO

- JavaScript puro, sem TypeScript.
- CSS puro, sem framework visual.
- Comentarios em portugues apenas quando ajudarem a entender blocos nao obvios.
- Funcoes com menos de 100 linhas sempre que pratico.
- Sempre usar `try/catch` em operacoes assincronas com filesystem, processos e IPC.

## ARQUITETURA

- `main.js` = janela Electron, ciclo de vida da app e handlers IPC.
- `preload.js` = ponte segura entre renderer e main.
- `src/` = logica de negocio.
- `renderer/` = UI.
- `src/runtimes.js` = configuracao central dos runtimes.
- `src/swarm.js` = orquestrador agnostico ao runtime.

## RUNTIMES

- Claude Code: `claude --dangerously-skip-permissions`, regras em `CLAUDE.md`, skills em `.claude/skills/`.
- Codex: `codex --approval-mode full-auto`, regras em `AGENTS.md`, skills em `.codex/skills/`.
- Trocar runtime deve matar processos ativos antes de reiniciar.
- Criar o arquivo de regras do novo runtime sem deletar o antigo.

## GIT

- Commits atomicos por feature.
- Mensagens em portugues.
- Subagentes podem usar `--no-verify` se necessario.

## GSD

- No Claude Code, use `/gsd-discuss-phase 1`.
- No Codex, use `$gsd-discuss-phase 1`.
