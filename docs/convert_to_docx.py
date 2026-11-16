import os
import re
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import parse_xml, OxmlElement
from docx.oxml.ns import nsdecls, qn

def set_cell_background(cell, hex_color):
    """Define a cor de fundo de uma célula da tabela."""
    tcPr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{hex_color}"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    """Define margens internas de uma célula."""
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = parse_xml(f'<w:tcMar {nsdecls("w")}><w:top w:w="{top}" w:type="dxa"/><w:bottom w:w="{bottom}" w:type="dxa"/><w:left w:w="{left}" w:type="dxa"/><w:right w:w="{right}" w:type="dxa"/></w:tcMar>')
    tcPr.append(tcMar)

def latex_to_unicode(text):
    """Converte comandos comuns de LaTeX em símbolos legíveis Unicode."""
    replacements = [
        (r'\\sqcap', ' ⊓ '),
        (r'\\sqcup', ' ⊔ '),
        (r'\\equiv', ' ≡ '),
        (r'\\ge', ' ≥ '),
        (r'\\le', ' ≤ '),
        (r'\\neg', ' ¬'),
        (r'\\to', ' → '),
        (r'\\rightarrow', ' → '),
        (r'\\land', ' ∧ '),
        (r'\\lor', ' ∨ '),
        (r'\\exists', ' ∃'),
        (r'\\forall', ' ∀'),
        (r'\\sqsupseteq', ' ⊒ '),
        (r'\\sqsubseteq', ' ⊑ '),
        (r'\\circ', ' ∘ '),
        (r'\\times', ' × '),
        (r'\\mathcal\{SROIQ\}\^\{\(D\)\}', 'SROIQ(D)'),
        (r'\\mathcal\{ALCOIN\}\(D\)', 'ALCOIN(D)'),
        (r'\\mathcal\{([A-Za-z]+)\}', r'\1'),
        (r'\\text\{([^}]+)\}', r'\1'),
        (r'\\begin\{aligned\}', ''),
        (r'\\end\{aligned\}', ''),
        (r'\\\\', '\n'),
        (r'\\;', ' '),
        (r'\\,', ' '),
        (r'\$', ''),
    ]
    res = text
    for pattern, repl in replacements:
        res = re.sub(pattern, repl, res)
    return res

def add_formatted_runs(paragraph, text, base_font_size=Pt(10.5), is_italic=False, is_bold=False, font_name="Calibri", font_color=RGBColor(51, 51, 51)):
    """Adiciona texto ao parágrafo interpretando **negrito**, *itálico*, `código` e convertendo fórmulas LaTeX."""
    text = latex_to_unicode(text)
    # Expressão regular para tokens: **bold**, *italic*, `code`, ou texto normal
    token_pattern = re.compile(r'(\*\*.*?\*\*|\*.*?\*|`.*?`|[^\*`]+)')
    tokens = token_pattern.findall(text)

    for token in tokens:
        if token.startswith('**') and token.endswith('**'):
            inner = token[2:-2]
            run = paragraph.add_run(inner)
            run.bold = True
            run.italic = is_italic
        elif token.startswith('*') and token.endswith('*'):
            inner = token[1:-1]
            run = paragraph.add_run(inner)
            run.bold = is_bold
            run.italic = True
        elif token.startswith('`') and token.endswith('`'):
            inner = token[1:-1]
            run = paragraph.add_run(inner)
            run.font.name = "Consolas"
            run.font.size = Pt(9.5)
            run.font.color.rgb = RGBColor(180, 40, 40)
            continue
        else:
            run = paragraph.add_run(token)
            run.bold = is_bold
            run.italic = is_italic

        run.font.name = font_name
        run.font.size = base_font_size
        run.font.color.rgb = font_color

def convert_md_to_docx(md_path, docx_path):
    print(f"Convertendo: {md_path} -> {docx_path}")
    with open(md_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    doc = Document()

    # Configuração de Margens (A4 / 2.5 cm)
    for section in doc.sections:
        section.top_margin = Inches(1.0)
        section.bottom_margin = Inches(1.0)
        section.left_margin = Inches(1.0)
        section.right_margin = Inches(1.0)
        section.page_width = Inches(8.27)
        section.page_height = Inches(11.69)

    i = 0
    in_code_block = False
    code_block_lines = []

    while i < len(lines):
        line = lines[i].rstrip('\r\n')

        # Bloco de Código (```)
        if line.startswith('```'):
            if not in_code_block:
                in_code_block = True
                code_block_lines = []
            else:
                in_code_block = False
                # Criar tabela de código com fundo cinza
                code_text = '\n'.join(code_block_lines)
                table = doc.add_table(rows=1, cols=1)
                table.alignment = WD_TABLE_ALIGNMENT.CENTER
                cell = table.cell(0, 0)
                set_cell_background(cell, "F1F5F9")
                set_cell_margins(cell, top=120, bottom=120, left=180, right=180)
                cp = cell.paragraphs[0]
                cp.paragraph_format.space_before = Pt(2)
                cp.paragraph_format.space_after = Pt(2)
                crun = cp.add_run(code_text)
                crun.font.name = "Consolas"
                crun.font.size = Pt(9)
                crun.font.color.rgb = RGBColor(30, 41, 59)
                p_spacer = doc.add_paragraph()
                p_spacer.paragraph_format.space_after = Pt(4)
            i += 1
            continue

        if in_code_block:
            code_block_lines.append(line)
            i += 1
            continue

        # Linha em branco
        if not line.strip():
            i += 1
            continue

        # Linha horizontal (---)
        if line.strip() in ['---', '***', '___']:
            p = doc.add_paragraph()
            p.paragraph_format.space_before = Pt(6)
            p.paragraph_format.space_after = Pt(6)
            p_border = p.add_run("________________________________________________________________________________")
            p_border.font.color.rgb = RGBColor(203, 213, 225)
            p_border.font.size = Pt(7)
            i += 1
            continue

        # Cabeçalho 1 (# Título)
        if line.startswith('# '):
            text = line[2:].strip()
            p = doc.add_paragraph()
            p.paragraph_format.space_before = Pt(14)
            p.paragraph_format.space_after = Pt(8)
            add_formatted_runs(p, text, base_font_size=Pt(18), is_bold=True, font_name="Calibri", font_color=RGBColor(15, 23, 42))
            i += 1
            continue

        # Cabeçalho 2 (## Subtítulo)
        if line.startswith('## '):
            text = line[3:].strip()
            p = doc.add_paragraph()
            p.paragraph_format.space_before = Pt(12)
            p.paragraph_format.space_after = Pt(6)
            add_formatted_runs(p, text, base_font_size=Pt(14), is_bold=True, font_name="Calibri", font_color=RGBColor(30, 58, 138))
            i += 1
            continue

        # Cabeçalho 3 (### Seção)
        if line.startswith('### '):
            text = line[4:].strip()
            p = doc.add_paragraph()
            p.paragraph_format.space_before = Pt(10)
            p.paragraph_format.space_after = Pt(4)
            add_formatted_runs(p, text, base_font_size=Pt(12), is_bold=True, font_name="Calibri", font_color=RGBColor(51, 65, 85))
            i += 1
            continue

        # Cabeçalho 4 (#### Subseção)
        if line.startswith('#### '):
            text = line[5:].strip()
            p = doc.add_paragraph()
            p.paragraph_format.space_before = Pt(8)
            p.paragraph_format.space_after = Pt(2)
            add_formatted_runs(p, text, base_font_size=Pt(11), is_bold=True, font_name="Calibri", font_color=RGBColor(71, 85, 105))
            i += 1
            continue

        # Citação / Callout (> )
        if line.startswith('> '):
            text = line[2:].strip()
            table = doc.add_table(rows=1, cols=1)
            table.alignment = WD_TABLE_ALIGNMENT.CENTER
            cell = table.cell(0, 0)
            set_cell_background(cell, "F8FAFC")
            set_cell_margins(cell, top=80, bottom=80, left=160, right=140)
            cp = cell.paragraphs[0]
            cp.paragraph_format.space_before = Pt(2)
            cp.paragraph_format.space_after = Pt(2)
            add_formatted_runs(cp, text, base_font_size=Pt(10), is_italic=True, font_name="Calibri", font_color=RGBColor(71, 85, 105))
            i += 1
            continue

        # Tabela Markdown (| col1 | col2 |)
        if line.strip().startswith('|') and '|' in line[1:]:
            table_lines = []
            while i < len(lines) and lines[i].strip().startswith('|'):
                table_lines.append(lines[i].strip())
                i += 1

            if len(table_lines) >= 2:
                # Separar cabeçalho, divisor e linhas de dados
                header_line = table_lines[0]
                headers = [c.strip() for c in header_line.split('|')[1:-1]]
                data_rows = []
                for row_idx in range(1, len(table_lines)):
                    r_line = table_lines[row_idx]
                    # Pular divisor | :--- | :--- |
                    if re.match(r'^\|(\s*:?-+:?\s*\|)+$', r_line):
                        continue
                    cols = [c.strip() for c in r_line.split('|')[1:-1]]
                    data_rows.append(cols)

                table = doc.add_table(rows=len(data_rows) + 1, cols=len(headers))
                table.alignment = WD_TABLE_ALIGNMENT.CENTER
                table.autofit = True

                # Formatar Cabeçalho da Tabela
                for col_idx, h_text in enumerate(headers):
                    cell = table.cell(0, col_idx)
                    set_cell_background(cell, "E2E8F0")
                    set_cell_margins(cell, top=100, bottom=100, left=120, right=120)
                    p = cell.paragraphs[0]
                    p.paragraph_format.space_before = Pt(2)
                    p.paragraph_format.space_after = Pt(2)
                    add_formatted_runs(p, h_text, base_font_size=Pt(9.5), is_bold=True, font_name="Calibri", font_color=RGBColor(15, 23, 42))

                # Formatar Linhas de Dados
                for row_idx, row_data in enumerate(data_rows):
                    bg_color = "F8FAFC" if row_idx % 2 == 1 else "FFFFFF"
                    for col_idx in range(len(headers)):
                        cell = table.cell(row_idx + 1, col_idx)
                        set_cell_background(cell, bg_color)
                        set_cell_margins(cell, top=80, bottom=80, left=120, right=120)
                        p = cell.paragraphs[0]
                        p.paragraph_format.space_before = Pt(2)
                        p.paragraph_format.space_after = Pt(2)
                        val = row_data[col_idx] if col_idx < len(row_data) else ""
                        add_formatted_runs(p, val, base_font_size=Pt(9), font_name="Calibri", font_color=RGBColor(51, 51, 51))

                doc.add_paragraph().paragraph_format.space_after = Pt(4)
            continue

        # Item de Lista com marcador (- ou *)
        if line.strip().startswith('- ') or line.strip().startswith('* '):
            text = line.strip()[2:].strip()
            p = doc.add_paragraph(style='List Bullet')
            p.paragraph_format.space_before = Pt(1)
            p.paragraph_format.space_after = Pt(2)
            add_formatted_runs(p, text, base_font_size=Pt(10.5), font_name="Calibri", font_color=RGBColor(51, 51, 51))
            i += 1
            continue

        # Item de Lista Numerada (1. )
        if re.match(r'^\d+\.\s', line.strip()):
            text = re.sub(r'^\d+\.\s', '', line.strip())
            p = doc.add_paragraph(style='List Number')
            p.paragraph_format.space_before = Pt(1)
            p.paragraph_format.space_after = Pt(2)
            add_formatted_runs(p, text, base_font_size=Pt(10.5), font_name="Calibri", font_color=RGBColor(51, 51, 51))
            i += 1
            continue

        # Parágrafo Normal de Texto
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(2)
        p.paragraph_format.space_after = Pt(5)
        p.paragraph_format.line_spacing = 1.15
        p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        add_formatted_runs(p, line, base_font_size=Pt(10.5), font_name="Calibri", font_color=RGBColor(51, 51, 51))
        i += 1

    try:
        doc.save(docx_path)
        print(f"Salvo com sucesso: {docx_path}")
    except PermissionError:
        print(f"[AVISO] Não foi possível salvar {docx_path} porque o arquivo está aberto no Word pelo usuário.")

if __name__ == '__main__':
    docs_dir = os.path.dirname(os.path.abspath(__file__))
    files = [
        "1_Relatorio_Tecnico_Ontologia_WER",
        "2_Relatorio_Tecnico_Arquitetura_ADL_ACME",
        "3_Documento_Requisitos_Ferramenta",
        "4_Artigo_Completo_Unificado_WerOntoView"
    ]

    for name in files:
        md_file = os.path.join(docs_dir, f"{name}.md")
        docx_file = os.path.join(docs_dir, f"{name}.docx")
        if os.path.exists(md_file):
            convert_md_to_docx(md_file, docx_file)
        else:
            print(f"Arquivo não encontrado: {md_file}")
