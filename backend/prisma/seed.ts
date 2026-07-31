import { Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash('Admin123!', 10);
  const memberPassword = await bcrypt.hash('Member123!', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@taskboard.local' },
    update: {},
    create: {
      email: 'admin@taskboard.local',
      name: 'Admin User',
      passwordHash: adminPassword,
      role: Role.ADMIN,
    },
  });

  const member = await prisma.user.upsert({
    where: { email: 'member@taskboard.local' },
    update: {},
    create: {
      email: 'member@taskboard.local',
      name: 'Member User',
      passwordHash: memberPassword,
      role: Role.MEMBER,
    },
  });

  const project = await prisma.project.upsert({
    where: { id: '00000000-0000-4000-8000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-4000-8000-000000000001',
      name: 'Demo Project',
      description: 'Seeded sample project',
      ownerId: admin.id,
      members: {
        create: [{ userId: admin.id }, { userId: member.id }],
      },
    },
  });

  console.log('Seed complete');
  console.log('Admin:  admin@taskboard.local / Admin123!');
  console.log('Member: member@taskboard.local / Member123!');
  console.log('Project:', project.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
