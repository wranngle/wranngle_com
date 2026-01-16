
import { z } from 'zod';
import { insertUserSchema, users } from './schema';

export const api = {
  health: {
    check: {
      method: 'GET' as const,
      path: '/api/health',
      responses: {
        200: z.object({ status: z.string() }),
      },
    },
  },
};
