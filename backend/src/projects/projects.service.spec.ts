import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { ProjectsService } from './projects.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuthUser } from '../common/decorators/current-user.decorator';

describe('ProjectsService access control', () => {
  let service: ProjectsService;
  let prisma: {
    project: { findUnique: jest.Mock };
  };

  const member: AuthUser = {
    id: 'member-1',
    email: 'member@example.com',
    role: Role.MEMBER,
  };

  beforeEach(() => {
    prisma = {
      project: {
        findUnique: jest.fn(),
      },
    };
    service = new ProjectsService(prisma as unknown as PrismaService);
  });

  it('allows project members to access a project', async () => {
    prisma.project.findUnique.mockResolvedValue({
      id: 'p1',
      ownerId: 'owner-1',
      members: [{ userId: 'member-1' }],
    });

    await expect(service.assertCanAccess(member, 'p1')).resolves.toBeDefined();
  });

  it('blocks non-members from accessing a project', async () => {
    prisma.project.findUnique.mockResolvedValue({
      id: 'p1',
      ownerId: 'owner-1',
      members: [{ userId: 'other-user' }],
    });

    await expect(service.assertCanAccess(member, 'p1')).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  it('throws when project does not exist', async () => {
    prisma.project.findUnique.mockResolvedValue(null);

    await expect(service.assertCanAccess(member, 'missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('allows admins to manage any project', async () => {
    const admin: AuthUser = {
      id: 'admin-1',
      email: 'admin@example.com',
      role: Role.ADMIN,
    };
    prisma.project.findUnique.mockResolvedValue({
      id: 'p1',
      ownerId: 'owner-1',
      members: [],
    });

    await expect(service.assertCanManage(admin, 'p1')).resolves.toBeDefined();
  });
});
