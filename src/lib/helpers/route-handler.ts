import type { FastifyReply, FastifyRequest } from 'fastify';
import {
  z,
  ZodType,
  type AnyZodObject,
  type ZodObject,
  type ZodRawShape,
  type ZodTypeAny,
} from 'zod';
import { config } from '@/config';
import { deepStrict } from '@/lib/utils/zod-utils';

export const routeHandler = <
  Params extends AnyZodObject,
  Query extends AnyZodObject,
  Body extends AnyZodObject,
  Result extends ZodTypeAny | ZodRawShape,
  Request = Omit<FastifyRequest, 'params' | 'query' | 'body'> & {
    params: z.infer<Params>;
    query: z.infer<Query>;
    body: z.infer<Body>;
  },
  Response = Result extends AnyZodObject
    ? z.infer<Result>
    : Result extends ZodRawShape
    ? z.infer<ZodObject<Result>>
    : never
>(
  schema: {
    params?: Params;
    query?: Query;
    body?: Body;
    result?: Result;
  },
  fn: (req: Request, reply: FastifyReply) => Promise<Response> | Response
): ((req: FastifyRequest, reply: FastifyReply) => Promise<Response>) => {
  const params = schema.params;
  const query = schema.query;
  const body = schema.body;
  const result =
    schema.result &&
    config.validateResponses &&
    deepStrict(
      schema.result instanceof ZodType ? schema.result : z.object(schema.result)
    );

  return async (req, reply) => {
    if (params) req.params = params.parse(req.params);
    if (query) req.query = query.parse(req.query);
    if (body) req.body = body.parse(req.body);

    if (result) {
      return result.parse(await fn(req as Request, reply));
    }

    return fn(req as Request, reply);
  };
};
