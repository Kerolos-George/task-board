export type Role = 'ADMIN' | 'MEMBER';
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export type User = {
  id: string;
  email: string;
  name: string;
  role: Role;
  createdAt?: string;
};

export type ProjectMember = {
  id: string;
  userId: string;
  joinedAt: string;
  user: Pick<User, 'id' | 'name' | 'email' | 'role'>;
};

export type Project = {
  id: string;
  name: string;
  description: string | null;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  owner?: Pick<User, 'id' | 'name' | 'email' | 'role'>;
  members?: ProjectMember[];
  _count?: { tasks: number };
};

export type Task = {
  id: string;
  projectId: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  creatorId: string;
  assigneeId: string | null;
  createdAt: string;
  updatedAt: string;
  creator?: Pick<User, 'id' | 'name' | 'email'>;
  assignee?: Pick<User, 'id' | 'name' | 'email'> | null;
  statusHistory?: TaskStatusHistory[];
};

export type TaskStatusHistory = {
  id: string;
  taskId: string;
  fromStatus: TaskStatus | null;
  toStatus: TaskStatus;
  changedById: string;
  changedAt: string;
  changedBy?: Pick<User, 'id' | 'name' | 'email'>;
};

export type Paginated<T> = {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

export type AuthResponse = {
  user: User;
  accessToken: string;
};
