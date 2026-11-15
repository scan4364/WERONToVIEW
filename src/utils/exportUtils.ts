import { OntologyModel } from '../types/ontology';

export function downloadFile(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportSummaryToMarkdown(model: OntologyModel): string {
  const date = new Date().toLocaleDateString('pt-BR');
  let md = `# Resumo da Ontologia: ${model.metadata.label}\n\n`;
  md += `> Gerado em ${date} pelo **WerOntoView**\n`;
  md += `> Autores: Samuel Celso Anjos Neto e Pedro Henrique Dantas · Sob Orientação do Prof. Frederico Freitas (CIn - UFPE)\n\n`;
  md += `## 1. Metadados Gerais\n\n`;
  md += `- **IRI:** \`${model.metadata.iri}\`\n`;
  if (model.metadata.comment) md += `- **Comentário:** ${model.metadata.comment}\n`;
  md += `\n## 2. Métricas (Padrão Protégé)\n\n`;
  md += `| Métrica | Quantidade |\n`;
  md += `| :--- | :--- |\n`;
  md += `| **Classes** | ${model.metrics.classCount} |\n`;
  md += `| **Propriedades de Objeto** | ${model.metrics.objectPropertyCount} |\n`;
  md += `| **Propriedades de Dados** | ${model.metrics.dataPropertyCount} |\n`;
  md += `| **Indivíduos** | ${model.metrics.individualCount} |\n`;
  md += `| **Regras SWRL** | ${model.metrics.swrlRuleCount} |\n`;
  md += `| **Total de Triplas RDF** | ${model.metrics.tripleCount} |\n`;
  md += `| **Axiomas de Distinção** | ${model.metrics.disjointAxiomCount} |\n\n`;

  md += `## 3. Classes Principais\n\n`;
  md += `| Nome / Rótulo | Superclasses | Indivíduos |\n`;
  md += `| :--- | :--- | :--- |\n`;
  Object.values(model.classes).forEach(cls => {
    const supers = cls.superClasses.map(s => model.classes[s]?.label || s.split('#').pop()).join(', ') || '-';
    md += `| **${cls.label}** | ${supers} | ${cls.individualCount} |\n`;
  });

  md += `\n## 4. Propriedades\n\n`;
  md += `| Nome | Tipo | Domínio | Imagem | Características |\n`;
  md += `| :--- | :--- | :--- | :--- | :--- |\n`;
  Object.values(model.properties).forEach(p => {
    const dom = p.domains.map(d => model.classes[d]?.label || d.split('#').pop()).join(', ') || '-';
    const ran = p.ranges.map(r => model.classes[r]?.label || r.split('#').pop()).join(', ') || '-';
    const feats: string[] = [];
    if (p.isFunctional) feats.push('Funcional');
    if (p.isTransitive) feats.push('Transitiva');
    if (p.isSymmetric) feats.push('Simétrica');
    if (p.inverseOfLabel) feats.push(`Inversa de ${p.inverseOfLabel}`);
    md += `| **${p.label}** | ${p.type} | ${dom} | ${ran} | ${feats.join(', ') || '-'} |\n`;
  });

  if (model.swrlRules.length > 0) {
    md += `\n## 5. Regras SWRL (${model.swrlRules.length})\n\n`;
    model.swrlRules.forEach((rule, idx) => {
      md += `### ${idx + 1}. ${rule.label}\n\n`;
      if (rule.comment) md += `*${rule.comment}*\n\n`;
      md += `\`\`\`prolog\n${rule.readableLogic}\n\`\`\`\n\n`;
      md += `**Em linguagem natural:** ${rule.readablePortuguese}\n\n`;
    });
  }

  return md;
}

export function exportClassesToCSV(model: OntologyModel): string {
  let csv = 'IRI,Rótulo,Superclasses,Total de Indivíduos,Comentário\n';
  Object.values(model.classes).forEach(cls => {
    const supers = cls.superClasses.map(s => model.classes[s]?.label || s.split('#').pop()).join('; ');
    const comment = (cls.comment || '').replace(/"/g, '""');
    csv += `"${cls.iri}","${cls.label}","${supers}",${cls.individualCount},"${comment}"\n`;
  });
  return csv;
}

export function exportPropertiesToCSV(model: OntologyModel): string {
  let csv = 'IRI,Rótulo,Tipo,Domínio,Imagem,Funcional,Transitiva,Simétrica,Inversa De,Comentário\n';
  Object.values(model.properties).forEach(p => {
    const dom = p.domains.map(d => model.classes[d]?.label || d.split('#').pop()).join('; ');
    const ran = p.ranges.map(r => model.classes[r]?.label || r.split('#').pop()).join('; ');
    const comment = (p.comment || '').replace(/"/g, '""');
    csv += `"${p.iri}","${p.label}","${p.type}","${dom}","${ran}",${!!p.isFunctional},${!!p.isTransitive},${!!p.isSymmetric},"${p.inverseOfLabel || ''}","${comment}"\n`;
  });
  return csv;
}

export function exportSWRLToCSV(model: OntologyModel): string {
  let csv = 'Nome,Comentário,Regra Lógica,Regra em Português\n';
  model.swrlRules.forEach(r => {
    const comment = (r.comment || '').replace(/"/g, '""');
    const logic = (r.readableLogic || '').replace(/"/g, '""');
    const pt = (r.readablePortuguese || '').replace(/"/g, '""');
    csv += `"${r.label}","${comment}","${logic}","${pt}"\n`;
  });
  return csv;
}
