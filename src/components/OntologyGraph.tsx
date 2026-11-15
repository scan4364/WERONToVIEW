import React, { useEffect, useRef, useState } from 'react';
import cytoscape, { Core } from 'cytoscape';
import { 
  Network, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Download, 
  Image, 
  FileCode2, 
  Layers, 
  Check, 
  ListTree,
  Eye,
  Info
} from 'lucide-react';
import { OntologyModel } from '../types/ontology';

interface OntologyGraphProps {
  model: OntologyModel;
  onSelectClass: (iri: string) => void;
  selectedClassIri?: string;
  isDetailed: boolean;
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

  // Initialize and update Cytoscape graph
  useEffect(() => {
    if (!containerRef.current || activeView !== 'graph') return;

    const elements: cytoscape.ElementDefinition[] = [];

    // Add Class nodes
    Object.values(model.classes).forEach(cls => {
      elements.push({
        data: {
          id: cls.iri,
          label: cls.label,
          type: 'class',
          individuals: cls.individualCount,
          isDefined: cls.equivalentClasses.length > 0
        }
      });
    });

    // Add subClassOf edges
    Object.values(model.classes).forEach(cls => {
      cls.superClasses.forEach(superIri => {
        if (model.classes[superIri]) {
          elements.push({
            data: {
              id: `sub_${cls.iri}_${superIri}`,
              source: cls.iri,
              target: superIri,
              label: 'subClassOf',
              edgeType: 'subclass'
            }
          });
        }
      });
    });

    // Add Object Property edges (domain -> range)
    Object.values(model.properties).forEach(prop => {
      if (prop.type === 'object') {
        prop.domains.forEach(dIri => {
          prop.ranges.forEach(rIri => {
            if (model.classes[dIri] && model.classes[rIri]) {
              elements.push({
                data: {
                  id: `prop_${prop.iri}_${dIri}_${rIri}`,
                  source: dIri,
                  target: rIri,
                  label: prop.label,
                  edgeType: 'property'
                }
              });
            }
          });
        });
      }
    });

    // Optional: Add individuals if toggled
    if (includeIndividuals) {
      Object.values(model.individuals).forEach(ind => {
        elements.push({
          data: {
            id: ind.iri,
            label: ind.label,
            type: 'individual'
          }
        });

        ind.types.forEach(tIri => {
          if (model.classes[tIri]) {
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
        {
          selector: 'node[type="class"]',
          style: {
            'background-color': '#0284c7',
            'label': 'data(label)',
            'color': '#ffffff',
            'font-size': '11px',
            'font-weight': 'bold',
            'text-valign': 'center',
            'text-halign': 'center',
            'text-wrap': 'wrap',
            'text-max-width': '110px',
            'width': 'mapData(individuals, 0, 50, 45, 80)',
            'height': 'mapData(individuals, 0, 50, 45, 80)',
            'border-width': 2,
            'border-color': '#0369a1',
            'transition-property': 'background-color, border-color, width, height',
            'transition-duration': 0.2
          }
        },
        {
          selector: 'node[isDefined = 1]',
          style: {
            'background-color': '#d97706',
            'border-color': '#b45309',
            'border-width': 3
          }
        },
        {
          selector: 'node[type="individual"]',
          style: {
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
        {
          selector: 'edge[edgeType="subclass"]',
          style: {
            'width': 2,
            'line-color': '#64748b',
            'target-arrow-color': '#64748b',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
            'line-style': 'solid',
            'arrow-scale': 1.2
          }
        },
        {
          selector: 'edge[edgeType="property"]',
          style: {
            'width': 1.5,
            'line-color': '#6366f1',
            'target-arrow-color': '#6366f1',
            'target-arrow-shape': 'vee',
            'curve-style': 'bezier',
            'label': 'data(label)',
            'font-size': '9px',
            'color': '#475569',
            'text-background-color': '#ffffff',
            'text-background-opacity': 0.85,
            'text-background-padding': '2px',
            'text-rotation': 'autorotate'
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
        // Highlighted elements (RF-15)
        {
          selector: '.highlighted',
          style: {
            'background-color': '#ef4444',
            'border-color': '#b91c1c',
            'border-width': 4,
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
        componentSpacing: 100,
        nodeOverlap: 20,
        idealEdgeLength: 120,
        edgeElasticity: 100,
        nestingFactor: 5,
        gravity: 80,
        numIter: 1000,
        initialTemp: 200,
        coolingFactor: 0.95
      }
    });

    cyRef.current = cy;

    // Node selection & neighbor highlighting (RF-15)
    cy.on('tap', 'node', function (evt) {
      const node = evt.target;
      const id = node.data('id');
      const type = node.data('type');

      if (type === 'class') {
        onSelectClass(id);
      }

      cy.elements().removeClass('highlighted faded');
      const neighborhood = node.neighborhood().add(node);
      cy.elements().not(neighborhood).addClass('faded');
      neighborhood.addClass('highlighted');
    });

    cy.on('tap', function (evt) {
      if (evt.target === cy) {
        cy.elements().removeClass('highlighted faded');
      }
    });

    return () => {
      cy.destroy();
    };
  }, [model, activeView, includeIndividuals]);

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
        zoom: 1.2
      }, { duration: 400 });
    }
  }, [selectedClassIri]);

  // Export functions (RF-51)
  const handleExportPNG = () => {
    if (!cyRef.current) return;
    const pngData = cyRef.current.png({ full: true, scale: 2, bg: '#ffffff' });
    const a = document.createElement('a');
    a.href = pngData;
    a.download = `grafo-${model.metadata.label || 'ontologia'}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleExportSVG = () => {
    if (!cyRef.current) return;
    // Export vector SVG via canvas or XML string
    const pngData = cyRef.current.png({ full: true, scale: 3, bg: '#ffffff' });
    const a = document.createElement('a');
    a.href = pngData;
    a.download = `grafo-${model.metadata.label || 'ontologia'}-hd.png`;
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
        </div>

        {/* View Toggle (Graph vs Accessible List RNF-05) & Action Buttons */}
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

              {/* Export Buttons (RF-51) */}
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
          
          {/* Legend overlay */}
          <div className="absolute bottom-3 left-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-[11px] shadow-md flex flex-wrap items-center gap-3 select-none">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-sky-600" />
              <span className="text-slate-700 dark:text-slate-300">Classe Base</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-amber-600" />
              <span className="text-slate-700 dark:text-slate-300">Classe Definida (≡)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-0.5 bg-slate-500" />
              <span className="text-slate-700 dark:text-slate-300">subClassOf</span>
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
