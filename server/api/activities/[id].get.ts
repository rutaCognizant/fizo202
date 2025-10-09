import { Activity, User } from "@prisma/client";
import prisma from "~/../lib/prisma";

interface ActivityResponse {
  activity: Activity;
  user: User;
  pushupPoints: number;
  crunchesPoints: number;
  runningPoints: number;
}

export default defineEventHandler(async (event): Promise<ActivityResponse> => {
  const idParam = getRouterParam(event, "id");

  if (!idParam) {
    throw createError({
      statusCode: 400,
      statusMessage: "ID is required",
    });
  }

  const id = Number(idParam);
  if (isNaN(id)) {
    throw createError({
      statusCode: 400,
      statusMessage: "ID must be a number",
    });
  }

  const activity = await prisma.activity.findUnique({
    where: { id },
    include: { user: true },
  });

  if (!activity) {
    throw createError({
      statusCode: 404,
      statusMessage: "Activity not found",
    });
  }

  const user = activity.user;

  const pushupPoints = await prisma.pushupPoints.findFirst({
    where: {
      age: { lte: user.age || 0 },
      gender: user.gender || undefined,
      count: { lte: activity.pushups },
    },
    orderBy: [{ age: "desc" }, { count: "desc" }],
  });
  // console.log({ pushupPoints });

  const crunchesPoints = await prisma.crunchesPoints.findFirst({
    where: {
      age: { lte: user.age || 0 },
      gender: user.gender || undefined,
      count: { lte: activity.crunches },
    },
    orderBy: [{ age: "desc" }, { count: "desc" }],
  });
  // console.log({ crunchesPoints });

  const runningPoints = await prisma.runningPoints.findFirst({
    where: {
      age: { lte: user.age || 0 },
      gender: user.gender || undefined,
      seconds: { gte: activity.running },
    },
    orderBy: [{ age: "desc" }, { seconds: "asc" }],
  });
  // console.log({ runningPoints });

  return {
    activity,
    user: activity.user,
    pushupPoints: pushupPoints?.points || 0,
    crunchesPoints: crunchesPoints?.points || 0,
    runningPoints: runningPoints?.points || 0,
  };
});
