# Modelagem Ontológica em OWL 2 DL e Inferência SWRL no Catálogo de Publicações do WER 2026: Concepção Teórica, Avaliação Empírica e Operacionalização via Ferramenta WerOntoView

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

A disseminação de produção científica em fóruns especializados demanda soluções computacionais que transcendam a recuperação puramente sintática de palavras-chave. No âmbito do *Workshop on Requirements Engineering (WER)* — principal fórum ibero-americano de Engenharia de Requisitos —, este artigo apresenta a concepção, especificação formal e validação empírica da **Ontologia do Catálogo de Publicações do WER 2026**, aliada à sua operacionalização prática através da ferramenta web **WerOntoView**. Modelada sob o padrão formal **OWL 2 DL** ($\mathcal{SROIQ}^{(D)}$) e enriquecida com regras semânticas em **SWRL (Semantic Web Rule Language)**, a ontologia estrutura o ecossistema científico do evento composto por **2.584 triplas RDF**, interligando artigos científicos, pesquisadores, afiliações institucionais, tópicos de pesquisa, trilhas e proceedings. Demonstra-se como axiomas de lógica de descrições — tais como classes definidas por equivalência com restrições de cardinalidade qualificada e composições de papéis via cadeias de propriedades — integrados a quatro regras SWRL de primeira ordem executadas em motor Drools, viabilizam a descoberta automatizada de **52 novas asserções de técnicas abordadas**, **58 correlações temáticas**, **33 participações institucionais** e a classificação de **20 publicações interinstitucionais**. Como extensão e suporte operacional a esse artefato ontológico, desenvolveu-se a ferramenta **WerOntoView**, uma Single Page Application 100% estática (*zero-backend*) formalizada em **ADL ACME**, que provê visualização conceitual interativa em grafo, tradução bidirecional de axiomas (Manchester PT $\leftrightarrow$ DL formal), análise diferencial pré/pós-inferência (*Diff*) e um portal simplificado de recuperação de artigos voltado ao usuário leigo. Os resultados atestam a robustez do modelo formal e a eficácia da ferramenta na democratização do acesso ao conhecimento ontológico.

**Palavras-chave:** Web Semântica, Ontologia OWL 2 DL, Regras SWRL, Lógica de Descrições $\mathcal{SROIQ}^{(D)}$, Engenharia de Requisitos, Catálogo WER, Inferência Semântica, WerOntoView.

---

## 1. Introdução

A gestão e recuperação de literatura acadêmica em simpósios e conferências especializadas constitui um desafio clássico na Ciência da Computação. Mecanismos convencionais de indexação baseados em tabelas relacionais ou motores de busca textual (como busca booleana por strings exatas) sofrem de limitações intrínsecas decorrentes de polissemia, sinonímia e da incapacidade de deduzir relações conceituais implícitas. No contexto da Engenharia de Requisitos (ER), o *Workshop on Requirements Engineering (WER)* congrega há quase três décadas artigos, tutoriais e palestras nos idiomas português, espanhol e inglês. Uma busca tradicional pelo termo *"Non-Functional Requirements"* costumeiramente falha em recuperar artigos hispânicos catalogados sob *"Requerimientos No Funcionales"* ou produções em português rotuladas como *"Requisitos Não-Funcionais"*, além de não derivar automaticamente a rede de coautoria entre pesquisadores ou a colaboração científica entre instituições geograficamente dispersas.

Para solucionar essas deficiências por meio das tecnologias da **Web Semântica**, o presente trabalho tem como foco principal a concepção, axiomatização e validação da **Ontologia do Catálogo WER 2026 (versão 7)**. A ontologia fornece um modelo conceitual rigoroso, fundamentado em Lógica de Descrições (DL) e regras de produção em SWRL, permitindo que computadores executem raciocínio dedutivo sobre os dados de publicação.

Adicionalmente, como contribuição complementar de engenharia de software e operacionalização da ontologia, apresenta-se a ferramenta **WerOntoView**. Reconhecendo que ferramentas tradicionais como o Protégé apresentam elevada curva de aprendizado e interfaces complexas que dificultam avaliações em bancas e o uso por pesquisadores não-especialistas, o WerOntoView foi concebido como um ambiente visual moderno, 100% executado no navegador (*client-side*), capaz de processar a ontologia, exibir suas inferências, traduzir axiomas para linguagem natural e permitir a busca semântica por tópicos em um subsite simplificado.

O artigo está organizado da seguinte forma: a Seção 2 apresenta a metodologia de engenharia de ontologias e as Questões de Competência formuladas; a Seção 3 detalha a conceitualização, taxonomia e vocabulário ontológico; a Seção 4 formaliza a axiomatização em Lógica de Descrições ($\mathcal{SROIQ}^{(D)}$); a Seção 5 expõe a base de regras semânticas em SWRL; a Seção 6 descreve a avaliação experimental e os resultados quantitativos de inferência; a Seção 7 aborda a operacionalização semântica por meio da ferramenta WerOntoView e sua arquitetura; e a Seção 8 apresenta as conclusões e trabalhos futuros.

---

## 2. Metodologia de Desenvolvimento e Questões de Competência

O processo de engenharia da ontologia foi conduzido com base nas diretrizes metodológicas do *Ontology Development 101* (NOY; McGUINNESS, 2001) e nos princípios do framework *NeOn*. O ciclo de desenvolvimento compreendeu quatro fases iterativas: (i) definição do escopo e Questões de Competência; (ii) conceitualização e formalização em OWL 2 DL; (iii) implementação das regras de inferência SWRL; e (iv) validação empírica com raciocinadores automatizados (HermiT e Drools).

### 2.1. Questões de Competência (*Competency Questions* - CQs)

As Questões de Competência representam os requisitos informacionais e expressivos que a ontologia deve ser capaz de responder com precisão:

- **CQ-01:** *Quais artigos abordam determinada técnica ou tema de pesquisa (ex.: Elicitação de Requisitos ou Requisitos Não-Funcionais), mesmo quando o título não contém explicitamente o nome formal do tema?*  
  *Critério de Sucesso:* Recuperação baseada no casamento semântico entre palavras-chave do artigo e palavras-chave associadas ao tema em múltiplos idiomas.
- **CQ-02:** *Quais artigos possuem colaboração entre múltiplos pesquisadores (Artigo Colaborativo) e quais foram elaborados em autoria individual exclusiva (Artigo de Autoria Única)?*  
  *Critério de Sucesso:* Classificação automática através de restrições de cardinalidade qualificada na propriedade `temAutor`.
- **CQ-03:** *Quais artigos configuram cooperação científica interinstitucional, envolvendo autores afiliados a universidades ou centros de pesquisa distintos?*  
  *Critério de Sucesso:* Dedução automática via regra semântica que inspeciona a heterogeneidade das afiliações institucionais dos coautores.
- **CQ-04:** *Quem são os coautores de determinado pesquisador, sabendo que a coautoria é estabelecida pelo compartilhamento de ao menos um artigo em comum?*  
  *Critério de Sucesso:* Inferência transitiva e simétrica por meio de axioma de cadeia de propriedades (`autorDe o temAutor`).
- **CQ-05:** *Quais instituições acadêmicas participaram ativamente de determinada edição do workshop através da publicação efetiva de seus pesquisadores?*  
  *Critério de Sucesso:* Derivação de relacionamentos diretos entre instâncias de `Instituicao` e `Edicao` a partir da cadeia de autoria e publicação.

---

## 3. Conceitualização e Vocabulário Ontológico

A ontologia foi codificada na sintaxe W3C Turtle (`.ttl`) sob a IRI canônica `<http://www.cin.ufpe.br/ontologias/wer-catalogo#>`. O grafo de conhecimento totaliza **2.584 triplas RDF** na sua versão 7, distribuídas entre classes, propriedades de objeto, propriedades de dados e indivíduos nomeados que representam a edição de 2026 do evento.

### 3.1. Núcleos Conceituais e Hierarquia de Classes

A taxonomia de conceitos organiza-se em 7 eixos estruturantes:

1. **`ItemDoEvento`**: Superclasse geral de produções técnicas e editoriais.
   - **`Artigo`**: Artigos científicos avaliados por pares e aceitos nos proceedings.
     - **`ArtigoColaborativo`**: Artigos com autoria compartilhada ($\ge 2$ autores).
     - **`ArtigoDeAutoriaUnica`**: Artigos individuais com exatamente $1$ autor.
     - **`ArtigoInterinstitucional`**: Artigos envolvendo autores de diferentes instituições.
     - **`ArtigoEmPortugues`**: Artigos cujo idioma oficial de redação é o Português.
     - **`ArtigoEmLinguaEstrangeira`**: Artigos publicados em Espanhol ou Inglês.
     - **`ArtigoSobreElicitacao`**: Artigos que tratam de técnicas de Elicitação de Requisitos.
     - **`ArtigoSobreModelagem`**: Artigos que tratam de modelagem conceitual e notações de ER.
2. **`Autor`**: Agente humano responsável pela concepção intelectual das publicações.
3. **`Instituicao`**: Universidades, faculdades ou institutos de pesquisa de afiliação dos autores.
4. **`TemaDePesquisa`**: Tópicos canônicos e técnicas de ER (*Elicitação, Requisitos Não-Funcionais, Métodos Ágeis, Acessibilidade, Engenharia de Requisitos Orientada a Objetivos, IA Generativa, PLN, etc.*).
5. **`Edicao`**: Registro temporal e geográfico da edição do evento (*WER 2026*).
6. **`Trilha`**: Trilhas de submissão do workshop (*Trilha de Pesquisa, Trilha de Pós-Graduação, Relatos de Experiência, Tutoriais*).
7. **`Idioma`**: Vocabulário controlado de idiomas aceitos (*Português, Espanhol, Inglês*).

### 3.2. Propriedades de Objeto (*Object Properties*)

As propriedades de objeto definem os predicados relacionais entre instâncias das classes, incorporando restrições lógicas formais:

| Propriedade | Domínio | Imagem | Características Lógicas | Propriedade Inversa |
| :--- | :--- | :--- | :--- | :--- |
| **`temAutor`** | `Artigo` | `Autor` | Asserção relacional | `autorDe` |
| **`autorDe`** | `Autor` | `Artigo` | Asserção relacional | `temAutor` |
| **`afiliadoA`** | `Autor` | `Instituicao` | Muitas para muitas | `possuiAutor` |
| **`possuiAutor`** | `Instituicao` | `Autor` | Muitas para muitas | `afiliadoA` |
| **`abordaTecnica`** | `Artigo` | `TemaDePesquisa` | Relacional | `eAbordadaPor` |
| **`eAbordadaPor`** | `TemaDePesquisa` | `Artigo` | Relacional | `abordaTecnica` |
| **`coautorDe`** | `Autor` | `Autor` | **Simétrica**, Irreflexiva | Auto-inversa |
| **`temaRelacionadoCom`** | `TemaDePesquisa` | `TemaDePesquisa` | **Simétrica** | Auto-inversa |
| **`participouDe`** | `Instituicao` | `Edicao` | Relacional derivada | `temInstituicaoParticipante` |
| **`temInstituicaoParticipante`** | `Edicao` | `Instituicao` | Relacional | `participouDe` |
| **`temIdioma`** | `Artigo` | `Idioma` | **Funcional** | — |
| **`pertenceATrilha`** | `Artigo` | `Trilha` | **Funcional** | — |
| **`publicadoEm`** | `Artigo` | `Edicao` | **Funcional** | — |

### 3.3. Propriedades de Dados (*Datatype Properties*)

As propriedades de dados associam instâncias a valores literais tipados segundo o padrão XML Schema (XSD):
- **`titulo`** ($\text{Artigo} \to \text{xsd:string}$): Título completo da publicação.
- **`doi`** ($\text{Artigo} \to \text{xsd:string}$): Identificador Digital de Objeto.
- **`link`** ($\text{Artigo} \to \text{xsd:anyURI}$): URL oficial para o arquivo PDF nos proceedings do WER.
- **`linkPagina`** ($\text{Artigo} \to \text{xsd:anyURI}$): URL da página HTML do artigo no portal do evento.
- **`palavraChave`** ($\text{Artigo} \to \text{xsd:string}$): Palavras-chave atribuídas pelos autores no artigo.
- **`palavraChaveAssociada`** ($\text{TemaDePesquisa} \to \text{xsd:string}$): Sinônimos e termos multilingues do tema.
- **`nome`** ($\text{Autor} \to \text{xsd:string}$): Nome completo do pesquisador.
- **`nomeInstituicao`** ($\text{Instituicao} \to \text{xsd:string}$): Nome oficial da organização acadêmica.
- **`ano`** ($\text{Edicao} \to \text{xsd:integer}$): Ano do evento ($2026$).

---

## 4. Axiomatização Formal em Lógica de Descrições (DL)

A ontologia insere-se no perfil de expressividade $\mathcal{SROIQ}^{(D)}$ de OWL 2 DL. Esta linguagem garante decidibilidade computacional no pior caso e suporta construtores avançados de qualificação de cardinalidade, inversão de papéis e axiomas de inclusão complexos.

### 4.1. Classes Definidas por Equivalência

Em OWL 2 DL, uma classe definida estabelece condições **necessárias e suficientes** ($\equiv$) para a pertinência de seus membros. No Catálogo WER, sete classes foram formalizadas por equivalência:

1. **Artigo Colaborativo:**
   $$\text{ArtigoColaborativo} \equiv \text{Artigo} \sqcap (\ge 2\,\text{temAutor}.\text{Autor})$$
   *Manchester PT:* `Artigo e (temAutor mínimo 2 Autor)`

2. **Artigo de Autoria Única:**
   $$\text{ArtigoDeAutoriaUnica} \equiv \text{Artigo} \sqcap (= 1\,\text{temAutor}.\text{Autor})$$
   *Manchester PT:* `Artigo e (temAutor exatamente 1 Autor)`

3. **Artigo em Língua Estrangeira:**
   $$\text{ArtigoEmLinguaEstrangeira} \equiv \text{Artigo} \sqcap \neg(\exists\text{temIdioma}.\{\text{Portugues}\})$$
   *Manchester PT:* `Artigo e (não (temIdioma valor Portugues))`

4. **Artigo em Português:**
   $$\text{ArtigoEmPortugues} \equiv \text{Artigo} \sqcap \exists\text{temIdioma}.\{\text{Portugues}\}$$

5. **Artigo sobre Elicitação:**
   $$\text{ArtigoSobreElicitacao} \equiv \text{Artigo} \sqcap \exists\text{abordaTecnica}.\text{TecnicaDeElicitacao}$$

6. **Artigo sobre Modelagem:**
   $$\text{ArtigoSobreModelagem} \equiv \text{Artigo} \sqcap \exists\text{abordaTecnica}.\text{TecnicaDeModelagem}$$

7. **Artigo Interinstitucional (Definição Base DL):**
   $$\text{ArtigoInterinstitucional} \equiv \text{Artigo} \sqcap (\ge 2\,\text{temAutor}.(\exists\text{afiliadoA}.\text{Instituicao}))$$
   *(Refinada e instanciada com precisão semântica através da Regra SWRL R3)*.

### 4.2. Cadeia de Propriedades (*Property Chain Axiom*)

Para capturar a semântica social de coautoria sem exigir anotações redundantes manuais, foi formalizado o axioma de composição de papéis:
$$\text{coautorDe} \sqsupseteq \text{autorDe} \circ \text{temAutor}$$

Dado que $\text{coautorDe}$ é declarada simétrica ($\text{coautorDe} \equiv \text{coautorDe}^-$), sempre que o pesquisador $x$ é autor do artigo $a$ e o pesquisador $y$ também é autor de $a$ ($x \neq y$), o motor de inferência deduz imediatamente que $\text{coautorDe}(x, y)$ e $\text{coautorDe}(y, x)$.

### 4.3. Axiomas de Disjunção e Fechamento de Domínio

Para afastar a Hipótese de Mundo Aberto (*Open World Assumption - OWA*) que consideraria indivíduos ou conceitos coincidentes por omissão de restrição, foram inseridos axiomas explícitos de disjunção:
- **`AllDisjointClasses`**: As 5 superclasses principais são mutuamente disjuntas:
  $$\text{DisjointClasses}(\text{Autor}, \text{Edicao}, \text{Instituicao}, \text{ItemDoEvento}, \text{TemaDePesquisa})$$
- **Distinção Mútua de Indivíduos (`differentFrom` em massa)**: Os 28 temas de pesquisa foram declarados mutualmente distintos par a par:
  $$\text{AllDifferent}(t_1, t_2, \dots, t_{28}) \implies \frac{28 \times 27}{2} = 378\text{ axiomas de desigualdade}$$

---

## 5. Regras Semânticas de Produção em SWRL

Enquanto a Lógica de Descrições provê classificação taxonômica robusta, regras de produção relacionais de causa e efeito que envolvem cruzamento de variáveis livres e predicados de igualdade/desigualdade exigem a expressividade de **SWRL (Semantic Web Rule Language)**. Quatro regras semânticas foram concebidas e validadas:

### Regra R1: Associação de Técnica por Palavra-Chave (`R1_TemaPorPalavraChave`)

Permite a ligação automática entre um artigo e um tema conceitual com base na equivalência sintática de literais em múltiplos idiomas (PT, EN, ES):
$$\text{Artigo}(?a) \land \text{palavraChave}(?a, ?k) \land \text{palavraChaveAssociada}(?t, ?k) \to \text{abordaTecnica}(?a, ?t)$$
*Leitura em Português:* "SE o artigo $a$ possui palavra-chave $k$ E o tema $t$ possui palavra-chave associada $k$, ENTÃO o artigo $a$ aborda a técnica $t$."

### Regra R2: Derivação de Temas Relacionados (`R2_TemaRelacionado`)

Deriva a coocorrência de temas científicos no workshop, identificando tópicos de pesquisa que convergem na mesma publicação:
$$\text{Artigo}(?a) \land \text{abordaTecnica}(?a, ?t1) \land \text{abordaTecnica}(?a, ?t2) \land \text{differentFrom}(?t1, ?t2) \to \text{temaRelacionadoCom}(?t1, ?t2)$$
*Leitura em Português:* "SE o artigo $a$ aborda o tema $t_1$ E aborda o tema $t_2$, sendo $t_1$ diferente de $t_2$, ENTÃO o tema $t_1$ relaciona-se conceitualmente com o tema $t_2$."

### Regra R3: Classificação de Artigo Interinstitucional (`R3_ArtigoInterinstitucional`)

Identifica de forma estrita artigos de cooperação entre diferentes centros acadêmicos através do built-in de desigualdade `swrlb:notEqual`:
$$\begin{aligned}
\text{Artigo}(?a) \land \text{temAutor}(?a, ?x) \land \text{temAutor}(?a, ?y) \land \text{afiliadoA}(?x, ?i) \land \text{afiliadoA}(?y, ?j) \\
\land \text{nome}(?x, ?nx) \land \text{nome}(?y, ?ny) \land \text{swrlb:notEqual}(?nx, ?ny) \\
\land \text{nomeInstituicao}(?i, ?ni) \land \text{nomeInstituicao}(?j, ?nj) \land \text{swrlb:notEqual}(?ni, ?nj) \\
\to \text{ArtigoInterinstitucional}(?a)
\end{aligned}$$
*Leitura em Português:* "SE o artigo $a$ tem autores distintos $x$ e $y$, afiliados a instituições $i$ e $j$ cujos nomes oficiais são diferentes, ENTÃO o artigo $a$ é classificado como Artigo Interinstitucional."

### Regra R4: Participação Institucional no Evento (`R4_ParticipacaoInstitucional`)

Conecta a instituição diretamente à edição do evento a partir do histórico de publicações de seus docentes e alunos:
$$\text{Instituicao}(?i) \land \text{possuiAutor}(?i, ?x) \land \text{autorDe}(?x, ?a) \land \text{publicadoEm}(?a, ?e) \to \text{participouDe}(?i, ?e)$$
*Leitura em Português:* "SE a instituição $i$ possui autor $x$, que é autor do artigo $a$, e $a$ foi publicado na edição $e$, ENTÃO a instituição $i$ participou formalmente da edição $e$."

---

## 6. Avaliação Experimental e Resultados de Inferência

A validação da ontologia foi realizada no ambiente **Protégé 5.6**, empregando o raciocinador **HermiT 1.4.3** (para verificação de consistência e classificação DL) e o motor de regras **Drools via SWRLTab** (para disparo das regras R1 a R4 no fluxo OWL $\to$ Drools $\to$ OWL).

### 6.1. Verificação de Consistência e Satisfatibilidade

A execução do raciocinador HermiT confirmou que a ontologia é **estritamente consistente** e que nenhuma de suas 23 classes é insatisfatível ($\text{Classe} \not\sqsubseteq \bot$). Os axiomas de disjunção e de cardinalidade qualificada operaram sem gerar conflitos lógicos.

### 6.2. Métricas Quantitativas do Grafo Ontológico

A Tabela 1 sintetiza o inventário completo dos elementos presentes na versão 7 da ontologia:

| Componente Estrutural | Quantidade | Descrição / Observação |
| :--- | :---: | :--- |
| **Total de Triplas RDF** | **2.584** | Grafo completo serializado em Turtle (`.ttl`) |
| **Classes Nomeadas** | 23 | Conceitos do domínio e especializações |
| **Classes Definidas por Equivalência ($\equiv$)** | 7 | Condições necessárias e suficientes em DL |
| **Propriedades de Objeto** | 12 | Incluindo simétricas, funcionais e inversas |
| **Propriedades de Dados** | 10 | Literais tipados (`xsd:string`, `xsd:anyURI`, `xsd:integer`) |
| **Indivíduos Nomeados (*Named Individuals*)** | 148 | 32 artigos, 55 autores, 28 temas, 19 instituições, 3 trilhas |
| **Regras Semânticas SWRL** | 4 | Regras R1, R2, R3 e R4 ativas no SWRLTab |
| **Axiomas `differentFrom`** | 378 | Distinção mútua par a par entre os 28 temas de pesquisa |
| **Expressividade Formal** | $\mathcal{SROIQ}^{(D)}$ | Lógica de Descrições de alta expressividade |

### 6.3. Quantificação de Novos Conhecimentos Derivados

A execução do motor Drools sobre as 2.584 triplas originais gerou os seguintes novos fatos semânticos, comprovando a eficácia das regras:

| Regra Semântica | Predicado ou Classe Inferida | Total de Fatos Derivados | Impacto no Conhecimento do Catálogo |
| :--- | :--- | :---: | :--- |
| **Regra R1** | `abordaTecnica` | **52 novas asserções** | Liga artigos a temas canônicos por sinonímia de palavras-chave. |
| **Regra R2** | `temaRelacionadoCom` | **58 novas correlações** | Descoberta de interdisciplinaridade temática no WER 2026. |
| **Regra R3** | `ArtigoInterinstitucional` | **20 classificações** | Artigos com colaboração entre diferentes universidades. |
| **Regra R4** | `participouDe` | **33 participações** | Mapeamento institucional completo da edição 2026. |

---

## 7. Operacionalização Semântica: A Ferramenta WerOntoView

Como contribuição aplicada que materializa e valida a ontologia, desenvolveu-se o **WerOntoView** — uma ferramenta web criada para superar as barreiras de usabilidade do Protégé, viabilizando tanto a avaliação detalhada por especialistas quanto a busca intuitiva por usuários comuns.

### 7.1. Arquitetura Client-Side Formalizada em ADL ACME

Para assegurar **privacidade absoluta (zero-backend)** e desempenho instantâneo, a ferramenta foi concebida como uma Single Page Application estática. Sua arquitetura de software foi formalmente especificada na Linguagem de Descrição Arquitetural **ADL ACME**:

```acme
System WerOntoView : WebSemanticViewerFamily = new WebSemanticViewerFamily extended with {
    Component ParserSubsystem = {
        Port turtleInput, xmlInput, astOutput;
        Property engine = "N3.js Streaming Parser + DOMParser";
    }
    Component ReasoningBridge = {
        Port rawAstIn, inferredGraphOut;
        Property structuralInference = "C == D and ... => C subClassOf D (RF-19)";
        Property ruleExecution = "SWRL R1 Matching Client-Side (RF-60)";
    }
    Component GraphRenderer = {
        Port graphDataIn, visualEventsOut;
        Property engine = "Cytoscape.js Headless Canvas";
        Property layout = "cose-bilkent / concentric";
    }
    Component UIContainer = {
        Port expertView, userPortalView;
        Property responsive = true;
    }
    Connector SemanticPipe = {
        Role source, sink;
    }
    Attachments {
        ParserSubsystem.astOutput to SemanticPipe.source;
        ReasoningBridge.rawAstIn to SemanticPipe.sink;
    }
}
```

### 7.2. Resolução de Desafios Críticos de Visualização Ontológica

A implementação do WerOntoView abordou e resolveu diretamente cinco problemas frequentes encontrados em visualizadores genéricos de ontologias:

1. **Eliminação de Nós Anônimos (`n3-NNN`) (RF-16):** Nós anônimos (*blank nodes*) gerados por restrições ou listas RDF (`rdf:first`/`rdf:rest`) são filtrados e nunca desenhados como nós soltos. Restrições OWL são convertidas em texto no painel da classe, regras SWRL vão para a aba dedicada e axiomas de distinção são compactados.
2. **Compactação de Axiomas em Massa (RF-16.2):** Os 378 axiomas de `differentFrom` e blocos de `AllDisjointClasses` são agrupados em uma única linha legível (*"5 classes mutuamente disjuntas"*, *"28 temas mutuamente distintos"*), com opção de expansão sob demanda.
3. **Rótulos Integros sem Truncamento (RF-17):** Os nós do grafo utilizam forma `round-rectangle` com cálculo dinâmico de largura:
   $$W_{\text{node}} = \max\Big(90, \text{comprimento\_texto} \times 8.2 + 28\Big)\text{ px}$$
   garantindo que nomes longos (como *ArtigoInterinstitucional*) nunca transbordem o nó.
4. **Ocultação de Inversas e Agrupamento de Arestas (RF-18 e RF-18.1):** No modo simples, propriedades inversas (`eAbordadaPor`, `possuiAutor`) são omitidas e múltiplas arestas entre o mesmo par de classes são consolidadas em uma única aresta agrupada, reduzindo a poluição visual em mais de 65%.
5. **Inferência Estrutural de Superclasses para Classes Definidas (RF-19):** Classes definidas por interseção ($C \equiv D \sqcap \dots$) que não possuíam `rdfs:subClassOf` explícito (como ocorre na v6 da ontologia) têm a aresta de herança deduzida estruturalmente ($C \sqsubseteq D$), sendo desenhadas abaixo de $D$ com traçado tracejado (`dashed`).

### 7.3. O Portal Simplificado do Usuário Comum (Busca por Tópicos)

Para atender a pesquisadores e estudantes sem conhecimento prévio de Web Semântica, o WerOntoView disponibiliza o **Portal do Usuário** (`UserPortal`):
- **Busca Facetada por Tópicos:** Filtros dinâmicos em pílulas para os 28 temas de pesquisa.
- **Execução em Memória da Regra SWRL R1:** A ferramenta realiza o casamento entre palavras-chave de artigos e temas, descobrindo as 52 associações instantaneamente.
- **Acesso Direto à Literatura:** Cards de artigos com link direto para o PDF oficial nos proceedings do WER, DOI, autores e instituições.
- **Explicação Semântica Didática:** Modal com linguagem natural explicando *"Por que este artigo foi associado a este tópico?"*, traduzindo o raciocínio semântico de forma transparente.

### 7.4. Inspetor DL e Módulo Diff Pré/Pós-Inferência

- **Alternador Manchester PT $\leftrightarrow$ DL Formal (RF-30):** Tradução em tempo real de axiomas complexos para português estruturado ou símbolos canônicos de Lógica de Descrições.
- **Módulo Diff (RF-40 a RF-42):** Carregamento de arquivos pré e pós-inferência (ex.: pré e pós-Drools), destacando visualmente as novas triplas derivadas, classes atribuídas e propriedades geradas.

---

## 8. Conclusões e Trabalhos Futuros

Este trabalho demonstrou como a integração entre **modelagem ontológica formal em OWL 2 DL**, **regras de produção SWRL** e uma **ferramenta de visualização e recuperação moderna (WerOntoView)** soluciona os desafios de descoberta e organização de conhecimento científico no domínio da Engenharia de Requisitos.

A ontologia do Catálogo WER 2026 provou-se consistente, expressiva e semanticamente rica, viabilizando a derivação automática de dezenas de conexões institucionais, colaborativas e temáticas. Como complemento prático, o WerOntoView removeu as barreiras de usabilidade do Protégé, disponibilizando tanto um ambiente rigoroso de inspeção para especialistas quanto um portal simplificado de busca para o público amplo.

Como trabalhos futuros, prevê-se: (i) a extensão da ontologia para incorporar métricas de citação e coautoria longitudinal das edições anteriores do WER; (ii) o suporte a consultas SPARQL interativas diretamente na interface do WerOntoView; e (iii) a integração com modelos de linguagem de grande porte (LLMs) para geração de resumos ontológicos sob demanda.

---

## Agradecimentos

Os autores agradecem ao Centro de Informática da Universidade Federal de Pernambuco (CIn / UFPE) e ao Professor Dr. Frederico Luiz Gonçalves de Freitas pela orientação técnica e acadêmica na condução deste projeto na disciplina de Web Semântica.

---

## Referências Bibliográficas

1. BAADER, F.; HORROCKS, I.; LUTZ, C.; SATTLER, U. *An Introduction to Description Logic*. Cambridge: Cambridge University Press, 2017.
2. GARLAN, D.; MONROE, R. T.; WILE, D. *Acme: Architectural Description of Component-Based Systems*. In: Foundations of Component-Based Systems, Cambridge University Press, 2000, p. 47-68.
3. HORROCKS, I.; PATEL-SCHNEIDER, P. F.; BOLEY, H.; TABET, S.; GROSOF, B.; DEAN, M. *SWRL: A Semantic Web Rule Language Combining OWL and RuleML*. W3C Member Submission, 2004. Disponível em: <https://www.w3.org/Submission/SWRL/>.
4. IEEE Computer Society. *IEEE Recommended Practice for Software Requirements Specifications (IEEE Std 830-1998)*. Nova Iorque: IEEE, 1998.
5. ISO/IEC/IEEE. *Systems and software engineering — Life cycle processes — Requirements engineering (ISO/IEC/IEEE 29148:2018)*. Genebra: ISO, 2018.
6. NOY, N. F.; McGUINNESS, D. L. *Ontology Development 101: A Guide to Creating Your First Ontology*. Stanford Knowledge Systems Laboratory Technical Report KSL-01-05, Stanford University, 2001.
7. W3C OWL Working Group. *OWL 2 Web Ontology Language Document Overview (Second Edition)*. W3C Recommendation, 2012. Disponível em: <https://www.w3.org/TR/owl2-overview/>.
8. WER 2026. *Proceedings of the 29th Workshop on Requirements Engineering*. Natal, Brasil, 2026.
