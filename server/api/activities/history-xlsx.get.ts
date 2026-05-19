import { prisma, calculatePoints, getTargets } from '~~/server/utils';
import { formatTime } from '~/utils';
import { buildWorkbookFromRows } from '~~/server/utils/xlsx';

import { slugify } from 'transliteration';

import type { Activity, User } from '~~/prisma/generated/client';

export default defineEventHandler(async (event) => {
  const { user } = getQuery(event) as { user?: string };

  if (!user) {
    sendError(event, createError({ statusCode: 400, statusMessage: 'Missing user parameter' }));
    return;
  }

  // We'll collect rows then use shared workbook builder
  const rows: Record<string, string | number>[] = [];

  const activities = (await prisma.activity.findMany({
    where: { user: { name: user } },
    include: { user: true },
    orderBy: { createdAt: 'desc' },
  })) as (Activity & { user: User })[];

  for (const activity of activities) {
    const userObj = activity.user;
    const targets = await getTargets(userObj.gender || 'male', activity.userAge || 0);
    const { pushupPoints, crunchesPoints, runningPoints, totalPoints } = await calculatePoints(userObj, activity);
    const gender = userObj.gender === 'male' ? 'Vyras' : userObj.gender === 'female' ? 'Moteris' : '';

    rows.push({
      name: userObj.name ?? 'Unknown',
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

  const buffer = await buildWorkbookFromRows(rows, 'Istorija');

  console.log(user);

  event.node.res.setHeader('Content-Disposition', `attachment; filename="${slugify(user)}-history.xlsx"`);
  event.node.res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

  return buffer;
});
