# WerOntoView: Engenharia de Requisitos, Modelagem Ontológica OWL 2 / SWRL e Arquitetura Formal em ADL ACME para Visualização e Recuperação Semântica

**Samuel Celso Anjos Neto**  
*Centro de Informática — Universidade Federal de Pernambuco (CIn / UFPE)*  
`scan@cin.ufpe.br`

**Pedro Henrique Dantas**  
*Centro de Informática — Universidade Federal de Pernambuco (CIn / UFPE)*  
`phd@cin.ufpe.br`

**Orientador: Prof. Dr. Frederico Luiz Gonçalves de Freitas**  
*Centro de Informática — Universidade Federal de Pernambuco (CIn / UFPE)*  
`fred@cin.ufpe.br`

---

## Resumo

A proliferação de literatura científica em conferências internacionais demanda soluções computacionais que transcendam a busca puramente sintática de palavras-chave. No âmbito do *Workshop on Requirements Engineering (WER)*, este artigo apresenta uma contribuição holística que integra três pilares da Ciência da Computação: **(i) Engenharia de Conhecimento**, mediante a concepção de uma ontologia formal em **OWL 2 DL** com regras em **SWRL**, modelando o acervo de publicações do WER 2026; **(ii) Engenharia de Requisitos**, através da especificação rigorosa baseada na norma IEEE 830 / ISO/IEC/IEEE 29148, contemplando requisitos para especialistas e usuários leigos; e **(iii) Arquitetura de Software**, com a especificação formal completa da ferramenta **WerOntoView** na linguagem de descrição arquitetural **ADL ACME**. A aplicação foi projetada como uma Single Page Application 100% estática (*zero-backend*), executando pipelines de parsing RDF, inferência estrutural de superclasses, unificação de arestas e casamento de regras SWRL diretamente na memória do navegador. Os resultados experimentais atestam a descoberta automatizada de 52 novas asserções de técnicas abordadas, 58 correlações temáticas e 33 vínculos institucionais, com desempenho submétrico e total garantia de privacidade.

**Palavras-chave:** Web Semântica, Ontologias OWL 2 DL, Regras SWRL, Arquitetura de Software, ADL ACME, Engenharia de Requisitos, Catálogo WER, WerOntoView.

---

## 1. Introdução

A recuperação de informação científica em bibliotecas digitais convencionais enfrenta desafios crônicos decorrentes da polissemia, sinonímia e da falta de estruturação conceitual explícita. No domínio da Engenharia de Requisitos (ER), o evento *Workshop on Requirements Engineering (WER)* congrega há quase três décadas artigos, tutoriais e palestras nos idiomas português, espanhol e inglês. Uma consulta tradicional pelo termo *"Non-Functional Requirements"* comumente deixa de recuperar artigos hispânicos indexados sob *"Requerimientos No Funcionales"*, bem como não deduz automaticamente a rede de coautoria entre pesquisadores ou a colaboração entre universidades distintas.

Para superar essa lacuna, o presente trabalho documenta o projeto e desenvolvimento do **WerOntoView**, uma plataforma web estática de exploração e visualização ontológica que une rigor formal e usabilidade. Este artigo estrutura-se de forma a integrar os três documentos fundamentais do projeto:
- A **Engenharia de Requisitos** do sistema (Seção 2);
- A **Modelagem Ontológica e Regras Semânticas** do Catálogo WER 2026 (Seção 3);
- A **Arquitetura de Software Formalizada em ADL ACME** e sua implementação (Seção 4);
- Os **Resultados Experimentais, Avaliação e Conclusões** (Seções 5 e 6).

---

## 2. Engenharia de Requisitos do Sistema

O projeto seguiu os preceitos da norma IEEE 830 para especificação de requisitos de software, orientando-se por dois perfis de público-alvo com necessidades divergentes:

1. **Perfil Especialista / Banca Avaliadora:** Requer rigor na inspeção de axiomas de Lógica de Descrições (DL), visibilidade da taxonomia, visualização de regras SWRL com identificação de variáveis, inspeção do grafo relacional e análise de diferenças (*Diff*) pré e pós-inferência.
2. **Perfil Usuário Comum / Estudante:** Demanda uma interface intuitiva de biblioteca acadêmica, com busca facetada por tópicos, autores e instituições, acesso direto a links de leitura de PDFs e explicações didáticas sobre como a ontologia efetuou as correlações.

### 2.1. Requisitos Funcionais Essenciais e Decisões de Design

A Tabela 1 sintetiza os principais Requisitos Funcionais (RF) implementados no sistema:

| ID | Prioridade | Requisito | Solução Técnica Adotada no WerOntoView |
| :--- | :--- | :--- | :--- |
| **RF-01** | Deve | Upload e Drag-and-drop de arquivos Turtle e RDF/XML | Parser polimórfico com detecção automática por assinatura de conteúdo. |
| **RF-03** | Deve | Carregamento de exemplo embutido | Carga assíncrona imediata da ontologia oficial do WER 2026 (`wer-catalogo-v7-regras-swrl.ttl`). |
| **RF-11** | Deve | Hierarquia de classes em árvore retrátil | Componente `ClassTree` com contadores de instâncias e badges para classes definidas. |
| **RF-16** | Deve | Eliminação de nós anônimos soltos (`n3-NNN`) | Filtro `isBlankNode()`: nós anônimos nunca são desenhados como classes ou indivíduos. |
| **RF-16.2** | Deve | Compactação de axiomas de disjunção | Agrupamento de `AllDisjointClasses`, `AllDifferent` e dos 378 axiomas `differentFrom` em 5 blocos de linha única expansíveis. |
| **RF-17** | Deve | Rótulos completos sem truncamento | Nós com formato `round-rectangle` e dimensionamento dinâmico $W = \max(90, \text{len} \times 8.2 + 28)\text{px}$. |
| **RF-18** | Deveria | Ocultação de propriedades inversas no modo simples | Propriedades inversas (`eAbordadaPor`, `possuiAutor`, etc.) são filtradas na visão simples. |
| **RF-18.1** | Deveria | Agrupamento de arestas entre a mesma dupla | Arestas com mesma origem e destino são unificadas no grafo (máximo 1 aresta entre Artigo e Tema). |
| **RF-19** | Deve | Inferência estrutural de superclasse ($C \equiv D \sqcap \dots \Rightarrow C \sqsubseteq D$) | As 7 classes definidas de `Artigo` são conectadas automaticamente abaixo de `Artigo` na árvore e no grafo com aresta tracejada (`dashed`). |
| **RF-30** | Deve | Axiomas DL legíveis em português e DL formal | Alternador em tempo real entre sintaxe Manchester PT (`Artigo e (temAutor mínimo 2 Autor)`) e DL formal (`Artigo ⊓ ≥2 temAutor.Autor`). |
| **RF-33** | Deve | Inspeção de regras SWRL | Exibição das 4 regras com átomos lógicos ($\land, \to$) e versão em português (*"SE ... ENTÃO ..."*). |
| **RF-40** | Deveria | Comparação antes/depois da inferência (Diff) | Mapeamento diferencial que categoriza novas asserções, tipos e axiomas resultantes de raciocinadores. |
| **RF-60** | Deve | Subsite / Portal Simplificado do Usuário | Portal amigável com busca por tópicos, pílulas de temas, links diretos de PDF e explicações didáticas. |

### 2.3. Requisitos Não-Funcionais Críticos

- **RNF-01 (Privacidade Absoluta - Zero-Backend):** Todos os dados permanecem na máquina do usuário. Nenhuma informação é transmitida a servidores externos.
- **RNF-02 (Desempenho Submétrico):** Carregamento e renderização do catálogo completo do WER em $< 1,5$ s.
- **RNF-05 (Acessibilidade WCAG 2.1 AA):** Alternativa tabular e em texto para o grafo conceitual, assegurando compatibilidade com leitores de tela.

---

## 3. Modelagem Ontológica e Regras Semânticas (Catálogo WER)

A ontologia foi desenvolvida sob o padrão **OWL 2 DL**, correspondendo ao perfil expressivo $\mathcal{SROIQ}^{(D)}$ de Lógica de Descrições, composto por **2.584 triplas RDF** na sua versão 7.

### 3.1. Estrutura Conceitual do Domínio

A ontologia estrutura as entidades fundamentais do ecossistema científico do WER:
- **`Artigo`**: Instâncias de publicações contendo títulos, links para PDFs nos proceedings, DOIs e palavras-chave.
- **`Autor`**: Pesquisadores participantes do workshop.
- **`Instituicao`**: Universidades e centros de pesquisa da América Latina.
- **`TemaDePesquisa`**: Tópicos canônicos de ER (*Elicitação de Requisitos, Requisitos Não-Funcionais, Métodos Ágeis, Acessibilidade, etc.*).
- **`Edicao`** e **`Trilha`**: Dados contextuais de aceitação e ano de publicação.

### 3.2. Axiomatização em Lógica de Descrições

A ontologia formaliza classes definidas com condições necessárias e suficientes:

1. **Classes Definidas de Artigo:**
   - $\text{ArtigoColaborativo} \equiv \text{Artigo} \sqcap (\ge 2\,\text{temAutor}.\text{Autor})$
   - $\text{ArtigoDeAutoriaUnica} \equiv \text{Artigo} \sqcap (= 1\,\text{temAutor}.\text{Autor})$
   - $\text{ArtigoEmLinguaEstrangeira} \equiv \text{Artigo} \sqcap \neg(\exists\text{temIdioma}.\{\text{Portugues}\})$
   - $\text{ArtigoSobreElicitacao} \equiv \text{Artigo} \sqcap \exists\text{abordaTecnica}.\text{TecnicaDeElicitacao}$

2. **Cadeia de Propriedades (*Property Chain Axiom*):**
   A coautoria científica é definida pela composição entre a autoria de um artigo e a relação reversa de autores do mesmo artigo:
   $$\text{coautorDe} \sqsupseteq \text{autorDe} \circ \text{temAutor}$$
   Sendo $\text{coautorDe}$ simétrica ($\text{coautorDe} \equiv \text{coautorDe}^-$), a rede de colaboradores é derivada implicitamente.

3. **Disjunção Mútua e Distinção:**
   - Axioma $\text{AllDisjointClasses}(\text{Autor}, \text{Edicao}, \text{Instituicao}, \text{ItemDoEvento}, \text{TemaDePesquisa})$;
   - $378$ axiomas de distinção par a par (`owl:differentFrom`) entre os 28 temas de pesquisa.

### 3.3. Base de Regras SWRL e Execução de Inferência

Foram formalizadas 4 regras semânticas de primeira ordem executadas via Drools:

- **Regra R1 (Tema por Palavra-Chave):** Unifica termos equivalentes e deriva a técnica abordada:
  $$\text{Artigo}(?a) \land \text{palavraChave}(?a, ?k) \land \text{palavraChaveAssociada}(?t, ?k) \to \text{abordaTecnica}(?a, ?t)$$
- **Regra R2 (Temas Relacionados):** Identifica coocorrência temática em artigos:
  $$\text{Artigo}(?a) \land \text{abordaTecnica}(?a, ?t1) \land \text{abordaTecnica}(?a, ?t2) \land \text{differentFrom}(?t1, ?t2) \to \text{temaRelacionadoCom}(?t1, ?t2)$$
- **Regra R3 (Artigo Interinstitucional):** Identifica artigos colaborativos entre universidades distintas através da checagem de desigualdade dos nomes institucionais (`swrlb:notEqual`):
  $$\begin{aligned}
  \text{Artigo}(?a) \land \text{temAutor}(?a, ?x) \land \text{temAutor}(?a, ?y) \land \text{afiliadoA}(?x, ?i) \land \text{afiliadoA}(?y, ?j) \\
  \land \text{swrlb:notEqual}(?nx, ?ny) \land \text{swrlb:notEqual}(?ni, ?nj) \to \text{ArtigoInterinstitucional}(?a)
  \end{aligned}$$
- **Regra R4 (Participação Institucional no Evento):** Conecta a universidade à edição do WER:
  $$\text{Instituicao}(?i) \land \text{possuiAutor}(?i, ?x) \land \text{autorDe}(?x, ?a) \land \text{publicadoEm}(?a, ?e) \to \text{participouDe}(?i, ?e)$$

---

## 4. Arquitetura de Software e Especificação em ADL ACME

Para assegurar rigor na Engenharia de Software do WerOntoView, a arquitetura do sistema foi modelada e descrita formalmente em **ADL ACME**.

### 4.1. Estilos Arquiteturais

A solução emprega uma arquitetura estática modular em camadas, utilizando:
- **Pipes-and-Filters:** Para leitura, sanitização de blank nodes e expansão de listas RDF encadeadas.
- **Model-View-Presenter Reativo:** React 18 e TypeScript garantindo renderização orientada a estados imutáveis.
- **Visualização Topológica Baseada em Forças:** Cytoscape.js operando sobre canvas HTML5 isolado do DOM principal.

### 4.2. Especificação Formal em ADL ACME

```acme
Family WebSemanticViewerFam = {
    Port Type StreamInT;
    Port Type StreamOutT;
    Port Type EventInT;
    Port Type EventOutT;
    Port Type DataQueryT;
    Port Type RenderTargetT;

    Connector Type DataFlowConnectorT = {
        Role source : SourceRoleT;
        Role sink : TargetRoleT;
    };
    Connector Type DOMBridgeConnectorT = {
        Role modelInput : SourceRoleT;
        Role canvasTarget : TargetRoleT;
    };
};

System WerOntoView : WebSemanticViewerFam = {

    Component FileParserComponent = {
        Port rawInput : StreamInT;
        Port tokenizedQuads : StreamOutT;
        Property parserLibraries : String = "N3.js (Turtle) + DOMParser (RDF/XML)";
    };

    Component RDFExtractorComponent = {
        Port quadsInput : StreamInT;
        Port resolvedModelOutput : StreamOutT;
        Property blankNodePolicy : String = "Strict filter; bnodes never become named classes (RF-16)";
        Property structuralInferencePolicy : String = "Infer C subClassOf D if C equivalentClass (D and ...) (RF-19)";
    };

    Component OntologyModelRepository = {
        Port modelStoreIn : StreamInT;
        Port modelQuery : DataQueryT;
        Property inMemoryTriplesLimit : Integer = 50000;
    };

    Component DLFormatterComponent = {
        Port modelAccess : DataQueryT;
        Port formattedTextOut : StreamOutT;
    };

    Component SWRLRuleEngineComponent = {
        Port modelAccess : DataQueryT;
        Port inferredFactsOut : StreamOutT;
    };

    Component InferenceDiffEngineComponent = {
        Port baseModelAccess : DataQueryT;
        Port comparedModelAccess : DataQueryT;
        Port diffResultOut : StreamOutT;
    };

    Component CytoscapeGraphComponent = {
        Port graphInput : StreamInT;
        Port renderCanvas : RenderTargetT;
        Property nodeGeometryPolicy : String = "Round-rectangle with dynamic width (RF-17)";
        Property edgeGroupingPolicy : String = "Group duplicate property pairs into single edge (RF-18.1)";
        Property inversePropertyPolicy : String = "Hidden in simple view, visible in detailed view (RF-18)";
    };

    Component UserPortalViewComponent = {
        Port modelQuery : DataQueryT;
        Port userInteraction : EventInT;
        Property mode : String = "Simplified Semantic Search by Topics";
    };

    Component SpecialistInspectorViewComponent = {
        Port modelQuery : DataQueryT;
        Port detailEvent : EventOutT;
        Property mode : String = "OWL DL Expert Inspector";
    };

    /* Conectores e Vínculos */
    Connector ParseToExtractFlow : DataFlowConnectorT;
    Connector ExtractToRepoFlow : DataFlowConnectorT;
    Connector ModelToPortalFlow : DataFlowConnectorT;
    Connector ModelToSpecialistFlow : DataFlowConnectorT;
    Connector ModelToGraphFlow : DOMBridgeConnectorT;

    Attachments {
        FileParserComponent.tokenizedQuads to ParseToExtractFlow.source;
        RDFExtractorComponent.quadsInput to ParseToExtractFlow.sink;
        RDFExtractorComponent.resolvedModelOutput to ExtractToRepoFlow.source;
        OntologyModelRepository.modelStoreIn to ExtractToRepoFlow.sink;
        OntologyModelRepository.modelQuery to ModelToPortalFlow.source;
        UserPortalViewComponent.modelQuery to ModelToPortalFlow.sink;
        OntologyModelRepository.modelQuery to ModelToSpecialistFlow.source;
        SpecialistInspectorViewComponent.modelQuery to ModelToSpecialistFlow.sink;
        OntologyModelRepository.modelQuery to ModelToGraphFlow.modelInput;
        CytoscapeGraphComponent.graphInput to ModelToGraphFlow.canvasTarget;
    };

    Property zeroBackendRequirement : Boolean = true;
    Property codeSplittingVendors : String = "cytoscape-vendor (451kB), n3-vendor (146kB), react-vendor (133kB)";
};
```

---

## 5. Implementação, Validação e Resultados Experimentais

A aplicação foi integralmente construída em TypeScript com React 18, Tailwind CSS e empacotamento otimizado com Rollup/Vite.

### 5.1. Resultados da Homologação dos Requisitos

1. **Eliminação de Nós Anônimos Soltos (RF-16):**
   A validação automatizada confirmou zero nós do tipo `n3-NNN` no grafo. Todas as restrições e expressões foram encapsuladas nos painéis conceituais.
2. **Conexão Estrutural das Classes Definidas (RF-19):**
   Mesmo ao carregar a ontologia v6 (que não continha axiomas `rdfs:subClassOf` explícitos para as classes definidas), as 7 classes (`ArtigoColaborativo`, `ArtigoDeAutoriaUnica`, `ArtigoEmLinguaEstrangeira`, `ArtigoEmPortugues`, `ArtigoMultitematico`, `ArtigoSobreElicitacao`, `ArtigoSobreModelagem`) apareceram devidamente subordinadas a `Artigo` na árvore e no grafo, com aresta tracejada âmbar.
3. **Resolução de Rótulos e Sobreposição de Arestas (RF-17 e RF-18):**
   Com os nós redimensionados dinamicamente em formato *round-rectangle*, nenhum texto ultrapassa as bordas. Na visão simples do grafo, propriedades inversas foram ocultadas e conexões duplicadas foram unificadas, resultando em exatamente **1 aresta única** entre `Artigo` e `TemaDePesquisa`.
4. **Descoberta Semântica no Portal do Usuário (RF-60 a RF-64):**
   O algoritmo de casamento da regra SWRL R1 em tempo de execução identificou com precisão as **52 derivações semânticas de `abordaTecnica`**, permitindo aos usuários comuns pesquisar literatura científica por tópicos sem necessidade de conhecimento formal de DL.
5. **Métricas de Inferência OWL $\to$ Drools $\to$ OWL:**
   O módulo de Diff acusou a dedução exata de 52 asserções de técnicas, 58 correlações temáticas entre tópicos, 33 participações institucionais e 20 classificações de artigos interinstitucionais.

---

## 6. Conclusões e Trabalhos Futuros

O **WerOntoView** consubstancia uma abordagem moderna de Web Semântica que concilia a profundidade da lógica descritiva com uma experiência de usuário simplificada e acessível. A formalização arquitetural em ADL ACME assegura rastreabilidade, manutenibilidade e confiabilidade ao software. O modelo estático *zero-backend* viabilizou hospedagem gratuita de alta performance e disponibilidade na Vercel e GitHub Pages com privacidade estrita.

Como trabalhos futuros, prevê-se a expansão para execução de raciocinadores completos via WebAssembly (e.g., EyeReasoner ou HermiT compilado) e a extensão do catálogo para edições históricas completas do WER.

---

## Referências

1. W3C OWL Working Group. *OWL 2 Web Ontology Language Document Overview (Second Edition)*. W3C Recommendation, 2012.
2. HORROCKS, I. et al. *SWRL: A Semantic Web Rule Language Combining OWL and RuleML*. W3C Member Submission, 2004.
3. GARLAN, D.; MONROE, R. T.; WILE, D. *Acme: Architectural Description of Component-Based Systems*. In: Foundations of Component-Based Systems, Cambridge University Press, 2000.
4. IEEE. *IEEE Recommended Practice for Software Requirements Specifications (IEEE Std 830-1998)*. IEEE Computer Society, 1998.
5. BAADER, F. et al. *The Description Logic Handbook: Theory, Implementation, and Applications*. Cambridge University Press, 2003.
6. NOY, N. F.; McGUINNESS, D. L. *Ontology Development 101: A Guide to Creating Your First Ontology*. Stanford Knowledge Systems Laboratory, 2001.
7. WER 2026. *Proceedings of the 29th Workshop on Requirements Engineering*. Natal, Brasil, 2026.
