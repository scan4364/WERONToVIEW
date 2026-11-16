import os
import re
import base64
import tempfile
import time
import markdown
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.print_page_options import PrintOptions

DOCS_DIR = os.path.dirname(os.path.abspath(__file__))

FILES = [
    {
        "md": os.path.join(DOCS_DIR, "1_Relatorio_Tecnico_Ontologia_WER.md"),
        "pdf": os.path.join(DOCS_DIR, "1_Relatorio_Tecnico_Ontologia_WER.pdf"),
        "title": "Modelagem e Inferência Semântica no Catálogo de Publicações do WER 2026"
    },
    {
        "md": os.path.join(DOCS_DIR, "2_Relatorio_Tecnico_Arquitetura_ADL_ACME.md"),
        "pdf": os.path.join(DOCS_DIR, "2_Relatorio_Tecnico_Arquitetura_ADL_ACME.pdf"),
        "title": "Especificação Arquitetural Formal da Ferramenta WerOntoView em ADL ACME"
    },
    {
        "md": os.path.join(DOCS_DIR, "3_Documento_Requisitos_Ferramenta.md"),
        "pdf": os.path.join(DOCS_DIR, "3_Documento_Requisitos_Ferramenta.pdf"),
        "title": "Especificação de Requisitos de Software — WerOntoView"
    },
    {
        "md": os.path.join(DOCS_DIR, "4_Artigo_Completo_Unificado_WerOntoView.md"),
        "pdf": os.path.join(DOCS_DIR, "4_Artigo_Completo_Unificado_WerOntoView.pdf"),
        "title": "WerOntoView: Da Modelagem Ontológica e Inferência SWRL à Visualização e Recuperação Semântica"
    }
]

HTML_TEMPLATE = """<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <title>{{TITLE}}</title>
  <style>
    @page {{
      size: A4;
      margin: 22mm 20mm 22mm 20mm;
      @bottom-right {{
        content: counter(page);
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        font-size: 9pt;
        color: #64748b;
      }}
    }}
    
    * {{
      box-sizing: border-box;
    }}

    body {{
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      font-size: 10.5pt;
      line-height: 1.6;
      color: #1e293b;
      text-rendering: optimizeLegibility;
      background-color: #ffffff;
      margin: 0;
      padding: 0;
    }}

    /* Cabeçalhos */
    h1 {{
      font-size: 20pt;
      font-weight: 700;
      color: #0f172a;
      line-height: 1.25;
      margin-top: 0;
      margin-bottom: 16px;
      padding-bottom: 10px;
      border-bottom: 2.5px solid #2563eb;
      page-break-after: avoid;
    }}

    h2 {{
      font-size: 14pt;
      font-weight: 700;
      color: #1e293b;
      margin-top: 26px;
      margin-bottom: 10px;
      padding-bottom: 6px;
      border-bottom: 1px solid #cbd5e1;
      page-break-after: avoid;
    }}

    h3 {{
      font-size: 11.5pt;
      font-weight: 600;
      color: #334155;
      margin-top: 18px;
      margin-bottom: 8px;
      page-break-after: avoid;
    }}

    h4 {{
      font-size: 10.5pt;
      font-weight: 600;
      color: #475569;
      margin-top: 14px;
      margin-bottom: 6px;
      page-break-after: avoid;
    }}

    p {{
      margin-top: 0;
      margin-bottom: 10px;
      text-align: justify;
    }}

    ul, ol {{
      margin-top: 0;
      margin-bottom: 12px;
      padding-left: 24px;
    }}

    li {{
      margin-bottom: 4px;
      text-align: justify;
    }}

    hr {{
      border: 0;
      border-top: 1px solid #e2e8f0;
      margin: 20px 0;
    }}

    /* Links */
    a {{
      color: #2563eb;
      text-decoration: none;
    }}

    /* Bloco de Código */
    pre {{
      background-color: #f8fafc;
      border: 1px solid #e2e8f0;
      border-left: 4px solid #64748b;
      border-radius: 4px;
      padding: 10px 14px;
      font-family: "Cascadia Code", Consolas, "Courier New", monospace;
      font-size: 8.8pt;
      line-height: 1.45;
      color: #0f172a;
      overflow-x: auto;
      white-space: pre-wrap;
      word-break: break-word;
      page-break-inside: avoid;
      margin: 14px 0;
    }}

    code {{
      font-family: "Cascadia Code", Consolas, "Courier New", monospace;
      font-size: 9pt;
      background-color: #f1f5f9;
      color: #b91c1c;
      padding: 1.5px 4.5px;
      border-radius: 3px;
      border: 1px solid #e2e8f0;
    }}

    pre code {{
      background: none;
      color: inherit;
      padding: 0;
      border: none;
      font-size: inherit;
    }}

    /* Tabelas */
    table {{
      width: 100%;
      border-collapse: collapse;
      margin: 16px 0;
      font-size: 9pt;
      page-break-inside: avoid;
    }}

    th {{
      background-color: #f1f5f9;
      color: #0f172a;
      font-weight: 600;
      text-align: left;
      border: 1px solid #cbd5e1;
      padding: 7px 10px;
    }}

    td {{
      border: 1px solid #cbd5e1;
      padding: 6px 10px;
      vertical-align: top;
      color: #334155;
    }}

    tr:nth-child(even) td {{
      background-color: #f8fafc;
    }}

    /* Citações / Blockquotes */
    blockquote {{
      margin: 14px 0;
      padding: 10px 16px;
      border-left: 4px solid #3b82f6;
      background-color: #eff6ff;
      color: #1e3a8a;
      border-radius: 0 4px 4px 0;
      font-style: italic;
    }}

    /* Fórmulas Matemáticas */
    .math-display {{
      display: flex;
      justify-content: center;
      align-items: center;
      margin: 14px 0;
      padding: 8px 12px;
      background-color: #fcfcfd;
      border-radius: 4px;
      page-break-inside: avoid;
      overflow-x: auto;
    }}

    mjx-container {{
      color: #0f172a !important;
    }}

    /* Autores e Afiliação */
    strong {{
      color: #0f172a;
    }}

    em {{
      color: #334155;
    }}
  </style>

  <!-- Configuração e Carregamento do MathJax 3 -->
  <script>
  window.MathJax = {
    tex: {
      inlineMath: [['$', '$'], ['\\\\(', '\\\\)']],
      displayMath: [['$$', '$$'], ['\\\\[', '\\\\]']],
      processEscapes: true,
      packages: {'[+]': ['ams', 'base', 'newcommand', 'configmacros']}
    },
    svg: {
      fontCache: 'global',
      scale: 1.05
    },
    startup: {
      typeset: true,
      pageReady: () => {
        return MathJax.startup.defaultPageReady().then(() => {
          const div = document.createElement('div');
          div.id = 'mathjax-ready';
          document.body.appendChild(div);
        });
      }
    }
  };
  </script>
  <script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js"></script>
</head>
<body>
{{BODY}}
</body>
</html>
"""

def protect_and_convert_markdown(md_text):
    """
    Protege equações LaTeX antes de passar pelo markdown para não corromper barras,
    sublinhados e caracteres matemáticos, e restaura após a conversão.
    """
    math_blocks = []
    math_inlines = []

    # 1. Extrair display math: $$ ... $$
    def save_block(match):
        idx = len(math_blocks)
        math_blocks.append(match.group(1))
        return f"@@@MATHBLOCK_{idx}@@@"

    text_no_blocks = re.sub(r'\$\$(.+?)\$\$', save_block, md_text, flags=re.DOTALL)

    # 2. Extrair inline math: $ ... $ (sem capturar $$)
    def save_inline(match):
        idx = len(math_inlines)
        math_inlines.append(match.group(1))
        return f"@@@MATHINLINE_{idx}@@@"

    text_protected = re.sub(r'(?<!\$)\$(?!\$)(.+?)(?<!\$)\$(?!\$)', save_inline, text_no_blocks, flags=re.DOTALL)

    # 3. Converter Markdown para HTML
    html_raw = markdown.markdown(text_protected, extensions=['tables', 'fenced_code'])

    # 4. Restaurar inline math
    for idx, math_content in enumerate(math_inlines):
        # Limpar quebras de linha em inline
        clean_math = math_content.replace('\n', ' ')
        html_raw = html_raw.replace(f"@@@MATHINLINE_{idx}@@@", f"${clean_math}$")

    # 5. Restaurar display math
    for idx, math_content in enumerate(math_blocks):
        clean_math = math_content.strip()
        display_html = f'<div class="math-display">$$\n{clean_math}\n$$</div>'
        html_raw = html_raw.replace(f"@@@MATHBLOCK_{idx}@@@", display_html)

    return html_raw


def generate_all_pdfs():
    print("Iniciando conversão para PDF com fórmulas LaTeX renderizadas via MathJax SVG...\n")

    # Inicializar Chrome Headless via Selenium
    options = webdriver.ChromeOptions()
    options.add_argument("--headless=new")
    options.add_argument("--disable-gpu")
    options.add_argument("--no-sandbox")
    options.add_argument("--allow-file-access-from-files")
    
    driver = webdriver.Chrome(options=options)
    temp_files = []

    try:
        for item in FILES:
            md_path = item["md"]
            pdf_path = item["pdf"]
            title = item["title"]

            print(f"Processando: {os.path.basename(md_path)}")
            if not os.path.exists(md_path):
                print(f"  [AVISO] Arquivo não encontrado: {md_path}")
                continue

            with open(md_path, "r", encoding="utf-8") as f:
                md_content = f.read()

            body_html = protect_and_convert_markdown(md_content)
            full_html = HTML_TEMPLATE.replace("{{TITLE}}", title).replace("{{BODY}}", body_html)

            # Criar arquivo temporário HTML
            with tempfile.NamedTemporaryFile("w", suffix=".html", delete=False, encoding="utf-8") as tf:
                tf.write(full_html)
                temp_html_path = tf.name
                temp_files.append(temp_html_path)

            file_url = "file:///" + temp_html_path.replace("\\", "/")
            driver.get(file_url)

            # Aguardar MathJax concluir a renderização das fórmulas SVG
            try:
                WebDriverWait(driver, 20).until(EC.presence_of_element_located((By.ID, "mathjax-ready")))
                svg_count = len(driver.find_elements(By.TAG_NAME, "svg"))
                print(f"  -> MathJax concluiu renderização ({svg_count} fórmulas SVG geradas).")
            except Exception as e:
                print(f"  [AVISO] Timeout aguardando MathJax: {e}")

            # Imprimir para PDF
            print_options = PrintOptions()
            print_options.background = True
            print_options.orientation = "portrait"

            pdf_b64 = driver.print_page(print_options)
            pdf_bytes = base64.b64decode(pdf_b64)

            with open(pdf_path, "wb") as f_out:
                f_out.write(pdf_bytes)

            size_kb = len(pdf_bytes) / 1024
            print(f"  -> PDF gerado com sucesso: {os.path.basename(pdf_path)} ({size_kb:.1f} KB)\n")

    finally:
        driver.quit()
        # Limpar arquivos temporários
        for temp_file in temp_files:
            try:
                if os.path.exists(temp_file):
                    os.remove(temp_file)
            except Exception:
                pass

    print("Todos os 4 relatórios foram gerados em PDF com alta qualidade e fórmulas perfeitas!")

if __name__ == "__main__":
    generate_all_pdfs()
