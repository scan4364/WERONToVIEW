import { SWRLAtom, SWRLRule } from '../types/ontology';

export function formatAtom(atom: SWRLAtom): string {
  const p = atom.predicateLabel || atom.predicate?.split('#').pop() || atom.predicate || 'átomo';
  const args = atom.args.map(a => a.startsWith('urn:swrl#') ? `?${a.split('#')[1]}` : (a.startsWith('?') ? a : a.split('#').pop() || a));

  switch (atom.type) {
    case 'class':
      return `${p}(${args[0] || '?'})`;
    case 'individualProperty':
    case 'datavaluedProperty':
      return `${p}(${args.join(', ')})`;
    case 'differentIndividuals':
      return `differentFrom(${args.join(', ')})`;
    case 'sameIndividual':
      return `sameAs(${args.join(', ')})`;
    case 'builtin': {
      const bName = atom.builtin?.split('#').pop() || 'builtin';
      return `${bName}(${args.join(', ')})`;
    }
    default:
      return `${p}(${args.join(', ')})`;
  }
}

export function formatAtomPortuguese(atom: SWRLAtom): string {
  const p = atom.predicateLabel || atom.predicate?.split('#').pop() || 'átomo';
  const args = atom.args.map(a => a.startsWith('urn:swrl#') ? `?${a.split('#')[1]}` : (a.startsWith('?') ? a : a.split('#').pop() || a));

  switch (atom.type) {
    case 'class':
      return `${args[0]} é um(a) ${p}`;
    case 'individualProperty':
    case 'datavaluedProperty':
      return `${args[0]} tem ${p} ${args[1]}`;
    case 'differentIndividuals':
      return `${args[0]} é diferente de ${args[1]}`;
    case 'sameIndividual':
      return `${args[0]} é igual a ${args[1]}`;
    case 'builtin': {
      const bName = atom.builtin?.split('#').pop() || '';
      if (bName === 'notEqual') {
        return `${args[0]} ≠ ${args[1]}`;
      }
      if (bName === 'equal') {
        return `${args[0]} = ${args[1]}`;
      }
      return `${bName}(${args.join(', ')})`;
    }
    default:
      return `${p}(${args.join(', ')})`;
  }
}

export function formatRuleLogic(body: SWRLAtom[], head: SWRLAtom[]): string {
  const bodyStr = body.map(formatAtom).join(' ∧ ');
  const headStr = head.map(formatAtom).join(' ∧ ');
  return `${bodyStr} → ${headStr}`;
}

export function formatRulePortuguese(body: SWRLAtom[], head: SWRLAtom[]): string {
  const bodyStr = body.map(formatAtomPortuguese).join(' e ');
  const headStr = head.map(formatAtomPortuguese).join(' e ');
  return `SE ${bodyStr} ENTÃO ${headStr}`;
}

export function extractRuleEntities(rule: SWRLRule): { classes: string[]; properties: string[] } {
  const classes = new Set<string>();
  const properties = new Set<string>();

  const processAtom = (atom: SWRLAtom) => {
    if (atom.type === 'class' && atom.predicate) {
      classes.add(atom.predicate);
    } else if ((atom.type === 'individualProperty' || atom.type === 'datavaluedProperty') && atom.predicate) {
      properties.add(atom.predicate);
    }
  };

  rule.body.forEach(processAtom);
  rule.head.forEach(processAtom);

  return {
    classes: Array.from(classes),
    properties: Array.from(properties)
  };
}
