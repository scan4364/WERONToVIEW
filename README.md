# WerOntoView - Visualizador Web de Ontologias OWL & SWRL

> **Projeto de Web Semântica (CIn - UFPE)**  
> **Autores:** Samuel Celso Anjos Neto e Pedro Henrique Dantas  
> **Orientação:** Prof. Frederico Freitas  
> Versão 1.0 · Novembro de 2026

O **WerOntoView** é uma ferramenta web moderna e 100% estática para exploração, visualização e inspeção de ontologias **OWL 2** e regras **SWRL**, desenvolvida especificamente para apoiar relatórios acadêmicos, bancas e apresentações com mais facilidade e legibilidade do que o Protégé.

---

## 🚀 Principais Funcionalidades

### 1. Entrada de Arquivos e Privacidade Total (RNF-01, RF-01 a RF-04)
- **100% Client-Side no Navegador:** Nenhum arquivo é transmitido a servidores externos; todo o processamento e parse ocorrem no próprio navegador da pessoa usuária.
- **Upload via Botão e Drag-and-Drop:** Suporte nativo para Turtle (`.ttl`) e RDF/XML (`.owl`, `.rdf`) com detecção automática do formato pelo conteúdo.
- **Botão "Carregar exemplo":** Carrega instantaneamente a ontologia do Catálogo WER (`wer-catalogo-v7-regras-swrl.ttl`).
- **Tratamento Robusto de Erros (RF-02):** Mensagens de erro claras sem congelar ou travar a interface.

### 2. Visão em Camadas: Simples ↔ Detalhada (RF-20)
- **Modo Simples (Padrão):** Oculta detalhes técnicos, nós anônimos (*blank nodes*), IRIs longas e colapsa axiomas de distinção em massa. Rótulos priorizam o português (`@pt`) com fallback para o fragmento local.
- **Modo Detalhado:** Exibe IRIs completas, comentários detalhados e visão crua das triplas RDF selecionadas (RF-25).

### 3. Axiomas DL Legíveis em Português e Sintaxe DL Formal (RF-30, RF-31)
- Alternância em tempo real entre a sintaxe estilo Manchester traduzida em Português e a notação formal de Lógica de Descrições:
  - `ArtigoColaborativo ≡ Artigo e (temAutor mínimo 2 Autor)`  
    *(DL: `Artigo ⊓ ≥2 temAutor.Autor`)*
  - `ArtigoEmLinguaEstrangeira ≡ Artigo e (não (temIdioma valor Portugues))`  
    *(DL: `Artigo ⊓ ¬(∃temIdioma.{Portugues})`)*
  - `coautorDe ⊒ autorDe ∘ temAutor` *(Cadeia de propriedades)*
- Suporte a `someValuesFrom`, `allValuesFrom`, `hasValue`, cardinalidades qualificadas, `intersectionOf`, `unionOf`, `complementOf`, `propertyChainAxiom` e características de propriedades (funcional, transitiva, simétrica, inversa).
- Colapso inteligente de axiomas `differentFrom` em massa (ex.: os 378 axiomas de distinção mútua entre temas) em uma linha expansível (RF-32).

### 4. Regras Semânticas SWRL (RF-33, RF-34)
- Exibição de regras com nome, comentário natural e fórmula lógica formatada:
  $$\text{Artigo}(?a) \land \text{palavraChave}(?a,?k) \land \text{palavraChaveAssociada}(?t,?k) \to \text{abordaTecnica}(?a,?t)$$
- Alternância para leitura em português natural (*"SE ... ENTÃO ..."*).
- Mapeamento bidirecional: lista quais classes e propriedades são usadas por cada regra.

### 5. Grafo Conceitual Interativo & Acessibilidade (RF-15, RF-51, RNF-05)
- Renderização visual em **Cytoscape.js** com layout orgânico, zoom, arraste e destaque dinâmico dos vizinhos ao clicar.
- Exportação direta do grafo em **PNG de alta definição** para incluir em artigos e slides.
- **Acessibilidade (WCAG AA):** Alternativa em lista/tabela para leitores de tela e navegação por teclado.

### 6. Comparação Antes e Depois da Inferência (Diff Drools / OWL) (RF-40 a RF-42)
- Carregue um segundo arquivo (pós-Drools ou pós-raciocinador) para inspecionar exatamente o que foi derivado.
- Agrupamento por novas asserções de propriedade, novas classificações de indivíduos e novos axiomas.
- Contagem por propriedade inferida (ex.: `abordaTecnica`, `temaRelacionadoCom`, `participouDe`, etc.) e destaque visual dos itens inferidos.

### 7. Exportação para Relatório (RF-50)
- Exportação completa do resumo da ontologia e métricas no formato **Markdown (`.md`)**.
- Exportação de tabelas de classes, propriedades e regras SWRL no formato **CSV (`.csv`)**.

---

## 🛠️ Tecnologias Utilizadas

- **Framework Web:** [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Build & Bundler:** [Vite](https://vitejs.dev/)
- **Estilização:** [Tailwind CSS](https://tailwindcss.com/)
- **Parsers Semânticos:** [N3.js](https://github.com/rdfjs/N3.js) (Turtle/TriG) + DOMParser nativo (RDF/XML)
- **Visualização em Grafo:** [Cytoscape.js](https://js.cytoscape.org/)
- **Ícones:** [Lucide React](https://lucide.dev/)

---

## 💻 Como Rodar Localmente

### Pré-requisitos
- Node.js (versão 18 ou superior)
- npm (versão 9 ou superior)

### Passo a passo

1. **Instalar dependências:**
   ```bash
   npm install
   ```

2. **Iniciar servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```
   Abra seu navegador no endereço exibido no terminal (geralmente `http://localhost:3000` ou `http://localhost:5173`).

3. **Gerar build de produção estático:**
   ```bash
   npm run build
   ```
   Os arquivos finais 100% estáticos serão gerados no diretório `dist/`.

4. **Pré-visualizar o build localmente:**
   ```bash
   npm run preview
   ```

---

## 🌐 Deploy

### Opção 1: Deploy na Vercel (Recomendado)

O projeto já inclui o arquivo `vercel.json` pré-configurado.

1. **Via CLI da Vercel:**
   ```bash
   npm i -g vercel
   vercel
   ```
   Siga as instruções na tela aceitando as opções padrão (Framework: Vite, Build: `npm run build`, Output: `dist`).

2. **Via painel web da Vercel:**
   - Faça push deste repositório para o GitHub / GitLab.
   - Acesse [vercel.com/new](https://vercel.com/new).
   - Importe o repositório `WERONTOVIEW`.
   - A Vercel detectará o Vite automaticamente. Clique em **Deploy**.

---

### Opção 2: Deploy em Servidor Estático / GitHub Pages

Como a aplicação é 100% estática e roda no navegador:
1. Execute `npm run build`.
2. A pasta `dist/` resultante pode ser enviada para:
   - **GitHub Pages** (usando a GitHub Action `peaceiris/actions-gh-pages` ou configurando a branch `gh-pages`)
   - **Netlify** (arrastando a pasta `dist/` ou conectando o repo)
   - **Surge.sh** (`npx surge dist`)
   - Qualquer servidor Nginx, Apache ou AWS S3 / Cloudflare Pages.

---

## 📂 Estrutura do Projeto

```text
WERONTOVIEW/
├── public/
│   └── examples/
│       ├── wer-catalogo-v7-regras-swrl.ttl   # Ontologia de teste do WER 2026 (v7 padrão)
│       └── wer-catalogo-v6-regras-swrl.ttl   # Ontologia do WER (v6 para comparação)
├── src/
│   ├── components/                          # Componentes React
│   │   ├── ClassTree.tsx                    # Árvore hierárquica recolhível
│   │   ├── DetailModal.tsx                  # Inspetor de classes, propriedades e indivíduos
│   │   ├── DiffViewer.tsx                   # Comparação antes/depois da inferência
│   │   ├── ExportModal.tsx                  # Exportação Markdown e CSV
│   │   ├── FileLoader.tsx                   # Upload, drag-and-drop e exemplo
│   │   ├── Header.tsx                       # Barra superior, busca global e modo simples/detalhado
│   │   ├── IndividualList.tsx               # Lista de instâncias paginada com busca
│   │   ├── OntologyGraph.tsx                # Grafo interativo Cytoscape e lista acessível
│   │   ├── PropertyList.tsx                 # Lista de propriedades e características
│   │   ├── SummaryMetrics.tsx               # Métricas e resumo da ontologia (Protégé)
│   │   └── SwrlRulesTab.tsx                 # Visualização de regras SWRL
│   ├── parser/                              # Parsers RDF/OWL
│   │   ├── ontologyLoader.ts                # Detecção automática de formato e carga
│   │   ├── rdfExtractor.ts                  # Extração do modelo OWL, métricas e SWRL
│   │   ├── rdfxmlParser.ts                  # Parser RDF/XML via DOMParser
│   │   └── turtleParser.ts                  # Parser Turtle via N3.js
│   ├── types/
│   │   └── ontology.ts                      # Tipagens completas do modelo ontológico
│   ├── utils/
│   │   ├── diffEngine.ts                    # Motor de cálculo de diferenças RDF
│   │   ├── dlFormatter.ts                   # Tradução para Manchester PT e DL Formal
│   │   ├── exportUtils.ts                   # Utilitários de download Markdown e CSV
│   │   └── swrlFormatter.ts                 # Formatação de átomos e regras SWRL
│   ├── App.tsx                              # Componente principal e orquestrador de estado
│   ├── index.css                            # Estilos globais e Tailwind CSS
│   └── main.tsx                             # Ponto de entrada React
├── dist/                                    # Build estático otimizado para deploy
├── index.html                               # Template HTML com fontes e viewport
├── package.json                             # Dependências e scripts
├── tailwind.config.js                       # Configuração de temas e cores
├── tsconfig.json                            # Configuração TypeScript
├── vercel.json                              # Configuração de deploy na Vercel
├── vite.config.ts                           # Configuração do Vite
└── wer-catalogo-v6-regras-swrl.ttl          # Arquivo original de ontologia de teste
```

---

## 👥 Autores e Orientação

- **Samuel Celso Anjos Neto**
- **Pedro Henrique Dantas**
- **Orientação:** Prof. Frederico Freitas

*Centro de Informática (CIn) — Universidade Federal de Pernambuco (UFPE) — 2026*
