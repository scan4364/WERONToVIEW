import React, { useState, useRef } from 'react';
import { 
  Upload, 
  FileCode, 
  ShieldCheck, 
  Sparkles, 
  AlertCircle, 
  Layers, 
  GitCompare, 
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { loadOntologyFromText, LoadResult } from '../parser/ontologyLoader';
import { OntologyModel } from '../types/ontology';

interface FileLoaderProps {
  onLoadBaseOntology: (result: LoadResult, content: string) => void;
  onLoadCompareOntology: (result: LoadResult, content: string) => void;
  baseModel: OntologyModel | null;
  compareModel: OntologyModel | null;
  baseFilename: string;
  compareFilename: string;
  isLoading: boolean;
  setIsLoading: (v: boolean) => void;
  onClearCompare: () => void;
}

export const FileLoader: React.FC<FileLoaderProps> = ({
  onLoadBaseOntology,
  onLoadCompareOntology,
  baseModel,
  compareModel,
  baseFilename,
  compareFilename,
  isLoading,
  setIsLoading,
  onClearCompare
}) => {
  const [dragOver, setDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const baseInputRef = useRef<HTMLInputElement>(null);
  const compareInputRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File, isCompare = false) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const text = await file.text();
      const res = await loadOntologyFromText(text, file.name);

      if (!res.success) {
        setErrorMessage(res.error || 'Erro desconhecido ao carregar o arquivo.');
      } else {
        if (isCompare) {
          onLoadCompareOntology(res, text);
        } else {
          onLoadBaseOntology(res, text);
        }
      }
    } catch (err: any) {
      setErrorMessage(`Falha na leitura do arquivo "${file.name}": ${err.message || String(err)}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      processFile(file, false);
    }
  };

  const loadExampleOntology = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await fetch('./examples/wer-catalogo-v7-regras-swrl.ttl');
      if (!response.ok) {
        throw new Error(`Não foi possível carregar o exemplo (HTTP ${response.status})`);
      }
      const text = await response.text();
      const res = await loadOntologyFromText(text, 'wer-catalogo-v7-regras-swrl.ttl');
      if (res.success) {
        onLoadBaseOntology(res, text);
      } else {
        setErrorMessage(res.error || 'Erro ao carregar ontologia de exemplo.');
      }
    } catch (err: any) {
      setErrorMessage(`Erro ao buscar exemplo embutido: ${err.message || String(err)}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      {/* If no ontology loaded yet, show full hero landing */}
      {!baseModel ? (
        <div className="py-12 px-4 sm:px-6 max-w-4xl mx-auto text-center">
          
          {/* Hero Header */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-50 dark:bg-primary-950/50 border border-primary-200 dark:border-primary-800 text-primary-700 dark:text-primary-300 text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            Web Semântica · Centro de Informática (CIn - UFPE)
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-3">
            Explore ontologias OWL de forma <span className="bg-gradient-to-r from-primary-600 to-indigo-600 bg-clip-text text-transparent">simples e legível</span>
          </h1>
          
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-4 max-w-2xl mx-auto">
            Criado por <strong className="text-slate-800 dark:text-slate-200">Samuel Celso Anjos Neto</strong> e <strong className="text-slate-800 dark:text-slate-200">Pedro Henrique Dantas</strong> · Sob Orientação do <strong className="text-slate-800 dark:text-slate-200">Prof. Frederico Freitas</strong> · CIn - UFPE
          </p>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-8">
            Visualizador interativo de ontologias OWL 2 com axiomas DL traduzidos em português, regras SWRL completas, grafo interativo e comparação antes/depois da inferência.
          </p>

          {/* Privacy Notice (RNF-01) */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-800 dark:text-emerald-300 text-xs font-medium mb-8">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span><strong>100% no navegador:</strong> seus dados não saem do seu computador. Nenhum arquivo é enviado a servidores externos.</span>
          </div>

          {/* Dropzone Container (RF-01) */}
          <div
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`p-8 sm:p-12 border-2 border-dashed rounded-3xl transition-all duration-200 text-center cursor-pointer ${
              dragOver
                ? 'border-primary-500 bg-primary-50/50 dark:bg-primary-950/20 scale-[1.01]'
                : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/60 hover:border-primary-400 dark:hover:border-primary-600 shadow-sm'
            }`}
            onClick={() => baseInputRef.current?.click()}
          >
            <input
              type="file"
              ref={baseInputRef}
              accept=".ttl,.owl,.rdf,.xml,.n3"
              className="hidden"
              onChange={e => {
                if (e.target.files && e.target.files[0]) {
                  processFile(e.target.files[0], false);
                }
              }}
            />

            <div className="mx-auto w-16 h-16 rounded-2xl bg-primary-100 dark:bg-primary-950/80 flex items-center justify-center text-primary-600 dark:text-primary-400 mb-4 shadow-inner">
              <Upload className="w-8 h-8" />
            </div>

            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">
              Arraste e solte o arquivo da ontologia aqui
            </h3>
            
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-6">
              Suporta Turtle (<code className="font-mono text-xs">.ttl</code>) e RDF/XML (<code className="font-mono text-xs">.owl, .rdf</code>) com detecção automática.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-xl shadow-md shadow-primary-500/20 transition flex items-center gap-2"
                onClick={e => {
                  e.stopPropagation();
                  baseInputRef.current?.click();
                }}
              >
                <FileCode className="w-4 h-4" />
                Selecionar arquivo do computador
              </button>

              {/* Example Button (RF-03) */}
              <button
                type="button"
                disabled={isLoading}
                onClick={e => {
                  e.stopPropagation();
                  loadExampleOntology();
                }}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-sm font-medium rounded-xl border border-slate-300 dark:border-slate-700 transition flex items-center gap-2"
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-primary-500" />
                ) : (
                  <Sparkles className="w-4 h-4 text-amber-500" />
                )}
                Carregar exemplo do Catálogo WER
              </button>
            </div>
          </div>

          {/* Error Message Alert (RF-02) */}
          {errorMessage && (
            <div className="mt-6 p-4 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-2xl text-left flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-red-800 dark:text-red-300">Erro na leitura do arquivo</h4>
                <p className="text-xs text-red-700 dark:text-red-400 mt-1">{errorMessage}</p>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Compact Bar when ontology is loaded */
        <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 py-3 transition-colors">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
            
            {/* Active File Info */}
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary-100 dark:bg-primary-950/80 text-primary-600 dark:text-primary-400">
                <FileCode className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Arquivo ativo:
                  </span>
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
                    {baseFilename}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-md">
                  {baseModel.metadata.label || baseModel.metadata.iri}
                </p>
              </div>
            </div>

            {/* Comparison Slot (RF-04, RF-40) */}
            <div className="flex items-center gap-3">
              <input
                type="file"
                ref={compareInputRef}
                accept=".ttl,.owl,.rdf,.xml,.n3"
                className="hidden"
                onChange={e => {
                  if (e.target.files && e.target.files[0]) {
                    processFile(e.target.files[0], true);
                  }
                }}
              />

              {!compareModel ? (
                <button
                  type="button"
                  onClick={() => compareInputRef.current?.click()}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-800 rounded-lg transition"
                  title="Carregar ontologia após inferência (Drools ou raciocinador) para comparar novidades"
                >
                  <GitCompare className="w-3.5 h-3.5" />
                  <span>Carregar arquivo para comparação (Diff)</span>
                </button>
              ) : (
                <div className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 rounded-lg px-3 py-1.5 text-xs text-indigo-800 dark:text-indigo-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>Comparando com: <strong>{compareFilename}</strong></span>
                  <button
                    type="button"
                    onClick={onClearCompare}
                    className="ml-2 text-indigo-500 hover:text-indigo-700 dark:hover:text-indigo-200 text-[11px] underline"
                  >
                    Remover
                  </button>
                </div>
              )}

              {/* Load another base file */}
              <button
                type="button"
                onClick={() => baseInputRef.current?.click()}
                className="text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 underline"
              >
                Trocar arquivo
              </button>
              <input
                type="file"
                ref={baseInputRef}
                accept=".ttl,.owl,.rdf,.xml,.n3"
                className="hidden"
                onChange={e => {
                  if (e.target.files && e.target.files[0]) {
                    processFile(e.target.files[0], false);
                  }
                }}
              />
            </div>
          </div>

          {errorMessage && (
            <div className="max-w-7xl mx-auto mt-2 p-2.5 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-lg text-xs text-red-700 dark:text-red-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
