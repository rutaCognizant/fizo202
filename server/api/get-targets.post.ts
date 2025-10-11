import prisma from '~/../lib/prisma';

interface TargetsResponse {
  pushup60: number;
  pushup100: number;
  crunches60: number;
  crunches100: number;
  running60: number;
  running100: number;
}

export default defineEventHandler(async (event): Promise<TargetsResponse> => {
  const { age: userAge, gender } = await readBody(event);

  const age = Math.max(18, Math.min(65, userAge)); // Clamp age between 18 and 65

  let pushupPoints = await prisma.pushupPoints.findMany({
    where: {
      age: { lte: age },
      gender,
    },
    orderBy: { age: 'desc' },
  });
  pushupPoints = pushupPoints.filter((e) => e.age === pushupPoints[0].age);

  const pushup60 = pushupPoints.find((e) => e.points === 60)?.count || 0;
  const pushup100 = pushupPoints.find((e) => e.points === 100)?.count || 0;

  let crunchesPoints = await prisma.crunchesPoints.findMany({
    where: {
      age: { lte: age },
      gender,
    },
    orderBy: { age: 'desc' },
  });
  crunchesPoints = crunchesPoints.filter((e) => e.age === crunchesPoints[0].age);

  const crunches60 = crunchesPoints.find((e) => e.points === 60)?.count || 0;
  const crunches100 = crunchesPoints.find((e) => e.points === 100)?.count || 0;

  let runningPoints = await prisma.runningPoints.findMany({
    where: {
      age: { lte: age },
      gender,
    },
    orderBy: { age: 'desc' },
  });
  runningPoints = runningPoints.filter((e) => e.age === runningPoints[0].age);

  const running60 = runningPoints.find((e) => e.points === 60)?.seconds || 0;
  const running100 = runningPoints.find((e) => e.points === 100)?.seconds || 0;

  // console.log({
  //   age,
  //   gender,
  //   pushup60,
  //   pushup100,
  //   crunches60,
  //   crunches100,
  //   running60,
  //   running100,
  // });

  return {
    pushup60,
    pushup100,
    crunches60,
    crunches100,
    running60,
    running100,
  };
});
