import React, { useState, useEffect } from 'react';
import { 
  Boxes, 
  Database, 
  Users, 
  ScrollText, 
  Network, 
  GitCompare, 
  SlidersHorizontal,
  Sparkles,
  Info
} from 'lucide-react';
import { OntologyModel, DiffResult } from './types/ontology';
import { LoadResult } from './parser/ontologyLoader';
import { computeOntologyDiff } from './utils/diffEngine';

import { Header } from './components/Header';
import { FileLoader } from './components/FileLoader';
import { SummaryMetrics } from './components/SummaryMetrics';
import { ClassTree } from './components/ClassTree';
import { PropertyList } from './components/PropertyList';
import { IndividualList } from './components/IndividualList';
import { SwrlRulesTab } from './components/SwrlRulesTab';
import { OntologyGraph } from './components/OntologyGraph';
import { DiffViewer } from './components/DiffViewer';
import { DetailModal } from './components/DetailModal';
import { ExportModal } from './components/ExportModal';

export const App: React.FC = () => {
  // Theme
  const [darkMode, setDarkMode] = useState(false);

  // Ontology states
  const [baseModel, setBaseModel] = useState<OntologyModel | null>(null);
  const [baseFilename, setBaseFilename] = useState<string>('');
  const [baseContent, setBaseContent] = useState<string>('');

  const [compareModel, setCompareModel] = useState<OntologyModel | null>(null);
  const [compareFilename, setCompareFilename] = useState<string>('');
  const [compareContent, setCompareContent] = useState<string>('');
  const [diffResult, setDiffResult] = useState<DiffResult | null>(null);

  const [isLoading, setIsLoading] = useState(false);

  // Global Detailed vs Simple View (RF-20)
  const [isDetailed, setIsDetailed] = useState(false);

  // Active main tab
  const [activeTab, setActiveTab] = useState<'classes' | 'properties' | 'individuals' | 'swrl' | 'graph' | 'diff'>('classes');

  // Selected entity for modal inspector (RF-21, RF-22)
  const [selectedEntity, setSelectedEntity] = useState<{
    type: 'class' | 'property' | 'individual';
    iri: string;
  } | null>(null);

  // Export modal state (RF-50)
  const [isExportOpen, setIsExportOpen] = useState(false);

  // Synchronize dark mode class on <html>
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Load base ontology
  const handleLoadBaseOntology = (result: LoadResult, content: string) => {
    if (result.model) {
      setBaseModel(result.model);
      setBaseFilename(result.filename);
      setBaseContent(content);
      setSelectedEntity(null);
      setActiveTab('classes');

      // If comparison ontology was already present, re-compute diff
      if (compareModel) {
        const diff = computeOntologyDiff(result.model, compareModel, result.filename, compareFilename);
        setDiffResult(diff);
      }
    }
  };

  // Load compare ontology (RF-40)
  const handleLoadCompareOntology = (result: LoadResult, content: string) => {
    if (result.model && baseModel) {
      setCompareModel(result.model);
      setCompareFilename(result.filename);
      setCompareContent(content);
      const diff = computeOntologyDiff(baseModel, result.model, baseFilename, result.filename);
      setDiffResult(diff);
      setActiveTab('diff');
    }
  };

  const handleClearCompare = () => {
    setCompareModel(null);
    setCompareFilename('');
    setCompareContent('');
    setDiffResult(null);
    if (activeTab === 'diff') setActiveTab('classes');
  };

  const handleReset = () => {
    setBaseModel(null);
    setBaseFilename('');
    setBaseContent('');
    setCompareModel(null);
    setCompareFilename('');
    setCompareContent('');
    setDiffResult(null);
    setSelectedEntity(null);
    setActiveTab('classes');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      
      {/* Top Header */}
      <Header
        model={baseModel}
        isDetailed={isDetailed}
        setIsDetailed={setIsDetailed}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        onOpenExport={() => setIsExportOpen(true)}
        onSelectEntity={(type, iri) => setSelectedEntity({ type, iri })}
        onReset={handleReset}
      />

      {/* File Loader Banner or Hero */}
      <FileLoader
        onLoadBaseOntology={handleLoadBaseOntology}
        onLoadCompareOntology={handleLoadCompareOntology}
        baseModel={baseModel}
        compareModel={compareModel}
        baseFilename={baseFilename}
        compareFilename={compareFilename}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
        onClearCompare={handleClearCompare}
      />

      {/* Main Workspace */}
      {baseModel && (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1 flex flex-col">
          
          {/* Summary Cards & Distinction Axiom Alert (RF-10, RF-32) */}
          <SummaryMetrics
            model={baseModel}
            isDetailed={isDetailed}
            onNavigateToTab={tab => setActiveTab(tab)}
          />

          {/* Navigation Tabs Bar */}
          <div className="flex items-center gap-1.5 border-b border-slate-200 dark:border-slate-800 mb-6 overflow-x-auto pb-1 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('classes')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition ${
                activeTab === 'classes'
                  ? 'bg-primary-600 text-white shadow-md shadow-primary-500/20'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Boxes className="w-4 h-4" />
              <span>Hierarquia de Classes ({Object.keys(baseModel.classes).length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('properties')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition ${
                activeTab === 'properties'
                  ? 'bg-primary-600 text-white shadow-md shadow-primary-500/20'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Database className="w-4 h-4" />
              <span>Propriedades ({Object.keys(baseModel.properties).length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('individuals')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition ${
                activeTab === 'individuals'
                  ? 'bg-primary-600 text-white shadow-md shadow-primary-500/20'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Indivíduos ({Object.keys(baseModel.individuals).length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('swrl')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition ${
                activeTab === 'swrl'
                  ? 'bg-primary-600 text-white shadow-md shadow-primary-500/20'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <ScrollText className="w-4 h-4" />
              <span>Regras SWRL ({baseModel.swrlRules.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('graph')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition ${
                activeTab === 'graph'
                  ? 'bg-primary-600 text-white shadow-md shadow-primary-500/20'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Network className="w-4 h-4" />
              <span>Grafo de Classes (RF-15)</span>
            </button>

            {/* Diff Tab if loaded */}
            {diffResult && (
              <button
                type="button"
                onClick={() => setActiveTab('diff')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition ${
                  activeTab === 'diff'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                    : 'text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40'
                }`}
              >
                <GitCompare className="w-4 h-4" />
                <span>Comparação / Diff ({diffResult.totalNewTriples})</span>
              </button>
            )}
          </div>

          {/* Tab Views */}
          <div className="flex-1">
            {activeTab === 'classes' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
                <div className="lg:col-span-5 h-[620px]">
                  <ClassTree
                    model={baseModel}
                    isDetailed={isDetailed}
                    onSelectClass={iri => setSelectedEntity({ type: 'class', iri })}
                    selectedClassIri={selectedEntity?.type === 'class' ? selectedEntity.iri : undefined}
                  />
                </div>
                <div className="lg:col-span-7 h-[620px]">
                  <IndividualList
                    model={baseModel}
                    diffResult={diffResult}
                    isDetailed={isDetailed}
                    onSelectIndividual={iri => setSelectedEntity({ type: 'individual', iri })}
                    selectedIndividualIri={selectedEntity?.type === 'individual' ? selectedEntity.iri : undefined}
                    initialClassFilter={selectedEntity?.type === 'class' ? selectedEntity.iri : 'all'}
                  />
                </div>
              </div>
            )}

            {activeTab === 'properties' && (
              <div className="h-[650px]">
                <PropertyList
                  model={baseModel}
                  isDetailed={isDetailed}
                  onSelectProperty={iri => setSelectedEntity({ type: 'property', iri })}
                  selectedPropertyIri={selectedEntity?.type === 'property' ? selectedEntity.iri : undefined}
                />
              </div>
            )}

            {activeTab === 'individuals' && (
              <div className="h-[650px]">
                <IndividualList
                  model={baseModel}
                  diffResult={diffResult}
                  isDetailed={isDetailed}
                  onSelectIndividual={iri => setSelectedEntity({ type: 'individual', iri })}
                  selectedIndividualIri={selectedEntity?.type === 'individual' ? selectedEntity.iri : undefined}
                />
              </div>
            )}

            {activeTab === 'swrl' && (
              <div className="h-[680px]">
                <SwrlRulesTab
                  model={baseModel}
                  isDetailed={isDetailed}
                  onSelectEntity={(type, iri) => setSelectedEntity({ type, iri })}
                />
              </div>
            )}

            {activeTab === 'graph' && (
              <div className="h-[650px]">
                <OntologyGraph
                  model={baseModel}
                  onSelectClass={iri => setSelectedEntity({ type: 'class', iri })}
                  selectedClassIri={selectedEntity?.type === 'class' ? selectedEntity.iri : undefined}
                  isDetailed={isDetailed}
                />
              </div>
            )}

            {activeTab === 'diff' && diffResult && (
              <div className="h-[650px]">
                <DiffViewer
                  diffResult={diffResult}
                  model={baseModel}
                  onSelectEntity={(type, iri) => setSelectedEntity({ type, iri })}
                />
              </div>
            )}
          </div>
        </main>
      )}

      {/* Entity Inspector Detail Modal (RF-21, RF-22, RF-30) */}
      {selectedEntity && baseModel && (
        <DetailModal
          entityType={selectedEntity.type}
          entityIri={selectedEntity.iri}
          model={baseModel}
          isDetailed={isDetailed}
          onClose={() => setSelectedEntity(null)}
          onSelectEntity={(type, iri) => setSelectedEntity({ type, iri })}
        />
      )}

      {/* Export Report & Tables Modal (RF-50) */}
      {isExportOpen && baseModel && (
        <ExportModal
          model={baseModel}
          onClose={() => setIsExportOpen(false)}
        />
      )}

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 py-4 px-4 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            <strong>WerOntoView</strong> · Criado por <strong>Samuel Celso Anjos Neto</strong> e <strong>Pedro Henrique Dantas</strong> · Sob Orientação do <strong>Prof. Frederico Freitas</strong> (CIn - UFPE)
          </span>
          <span className="text-[11px] text-slate-400">
            Hospedagem 100% estática · Compatível com Vercel & GitHub Pages
          </span>
        </div>
      </footer>
    </div>
  );
};
