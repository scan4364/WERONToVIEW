import { DiffResult, OntologyModel } from '../types/ontology';

const RDF_TYPE = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type';

export function computeOntologyDiff(
  baseModel: OntologyModel,
  inferredModel: OntologyModel,
  baseFilename = 'Arquivo A (Antes)',
  inferredFilename = 'Arquivo B (Depois)'
): DiffResult {
  // Create a fast lookup set of base triples: subject|predicate|object
  const baseTripleSet = new Set<string>();
  baseModel.rawTriples.forEach(t => {
    baseTripleSet.add(`${t.subject}|${t.predicate}|${t.object}`);
  });

  const newAssertions: DiffResult['newAssertions'] = [];
  const newTypes: DiffResult['newTypes'] = [];
  const newAxioms: DiffResult['newAxioms'] = [];
  const statsByProperty: Record<string, { label: string; count: number }> = {};

  inferredModel.rawTriples.forEach(t => {
    const key = `${t.subject}|${t.predicate}|${t.object}`;
    if (!baseTripleSet.has(key)) {
      if (t.predicate === RDF_TYPE) {
        // Individual classification
        const ind = inferredModel.individuals[t.subject];
        const cls = inferredModel.classes[t.object];
        if (ind && cls) {
          newTypes.push({
            individualIri: t.subject,
            individualLabel: ind.label,
            classIri: t.object,
            classLabel: cls.label
          });
        } else {
          newAxioms.push(t);
        }
      } else {
        const prop = inferredModel.properties[t.predicate];
        if (prop) {
          const sLabel = inferredModel.individuals[t.subject]?.label || t.subject.split('#').pop() || t.subject;
          const oLabel = t.objectType === 'literal' ? t.object : (inferredModel.individuals[t.object]?.label || t.object.split('#').pop() || t.object);

          newAssertions.push({
            subjectIri: t.subject,
            subjectLabel: sLabel,
            propertyIri: t.predicate,
            propertyLabel: prop.label,
            object: t.object,
            objectLabel: oLabel,
            isLiteral: t.objectType === 'literal'
          });

          if (!statsByProperty[t.predicate]) {
            statsByProperty[t.predicate] = {
              label: prop.label,
              count: 0
            };
          }
          statsByProperty[t.predicate].count++;
        } else {
          newAxioms.push(t);
        }
      }
    }
  });

  return {
    hasDiff: newAssertions.length > 0 || newTypes.length > 0 || newAxioms.length > 0,
    baseFile: baseFilename,
    comparedFile: inferredFilename,
    newAssertions,
    newTypes,
    newAxioms,
    statsByProperty,
    totalNewAssertions: newAssertions.length,
    totalNewTypes: newTypes.length,
    totalNewTriples: newAssertions.length + newTypes.length + newAxioms.length
  };
}
