# Especificação de Requisitos de Software (SRS) — WerOntoView

**Projeto:** WerOntoView — Visualizador e Recuperador Semântico Web de Ontologias OWL & SWRL  
**Equipe de Desenvolvimento:** Samuel Celso Anjos Neto, Pedro Henrique Dantas  
**Orientação:** Prof. Dr. Frederico Luiz Gonçalves de Freitas  
**Instituição:** Centro de Informática — Universidade Federal de Pernambuco (CIn / UFPE)  
**Versão:** 2.0 (Norma IEEE 830 / ISO/IEC/IEEE 29148)  
**Data:** Novembro de 2026  

---

## 1. Introdução

### 1.1. Propósito
Este documento estabelece a Especificação de Requisitos de Software (SRS) para o sistema **WerOntoView**, uma ferramenta web 100% estática destinada à leitura, exploração visual, inferência semântica e recuperação de informações em ontologias OWL 2 DL e regras SWRL.

### 1.2. Escopo do Produto
O WerOntoView substitui a complexidade de interfaces pesadas como o Protégé em contextos de apresentação, bancas e exploração por leigos, provendo:
- Dois modos de interação: **Portal de Busca Semântica (Usuário Comum)** e **Inspetor Ontológico OWL DL (Especialista)**;
- Tradução de axiomas DL em sintaxe Manchester no vernáculo em português;
- Visualização e rastreamento de regras SWRL;
- Grafo conceitual interativo sem poluição visual por nós anônimos;
- Módulo de comparação (*Diff*) de inferência pré e pós-execução de raciocinadores;
- Exportação de dados estruturados para relatórios acadêmicos.

### 1.3. Definições, Acrônimos e Abreviações
- **OWL:** *Web Ontology Language* (W3C Recommendation).
- **DL:** *Description Logics* (Lógica de Descrições).
- **SWRL:** *Semantic Web Rule Language*.
- **Blank Node (Nó Anônimo):** Elemento RDF sem IRI identificadora explícita (`_:bnode`).
- **WCAG:** *Web Content Accessibility Guidelines*.
- **MoSCoW:** Técnica de priorização (*Must have*, *Should have*, *Could have*, *Won't have*).

---

## 2. Descrição Geral

### 2.1. Perfis de Usuários
1. **Pesquisador / Especialista em Ontologia:** Desenvolveu modelos semânticos no Protégé e necessita apresentar axiomas, regras SWRL e o grafo relacional com clareza conceitual.
2. **Banca Examinadora / Professor:** Avalia o trabalho sem a obrigação de instalar softwares nativos ou configurar ambientes Java/Maven.
3. **Usuário Comum / Estudante / Leitor Geral:** Deseja pesquisar literatura científica no repositório do WER por tópicos e palavras-chave, compreendendo as conexões semânticas sem necessidade de conhecer formalismos lógicos.

### 2.2. Restrições Gerais de Projeto
- **Hospedagem Estática Obrigatória:** O software deve rodar a partir de arquivos estáticos em servidores CDN como Vercel ou GitHub Pages.
- **Processamento no Navegador:** Nenhum dado ontológico é enviado para servidores externos.

---

## 3. Requisitos do Sistema

### 3.1. Requisitos Funcionais (RF)

#### Módulo 1: Entrada e Carga de Ontologias (MoSCoW: Deve)
- **RF-01 (Deve):** Suportar carga de arquivos nos formatos Turtle (`.ttl`) e RDF/XML (`.owl`, `.rdf`, `.xml`) via botão de seleção e mecanismo de arrastar-e-soltar (*drag-and-drop*).
- **RF-01.1 (Deve):** O sistema deve detectar o formato sintático pelo conteúdo real do arquivo, e não somente pela extensão.
- **RF-02 (Deve):** Erros de sintaxe ou malformação de RDF devem gerar avisos informativos com linha aproximada, sem interrupção abrupta da interface.
- **RF-03 (Deve):** O sistema deve conter um botão "Carregar exemplo" que carrega instantaneamente a ontologia oficial do Catálogo WER (`wer-catalogo-v7-regras-swrl.ttl`).
- **RF-04 (Deveria):** Permitir o carregamento de um segundo arquivo ontológico para fins de comparação de inferência (*Diff*).

#### Módulo 2: Sanitização e Tratamento de Nós Anônimos (MoSCoW: Deve)
- **RF-16 (Deve):** Nós anônimos (*blank nodes*, tais como identificadores internos `n3-NNN` ou `_:bnode`) nunca devem ser desenhados como nós soltos de classe ou indivíduo no grafo.
- **RF-16.1 (Deve):** Nós anônimos com `rdf:type swrl:Imp` devem ser direcionados para o catálogo de regras SWRL.
- **RF-16.2 (Deve):** Nós anônimos com `owl:AllDisjointClasses` ou `owl:AllDifferent` devem ser canalizados para a lista de axiomas em uma linha compacta (ex.: *"5 classes mutuamente disjuntas"*), com controle expansível.
- **RF-16.3 (Deve):** Nós anônimos usados como restrição (`owl:Restriction`) ou interseção (`owl:intersectionOf`) devem ser lidos como expressões conceituais e exibidos no painel da classe.
- **RF-16.4 (Deve):** Listas RDF encadeadas (`rdf:first` / `rdf:rest`) devem ser resolvidas recursivamente até o terminador `rdf:nil` e apresentadas como coleções contínuas de itens.
- **RF-16.5 (Deve):** Nós anônimos de tipo desconhecido devem gerar notificação informativa na lista de axiomas em vez de corromper a representação gráfica.

#### Módulo 3: Hierarquia e Inferência Estrutural de Classes (MoSCoW: Deve)
- **RF-11 (Deve):** Exibir a taxonomia completa de classes em árvore retrátil (*Class Tree*), mostrando a contagem de indivíduos por classe.
- **RF-19 (Deve):** Uma classe definida via `owl:equivalentClass` com `owl:intersectionOf` deve ser automaticamente conectada, tanto na árvore quanto no grafo, a cada classe nomeada da interseção, mesmo sem declaração explícita de `rdfs:subClassOf` (e.g., as 7 classes definidas de `Artigo`).
- **RF-19.1 (Deveria):** No grafo, a aresta de herança inferida por equivalência deve possuir estilo visual distinto (linha tracejada âmbar).

#### Módulo 4: Grafo Conceitual Interativo (MoSCoW: Deveria)
- **RF-15 (Deveria):** Renderizar grafo interativo com nós de classes e arestas representando herança e propriedades de objeto, com suporte a zoom, translação e realce de vizinhança ao clique.
- **RF-17 (Deve):** Os rótulos de nós devem ser renderizados na íntegra, com geometria retangular arredondada (*round-rectangle*) e largura dinâmica adaptada ao texto.
- **RF-17.1 (Deveria):** O texto do nó nunca deve extrapolar as bordas do elemento visual.
- **RF-18 (Deveria):** Propriedades inversas declaradas via `owl:inverseOf` devem permanecer ocultas no grafo da visão simples, aparecendo unicamente na visão detalhada.
- **RF-18.1 (Deveria):** Múltiplas propriedades de objeto conectando a mesma dupla de classes (`origem → destino`) devem ser agrupadas em uma aresta única com contador, expandindo a lista de propriedades ao clique.
- **RF-18.2 (Poderia):** Relações reflexivas (*self-loops*, e.g., `coautorDe`, `temaRelacionadoCom`) devem ser desenhadas como laços projetados para fora do nó sem colisão com o rótulo.
- **RF-51 (Deveria):** Exportar o grafo visual como imagem de alta resolução em PNG.

#### Módulo 5: Axiomas DL, Regras SWRL e Visualização Bilíngue (MoSCoW: Deve)
- **RF-30 (Deve):** Exibir restrições em linguagem natural em português estilo Manchester, com comutador em tempo real para Lógica de Descrições formal ($\sqcap, \sqcup, \neg, \exists, \forall, \ge, \le$).
- **RF-32 (Deve):** Colapsar os 378 axiomas de distinção `differentFrom` entre temas em uma única linha no resumo da ontologia.
- **RF-33 (Deve):** Aba dedicada para inspeção de regras SWRL exibindo premissas (corpo) e conclusão (cabeça) em notação lógica ($\land, \to$) e em português (*"SE ... ENTÃO ..."*).
- **RF-34 (Deveria):** No inspetor de classes e propriedades, listar as regras SWRL que as utilizam.

#### Módulo 6: Comparação de Inferência (Diff) (MoSCoW: Deveria)
- **RF-40 (Deveria):** Calcular e exibir as diferenças entre o arquivo pré-inferência e pós-inferência, agrupando em: novas asserções de propriedades, novas classificações de indivíduos e novos axiomas.
- **RF-41 (Deveria):** Destacar com distintivos (*badges*) visuais os elementos inferidos nas telas de detalhes.

#### Módulo 7: Subsite Simplificado de Busca por Tópicos (MoSCoW: Deve)
- **RF-60 (Deve):** Prover um modo de navegação simplificado para usuários comuns acessível diretamente pelo cabeçalho (*Busca por Tópicos*).
- **RF-61 (Deve):** Permitir a busca em tempo real de artigos acadêmicos por tópicos, palavras-chave, autores e afiliação institucional.
- **RF-62 (Deve):** Executar a regra semântica SWRL R1 em tempo de execução para vincular automaticamente os artigos aos temas através da interseção de palavras-chave.
- **RF-63 (Deve):** Prover links diretos para leitura dos PDFs oficiais nos proceedings do WER e botões de explicação semântica didática (*"Por que este artigo aparece aqui?"*).
- **RF-64 (Deveria):** Disponibilizar um guia visual educativo ensinando o conceito de ontologia e Web Semântica em linguagem leiga.

#### Módulo 8: Exportação de Relatórios (MoSCoW: Deveria)
- **RF-50 (Deveria):** Exportar o resumo geral e tabelas de classes, propriedades e regras nos formatos Markdown (`.md`) e CSV (`.csv`).

---

### 3.2. Requisitos Não-Funcionais (RNF)

- **RNF-01 (Privacidade e Segurança):** Processamento estritamente local no navegador (*zero-backend*). Nenhum arquivo ou dado de telemetria pode ser transmitido a servidores remotos.
- **RNF-02 (Desempenho):** O processamento e renderização de ontologias de até 3.000 triplas deve ocorrer em menos de 1,5 segundo em máquinas de configuração padrão.
- **RNF-03 (Idioma):** Interface integralmente localizada em Português do Brasil (PT-BR), priorizando anotações `@pt`.
- **RNF-04 (Compatibilidade de Navegadores):** Execução plena nas versões correntes de Google Chrome, Mozilla Firefox, Microsoft Edge e Safari.
- **RNF-05 (Acessibilidade - WCAG 2.1 AA):** O grafo visual deve possuir uma alternativa equivalente em formato tabular/árvore para garantir leitura por tecnologias assistivas e leitores de tela.
- **RNF-06 (Portabilidade e Deploy):** Suporte nativo a deploy em plataformas de hospedagem estática (Vercel, GitHub Pages) via compilação padrão Vite/React.
- **RNF-07 (Tolerância a Falhas):** Erros em arquivos ontológicos corrompidos não podem ocasionar falha fatal (*crash*) na aplicação.
- **RNF-08 (Otimização de Pacote):** Todos os módulos JavaScript compilados devem ser segregados em blocos inferiores a 500 kB (*vendor code-splitting*).

---

## 4. Matriz de Rastreabilidade

| Código do Requisito | Subsistema / Componente Responsável | Critério de Homologação / Teste |
| :--- | :--- | :--- |
| **RF-01, RF-02** | `FileParserComponent` | Arquivo `.ttl` e `.owl` carregados com sucesso; erro amigável em arquivo corrompido. |
| **RF-03** | `FileLoader` | Clique em "Carregar exemplo" carrega a ontologia v7 com 2.584 triplas. |
| **RF-16 a RF-16.5** | `RDFExtractorComponent` | Zero nós `n3-NNN` no grafo; regras na aba SWRL; disjunções em 5 blocos. |
| **RF-19, RF-19.1** | `RDFExtractor` & `ClassTree` | 7 classes definidas ligadas a `Artigo` com linha tracejada no grafo e badge na árvore. |
| **RF-17, RF-17.1** | `CytoscapeGraphComponent` | Textos longos não cortados; nós dimensionados dinamicamente. |
| **RF-18, RF-18.1** | `CytoscapeGraphComponent` | No máximo 1 aresta entre Artigo e Tema no modo simples; inversas ocultas. |
| **RF-30, RF-33** | `DLFormatter` & `SwrlRulesTab` | Fórmulas lógicas visíveis e traduzidas em português. |
| **RF-60 a RF-64** | `UserPortal` | Busca por tópicos operante; 52 derivações semânticas da regra R1 exibidas. |
| **RNF-01** | Arquitetura Geral | Inspecionar tráfego de rede (Network tab) com zero requisições externas de upload. |
| **RNF-05** | `OntologyGraph` | Aba "Lista Acessível" acessível por teclado e leitor de tela. |

---

## 5. Homologação com os Casos de Teste do WER

A suíte de validação foi executada sobre os arquivos `wer-catalogo-v6-regras-swrl.ttl` e `wer-catalogo-v7-regras-swrl.ttl`, alcançando 100% de conformidade com todos os critérios de aceitação estipulados no projeto acadêmico.
