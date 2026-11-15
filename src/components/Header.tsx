import React, { useState, useRef, useEffect } from 'react';
import { 
  Network, 
  Search, 
  Moon, 
  Sun, 
  Download, 
  SlidersHorizontal, 
  HelpCircle,
  FileText,
  Boxes,
  Database,
  User,
  Sparkles,
  X,
  GraduationCap
} from 'lucide-react';
import { OntologyModel } from '../types/ontology';

interface HeaderProps {
  model: OntologyModel | null;
  isDetailed: boolean;
  setIsDetailed: (v: boolean) => void;
  darkMode: boolean;
  setDarkMode: (v: boolean) => void;
  onOpenExport: () => void;
  onSelectEntity: (type: 'class' | 'property' | 'individual', iri: string) => void;
  onReset: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  model,
  isDetailed,
  setIsDetailed,
  darkMode,
  setDarkMode,
  onOpenExport,
  onSelectEntity,
  onReset
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter search results grouped by type (RF-14)
  const searchResults = React.useMemo(() => {
    if (!model || searchQuery.trim().length < 2) {
      return { classes: [], properties: [], individuals: [] };
    }
    const q = searchQuery.toLowerCase();

    const matchedClasses = Object.values(model.classes)
      .filter(c => c.label.toLowerCase().includes(q) || c.iri.toLowerCase().includes(q))
      .slice(0, 6);

    const matchedProperties = Object.values(model.properties)
      .filter(p => p.label.toLowerCase().includes(q) || p.iri.toLowerCase().includes(q))
      .slice(0, 6);

    const matchedIndividuals = Object.values(model.individuals)
      .filter(i => i.label.toLowerCase().includes(q) || i.iri.toLowerCase().includes(q))
      .slice(0, 8);

    return {
      classes: matchedClasses,
      properties: matchedProperties,
      individuals: matchedIndividuals
    };
  }, [model, searchQuery]);

  const hasResults =
    searchResults.classes.length > 0 ||
    searchResults.properties.length > 0 ||
    searchResults.individuals.length > 0;

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Project Title */}
          <div className="flex items-center gap-3 cursor-pointer select-none" onClick={onReset}>
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-primary-500/20">
              <Network className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-primary-600 to-indigo-600 dark:from-primary-400 dark:to-indigo-400 bg-clip-text text-transparent">
                  WerOntoView
                </span>
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-primary-100 text-primary-700 dark:bg-primary-950/60 dark:text-primary-300 rounded-full border border-primary-200 dark:border-primary-800">
                  CIn / UFPE
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
                Visualizador Web de Ontologias OWL & SWRL
              </p>
            </div>
          </div>

          {/* Global Search Bar (RF-14) */}
          {model && (
            <div className="relative flex-1 max-w-md hidden md:block" ref={searchRef}>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar classe, propriedade, indivíduo ou rótulo..."
                  value={searchQuery}
                  onChange={e => {
                    setSearchQuery(e.target.value);
                    setIsSearchOpen(true);
                  }}
                  onFocus={() => setIsSearchOpen(true)}
                  className="w-full pl-9 pr-4 py-2 text-sm bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 transition"
                />
              </div>

              {/* Grouped Search Dropdown */}
              {isSearchOpen && searchQuery.trim().length >= 2 && (
                <div className="absolute left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl overflow-hidden max-h-96 overflow-y-auto z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  {!hasResults ? (
                    <div className="p-4 text-center text-sm text-slate-500 dark:text-slate-400">
                      Nenhum resultado encontrado para "{searchQuery}"
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                      {/* Classes */}
                      {searchResults.classes.length > 0 && (
                        <div className="p-2">
                          <div className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                            <Boxes className="w-3.5 h-3.5 text-primary-500" />
                            Classes ({searchResults.classes.length})
                          </div>
                          {searchResults.classes.map(c => (
                            <button
                              key={c.iri}
                              onClick={() => {
                                onSelectEntity('class', c.iri);
                                setIsSearchOpen(false);
                              }}
                              className="w-full text-left px-3 py-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between group transition"
                            >
                              <span className="text-sm font-medium text-slate-700 dark:text-slate-200 group-hover:text-primary-600 dark:group-hover:text-primary-400">
                                {c.label}
                              </span>
                              <span className="text-xs text-slate-400">
                                {c.individualCount} instâncias
                              </span>
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Properties */}
                      {searchResults.properties.length > 0 && (
                        <div className="p-2">
                          <div className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                            <Database className="w-3.5 h-3.5 text-indigo-500" />
                            Propriedades ({searchResults.properties.length})
                          </div>
                          {searchResults.properties.map(p => (
                            <button
                              key={p.iri}
                              onClick={() => {
                                onSelectEntity('property', p.iri);
                                setIsSearchOpen(false);
                              }}
                              className="w-full text-left px-3 py-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between group transition"
                            >
                              <span className="text-sm font-medium text-slate-700 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                                {p.label}
                              </span>
                              <span className="text-xs px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 capitalize">
                                {p.type === 'object' ? 'objeto' : (p.type === 'datatype' ? 'dado' : 'anotação')}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Individuals */}
                      {searchResults.individuals.length > 0 && (
                        <div className="p-2">
                          <div className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-emerald-500" />
                            Indivíduos ({searchResults.individuals.length})
                          </div>
                          {searchResults.individuals.map(ind => (
                            <button
                              key={ind.iri}
                              onClick={() => {
                                onSelectEntity('individual', ind.iri);
                                setIsSearchOpen(false);
                              }}
                              className="w-full text-left px-3 py-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between group transition"
                            >
                              <span className="text-sm font-medium text-slate-700 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                                {ind.label}
                              </span>
                              <span className="text-xs text-slate-400 truncate max-w-[120px]">
                                {ind.typeLabels.join(', ') || 'Indivíduo'}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Action Buttons: Simple/Detailed Toggle, Export, Theme */}
          <div className="flex items-center gap-2">
            
            {/* Simple ↔ Detailed Global Switch (RF-20) */}
            {model && (
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setIsDetailed(false)}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition ${
                    !isDetailed
                      ? 'bg-white dark:bg-slate-900 text-primary-600 dark:text-primary-400 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                  title="Visão simplificada: oculta IRIs técnicas, blank nodes e distinções em massa"
                >
                  Simples
                </button>
                <button
                  type="button"
                  onClick={() => setIsDetailed(true)}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition ${
                    isDetailed
                      ? 'bg-white dark:bg-slate-900 text-primary-600 dark:text-primary-400 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                  title="Visão detalhada: exibe IRIs completas, anotações técnicas e axiomas avançados"
                >
                  Detalhado
                </button>
              </div>
            )}

            {/* Export Report & Tables (RF-50) */}
            {model && (
              <button
                type="button"
                onClick={onOpenExport}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-700 transition"
                title="Exportar resumo e tabelas (Markdown & CSV)"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Exportar</span>
              </button>
            )}

            {/* Dark Mode Toggle */}
            <button
              type="button"
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              aria-label="Alternar tema claro/escuro"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* About / Help Button */}
            <button
              type="button"
              onClick={() => setIsAboutOpen(true)}
              className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Sobre o Projeto e Autoria"
              aria-label="Sobre o Projeto"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* About Modal */}
      {isAboutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div 
            className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-md p-6 overflow-hidden animate-in zoom-in-95 duration-150"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center text-white">
                  <Network className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    WerOntoView
                  </h3>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Visualizador Web de Ontologias OWL & SWRL
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsAboutOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-4 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  Desenvolvido por:
                </span>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                  Samuel Celso Anjos Neto
                </p>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 mt-0.5">
                  Pedro Henrique Dantas
                </p>
              </div>

              <div className="p-3 bg-primary-50/60 dark:bg-primary-950/30 rounded-xl border border-primary-200 dark:border-primary-800 flex items-start gap-2.5">
                <GraduationCap className="w-4 h-4 text-primary-600 dark:text-primary-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] uppercase font-bold text-primary-700 dark:text-primary-400 block mb-0.5">
                    Orientação Acadêmica:
                  </span>
                  <p className="text-sm font-bold text-primary-900 dark:text-primary-200">
                    Prof. Frederico Freitas
                  </p>
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                  Instituição & Disciplina:
                </span>
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Web Semântica · Centro de Informática (CIn)
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Universidade Federal de Pernambuco (UFPE) · 2026
                </p>
              </div>

              <p className="text-[11px] text-slate-500 dark:text-slate-400 text-center leading-relaxed">
                Ferramenta web 100% estática que roda no navegador, com suporte a axiomas em português, regras SWRL e comparação antes/depois da inferência.
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
              <button
                type="button"
                onClick={() => setIsAboutOpen(false)}
                className="w-full py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-xl text-xs transition"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
