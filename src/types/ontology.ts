export interface RDFTriple {
  subject: string;
  predicate: string;
  object: string;
  objectType: 'iri' | 'literal' | 'bnode';
  datatype?: string;
  lang?: string;
}

export interface OntologyMetadata {
  iri: string;
  label: string;
  comment?: string;
  versionInfo?: string;
}

export interface OntologyMetrics {
  classCount: number;
  objectPropertyCount: number;
  dataPropertyCount: number;
  individualCount: number;
  swrlRuleCount: number;
  tripleCount: number;
  annotationPropertyCount: number;
  disjointAxiomCount: number;
}

export interface RestrictionExpr {
  type: 'some' | 'all' | 'value' | 'min' | 'max' | 'exact' | 'minQualified' | 'maxQualified' | 'qualified' | 'hasSelf';
  propertyIri: string;
  propertyLabel: string;
  fillerIri?: string;
  fillerLabel?: string;
  cardinality?: number;
  value?: string;
  rawDl?: string;
  rawManchester?: string;
}

export interface ClassExpression {
  type: 'named' | 'intersection' | 'union' | 'complement' | 'restriction';
  classIri?: string;
  classLabel?: string;
  operands?: ClassExpression[];
  restriction?: RestrictionExpr;
}

export interface OntologyClass {
  iri: string;
  label: string;
  comment?: string;
  superClasses: string[];
  inferredSuperClasses?: string[]; // RF-19: inferida a partir de equivalentClass com intersectionOf
  subClasses: string[];
  equivalentClasses: ClassExpression[];
  restrictions: RestrictionExpr[];
  disjointWith: string[];
  individuals: string[];
  individualCount: number;
  rawTriples: RDFTriple[];
}

export interface OntologyProperty {
  iri: string;
  label: string;
  comment?: string;
  type: 'object' | 'datatype' | 'annotation';
  domains: string[];
  domainExpressions?: ClassExpression[];
  ranges: string[];
  rangeExpressions?: ClassExpression[];
  isFunctional?: boolean;
  isInverseFunctional?: boolean;
  isTransitive?: boolean;
  isSymmetric?: boolean;
  isAsymmetric?: boolean;
  isReflexive?: boolean;
  isIrreflexive?: boolean;
  inverseOf?: string;
  inverseOfLabel?: string;
  isInverse?: boolean; // Se é propriedade inversa de outra (RF-18)
  propertyChain?: string[];
  propertyChainLabels?: string[];
  rawTriples: RDFTriple[];
}

export interface IndividualPropertyAssertion {
  propertyIri: string;
  propertyLabel: string;
  targetIri: string;
  targetLabel: string;
  isInferred?: boolean;
}

export interface IndividualDataAssertion {
  propertyIri: string;
  propertyLabel: string;
  value: string;
  datatype?: string;
  lang?: string;
  isInferred?: boolean;
}

export interface OntologyIndividual {
  iri: string;
  label: string;
  comment?: string;
  types: string[];
  typeLabels: string[];
  objectProperties: IndividualPropertyAssertion[];
  dataProperties: IndividualDataAssertion[];
  differentFrom: string[];
  differentFromLabels: string[];
  isInferred?: boolean;
  rawTriples: RDFTriple[];
}

export interface SWRLAtom {
  type: 'class' | 'individualProperty' | 'datavaluedProperty' | 'differentIndividuals' | 'sameIndividual' | 'builtin';
  predicate?: string;
  predicateLabel?: string;
  builtin?: string;
  args: string[];
}

export interface SWRLRule {
  id: string;
  label: string;
  comment?: string;
  body: SWRLAtom[];
  head: SWRLAtom[];
  readablePortuguese: string;
  readableLogic: string;
  usedClasses: string[];
  usedProperties: string[];
  rawTriples: RDFTriple[];
}

export interface AxiomBlock {
  id: string;
  type: 'disjointClasses' | 'allDifferent' | 'massDifferentFrom' | 'unknownBlankNode';
  title: string;
  summary: string;
  members: string[];
  memberLabels: string[];
}

export interface AllDifferentGroup {
  id: string;
  members: string[];
  memberLabels: string[];
}

export interface OntologyModel {
  metadata: OntologyMetadata;
  metrics: OntologyMetrics;
  classes: Record<string, OntologyClass>;
  properties: Record<string, OntologyProperty>;
  individuals: Record<string, OntologyIndividual>;
  swrlRules: SWRLRule[];
  allDifferentGroups: AllDifferentGroup[];
  axiomBlocks: AxiomBlock[]; // RF-16.2: Blocos de disjunção, distinção e avisos
  differentFromPairsCount: number;
  prefixes: Record<string, string>;
  rawTriples: RDFTriple[];
}

export interface DiffResult {
  hasDiff: boolean;
  baseFile: string;
  comparedFile: string;
  newAssertions: {
    subjectIri: string;
    subjectLabel: string;
    propertyIri: string;
    propertyLabel: string;
    object: string;
    objectLabel: string;
    isLiteral: boolean;
  }[];
  newTypes: {
    individualIri: string;
    individualLabel: string;
    classIri: string;
    classLabel: string;
  }[];
  newAxioms: RDFTriple[];
  statsByProperty: Record<string, { label: string; count: number }>;
  totalNewAssertions: number;
  totalNewTypes: number;
  totalNewTriples: number;
}
