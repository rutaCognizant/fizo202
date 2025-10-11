import prisma from '~/../lib/prisma';

import ExcelJS from 'exceljs';
import { calculatePoints, getTargetsForUser } from '~~/server/lib';
import { formatTime } from '~/utils';

import type { Prisma, Activity, User } from '@prisma/client';

export default defineEventHandler(async (event) => {
  const { startDate, endDate, includeAll } = await readBody(event);

  const activitiesFrom = new Date(startDate);
  const activitiesTo = new Date(endDate);
  activitiesTo.setHours(23, 59, 59, 999);

  const workbook = new ExcelJS.Workbook();

  const worksheet = workbook.addWorksheet('Report');

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
  setupSingleColumn('Q', 'Data', 15);

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

  const query: Prisma.ActivityFindManyArgs = {
    where: {
      AND: [{ createdAt: { gte: activitiesFrom } }, { createdAt: { lte: activitiesTo } }],
    },
    include: { user: true },
    orderBy: { createdAt: 'desc' },
  };

  if (!includeAll) {
    query.distinct = ['userId'];
  }

  const activities = (await prisma.activity.findMany(query)) as (Activity & { user: User })[];

  for (const activity of activities) {
    const user = activity.user;

    const targets = await getTargetsForUser(user);

    const { pushupPoints, crunchesPoints, runningPoints, totalPoints } = await calculatePoints(user, activity);

    const gender = user.gender === 'male' ? 'Vyras' : user.gender === 'female' ? 'Moteris' : '';

    const row = worksheet.addRow({
      name: user.name,
      age: user.age,
      gender,

      pushupsMin: targets.pushup60,
      pushupsMax: targets.pushup100,

      crunchesMin: targets.crunches60,
      crunchesMax: targets.crunches100,

      runningMin: formatTime(targets.running60),
      runningMax: formatTime(targets.running100),

      pushupsCount: activity.pushups,
      crunchesCount: activity.crunches,
      runningTime: formatTime(activity.running),

      pushupPoints,
      crunchesPoints,
      runningPoints,

      totalPoints,
      date: activity.createdAt.toISOString().split('T')[0],
    });

    row.eachCell({ includeEmpty: false }, (cell) => {
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };

      // if ('468'.includes(cell.col)) {
      //   cell.fill = bgColor;
      //   cell.border = { ...cell.border, left: { style: 'medium' } };
      // } else if ('579'.includes(cell.col)) {
      //   cell.fill = bgColor;
      //   cell.border = { ...cell.border, right: { style: 'medium' } };
      // }
    });

    // Color points cells red if below 60
    const red = { argb: 'FFFF0000' };

    // Get cells for points columns (K, M, O)
    const pushupPointsCell = row.getCell('K');
    const crunchesPointsCell = row.getCell('M');
    const runningPointsCell = row.getCell('O');

    if (pushupPoints < 60) pushupPointsCell.font = { color: red };
    if (crunchesPoints < 60) crunchesPointsCell.font = { color: red };
    if (runningPoints < 60) runningPointsCell.font = { color: red };
    if (totalPoints < 180) row.getCell('P').font = { color: red };
  }

  worksheet.getColumn('D').eachCell({ includeEmpty: false }, (cell) => {
    cell.fill = bgColor;
    cell.border = { ...cell.border, left: { style: 'medium' } };
  });
  worksheet.getColumn('E').eachCell({ includeEmpty: false }, (cell) => {
    cell.fill = bgColor;
    cell.border = { ...cell.border, right: { style: 'medium' } };
  });
  worksheet.getColumn('F').eachCell({ includeEmpty: false }, (cell) => {
    cell.fill = bgColor;
    cell.border = { ...cell.border, left: { style: 'medium' } };
  });
  worksheet.getColumn('G').eachCell({ includeEmpty: false }, (cell) => {
    cell.fill = bgColor;
    cell.border = { ...cell.border, right: { style: 'medium' } };
  });
  worksheet.getColumn('H').eachCell({ includeEmpty: false }, (cell) => {
    cell.fill = bgColor;
    cell.border = { ...cell.border, left: { style: 'medium' } };
  });
  worksheet.getColumn('I').eachCell({ includeEmpty: false }, (cell) => {
    cell.fill = bgColor;
    cell.border = { ...cell.border, right: { style: 'medium' } };
  });

  const buffer = await workbook.xlsx.writeBuffer();

  event.node.res.setHeader('Content-Disposition', 'attachment; filename="report.xlsx"');
  event.node.res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

  return buffer;
});
