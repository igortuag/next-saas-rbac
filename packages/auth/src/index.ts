import { AbilityBuilder, createMongoAbility, type CreateAbility, type ForcedSubject, type MongoAbility } from '@casl/ability'

const actions = ['manage', 'create', 'read', 'update', 'delete', 'invite'] as const
const subjects = ['all', 'User'] as const

type AppAbilities = [
  typeof actions[number],
  (
    | typeof subjects[number]
    | ForcedSubject<Exclude<typeof subjects[number], 'all'>>
  )
]

export type AppAbility = MongoAbility<AppAbilities>
export const createAppAbility = createMongoAbility

const { build, can, cannot } = new AbilityBuilder<AppAbility>(createAppAbility)

can('invite', 'User')
cannot('invite', 'User')

export const ability = build()