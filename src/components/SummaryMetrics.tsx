import React, { useState } from 'react';
import { 
  Boxes, 
  Database, 
  Binary, 
  Users, 
  ScrollText, 
  Layers, 
  ChevronDown, 
  ChevronUp, 
  ShieldAlert,
  Info,
  Sparkles,
  AlertTriangle
} from 'lucide-react';
import { AxiomBlock, OntologyModel } from '../types/ontology';

interface SummaryMetricsProps {
  model: OntologyModel;
  isDetailed: boolean;
  onNavigateToTab: (tab: 'classes' | 'properties' | 'individuals' | 'swrl' | 'graph') => void;
}

export const SummaryMetrics: React.FC<SummaryMetricsProps> = ({
  model,
  isDetailed,
  onNavigateToTab
}) => {
  const [expandedBlockId, setExpandedBlockId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedBlockId(prev => prev === id ? null : id);
  };

  const metricsCards = [
    {
      title: 'Classes',
      count: model.metrics.classCount,
      icon: Boxes,
      color: 'from-blue-500 to-primary-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300',
      onClick: () => onNavigateToTab('classes')
    },
    {
      title: 'Propriedades de Objeto',
      count: model.metrics.objectPropertyCount,
      icon: Database,
      color: 'from-indigo-500 to-indigo-600',
      bgColor: 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300',
      onClick: () => onNavigateToTab('properties')
    },
    {
      title: 'Propriedades de Dados',
      count: model.metrics.dataPropertyCount,
      icon: Binary,
      color: 'from-violet-500 to-violet-600',
      bgColor: 'bg-violet-50 dark:bg-violet-950/40 border-violet-200 dark:border-violet-800 text-violet-700 dark:text-violet-300',
      onClick: () => onNavigateToTab('properties')
    },
    {
      title: 'Indivíduos',
      count: model.metrics.individualCount,
      icon: Users,
      color: 'from-emerald-500 to-teal-600',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300',
      onClick: () => onNavigateToTab('individuals')
    },
    {
      title: 'Regras SWRL',
      count: model.metrics.swrlRuleCount,
      icon: ScrollText,
      color: 'from-amber-500 to-orange-600',
      bgColor: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300',
      onClick: () => onNavigateToTab('swrl')
    },
    {
      title: 'Total de Triplas',
      count: model.metrics.tripleCount,
      icon: Layers,
      color: 'from-slate-500 to-slate-700',
      bgColor: 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300',
      onClick: undefined
    }
  ];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm mb-6 transition-colors">
      
      {/* Ontology Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              {model.metadata.label || 'Ontologia Ativa'}
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary-100 dark:bg-primary-950 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800">
              OWL 2 DL
            </span>
          </div>
          
          {isDetailed && (
            <p className="text-xs font-mono text-slate-400 mt-1 break-all">
              IRI: {model.metadata.iri}
            </p>
          )}

          {model.metadata.comment && (
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 max-w-3xl leading-relaxed">
              {model.metadata.comment}
            </p>
          )}
        </div>
      </div>

      {/* Protégé Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-6">
        {metricsCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              onClick={card.onClick}
              className={`p-4 rounded-xl border transition-all ${
                card.onClick ? 'cursor-pointer hover:shadow-md hover:scale-[1.02]' : ''
              } ${card.bgColor}`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium opacity-80">{card.title}</span>
                <Icon className="w-4 h-4 opacity-70" />
              </div>
              <div className="text-2xl font-extrabold tracking-tight">
                {card.count.toLocaleString('pt-BR')}
              </div>
            </div>
          );
        })}
      </div>

      {/* RF-16.2 & Critérios de aceitação: Lista de Axiomas de Disjunção e Distinção (5 blocos, uma linha cada) */}
      {model.axiomBlocks.length > 0 && (
        <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-500" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Axiomas de Disjunção e Distinção Mútua ({model.axiomBlocks.length} blocos)
              </h4>
            </div>
            <span className="text-[11px] text-slate-400">
              Colapsados em uma linha cada (RF-16.2 / RF-32)
            </span>
          </div>

          <div className="space-y-2">
            {model.axiomBlocks.map((block) => {
              const isExpanded = expandedBlockId === block.id;

              return (
                <div
                  key={block.id}
                  className="bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden text-xs transition"
                >
                  {/* Linha única colapsada */}
                  <div
                    onClick={() => toggleExpand(block.id)}
                    className="p-3 flex items-center justify-between cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      {block.type === 'unknownBlankNode' ? (
                        <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                      )}
                      
                      <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                        {block.title}
                      </span>

                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200/70 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-medium hidden sm:inline">
                        {block.type === 'disjointClasses' ? 'owl:AllDisjointClasses' : (block.type === 'allDifferent' ? 'owl:AllDifferent' : (block.type === 'massDifferentFrom' ? 'owl:differentFrom' : 'Aviso RF-16.5'))}
                      </span>
                    </div>

                    <button
                      type="button"
                      className="flex items-center gap-1 font-medium text-primary-600 dark:text-primary-400 shrink-0 ml-3 text-[11px]"
                    >
                      <span>{isExpanded ? 'Recolher' : 'Expandir'}</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {/* Detalhes expandidos */}
                  {isExpanded && (
                    <div className="p-3.5 pt-0 border-t border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900/60 text-slate-600 dark:text-slate-300">
                      <p className="text-[11px] mb-2 text-slate-500 dark:text-slate-400">
                        {block.summary}
                      </p>
                      <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 max-h-40 overflow-y-auto font-mono text-[11px] leading-relaxed">
                        {block.memberLabels.join(' · ')}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
