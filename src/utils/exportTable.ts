import { createZip } from './miniZip';

export interface ExportColumn {
  label: string;
  /** Valor já pronto para exportação. Números saem como número na planilha. */
  values: (string | number | null | undefined)[];
}

const XLSX_MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

const escapeXml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
    // Caracteres de controle não são permitidos em XML
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '');

/** Evita que planilhas interpretem o conteúdo como fórmula. */
const neutralizeFormula = (value: string): string =>
  /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;

const columnLetter = (index: number): string => {
  let rest = index;
  let letters = '';
  while (rest >= 0) {
    letters = String.fromCharCode((rest % 26) + 65) + letters;
    rest = Math.floor(rest / 26) - 1;
  }
  return letters;
};

const triggerDownload = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const buildCsv = (columns: ExportColumn[], separator = ';'): string => {
  const escapeCell = (value: string | number | null | undefined): string => {
    if (value === null || value === undefined) return '';
    const text = neutralizeFormula(String(value));
    return `"${text.replace(/"/g, '""')}"`;
  };

  const totalRows = columns.reduce((max, column) => Math.max(max, column.values.length), 0);
  const lines = [columns.map((column) => escapeCell(column.label)).join(separator)];

  for (let row = 0; row < totalRows; row += 1) {
    lines.push(columns.map((column) => escapeCell(column.values[row])).join(separator));
  }

  return lines.join('\r\n');
};

export const exportToCsv = (filename: string, columns: ExportColumn[]): void => {
  // BOM para o Excel reconhecer UTF-8 e ";" como separador no padrão pt-BR
  const blob = new Blob([`\uFEFF${buildCsv(columns)}`], { type: 'text/csv;charset=utf-8;' });
  triggerDownload(blob, `${filename}.csv`);
};

export const buildXlsxParts = (columns: ExportColumn[], sheetName = 'Dados') => {
  const totalRows = columns.reduce((max, column) => Math.max(max, column.values.length), 0);

  const cell = (
    columnIndex: number,
    rowNumber: number,
    value: string | number | null | undefined,
    header = false,
  ): string => {
    const reference = `${columnLetter(columnIndex)}${rowNumber}`;
    const style = header ? ' s="1"' : '';
    if (value === null || value === undefined || value === '') {
      return `<c r="${reference}"${style}/>`;
    }
    if (typeof value === 'number' && Number.isFinite(value)) {
      return `<c r="${reference}"${style}><v>${value}</v></c>`;
    }
    const text = escapeXml(String(value));
    return `<c r="${reference}"${style} t="inlineStr"><is><t xml:space="preserve">${text}</t></is></c>`;
  };

  const rows: string[] = [
    `<row r="1">${columns.map((column, index) => cell(index, 1, column.label, true)).join('')}</row>`,
  ];
  for (let row = 0; row < totalRows; row += 1) {
    const rowNumber = row + 2;
    rows.push(
      `<row r="${rowNumber}">${columns
        .map((column, index) => cell(index, rowNumber, column.values[row]))
        .join('')}</row>`,
    );
  }

  const widths = columns
    .map((column, index) => {
      const longest = column.values.reduce<number>(
        (max, value) => Math.max(max, String(value ?? '').length),
        column.label.length,
      );
      return `<col min="${index + 1}" max="${index + 1}" width="${Math.min(Math.max(longest + 4, 12), 48)}" customWidth="1"/>`;
    })
    .join('');

  return [
    {
      name: '[Content_Types].xml',
      content:
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
        '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
        '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' +
        '<Default Extension="xml" ContentType="application/xml"/>' +
        '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>' +
        '<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>' +
        '<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>' +
        '</Types>',
    },
    {
      name: '_rels/.rels',
      content:
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
        '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
        '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>' +
        '</Relationships>',
    },
    {
      name: 'xl/workbook.xml',
      content:
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
        '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" ' +
        'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">' +
        `<sheets><sheet name="${escapeXml(sheetName).slice(0, 31)}" sheetId="1" r:id="rId1"/></sheets>` +
        '</workbook>',
    },
    {
      name: 'xl/_rels/workbook.xml.rels',
      content:
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
        '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
        '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>' +
        '<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>' +
        '</Relationships>',
    },
    {
      name: 'xl/styles.xml',
      content:
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
        '<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">' +
        '<fonts count="2"><font><sz val="11"/><name val="Calibri"/></font>' +
        '<font><b/><sz val="11"/><name val="Calibri"/></font></fonts>' +
        '<fills count="2"><fill><patternFill patternType="none"/></fill>' +
        '<fill><patternFill patternType="gray125"/></fill></fills>' +
        '<borders count="1"><border/></borders>' +
        '<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>' +
        '<cellXfs count="2"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>' +
        '<xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/></cellXfs>' +
        '</styleSheet>',
    },
    {
      name: 'xl/worksheets/sheet1.xml',
      content:
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
        '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">' +
        `<cols>${widths}</cols>` +
        `<sheetData>${rows.join('')}</sheetData>` +
        '</worksheet>',
    },
  ];
};

export const exportToXlsx = (filename: string, columns: ExportColumn[], sheetName = 'Dados'): void => {
  triggerDownload(createZip(buildXlsxParts(columns, sheetName), XLSX_MIME), `${filename}.xlsx`);
};
