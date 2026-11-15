import { Parser as N3Parser, Quad } from 'n3';
import { RDFTriple } from '../types/ontology';

export interface ParseResult {
  triples: RDFTriple[];
  prefixes: Record<string, string>;
  error?: string;
  errorLine?: number;
}

export function parseTurtle(content: string): Promise<ParseResult> {
  return new Promise((resolve) => {
    const triples: RDFTriple[] = [];
    let prefixes: Record<string, string> = {};

    const parser = new N3Parser({
      format: 'Turtle',
      blankNodePrefix: '_:b'
    });

    try {
      parser.parse(content, (error: Error | null, quad: Quad | null, parsedPrefixes: Record<string, any>) => {
        if (error) {
          // Extract line number if available
          let line: number | undefined;
          const match = error.message.match(/line (\d+)/i);
          if (match) {
            line = parseInt(match[1], 10);
          }
          resolve({
            triples: [],
            prefixes: {},
            error: `Erro ao processar Turtle: ${error.message}`,
            errorLine: line
          });
          return;
        }

        if (parsedPrefixes) {
          const stringPrefixes: Record<string, string> = {};
          Object.keys(parsedPrefixes).forEach(k => {
            stringPrefixes[k] = parsedPrefixes[k].value || parsedPrefixes[k].toString();
          });
          prefixes = { ...prefixes, ...stringPrefixes };
        }

        if (quad) {
          const isLiteral = quad.object.termType === 'Literal';
          const isObjBnode = quad.object.termType === 'BlankNode';
          const isSubjBnode = quad.subject.termType === 'BlankNode';

          const subjVal = isSubjBnode
            ? (quad.subject.value.startsWith('_:') ? quad.subject.value : `_:${quad.subject.value}`)
            : quad.subject.value;

          const objVal = isObjBnode
            ? (quad.object.value.startsWith('_:') ? quad.object.value : `_:${quad.object.value}`)
            : quad.object.value;
          
          triples.push({
            subject: subjVal,
            predicate: quad.predicate.value,
            object: objVal,
            objectType: isLiteral ? 'literal' : (isObjBnode ? 'bnode' : 'iri'),
            datatype: isLiteral ? quad.object.datatype?.value : undefined,
            lang: isLiteral ? quad.object.language : undefined
          });
        } else {
          // Parsing complete
          resolve({
            triples,
            prefixes
          });
        }
      });
    } catch (err: any) {
      resolve({
        triples: [],
        prefixes: {},
        error: `Falha na leitura do arquivo Turtle: ${err.message || String(err)}`
      });
    }
  });
}
