# Modelagem e Inferência Semântica no Catálogo de Publicações do WER 2026: Uma Ontologia em OWL 2 DL com Regras SWRL

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

Este artigo técnico apresenta o projeto, a especificação formal e a validação empírica da ontologia do **Catálogo de Publicações do WER (Workshop on Requirements Engineering)** na sua edição de 2026. Construída com base no padrão **OWL 2 DL** (Web Ontology Language - Description Logics) e enriquecida com regras semânticas em **SWRL (Semantic Web Rule Language)**, a ontologia estrutura o ecossistema científico do evento, interligando artigos científicos, pesquisadores, afiliações institucionais, tópicos temáticos e proceedings. Demonstra-se como axiomas de lógica de descrições — tais como classes definidas por interseção e restrições de cardinalidade qualificada — aliados a regras SWRL executadas em motor de inferência (fluxo OWL $\to$ Drools $\to$ OWL), viabilizam a descoberta automatizada de 52 novas asserções de técnicas abordadas, 58 correlações temáticas, 33 vínculos institucionais e a classificação automática de artigos interinstitucionais e colaborativos. Os resultados comprovam a eficácia da modelagem ontológica na recuperação de informação acadêmica de alta precisão.

**Palavras-chave:** Web Semântica, Ontologias OWL 2 DL, Regras SWRL, Engenharia de Requisitos, Catálogo WER, Inferência Semântica.

---

## 1. Introdução

A disseminação de produção científica em conferências e simpósios especializados gera repositórios volumosos e heterogêneos de literatura. No domínio da Engenharia de Requisitos (ER), o *Workshop on Requirements Engineering (WER)* consolidou-se como o principal fórum da Ibero-América, reunindo anualmente artigos, tutoriais e palestras em múltiplos idiomas (português, espanhol e inglês). Contudo, sistemas tradicionais de busca em bibliotecas digitais baseiam-se em correspondência sintática exata de termos, falhando em capturar relações conceituais tácitas, tais como coautoria indireta, temas correlacionados ou a classificação automática de artigos de cooperação interinstitucional.

Para solucionar essas limitações, foi desenvolvida a **Ontologia do Catálogo WER (versão 7)**, como parte das atividades da disciplina de Web Semântica do Centro de Informática da UFPE. O objetivo central é fornecer um arcabouço semântico formal capaz de organizar o catálogo de publicações de 2026 e viabilizar raciocínio automatizado por meio de lógica descritiva e regras de produção.

---

## 2. Metodologia de Desenvolvimento e Questões de Competência

A ontologia foi concebida segundo as diretrizes metodológicas da *Ontology Development 101* e do framework *NeOn*, partindo do levantamento de requisitos de domínio e da formulação de Questões de Competência (*Competency Questions* - CQs) que o modelo deve responder:

- **CQ-01:** Quais artigos abordam determinada técnica ou tema de pesquisa (ex.: *Elicitação de Requisitos* ou *Requisitos Não-Funcionais*) mesmo quando o título não contém explicitamente o nome formal do tema?
- **CQ-02:** Quais artigos possuem colaboração entre múltiplos pesquisadores (*Artigo Colaborativo*) ou foram elaborados em autoria única?
- **CQ-03:** Quais artigos configuram cooperação interinstitucional, envolvendo autores de universidades distintas?
- **CQ-04:** Quem são os coautores de determinado pesquisador, considerando que a coautoria é estabelecida pelo compartilhamento de um artigo em comum?
- **CQ-05:** Quais instituições participaram ativamente de determinada edição do workshop através da publicação de seus pesquisadores?

---

## 3. Conceitualização e Vocabulário Ontológico

A ontologia foi codificada na sintaxe W3C Turtle (`.ttl`) sob a IRI base `<http://www.cin.ufpe.br/ontologias/wer-catalogo#>`. Ela compõe um grafo de conhecimento contendo **2.584 triplas RDF**, distribuídas entre classes, propriedades de objeto, propriedades de dados e indivíduos nomeados.

### 3.1. Hierarquia de Classes Principais

A taxonomia de conceitos abrange os seguintes núcleos semânticos:

1. **`ItemDoEvento`**: Superclasse geral de produções técnicas e editoriais.
   - **`Artigo`**: Artigos científicos avaliados por pares.
     - **`ArtigoColaborativo`**: Artigo com $\ge 2$ autores.
     - **`ArtigoDeAutoriaUnica`**: Artigo com exatamente 1 autor.
     - **`ArtigoInterinstitucional`**: Artigo envolvendo autores de diferentes instituições.
     - **`ArtigoEmPortugues`**: Artigo cujo idioma é o Português.
     - **`ArtigoEmLinguaEstrangeira`**: Artigo publicado em idioma não-português (Espanhol ou Inglês).
     - **`ArtigoSobreElicitacao`**: Artigo que aborda técnicas de Elicitação de Requisitos.
     - **`ArtigoSobreModelagem`**: Artigo que aborda técnicas de Modelagem de Requisitos.
2. **`Autor`**: Agente humano responsável pela produção intelectual.
3. **`Instituicao`**: Universidade, centro de pesquisa ou organização de afiliação.
4. **`TemaDePesquisa`**: Tópico conceitual ou técnica de ER (ex.: *Acessibilidade, Métodos Ágeis, PLN, IAGenerativa*).
5. **`Edicao`**: Edição anual do evento (ex.: *WER 2026*).
6. **`Trilha`**: Trilha de submissão (ex.: *Trilha de Pesquisa, Trilha de Pós-Graduação, Tutoriais*).
7. **`Idioma`**: Idioma de publicação (*Português, Espanhol, Inglês*).

### 3.2. Propriedades de Objeto (*Object Properties*)

As propriedades de objeto definem os predicados relacionais do domínio, incorporando características lógicas avançadas de OWL 2:

- **`temAutor`** ($\text{Artigo} \to \text{Autor}$): Relaciona um artigo aos seus respectivos autores. Propriedade inversa: **`autorDe`**.
- **`afiliadoA`** ($\text{Autor} \to \text{Instituicao}$): Afiliação institucional do autor. Inversa: **`possuiAutor`**.
- **`abordaTecnica`** ($\text{Artigo} \to \text{TemaDePesquisa}$): Conexão semântica entre artigo e tema. Inversa: **`eAbordadaPor`**.
- **`coautorDe`** ($\text{Autor} \to \text{Autor}$): Relação simétrica entre autores.
- **`temaRelacionadoCom`** ($\text{TemaDePesquisa} \to \text{TemaDePesquisa}$): Relação de proximidade entre temas.
- **`participouDe`** ($\text{Instituicao} \to \text{Edicao}$): Participação da instituição no evento. Inversa: **`temInstituicaoParticipante`**.
- **`temIdioma`** ($\text{Artigo} \to \text{Idioma}$): Idioma do texto. Propriedade funcional.
- **`pertenceATrilha`** ($\text{Artigo} \to \text{Trilha}$): Trilha de aceitação.

### 3.3. Propriedades de Dados (*Datatype Properties*)

- **`titulo`** ($\text{Artigo} \to \text{xsd:string}$): Título integral da publicação.
- **`doi`** ($\text{Artigo} \to \text{xsd:string}$): Identificador de Objeto Digital.
- **`link`** ($\text{Artigo} \to \text{xsd:anyURI}$): URL oficial para o arquivo PDF nos proceedings.
- **`linkPagina`** ($\text{Artigo} \to \text{xsd:anyURI}$): URL da página HTML do artigo.
- **`palavraChave`** ($\text{Artigo} \to \text{xsd:string}$): Palavras-chave atribuídas pelos autores.
- **`palavraChaveAssociada`** ($\text{TemaDePesquisa} \to \text{xsd:string}$): Termos e sinônimos correspondentes ao tema.
- **`nome`** ($\text{Autor} \to \text{xsd:string}$): Nome civil do pesquisador.
- **`nomeInstituicao`** ($\text{Instituicao} \to \text{xsd:string}$): Nome completo da organização acadêmica.
- **`ano`** ($\text{Edicao} \to \text{xsd:integer}$): Ano de realização (2026).

---

## 4. Axiomatização Formal em Lógica de Descrições (DL)

A expressividade formal adotada corresponde à Lógica de Descrições $\mathcal{SROIQ}^{(D)}$, garantindo decidibilidade computacional com alto poder representativo.

### 4.1. Classes Definidas por Equivalência

Em OWL 2 DL, uma classe definida estabelece condições necessárias e suficientes para que uma instância pertença à sua extensão:

1. **Artigo Colaborativo:**
   $$\text{ArtigoColaborativo} \equiv \text{Artigo} \sqcap (\ge 2\,\text{temAutor}.\text{Autor})$$
   *Em Manchester PT:* `Artigo e (temAutor mínimo 2 Autor)`

2. **Artigo de Autoria Única:**
   $$\text{ArtigoDeAutoriaUnica} \equiv \text{Artigo} \sqcap (= 1\,\text{temAutor}.\text{Autor})$$
   *Em Manchester PT:* `Artigo e (temAutor exatamente 1 Autor)`

3. **Artigo em Língua Estrangeira:**
   $$\text{ArtigoEmLinguaEstrangeira} \equiv \text{Artigo} \sqcap \neg(\exists\text{temIdioma}.\{\text{Portugues}\})$$
   *Em Manchester PT:* `Artigo e (não (temIdioma valor Portugues))`

4. **Artigo sobre Elicitação:**
   $$\text{ArtigoSobreElicitacao} \equiv \text{Artigo} \sqcap \exists\text{abordaTecnica}.\text{TecnicaDeElicitacao}$$

### 4.2. Cadeia de Propriedades (*Property Chain Axiom*)

Para modelar que a coautoria entre dois pesquisadores emerge transitivamente do fato de um ser autor de um artigo e o outro também ser autor desse mesmo artigo, utiliza-se a composição de papéis:
$$\text{coautorDe} \sqsupseteq \text{autorDe} \circ \text{temAutor}$$

Como a relação $\text{coautorDe}$ é declarada simétrica ($\text{coautorDe} \equiv \text{coautorDe}^-$), a rede de coautoria entre pesquisadores do WER é inferida de forma imediata.

### 4.3. Axiomas de Disjunção e Distinção Mútua

Para evitar o pressuposto de mundo aberto (*Open World Assumption - OWA*) que consideraria indivíduos ou classes idênticos por omissão:
- **`AllDisjointClasses`**: $\{\text{Autor}, \text{Edicao}, \text{Instituicao}, \text{ItemDoEvento}, \text{TemaDePesquisa}\}$ são mutuamente disjuntos.
- **`differentFrom` em massa**: Os 28 temas de pesquisa foram explicitamente declarados distintos par a par, gerando $\frac{28 \times 27}{2} = 378$ axiomas de distinção mútua.

---

## 5. Regras Semânticas em SWRL

Embora a lógica de descrições resolva classificações hierárquicas, regras relacionais complexas de causa e efeito exigem a expressividade de regras SWRL (Semantic Web Rule Language). Na ontologia foram projetadas 4 regras essenciais:

### Regra R1: Associação de Tema por Palavra-Chave (`R1_TemaPorPalavraChave`)
Esta regra relaciona o artigo a um tema de pesquisa caso o artigo contenha uma palavra-chave idêntica a uma palavra-chave associada ao tema, unificando sinônimos em PT, EN e ES:
$$\text{Artigo}(?a) \land \text{palavraChave}(?a, ?k) \land \text{palavraChaveAssociada}(?t, ?k) \to \text{abordaTecnica}(?a, ?t)$$

### Regra R2: Derivação de Temas Relacionados (`R2_TemaRelacionado`)
Se um mesmo artigo aborda dois temas distintos, esses dois temas passam a ter correlação conceitual:
$$\text{Artigo}(?a) \land \text{abordaTecnica}(?a, ?t1) \land \text{abordaTecnica}(?a, ?t2) \land \text{differentFrom}(?t1, ?t2) \to \text{temaRelacionadoCom}(?t1, ?t2)$$

### Regra R3: Classificação de Artigo Interinstitucional (`R3_ArtigoInterinstitucional`)
Identifica artigos com múltiplos autores vinculados a instituições de nomes diferentes:
$$\begin{aligned}
\text{Artigo}(?a) \land \text{temAutor}(?a, ?x) \land \text{temAutor}(?a, ?y) \land \text{afiliadoA}(?x, ?i) \land \text{afiliadoA}(?y, ?j) \\
\land \text{nome}(?x, ?nx) \land \text{nome}(?y, ?ny) \land \text{swrlb:notEqual}(?nx, ?ny) \\
\land \text{nomeInstituicao}(?i, ?ni) \land \text{nomeInstituicao}(?j, ?nj) \land \text{swrlb:notEqual}(?ni, ?nj) \\
\to \text{ArtigoInterinstitucional}(?a)
\end{aligned}$$

### Regra R4: Participação Institucional no Evento (`R4_ParticipacaoInstitucional`)
Deriva a participação de uma instituição na edição caso ela possua um autor com artigo publicado nela:
$$\text{Instituicao}(?i) \land \text{possuiAutor}(?i, ?x) \land \text{autorDe}(?x, ?a) \land \text{publicadoEm}(?a, ?e) \to \text{participouDe}(?i, ?e)$$

---

## 6. Avaliação Experimental e Resultados de Inferência

A validação da ontologia foi conduzida através do raciocinador HermiT (para validação de consistência e classificação DL) e do Drools / SWRLTab no Protégé 5.6. Os experimentos confirmaram que a ontologia é consistente e livre de classes insatisfatíveis.

### Métricas Quantitativas da Base

| Componente | Quantidade | Observação |
| :--- | :--- | :--- |
| **Total de Triplas RDF** | 2.584 | Arquivo base v7 |
| **Classes Nomeadas** | 23 | Classes do domínio |
| **Classes Definidas ($\equiv$)** | 7 | Inferência estrutural |
| **Propriedades de Objeto** | 12 | Incluindo 4 inversas |
| **Propriedades de Dados** | 10 | Títulos, links, nomes, DOIs |
| **Indivíduos Nomeados** | 148 | 32 artigos, 55 autores, 12 temas, etc. |
| **Regras Semânticas SWRL** | 4 | R1, R2, R3 e R4 |
| **Axiomas differentFrom** | 378 | Temas mutuamente distintos |

### Resultados do Processo de Inferência (OWL $\to$ Drools $\to$ OWL)

Ao confrontar o arquivo pré-inferência e pós-inferência, o motor gerou os seguintes novos fatos semânticos:
- **`abordaTecnica`**: **52 novas asserções** geradas pela Regra R1;
- **`temaRelacionadoCom`**: **58 novas correlações** geradas pela Regra R2;
- **`participouDe`**: **33 participações institucionais** derivadas pela Regra R4;
- **`ArtigoInterinstitucional`**: **20 publicações** classificadas automaticamente pela Regra R3.

Esses números comprovam a capacidade de geração de novos conhecimentos a partir de regras declarativas explícitas.

---

## 7. Conclusões

A ontologia do Catálogo WER 2026 demonstra o potencial das tecnologias semânticas na organização da literatura técnica em Engenharia de Requisitos. O uso conjunto de axiomas formais em OWL 2 DL e regras SWRL viabilizou consultas semânticas avançadas e a descoberta de conexões não triviais entre autores, temas e instituições. O artefato serve como base de dados sólida para motores de busca semântica e ferramentas analíticas sobre a evolução científica da comunidade do WER.

---

## Referências

1. W3C OWL Working Group. *OWL 2 Web Ontology Language Document Overview (Second Edition)*. W3C Recommendation, 2012.
2. HORROCKS, I.; PATEL-SCHNEIDER, P. F.; BOLEY, H.; TABET, S.; GROSOF, B.; DEAN, M. *SWRL: A Semantic Web Rule Language Combining OWL and RuleML*. W3C Member Submission, 2004.
3. NOY, N. F.; McGUINNESS, D. L. *Ontology Development 101: A Guide to Creating Your First Ontology*. Stanford Knowledge Systems Laboratory Technical Report, 2001.
4. BAADER, F.; HORROCKS, I.; LUTZ, C.; SATTLER, U. *An Introduction to Description Logic*. Cambridge University Press, 2017.
5. WER 2026. *Proceedings of the 29th Workshop on Requirements Engineering*. Natal, Brasil, 2026.
