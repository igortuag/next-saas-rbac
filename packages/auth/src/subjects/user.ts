import { z } from 'zod'

export const userSubjectSchema = z.tuple([
  z.union([z.literal('manage'), z.literal('get'), z.literal('create'), z.literal('update'), z.literal('delete'), z.literal('invite')]),
  z.literal('User'),
])

export type UserSubject = z.infer<typeof userSubjectSchema>
