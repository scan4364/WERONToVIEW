import {
  AllDifferentGroup,
  ClassExpression,
  IndividualDataAssertion,
  IndividualPropertyAssertion,
  OntologyClass,
  OntologyIndividual,
  OntologyMetadata,
  OntologyMetrics,
  OntologyModel,
  OntologyProperty,
  RDFTriple,
  RestrictionExpr,
  SWRLAtom,
  SWRLRule
} from '../types/ontology';
import { formatRestrictionToPortuguese, formatRestrictionToDL, formatPropertyChain } from '../utils/dlFormatter';
import { formatRuleLogic, formatRulePortuguese, extractRuleEntities } from '../utils/swrlFormatter';

const RDF_TYPE = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type';
const RDF_FIRST = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#first';
const RDF_REST = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#rest';
const RDF_NIL = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#nil';

const RDFS_LABEL = 'http://www.w3.org/2000/01/rdf-schema#label';
const RDFS_COMMENT = 'http://www.w3.org/2000/01/rdf-schema#comment';
const RDFS_SUBCLASS_OF = 'http://www.w3.org/2000/01/rdf-schema#subClassOf';
const RDFS_DOMAIN = 'http://www.w3.org/2000/01/rdf-schema#domain';
const RDFS_RANGE = 'http://www.w3.org/2000/01/rdf-schema#range';

const OWL_ONTOLOGY = 'http://www.w3.org/2002/07/owl#Ontology';
const OWL_CLASS = 'http://www.w3.org/2002/07/owl#Class';
const OWL_OBJECT_PROPERTY = 'http://www.w3.org/2002/07/owl#ObjectProperty';
const OWL_DATATYPE_PROPERTY = 'http://www.w3.org/2002/07/owl#DatatypeProperty';
const OWL_ANNOTATION_PROPERTY = 'http://www.w3.org/2002/07/owl#AnnotationProperty';
const OWL_NAMED_INDIVIDUAL = 'http://www.w3.org/2002/07/owl#NamedIndividual';

const OWL_EQUIVALENT_CLASS = 'http://www.w3.org/2002/07/owl#equivalentClass';
const OWL_DISJOINT_WITH = 'http://www.w3.org/2002/07/owl#disjointWith';
const OWL_ALL_DISJOINT_CLASSES = 'http://www.w3.org/2002/07/owl#AllDisjointClasses';
const OWL_ALL_DIFFERENT = 'http://www.w3.org/2002/07/owl#AllDifferent';
const OWL_DIFFERENT_FROM = 'http://www.w3.org/2002/07/owl#differentFrom';
const OWL_MEMBERS = 'http://www.w3.org/2002/07/owl#members';
const OWL_DISTINCT_MEMBERS = 'http://www.w3.org/2002/07/owl#distinctMembers';

const OWL_RESTRICTION = 'http://www.w3.org/2002/07/owl#Restriction';
const OWL_ON_PROPERTY = 'http://www.w3.org/2002/07/owl#onProperty';
const OWL_SOME_VALUES_FROM = 'http://www.w3.org/2002/07/owl#someValuesFrom';
const OWL_ALL_VALUES_FROM = 'http://www.w3.org/2002/07/owl#allValuesFrom';
const OWL_HAS_VALUE = 'http://www.w3.org/2002/07/owl#hasValue';
const OWL_MIN_CARDINALITY = 'http://www.w3.org/2002/07/owl#minCardinality';
const OWL_MAX_CARDINALITY = 'http://www.w3.org/2002/07/owl#maxCardinality';
const OWL_CARDINALITY = 'http://www.w3.org/2002/07/owl#cardinality';
const OWL_MIN_QUALIFIED_CARDINALITY = 'http://www.w3.org/2002/07/owl#minQualifiedCardinality';
const OWL_MAX_QUALIFIED_CARDINALITY = 'http://www.w3.org/2002/07/owl#maxQualifiedCardinality';
const OWL_QUALIFIED_CARDINALITY = 'http://www.w3.org/2002/07/owl#qualifiedCardinality';
const OWL_ON_CLASS = 'http://www.w3.org/2002/07/owl#onClass';
const OWL_INTERSECTION_OF = 'http://www.w3.org/2002/07/owl#intersectionOf';
const OWL_UNION_OF = 'http://www.w3.org/2002/07/owl#unionOf';
const OWL_COMPLEMENT_OF = 'http://www.w3.org/2002/07/owl#complementOf';
const OWL_INVERSE_OF = 'http://www.w3.org/2002/07/owl#inverseOf';
const OWL_PROPERTY_CHAIN_AXIOM = 'http://www.w3.org/2002/07/owl#propertyChainAxiom';

const OWL_FUNCTIONAL = 'http://www.w3.org/2002/07/owl#FunctionalProperty';
const OWL_INVERSE_FUNCTIONAL = 'http://www.w3.org/2002/07/owl#InverseFunctionalProperty';
const OWL_TRANSITIVE = 'http://www.w3.org/2002/07/owl#TransitiveProperty';
const OWL_SYMMETRIC = 'http://www.w3.org/2002/07/owl#SymmetricProperty';
const OWL_ASYMMETRIC = 'http://www.w3.org/2002/07/owl#AsymmetricProperty';
const OWL_REFLEXIVE = 'http://www.w3.org/2002/07/owl#ReflexiveProperty';
const OWL_IRREFLEXIVE = 'http://www.w3.org/2002/07/owl#IrreflexiveProperty';

const SWRL_IMP = 'http://www.w3.org/2003/11/swrl#Imp';
const SWRL_BODY = 'http://www.w3.org/2003/11/swrl#body';
const SWRL_HEAD = 'http://www.w3.org/2003/11/swrl#head';
const SWRL_CLASS_ATOM = 'http://www.w3.org/2003/11/swrl#ClassAtom';
const SWRL_INDIVIDUAL_PROPERTY_ATOM = 'http://www.w3.org/2003/11/swrl#IndividualPropertyAtom';
const SWRL_DATAVALUED_PROPERTY_ATOM = 'http://www.w3.org/2003/11/swrl#DatavaluedPropertyAtom';
const SWRL_DIFFERENT_INDIVIDUALS_ATOM = 'http://www.w3.org/2003/11/swrl#DifferentIndividualsAtom';
const SWRL_SAME_INDIVIDUAL_ATOM = 'http://www.w3.org/2003/11/swrl#SameIndividualAtom';
const SWRL_BUILTIN_ATOM = 'http://www.w3.org/2003/11/swrl#BuiltinAtom';
const SWRL_CLASS_PREDICATE = 'http://www.w3.org/2003/11/swrl#classPredicate';
const SWRL_PROPERTY_PREDICATE = 'http://www.w3.org/2003/11/swrl#propertyPredicate';
const SWRL_ARGUMENT1 = 'http://www.w3.org/2003/11/swrl#argument1';
const SWRL_ARGUMENT2 = 'http://www.w3.org/2003/11/swrl#argument2';
const SWRL_BUILTIN = 'http://www.w3.org/2003/11/swrl#builtin';
const SWRL_ARGUMENTS = 'http://www.w3.org/2003/11/swrl#arguments';

export function getLocalName(iri: string): string {
  if (!iri) return '';
  if (iri.includes('#')) {
    return iri.split('#').pop() || iri;
  }
  const parts = iri.split('/');
  return parts.pop() || iri;
}

export function extractOntologyModel(triples: RDFTriple[], prefixes: Record<string, string> = {}): OntologyModel {
  // Maps for fast indexing
  const spo = new Map<string, Map<string, RDFTriple[]>>();
  const pos = new Map<string, Map<string, RDFTriple[]>>();

  const addTriple = (t: RDFTriple) => {
    if (!spo.has(t.subject)) spo.set(t.subject, new Map());
    const sMap = spo.get(t.subject)!;
    if (!sMap.has(t.predicate)) sMap.set(t.predicate, []);
    sMap.get(t.predicate)!.push(t);

    const poKey = `${t.predicate}|${t.object}`;
    if (!pos.has(poKey)) pos.set(poKey, new Map());
  };

  triples.forEach(addTriple);

  const getTriples = (s: string, p?: string): RDFTriple[] => {
    const sMap = spo.get(s);
    if (!sMap) return [];
    if (p) return sMap.get(p) || [];
    const res: RDFTriple[] = [];
    sMap.forEach(list => res.push(...list));
    return res;
  };

  const getObjects = (s: string, p: string): string[] => {
    return getTriples(s, p).map(t => t.object);
  };

  const getFirstObject = (s: string, p: string): string | undefined => {
    const objs = getObjects(s, p);
    return objs[0];
  };

  // Helper: resolve rdf:List
  const resolveRdfList = (headNode: string): string[] => {
    const items: string[] = [];
    let current = headNode;
    const visited = new Set<string>();

    while (current && current !== RDF_NIL && !visited.has(current)) {
      visited.add(current);
      const first = getFirstObject(current, RDF_FIRST);
      if (first !== undefined) {
        items.push(first);
      }
      const rest = getFirstObject(current, RDF_REST);
      if (!rest || rest === RDF_NIL) break;
      current = rest;
    }
    return items;
  };

  // Label finder with PT-BR preference (RF-13)
  const getPreferredLabel = (iri: string): string => {
    const labelTriples = getTriples(iri, RDFS_LABEL);
    if (labelTriples.length > 0) {
      // Find pt or pt-BR
      const ptLabel = labelTriples.find(t => t.lang === 'pt' || t.lang === 'pt-br' || t.lang === 'pt-BR');
      if (ptLabel) return ptLabel.object;
      const noLang = labelTriples.find(t => !t.lang);
      if (noLang) return noLang.object;
      return labelTriples[0].object;
    }
    return getLocalName(iri);
  };

  const getComment = (iri: string): string | undefined => {
    const commentTriples = getTriples(iri, RDFS_COMMENT);
    if (commentTriples.length > 0) {
      const ptComment = commentTriples.find(t => t.lang === 'pt' || t.lang === 'pt-br' || t.lang === 'pt-BR');
      if (ptComment) return ptComment.object;
      return commentTriples[0].object;
    }
    return undefined;
  };

  // Helper: parse restriction
  const parseRestrictionNode = (nodeIri: string): RestrictionExpr | undefined => {
    const prop = getFirstObject(nodeIri, OWL_ON_PROPERTY);
    if (!prop) return undefined;

    const propLabel = getPreferredLabel(prop);
    const someVal = getFirstObject(nodeIri, OWL_SOME_VALUES_FROM);
    const allVal = getFirstObject(nodeIri, OWL_ALL_VALUES_FROM);
    const hasVal = getFirstObject(nodeIri, OWL_HAS_VALUE);
    const minCard = getFirstObject(nodeIri, OWL_MIN_CARDINALITY);
    const maxCard = getFirstObject(nodeIri, OWL_MAX_CARDINALITY);
    const card = getFirstObject(nodeIri, OWL_CARDINALITY);
    const minQCard = getFirstObject(nodeIri, OWL_MIN_QUALIFIED_CARDINALITY);
    const maxQCard = getFirstObject(nodeIri, OWL_MAX_QUALIFIED_CARDINALITY);
    const qCard = getFirstObject(nodeIri, OWL_QUALIFIED_CARDINALITY);
    const onClass = getFirstObject(nodeIri, OWL_ON_CLASS);

    let restr: RestrictionExpr | undefined;

    if (someVal) {
      restr = {
        type: 'some',
        propertyIri: prop,
        propertyLabel: propLabel,
        fillerIri: someVal,
        fillerLabel: getPreferredLabel(someVal)
      };
    } else if (allVal) {
      restr = {
        type: 'all',
        propertyIri: prop,
        propertyLabel: propLabel,
        fillerIri: allVal,
        fillerLabel: getPreferredLabel(allVal)
      };
    } else if (hasVal) {
      restr = {
        type: 'value',
        propertyIri: prop,
        propertyLabel: propLabel,
        value: getPreferredLabel(hasVal),
        fillerIri: hasVal,
        fillerLabel: getPreferredLabel(hasVal)
      };
    } else if (minQCard !== undefined) {
      restr = {
        type: 'minQualified',
        propertyIri: prop,
        propertyLabel: propLabel,
        cardinality: parseInt(minQCard, 10) || 0,
        fillerIri: onClass,
        fillerLabel: onClass ? getPreferredLabel(onClass) : undefined
      };
    } else if (maxQCard !== undefined) {
      restr = {
        type: 'maxQualified',
        propertyIri: prop,
        propertyLabel: propLabel,
        cardinality: parseInt(maxQCard, 10) || 0,
        fillerIri: onClass,
        fillerLabel: onClass ? getPreferredLabel(onClass) : undefined
      };
    } else if (qCard !== undefined) {
      restr = {
        type: 'qualified',
        propertyIri: prop,
        propertyLabel: propLabel,
        cardinality: parseInt(qCard, 10) || 0,
        fillerIri: onClass,
        fillerLabel: onClass ? getPreferredLabel(onClass) : undefined
      };
    } else if (minCard !== undefined) {
      restr = {
        type: 'min',
        propertyIri: prop,
        propertyLabel: propLabel,
        cardinality: parseInt(minCard, 10) || 0,
        fillerIri: onClass,
        fillerLabel: onClass ? getPreferredLabel(onClass) : undefined
      };
    } else if (maxCard !== undefined) {
      restr = {
        type: 'max',
        propertyIri: prop,
        propertyLabel: propLabel,
        cardinality: parseInt(maxCard, 10) || 0,
        fillerIri: onClass,
        fillerLabel: onClass ? getPreferredLabel(onClass) : undefined
      };
    } else if (card !== undefined) {
      restr = {
        type: 'exact',
        propertyIri: prop,
        propertyLabel: propLabel,
        cardinality: parseInt(card, 10) || 0,
        fillerIri: onClass,
        fillerLabel: onClass ? getPreferredLabel(onClass) : undefined
      };
    }

    if (restr) {
      restr.rawManchester = formatRestrictionToPortuguese(restr);
      restr.rawDl = formatRestrictionToDL(restr);
    }
    return restr;
  };

  // Helper: parse ClassExpression
  const parseClassExpression = (nodeIri: string, depth = 0): ClassExpression => {
    if (depth > 10) return { type: 'named', classIri: nodeIri, classLabel: getPreferredLabel(nodeIri) };

    const types = getObjects(nodeIri, RDF_TYPE);
    if (types.includes(OWL_RESTRICTION)) {
      const restr = parseRestrictionNode(nodeIri);
      if (restr) {
        return { type: 'restriction', restriction: restr };
      }
    }

    const interNode = getFirstObject(nodeIri, OWL_INTERSECTION_OF);
    if (interNode) {
      const items = resolveRdfList(interNode);
      return {
        type: 'intersection',
        operands: items.map(item => parseClassExpression(item, depth + 1))
      };
    }

    const unionNode = getFirstObject(nodeIri, OWL_UNION_OF);
    if (unionNode) {
      const items = resolveRdfList(unionNode);
      return {
        type: 'union',
        operands: items.map(item => parseClassExpression(item, depth + 1))
      };
    }

    const compNode = getFirstObject(nodeIri, OWL_COMPLEMENT_OF);
    if (compNode) {
      return {
        type: 'complement',
        operands: [parseClassExpression(compNode, depth + 1)]
      };
    }

    // Default: named class
    return {
      type: 'named',
      classIri: nodeIri,
      classLabel: getPreferredLabel(nodeIri)
    };
  };

  // Find ontology metadata
  let ontologyIri = '';
  triples.forEach(t => {
    if (t.predicate === RDF_TYPE && t.object === OWL_ONTOLOGY) {
      ontologyIri = t.subject;
    }
  });
  if (!ontologyIri) {
    // Fallback: search common base or first named subject
    ontologyIri = Object.values(prefixes)[0] || 'http://exemplo.org/ontologia';
  }

  const metadata: OntologyMetadata = {
    iri: ontologyIri,
    label: getPreferredLabel(ontologyIri) || 'Ontologia sem Título',
    comment: getComment(ontologyIri)
  };

  // Collect classes
  const classes: Record<string, OntologyClass> = {};
  const isClassNode = (iri: string) => {
    const types = getObjects(iri, RDF_TYPE);
    return types.includes(OWL_CLASS) || types.includes('http://www.w3.org/2000/01/rdf-schema#Class');
  };

  // Scan all subjects for classes
  spo.forEach((_, subj) => {
    if (isClassNode(subj) && !subj.startsWith('_:') && !subj.startsWith('genid') && !subj.startsWith('urn:swrl')) {
      classes[subj] = {
        iri: subj,
        label: getPreferredLabel(subj),
        comment: getComment(subj),
        superClasses: [],
        subClasses: [],
        equivalentClasses: [],
        restrictions: [],
        disjointWith: [],
        individuals: [],
        individualCount: 0,
        rawTriples: getTriples(subj)
      };
    }
  });

  // Collect properties
  const properties: Record<string, OntologyProperty> = {};
  spo.forEach((_, subj) => {
    const types = getObjects(subj, RDF_TYPE);
    const isObjProp = types.includes(OWL_OBJECT_PROPERTY) || types.includes(OWL_TRANSITIVE) || types.includes(OWL_SYMMETRIC);
    const isDataProp = types.includes(OWL_DATATYPE_PROPERTY);
    const isAnnotProp = types.includes(OWL_ANNOTATION_PROPERTY);

    if ((isObjProp || isDataProp || isAnnotProp) && !subj.startsWith('_:')) {
      const rawDomain = getObjects(subj, RDFS_DOMAIN);
      const rawRange = getObjects(subj, RDFS_RANGE);

      const namedDomains = rawDomain.filter(d => !d.startsWith('_:'));
      const namedRanges = rawRange.filter(r => !r.startsWith('_:'));

      const domainExprs = rawDomain.filter(d => d.startsWith('_:')).map(d => parseClassExpression(d));
      const rangeExprs = rawRange.filter(r => r.startsWith('_:')).map(r => parseClassExpression(r));

      const inv = getFirstObject(subj, OWL_INVERSE_OF);
      const chainNode = getFirstObject(subj, OWL_PROPERTY_CHAIN_AXIOM);
      let propChain: string[] | undefined;
      let propChainLabels: string[] | undefined;

      if (chainNode) {
        propChain = resolveRdfList(chainNode);
        propChainLabels = propChain.map(p => getPreferredLabel(p));
      }

      properties[subj] = {
        iri: subj,
        label: getPreferredLabel(subj),
        comment: getComment(subj),
        type: isObjProp ? 'object' : (isDataProp ? 'datatype' : 'annotation'),
        domains: namedDomains,
        domainExpressions: domainExprs,
        ranges: namedRanges,
        rangeExpressions: rangeExprs,
        isFunctional: types.includes(OWL_FUNCTIONAL),
        isInverseFunctional: types.includes(OWL_INVERSE_FUNCTIONAL),
        isTransitive: types.includes(OWL_TRANSITIVE),
        isSymmetric: types.includes(OWL_SYMMETRIC),
        isAsymmetric: types.includes(OWL_ASYMMETRIC),
        isReflexive: types.includes(OWL_REFLEXIVE),
        isIrreflexive: types.includes(OWL_IRREFLEXIVE),
        inverseOf: inv,
        inverseOfLabel: inv ? getPreferredLabel(inv) : undefined,
        propertyChain: propChain,
        propertyChainLabels: propChainLabels,
        rawTriples: getTriples(subj)
      };
    }
  });

  // Populate Class Superclasses, Subclasses, Equivalences, Restrictions
  Object.keys(classes).forEach(classIri => {
    const cls = classes[classIri];

    // subClassOf
    const superNodes = getObjects(classIri, RDFS_SUBCLASS_OF);
    superNodes.forEach(sNode => {
      if (classes[sNode]) {
        cls.superClasses.push(sNode);
        if (!classes[sNode].subClasses.includes(classIri)) {
          classes[sNode].subClasses.push(classIri);
        }
      } else {
        // May be restriction or complex expression
        const expr = parseClassExpression(sNode);
        if (expr.type === 'restriction' && expr.restriction) {
          cls.restrictions.push(expr.restriction);
        } else if (expr.type === 'intersection') {
          // If intersection contains restrictions, extract them
          expr.operands?.forEach(op => {
            if (op.type === 'restriction' && op.restriction) {
              cls.restrictions.push(op.restriction);
            }
          });
        }
      }
    });

    // equivalentClass
    const equivNodes = getObjects(classIri, OWL_EQUIVALENT_CLASS);
    equivNodes.forEach(eNode => {
      const expr = parseClassExpression(eNode);
      cls.equivalentClasses.push(expr);
      if (expr.type === 'restriction' && expr.restriction) {
        cls.restrictions.push(expr.restriction);
      } else if (expr.type === 'intersection') {
        expr.operands?.forEach(op => {
          if (op.type === 'restriction' && op.restriction) {
            cls.restrictions.push(op.restriction);
          }
        });
      }
    });

    // disjointWith
    const disjointNodes = getObjects(classIri, OWL_DISJOINT_WITH);
    cls.disjointWith.push(...disjointNodes);
  });

  // Parse SWRL rules
  const swrlRules: SWRLRule[] = [];
  spo.forEach((_, subj) => {
    const types = getObjects(subj, RDF_TYPE);
    if (types.includes(SWRL_IMP)) {
      const ruleLabel = getPreferredLabel(subj);
      const ruleComment = getComment(subj);
      const bodyNode = getFirstObject(subj, SWRL_BODY);
      const headNode = getFirstObject(subj, SWRL_HEAD);

      const parseAtom = (atomNode: string): SWRLAtom | undefined => {
        const aTypes = getObjects(atomNode, RDF_TYPE);
        if (aTypes.includes(SWRL_CLASS_ATOM)) {
          const pred = getFirstObject(atomNode, SWRL_CLASS_PREDICATE);
          const arg1 = getFirstObject(atomNode, SWRL_ARGUMENT1);
          return {
            type: 'class',
            predicate: pred,
            predicateLabel: pred ? getPreferredLabel(pred) : '',
            args: arg1 ? [arg1] : []
          };
        }
        if (aTypes.includes(SWRL_INDIVIDUAL_PROPERTY_ATOM)) {
          const pred = getFirstObject(atomNode, SWRL_PROPERTY_PREDICATE);
          const arg1 = getFirstObject(atomNode, SWRL_ARGUMENT1);
          const arg2 = getFirstObject(atomNode, SWRL_ARGUMENT2);
          return {
            type: 'individualProperty',
            predicate: pred,
            predicateLabel: pred ? getPreferredLabel(pred) : '',
            args: [arg1 || '', arg2 || '']
          };
        }
        if (aTypes.includes(SWRL_DATAVALUED_PROPERTY_ATOM)) {
          const pred = getFirstObject(atomNode, SWRL_PROPERTY_PREDICATE);
          const arg1 = getFirstObject(atomNode, SWRL_ARGUMENT1);
          const arg2 = getFirstObject(atomNode, SWRL_ARGUMENT2);
          return {
            type: 'datavaluedProperty',
            predicate: pred,
            predicateLabel: pred ? getPreferredLabel(pred) : '',
            args: [arg1 || '', arg2 || '']
          };
        }
        if (aTypes.includes(SWRL_DIFFERENT_INDIVIDUALS_ATOM)) {
          const arg1 = getFirstObject(atomNode, SWRL_ARGUMENT1);
          const arg2 = getFirstObject(atomNode, SWRL_ARGUMENT2);
          return {
            type: 'differentIndividuals',
            args: [arg1 || '', arg2 || '']
          };
        }
        if (aTypes.includes(SWRL_BUILTIN_ATOM)) {
          const builtin = getFirstObject(atomNode, SWRL_BUILTIN);
          const argsNode = getFirstObject(atomNode, SWRL_ARGUMENTS);
          const argList = argsNode ? resolveRdfList(argsNode) : [];
          return {
            type: 'builtin',
            builtin: builtin,
            args: argList
          };
        }
        return undefined;
      };

      const bodyList = bodyNode ? resolveRdfList(bodyNode) : [];
      const headList = headNode ? resolveRdfList(headNode) : [];

      const bodyAtoms: SWRLAtom[] = bodyList.map(parseAtom).filter((a): a is SWRLAtom => a !== undefined);
      const headAtoms: SWRLAtom[] = headList.map(parseAtom).filter((a): a is SWRLAtom => a !== undefined);

      const rule: SWRLRule = {
        id: subj,
        label: ruleLabel || 'Regra SWRL',
        comment: ruleComment,
        body: bodyAtoms,
        head: headAtoms,
        readablePortuguese: formatRulePortuguese(bodyAtoms, headAtoms),
        readableLogic: formatRuleLogic(bodyAtoms, headAtoms),
        usedClasses: [],
        usedProperties: [],
        rawTriples: getTriples(subj)
      };

      const entities = extractRuleEntities(rule);
      rule.usedClasses = entities.classes;
      rule.usedProperties = entities.properties;

      swrlRules.push(rule);
    }
  });

  // AllDifferent and differentFrom axioms (RF-32)
  const allDifferentGroups: AllDifferentGroup[] = [];
  let differentFromPairsCount = 0;

  spo.forEach((_, subj) => {
    const types = getObjects(subj, RDF_TYPE);
    if (types.includes(OWL_ALL_DIFFERENT) || types.includes(OWL_ALL_DISJOINT_CLASSES)) {
      const membersNode = getFirstObject(subj, OWL_MEMBERS) || getFirstObject(subj, OWL_DISTINCT_MEMBERS);
      if (membersNode) {
        const members = resolveRdfList(membersNode);
        allDifferentGroups.push({
          id: subj,
          members: members,
          memberLabels: members.map(m => getPreferredLabel(m))
        });
      }
    }
  });

  // Collect Individuals
  const individuals: Record<string, OntologyIndividual> = {};
  spo.forEach((sMap, subj) => {
    if (subj.startsWith('_:') || subj.startsWith('genid') || subj.startsWith('urn:swrl')) return;
    if (classes[subj] || properties[subj] || subj === ontologyIri) return;

    const types = getObjects(subj, RDF_TYPE);
    const isExplicitInd = types.includes(OWL_NAMED_INDIVIDUAL);
    const isTypedInd = types.some(t => classes[t] !== undefined);

    if (isExplicitInd || isTypedInd) {
      const indTypes = types.filter(t => t !== OWL_NAMED_INDIVIDUAL && !t.startsWith('_:'));
      const objAssertions: IndividualPropertyAssertion[] = [];
      const dataAssertions: IndividualDataAssertion[] = [];
      const diffFromList: string[] = [];

      sMap.forEach((tList, pred) => {
        if (pred === RDF_TYPE) return;
        if (pred === OWL_DIFFERENT_FROM) {
          tList.forEach(t => diffFromList.push(t.object));
          return;
        }

        const propDef = properties[pred];
        const pLabel = propDef ? propDef.label : getPreferredLabel(pred);

        tList.forEach(t => {
          if (t.objectType === 'literal') {
            dataAssertions.push({
              propertyIri: pred,
              propertyLabel: pLabel,
              value: t.object,
              datatype: t.datatype,
              lang: t.lang
            });
          } else {
            objAssertions.push({
              propertyIri: pred,
              propertyLabel: pLabel,
              targetIri: t.object,
              targetLabel: getPreferredLabel(t.object)
            });
          }
        });
      });

      individuals[subj] = {
        iri: subj,
        label: getPreferredLabel(subj),
        comment: getComment(subj),
        types: indTypes,
        typeLabels: indTypes.map(t => getPreferredLabel(t)),
        objectProperties: objAssertions,
        dataProperties: dataAssertions,
        differentFrom: diffFromList,
        differentFromLabels: diffFromList.map(d => getPreferredLabel(d)),
        rawTriples: getTriples(subj)
      };

      differentFromPairsCount += diffFromList.length;

      // Assign to class individual lists
      indTypes.forEach(tIri => {
        if (classes[tIri]) {
          classes[tIri].individuals.push(subj);
          classes[tIri].individualCount++;
        }
      });
    }
  });

  const objPropCount = Object.values(properties).filter(p => p.type === 'object').length;
  const dataPropCount = Object.values(properties).filter(p => p.type === 'datatype').length;
  const annotPropCount = Object.values(properties).filter(p => p.type === 'annotation').length;

  const metrics: OntologyMetrics = {
    classCount: Object.keys(classes).length,
    objectPropertyCount: objPropCount,
    dataPropertyCount: dataPropCount,
    individualCount: Object.keys(individuals).length,
    swrlRuleCount: swrlRules.length,
    tripleCount: triples.length,
    annotationPropertyCount: annotPropCount,
    disjointAxiomCount: allDifferentGroups.length + Math.round(differentFromPairsCount / 2)
  };

  return {
    metadata,
    metrics,
    classes,
    properties,
    individuals,
    swrlRules,
    allDifferentGroups,
    differentFromPairsCount,
    prefixes,
    rawTriples: triples
  };
}
