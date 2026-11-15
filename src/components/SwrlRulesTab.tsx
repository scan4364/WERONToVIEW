import React, { useState } from 'react';
import { 
  ScrollText, 
  Search, 
  Filter, 
  ArrowRight, 
  Code2, 
  Layers, 
  BookOpen,
  Boxes,
  Database
} from 'lucide-react';
import { OntologyModel, SWRLRule } from '../types/ontology';
import { formatAtom, formatAtomPortuguese } from '../utils/swrlFormatter';

interface SwrlRulesTabProps {
  model: OntologyModel;
  isDetailed: boolean;
  onSelectEntity: (type: 'class' | 'property', iri: string) => void;
}

export const SwrlRulesTab: React.FC<SwrlRulesTabProps> = ({
  model,
  isDetailed,
  onSelectEntity
}) => {
  const [search, setSearch] = useState('');
  const [filterEntity, setFilterEntity] = useState<string>('all');
  const [syntaxMode, setSyntaxMode] = useState<'logic' | 'portuguese'>('logic');

  const filteredRules = React.useMemo(() => {
    return model.swrlRules.filter(r => {
      if (filterEntity !== 'all') {
        const matchesClass = r.usedClasses.includes(filterEntity);
        const matchesProp = r.usedProperties.includes(filterEntity);
        if (!matchesClass && !matchesProp) return false;
      }
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          r.label.toLowerCase().includes(q) ||
          (r.comment && r.comment.toLowerCase().includes(q)) ||
          r.readableLogic.toLowerCase().includes(q) ||
          r.readablePortuguese.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [model.swrlRules, filterEntity, search]);

  // Unique list of classes and properties used across rules (RF-34)
  const availableEntities = React.useMemo(() => {
    const classSet = new Set<string>();
    const propSet = new Set<string>();
    model.swrlRules.forEach(r => {
      r.usedClasses.forEach(c => classSet.add(c));
      r.usedProperties.forEach(p => propSet.add(p));
    });
    return {
      classes: Array.from(classSet),
      properties: Array.from(propSet)
    };
  }, [model.swrlRules]);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col h-full">
      
      {/* Header and Controls */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <ScrollText className="w-5 h-5 text-amber-500" />
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                Regras Semânticas SWRL ({model.swrlRules.length})
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Regras de inferência de primeira ordem executadas via raciocinador / Drools
              </p>
            </div>
          </div>

          {/* Syntax Toggle: Logic vs Portuguese */}
          <div className="flex items-center bg-slate-200/60 dark:bg-slate-800 p-0.5 rounded-lg text-xs self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setSyntaxMode('logic')}
              className={`px-3 py-1 rounded-md font-medium transition ${
                syntaxMode === 'logic'
                  ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Lógica (∧, →)
            </button>
            <button
              type="button"
              onClick={() => setSyntaxMode('portuguese')}
              className={`px-3 py-1 rounded-md font-medium transition ${
                syntaxMode === 'portuguese'
                  ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Português (SE... ENTÃO)
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por nome, comentário ou termos da regra..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>

          <select
            value={filterEntity}
            onChange={e => setFilterEntity(e.target.value)}
            className="w-full sm:w-64 pl-3 pr-8 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 text-slate-700 dark:text-slate-200"
          >
            <option value="all">Todas as entidades usadas</option>
            <optgroup label="Classes">
              {availableEntities.classes.map(c => (
                <option key={c} value={c}>
                  {model.classes[c]?.label || c.split('#').pop()}
                </option>
              ))}
            </optgroup>
            <optgroup label="Propriedades">
              {availableEntities.properties.map(p => (
                <option key={p} value={p}>
                  {model.properties[p]?.label || p.split('#').pop()}
                </option>
              ))}
            </optgroup>
          </select>
        </div>
      </div>

      {/* Rules List */}
      <div className="p-4 overflow-y-auto max-h-[620px] space-y-4">
        {filteredRules.length === 0 ? (
          <p className="p-8 text-center text-xs text-slate-500">Nenhuma regra SWRL encontrada.</p>
        ) : (
          filteredRules.map((rule, idx) => (
            <div
              key={rule.id}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/40 hover:border-amber-400/60 dark:hover:border-amber-600/60 transition shadow-sm"
            >
              {/* Rule Title */}
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-md bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400 font-bold text-xs flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    {rule.label}
                  </h4>
                </div>

                <span className="text-[11px] text-slate-400 font-mono">
                  {rule.body.length} premissas → {rule.head.length} conclusão
                </span>
              </div>

              {/* Natural comment */}
              {rule.comment && (
                <p className="text-xs text-slate-600 dark:text-slate-300 mb-3 bg-amber-50/50 dark:bg-amber-950/20 p-2.5 rounded-lg border border-amber-100 dark:border-amber-900/40 leading-relaxed">
                  {rule.comment}
                </p>
              )}

              {/* Rule Code Box (RF-33) */}
              <div className="p-3 bg-slate-900 text-slate-100 rounded-xl font-mono text-xs overflow-x-auto shadow-inner leading-relaxed">
                {syntaxMode === 'logic' ? (
                  <div className="flex flex-wrap items-center gap-1.5">
                    {rule.body.map((atom, aIdx) => (
                      <React.Fragment key={aIdx}>
                        <span className="text-amber-300 font-semibold">{formatAtom(atom)}</span>
                        {aIdx < rule.body.length - 1 && (
                          <span className="text-slate-400 font-bold">∧</span>
                        )}
                      </React.Fragment>
                    ))}
                    <span className="text-rose-400 font-bold px-1 text-sm">→</span>
                    {rule.head.map((atom, aIdx) => (
                      <React.Fragment key={aIdx}>
                        <span className="text-emerald-300 font-semibold">{formatAtom(atom)}</span>
                        {aIdx < rule.head.length - 1 && (
                          <span className="text-slate-400 font-bold">∧</span>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                ) : (
                  <div className="text-slate-200">
                    {rule.readablePortuguese}
                  </div>
                )}
              </div>

              {/* Related Classes and Properties (RF-34) */}
              <div className="mt-3 flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-200/60 dark:border-slate-800">
                <span className="text-[10px] uppercase font-semibold text-slate-400">Usa:</span>
                
                {rule.usedClasses.map(cIri => {
                  const cLabel = model.classes[cIri]?.label || cIri.split('#').pop();
                  return (
                    <button
                      key={cIri}
                      type="button"
                      onClick={() => onSelectEntity('class', cIri)}
                      className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800 flex items-center gap-1 hover:bg-blue-100 transition"
                    >
                      <Boxes className="w-2.5 h-2.5" />
                      {cLabel}
                    </button>
                  );
                })}

                {rule.usedProperties.map(pIri => {
                  const pLabel = model.properties[pIri]?.label || pIri.split('#').pop();
                  return (
                    <button
                      key={pIri}
                      type="button"
                      onClick={() => onSelectEntity('property', pIri)}
                      className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 flex items-center gap-1 hover:bg-indigo-100 transition"
                    >
                      <Database className="w-2.5 h-2.5" />
                      {pLabel}
                    </button>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
