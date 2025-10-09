import ExcelJS from "exceljs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function importPushupPoints(pushups: ExcelJS.Worksheet) {
  const pushupPoints: Array<{
    age: number;
    gender: string;
    count: number;
    points: number;
  }> = [];

  pushups.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    if (rowNumber <= 2) return; // Skip header row

    // console.log(rowNumber, row.values);

    const count = row.getCell(2).value as number;

    row.eachCell({ includeEmpty: false }, (cell, colNumber) => {
      if (colNumber <= 2) return; // Skip first 2 columns

      let points = cell.value as number;

      if (isNaN(points)) {
        return;
      }

      if (points > 100) {
        points = 100;
      }

      const ageRange = pushups.getRow(1).getCell(colNumber).value as string;
      let gender = pushups.getRow(2).getCell(colNumber).value as string;

      if (gender === "V") {
        gender = "male";
      } else if (gender === "M") {
        gender = "female";
      }

      const [minAge, maxAge] = ageRange.split("-").map((age) => parseInt(age));
      // console.log({ [`${minAge}-${maxAge}`]: points, gender });

      // for (let age = minAge; age <= maxAge; age++) {
      //   console.log({ age, gender });
      // }

      pushupPoints.push({
        age: minAge,
        gender,
        count,
        points,
      });
    });
  });

  return pushupPoints;
}

function importCrunchesPoints(crunches: ExcelJS.Worksheet) {
  const crunchesPoints: Array<{
    age: number;
    gender: string;
    count: number;
    points: number;
  }> = [];

  crunches.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    if (rowNumber <= 2) return; // Skip header row

    const count = row.getCell(2).value as number;

    row.eachCell({ includeEmpty: false }, (cell, colNumber) => {
      if (colNumber <= 2) return; // Skip first 2 columns

      let points = cell.value as number;

      if (isNaN(points)) {
        return;
      }

      if (points > 100) {
        points = 100;
      }

      const ageRange = crunches.getRow(1).getCell(colNumber).value as string;
      const genders = crunches.getRow(2).getCell(colNumber).value as string;

      const [minAge, maxAge] = ageRange.split("-").map((age) => parseInt(age));

      for (let gender of genders.split("/")) {
        if (gender === "V") {
          gender = "male";
        } else if (gender === "M") {
          gender = "female";
        }

        crunchesPoints.push({
          age: minAge,
          gender,
          count,
          points,
        });
      }
    });
  });

  return crunchesPoints;
}

function importRunningPoints(running: ExcelJS.Worksheet) {
  const runningPoints: Array<{
    age: number;
    gender: string;
    seconds: number;
    points: number;
  }> = [];

  running.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    if (rowNumber <= 2) return; // Skip header row

    const seconds = row.getCell(2).result as number;

    row.eachCell({ includeEmpty: false }, (cell, colNumber) => {
      if (colNumber <= 2) return; // Skip first 2 columns

      let points = cell.value as number;

      if (isNaN(points)) {
        return;
      }

      if (points > 100) {
        points = 100;
      }

      const ageRange = running.getRow(1).getCell(colNumber).value as string;
      let gender = running.getRow(2).getCell(colNumber).value as string;

      if (gender === "V") {
        gender = "male";
      } else if (gender === "M") {
        gender = "female";
      }

      const [minAge, maxAge] = ageRange.split("-").map((age) => parseInt(age));

      runningPoints.push({
        age: minAge,
        gender,
        seconds,
        points,
      });
    });
  });

  return runningPoints;
}

async function importPoints() {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile("202.xlsx");

  const pushups = workbook.worksheets[0];
  const crunches = workbook.worksheets[1];
  const running = workbook.worksheets[2];

  const pushupPoints = importPushupPoints(pushups);

  await prisma.$transaction(
    async (tx) => {
      await tx.pushupPoints.createMany({
        data: pushupPoints,
      });
    },
    {
      timeout: 30000, // 30 seconds
    }
  );

  const crunchesPoints = importCrunchesPoints(crunches);

  await prisma.$transaction(
    async (tx) => {
      await tx.crunchesPoints.createMany({
        data: crunchesPoints,
      });
    },
    {
      timeout: 30000, // 30 seconds
    }
  );

  const runningPoints = importRunningPoints(running);

  await prisma.$transaction(
    async (tx) => {
      await tx.runningPoints.createMany({
        data: runningPoints,
      });
    },
    {
      timeout: 30000, // 30 seconds
    }
  );
}

importPoints()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
