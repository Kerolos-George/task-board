import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuthUser } from '../common/decorators/current-user.decorator';
import {
  PaginatedResult,
  PaginationQueryDto,
  paginateMeta,
} from '../common/dto/pagination.dto';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

const projectInclude = {
  owner: { select: { id: true, name: true, email: true, role: true } },
  members: {
    include: {
      user: { select: { id: true, name: true, email: true, role: true } },
    },
  },
  _count: { select: { tasks: true } },
} satisfies Prisma.ProjectInclude;

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(user: AuthUser, dto: CreateProjectDto) {
    return this.prisma.project.create({
      data: {
        name: dto.name,
        description: dto.description,
        ownerId: user.id,
        members: {
          create: { userId: user.id },
        },
      },
      include: projectInclude,
    });
  }

  async findAll(
    user: AuthUser,
    query: PaginationQueryDto,
  ): Promise<PaginatedResult<unknown>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Prisma.ProjectWhereInput = {
      ...(user.role === Role.ADMIN
        ? {}
        : { members: { some: { userId: user.id } } }),
      ...(query.search
        ? {
            OR: [
              { name: { contains: query.search, mode: 'insensitive' } },
              {
                description: { contains: query.search, mode: 'insensitive' },
              },
            ],
          }
        : {}),
    };

    const sortBy = ['name', 'createdAt', 'updatedAt'].includes(
      query.sortBy ?? '',
    )
      ? (query.sortBy as 'name' | 'createdAt' | 'updatedAt')
      : 'createdAt';
    const sortOrder = query.sortOrder === 'asc' ? 'asc' : 'desc';

    const [total, data] = await this.prisma.$transaction([
      this.prisma.project.count({ where }),
      this.prisma.project.findMany({
        where,
        include: projectInclude,
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
    ]);

    return { data, meta: paginateMeta(total, page, limit) };
  }

  async findOne(user: AuthUser, projectId: string) {
    await this.assertCanAccess(user, projectId);
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: projectInclude,
    });
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    return project;
  }

  async update(user: AuthUser, projectId: string, dto: UpdateProjectDto) {
    await this.assertCanManage(user, projectId);
    return this.prisma.project.update({
      where: { id: projectId },
      data: dto,
      include: projectInclude,
    });
  }

  async remove(user: AuthUser, projectId: string) {
    await this.assertCanManage(user, projectId);
    await this.prisma.project.delete({ where: { id: projectId } });
    return { message: 'Project deleted' };
  }

  async addMember(user: AuthUser, projectId: string, email: string) {
    await this.assertCanManage(user, projectId);
    const memberUser = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    if (!memberUser) {
      throw new NotFoundException('User with that email not found');
    }

    return this.prisma.projectMember.upsert({
      where: {
        projectId_userId: { projectId, userId: memberUser.id },
      },
      create: { projectId, userId: memberUser.id },
      update: {},
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
      },
    });
  }

  async removeMember(user: AuthUser, projectId: string, memberUserId: string) {
    const project = await this.assertCanManage(user, projectId);
    if (project.ownerId === memberUserId) {
      throw new ForbiddenException('Cannot remove the project owner');
    }

    const membership = await this.prisma.projectMember.findUnique({
      where: {
        projectId_userId: { projectId, userId: memberUserId },
      },
    });
    if (!membership) {
      throw new NotFoundException('Member not found on this project');
    }

    await this.prisma.projectMember.delete({ where: { id: membership.id } });
    return { message: 'Member removed' };
  }

  async assertCanAccess(user: AuthUser, projectId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: { members: true },
    });
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    if (user.role === Role.ADMIN) {
      return project;
    }
    const isMember = project.members.some((m) => m.userId === user.id);
    if (!isMember) {
      throw new ForbiddenException('You do not have access to this project');
    }
    return project;
  }

  async assertCanManage(user: AuthUser, projectId: string) {
    const project = await this.assertCanAccess(user, projectId);
    if (user.role === Role.ADMIN || project.ownerId === user.id) {
      return project;
    }
    throw new ForbiddenException(
      'Only the project owner or an admin can manage this project',
    );
  }
}
