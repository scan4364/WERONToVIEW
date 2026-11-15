import { RDFTriple } from '../types/ontology';

const RDF_NS = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#';
const RDF_TYPE = `${RDF_NS}type`;
const RDF_FIRST = `${RDF_NS}first`;
const RDF_REST = `${RDF_NS}rest`;
const RDF_NIL = `${RDF_NS}nil`;

let bnodeCounter = 0;
function generateBnodeId(): string {
  bnodeCounter++;
  return `_:bnode_${bnodeCounter}_${Date.now()}`;
}

export function parseRdfXml(xmlText: string): Promise<{ triples: RDFTriple[]; prefixes: Record<string, string>; error?: string }> {
  return new Promise((resolve) => {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(xmlText, 'application/xml');

      const parserError = doc.querySelector('parsererror');
      if (parserError) {
        resolve({
          triples: [],
          prefixes: {},
          error: `Erro de sintaxe no arquivo RDF/XML: ${parserError.textContent?.slice(0, 200)}`
        });
        return;
      }

      const triples: RDFTriple[] = [];
      const prefixes: Record<string, string> = {};

      const root = doc.documentElement;
      for (let i = 0; i < root.attributes.length; i++) {
        const attr = root.attributes[i];
        if (attr.name.startsWith('xmlns:')) {
          prefixes[attr.name.replace('xmlns:', '')] = attr.value;
        } else if (attr.name === 'xmlns') {
          prefixes[''] = attr.value;
        }
      }

      const getAttribute = (el: Element, localName: string, ns?: string): string | null => {
        if (ns) {
          const val = el.getAttributeNS(ns, localName);
          if (val) return val;
        }
        return el.getAttribute(`rdf:${localName}`) || el.getAttribute(localName);
      };

      const parseNode = (el: Element, parentBnode?: string): string => {
        let subjectIri = getAttribute(el, 'about', RDF_NS) || getAttribute(el, 'nodeID', RDF_NS);
        if (!subjectIri) {
          subjectIri = parentBnode || generateBnodeId();
        }

        // Check node type from element tag name if not rdf:Description
        const nodeUri = el.namespaceURI ? `${el.namespaceURI}${el.localName}` : el.tagName;
        if (nodeUri !== `${RDF_NS}Description` && nodeUri !== 'rdf:Description') {
          triples.push({
            subject: subjectIri,
            predicate: RDF_TYPE,
            object: nodeUri,
            objectType: 'iri'
          });
        }

        // Iterate child elements (properties)
        const childElements = Array.from(el.children);
        for (const propEl of childElements) {
          const propUri = propEl.namespaceURI ? `${propEl.namespaceURI}${propEl.localName}` : propEl.tagName;
          const resourceVal = getAttribute(propEl, 'resource', RDF_NS);
          const nodeIDVal = getAttribute(propEl, 'nodeID', RDF_NS);
          const parseType = getAttribute(propEl, 'parseType', RDF_NS);
          const datatype = getAttribute(propEl, 'datatype', RDF_NS);
          const lang = propEl.getAttribute('xml:lang') || propEl.getAttribute('lang') || undefined;

          if (parseType === 'Collection') {
            // rdf:first / rdf:rest chain
            const collectionItems = Array.from(propEl.children);
            if (collectionItems.length === 0) {
              triples.push({
                subject: subjectIri,
                predicate: propUri,
                object: RDF_NIL,
                objectType: 'iri'
              });
            } else {
              let prevHead = '';
              const firstHead = generateBnodeId();
              let currentHead = firstHead;

              for (let c = 0; c < collectionItems.length; c++) {
                const itemEl = collectionItems[c];
                const itemIri = parseNode(itemEl);

                triples.push({
                  subject: currentHead,
                  predicate: RDF_FIRST,
                  object: itemIri,
                  objectType: itemIri.startsWith('_:') ? 'bnode' : 'iri'
                });

                if (c < collectionItems.length - 1) {
                  const nextHead = generateBnodeId();
                  triples.push({
                    subject: currentHead,
                    predicate: RDF_REST,
                    object: nextHead,
                    objectType: 'bnode'
                  });
                  currentHead = nextHead;
                } else {
                  triples.push({
                    subject: currentHead,
                    predicate: RDF_REST,
                    object: RDF_NIL,
                    objectType: 'iri'
                  });
                }
              }

              triples.push({
                subject: subjectIri,
                predicate: propUri,
                object: firstHead,
                objectType: 'bnode'
              });
            }
          } else if (resourceVal) {
            triples.push({
              subject: subjectIri,
              predicate: propUri,
              object: resourceVal,
              objectType: 'iri'
            });
          } else if (nodeIDVal) {
            triples.push({
              subject: subjectIri,
              predicate: propUri,
              object: `_:${nodeIDVal}`,
              objectType: 'bnode'
            });
          } else if (propEl.children.length > 0) {
            // Nested blank node or typed node
            const nestedNode = propEl.children[0];
            const nestedIri = parseNode(nestedNode);
            triples.push({
              subject: subjectIri,
              predicate: propUri,
              object: nestedIri,
              objectType: nestedIri.startsWith('_:') ? 'bnode' : 'iri'
            });
          } else {
            // Literal
            triples.push({
              subject: subjectIri,
              predicate: propUri,
              object: propEl.textContent || '',
              objectType: 'literal',
              datatype: datatype || undefined,
              lang: lang
            });
          }
        }

        return subjectIri;
      };

      // Direct children of <rdf:RDF>
      const topElements = Array.from(root.children);
      topElements.forEach(topEl => {
        parseNode(topEl);
      });

      resolve({ triples, prefixes });
    } catch (err: any) {
      resolve({
        triples: [],
        prefixes: {},
        error: `Falha ao interpretar RDF/XML: ${err.message || String(err)}`
      });
    }
  });
}
