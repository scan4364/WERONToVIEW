import React, { useState } from 'react';
import { 
  X, 
  Boxes, 
  Database, 
  User, 
  ExternalLink, 
  ScrollText, 
  Layers, 
  Repeat, 
  ArrowRight,
  Sparkles,
  Code2,
  Copy,
  Check
} from 'lucide-react';
import { OntologyModel } from '../types/ontology';
import { 
  formatEquivalentClassPortuguese, 
  formatEquivalentClassDL, 
  formatRestrictionToPortuguese, 
  formatRestrictionToDL,
  formatPropertyChain
} from '../utils/dlFormatter';
import { formatAtom } from '../utils/swrlFormatter';

interface DetailModalProps {
  entityType: 'class' | 'property' | 'individual' | null;
  entityIri: string | null;
  model: OntologyModel;
  isDetailed: boolean;
  onClose: () => void;
  onSelectEntity: (type: 'class' | 'property' | 'individual', iri: string) => void;
}

export const DetailModal: React.FC<DetailModalProps> = ({
  entityType,
  entityIri,
  model,
  isDetailed,
  onClose,
  onSelectEntity
}) => {
  const [dlNotation, setDlNotation] = useState<'portuguese' | 'dl'>('portuguese');
  const [copied, setCopied] = useState(false);

  if (!entityType || !entityIri) return null;

  const handleCopyIri = () => {
    navigator.clipboard.writeText(entityIri);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Find rules that use this class or property (RF-34)
  const relatedRules = model.swrlRules.filter(r => {
    if (entityType === 'class') return r.usedClasses.includes(entityIri);
    if (entityType === 'property') return r.usedProperties.includes(entityIri);
    return false;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className={`p-2.5 rounded-2xl shrink-0 mt-0.5 ${
              entityType === 'class'
                ? 'bg-primary-100 dark:bg-primary-950 text-primary-600 dark:text-primary-400'
                : (entityType === 'property'
                  ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400'
                  : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400')
            }`}>
              {entityType === 'class' && <Boxes className="w-5 h-5" />}
              {entityType === 'property' && <Database className="w-5 h-5" />}
              {entityType === 'individual' && <User className="w-5 h-5" />}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  {entityType === 'class' ? 'Classe OWL' : (entityType === 'property' ? 'Propriedade OWL' : 'Indivíduo')}
                </span>
                
                {/* Switch between DL Formal and Portuguese (RF-30) */}
                {entityType === 'class' && (
                  <div className="flex items-center bg-slate-200/60 dark:bg-slate-800 p-0.5 rounded-lg text-[10px]">
                    <button
                      type="button"
                      onClick={() => setDlNotation('portuguese')}
                      className={`px-2 py-0.5 rounded font-medium transition ${
                        dlNotation === 'portuguese'
                          ? 'bg-white dark:bg-slate-900 text-primary-600 dark:text-primary-400 shadow-sm'
                          : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      Manchester (PT)
                    </button>
                    <button
                      type="button"
                      onClick={() => setDlNotation('dl')}
                      className={`px-2 py-0.5 rounded font-medium transition ${
                        dlNotation === 'dl'
                          ? 'bg-white dark:bg-slate-900 text-primary-600 dark:text-primary-400 shadow-sm'
                          : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      DL Formal (⊓, ∃, ≥)
                    </button>
                  </div>
                )}
              </div>

              <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
                {entityType === 'class' && (model.classes[entityIri]?.label || entityIri.split('#').pop())}
                {entityType === 'property' && (model.properties[entityIri]?.label || entityIri.split('#').pop())}
                {entityType === 'individual' && (model.individuals[entityIri]?.label || entityIri.split('#').pop())}
              </h2>

              {/* Technical IRI display in Detailed view (RF-13, RF-20) */}
              <div className="flex items-center gap-2 mt-1">
                <p className="text-xs font-mono text-slate-400 truncate max-w-md">
                  {entityIri}
                </p>
                <button
                  type="button"
                  onClick={handleCopyIri}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
                  title="Copiar IRI completa"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          
          {/* ===================== CLASS DETAILS (RF-21) ===================== */}
          {entityType === 'class' && (() => {
            const cls = model.classes[entityIri];
            if (!cls) return <p>Classe não encontrada.</p>;

            return (
              <>
                {cls.comment && (
                  <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 leading-relaxed text-xs">
                    <strong>Comentário (rdfs:comment):</strong> {cls.comment}
                  </div>
                )}

                {/* Defined Class Axioms (RF-30) */}
                {cls.equivalentClasses.length > 0 && (
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      Definição Equivalente (owl:equivalentClass)
                    </h4>
                    <div className="space-y-2">
                      {cls.equivalentClasses.map((eq, idx) => (
                        <div key={idx} className="p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 font-mono text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
                          {dlNotation === 'portuguese'
                            ? formatEquivalentClassPortuguese(cls.label, eq)
                            : formatEquivalentClassDL(cls.label, eq)}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Superclasses & Subclasses */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800">
                    <h5 className="font-bold text-slate-700 dark:text-slate-200 mb-2">
                      Superclasses ({cls.superClasses.length})
                    </h5>
                    {cls.superClasses.length === 0 ? (
                      <span className="text-slate-400">owl:Thing</span>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {cls.superClasses.map(s => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => onSelectEntity('class', s)}
                            className="px-2 py-1 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-primary-600 dark:text-primary-400 hover:underline"
                          >
                            {model.classes[s]?.label || s.split('#').pop()}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800">
                    <h5 className="font-bold text-slate-700 dark:text-slate-200 mb-2">
                      Subclasses Diretas ({cls.subClasses.length})
                    </h5>
                    {cls.subClasses.length === 0 ? (
                      <span className="text-slate-400">Nenhuma subclasse</span>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {cls.subClasses.map(sub => (
                          <button
                            key={sub}
                            type="button"
                            onClick={() => onSelectEntity('class', sub)}
                            className="px-2 py-1 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-primary-600 dark:text-primary-400 hover:underline"
                          >
                            {model.classes[sub]?.label || sub.split('#').pop()}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Restrictions (RF-30, RF-31) */}
                {cls.restrictions.length > 0 && (
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-2">
                      Restrições Lógicas ({cls.restrictions.length})
                    </h4>
                    <div className="space-y-1.5">
                      {cls.restrictions.map((r, idx) => (
                        <div key={idx} className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 font-mono text-slate-800 dark:text-slate-200">
                          {dlNotation === 'portuguese'
                            ? formatRestrictionToPortuguese(r)
                            : formatRestrictionToDL(r)}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Related SWRL Rules (RF-34) */}
                {relatedRules.length > 0 && (
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-1.5">
                      <ScrollText className="w-4 h-4 text-amber-500" />
                      Regras SWRL que usam esta classe ({relatedRules.length})
                    </h4>
                    <div className="space-y-2">
                      {relatedRules.map(r => (
                        <div key={r.id} className="p-2.5 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-xl">
                          <span className="font-bold text-amber-800 dark:text-amber-300">{r.label}</span>
                          <p className="font-mono text-[11px] text-slate-700 dark:text-slate-300 mt-1">
                            {r.readableLogic}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Individuals of this class (RF-21) */}
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-2">
                    Indivíduos / Instâncias ({cls.individuals.length})
                  </h4>
                  {cls.individuals.length === 0 ? (
                    <p className="text-slate-400">Nenhum indivíduo explicitamente associado.</p>
                  ) : (
                    <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto p-1">
                      {cls.individuals.map(indIri => {
                        const ind = model.individuals[indIri];
                        return (
                          <button
                            key={indIri}
                            type="button"
                            onClick={() => onSelectEntity('individual', indIri)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900 transition flex items-center gap-1"
                          >
                            <User className="w-3 h-3" />
                            <span>{ind?.label || indIri.split('#').pop()}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </>
            );
          })()}

          {/* ===================== PROPERTY DETAILS (RF-12, RF-30) ===================== */}
          {entityType === 'property' && (() => {
            const p = model.properties[entityIri];
            if (!p) return <p>Propriedade não encontrada.</p>;

            return (
              <>
                {p.comment && (
                  <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 leading-relaxed text-xs">
                    <strong>Comentário:</strong> {p.comment}
                  </div>
                )}

                {/* Characteristics */}
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800">
                  <h5 className="font-bold text-slate-700 dark:text-slate-200 mb-2">Características</h5>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 font-medium">
                      Tipo: {p.type === 'object' ? 'Objeto' : (p.type === 'datatype' ? 'Dados' : 'Anotação')}
                    </span>
                    {p.isFunctional && <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">Funcional</span>}
                    {p.isTransitive && <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300">Transitiva</span>}
                    {p.isSymmetric && <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">Simétrica</span>}
                    {p.inverseOfLabel && (
                      <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                        Inversa de: {p.inverseOfLabel}
                      </span>
                    )}
                  </div>
                </div>

                {/* Property Chain Axiom (RF-30) */}
                {p.propertyChain && p.propertyChainLabels && (
                  <div className="p-3.5 bg-rose-50/60 dark:bg-rose-950/30 rounded-xl border border-rose-200 dark:border-rose-900/50">
                    <h5 className="font-bold text-rose-800 dark:text-rose-300 mb-1">
                      Cadeia de Propriedades (owl:propertyChainAxiom)
                    </h5>
                    <p className="font-mono text-xs text-rose-900 dark:text-rose-200">
                      {formatPropertyChain(p.label, p.propertyChainLabels)}
                    </p>
                  </div>
                )}

                {/* Related SWRL Rules (RF-34) */}
                {relatedRules.length > 0 && (
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-1.5">
                      <ScrollText className="w-4 h-4 text-amber-500" />
                      Regras SWRL que usam esta propriedade ({relatedRules.length})
                    </h4>
                    <div className="space-y-2">
                      {relatedRules.map(r => (
                        <div key={r.id} className="p-2.5 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-xl">
                          <span className="font-bold text-amber-800 dark:text-amber-300">{r.label}</span>
                          <p className="font-mono text-[11px] text-slate-700 dark:text-slate-300 mt-1">
                            {r.readableLogic}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            );
          })()}

          {/* ===================== INDIVIDUAL DETAILS (RF-22) ===================== */}
          {entityType === 'individual' && (() => {
            const ind = model.individuals[entityIri];
            if (!ind) return <p>Indivíduo não encontrado.</p>;

            return (
              <>
                {/* Classes of the Individual */}
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-2">
                    Classes (rdf:type)
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {ind.types.map(tIri => (
                      <button
                        key={tIri}
                        type="button"
                        onClick={() => onSelectEntity('class', tIri)}
                        className="px-2.5 py-1 rounded-lg bg-primary-50 dark:bg-primary-950 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800 font-semibold hover:underline"
                      >
                        {model.classes[tIri]?.label || tIri.split('#').pop()}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Object Property Assertions with CLICKABLE LINKS (RF-22) */}
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-2">
                    Relacionamentos de Objeto ({ind.objectProperties.length})
                  </h4>
                  {ind.objectProperties.length === 0 ? (
                    <p className="text-slate-400">Nenhuma asserção de objeto.</p>
                  ) : (
                    <div className="space-y-2 max-h-56 overflow-y-auto">
                      {ind.objectProperties.map((op, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                          <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                            {op.propertyLabel}
                          </span>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                          <button
                            type="button"
                            onClick={() => onSelectEntity('individual', op.targetIri)}
                            className="font-medium text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                          >
                            <span>{op.targetLabel}</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Data Property Assertions (URLs clicáveis RF-22) */}
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-2">
                    Propriedades de Dados ({ind.dataProperties.length})
                  </h4>
                  {ind.dataProperties.length === 0 ? (
                    <p className="text-slate-400">Nenhum dado atribuído.</p>
                  ) : (
                    <div className="space-y-1.5 max-h-52 overflow-y-auto">
                      {ind.dataProperties.map((dp, idx) => {
                        const isUrl = dp.value.startsWith('http://') || dp.value.startsWith('https://');
                        return (
                          <div key={idx} className="flex items-start justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800">
                            <span className="font-semibold text-slate-700 dark:text-slate-300">
                              {dp.propertyLabel}:
                            </span>
                            {isUrl ? (
                              <a
                                href={dp.value}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-mono text-primary-600 dark:text-primary-400 underline flex items-center gap-1 ml-2 break-all"
                              >
                                {dp.value}
                                <ExternalLink className="w-3 h-3 shrink-0" />
                              </a>
                            ) : (
                              <span className="font-mono text-slate-600 dark:text-slate-400 ml-2">
                                {dp.value}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </>
            );
          })()}

          {/* ===================== RAW TRIPLES VIEW (RF-25) ===================== */}
          {isDetailed && (
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
              <h4 className="font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                <Code2 className="w-4 h-4 text-slate-400" />
                Visão Crua: Triplas RDF do Elemento (RF-25)
              </h4>
              <div className="p-3 bg-slate-900 text-slate-100 rounded-xl font-mono text-[11px] max-h-44 overflow-y-auto space-y-1">
                {model.rawTriples
                  .filter(t => t.subject === entityIri)
                  .map((t, idx) => (
                    <div key={idx} className="flex gap-2">
                      <span className="text-amber-400">{t.predicate.split('#').pop() || t.predicate}:</span>
                      <span className="text-slate-300 break-all">{t.object}</span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
