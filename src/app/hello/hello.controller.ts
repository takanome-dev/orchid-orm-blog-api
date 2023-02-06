import { z } from 'zod';

import { requestHandler } from '@/lib/requestHandler';

export const helloController = requestHandler(
  {
    result: {
      hello: z.string(),
    },
  },
  () => {
    return { hello: 'world' };
  }
);
