import { faker } from '@faker-js/faker';
import { hash } from 'bcryptjs';
import { PrismaClient } from '@prisma/client/extension';

const prisma = new PrismaClient();

async function seed() {
  await prisma.organization.deleteMany();
  await prisma.user.deleteMany();

  const user = await prisma.user.create({
    data: {
      name: 'John Doe',
      email: 'john@acme.com',
      avatarUrl: 'https://i.pravatar.cc/300',
      passwordHash: await hash('123456', 1),
    },
  });
}

seed().then(() => {
  console.log('Database seeded successfully');
});
