import type { Activity, User } from '@prisma/client';
import prisma from '~~/lib/prisma';

export async function calculatePoints(user: User, activity: Activity) {
  const pushupPointsRez = await prisma.pushupPoints.findFirst({
    select: { points: true },
    where: {
      age: { lte: user.age || 0 },
      gender: user.gender || undefined,
      count: { lte: activity.pushups },
    },
    orderBy: [{ age: 'desc' }, { count: 'desc' }],
  });
  const pushupPoints = Math.min(pushupPointsRez?.points || 0, 100);
  // console.log({ pushupPoints });

  const crunchesPointsRez = await prisma.crunchesPoints.findFirst({
    select: { points: true },
    where: {
      age: { lte: user.age || 0 },
      gender: user.gender || undefined,
      count: { lte: activity.crunches },
    },
    orderBy: [{ age: 'desc' }, { count: 'desc' }],
  });
  const crunchesPoints = Math.min(crunchesPointsRez?.points || 0, 100);
  // console.log({ crunchesPoints });

  let runningPoints = 0;
  if (activity.running !== 0) {
    const runningPointsRez = await prisma.runningPoints.findFirst({
      select: { points: true },
      where: {
        age: { lte: user.age || 0 },
        gender: user.gender || undefined,
        seconds: { gte: activity.running },
      },
      orderBy: [{ age: 'desc' }, { seconds: 'asc' }],
    });
    runningPoints = Math.min(runningPointsRez?.points || 0, 100);
  }
  // console.log({ runningPoints });

  return {
    pushupPoints,
    crunchesPoints,
    runningPoints,
    totalPoints: pushupPoints + crunchesPoints + runningPoints,
  };
}

export async function getTargetsForUser(user: User) {
  const gender = user.gender!;
  const age = Math.max(18, Math.min(65, user.age!)); // Clamp age between 18 and 65

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

  return { pushup60, pushup100, crunches60, crunches100, running60, running100 };
}
