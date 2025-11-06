GTFS Viewer (Vue 3 + Quasar)

Visão Geral
- SPA front‑only que lê um GTFS.zip da BHTrans no navegador, processa em Web Worker e exibe: mapa (Leaflet), tabela de linhas (Quasar) e gráfico de frequência (Chart.js).
- Ao abrir, a aplicação processa automaticamente `public/GTFSBHTRANS.zip` (não é necessário upload).

Como Rodar
- Importante: entre na pasta do projeto antes de rodar os comandos.
- Requisitos: Node 18+ e npm.
- Passos:
  - `cd gtfs-vue-quasar`
  - `npm install`
  - `npm run dev`
  - Acesse `http://localhost:5173`

Como Usar
- A aplicação carrega o ZIP embutido e navega para o mapa.
- Em “Linhas”, pesquise e clique em uma linha para filtrar o mapa e o gráfico somente para essa rota.
- No mapa, use “Limpar seleção” para voltar a ver tudo.

Trocar o Dataset (opcional)
- Substitua `gtfs-vue-quasar/public/GTFSBHTRANS.zip` por outro arquivo GTFS com o mesmo nome.

Tecnologias
- Vue 3 + Vite + Quasar + Pinia + Vue Router
- Leaflet, JSZip, PapaParse, Chart.js, TypeScript

Scripts
- `npm run dev` — servidor de desenvolvimento
- `npm run build` — build de produção
- `npm run preview` — serve a build localmente
- `npm run test:unit` — testes unitários (Vitest)
- `npm run test:e2e` — smoke test (Playwright)

Performance
- Parsing em Worker com transferência zero‑copy; renderização inicial limita a 2.000 paradas.
- Frequência por hora é agregada no Worker (global e por rota); a UI usa amostra de até 50k `stop_times`.

Autoria e Contexto
- Trabalho de faculdade para a disciplina de IA Aplicada em Negócios.
- Projeto gerado 100% por IA (Codex CLI). O arquivo com as tarefas que guiaram o desenvolvimento está na raiz: `codex_prompt_pack_gtfs_front_only_vue_3_quasar.md`.
