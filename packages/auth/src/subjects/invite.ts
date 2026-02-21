import { z } from 'zod'

export const inviteSubjectSchema = z.tuple([
  z.union([z.literal('manage'),
  z.literal('get'),
  z.literal('create'), z.literal('delete')]),

])

export type InviteSubject = z.infer<typeof inviteSubjectSchema>
