import { z } from 'zod';
const refs = z.array(z.string().max(80)).max(16);
export const actionSchema = z.discriminatedUnion('kind', [
  z
    .object({
      kind: z.literal('attack'),
      pieces: refs.min(1),
      target: z.string().max(80),
      exchange: z
        .object({
          hp: z.number().int().min(1).max(99),
          mp: z.number().int().min(0).max(99),
          gold: z.number().int().min(0).max(99),
        })
        .optional(),
    })
    .strict(),
  z.object({ kind: z.literal('defend'), pieces: refs }).strict(),
  z.object({ kind: z.literal('buy'), accept: z.boolean() }).strict(),
  z.object({ kind: z.literal('pass') }).strict(),
  z.object({ kind: z.literal('discard'), pieces: refs.min(1) }).strict(),
]);
export const envelopeSchema = z
  .object({
    id: z.string().min(8).max(100),
    version: z.number().int().nonnegative(),
    action: actionSchema,
  })
  .strict();
export const roomSchema = z.object({
  name: z.string().trim().min(1).max(40),
  namePlayer: z.string().trim().min(1).max(20),
  password: z.string().max(80).default(''),
  private: z.boolean().default(false),
  capacity: z.number().int().min(2).max(8).default(4),
  mode: z.enum(['ffa', 'team']).default('ffa'),
  difficulty: z.enum(['easy', 'normal', 'hard']).default('normal'),
});
