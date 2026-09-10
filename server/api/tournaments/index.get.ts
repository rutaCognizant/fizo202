import { listTournaments } from '~~/server/utils';
import type { Tournament } from '~~/server/utils';

export default defineEventHandler(async (): Promise<Tournament[]> => {
  return await listTournaments();
});
