import { calculatePoints, isDateKey, tournamentActivities } from '~~/server/utils';
import type { Activity, User } from '~~/prisma/generated/client';

export interface TournamentEntry {
  activityId: number;
  userAge: number | null;
  pushups: number;
  crunches: number;
  running: number;
  pushupPoints: number;
  crunchesPoints: number;
  runningPoints: number;
  totalPoints: number;
}

/** Every delta is null when the exercise cannot be compared — see `buildDelta`. */
export interface ProgressDelta {
  pushups: number | null;
  crunches: number | null;
  running: number | null;
  pushupPoints: number | null;
  crunchesPoints: number | null;
  runningPoints: number | null;
  totalPoints: number | null;
}

export interface ProgressRow {
  userId: number;
  name: string;
  gender: string | null;
  first: TournamentEntry | null;
  second: TournamentEntry | null;
  delta: ProgressDelta | null;
}

export interface CompareResponse {
  first: string;
  second: string;
  rows: ProgressRow[];
}

const EXERCISES = ['pushups', 'crunches', 'running'] as const;
const POINTS_KEY = { pushups: 'pushupPoints', crunches: 'crunchesPoints', running: 'runningPoints' } as const;

/**
 * A count or time of 0 means the exercise was not performed, so there is nothing to compare: that
 * exercise's deltas stay null and it is left out of the total delta. If neither tournament has a
 * single comparable exercise, the total delta is null too.
 */
function buildDelta(first: TournamentEntry, second: TournamentEntry): ProgressDelta {
  const delta: ProgressDelta = {
    pushups: null,
    crunches: null,
    running: null,
    pushupPoints: null,
    crunchesPoints: null,
    runningPoints: null,
    totalPoints: null,
  };

  let counted = 0;
  let total = 0;

  for (const exercise of EXERCISES) {
    if (first[exercise] === 0 || second[exercise] === 0) continue;

    const pointsKey = POINTS_KEY[exercise];
    const pointsDelta = second[pointsKey] - first[pointsKey];

    delta[exercise] = second[exercise] - first[exercise];
    delta[pointsKey] = pointsDelta;
    total += pointsDelta;
    counted++;
  }

  if (counted > 0) delta.totalPoints = total;

  return delta;
}

export default defineEventHandler(async (event): Promise<CompareResponse> => {
  const query = getQuery(event);
  const first = query.first;
  const second = query.second;

  if (!isDateKey(first) || !isDateKey(second)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'first and second query parameters must be dates in YYYY-MM-DD format',
    });
  }

  if (first === second) {
    throw createError({ statusCode: 400, statusMessage: 'Pick two different tournaments' });
  }

  const [firstActivities, secondActivities] = await Promise.all([
    tournamentActivities(first),
    tournamentActivities(second),
  ]);

  const toEntry = async (activity: Activity & { user: User }): Promise<TournamentEntry> => {
    const points = await calculatePoints(activity.user, activity);
    return {
      activityId: activity.id,
      userAge: activity.userAge,
      pushups: activity.pushups,
      crunches: activity.crunches,
      running: activity.running,
      ...points,
    };
  };

  const userIds = new Set([...firstActivities.keys(), ...secondActivities.keys()]);

  const rows = await Promise.all(
    [...userIds].map(async (userId): Promise<ProgressRow> => {
      const firstActivity = firstActivities.get(userId);
      const secondActivity = secondActivities.get(userId);
      const user = (firstActivity ?? secondActivity)!.user;

      const firstEntry = firstActivity ? await toEntry(firstActivity) : null;
      const secondEntry = secondActivity ? await toEntry(secondActivity) : null;

      return {
        userId,
        name: user.name ?? 'Unknown',
        gender: user.gender,
        first: firstEntry,
        second: secondEntry,
        delta: firstEntry && secondEntry ? buildDelta(firstEntry, secondEntry) : null,
      };
    })
  );

  rows.sort((a, b) => a.name.localeCompare(b.name));

  return { first, second, rows };
});
