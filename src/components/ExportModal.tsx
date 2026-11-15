import React, { useState } from 'react';
import { 
  X, 
  Download, 
  FileText, 
  Table, 
  Check, 
  Copy,
  ScrollText
} from 'lucide-react';
import { OntologyModel } from '../types/ontology';
import { 
  exportSummaryToMarkdown, 
  exportClassesToCSV, 
  exportPropertiesToCSV, 
  exportSWRLToCSV, 
  downloadFile 
} from '../utils/exportUtils';

interface ExportModalProps {
  model: OntologyModel;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ model, onClose }) => {
  const [activeTab, setActiveTab] = useState<'markdown' | 'classesCsv' | 'propsCsv' | 'swrlCsv'>('markdown');
  const [copied, setCopied] = useState(false);

  const markdownContent = React.useMemo(() => exportSummaryToMarkdown(model), [model]);
  const classesCsvContent = React.useMemo(() => exportClassesToCSV(model), [model]);
  const propsCsvContent = React.useMemo(() => exportPropertiesToCSV(model), [model]);
  const swrlCsvContent = React.useMemo(() => exportSWRLToCSV(model), [model]);

  const currentContent = React.useMemo(() => {
    switch (activeTab) {
      case 'markdown': return markdownContent;
      case 'classesCsv': return classesCsvContent;
      case 'propsCsv': return propsCsvContent;
      case 'swrlCsv': return swrlCsvContent;
    }
  }, [activeTab, markdownContent, classesCsvContent, propsCsvContent, swrlCsvContent]);

  const handleDownload = () => {
    const baseName = model.metadata.label.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'ontologia';
    if (activeTab === 'markdown') {
      downloadFile(`${baseName}-relatorio.md`, markdownContent, 'text/markdown;charset=utf-8');
    } else if (activeTab === 'classesCsv') {
      downloadFile(`${baseName}-classes.csv`, classesCsvContent, 'text/csv;charset=utf-8');
    } else if (activeTab === 'propsCsv') {
      downloadFile(`${baseName}-propriedades.csv`, propsCsvContent, 'text/csv;charset=utf-8');
    } else if (activeTab === 'swrlCsv') {
      downloadFile(`${baseName}-regras-swrl.csv`, swrlCsvContent, 'text/csv;charset=utf-8');
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(currentContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary-100 dark:bg-primary-950 text-primary-600 dark:text-primary-400">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Exportar Dados da Ontologia (RF-50)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Gere arquivos em Markdown para relatórios acadêmicos e CSV para análise
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab selection */}
        <div className="flex flex-wrap items-center gap-1.5 px-5 pt-3 border-b border-slate-100 dark:border-slate-800 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('markdown')}
            className={`px-3 py-2 rounded-t-lg font-semibold border-b-2 flex items-center gap-1.5 transition ${
              activeTab === 'markdown'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400 bg-primary-50/50 dark:bg-primary-950/20'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Relatório Markdown (.md)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('classesCsv')}
            className={`px-3 py-2 rounded-t-lg font-semibold border-b-2 flex items-center gap-1.5 transition ${
              activeTab === 'classesCsv'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400 bg-primary-50/50 dark:bg-primary-950/20'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            <span>Classes (.csv)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('propsCsv')}
            className={`px-3 py-2 rounded-t-lg font-semibold border-b-2 flex items-center gap-1.5 transition ${
              activeTab === 'propsCsv'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400 bg-primary-50/50 dark:bg-primary-950/20'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            <span>Propriedades (.csv)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('swrlCsv')}
            className={`px-3 py-2 rounded-t-lg font-semibold border-b-2 flex items-center gap-1.5 transition ${
              activeTab === 'swrlCsv'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400 bg-primary-50/50 dark:bg-primary-950/20'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <ScrollText className="w-3.5 h-3.5" />
            <span>Regras SWRL (.csv)</span>
          </button>
        </div>

        {/* Code Preview Box */}
        <div className="p-5 flex-1 overflow-hidden flex flex-col">
          <div className="relative flex-1 bg-slate-900 rounded-2xl p-4 overflow-y-auto font-mono text-xs text-slate-200 leading-relaxed shadow-inner">
            <pre className="whitespace-pre-wrap">{currentContent}</pre>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between">
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copiado para área de transferência!' : 'Copiar Texto'}</span>
          </button>

          <button
            type="button"
            onClick={handleDownload}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold rounded-xl shadow-md shadow-primary-500/20 transition"
          >
            <Download className="w-4 h-4" />
            <span>Baixar Arquivo</span>
          </button>
        </div>
      </div>
    </div>
  );
};
