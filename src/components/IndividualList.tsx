import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles,
  Link,
  Tag
} from 'lucide-react';
import { OntologyIndividual, OntologyModel, DiffResult } from '../types/ontology';

interface IndividualListProps {
  model: OntologyModel;
  diffResult: DiffResult | null;
  isDetailed: boolean;
  onSelectIndividual: (iri: string) => void;
  selectedIndividualIri?: string;
  initialClassFilter?: string;
}

const ITEMS_PER_PAGE = 25;

export const IndividualList: React.FC<IndividualListProps> = ({
  model,
  diffResult,
  isDetailed,
  onSelectIndividual,
  selectedIndividualIri,
  initialClassFilter
}) => {
  const [search, setSearch] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>(initialClassFilter || 'all');
  const [currentPage, setCurrentPage] = useState(1);

  // Set of newly inferred individual IRIs (RF-41)
  const inferredIndividuals = React.useMemo(() => {
    const set = new Set<string>();
    if (diffResult && diffResult.hasDiff) {
      diffResult.newTypes.forEach(t => set.add(t.individualIri));
      diffResult.newAssertions.forEach(a => set.add(a.subjectIri));
    }
    return set;
  }, [diffResult]);

  const filteredIndividuals = React.useMemo(() => {
    return Object.values(model.individuals).filter(ind => {
      // Class filter
      if (selectedClass !== 'all') {
        if (!ind.types.includes(selectedClass)) return false;
      }
      // Search query
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchLabel = ind.label.toLowerCase().includes(q);
        const matchIri = ind.iri.toLowerCase().includes(q);
        const matchTypes = ind.typeLabels.some(t => t.toLowerCase().includes(q));
        return matchLabel || matchIri || matchTypes;
      }
      return true;
    });
  }, [model.individuals, selectedClass, search]);

  const totalPages = Math.ceil(filteredIndividuals.length / ITEMS_PER_PAGE) || 1;
  const paginatedList = React.useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredIndividuals.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredIndividuals, currentPage]);

  const handleClassChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedClass(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col h-full">
      
      {/* Header and Controls */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-500" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
              Indivíduos & Instâncias
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            {filteredIndividuals.length} de {Object.keys(model.individuals).length}
          </span>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por nome, classe ou atributo..."
              value={search}
              onChange={e => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div className="relative">
            <select
              value={selectedClass}
              onChange={handleClassChange}
              className="w-full sm:w-48 pl-3 pr-8 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-700 dark:text-slate-200 font-medium"
            >
              <option value="all">Todas as classes ({Object.keys(model.individuals).length})</option>
              {Object.values(model.classes)
                .filter(c => c.individualCount > 0)
                .map(c => (
                  <option key={c.iri} value={c.iri}>
                    {c.label} ({c.individualCount})
                  </option>
                ))}
            </select>
          </div>
        </div>
      </div>

      {/* Individuals List */}
      <div className="p-3 overflow-y-auto max-h-[520px] divide-y divide-slate-100 dark:divide-slate-800/80 flex-1">
        {paginatedList.length === 0 ? (
          <p className="p-8 text-center text-xs text-slate-500">Nenhum indivíduo encontrado com os filtros aplicados.</p>
        ) : (
          paginatedList.map(ind => {
            const isSelected = selectedIndividualIri === ind.iri;
            const isInferred = inferredIndividuals.has(ind.iri);

            return (
              <div
                key={ind.iri}
                onClick={() => onSelectIndividual(ind.iri)}
                className={`py-2.5 px-3 rounded-xl cursor-pointer transition ${
                  isSelected
                    ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
                      {ind.label}
                    </span>
                    {isInferred && (
                      <span className="px-1.5 py-0.2 text-[9px] font-semibold bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 rounded border border-indigo-200 dark:border-indigo-800 flex items-center gap-0.5">
                        <Sparkles className="w-2.5 h-2.5" />
                        inferido
                      </span>
                    )}
                  </div>

                  <span className="text-[11px] text-slate-400 font-mono shrink-0">
                    {ind.objectProperties.length + ind.dataProperties.length} asserções
                  </span>
                </div>

                {/* In detailed mode show IRI */}
                {isDetailed && (
                  <p className="text-[10px] font-mono text-slate-400 truncate mb-1.5">
                    {ind.iri}
                  </p>
                )}

                {/* Types badges */}
                <div className="flex flex-wrap items-center gap-1 mt-1.5">
                  {ind.typeLabels.map((tLabel, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 text-[10px] rounded-md bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-medium"
                    >
                      {tLabel}
                    </span>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 disabled:opacity-40"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            Anterior
          </button>

          <span>
            Página <strong>{currentPage}</strong> de <strong>{totalPages}</strong>
          </span>

          <button
            type="button"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 disabled:opacity-40"
          >
            Próxima
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
