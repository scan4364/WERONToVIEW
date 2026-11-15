# Requisitos do Visualizador Web de Ontologias OWL

Projeto de Web Semântica (CIn/UFPE) · Samuel Celso e Pedro Dantas · Versão 0.1 · novembro de 2026

## 1. Objetivo

Construir uma ferramenta web, hospedada de forma estática, na qual a pessoa faz o upload de um arquivo OWL e o explora no navegador com mais facilidade do que no Protégé. Por padrão a ferramenta mostra uma **visão simplificada**; quando a pessoa quiser, mostra **todos os detalhes**. Ela também deve apoiar o relatório do projeto, com estatísticas e figuras exportáveis.

## 2. Contexto

A ontologia do projeto é um catálogo semântico do WER (artigos, autores, instituições e temas de pesquisa). Ela usa OWL 2 com axiomas de lógica de descrições (restrições, classes definidas, cadeia de propriedades) e regras SWRL executadas no Drools (fluxo OWL → Drools → OWL). O visualizador deve ser **genérico** (qualquer OWL em Turtle ou RDF/XML), usando essa ontologia como caso de teste.

Já existem ferramentas parecidas (WebVOWL, OntoGraf no Protégé, Widoco). O diferencial pretendido aqui é:

- axiomas DL escritos em português legível;
- visão em camadas (simples e detalhada);
- regras SWRL legíveis;
- comparação do arquivo antes e depois da inferência.

## 3. Usuários

- **Aluno ou pesquisador** que modelou uma ontologia no Protégé e quer inspecioná-la e apresentá-la.
- **Leitor** (professor, banca) que recebe o arquivo e quer entendê-lo sem instalar nada.

## 4. Escopo

**Dentro:** leitura e visualização de ontologias.

**Fora da versão 1:** editar a ontologia; rodar raciocinador no navegador; endpoint SPARQL; contas de usuário ou servidor; formatos além de Turtle e RDF/XML (OWL/XML, Functional Syntax e Manchester ficam para a versão 2).

## 5. Requisitos funcionais

Prioridades: **Deve** (essencial), **Deveria** (importante), **Poderia** (desejável).

### 5.1 Entrada de arquivos

- **RF-01 (Deve)** Upload por botão e por arrastar-e-soltar de arquivos .ttl, .owl e .rdf (Turtle e RDF/XML). O formato deve ser detectado pelo conteúdo, não só pela extensão.
- **RF-02 (Deve)** Erro de leitura claro (qual arquivo e, se possível, qual linha), sem travar a página.
- **RF-03 (Deve)** Botão "Carregar exemplo" com a ontologia do projeto embutida, para demonstração sem upload.
- **RF-04 (Deveria)** Carregar um segundo arquivo para comparação (ver RF-40).

### 5.2 Visão simples (padrão)

- **RF-10 (Deve)** Resumo com nome/IRI e comentário da ontologia e as contagens de classes, propriedades de objeto, propriedades de dados, indivíduos, regras SWRL e triplas.
- **RF-11 (Deve)** Árvore da hierarquia de classes (subClassOf), recolhível, com a contagem de indivíduos por classe.
- **RF-12 (Deve)** Lista de propriedades com domínio, imagem (range) e características (funcional, simétrica, transitiva, inversa de outra propriedade).
- **RF-13 (Deve)** Rótulos: mostrar o rdfs:label em português (@pt) e usar o final da IRI como alternativa. A IRI completa aparece só na visão detalhada.
- **RF-14 (Deve)** Busca global por classe, propriedade, indivíduo ou rótulo, com resultados agrupados por tipo.
- **RF-15 (Deveria)** Grafo de classes: nós são classes; arestas são subClassOf e propriedades de objeto (domínio → imagem). Deve ter zoom, arrastar e destaque dos vizinhos ao selecionar. Indivíduos ficam ocultos por padrão.

### 5.3 Visão detalhada (sob demanda)

- **RF-20 (Deve)** Alternância global "Simples ↔ Detalhado". A visão simples oculta anotações técnicas, nós anônimos (blank nodes), axiomas de distinção (differentFrom, AllDifferent) e IRIs completas. A visão detalhada mostra tudo.
- **RF-21 (Deve)** Ao selecionar uma classe: painel com rótulo, comentário, superclasses, subclasses, restrições, equivalências e indivíduos.
- **RF-22 (Deve)** Ao selecionar um indivíduo: classes, propriedades de objeto (cada valor é um link para o outro indivíduo) e propriedades de dados (URLs clicáveis).
- **RF-23 (Deve)** Lista de indivíduos paginada ou virtualizada, com filtro por classe.
- **RF-24 (Deve)** Axiomas DL legíveis em português (ver seção 5.4).
- **RF-25 (Deveria)** Visão crua: as triplas RDF do elemento selecionado.

### 5.4 Axiomas DL e regras SWRL

- **RF-30 (Deve)** Mostrar restrições em sintaxe estilo Manchester, em português, com alternância para a notação DL (⊓, ∃, ≥). Vocabulário: e, ou, não, algum, todos, mínimo, máximo, exatamente, valor. Exemplos do arquivo de teste:
  - ArtigoColaborativo ≡ Artigo e (temAutor mínimo 2 Autor). Em DL: Artigo ⊓ ≥2 temAutor.Autor
  - ArtigoEmLinguaEstrangeira ≡ Artigo e (não (temIdioma valor Portugues)). Em DL: Artigo ⊓ ¬(∃temIdioma.{Portugues})
  - coautorDe ⊒ autorDe ∘ temAutor (cadeia de propriedades)
- **RF-31 (Deve)** Suportar: intersectionOf, unionOf, complementOf, someValuesFrom, allValuesFrom, hasValue, cardinalidades simples e qualificadas, equivalentClass, disjointWith e AllDisjointClasses, inverseOf, propertyChainAxiom, hasKey e características de propriedade.
- **RF-32 (Deve)** Blocos AllDifferent, AllDisjointClasses e os differentFrom em massa aparecem colapsados em uma linha (por exemplo, "28 indivíduos mutuamente distintos"), com opção de expandir.
- **RF-33 (Deve)** Aba de regras SWRL. Para cada swrl:Imp, mostrar nome (rdfs:label), comentário e a regra em forma legível, como `Artigo(?a) ∧ palavraChave(?a,?k) ∧ palavraChaveAssociada(?t,?k) → abordaTecnica(?a,?t)`. Suportar átomos de classe, de propriedade de objeto, de propriedade de dados, differentFrom e built-ins (por exemplo swrlb:notEqual).
- **RF-34 (Deveria)** No painel de uma classe ou propriedade, listar as regras que a usam.

### 5.5 Comparação antes e depois da inferência

- **RF-40 (Deveria)** Com dois arquivos carregados (A = antes; B = depois do Drools → OWL ou de um raciocinador), listar o que existe em B e não em A, agrupado por tipo: novas asserções de propriedade, novos tipos de indivíduos e novos axiomas. Mostrar a contagem total e por propriedade.
- **RF-41 (Deveria)** Destacar (cor ou ícone) os itens inferidos nas telas de indivíduo.
- **RF-42 (Poderia)** Associar cada item novo à regra cuja cabeça usa a mesma propriedade ou classe e permitir filtrar o diff por regra.

### 5.6 Exportação (apoio ao relatório)

- **RF-50 (Deveria)** Exportar resumo e tabelas (classes, propriedades, regras) em Markdown e CSV.
- **RF-51 (Deveria)** Exportar o grafo como SVG ou PNG.
- **RF-52 (Poderia)** Link compartilhável do estado da tela (sem o arquivo dentro).

## 6. Requisitos não funcionais

- **RNF-01** Tudo roda no navegador. Nenhum arquivo é enviado a servidor, e a tela inicial deve avisar isso. Hospedagem estática (por exemplo, GitHub Pages).
- **RNF-02** Desempenho: o arquivo de teste (cerca de 2.600 triplas) carrega em até 2 s. A ferramenta deve suportar cerca de 50.000 triplas sem congelar a interface (leitura em Web Worker e listas virtualizadas).
- **RNF-03** Interface em português do Brasil.
- **RNF-04** Navegadores: versões atuais de Chrome, Firefox e Edge. Desktop primeiro; utilizável em tablet.
- **RNF-05** Acessibilidade básica (WCAG 2.1 AA): navegação por teclado, contraste adequado e alternativa em texto. O grafo precisa de uma alternativa equivalente em árvore ou lista.
- **RNF-06** Código em repositório com README e instruções para rodar localmente.
- **RNF-07** Robustez: arquivo inválido ou vazio nunca derruba a aplicação. Construções OWL não suportadas devem gerar um aviso, não ser ignoradas em silêncio.

## 7. Sugestões técnicas (o dev decide)

- **Leitura de arquivos:** N3.js (Turtle) e rdfxml-streaming-parser ou rdflib.js (RDF/XML). Listas RDF (rdf:first e rdf:rest) e nós anônimos são a parte mais trabalhosa, pois restrições, equivalentClass e regras SWRL vêm nesse formato.
- **Regras SWRL em RDF:** nós swrl:Imp com swrl:body e swrl:head (listas swrl:AtomList). Os átomos são swrl:ClassAtom, IndividualPropertyAtom, DatavaluedPropertyAtom, DifferentIndividualsAtom e BuiltinAtom. As variáveis são IRIs do tipo `urn:swrl#nome`.
- **Grafo:** Cytoscape.js ou vis-network. Para a interface, qualquer framework ou JavaScript puro.
- **Protégé:** ele pode salvar o mesmo conteúdo em formatos diferentes. Testar com o Turtle e o RDF/XML do mesmo arquivo.

## 8. Fluxos principais

1. **Explorar:** abrir a ferramenta, carregar o exemplo ou um arquivo, ver o resumo, abrir a árvore de classes, selecionar uma classe e ver seus indivíduos.
2. **Entender uma classe definida:** buscar "ArtigoColaborativo", ler a definição em português e alternar para a notação DL.
3. **Ver o que o motor inferiu:** carregar o arquivo antes e depois do Drools e ver a lista de novidades por propriedade.
4. **Preparar o relatório:** exportar o resumo em Markdown e o grafo em SVG.

## 9. Critérios de aceitação

Arquivo de teste: `wer-catalogo-v6-regras-swrl.ttl` (2.571 triplas e 4 regras SWRL).

- O resumo mostra 4 regras SWRL, e as demais contagens coincidem com as do Protégé (aba Active ontology, métricas).
- ArtigoColaborativo, ArtigoEmLinguaEstrangeira e a cadeia de coautorDe aparecem como nos exemplos do RF-30.
- Os 378 axiomas differentFrom entre os temas aparecem em uma linha na visão simples.
- Os rótulos aparecem em português, e a IRI completa só aparece na visão detalhada.
- Ao carregar o arquivo antes e depois do Drools → OWL, o diff lista novas asserções de abordaTecnica, temaRelacionadoCom e participouDe, além de novos membros de ArtigoInterinstitucional. Valores esperados pelas regras: 52, 58, 33 e 20; confirmar com o arquivo exportado do Protégé.
- Um arquivo corrompido mostra uma mensagem de erro, e a tela continua funcionando.

## 10. Marcos sugeridos

- **M1:** leitura de Turtle e RDF/XML e resumo (RF-01 a RF-03, RF-10, RF-13).
- **M2:** árvore, propriedades, indivíduos, busca e alternância simples/detalhado (RF-11, RF-12, RF-14, RF-20 a RF-23).
- **M3:** axiomas DL legíveis e regras SWRL (RF-30 a RF-33).
- **M4:** grafo, comparação antes/depois, exportação e publicação (RF-15, RF-40, RF-50, RF-51).

Ajustar os marcos às datas das entregas da disciplina.

## 11. Pontos em aberto

- Qual formato testar primeiro: Turtle ou RDF/XML (o Protégé salva ambos).
- Nome da ferramenta.
- Limite de tamanho de arquivo suportado na versão 1.
