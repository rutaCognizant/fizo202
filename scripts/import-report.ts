import 'dotenv/config';

import ExcelJS from 'exceljs';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '../prisma/generated/client';

const prisma = new PrismaClient({
  adapter: new PrismaMariaDb({
    host: process.env.DATABASE_HOST || 'localhost',
    port: Number(process.env.DATABASE_PORT || 3306),
    user: process.env.DATABASE_USER || 'root',
    password: process.env.DATABASE_PASS || '',
    database: process.env.DATABASE_NAME || 'fizo202',
    connectionLimit: 5,
  }),
});

type ReportRow = {
  name: string;
  age: number;
  gender: string;
  pushups: number;
  crunches: number;
  running: number;
  createdAt: Date;
};

function getArgValue(flag: string) {
  const index = process.argv.indexOf(flag);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function resolveInputFile() {
  const positional = process.argv.slice(2).find((arg) => !arg.startsWith('-'));
  const named = getArgValue('--file') ?? getArgValue('-f');
  const inputFile = named ?? positional;

  if (!inputFile) {
    throw new Error('Usage: tsx scripts/import-report.ts <report.xlsx>');
  }

  return inputFile;
}

function normalizeGender(value: unknown) {
  const gender = String(value ?? '')
    .trim()
    .toLowerCase();

  if (!gender) return '';
  if (gender.startsWith('v')) return 'male';
  if (gender.startsWith('m')) return 'female';

  return gender;
}

function parseNumber(value: unknown) {
  if (typeof value === 'number') return value;
  if (value instanceof Date) return value.getTime();

  const parsed = Number(
    String(value ?? '')
      .replace(',', '.')
      .trim()
  );
  return Number.isFinite(parsed) ? parsed : NaN;
}

function parseRunningTime(value: unknown) {
  if (typeof value === 'number') return value;

  const text = String(value ?? '').trim();
  if (!text || text === '-') return 0;

  const parts = text.split(':').map((part) => Number(part));

  if (parts.some((part) => Number.isNaN(part))) {
    throw new Error(`Invalid running time: ${text}`);
  }

  if (parts.length === 2) {
    const [minutes, seconds] = parts;
    return minutes * 60 + seconds;
  }

  if (parts.length === 3) {
    const [hours, minutes, seconds] = parts;
    return hours * 3600 + minutes * 60 + seconds;
  }

  throw new Error(`Unsupported running time format: ${text}`);
}

function parseDate(value: unknown) {
  if (value instanceof Date) return value;
  if (typeof value === 'number') {
    const excelEpochOffset = 25569;
    const millisecondsPerDay = 24 * 60 * 60 * 1000;
    return new Date((value - excelEpochOffset) * millisecondsPerDay);
  }

  const text = String(value ?? '').trim();
  const parsed = new Date(text);

  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`Invalid date value: ${text}`);
  }

  return parsed;
}

function parseReportRows(sheet: ExcelJS.Worksheet) {
  const rows: ReportRow[] = [];

  sheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    if (rowNumber <= 2) return;

    const name = String(row.getCell(1).text ?? row.getCell(1).value ?? '').trim();
    if (!name) return;

    const age = parseNumber(row.getCell(2).value);
    const gender = normalizeGender(row.getCell(3).value);
    const pushups = parseNumber(row.getCell(10).value);
    const crunches = parseNumber(row.getCell(12).value);
    const running = parseRunningTime(row.getCell(14).value);
    const createdAt = parseDate(row.getCell(17).value);

    if ([age, pushups, crunches].some((value) => Number.isNaN(value))) {
      throw new Error(`Invalid numeric values in row ${rowNumber}`);
    }

    rows.push({
      name,
      age,
      gender,
      pushups,
      crunches,
      running,
      createdAt,
    });
  });

  return rows;
}

async function importReport(filePath: string) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);

  const sheet = workbook.getWorksheet('Report') ?? workbook.worksheets[0];
  if (!sheet) {
    throw new Error('No worksheet found in workbook');
  }

  const rows = parseReportRows(sheet);

  let createdUsers = 0;
  let updatedUsers = 0;
  let createdActivities = 0;
  let skippedActivities = 0;

  for (const row of rows) {
    const existingUser = await prisma.user.findFirst({
      where: { name: row.name },
    });

    const user = existingUser
      ? await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            gender: row.gender || existingUser.gender,
          },
        })
      : await prisma.user.create({
          data: {
            name: row.name,
            gender: row.gender || undefined,
          },
        });

    if (existingUser) updatedUsers += 1;
    else createdUsers += 1;

    const existingActivity = await prisma.activity.findFirst({
      where: {
        userId: user.id,
        userAge: row.age,
        pushups: row.pushups,
        crunches: row.crunches,
        running: row.running,
        createdAt: row.createdAt,
      },
    });

    if (existingActivity) {
      skippedActivities += 1;
      continue;
    }

    await prisma.activity.create({
      data: {
        userId: user.id,
        userAge: row.age,
        pushups: row.pushups,
        crunches: row.crunches,
        running: row.running,
        createdAt: row.createdAt,
      },
    });

    createdActivities += 1;
  }

  console.log(`Imported ${rows.length} rows from ${filePath}`);
  console.log(`Users: ${createdUsers} created, ${updatedUsers} updated`);
  console.log(`Activities: ${createdActivities} created, ${skippedActivities} skipped`);
}

const filePath = resolveInputFile();

importReport(filePath)
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
