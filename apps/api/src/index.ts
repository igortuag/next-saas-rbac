import { defineAbilitiesFor, projectSchema } from '@saas/auth';

const ability = defineAbilitiesFor({ role: 'MEMBER', id: '123' });

const project = projectSchema.parse({
  __typename: 'Project',
  id: '456',
  ownerId: '123',
});

console.log(ability.can('get', 'User'));
console.log(ability.can('create', 'Project'));
console.log(ability.can('update', project));
