# Codex Prompt Pack – GTFS Front‑Only (Vue 3 + Quasar)

> **Objetivo para o agente (Codex)**: Criar uma **SPA** que lê **GTFS estático (.zip)** no **navegador** (sem backend), faz parsing em **Web Worker**, exibe **mapa** com paradas/rotas (Leaflet), **tabela** de rotas (Quasar) e **gráfico** de frequência (Chart.js). Entregue também README e testes básicos.

---

## 0) Regras e restrições (siga à risca)
- **Arquitetura**: *front-only*; não criar backend. As fontes de dados são arquivos **GTFS.zip** carregados pelo usuário.
- **Tech stack**: Vue 3 + Vite + **Quasar** UI + **Pinia** + **Vue Router** + **Leaflet** (mapa) + **JSZip** (descompactar) + **PapaParse** (CSV) + **Chart.js** (gráficos) + TypeScript.
- **Performance**: parsing em **Web Worker**; limitar renderização inicial (ex.: até 2.000 paradas).
- **DX**: gerar **README** com setup, e **scripts** `dev`, `build`, `preview`.
- **Testes**: incluir **Vitest** (unit) e **Playwright** (e2e) mínimos.
- **Qualidade**: usar ESLint/Prettier padrões do Vite, se possível.

---

## 1) Resultado esperado (definição de pronto)
1. Projeto compila com `npm run dev` e abre uma SPA com 3 páginas: **Upload**, **Mapa**, **Linhas**.
2. Upload aceita um **GTFS.zip** e processa no **Worker**, populando a store com `stops`, `routes`, `trips`, `stop_times`.
3. Página **Mapa**: mostra marcadores de paradas (até 2.000) e centraliza o mapa no **bounding box** das paradas.
4. Página **Linhas**: tabela com `route_id`, `route_short_name`, `route_long_name` + busca por texto.
5. Um **gráfico** (barras) de frequência de partidas por hora (a partir de `stop_times.departure_time`).
6. **README** com instruções e referência a dados GTFS.
7. **Testes**:
   - **unit**: função utilitária `toHour()` e parsing de CSV → objetos;
   - **e2e**: fluxo `upload → mapa → linhas` (smoke test).

---

## 2) Estrutura desejada
```
gtfs-vue-quasar/
├─ package.json
├─ vite.config.ts
├─ index.html
└─ src/
   ├─ main.ts
   ├─ App.vue
   ├─ router/index.ts
   ├─ stores/gtfs.ts
   ├─ services/gtfs.ts
   ├─ workers/gtfsWorker.ts
   ├─ components/
   │  ├─ FileUpload.vue
   │  ├─ MapView.vue
   │  ├─ LineTable.vue
   │  └─ FrequencyChart.vue
   └─ styles/quasar.sass

# testes
└─ tests/
   ├─ unit/toHour.spec.ts
   └─ e2e/smoke.spec.ts
```

---

## 3) Comandos iniciais (gerar automaticamente)
1. Inicialize com Vite **vue-ts** e instale deps:
   - deps: `quasar @quasar/extras leaflet jszip papaparse chart.js pinia vue-router`
   - devDeps: `@quasar/vite-plugin @vitejs/plugin-vue sass typescript vite @types/leaflet vitest @vitejs/plugin-vue eslint prettier playwright @playwright/test`
2. Configure **Quasar** no `vite.config.ts` (plugin + `transformAssetUrls`).
3. Adicione `styles/quasar.sass` e importe em `main.ts`.
4. Ative **Leaflet CSS** em `main.ts` e ajuste bundling para workers do Vite (import com `?worker`).

> Gere `npm scripts`: `dev`, `build`, `preview`, `test:unit`, `test:e2e`.

---

## 4) Implementação — especificação por arquivo

### `src/stores/gtfs.ts`
- Store Pinia com estado: `loading:boolean`, `stops[]`, `routes[]`, `trips[]`, `stopTimes[]`, `fileName:string`.
- Getters: `routesById` (mapa `route_id→route`), `tripsByRoute` (`route_id→Trip[]`).
- Action: `setAll({stops,routes,trips,stopTimes,fileName?})`.

### `src/workers/gtfsWorker.ts`
- Usar `JSZip` para ler `.zip` → verificar arquivos **obrigatórios**: `stops.txt`, `routes.txt`, `trips.txt`, `stop_times.txt`.
- Usar `Papa.parse` com `{ header:true, dynamicTyping:true, skipEmptyLines:true }`.
- Normalizar `stop_sequence` para `number`.
- Retornar `{ fileName, stops, routes, trips, stopTimes }` por `postMessage`.
- Em caso de erro, `postMessage({ error })`.

### `src/services/gtfs.ts`
- Função `loadGtfsFromFile(file: File)` que usa `FileReader` e inicia o **Worker** via `import('../workers/gtfsWorker.ts?worker')`.
- Resolve com os dados do worker; rejeita ao receber `{error}`.

### `src/components/FileUpload.vue`
- Página com `q-uploader` (aceita `.zip`, `auto-upload=false`).
- Botão **Processar**: chama `loadGtfsFromFile`, popula store e navega para **/map**.

### `src/components/MapView.vue`
- Cria mapa Leaflet, adiciona `tileLayer` OpenStreetMap.
- Cria `layerGroup` de **paradas** (até 2.000) usando `L.circleMarker` com tooltip `stop_name`.
- Calcula bounding box por `stop_lat/stop_lon` e usa `map.fitBounds`.

### `src/components/LineTable.vue`
- Tabela Quasar com `route_id`, `route_short_name`, `route_long_name`.
- `q-input` para filtro por texto (id/sigla/nome).

### `src/components/FrequencyChart.vue`
- Util função `toHour(time: string)` → retorna `Number(h)%24` (GTFS pode ter horas > 24).
- Montar gráfico de barras (Chart.js) com contagem por `departure_time` de `stopTimes` (amostra de até 50k linhas para performance).

### `src/App.vue` e `src/router/index.ts`
- Cabeçalho com botões para **Upload**, **Mapa**, **Linhas**.
- Rotas: `/`, `/map`, `/lines`.

### `index.html`
- Fonte Roboto e ícones `@quasar/extras` (material-icons).

---

## 5) Testes (gerar arquivos)

### Unit — `tests/unit/toHour.spec.ts`
- Casos: `"00:10:00" → 0`, `"23:59:59" → 23`, `"24:00:00" → 0`, `"25:10:00" → 1`.
- Testar parsing simples de CSV com Papa (mock string) gerando objetos com chaves corretas.

### E2E — `tests/e2e/smoke.spec.ts`
- Abrir app → verificar botão **Processar** desabilitado sem arquivo.
- Fazer upload de um **GTFS.zip pequeno de exemplo** (simular via fixture) → clicar **Processar** → esperar navegação para `/map`.
- Verificar presença do mapa, e depois navegar para **Linhas** e conferir tabela com >0 linhas.

---

## 6) README (gerar conteúdo)
Incluir:
- Objetivo do projeto (front-only GTFS dashboard).
- Como instalar/rodar (`npm i`, `npm run dev`).
- Como obter um **GTFS.zip** (exemplos públicos) e como testar via upload.
- Limitações (CORS se tentar baixar GTFS por URL; grande volume de dados; horas > 24).
- Roadmap curto: `shapes.txt` para polylines reais; seleção de rota → trips → stop_times; cache local.

---

## 7) Melhorias opcionais (se houver tempo)
- Parsing e desenho de **`shapes.txt`** (L.Polyline por shape_id).
- **Web Worker** dedicado para agregações (frequência por hora por **linha** selecionada).
- **Persistência local** (IndexedDB) para reabrir o dataset sem reprocessar.
- **PWA** com Service Worker para offline básico.

---

## 8) Entregáveis finais
- Código completo com a estrutura acima.
- **README** + screenshot do app.
- **Testes** unit e e2e passando em CI local.

---

## 9) Tarefas para o Codex (checklist)
- [ ] Criar projeto `gtfs-vue-quasar` (Vite + Vue TS) e instalar dependências.
- [ ] Configurar Quasar + Router + Pinia + Leaflet CSS.
- [ ] Implementar store `gtfs` (estado/getters/actions).
- [ ] Implementar **worker** de parsing (`JSZip` + `Papa`), com validações e tratamento de erro.
- [ ] Implementar service `loadGtfsFromFile` e página **FileUpload** com `q-uploader`.
- [ ] Implementar **MapView** com marcadores e `fitBounds`.
- [ ] Implementar **LineTable** com busca.
- [ ] Implementar **FrequencyChart** (barras por hora) e usar na tela que preferir.
- [ ] Criar testes **Vitest** (unit) e **Playwright** (e2e) mínimos.
- [ ] Gerar **README** completo.

> **Ação**: Execute todas as etapas acima e devolva os arquivos prontos. Onde houver decisões ambíguas, escolha o padrão mais simples e documente no README.

