import React, { useEffect, useRef, useState } from 'react';
import cytoscape, { Core } from 'cytoscape';
import { 
  Network, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Download, 
  Image, 
  ListTree,
  Info,
  Check,
  Layers,
  Sparkles
} from 'lucide-react';
import { OntologyModel } from '../types/ontology';
import { isBlankNode } from '../parser/rdfExtractor';

interface OntologyGraphProps {
  model: OntologyModel;
  onSelectClass: (iri: string) => void;
  selectedClassIri?: string;
  isDetailed: boolean;
}

interface SelectedEdgeInfo {
  sourceLabel: string;
  targetLabel: string;
  properties: { label: string; iri: string; isInverse?: boolean }[];
  isSubclass?: boolean;
  isInferred?: boolean;
}

export const OntologyGraph: React.FC<OntologyGraphProps> = ({
  model,
  onSelectClass,
  selectedClassIri,
  isDetailed
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<Core | null>(null);
  const [activeView, setActiveView] = useState<'graph' | 'accessibleList'>('graph');
  const [includeIndividuals, setIncludeIndividuals] = useState(false);
  const [selectedEdge, setSelectedEdge] = useState<SelectedEdgeInfo | null>(null);

  // Initialize and update Cytoscape graph
  useEffect(() => {
    if (!containerRef.current || activeView !== 'graph') return;

    const elements: cytoscape.ElementDefinition[] = [];

    // RF-16: Adicionar nós de Classes (NUNCA incluir nós anônimos)
    Object.values(model.classes).forEach(cls => {
      if (isBlankNode(cls.iri)) return;

      const label = cls.label || cls.iri.split('#').pop() || 'Classe';
      // RF-17 & RF-17.1: Largura e altura ajustadas ao texto para que nunca ultrapasse as bordas
      const approxCharWidth = 8.2;
      const calculatedWidth = Math.max(90, Math.min(260, Math.round(label.length * approxCharWidth + 28)));
      const isLongText = label.length > 20;
      const calculatedHeight = isLongText ? 44 : 36;

      elements.push({
        data: {
          id: cls.iri,
          label: label,
          type: 'class',
          individuals: cls.individualCount,
          isDefined: cls.equivalentClasses.length > 0 ? 1 : 0,
          nodeWidth: calculatedWidth,
          nodeHeight: calculatedHeight,
          textMaxWidth: calculatedWidth - 16
        }
      });
    });

    // SubClassOf Edges (Declaradas e Inferidas RF-19)
    Object.values(model.classes).forEach(cls => {
      if (isBlankNode(cls.iri)) return;

      cls.superClasses.forEach(superIri => {
        if (isBlankNode(superIri) || !model.classes[superIri]) return;

        const isInferred = cls.inferredSuperClasses?.includes(superIri);

        elements.push({
          data: {
            id: `sub_${cls.iri}_${superIri}`,
            source: cls.iri,
            target: superIri,
            label: isInferred ? '≡ subClassOf' : 'subClassOf',
            edgeType: isInferred ? 'inferredSubclass' : 'subclass',
            isInferred: isInferred ? 1 : 0
          }
        });
      });
    });

    // Object Property Edges (RF-18, RF-18.1, RF-18.2)
    // Agrupar propriedades que ligam o mesmo par (source -> target)
    const propertyPairs = new Map<string, {
      source: string;
      target: string;
      properties: { label: string; iri: string; isInverse?: boolean }[];
    }>();

    Object.values(model.properties).forEach(prop => {
      if (prop.type !== 'object' || isBlankNode(prop.iri)) return;

      // RF-18: Propriedades inversas ficam ocultas no grafo da visão simples
      if (!isDetailed && prop.isInverse) {
        return;
      }

      prop.domains.forEach(dIri => {
        if (isBlankNode(dIri) || !model.classes[dIri]) return;

        prop.ranges.forEach(rIri => {
          if (isBlankNode(rIri) || !model.classes[rIri]) return;

          const pairKey = `${dIri}|${rIri}`;
          if (!propertyPairs.has(pairKey)) {
            propertyPairs.set(pairKey, {
              source: dIri,
              target: rIri,
              properties: []
            });
          }

          const existing = propertyPairs.get(pairKey)!;
          if (!existing.properties.some(p => p.iri === prop.iri)) {
            existing.properties.push({
              label: prop.label,
              iri: prop.iri,
              isInverse: prop.isInverse
            });
          }
        });
      });
    });

    // RF-18.1: Criar arestas agrupadas no grafo
    propertyPairs.forEach((pairData, pairKey) => {
      const isLoop = pairData.source === pairData.target;
      const count = pairData.properties.length;

      // Rótulo da aresta
      let edgeLabel = '';
      if (count === 1) {
        edgeLabel = pairData.properties[0].label;
      } else if (count === 2) {
        edgeLabel = `${pairData.properties[0].label} / ${pairData.properties[1].label}`;
      } else {
        edgeLabel = `${pairData.properties[0].label} (+${count - 1})`;
      }

      elements.push({
        data: {
          id: `prop_grouped_${pairKey}`,
          source: pairData.source,
          target: pairData.target,
          label: edgeLabel,
          edgeType: 'property',
          isLoop: isLoop ? 1 : 0,
          propertiesCount: count,
          propertiesList: JSON.stringify(pairData.properties)
        }
      });
    });

    // Opcional: Adicionar nós de indivíduos se toggled (RF-16: nunca nós anônimos)
    if (includeIndividuals) {
      Object.values(model.individuals).forEach(ind => {
        if (isBlankNode(ind.iri)) return;

        elements.push({
          data: {
            id: ind.iri,
            label: ind.label,
            type: 'individual',
            nodeWidth: 32,
            nodeHeight: 32,
            textMaxWidth: 80
          }
        });

        ind.types.forEach(tIri => {
          if (!isBlankNode(tIri) && model.classes[tIri]) {
            elements.push({
              data: {
                id: `type_${ind.iri}_${tIri}`,
                source: ind.iri,
                target: tIri,
                label: 'rdf:type',
                edgeType: 'type'
              }
            });
          }
        });
      });
    }

    const cy = cytoscape({
      container: containerRef.current,
      elements,
      style: [
        // RF-17: Nó de classe retangular arredondado com tamanho ajustado ao texto
        {
          selector: 'node[type="class"]',
          style: {
            'shape': 'round-rectangle',
            'background-color': '#0284c7',
            'label': 'data(label)',
            'color': '#ffffff',
            'font-size': '11px',
            'font-weight': 'bold',
            'text-valign': 'center',
            'text-halign': 'center',
            'text-wrap': 'wrap',
            'text-max-width': 'data(textMaxWidth)',
            'width': 'data(nodeWidth)',
            'height': 'data(nodeHeight)',
            'border-width': 2,
            'border-color': '#0369a1',
            'transition-property': 'background-color, border-color, width, height',
            'transition-duration': 0.2
          }
        },
        // RF-19: Classe definida estilizada com destaque
        {
          selector: 'node[isDefined = 1]',
          style: {
            'background-color': '#d97706',
            'border-color': '#b45309',
            'border-width': 2.5
          }
        },
        {
          selector: 'node[type="individual"]',
          style: {
            'shape': 'ellipse',
            'background-color': '#10b981',
            'label': 'data(label)',
            'color': '#ffffff',
            'font-size': '9px',
            'width': '28px',
            'height': '28px',
            'border-width': 1,
            'border-color': '#059669'
          }
        },
        // subClassOf declarada
        {
          selector: 'edge[edgeType="subclass"]',
          style: {
            'width': 2,
            'line-color': '#64748b',
            'target-arrow-color': '#64748b',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
            'line-style': 'solid',
            'arrow-scale': 1.1
          }
        },
        // RF-19.1: subClassOf inferida por equivalentClass com intersectionOf (linha tracejada)
        {
          selector: 'edge[edgeType="inferredSubclass"]',
          style: {
            'width': 2,
            'line-color': '#d97706',
            'target-arrow-color': '#d97706',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
            'line-style': 'dashed',
            'line-dash-pattern': [6, 4],
            'arrow-scale': 1.1
          }
        },
        // Object Property normal
        {
          selector: 'edge[edgeType="property"]',
          style: {
            'width': 1.5,
            'line-color': '#6366f1',
            'target-arrow-color': '#6366f1',
            'target-arrow-shape': 'vee',
            'curve-style': 'bezier',
            'label': 'data(label)',
            'font-size': '9.5px',
            'color': '#334155',
            'text-background-color': '#ffffff',
            'text-background-opacity': 0.9,
            'text-background-padding': '3px',
            'text-rotation': 'autorotate'
          }
        },
        // RF-18.2: Auto-relações (loops) desenhadas perfeitamente fora do nó
        {
          selector: 'edge[isLoop = 1]',
          style: {
            'curve-style': 'bezier',
            'control-point-step-size': 50,
            'loop-direction': '-45deg',
            'loop-sweep': '-90deg',
            'text-margin-y': -8
          }
        },
        {
          selector: 'edge[edgeType="type"]',
          style: {
            'width': 1,
            'line-color': '#a7f3d0',
            'line-style': 'dashed',
            'target-arrow-color': '#10b981',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier'
          }
        },
        // Elementos em destaque
        {
          selector: '.highlighted',
          style: {
            'background-color': '#ef4444',
            'border-color': '#b91c1c',
            'border-width': 3,
            'line-color': '#ef4444',
            'target-arrow-color': '#ef4444',
            'z-index': 999
          }
        },
        {
          selector: '.faded',
          style: {
            'opacity': 0.15
          }
        }
      ],
      layout: {
        name: 'cose',
        animate: false,
        randomize: false,
        componentSpacing: 110,
        nodeOverlap: 25,
        idealEdgeLength: 130,
        edgeElasticity: 100,
        nestingFactor: 5,
        gravity: 80,
        numIter: 1000,
        initialTemp: 200,
        coolingFactor: 0.95
      }
    });

    cyRef.current = cy;

    // Seleção de nó e vizinhos
    cy.on('tap', 'node', function (evt) {
      const node = evt.target;
      const id = node.data('id');
      const type = node.data('type');

      setSelectedEdge(null);

      if (type === 'class') {
        onSelectClass(id);
      }

      cy.elements().removeClass('highlighted faded');
      const neighborhood = node.neighborhood().add(node);
      cy.elements().not(neighborhood).addClass('faded');
      neighborhood.addClass('highlighted');
    });

    // Seleção de aresta para exibir propriedades agrupadas (RF-18.1)
    cy.on('tap', 'edge', function (evt) {
      const edge = evt.target;
      const edgeType = edge.data('edgeType');
      const sourceId = edge.data('source');
      const targetId = edge.data('target');
      const sourceLabel = model.classes[sourceId]?.label || sourceId.split('#').pop() || 'Classe';
      const targetLabel = model.classes[targetId]?.label || targetId.split('#').pop() || 'Classe';

      if (edgeType === 'property') {
        const rawProps = edge.data('propertiesList');
        const properties = rawProps ? JSON.parse(rawProps) : [];
        setSelectedEdge({
          sourceLabel,
          targetLabel,
          properties,
          isSubclass: false
        });
      } else if (edgeType === 'subclass' || edgeType === 'inferredSubclass') {
        setSelectedEdge({
          sourceLabel,
          targetLabel,
          properties: [],
          isSubclass: true,
          isInferred: edge.data('isInferred') === 1
        });
      }
    });

    cy.on('tap', function (evt) {
      if (evt.target === cy) {
        cy.elements().removeClass('highlighted faded');
        setSelectedEdge(null);
      }
    });

    return () => {
      cy.destroy();
    };
  }, [model, activeView, includeIndividuals, isDetailed]);

  // Handle selectedClassIri external change
  useEffect(() => {
    if (!cyRef.current || !selectedClassIri) return;
    const cy = cyRef.current;
    const node = cy.getElementById(selectedClassIri);
    if (node && node.length > 0) {
      cy.elements().removeClass('highlighted faded');
      const neighborhood = node.neighborhood().add(node);
      cy.elements().not(neighborhood).addClass('faded');
      neighborhood.addClass('highlighted');
      cy.animate({
        center: { eles: node },
        zoom: 1.15
      }, { duration: 400 });
    }
  }, [selectedClassIri]);

  // Export functions (RF-51)
  const handleExportPNG = () => {
    if (!cyRef.current) return;
    const pngData = cyRef.current.png({ full: true, scale: 2.5, bg: '#ffffff' });
    const a = document.createElement('a');
    a.href = pngData;
    a.download = `grafo-${model.metadata.label || 'ontologia'}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col h-full">
      
      {/* Graph Toolbar */}
      <div className="p-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Network className="w-4 h-4 text-primary-500" />
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
            Grafo Conceitual da Ontologia
          </h3>
          <span className="hidden sm:inline px-2 py-0.5 text-[10px] rounded-full bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            {Object.keys(model.classes).length} classes
          </span>
          {!isDetailed && (
            <span className="px-2 py-0.5 text-[10px] bg-primary-50 text-primary-700 dark:bg-primary-950 dark:text-primary-300 rounded border border-primary-200 dark:border-primary-800">
              Visão Simples (inversas ocultas)
            </span>
          )}
        </div>

        {/* View Toggle & Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-200/60 dark:bg-slate-800 p-0.5 rounded-lg text-xs">
            <button
              type="button"
              onClick={() => setActiveView('graph')}
              className={`px-2.5 py-1 rounded-md font-medium transition ${
                activeView === 'graph'
                  ? 'bg-white dark:bg-slate-900 text-primary-600 dark:text-primary-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Grafo
            </button>
            <button
              type="button"
              onClick={() => setActiveView('accessibleList')}
              className={`px-2.5 py-1 rounded-md font-medium transition flex items-center gap-1 ${
                activeView === 'accessibleList'
                  ? 'bg-white dark:bg-slate-900 text-primary-600 dark:text-primary-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
              title="Alternativa em lista/tabela para leitores de tela e acessibilidade (WCAG AA)"
            >
              <ListTree className="w-3.5 h-3.5" />
              <span>Lista Acessível</span>
            </button>
          </div>

          {activeView === 'graph' && (
            <>
              {/* Zoom Controls */}
              <div className="flex items-center bg-slate-200/60 dark:bg-slate-800 p-0.5 rounded-lg">
                <button
                  type="button"
                  onClick={() => cyRef.current?.zoom(cyRef.current.zoom() * 1.25)}
                  className="p-1 text-slate-600 hover:text-slate-900 dark:text-slate-300 rounded"
                  title="Aproximar zoom"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => cyRef.current?.zoom(cyRef.current.zoom() * 0.8)}
                  className="p-1 text-slate-600 hover:text-slate-900 dark:text-slate-300 rounded"
                  title="Afastar zoom"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => cyRef.current?.fit(undefined, 30)}
                  className="p-1 text-slate-600 hover:text-slate-900 dark:text-slate-300 rounded"
                  title="Ajustar à tela"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Toggle individuals */}
              <button
                type="button"
                onClick={() => setIncludeIndividuals(!includeIndividuals)}
                className={`px-2.5 py-1 text-xs rounded-lg border font-medium transition ${
                  includeIndividuals
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
                title="Exibir nós de indivíduos no grafo"
              >
                {includeIndividuals ? 'Ocultar Indivíduos' : 'Mostrar Indivíduos'}
              </button>

              {/* Export Button */}
              <button
                type="button"
                onClick={handleExportPNG}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-primary-600 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm transition"
                title="Exportar imagem PNG de alta definição"
              >
                <Image className="w-3.5 h-3.5" />
                <span>Exportar PNG</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      {activeView === 'graph' ? (
        <div className="relative flex-1 min-h-[550px] bg-slate-50 dark:bg-slate-950/50">
          <div ref={containerRef} className="w-full h-full min-h-[550px]" />
          
          {/* Selected Edge Info Card (RF-18.1) */}
          {selectedEdge && (
            <div className="absolute top-3 right-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs shadow-xl max-w-xs animate-in fade-in duration-150 z-20">
              <div className="font-bold text-slate-900 dark:text-slate-100 mb-1 flex items-center justify-between">
                <span>Relacionamento</span>
                <button
                  type="button"
                  onClick={() => setSelectedEdge(null)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="text-[11px] text-slate-600 dark:text-slate-300 mb-2">
                <strong>{selectedEdge.sourceLabel}</strong> → <strong>{selectedEdge.targetLabel}</strong>
              </div>

              {selectedEdge.isSubclass ? (
                <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded font-medium text-slate-700 dark:text-slate-200">
                  {selectedEdge.isInferred ? (
                    <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      Subclasse inferida estruturalmente (RF-19)
                    </span>
                  ) : (
                    <span>Subclasse declarada (rdfs:subClassOf)</span>
                  )}
                </div>
              ) : (
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    Propriedades agrupadas ({selectedEdge.properties.length}):
                  </span>
                  <div className="space-y-1">
                    {selectedEdge.properties.map(p => (
                      <div key={p.iri} className="p-1.5 bg-indigo-50 dark:bg-indigo-950/50 rounded font-semibold text-indigo-700 dark:text-indigo-300 flex items-center justify-between">
                        <span>{p.label}</span>
                        {p.isInverse && (
                          <span className="text-[9px] px-1 bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 rounded">
                            inversa
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Legend overlay */}
          <div className="absolute bottom-3 left-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-[11px] shadow-md flex flex-wrap items-center gap-3 select-none">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-sky-600" />
              <span className="text-slate-700 dark:text-slate-300">Classe Base</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-amber-600" />
              <span className="text-slate-700 dark:text-slate-300">Classe Definida (≡)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-0.5 bg-slate-500" />
              <span className="text-slate-700 dark:text-slate-300">subClassOf</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-0.5 border-t-2 border-dashed border-amber-600" />
              <span className="text-slate-700 dark:text-slate-300">subClassOf (inferida ⊓)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-0.5 bg-indigo-500" />
              <span className="text-slate-700 dark:text-slate-300">Object Property</span>
            </div>
          </div>
        </div>
      ) : (
        /* Accessible List Representation (RNF-05 - WCAG AA) */
        <div className="p-4 overflow-y-auto max-h-[550px] flex-1">
          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl text-xs text-blue-800 dark:text-blue-300 flex items-center gap-2">
            <Info className="w-4 h-4 shrink-0 text-blue-600" />
            <span>
              <strong>Alternativa acessível ao grafo:</strong> Apresenta todos os relacionamentos conceituais, hierarquias de herança e propriedades de objeto em formato tabular legível por teclado e leitor de tela.
            </span>
          </div>

          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/60 font-semibold text-slate-700 dark:text-slate-200">
                <th className="py-2.5 px-3">Classe</th>
                <th className="py-2.5 px-3">Superclasses (subClassOf)</th>
                <th className="py-2.5 px-3">Subclasses Diretas</th>
                <th className="py-2.5 px-3">Propriedades de Saída (Domínio)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {Object.values(model.classes).map(cls => {
                const outProps = Object.values(model.properties).filter(
                  p => p.type === 'object' && p.domains.includes(cls.iri)
                );

                return (
                  <tr key={cls.iri} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-2.5 px-3 font-semibold text-primary-600 dark:text-primary-400">
                      <button type="button" onClick={() => onSelectClass(cls.iri)} className="hover:underline">
                        {cls.label}
                      </button>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">
                      {cls.superClasses.map(s => model.classes[s]?.label || s.split('#').pop()).join(', ') || '-'}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">
                      {cls.subClasses.map(sub => model.classes[sub]?.label || sub.split('#').pop()).join(', ') || '-'}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">
                      {outProps.map(p => p.label).join(', ') || '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
