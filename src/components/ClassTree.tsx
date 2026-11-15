import React, { useState } from 'react';
import { 
  Boxes, 
  ChevronRight, 
  ChevronDown, 
  Search, 
  Layers, 
  FileCode, 
  Sparkles,
  Users
} from 'lucide-react';
import { OntologyClass, OntologyModel } from '../types/ontology';

interface ClassTreeProps {
  model: OntologyModel;
  isDetailed: boolean;
  onSelectClass: (iri: string) => void;
  selectedClassIri?: string;
}

interface TreeNodeProps {
  classIri: string;
  classes: Record<string, OntologyClass>;
  isDetailed: boolean;
  onSelectClass: (iri: string) => void;
  selectedClassIri?: string;
  level: number;
}

const TreeNode: React.FC<TreeNodeProps> = ({
  classIri,
  classes,
  isDetailed,
  onSelectClass,
  selectedClassIri,
  level
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const cls = classes[classIri];

  if (!cls) return null;

  const hasChildren = cls.subClasses.length > 0;
  const isSelected = selectedClassIri === classIri;
  const isDefined = cls.equivalentClasses.length > 0;

  return (
    <div className="select-none">
      <div
        className={`flex items-center gap-1.5 py-1.5 px-2 rounded-lg cursor-pointer text-xs transition ${
          isSelected
            ? 'bg-primary-50 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 font-semibold'
            : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
        }`}
        style={{ paddingLeft: `${Math.max(8, level * 20)}px` }}
        onClick={() => onSelectClass(classIri)}
      >
        {/* Collapse / Expand Caret */}
        {hasChildren ? (
          <button
            type="button"
            onClick={e => {
              e.stopPropagation();
              setIsOpen(!isOpen);
            }}
            className="p-0.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </button>
        ) : (
          <span className="w-3.5 h-3.5" />
        )}

        {/* Class Icon */}
        <Boxes className={`w-3.5 h-3.5 shrink-0 ${isDefined ? 'text-amber-500' : 'text-primary-500'}`} />

        {/* Class Label */}
        <span className="truncate flex-1 font-medium">
          {cls.label}
        </span>

        {/* Defined Class Badge */}
        {isDefined && (
          <span className="px-1.5 py-0.2 text-[9px] font-semibold bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 rounded border border-amber-200 dark:border-amber-800" title={cls.inferredSuperClasses && cls.inferredSuperClasses.length > 0 ? "Classe Definida ligada estruturalmente via intersectionOf (RF-19)" : "Classe Definida (com axioma de equivalência)"}>
            {cls.inferredSuperClasses && cls.inferredSuperClasses.length > 0 ? '≡ def (inf)' : '≡ def'}
          </span>
        )}

        {/* Individual Count Badge (RF-11) */}
        <span
          className={`px-1.5 py-0.5 text-[10px] rounded-full font-mono flex items-center gap-1 ${
            cls.individualCount > 0
              ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
          }`}
          title={`${cls.individualCount} indivíduos nesta classe`}
        >
          <Users className="w-2.5 h-2.5" />
          {cls.individualCount}
        </span>
      </div>

      {/* Render Subclasses recursively */}
      {hasChildren && isOpen && (
        <div className="mt-0.5">
          {cls.subClasses.map(subIri => (
            <TreeNode
              key={subIri}
              classIri={subIri}
              classes={classes}
              isDetailed={isDetailed}
              onSelectClass={onSelectClass}
              selectedClassIri={selectedClassIri}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const ClassTree: React.FC<ClassTreeProps> = ({
  model,
  isDetailed,
  onSelectClass,
  selectedClassIri
}) => {
  const [filter, setFilter] = useState('');

  // Find root classes (classes with no named superclasses or only Thing)
  const rootClasses = React.useMemo(() => {
    return Object.values(model.classes).filter(cls => {
      if (cls.superClasses.length === 0) return true;
      // If superclass is owl:Thing and not in user classes
      return cls.superClasses.every(s => s.endsWith('#Thing') || !model.classes[s]);
    });
  }, [model.classes]);

  // Filtered classes list if search query is present
  const filteredList = React.useMemo(() => {
    if (!filter.trim()) return null;
    const q = filter.toLowerCase();
    return Object.values(model.classes).filter(
      c => c.label.toLowerCase().includes(q) || c.iri.toLowerCase().includes(q)
    );
  }, [model.classes, filter]);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col h-full">
      
      {/* Header */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Boxes className="w-4 h-4 text-primary-500" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
              Hierarquia de Classes
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            {Object.keys(model.classes).length} classes
          </span>
        </div>

        {/* Filter Input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Filtrar classes..."
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>
      </div>

      {/* Tree View or Search Results */}
      <div className="p-2 overflow-y-auto max-h-[580px] flex-1">
        {filteredList ? (
          <div>
            <div className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Resultados da busca ({filteredList.length})
            </div>
            {filteredList.length === 0 ? (
              <p className="p-4 text-center text-xs text-slate-500">Nenhuma classe encontrada.</p>
            ) : (
              filteredList.map(c => (
                <div
                  key={c.iri}
                  onClick={() => onSelectClass(c.iri)}
                  className={`flex items-center justify-between p-2 rounded-lg cursor-pointer text-xs mb-1 ${
                    selectedClassIri === c.iri
                      ? 'bg-primary-50 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 font-semibold'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <Boxes className="w-3.5 h-3.5 text-primary-500 shrink-0" />
                    <span className="truncate">{c.label}</span>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono">
                    {c.individualCount}
                  </span>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-0.5">
            {rootClasses.map(root => (
              <TreeNode
                key={root.iri}
                classIri={root.iri}
                classes={model.classes}
                isDetailed={isDetailed}
                onSelectClass={onSelectClass}
                selectedClassIri={selectedClassIri}
                level={0}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
