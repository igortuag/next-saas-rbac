import { ability } from "@saas/auth";

const userCanInviteSomeoneElse = ability.can("invite", "User");
const userCanDeleteSomeoneElse = ability.can("delete", "User");

console.log("Can user invite someone else?", userCanInviteSomeoneElse);
console.log("Can user delete someone else?", userCanDeleteSomeoneElse);