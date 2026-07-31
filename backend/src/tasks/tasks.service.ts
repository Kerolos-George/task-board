import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, TaskPriority, TaskStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ProjectsService } from '../projects/projects.service';
import { AuthUser } from '../common/decorators/current-user.decorator';
import { PaginatedResult, paginateMeta } from '../common/dto/pagination.dto';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskQueryDto } from './dto/task-query.dto';

const taskInclude = {
  creator: { select: { id: true, name: true, email: true } },
  assignee: { select: { id: true, name: true, email: true } },
} satisfies Prisma.TaskInclude;

@Injectable()
export class TasksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly projectsService: ProjectsService,
  ) {}

  async create(user: AuthUser, projectId: string, dto: CreateTaskDto) {
    await this.projectsService.assertCanAccess(user, projectId);
    if (dto.assigneeId) {
      await this.assertAssigneeIsMember(projectId, dto.assigneeId);
    }

    return this.prisma.$transaction(async (tx) => {
      const task = await tx.task.create({
        data: {
          projectId,
          title: dto.title,
          description: dto.description,
          status: dto.status ?? TaskStatus.TODO,
          priority: dto.priority ?? TaskPriority.MEDIUM,
          dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
          creatorId: user.id,
          assigneeId: dto.assigneeId,
        },
        include: taskInclude,
      });

      await tx.taskStatusHistory.create({
        data: {
          taskId: task.id,
          fromStatus: null,
          toStatus: task.status,
          changedById: user.id,
        },
      });

      return task;
    });
  }

  async findAll(
    user: AuthUser,
    projectId: string,
    query: TaskQueryDto,
  ): Promise<PaginatedResult<unknown>> {
    await this.projectsService.assertCanAccess(user, projectId);

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Prisma.TaskWhereInput = {
      projectId,
      ...(query.status ? { status: query.status } : {}),
      ...(query.priority ? { priority: query.priority } : {}),
      ...(query.assigneeId ? { assigneeId: query.assigneeId } : {}),
      ...(query.search
        ? {
            OR: [
              { title: { contains: query.search, mode: 'insensitive' } },
              {
                description: { contains: query.search, mode: 'insensitive' },
              },
            ],
          }
        : {}),
    };

    const allowedSort = [
      'createdAt',
      'updatedAt',
      'dueDate',
      'title',
      'priority',
      'status',
    ];
    const sortBy = allowedSort.includes(query.sortBy ?? '')
      ? (query.sortBy as string)
      : 'createdAt';
    const sortOrder = query.sortOrder === 'asc' ? 'asc' : 'desc';

    const [total, data] = await this.prisma.$transaction([
      this.prisma.task.count({ where }),
      this.prisma.task.findMany({
        where,
        include: taskInclude,
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
    ]);

    return { data, meta: paginateMeta(total, page, limit) };
  }

  async findOne(user: AuthUser, projectId: string, taskId: string) {
    await this.projectsService.assertCanAccess(user, projectId);
    const task = await this.prisma.task.findFirst({
      where: { id: taskId, projectId },
      include: {
        ...taskInclude,
        statusHistory: {
          orderBy: { changedAt: 'desc' },
          include: {
            changedBy: { select: { id: true, name: true, email: true } },
          },
        },
      },
    });
    if (!task) {
      throw new NotFoundException('Task not found');
    }
    return task;
  }

  async update(
    user: AuthUser,
    projectId: string,
    taskId: string,
    dto: UpdateTaskDto,
  ) {
    await this.projectsService.assertCanAccess(user, projectId);
    const existing = await this.prisma.task.findFirst({
      where: { id: taskId, projectId },
    });
    if (!existing) {
      throw new NotFoundException('Task not found');
    }

    if (dto.assigneeId) {
      await this.assertAssigneeIsMember(projectId, dto.assigneeId);
    }

    return this.prisma.$transaction(async (tx) => {
      const task = await tx.task.update({
        where: { id: taskId },
        data: {
          title: dto.title,
          description: dto.description,
          status: dto.status,
          priority: dto.priority,
          dueDate:
            dto.dueDate === undefined
              ? undefined
              : dto.dueDate === null
                ? null
                : new Date(dto.dueDate),
          assigneeId: dto.assigneeId,
        },
        include: taskInclude,
      });

      if (dto.status && dto.status !== existing.status) {
        await tx.taskStatusHistory.create({
          data: {
            taskId,
            fromStatus: existing.status,
            toStatus: dto.status,
            changedById: user.id,
          },
        });
      }

      return task;
    });
  }

  async remove(user: AuthUser, projectId: string, taskId: string) {
    await this.projectsService.assertCanAccess(user, projectId);
    const existing = await this.prisma.task.findFirst({
      where: { id: taskId, projectId },
    });
    if (!existing) {
      throw new NotFoundException('Task not found');
    }
    await this.prisma.task.delete({ where: { id: taskId } });
    return { message: 'Task deleted' };
  }

  async getStatusHistory(user: AuthUser, projectId: string, taskId: string) {
    await this.findOne(user, projectId, taskId);
    return this.prisma.taskStatusHistory.findMany({
      where: { taskId },
      orderBy: { changedAt: 'desc' },
      include: {
        changedBy: { select: { id: true, name: true, email: true } },
      },
    });
  }

  private async assertAssigneeIsMember(projectId: string, assigneeId: string) {
    const membership = await this.prisma.projectMember.findUnique({
      where: {
        projectId_userId: { projectId, userId: assigneeId },
      },
    });
    if (!membership) {
      throw new BadRequestException(
        'Assignee must be a member of the project',
      );
    }
  }
}
