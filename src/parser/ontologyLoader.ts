import { OntologyModel } from '../types/ontology';
import { parseTurtle } from './turtleParser';
import { parseRdfXml } from './rdfxmlParser';
import { extractOntologyModel } from './rdfExtractor';

export type FileFormat = 'turtle' | 'rdfxml' | 'unknown';

export function detectFormat(content: string, filename = ''): FileFormat {
  const trimmed = content.trim();
  const lowerName = filename.toLowerCase();

  // Content inspection first (RF-01)
  if (trimmed.startsWith('<?xml') || trimmed.includes('<rdf:RDF') || trimmed.includes('xmlns:rdf=')) {
    return 'rdfxml';
  }
  if (
    trimmed.startsWith('@prefix') ||
    trimmed.startsWith('@base') ||
    trimmed.includes('PREFIX ') ||
    trimmed.includes('BASE ') ||
    trimmed.includes('owl:Ontology') ||
    trimmed.includes('rdf:type') ||
    trimmed.includes(';\n')
  ) {
    return 'turtle';
  }

  // Fallback to extension
  if (lowerName.endsWith('.ttl')) return 'turtle';
  if (lowerName.endsWith('.rdf') || lowerName.endsWith('.owl') || lowerName.endsWith('.xml')) return 'rdfxml';

  return 'unknown';
}

export interface LoadResult {
  success: boolean;
  model?: OntologyModel;
  detectedFormat?: FileFormat;
  error?: string;
  errorLine?: number;
  filename: string;
}

export async function loadOntologyFromText(content: string, filename = 'ontologia.ttl'): Promise<LoadResult> {
  if (!content || !content.trim()) {
    return {
      success: false,
      filename,
      error: 'O arquivo selecionado está vazio.'
    };
  }

  const format = detectFormat(content, filename);

  try {
    if (format === 'rdfxml') {
      const xmlRes = await parseRdfXml(content);
      if (xmlRes.error) {
        return {
          success: false,
          filename,
          detectedFormat: 'rdfxml',
          error: xmlRes.error
        };
      }
      const model = extractOntologyModel(xmlRes.triples, xmlRes.prefixes);
      return {
        success: true,
        model,
        detectedFormat: 'rdfxml',
        filename
      };
    } else {
      // Default try Turtle
      const ttlRes = await parseTurtle(content);
      if (ttlRes.error) {
        // If turtle failed and content looks like xml, try rdfxml
        if (content.includes('<') && content.includes('>')) {
          const fallbackXml = await parseRdfXml(content);
          if (!fallbackXml.error && fallbackXml.triples.length > 0) {
            const model = extractOntologyModel(fallbackXml.triples, fallbackXml.prefixes);
            return {
              success: true,
              model,
              detectedFormat: 'rdfxml',
              filename
            };
          }
        }

        return {
          success: false,
          filename,
          detectedFormat: 'turtle',
          error: ttlRes.error,
          errorLine: ttlRes.errorLine
        };
      }

      const model = extractOntologyModel(ttlRes.triples, ttlRes.prefixes);
      return {
        success: true,
        model,
        detectedFormat: 'turtle',
        filename
      };
    }
  } catch (err: any) {
    return {
      success: false,
      filename,
      error: `Erro inesperado ao processar "${filename}": ${err.message || String(err)}`
    };
  }
}
