import type { Activity, User } from '~~/prisma/generated/client';

/** A tournament day needs more than this many distinct participants. */
export const MIN_TOURNAMENT_PARTICIPANTS = 10;

/** Local-time `YYYY-MM-DD` key, matching how report dates are rendered elsewhere. */
export function toDateKey(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

/** Inclusive local-day bounds for a `YYYY-MM-DD` key. */
export function dayRange(dateKey: string): { from: Date; to: Date } {
  const [year, month, day] = dateKey.split('-').map(Number) as [number, number, number];
  return {
    from: new Date(year, month - 1, day, 0, 0, 0, 0),
    to: new Date(year, month - 1, day, 23, 59, 59, 999),
  };
}

export function isDateKey(value: unknown): value is string {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export interface Tournament {
  date: string;
  participants: number;
}

/** Days with more than `MIN_TOURNAMENT_PARTICIPANTS` distinct participants, newest first. */
export async function listTournaments(): Promise<Tournament[]> {
  const activities = await prisma.activity.findMany({
    select: { userId: true, createdAt: true },
  });

  const byDate = new Map<string, Set<number>>();
  for (const activity of activities) {
    const key = toDateKey(activity.createdAt);
    const users = byDate.get(key) ?? new Set<number>();
    users.add(activity.userId);
    byDate.set(key, users);
  }

  return [...byDate.entries()]
    .filter(([, users]) => users.size > MIN_TOURNAMENT_PARTICIPANTS)
    .map(([date, users]) => ({ date, participants: users.size }))
    .sort((a, b) => b.date.localeCompare(a.date));
}

/**
 * One activity per participant for a tournament day. Like the XLSX report, a
 * participant with several entries on the same day is represented by the latest.
 */
export async function tournamentActivities(dateKey: string): Promise<Map<number, Activity & { user: User }>> {
  const { from, to } = dayRange(dateKey);

  const activities = (await prisma.activity.findMany({
    where: { AND: [{ createdAt: { gte: from } }, { createdAt: { lte: to } }] },
    include: { user: true },
    orderBy: { createdAt: 'desc' },
    distinct: ['userId'],
  })) as (Activity & { user: User })[];

  return new Map(activities.map((activity) => [activity.userId, activity]));
}
