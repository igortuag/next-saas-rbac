import { AbilityBuilder, createMongoAbility, type CreateAbility, type ForcedSubject, type MongoAbility } from '@casl/ability'
import type { User } from './models/user'
import { permissions } from './permissions'

const actions = ['manage', 'invite', 'delete'] as const
const subjects = ['User', "all"] as const

type AppAbilities = [
  typeof actions[number],
  (
    | typeof subjects[number]
    | ForcedSubject<Exclude<typeof subjects[number], 'all'>>
  )
]

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