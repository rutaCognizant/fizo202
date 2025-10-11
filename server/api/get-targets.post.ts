import { getTargetsForUser } from '../lib';
import type { User } from '@prisma/client';

interface TargetsResponse {
  pushup60: number;
  pushup100: number;
  crunches60: number;
  crunches100: number;
  running60: number;
  running100: number;
}

export default defineEventHandler(async (event): Promise<TargetsResponse> => {
  const { age, gender } = await readBody(event);

  const { pushup60, pushup100, crunches60, crunches100, running60, running100 } = await getTargetsForUser({
    age,
    gender,
  } as User);

  return {
    pushup60,
    pushup100,
    crunches60,
    crunches100,
    running60,
    running100,
  };
});
