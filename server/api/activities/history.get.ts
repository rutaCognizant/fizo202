import type { Activity } from '~~/prisma/generated/client';
import { calculatePoints } from '~~/server/utils';

export interface ActivityHistoryResponse extends Activity {
  totalPoints: number;
  username: string;
}

export default defineEventHandler(async (event): Promise<ActivityHistoryResponse[]> => {
  const query = getQuery(event);
  const usernameRaw = query.user as string | undefined;

  if (!usernameRaw) {
    throw createError({
      statusCode: 400,
      statusMessage: 'User query parameter is required',
    });
  }

  const username = usernameRaw.trim().toLowerCase();

  const activities = await prisma.activity.findMany({
    where: {
      user: {
        name: username,
      },
    },
    include: {
      user: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  const activityResponses: ActivityHistoryResponse[] = await Promise.all(
    activities.map(async (activity) => {
      const user = activity.user;

      const { totalPoints } = await calculatePoints(user, activity);

      return {
        ...activity,
        totalPoints,
        username: user.name || 'Unknown',
      };
    })
  );

  return activityResponses.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
});
