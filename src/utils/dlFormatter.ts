import { ClassExpression, RestrictionExpr } from '../types/ontology';

export function formatRestrictionToPortuguese(restr: RestrictionExpr): string {
  const p = restr.propertyLabel || restr.propertyIri.split('#').pop() || 'propriedade';
  const filler = restr.fillerLabel || (restr.fillerIri ? restr.fillerIri.split('#').pop() : '');
  const val = restr.value || '';
  const card = restr.cardinality !== undefined ? restr.cardinality : '';

  switch (restr.type) {
    case 'some':
      return `${p} algum ${filler}`;
    case 'all':
      return `${p} todos ${filler}`;
    case 'value':
      return `${p} valor ${val || filler}`;
    case 'min':
      return `${p} mínimo ${card}`;
    case 'minQualified':
      return `${p} mínimo ${card} ${filler}`;
    case 'max':
      return `${p} máximo ${card}`;
    case 'maxQualified':
      return `${p} máximo ${card} ${filler}`;
    case 'exact':
      return `${p} exatamente ${card}`;
    case 'qualified':
      return `${p} exatamente ${card} ${filler}`;
    case 'hasSelf':
      return `${p} consigo mesmo`;
    default:
      return `${p} (${restr.type} ${filler || val})`;
  }
}

export function formatRestrictionToDL(restr: RestrictionExpr): string {
  const p = restr.propertyLabel || restr.propertyIri.split('#').pop() || 'p';
  const filler = restr.fillerLabel || (restr.fillerIri ? restr.fillerIri.split('#').pop() : '⊤');
  const val = restr.value || '';
  const card = restr.cardinality !== undefined ? restr.cardinality : '';

  switch (restr.type) {
    case 'some':
      return `∃${p}.${filler}`;
    case 'all':
      return `∀${p}.${filler}`;
    case 'value':
      return `∃${p}.{${val || filler}}`;
    case 'min':
      return `≥${card} ${p}`;
    case 'minQualified':
      return `≥${card} ${p}.${filler}`;
    case 'max':
      return `≤${card} ${p}`;
    case 'maxQualified':
      return `≤${card} ${p}.${filler}`;
    case 'exact':
      return `=${card} ${p}`;
    case 'qualified':
      return `=${card} ${p}.${filler}`;
    case 'hasSelf':
      return `∃${p}.Self`;
    default:
      return `${p}.${filler}`;
  }
}

export function formatExpressionToPortuguese(expr: ClassExpression): string {
  if (expr.type === 'named') {
    return expr.classLabel || expr.classIri?.split('#').pop() || 'Classe';
  }
  if (expr.type === 'restriction' && expr.restriction) {
    return `(${formatRestrictionToPortuguese(expr.restriction)})`;
  }
  if (expr.type === 'intersection') {
    const ops = expr.operands?.map(op => {
      const formatted = formatExpressionToPortuguese(op);
      return op.type === 'named' ? formatted : `(${formatted})`;
    }).join(' e ') || '';
    return ops;
  }
  if (expr.type === 'union') {
    const ops = expr.operands?.map(op => {
      const formatted = formatExpressionToPortuguese(op);
      return op.type === 'named' ? formatted : `(${formatted})`;
    }).join(' ou ') || '';
    return ops;
  }
  if (expr.type === 'complement') {
    const inner = expr.operands?.[0] ? formatExpressionToPortuguese(expr.operands[0]) : '';
    return `não (${inner})`;
  }
  return 'Expressão';
}

export function formatExpressionToDL(expr: ClassExpression): string {
  if (expr.type === 'named') {
    return expr.classLabel || expr.classIri?.split('#').pop() || 'C';
  }
  if (expr.type === 'restriction' && expr.restriction) {
    return formatRestrictionToDL(expr.restriction);
  }
  if (expr.type === 'intersection') {
    return expr.operands?.map(op => formatExpressionToDL(op)).join(' ⊓ ') || '';
  }
  if (expr.type === 'union') {
    return expr.operands?.map(op => `(${formatExpressionToDL(op)})`).join(' ⊔ ') || '';
  }
  if (expr.type === 'complement') {
    const inner = expr.operands?.[0] ? formatExpressionToDL(expr.operands[0]) : '';
    return `¬(${inner})`;
  }
  return 'C';
}

export function formatEquivalentClassPortuguese(className: string, expr: ClassExpression): string {
  return `${className} ≡ ${formatExpressionToPortuguese(expr)}`;
}

export function formatEquivalentClassDL(className: string, expr: ClassExpression): string {
  return `${className} ≡ ${formatExpressionToDL(expr)}`;
}

export function formatPropertyChain(propName: string, chain: string[]): string {
  return `${propName} ⊒ ${chain.join(' ∘ ')}`;
}
