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
  Info
} from 'lucide-react';
import { OntologyModel } from '../types/ontology';

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
  const [showDistinctExpanded, setShowDistinctExpanded] = useState(false);

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
      
      {/* Ontology Header (RF-10) */}
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
          
          {/* Detailed vs Simple IRI (RF-13, RF-20) */}
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

      {/* Protégé Metrics Grid (RF-10) */}
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

      {/* Mass Distinction Collapsed Block (RF-32) */}
      {(model.differentFromPairsCount > 0 || model.allDifferentGroups.length > 0) && (
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
            <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300">
              <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0" />
              <span>
                <strong>Axiomas de distinção mútua (RF-32):</strong>{' '}
                {model.allDifferentGroups.length > 0 && (
                  <span>{model.allDifferentGroups.length} grupos AllDifferent / AllDisjointClasses</span>
                )}
                {model.differentFromPairsCount > 0 && (
                  <span>
                    {model.allDifferentGroups.length > 0 ? ', além de ' : ''}
                    <strong>{model.differentFromPairsCount}</strong> axiomas de distinção <code className="font-mono text-amber-600 dark:text-amber-400">differentFrom</code> entre indivíduos (por exemplo, temas de pesquisa).
                  </span>
                )}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setShowDistinctExpanded(!showDistinctExpanded)}
              className="flex items-center gap-1 font-semibold text-primary-600 dark:text-primary-400 hover:underline shrink-0 ml-4"
            >
              <span>{showDistinctExpanded ? 'Recolher' : 'Expandir detalhes'}</span>
              {showDistinctExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          {showDistinctExpanded && (
            <div className="mt-3 p-4 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs text-slate-600 dark:text-slate-300 max-h-48 overflow-y-auto divide-y divide-slate-200 dark:divide-slate-700">
              {model.allDifferentGroups.map((g, idx) => (
                <div key={idx} className="py-2">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Grupo {idx + 1} ({g.members.length} membros):</span>
                  <p className="mt-1 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                    {g.memberLabels.join(', ')}
                  </p>
                </div>
              ))}
              <div className="py-2 text-slate-500 dark:text-slate-400">
                Os axiomas individuais de <code>differentFrom</code> entre indivíduos foram agrupados para evitar poluição visual e lentidão na renderização (conforme RF-32).
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
