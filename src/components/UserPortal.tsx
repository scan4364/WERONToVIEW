import React, { useState, useMemo } from 'react';
import { 
  Search, 
  BookOpen, 
  FileText, 
  User, 
  Building2, 
  ExternalLink, 
  Sparkles, 
  Tag, 
  Globe, 
  HelpCircle, 
  Filter, 
  ChevronRight,
  Layers,
  ArrowRight,
  CheckCircle2,
  Share2,
  X,
  Info,
  Calendar,
  GraduationCap
} from 'lucide-react';
import { OntologyModel } from '../types/ontology';

interface UserPortalProps {
  model: OntologyModel;
  onOpenSpecialistView: () => void;
  onSelectEntity?: (type: 'class' | 'property' | 'individual', iri: string) => void;
}

interface ArticleData {
  iri: string;
  id: string;
  title: string;
  doi?: string;
  pdfUrl?: string;
  pageUrl?: string;
  keywords: string[];
  language: string;
  track?: string;
  authors: { iri: string; name: string; institution?: string }[];
  topics: { iri: string; label: string; matchedKeyword?: string }[];
  isCollaborative?: boolean;
  isSingleAuthor?: boolean;
  isInterinstitutional?: boolean;
}

interface TopicData {
  iri: string;
  label: string;
  description?: string;
  keywords: string[];
  articleCount: number;
}

export const UserPortal: React.FC<UserPortalProps> = ({
  model,
  onOpenSpecialistView,
  onSelectEntity
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'articles' | 'topics' | 'authors' | 'guide'>('articles');
  const [semanticModalArticle, setSemanticModalArticle] = useState<ArticleData | null>(null);

  // 1. Extrair mapa de tópicos (Temas de Pesquisa) e suas palavras-chave associadas
  const topicsMap = useMemo(() => {
    const map = new Map<string, TopicData>();

    Object.values(model.individuals).forEach(ind => {
      // Verifica se o indivíduo é do tipo TemaDePesquisa
      const isTopic = ind.types.some(t => t.endsWith('#TemaDePesquisa') || t.endsWith('TemaDePesquisa'));
      if (isTopic) {
        // Palavras-chave associadas ao tema
        const keywords = ind.dataProperties
          .filter(dp => dp.propertyIri.endsWith('palavraChaveAssociada') || dp.propertyIri.endsWith('palavraChave'))
          .map(dp => dp.value.trim());

        map.set(ind.iri, {
          iri: ind.iri,
          label: ind.label,
          description: ind.comment,
          keywords,
          articleCount: 0
        });
      }
    });

    return map;
  }, [model]);

  // 2. Extrair artigos completos com derivação semântica da Regra SWRL R1 (palavraChave ∩ palavraChaveAssociada)
  const articles = useMemo(() => {
    const list: ArticleData[] = [];

    Object.values(model.individuals).forEach(ind => {
      const isArticle = ind.types.some(t => t.endsWith('#Artigo') || t.endsWith('Artigo') || t.endsWith('#ItemDoEvento'));
      if (!isArticle) return;

      const titleProp = ind.dataProperties.find(dp => dp.propertyIri.endsWith('titulo'));
      const title = titleProp?.value || ind.label;

      const doi = ind.dataProperties.find(dp => dp.propertyIri.endsWith('doi'))?.value;
      const pdfUrl = ind.dataProperties.find(dp => dp.propertyIri.endsWith('link') && !dp.propertyIri.endsWith('linkPagina'))?.value;
      const pageUrl = ind.dataProperties.find(dp => dp.propertyIri.endsWith('linkPagina'))?.value;

      const keywords = ind.dataProperties
        .filter(dp => dp.propertyIri.endsWith('palavraChave'))
        .map(dp => dp.value.trim());

      const langAssertion = ind.objectProperties.find(op => op.propertyIri.endsWith('temIdioma'));
      const language = langAssertion?.targetLabel || 'Não informado';

      const trackAssertion = ind.objectProperties.find(op => op.propertyIri.endsWith('pertenceATrilha'));
      const track = trackAssertion?.targetLabel;

      // Autores com suas instituições
      const authors = ind.objectProperties
        .filter(op => op.propertyIri.endsWith('temAutor'))
        .map(op => {
          const authorInd = model.individuals[op.targetIri];
          const instAssertion = authorInd?.objectProperties.find(p => p.propertyIri.endsWith('afiliadoA'));
          return {
            iri: op.targetIri,
            name: op.targetLabel,
            institution: instAssertion?.targetLabel
          };
        });

      // Tópicos associados (Derivação semântica R1 ou asserções diretas de abordaTecnica)
      const topics: { iri: string; label: string; matchedKeyword?: string }[] = [];
      const topicSet = new Set<string>();

      // A) Relações explícitas abordaTecnica
      ind.objectProperties
        .filter(op => op.propertyIri.endsWith('abordaTecnica'))
        .forEach(op => {
          topicSet.add(op.targetIri);
          topics.push({ iri: op.targetIri, label: op.targetLabel });
        });

      // B) Derivação semântica da regra R1: se palavraChave do artigo coincide com palavraChaveAssociada do tema
      topicsMap.forEach((tData, tIri) => {
        if (!topicSet.has(tIri)) {
          const lowerKeywords = keywords.map(k => k.toLowerCase());
          const match = tData.keywords.find(tk => lowerKeywords.includes(tk.toLowerCase()));
          if (match) {
            topicSet.add(tIri);
            topics.push({
              iri: tIri,
              label: tData.label,
              matchedKeyword: match
            });
          }
        }
      });

      // Atualiza contagem no mapa de tópicos
      topics.forEach(t => {
        const top = topicsMap.get(t.iri);
        if (top) top.articleCount++;
      });

      const isCollab = ind.types.some(t => t.endsWith('ArtigoColaborativo'));
      const isSingle = ind.types.some(t => t.endsWith('ArtigoDeAutoriaUnica'));
      const isInter = ind.types.some(t => t.endsWith('ArtigoInterinstitucional'));

      list.push({
        iri: ind.iri,
        id: ind.label,
        title,
        doi,
        pdfUrl,
        pageUrl,
        keywords,
        language,
        track,
        authors,
        topics,
        isCollaborative: isCollab,
        isSingleAuthor: isSingle,
        isInterinstitutional: isInter
      });
    });

    return list;
  }, [model, topicsMap]);

  // Lista ordenada de tópicos com contagem
  const topicsList = useMemo(() => {
    return Array.from(topicsMap.values()).sort((a, b) => b.articleCount - a.articleCount);
  }, [topicsMap]);

  // Extrair autores com afiliação e artigos publicados
  const authorsList = useMemo(() => {
    const map = new Map<string, {
      iri: string;
      name: string;
      institution?: string;
      articlesCount: number;
      coauthors: string[];
    }>();

    Object.values(model.individuals).forEach(ind => {
      const isAuthor = ind.types.some(t => t.endsWith('#Autor') || t.endsWith('Autor'));
      if (!isAuthor) return;

      const inst = ind.objectProperties.find(p => p.propertyIri.endsWith('afiliadoA'))?.targetLabel;
      const coauthors = ind.objectProperties.filter(p => p.propertyIri.endsWith('coautorDe')).map(p => p.targetLabel);
      
      const authorArticles = articles.filter(a => a.authors.some(aut => aut.iri === ind.iri));

      map.set(ind.iri, {
        iri: ind.iri,
        name: ind.label,
        institution: inst,
        articlesCount: authorArticles.length,
        coauthors
      });
    });

    return Array.from(map.values()).sort((a, b) => b.articlesCount - a.articlesCount);
  }, [model, articles]);

  // Filtragem inteligente de artigos
  const filteredArticles = useMemo(() => {
    return articles.filter(art => {
      // Filtro por tópico
      if (selectedTopic !== 'all') {
        const hasTopic = art.topics.some(t => t.iri === selectedTopic);
        if (!hasTopic) return false;
      }

      // Filtro por idioma
      if (selectedLanguage !== 'all') {
        if (art.language.toLowerCase() !== selectedLanguage.toLowerCase()) return false;
      }

      // Filtro por texto de busca (título, autores, palavras-chave)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = art.title.toLowerCase().includes(q);
        const matchKeyword = art.keywords.some(k => k.toLowerCase().includes(q));
        const matchAuthor = art.authors.some(a => a.name.toLowerCase().includes(q) || (a.institution && a.institution.toLowerCase().includes(q)));
        const matchTopic = art.topics.some(t => t.label.toLowerCase().includes(q));
        if (!matchTitle && !matchKeyword && !matchAuthor && !matchTopic) return false;
      }

      return true;
    });
  }, [articles, selectedTopic, selectedLanguage, searchQuery]);

  return (
    <div className="w-full flex-1 flex flex-col">
      
      {/* Hero do Portal Simplificado */}
      <section className="bg-gradient-to-b from-primary-50/70 via-white to-slate-50 dark:from-slate-900/90 dark:via-slate-950 dark:to-slate-950 border-b border-slate-200 dark:border-slate-800 py-10 px-4 sm:px-6 lg:px-8 transition-colors">
        <div className="max-w-5xl mx-auto text-center">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            Catálogo Semântico do WER 2026 · Interface Simplificada
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-3">
            O que você deseja pesquisar em <span className="bg-gradient-to-r from-primary-600 to-indigo-600 bg-clip-text text-transparent">Engenharia de Requisitos</span>?
          </h1>
          
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-8">
            Busca semântica inteligente sobre as publicações do WER. As conexões entre artigos e temas de pesquisa são descobertas automaticamente pela ontologia do projeto.
          </p>

          {/* Barra de Pesquisa Principal */}
          <div className="max-w-2xl mx-auto relative mb-6">
            <div className="relative flex items-center shadow-lg rounded-2xl bg-white dark:bg-slate-900 border-2 border-primary-500/30 focus-within:border-primary-500 transition-all">
              <Search className="w-5 h-5 text-primary-500 ml-4 shrink-0" />
              <input
                type="text"
                placeholder="Busque por título, autor, técnica ou palavra-chave..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full px-3 py-3.5 bg-transparent text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="p-2 text-slate-400 hover:text-slate-600 mr-2"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Navegação Rápida por Tópicos (Pílulas / Chips) */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 max-w-4xl mx-auto text-xs">
            <button
              type="button"
              onClick={() => setSelectedTopic('all')}
              className={`px-3 py-1.5 rounded-full font-medium transition flex items-center gap-1.5 ${
                selectedTopic === 'all'
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
              }`}
            >
              <span>Todos os Tópicos</span>
              <span className="text-[10px] opacity-80">({articles.length})</span>
            </button>

            {topicsList.slice(0, 8).map(topic => (
              <button
                key={topic.iri}
                type="button"
                onClick={() => setSelectedTopic(topic.iri)}
                className={`px-3 py-1.5 rounded-full font-medium transition flex items-center gap-1.5 ${
                  selectedTopic === topic.iri
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <span>{topic.label}</span>
                {topic.articleCount > 0 && (
                  <span className="text-[10px] px-1.5 py-0.2 bg-primary-100 dark:bg-primary-950 text-primary-700 dark:text-primary-300 rounded-full font-semibold">
                    {topic.articleCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Navegação entre Abas do Portal */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 w-full pt-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-3">
          
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('articles')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
                activeTab === 'articles'
                  ? 'bg-primary-50 dark:bg-primary-950 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <FileText className="w-4 h-4 text-primary-500" />
              <span>Artigos & Publicações ({filteredArticles.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('topics')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
                activeTab === 'topics'
                  ? 'bg-primary-50 dark:bg-primary-950 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Tag className="w-4 h-4 text-indigo-500" />
              <span>Tópicos de Pesquisa ({topicsList.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('authors')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
                activeTab === 'authors'
                  ? 'bg-primary-50 dark:bg-primary-950 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <User className="w-4 h-4 text-emerald-500" />
              <span>Autores & Pesquisadores ({authorsList.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('guide')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
                activeTab === 'guide'
                  ? 'bg-primary-50 dark:bg-primary-950 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <HelpCircle className="w-4 h-4 text-amber-500" />
              <span>Como Funciona a Ontologia?</span>
            </button>
          </div>

          {/* Atalho para o Modo Especialista */}
          <button
            type="button"
            onClick={onOpenSpecialistView}
            className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-primary-600 dark:text-slate-400 hover:underline"
            title="Abrir árvore de classes, axiomas DL, regras SWRL e grafo técnico"
          >
            <span>Ver visualizador técnico de ontologias (OWL DL)</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Conteúdo Principal das Abas */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 w-full py-6 flex-1">
        
        {/* ================= ABA 1: ARTIGOS ================= */}
        {activeTab === 'articles' && (
          <div className="space-y-4">
            
            {/* Barra de Filtros Rápidos */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-500 uppercase tracking-wider text-[11px]">Idioma:</span>
                <select
                  value={selectedLanguage}
                  onChange={e => setSelectedLanguage(e.target.value)}
                  className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-200"
                >
                  <option value="all">Todos os idiomas</option>
                  <option value="espanhol">Espanhol</option>
                  <option value="portugues">Português</option>
                  <option value="ingles">Inglês</option>
                </select>
              </div>

              {(selectedTopic !== 'all' || selectedLanguage !== 'all' || searchQuery) && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedTopic('all');
                    setSelectedLanguage('all');
                    setSearchQuery('');
                  }}
                  className="text-primary-600 dark:text-primary-400 hover:underline font-medium"
                >
                  Limpar todos os filtros
                </button>
              )}
            </div>

            {/* Lista de Cards de Artigos */}
            {filteredArticles.length === 0 ? (
              <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-500">
                <FileText className="w-10 h-10 mx-auto text-slate-400 mb-3 opacity-60" />
                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Nenhum artigo encontrado</h4>
                <p className="text-xs text-slate-400 mt-1">Tente remover alguns filtros ou buscar por outro termo.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredArticles.map(art => (
                  <article
                    key={art.iri}
                    className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-primary-400 dark:hover:border-primary-600 transition-all shadow-sm"
                  >
                    {/* Top Badges */}
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {art.language && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center gap-1">
                            <Globe className="w-2.5 h-2.5" />
                            {art.language}
                          </span>
                        )}
                        {art.track && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                            {art.track}
                          </span>
                        )}
                        {art.isCollaborative && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800" title="Artigo com múltiplos autores (Regra DL)">
                            Colaborativo
                          </span>
                        )}
                      </div>

                      {art.doi && (
                        <span className="text-[11px] font-mono text-slate-400 truncate max-w-[200px]">
                          DOI: {art.doi}
                        </span>
                      )}
                    </div>

                    {/* Título do Artigo */}
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 mb-2 leading-snug">
                      {art.title}
                    </h3>

                    {/* Autores & Instituições */}
                    <div className="flex flex-wrap items-center gap-2 mb-3 text-xs text-slate-600 dark:text-slate-400">
                      <User className="w-3.5 h-3.5 text-primary-500 shrink-0" />
                      <div className="flex flex-wrap items-center gap-1.5">
                        {art.authors.map((aut, idx) => (
                          <span key={aut.iri} className="inline-flex items-center">
                            <span className="font-medium text-slate-800 dark:text-slate-200">{aut.name}</span>
                            {aut.institution && (
                              <span className="text-[10px] text-slate-400 ml-0.5">({aut.institution.split('—')[0].trim()})</span>
                            )}
                            {idx < art.authors.length - 1 && <span className="ml-1 text-slate-300">·</span>}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Tópicos Semânticos Identificados */}
                    {art.topics.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 mb-4">
                        <span className="text-[10px] uppercase font-bold text-slate-400 mr-1 flex items-center gap-1">
                          <Tag className="w-2.5 h-2.5 text-indigo-500" />
                          Tópicos:
                        </span>
                        {art.topics.map(t => (
                          <button
                            key={t.iri}
                            type="button"
                            onClick={() => setSelectedTopic(t.iri)}
                            className="px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 transition flex items-center gap-1"
                          >
                            <span>{t.label}</span>
                            {t.matchedKeyword && (
                              <span title="Descoberto via regra semântica SWRL R1">
                                <Sparkles className="w-2.5 h-2.5 text-amber-500" />
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Palavras-chave do Artigo */}
                    {art.keywords.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1 mb-4 text-[11px] text-slate-500">
                        <span className="font-semibold text-slate-400">Palavras-chave:</span>
                        {art.keywords.map((kw, idx) => (
                          <span key={idx} className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-600 dark:text-slate-300">
                            {kw}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Ações: PDF, Página Oficial e Explicação Semântica */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                      <button
                        type="button"
                        onClick={() => setSemanticModalArticle(art)}
                        className="flex items-center gap-1.5 font-semibold text-primary-600 dark:text-primary-400 hover:underline"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        <span>Por que este artigo aparece aqui? (Explicação Semântica)</span>
                      </button>

                      <div className="flex items-center gap-2">
                        {art.pdfUrl && (
                          <a
                            href={art.pdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-xl transition flex items-center gap-1.5 shadow-sm"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>Baixar PDF Oficial</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}

                        {art.pageUrl && (
                          <a
                            href={art.pageUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium rounded-xl transition flex items-center gap-1"
                          >
                            <span>Proceedings WER</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================= ABA 2: TÓPICOS ================= */}
        {activeTab === 'topics' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {topicsList.map(topic => (
              <div
                key={topic.iri}
                onClick={() => {
                  setSelectedTopic(topic.iri);
                  setActiveTab('articles');
                }}
                className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-primary-500 cursor-pointer transition shadow-sm flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition">
                      <Tag className="w-4 h-4" />
                    </span>
                    <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-primary-100 dark:bg-primary-950 text-primary-700 dark:text-primary-300">
                      {topic.articleCount} publicações
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1 group-hover:text-primary-600 transition">
                    {topic.label}
                  </h4>

                  {topic.description && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">
                      {topic.description}
                    </p>
                  )}

                  {topic.keywords.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {topic.keywords.slice(0, 3).map((kw, i) => (
                        <span key={i} className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-500">
                          {kw}
                        </span>
                      ))}
                      {topic.keywords.length > 3 && (
                        <span className="text-[10px] text-slate-400">+{topic.keywords.length - 3}</span>
                      )}
                    </div>
                  )}
                </div>

                <div className="pt-4 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-primary-600 dark:text-primary-400 font-semibold">
                  <span>Ver artigos do tema</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ================= ABA 3: AUTORES ================= */}
        {activeTab === 'authors' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {authorsList.map(author => (
              <div
                key={author.iri}
                className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-center text-sm shrink-0">
                      {author.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        {author.name}
                      </h4>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        {author.articlesCount} artigo{author.articlesCount > 1 ? 's' : ''} no catálogo
                      </span>
                    </div>
                  </div>

                  {author.institution && (
                    <div className="flex items-start gap-1.5 text-xs text-slate-600 dark:text-slate-400 mt-2 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl">
                      <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span className="leading-snug">{author.institution}</span>
                    </div>
                  )}

                  {author.coauthors.length > 0 && (
                    <div className="mt-3 text-xs">
                      <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                        Coautores ({author.coauthors.length}):
                      </span>
                      <p className="text-slate-500 dark:text-slate-400 text-[11px] truncate">
                        {author.coauthors.slice(0, 4).join(', ')}
                        {author.coauthors.length > 4 && ` (+${author.coauthors.length - 4})`}
                      </p>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery(author.name);
                    setActiveTab('articles');
                  }}
                  className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline flex items-center justify-between"
                >
                  <span>Filtrar artigos deste autor</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* ================= ABA 4: GUIA DIDÁTICO ================= */}
        {activeTab === 'guide' && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm max-w-4xl mx-auto space-y-8 text-slate-700 dark:text-slate-300">
            
            <div className="text-center max-w-2xl mx-auto">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-3">
                <HelpCircle className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                Como a Web Semântica e as Ontologias facilitam a sua busca?
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                Entenda de forma simples como uma ontologia funciona e por que ela é muito mais poderosa do que uma busca tradicional por palavras exatas.
              </p>
            </div>

            {/* 3 Passos Explicativos */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 font-bold flex items-center justify-center text-sm mb-3">
                  1
                </div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                  O que é uma Ontologia?
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Pense na ontologia como um <strong>mapa inteligente de conceitos</strong>. Em vez de apenas guardar textos isolados, ela ensina ao computador o que é um <em>Artigo</em>, quem é um <em>Autor</em>, o que é uma <em>Instituição</em> e quais são os <em>Temas de Pesquisa</em>.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 font-bold flex items-center justify-center text-sm mb-3">
                  2
                </div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                  Regras Semânticas (SWRL)
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  O computador ganha a capacidade de <strong>deduzir novos fatos sozinho</strong>. Por exemplo: se um artigo usa a palavra-chave "Requerimientos No Funcionales", a regra infere automaticamente que ele aborda a técnica "Requisitos Não-Funcionais", mesmo que os nomes estejam em línguas diferentes!
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 font-bold flex items-center justify-center text-sm mb-3">
                  3
                </div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                  Busca Conectada
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Você não precisa adivinhar como o autor escreveu. Você clica em um tema de pesquisa e o catálogo semântico recupera todas as publicações relacionadas através de cadeias lógicas de conhecimento.
                </p>
              </div>
            </div>

            {/* Exemplo Prático Real da Ontologia */}
            <div className="p-6 bg-gradient-to-r from-primary-50 to-indigo-50 dark:from-slate-800 dark:to-slate-800/80 rounded-2xl border border-primary-100 dark:border-slate-700">
              <h4 className="text-sm font-bold text-primary-900 dark:text-primary-200 mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary-600" />
                Exemplo Real do Catálogo WER:
              </h4>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                Quando dois autores publicam um artigo juntos, a regra de cadeia de propriedades <code className="font-mono bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded">coautorDe ⊒ autorDe ∘ temAutor</code> deduz automaticamente que eles são <strong>coautores</strong>, sem ninguém precisar cadastrar essa informação manualmente!
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Modal Didático de Explicação Semântica */}
      {semanticModalArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div 
            className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-xl p-6 overflow-hidden animate-in zoom-in-95 duration-150"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Explicação Semântica do Artigo
                  </h3>
                  <span className="text-[11px] text-slate-500">
                    Como a ontologia relacionou esta publicação aos tópicos
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSemanticModalArticle(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-4 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Artigo:</span>
                <p className="font-bold text-slate-900 dark:text-slate-100 text-sm mt-0.5">
                  {semanticModalArticle.title}
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  Conexões Semânticas Derivadas:
                </span>

                {semanticModalArticle.topics.map((t, idx) => (
                  <div key={idx} className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 text-[11px]">
                    <div className="flex items-center justify-between font-bold text-indigo-600 dark:text-indigo-400">
                      <span>Tópico: {t.label}</span>
                      <span className="text-[9px] px-1.5 py-0.5 bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 rounded font-normal">
                        Regra R1
                      </span>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                      {t.matchedKeyword
                        ? `O artigo possui a palavra-chave "${t.matchedKeyword}", que é reconhecida pela ontologia como parte deste tema.`
                        : 'Relacionado diretamente na modelagem da ontologia.'}
                    </p>
                  </div>
                ))}
              </div>

              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed text-center">
                Graças à ontologia OWL e às regras SWRL, a busca não depende de digitação exata e conecta conceitos em múltiplos idiomas!
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
              <button
                type="button"
                onClick={() => setSemanticModalArticle(null)}
                className="w-full py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-xl text-xs transition"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
