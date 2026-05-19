// import prisma from '~~/server/utils/prisma';

import { calculatePoints, getTargets, prisma } from '~~/server/utils';
import { formatTime } from '~/utils';
import { buildWorkbookFromRows } from '~~/server/utils/xlsx';

import type { Prisma, Activity, User } from '~~/prisma/generated/client';

export default defineEventHandler(async (event) => {
  const { startDate, endDate, includeAll } = await readBody(event);

  const activitiesFrom = new Date(startDate);
  const activitiesTo = new Date(endDate);
  activitiesTo.setHours(23, 59, 59, 999);

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

  activities.sort((a, b) => a.user.name!.localeCompare(b.user.name!));

  const rows: Record<string, string | number>[] = [];

  for (const activity of activities) {
    const user = activity.user;
    const targets = await getTargets(user.gender || 'male', activity.userAge || 0);
    const { pushupPoints, crunchesPoints, runningPoints, totalPoints } = await calculatePoints(user, activity);
    const gender = user.gender === 'male' ? 'Vyras' : user.gender === 'female' ? 'Moteris' : '';

    rows.push({
      name: user.name ?? 'Unknown',
      age: activity.userAge ?? '-',
      gender,

      pushupsMin: targets.pushup60,
      pushupsMax: targets.pushup100,

      crunchesMin: targets.crunches60,
      crunchesMax: targets.crunches100,

      runningMin: formatTime(targets.running60),
      runningMax: formatTime(targets.running100),

      pushupsCount: activity.pushups,
      crunchesCount: activity.crunches,
      runningTime: activity.running > 0 ? formatTime(activity.running) : '-',

      pushupPoints,
      crunchesPoints,
      runningPoints,

      totalPoints,
      date: activity.createdAt.toLocaleString('lt-LT'),
    });
  }

  const buffer = await buildWorkbookFromRows(rows, 'Report');

  event.node.res.setHeader('Content-Disposition', 'attachment; filename="report.xlsx"');
  event.node.res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

  return buffer;
});
