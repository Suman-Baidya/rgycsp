#!/usr/bin/env python3
"""
ABCD Edu Hub — Franchise Admin Operational Guide Builder
Compiles modular Markdown chapters into a styled, professional Microsoft Word (.docx) document.
"""

import os
import re
import glob
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement
from docx.oxml.ns import qn

# Color Palette
COLOR_PRIMARY = RGBColor(30, 58, 138)      # Deep Navy #1E3A8A
COLOR_SECONDARY = RGBColor(15, 23, 42)    # Dark Slate #0F172A
COLOR_ACCENT = RGBColor(37, 99, 235)      # Royal Blue #2563EB
COLOR_TEXT = RGBColor(30, 41, 59)         # Slate text #1E293B
COLOR_MUTED = RGBColor(100, 116, 139)     # Slate muted #64748B
COLOR_BORDER = "CBD5E1"                   # Slate border #CBD5E1

def set_cell_background(cell, fill_hex):
    """Sets background color of a table cell."""
    tc_pr = cell._tc.get_or_add_tcPr()
    shd = OxmlElement('w:shd')
    shd.set(qn('w:val'), 'clear')
    shd.set(qn('w:color'), 'auto')
    shd.set(qn('w:fill'), fill_hex)
    tc_pr.append(shd)

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    """Sets inner padding for a table cell in dxa (1 pt = 20 dxa)."""
    tc_pr = cell._tc.get_or_add_tcPr()
    tc_mar = OxmlElement('w:tcMar')
    for m, val in [('top', top), ('bottom', bottom), ('left', left), ('right', right)]:
        node = OxmlElement(f'w:{m}')
        node.set(qn('w:w'), str(val))
        node.set(qn('w:type'), 'dxa')
        tc_mar.append(node)
    tc_pr.append(tc_mar)

def set_callout_border(cell, color_hex="3B82F6"):
    """Adds a thick colored left border to callout box cell."""
    tc_pr = cell._tc.get_or_add_tcPr()
    borders = OxmlElement('w:tcBorders')
    
    # Left border
    left = OxmlElement('w:left')
    left.set(qn('w:val'), 'single')
    left.set(qn('w:sz'), '24') # 3pt
    left.set(qn('w:space'), '0')
    left.set(qn('w:color'), color_hex)
    borders.append(left)

    # Top, bottom, right none
    for side in ['top', 'bottom', 'right']:
        node = OxmlElement(f'w:{side}')
        node.set(qn('w:val'), 'none')
        borders.append(node)
        
    tc_pr.append(borders)

def add_styled_paragraph(doc, text, style='Normal', space_after=6, space_before=0, line_spacing=1.15):
    p = doc.add_paragraph(style=style)
    p.paragraph_format.space_after = Pt(space_after)
    p.paragraph_format.space_before = Pt(space_before)
    p.paragraph_format.line_spacing = line_spacing
    
    # Parse inline markdown (bold & italic)
    parse_inline_formatting(p, text)
    return p

def parse_inline_formatting(paragraph, text):
    """Parses `**bold**`, `*italic*`, and ``code`` tokens into runs."""
    pattern = r'(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)'
    tokens = re.split(pattern, text)
    
    for token in tokens:
        if not token:
            continue
        if token.startswith('**') and token.endswith('**'):
            run = paragraph.add_run(token[2:-2])
            run.bold = True
            run.font.color.rgb = COLOR_SECONDARY
        elif token.startswith('*') and token.endswith('*'):
            run = paragraph.add_run(token[1:-1])
            run.italic = True
        elif token.startswith('`') and token.endswith('`'):
            run = paragraph.add_run(token[1:-1])
            run.font.name = 'Consolas'
            run.font.size = Pt(9.5)
            run.font.color.rgb = RGBColor(190, 24, 93)
        else:
            run = paragraph.add_run(token)
            run.font.color.rgb = COLOR_TEXT

def create_callout_box(doc, callout_type, content_lines):
    table = doc.add_table(rows=1, cols=1)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False
    
    cell = table.cell(0, 0)
    cell.width = Inches(6.5)
    
    # Theme settings based on alert type
    colors = {
        'NOTE': ('EFF6FF', '3B82F6', 'NOTE: Background & Architecture'),
        'TIP': ('F0FDF4', '10B981', 'PRO-TIP: Operational Best Practice'),
        'IMPORTANT': ('FEF2F2', 'EF4444', 'IMPORTANT: Critical System Behavior'),
        'WARNING': ('FFFBEB', 'F59E0B', 'WARNING: Administrative Caution'),
        'CAUTION': ('FFF1F2', 'E11D48', 'CAUTION: High-Risk Permission Action')
    }
    
    bg_hex, border_hex, header_title = colors.get(callout_type, ('F8FAFC', '64748B', 'INFORMATION'))
    
    set_cell_background(cell, bg_hex)
    set_cell_margins(cell, top=140, bottom=140, left=180, right=180)
    set_callout_border(cell, border_hex)
    
    # Header line
    hp = cell.paragraphs[0]
    hp.paragraph_format.space_before = Pt(2)
    hp.paragraph_format.space_after = Pt(4)
    hrun = hp.add_run(f"[{header_title}]")
    hrun.bold = True
    hrun.font.size = Pt(9.5)
    hrun.font.color.rgb = RGBColor(
        int(border_hex[0:2], 16),
        int(border_hex[2:4], 16),
        int(border_hex[4:6], 16)
    )
    
    # Content lines
    for line in content_lines:
        p = cell.add_paragraph()
        p.paragraph_format.space_after = Pt(3)
        p.paragraph_format.space_before = Pt(1)
        p.paragraph_format.line_spacing = 1.15
        parse_inline_formatting(p, line)
        
    doc.add_paragraph().paragraph_format.space_after = Pt(4)

def render_table(doc, table_rows):
    if not table_rows:
        return
        
    num_cols = len(table_rows[0])
    table = doc.add_table(rows=len(table_rows), cols=num_cols)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = True
    
    for row_idx, row_data in enumerate(table_rows):
        is_header = (row_idx == 0)
        row = table.rows[row_idx]
        
        for col_idx in range(min(num_cols, len(row_data))):
            cell = row.cells[col_idx]
            cell.vertical_alignment = WD_ALIGN_VERTICAL.CENTER
            set_cell_margins(cell, top=100, bottom=100, left=140, right=140)
            
            p = cell.paragraphs[0]
            p.paragraph_format.space_after = Pt(2)
            p.paragraph_format.space_before = Pt(2)
            
            text = row_data[col_idx].strip()
            parse_inline_formatting(p, text)
            
            if is_header:
                set_cell_background(cell, "1E3A8A")
                for run in p.runs:
                    run.bold = True
                    run.font.color.rgb = RGBColor(255, 255, 255)
                    run.font.size = Pt(9.5)
            else:
                bg = "F8FAFC" if row_idx % 2 == 1 else "FFFFFF"
                set_cell_background(cell, bg)
                for run in p.runs:
                    run.font.size = Pt(9.5)
                    
    doc.add_paragraph().paragraph_format.space_after = Pt(6)

def build_cover_page(doc):
    # Top spacing
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(60)
    
    # Institution Badge
    p_badge = doc.add_paragraph()
    r_badge = p_badge.add_run("ABCD EDU HUB — MULTI-TENANT EDUCATIONAL PLATFORM")
    r_badge.font.size = Pt(11)
    r_badge.bold = True
    r_badge.font.color.rgb = COLOR_ACCENT
    p_badge.paragraph_format.space_after = Pt(18)
    
    # Title
    p_title = doc.add_paragraph()
    r_title = p_title.add_run("Franchise Administrator\nOperational Guidebook")
    r_title.font.size = Pt(32)
    r_title.bold = True
    r_title.font.color.rgb = COLOR_PRIMARY
    p_title.paragraph_format.space_after = Pt(14)
    p_title.paragraph_format.line_spacing = 1.1
    
    # Subtitle
    p_sub = doc.add_paragraph()
    r_sub = p_sub.add_run("The Comprehensive, Step-by-Step Manual for Franchise Owners, Center Directors, and Branch Coordinators")
    r_sub.font.size = Pt(14)
    r_sub.font.color.rgb = COLOR_MUTED
    p_sub.paragraph_format.space_after = Pt(40)
    
    # Feature Highlights Callout Box
    table = doc.add_table(rows=1, cols=1)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    cell = table.cell(0, 0)
    cell.width = Inches(6.5)
    set_cell_background(cell, "F1F5F9")
    set_cell_margins(cell, top=160, bottom=160, left=180, right=180)
    set_callout_border(cell, "1E3A8A")
    
    cp = cell.paragraphs[0]
    cprun = cp.add_run("CORE OPERATIONAL MODULES COVERED IN THIS VOLUME:")
    cprun.bold = True
    cprun.font.size = Pt(10)
    cprun.font.color.rgb = COLOR_PRIMARY
    cp.paragraph_format.space_after = Pt(8)
    
    modules = [
        "Dynamic Course Pricing & Itemized Fee Breakdown Configuration",
        "Online Admission Form Settings, Custom Dynamic Fields & Document Upload Rules",
        "Admissions Application Review, Verification, and One-Click Enrollment",
        "Student Directory, Admission Date Modifications & Auto Registration Recalculations",
        "Official PVC ID Card & Accreditation Certificate Issuance with QR Codes",
        "Fees Management, Offline Cash Receipts & Online Student UPI Slip Verification",
        "Daily Batch Attendance Register & Monthly Percentage Monitoring",
        "Exam Zone & Professional Test Paper Generation",
        "Staff Roles & Granular Permission Checkbox Delegation",
        "Public Website Customization (Hero Banners, Notice Board & Photo Gallery)",
        "Internal Token Economy, Wallet Balances & Super Admin Top-Up Verification"
    ]
    for m in modules:
        p_item = cell.add_paragraph()
        p_item.paragraph_format.space_after = Pt(3)
        p_item.paragraph_format.space_before = Pt(1)
        r_bullet = p_item.add_run("• ")
        r_bullet.bold = True
        r_bullet.font.color.rgb = COLOR_ACCENT
        r_txt = p_item.add_run(m)
        r_txt.font.size = Pt(9.5)
        r_txt.font.color.rgb = COLOR_TEXT
        
    doc.add_paragraph().paragraph_format.space_after = Pt(40)
    
    # Metadata Footer Table
    meta_table = doc.add_table(rows=2, cols=2)
    meta_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    meta_table.rows[0].cells[0].paragraphs[0].add_run("Document Version: 2.4 (Enterprise Edition)").font.size = Pt(9)
    meta_table.rows[0].cells[1].paragraphs[0].add_run("Release Date: Academic Year 2026-2027").font.size = Pt(9)
    meta_table.rows[1].cells[0].paragraphs[0].add_run("Target Audience: Franchise Owners & Staff").font.size = Pt(9)
    meta_table.rows[1].cells[1].paragraphs[0].add_run("Classification: Authorized Operations Manual").font.size = Pt(9)
    
    doc.add_page_break()

def parse_markdown_chapter(doc, file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
        
    in_table = False
    table_rows = []
    in_callout = False
    callout_type = ""
    callout_lines = []
    
    for line in lines:
        raw_line = line.rstrip('\r\n')
        stripped = raw_line.strip()
        
        # Flush Callout Box if block ends
        if in_callout:
            if stripped.startswith('>') and not stripped.startswith('> [!'):
                callout_lines.append(stripped[1:].strip())
                continue
            else:
                create_callout_box(doc, callout_type, callout_lines)
                in_callout = False
                callout_lines = []
                callout_type = ""
                
        # Flush Table if table ends
        if in_table:
            if stripped.startswith('|') and stripped.endswith('|'):
                parts = [p.strip() for p in stripped[1:-1].split('|')]
                # Check for separator row | --- | --- |
                if not all(set(p) <= {'-', ':', ' '} for p in parts if p):
                    table_rows.append(parts)
                continue
            else:
                render_table(doc, table_rows)
                in_table = False
                table_rows = []
                
        # Empty line
        if not stripped:
            continue
            
        # Callout start (> [!NOTE])
        match_callout = re.match(r'^>\s*\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]', stripped)
        if match_callout:
            in_callout = True
            callout_type = match_callout.group(1)
            callout_lines = []
            continue
            
        # Table start
        if stripped.startswith('|') and stripped.endswith('|'):
            in_table = True
            table_rows = []
            parts = [p.strip() for p in stripped[1:-1].split('|')]
            table_rows.append(parts)
            continue
            
        # Headings
        if stripped.startswith('# '):
            p = doc.add_paragraph()
            p.paragraph_format.space_before = Pt(18)
            p.paragraph_format.space_after = Pt(8)
            run = p.add_run(stripped[2:])
            run.font.size = Pt(20)
            run.bold = True
            run.font.color.rgb = COLOR_PRIMARY
            continue
        elif stripped.startswith('## '):
            p = doc.add_paragraph()
            p.paragraph_format.space_before = Pt(16)
            p.paragraph_format.space_after = Pt(6)
            run = p.add_run(stripped[3:])
            run.font.size = Pt(16)
            run.bold = True
            run.font.color.rgb = COLOR_PRIMARY
            continue
        elif stripped.startswith('### '):
            p = doc.add_paragraph()
            p.paragraph_format.space_before = Pt(12)
            p.paragraph_format.space_after = Pt(4)
            run = p.add_run(stripped[4:])
            run.font.size = Pt(13)
            run.bold = True
            run.font.color.rgb = COLOR_ACCENT
            continue
        elif stripped.startswith('#### '):
            p = doc.add_paragraph()
            p.paragraph_format.space_before = Pt(10)
            p.paragraph_format.space_after = Pt(3)
            run = p.add_run(stripped[5:])
            run.font.size = Pt(11)
            run.bold = True
            run.font.color.rgb = COLOR_SECONDARY
            continue
            
        # Horizontal Rule
        if stripped in ['---', '***', '___']:
            doc.add_paragraph().paragraph_format.space_after = Pt(6)
            continue
            
        # Bullet list
        if stripped.startswith('- ') or stripped.startswith('* '):
            p = doc.add_paragraph(style='List Bullet')
            p.paragraph_format.space_after = Pt(3)
            p.paragraph_format.space_before = Pt(1)
            p.paragraph_format.line_spacing = 1.15
            parse_inline_formatting(p, stripped[2:])
            continue
            
        # Numbered list
        match_num = re.match(r'^(\d+)\.\s+(.*)$', stripped)
        if match_num:
            num = match_num.group(1)
            text = match_num.group(2)
            p = doc.add_paragraph(style='List Number')
            p.paragraph_format.space_after = Pt(3)
            p.paragraph_format.space_before = Pt(1)
            p.paragraph_format.line_spacing = 1.15
            parse_inline_formatting(p, text)
            continue
            
        # Standard Paragraph
        add_styled_paragraph(doc, stripped, space_after=6, line_spacing=1.15)
        
    # Flush remaining callout or table if at end of file
    if in_callout:
        create_callout_box(doc, callout_type, callout_lines)
    if in_table:
        render_table(doc, table_rows)
        
    # Add page break after each major chapter
    doc.add_page_break()

def main():
    print("Initializing ABCD Edu Hub Franchise Guide Document Generator...")
    doc = Document()
    
    # Configure Standard Page Layout (A4, 1-inch margins)
    section = doc.sections[0]
    section.page_width = Inches(8.5)
    section.page_height = Inches(11.0)
    section.top_margin = Inches(1.0)
    section.bottom_margin = Inches(1.0)
    section.left_margin = Inches(1.0)
    section.right_margin = Inches(1.0)
    
    # Setup Header & Footer
    header = section.header
    hp = header.paragraphs[0]
    hp.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    hrun = hp.add_run("ABCD Edu Hub — Franchise Administrator Operational Guide")
    hrun.font.size = Pt(8.5)
    hrun.font.color.rgb = COLOR_MUTED
    
    footer = section.footer
    fp = footer.paragraphs[0]
    fp.alignment = WD_ALIGN_PARAGRAPH.CENTER
    frun = fp.add_run("Confidential & Proprietary — For Authorized Franchise Centers Only")
    frun.font.size = Pt(8.5)
    frun.font.color.rgb = COLOR_MUTED
    
    # Configure Default Style
    style_normal = doc.styles['Normal']
    style_normal.font.name = 'Calibri'
    style_normal.font.size = Pt(10.5)
    style_normal.font.color.rgb = COLOR_TEXT
    
    # 1. Build Cover Page
    print("Generating Cover Page...")
    build_cover_page(doc)
    
    # 2. Iterate through markdown chapters in order
    chapters_dir = os.path.join(os.path.dirname(__file__), '..', 'docs', 'user-guides', 'franchise-admin')
    chapter_files = sorted(glob.glob(os.path.join(chapters_dir, '*.md')))
    
    if not chapter_files:
        print(f"Error: No chapter files found in {chapters_dir}")
        return 1
        
    print(f"Found {len(chapter_files)} chapters to compile:")
    for cf in chapter_files:
        base = os.path.basename(cf)
        print(f" -> Compiling {base}...")
        parse_markdown_chapter(doc, cf)
        
    output_dir = os.path.join(os.path.dirname(__file__), '..', 'docs', 'manuals')
    os.makedirs(output_dir, exist_ok=True)
    output_path = os.path.join(output_dir, 'ABCD_Edu_Hub_Franchise_Admin_Guide.docx')
    alt_path = output_path.replace('.docx', '_new.docx')
    if os.path.exists(alt_path):
        try:
            os.remove(alt_path)
        except OSError:
            pass
    try:
        doc.save(output_path)
        print(f"SUCCESS: Saved to {output_path}")
    except PermissionError:
        doc.save(alt_path)
        print(f"NOTE: {os.path.basename(output_path)} is currently open in Microsoft Word. Saved as: {os.path.basename(alt_path)}")
    return 0

if __name__ == '__main__':
    exit(main())
