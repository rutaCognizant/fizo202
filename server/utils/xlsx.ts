import ExcelJS from 'exceljs';

export async function buildWorkbookFromRows(rows: Record<string, string | number>[], sheetName = 'Report') {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(sheetName);

  const setupSingleColumn = (col: string, title: string, width: number) => {
    worksheet.mergeCells(`${col}1:${col}2`);
    worksheet.getCell(`${col}1`).value = title;
    worksheet.getColumn(col).width = width;
  };

  const setupDoubleColumn = (
    col1: string,
    col2: string,
    title: string,
    subtitle1: string,
    subtitle2: string,
    width: number
  ) => {
    worksheet.mergeCells(`${col1}1:${col2}1`);
    worksheet.getCell(`${col1}1`).value = title;
    worksheet.getCell(`${col1}2`).value = subtitle1;
    worksheet.getCell(`${col2}2`).value = subtitle2;
    worksheet.getColumn(col1).width = width;
    worksheet.getColumn(col2).width = width;
  };

  worksheet.columns = [
    { key: 'name' },
    { key: 'age' },
    { key: 'gender' },

    { key: 'pushupsMin' },
    { key: 'pushupsMax' },
    { key: 'crunchesMin' },
    { key: 'crunchesMax' },
    { key: 'runningMin' },
    { key: 'runningMax' },

    { key: 'pushupsCount' },
    { key: 'pushupPoints' },
    { key: 'crunchesCount' },
    { key: 'crunchesPoints' },
    { key: 'runningTime' },
    { key: 'runningPoints' },

    { key: 'totalPoints' },
    { key: 'date' },
  ];

  // Setup single columns
  setupSingleColumn('A', 'Šaukinys', 20);
  setupSingleColumn('B', 'Amžius', 10);
  setupSingleColumn('C', 'Lytis', 10);
  setupSingleColumn('P', 'Iš viso balų', 15);
  setupSingleColumn('Q', 'Data', 20);

  // Setup min/max columns
  setupDoubleColumn('D', 'E', 'Atsispaudimai', 'min', 'max', 10);
  setupDoubleColumn('F', 'G', 'Susilenkimai', 'min', 'max', 10);
  setupDoubleColumn('H', 'I', 'Bėgimas', 'min', 'max', 10);

  // Setup count/points columns
  setupDoubleColumn('J', 'K', 'Atsispaudimai', 'Kartai', 'Balai', 10);
  setupDoubleColumn('L', 'M', 'Susilenkimai', 'Kartai', 'Balai', 10);
  setupDoubleColumn('N', 'O', 'Bėgimas', 'Laikas', 'Balai', 10);

  const bgColor = { type: 'pattern' as const, pattern: 'solid' as const, fgColor: { argb: 'FFEAF1DD' } };

  worksheet.getRow(1).alignment = { horizontal: 'center', vertical: 'middle' };
  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).eachCell({ includeEmpty: false }, (cell) => {
    cell.fill = bgColor;
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    };
  });

  worksheet.getRow(2).alignment = { horizontal: 'center', vertical: 'middle' };
  worksheet.getRow(2).font = { bold: true };
  worksheet.getRow(2).eachCell({ includeEmpty: false }, (cell) => {
    cell.fill = bgColor;
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    };
  });

  // Add rows
  for (const r of rows) {
    const row = worksheet.addRow(r);
    row.eachCell({ includeEmpty: false }, (cell) => {
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    });

    const red = { argb: 'FFFF0000' };
    if (r.pushupPoints !== undefined && Number(r.pushupPoints) < 60) row.getCell('K').font = { color: red };
    if (r.crunchesPoints !== undefined && Number(r.crunchesPoints) < 60) row.getCell('M').font = { color: red };
    if (r.runningPoints !== undefined && Number(r.runningPoints) < 60) row.getCell('O').font = { color: red };
    if (r.totalPoints !== undefined && Number(r.totalPoints) < 180) row.getCell('P').font = { color: red };
  }

  // Color header group columns
  ['D', 'E', 'F', 'G', 'H', 'I'].forEach((col) => {
    worksheet.getColumn(col).eachCell({ includeEmpty: false }, (cell) => {
      cell.fill = bgColor;
      cell.border = { ...cell.border, left: { style: 'medium' } };
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();
  return buffer;
}

export default buildWorkbookFromRows;
