import { defineAbilitiesFor } from "@saas/auth";

const ability = defineAbilitiesFor({ role: "MEMBER" });

const userCanInviteSomeoneElse = ability.can("invite", "User");
const userCanDeleteSomeoneElse = ability.can("delete", "User");

console.log("Can user invite someone else?", userCanInviteSomeoneElse);
console.log("Can user delete someone else?", userCanDeleteSomeoneElse);