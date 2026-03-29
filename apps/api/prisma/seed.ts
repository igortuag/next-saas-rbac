import { faker } from '@faker-js/faker';
import { hash } from 'bcryptjs';
import { PrismaClient } from '@prisma/client/extension';

const prisma = new PrismaClient();

async function seed() {
  await prisma.organization.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await hash('123456', 1);

  const [user, user2, user3] = await prisma.user.createMany({
    data: [
      {
        name: 'John Doe',
        email: 'john@acme.com',
        avatarUrl: 'https://i.pravatar.cc/300',
        passwordHash,
      },
      {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        avatarUrl: faker.image.avatar(),
        passwordHash,
      },
      {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        avatarUrl: faker.image.avatar(),
        passwordHash,
      },
    ],
  });

  await prisma.organization.create({
    name: 'Acme Inc (Admin)',
    domain: 'acme.com',
    slug: 'acme-admin',
    avatarUrl: faker.image.avatarGitHub(),
    shouldAttachUserByDomain: true,
    owner: user.id,
    projects: {
      createMany: {
        data: [
          {
            name: faker.lorem.words(5),
            slug: faker.lorem.slug(5),
            description: faker.lorem.paragraph(),
            avatarUrl: faker.image.avatarGitHub(),
            ownerId: faker.helpers.arrayElement([user.id, user2.id, user3.id]),
          },
        ],
      },
    },
    member: {
      createMany: {
        data: [
          { userId: user.id, role: 'ADMIN' },
          { userId: user2.id, role: 'MEMBER' },
          { userId: user3.id, role: 'MEMBER' },
        ],
      },
    },
  });
}

seed().then(() => {
  console.log('Database seeded successfully');
});
