import { AbilityBuilder, createMongoAbility, type MongoAbility } from '@casl/ability'
import type { User } from './models/user'
import { permissions } from './permissions'
import { userSubjectSchema, type UserSubject } from './subjects/user'
import { projectSubjectSchema, type ProjectSubject } from './subjects/project'
import { z } from 'zod'
import { organizationSubjectSchema } from './subjects/organization'
import { inviteSubjectSchema } from './subjects/invite'
import { billingSubjectSchema } from './subjects/billing'

const appAbilities = z.union([
  projectSubjectSchema,
  userSubjectSchema,
  organizationSubjectSchema,
  inviteSubjectSchema,
  billingSubjectSchema,

  z.tuple([z.literal('manage'), z.literal('all')])
])

type AppAbilities = z.infer<typeof appAbilities>


export type AppAbility = MongoAbility<AppAbilities>
export const createAppAbility = createMongoAbility

export function defineAbilitiesFor(user: User) {
  const builder = new AbilityBuilder<AppAbility>(createAppAbility)

  if (typeof permissions[user.role] !== "function") {
    throw new Error(`Permissions for role ${user.role} are not defined`)
  }

  permissions[user.role](user, builder)

  const ability = builder.build()
  return ability
}