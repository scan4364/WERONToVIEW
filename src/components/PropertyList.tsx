import React, { useState } from 'react';
import { 
  Database, 
  Binary, 
  Search, 
  ArrowRight, 
  Repeat, 
  GitFork, 
  Link2,
  Info
} from 'lucide-react';
import { OntologyModel, OntologyProperty } from '../types/ontology';
import { formatPropertyChain } from '../utils/dlFormatter';

interface PropertyListProps {
  model: OntologyModel;
  isDetailed: boolean;
  onSelectProperty: (iri: string) => void;
  selectedPropertyIri?: string;
}

export const PropertyList: React.FC<PropertyListProps> = ({
  model,
  isDetailed,
  onSelectProperty,
  selectedPropertyIri
}) => {
  const [filterType, setFilterType] = useState<'all' | 'object' | 'datatype'>('all');
  const [search, setSearch] = useState('');

  const propertiesList = React.useMemo(() => {
    return Object.values(model.properties).filter(p => {
      if (filterType !== 'all' && p.type !== filterType) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return p.label.toLowerCase().includes(q) || p.iri.toLowerCase().includes(q);
      }
      return true;
    });
  }, [model.properties, filterType, search]);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col h-full">
      
      {/* Header and Filters */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-indigo-500" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
              Propriedades da Ontologia
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            {propertiesList.length} exibidas
          </span>
        </div>

        {/* Search & Type Tabs */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Filtrar por nome ou IRI..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center bg-slate-200/60 dark:bg-slate-800 p-0.5 rounded-lg text-xs">
            <button
              type="button"
              onClick={() => setFilterType('all')}
              className={`px-2.5 py-1 rounded-md font-medium transition ${
                filterType === 'all'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Todas
            </button>
            <button
              type="button"
              onClick={() => setFilterType('object')}
              className={`px-2.5 py-1 rounded-md font-medium transition ${
                filterType === 'object'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Objeto
            </button>
            <button
              type="button"
              onClick={() => setFilterType('datatype')}
              className={`px-2.5 py-1 rounded-md font-medium transition ${
                filterType === 'datatype'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Dados
            </button>
          </div>
        </div>
      </div>

      {/* Property Cards / Rows */}
      <div className="p-3 overflow-y-auto max-h-[580px] divide-y divide-slate-100 dark:divide-slate-800/80">
        {propertiesList.length === 0 ? (
          <p className="p-8 text-center text-xs text-slate-500">Nenhuma propriedade encontrada.</p>
        ) : (
          propertiesList.map(p => {
            const isSelected = selectedPropertyIri === p.iri;
            const domainLabels = p.domains.map(d => model.classes[d]?.label || d.split('#').pop() || d);
            const rangeLabels = p.ranges.map(r => model.classes[r]?.label || r.split('#').pop() || r);

            return (
              <div
                key={p.iri}
                onClick={() => onSelectProperty(p.iri)}
                className={`py-3 px-3 rounded-xl cursor-pointer transition ${
                  isSelected
                    ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    {p.type === 'object' ? (
                      <Database className="w-4 h-4 text-indigo-500 shrink-0" />
                    ) : (
                      <Binary className="w-4 h-4 text-violet-500 shrink-0" />
                    )}
                    <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                      {p.label}
                    </span>
                  </div>

                  <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {p.type === 'object' ? 'Objeto' : (p.type === 'datatype' ? 'Dado' : 'Anotação')}
                  </span>
                </div>

                {/* IRI in Detailed view */}
                {isDetailed && (
                  <p className="text-[11px] font-mono text-slate-400 truncate mb-1.5">
                    {p.iri}
                  </p>
                )}

                {/* Domain → Range */}
                <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 mt-2">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase">Domínio:</span>
                  <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-medium text-slate-700 dark:text-slate-200">
                    {domainLabels.length > 0 ? domainLabels.join(', ') : 'Qualquer'}
                  </span>
                  
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 mx-0.5" />
                  
                  <span className="text-[11px] font-semibold text-slate-400 uppercase">Imagem:</span>
                  <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-medium text-slate-700 dark:text-slate-200">
                    {rangeLabels.length > 0 ? rangeLabels.join(', ') : 'Qualquer'}
                  </span>
                </div>

                {/* Characteristics Badges (RF-12) */}
                <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                  {p.isFunctional && (
                    <span className="px-2 py-0.5 text-[10px] bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 rounded border border-blue-200 dark:border-blue-800 font-medium">
                      Funcional
                    </span>
                  )}
                  {p.isTransitive && (
                    <span className="px-2 py-0.5 text-[10px] bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300 rounded border border-purple-200 dark:border-purple-800 font-medium">
                      Transitiva
                    </span>
                  )}
                  {p.isSymmetric && (
                    <span className="px-2 py-0.5 text-[10px] bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 rounded border border-emerald-200 dark:border-emerald-800 font-medium">
                      Simétrica
                    </span>
                  )}
                  {p.inverseOfLabel && (
                    <span className="px-2 py-0.5 text-[10px] bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 rounded border border-amber-200 dark:border-amber-800 font-medium flex items-center gap-1">
                      <Repeat className="w-2.5 h-2.5" />
                      Inversa de: {p.inverseOfLabel}
                    </span>
                  )}
                  {p.propertyChain && p.propertyChainLabels && (
                    <span className="px-2 py-0.5 text-[10px] bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300 rounded border border-rose-200 dark:border-rose-800 font-mono font-medium flex items-center gap-1" title="Cadeia de propriedades">
                      <Link2 className="w-2.5 h-2.5" />
                      {formatPropertyChain(p.label, p.propertyChainLabels)}
                    </span>
                  )}
                </div>

                {p.comment && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2 italic">
                    {p.comment}
                  </p>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
