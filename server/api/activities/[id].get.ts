import type { Activity, User } from '@prisma/client';
import prisma from '~~/lib/prisma';

import { calculatePoints } from '~~/server/lib';

interface ActivityResponse {
  activity: Activity;
  user: User;
  pushupPoints: number;
  crunchesPoints: number;
  runningPoints: number;
}

export default defineEventHandler(async (event): Promise<ActivityResponse> => {
  const idParam = getRouterParam(event, 'id');

  if (!idParam) {
    throw createError({
      statusCode: 400,
      statusMessage: 'ID is required',
    });
  }

  const id = Number(idParam);
  if (isNaN(id)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'ID must be a number',
    });
  }

  const activity = await prisma.activity.findUnique({
    where: { id },
    include: { user: true },
  });

  if (!activity) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Activity not found',
    });
  }

  const user = activity.user;

  const { pushupPoints, crunchesPoints, runningPoints } = await calculatePoints(user, activity);

  return {
    activity,
    user: activity.user,
    pushupPoints,
    crunchesPoints,
    runningPoints,
  };
});
