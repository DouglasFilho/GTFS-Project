GTFS Viewer (Vue 3 + Quasar)

O que é
- SPA front‑only que lê um GTFS.zip (BHTrans) no navegador, processa em Web Worker e mostra: mapa (Leaflet), tabela de linhas (Quasar) e gráfico de frequência (Chart.js).
- Ao abrir, a app processa automaticamente `public/GTFSBHTRANS.zip` (sem upload).

Como rodar
- Requisitos: Node 18+ e npm
- Passos:
  - `cd gtfs-vue-quasar`
  - `npm install`
  - `npm run dev`
  - Abra `http://localhost:5173`

Como usar
- A app carrega o ZIP embutido e vai para a página do mapa.
- Em “Linhas”, pesquise e clique em uma linha para filtrar o mapa e o gráfico só para essa rota.
- No mapa, o botão “Limpar seleção” volta a mostrar tudo.

Trocar o dataset (opcional)
- Substitua `gtfs-vue-quasar/public/GTFSBHTRANS.zip` por outro GTFS com o mesmo nome.

Tecnologias
- Vue 3 + Vite + Quasar + Pinia + Vue Router
- Leaflet, JSZip, PapaParse, Chart.js, TypeScript

Scripts úteis
- `npm run dev` — servidor de desenvolvimento
- `npm run build` — build de produção
- `npm run preview` — serve a build localmente
- `npm run test:unit` — testes unitários (Vitest)
- `npm run test:e2e` — smoke test (Playwright)

Notas rápidas de performance
- Parsing em Worker com transferência zero‑copy; marcadores limitados a 2.000 paradas inicialmente.
- Agregações de frequência por hora calculadas no Worker (global e por rota); amostra de até 50k `stop_times` para UI.
