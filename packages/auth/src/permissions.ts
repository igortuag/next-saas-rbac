import type { AbilityBuilder } from "@casl/ability"
import type { AppAbility } from "."

type Role = "ADMIN" | "MEMBER"

type PermissionsByRole = (user: any, builder: AbilityBuilder<AppAbility>) => void

export const permissions: Record<Role, PermissionsByRole> = {
  ADMIN(_, { can }) {
    can("manage", "all")
  },
  MEMBER(_, { can }) {
    can("invite", "User")
  }
}