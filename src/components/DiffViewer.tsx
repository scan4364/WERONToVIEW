import React, { useState } from 'react';
import { 
  GitCompare, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  Search, 
  Filter, 
  Boxes, 
  Database,
  Layers,
  FileCode
} from 'lucide-react';
import { DiffResult, OntologyModel } from '../types/ontology';

interface DiffViewerProps {
  diffResult: DiffResult;
  model: OntologyModel;
  onSelectEntity: (type: 'class' | 'property' | 'individual', iri: string) => void;
}

export const DiffViewer: React.FC<DiffViewerProps> = ({
  diffResult,
  model,
  onSelectEntity
}) => {
  const [filterProp, setFilterProp] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'assertions' | 'types' | 'axioms'>('assertions');

  const filteredAssertions = React.useMemo(() => {
    return diffResult.newAssertions.filter(a => {
      if (filterProp !== 'all' && a.propertyIri !== filterProp) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          a.subjectLabel.toLowerCase().includes(q) ||
          a.propertyLabel.toLowerCase().includes(q) ||
          a.objectLabel.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [diffResult.newAssertions, filterProp, search]);

  const filteredTypes = React.useMemo(() => {
    return diffResult.newTypes.filter(t => {
      if (search.trim()) {
        const q = search.toLowerCase();
        return t.individualLabel.toLowerCase().includes(q) || t.classLabel.toLowerCase().includes(q);
      }
      return true;
    });
  }, [diffResult.newTypes, search]);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col h-full">
      
      {/* Header */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-indigo-50/40 dark:bg-indigo-950/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400">
              <GitCompare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>Diferenças de Inferência (Diff Drools / OWL)</span>
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 rounded-full border border-indigo-200 dark:border-indigo-800">
                  {diffResult.totalNewTriples} novidades
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Comparando <strong>{diffResult.baseFile}</strong> (Antes) com <strong>{diffResult.comparedFile}</strong> (Depois)
              </p>
            </div>
          </div>
        </div>

        {/* Stats Badges by Property (RF-40) */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Por Propriedade:
          </span>
          {Object.entries(diffResult.statsByProperty).map(([propIri, stat]) => (
            <button
              key={propIri}
              type="button"
              onClick={() => {
                setFilterProp(propIri);
                setActiveTab('assertions');
              }}
              className={`px-2.5 py-1 text-xs rounded-lg border font-medium transition flex items-center gap-1.5 ${
                filterProp === propIri
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                  : 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50'
              }`}
            >
              <span>{stat.label}:</span>
              <strong>{stat.count}</strong>
            </button>
          ))}
          {diffResult.newTypes.length > 0 && (
            <button
              type="button"
              onClick={() => setActiveTab('types')}
              className="px-2.5 py-1 text-xs rounded-lg border font-medium bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 flex items-center gap-1.5"
            >
              <span>Novas Classes:</span>
              <strong>{diffResult.newTypes.length}</strong>
            </button>
          )}
        </div>
      </div>

      {/* Tabs: Assertions vs Types vs Axioms */}
      <div className="flex items-center gap-1 px-4 pt-3 border-b border-slate-100 dark:border-slate-800 text-xs">
        <button
          type="button"
          onClick={() => setActiveTab('assertions')}
          className={`px-3 py-2 border-b-2 font-semibold transition ${
            activeTab === 'assertions'
              ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Asserções de Propriedade ({diffResult.newAssertions.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('types')}
          className={`px-3 py-2 border-b-2 font-semibold transition ${
            activeTab === 'types'
              ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Classificações de Indivíduos ({diffResult.newTypes.length})
        </button>
        {diffResult.newAxioms.length > 0 && (
          <button
            type="button"
            onClick={() => setActiveTab('axioms')}
            className={`px-3 py-2 border-b-2 font-semibold transition ${
              activeTab === 'axioms'
                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Outros Axiomas ({diffResult.newAxioms.length})
          </button>
        )}
      </div>

      {/* Table / Content List */}
      <div className="p-4 overflow-y-auto max-h-[520px] flex-1">
        {activeTab === 'assertions' && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold bg-slate-50 dark:bg-slate-800/40">
                  <th className="py-2.5 px-3">Sujeito</th>
                  <th className="py-2.5 px-3">Propriedade Inferida</th>
                  <th className="py-2.5 px-3">Objeto / Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredAssertions.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-slate-400">
                      Nenhuma asserção nova encontrada com os filtros selecionados.
                    </td>
                  </tr>
                ) : (
                  filteredAssertions.map((a, idx) => (
                    <tr key={idx} className="hover:bg-indigo-50/40 dark:hover:bg-indigo-950/20">
                      <td className="py-2.5 px-3 font-medium text-slate-800 dark:text-slate-200">
                        <button
                          type="button"
                          onClick={() => onSelectEntity('individual', a.subjectIri)}
                          className="hover:underline text-indigo-600 dark:text-indigo-400"
                        >
                          {a.subjectLabel}
                        </button>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                          {a.propertyLabel}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300">
                        {a.isLiteral ? (
                          <span className="font-mono">{a.objectLabel}</span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onSelectEntity('individual', a.object)}
                            className="hover:underline text-emerald-600 dark:text-emerald-400 font-medium"
                          >
                            {a.objectLabel}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'types' && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold bg-slate-50 dark:bg-slate-800/40">
                  <th className="py-2.5 px-3">Indivíduo</th>
                  <th className="py-2.5 px-3">Nova Classe Atribuída (Inferida)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredTypes.map((t, idx) => (
                  <tr key={idx} className="hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20">
                    <td className="py-2.5 px-3 font-medium text-slate-800 dark:text-slate-200">
                      <button
                        type="button"
                        onClick={() => onSelectEntity('individual', t.individualIri)}
                        className="hover:underline text-emerald-600 dark:text-emerald-400"
                      >
                        {t.individualLabel}
                      </button>
                    </td>
                    <td className="py-2.5 px-3">
                      <button
                        type="button"
                        onClick={() => onSelectEntity('class', t.classIri)}
                        className="px-2 py-0.5 rounded-md font-semibold text-[11px] bg-primary-50 dark:bg-primary-950 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800 hover:underline"
                      >
                        {t.classLabel}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'axioms' && (
          <div className="space-y-2">
            {diffResult.newAxioms.map((ax, idx) => (
              <div key={idx} className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-lg font-mono text-[11px] text-slate-600 dark:text-slate-300">
                <span>{ax.subject}</span> <strong>{ax.predicate}</strong> <span>{ax.object}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
