import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ApiError, projectsApi, tasksApi } from '../api';
import { useAuth } from '../auth';
import { ConfirmDialog, Field, Modal } from '../components/Form';
import { Alert, Badge, EmptyState, Spinner } from '../components/ui';
import type { Project, Task, TaskPriority, TaskStatus } from '../types';

const STATUSES: TaskStatus[] = ['TODO', 'IN_PROGRESS', 'DONE'];
const STATUS_LABEL: Record<TaskStatus, string> = {
  TODO: 'To Do',
  IN_PROGRESS: 'In Progress',
  DONE: 'Done',
};

const emptyTaskForm = {
  title: '',
  description: '',
  status: 'TODO' as TaskStatus,
  priority: 'MEDIUM' as TaskPriority,
  dueDate: '',
  assigneeId: '',
};

export function ProjectDetailPage() {
  const { projectId = '' } = useParams();
  const { user, logout } = useAuth();

  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [assigneeFilter, setAssigneeFilter] = useState('');
  const [search, setSearch] = useState('');

  const [taskModal, setTaskModal] = useState<'create' | 'edit' | null>(null);
  const [editing, setEditing] = useState<Task | null>(null);
  const [taskForm, setTaskForm] = useState(emptyTaskForm);
  const [taskErrors, setTaskErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const [memberEmail, setMemberEmail] = useState('');
  const [showMembers, setShowMembers] = useState(false);
  const [showEditProject, setShowEditProject] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [confirmAction, setConfirmAction] = useState<
    | { type: 'task' }
    | { type: 'project' }
    | { type: 'member'; userId: string; name: string }
    | null
  >(null);

  const canManage = useMemo(() => {
    if (!user || !project) return false;
    return user.role === 'ADMIN' || project.ownerId === user.id;
  }, [user, project]);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [projectData, taskData] = await Promise.all([
        projectsApi.get(projectId),
        tasksApi.list(projectId, {
          status: statusFilter || undefined,
          priority: priorityFilter || undefined,
          assigneeId: assigneeFilter || undefined,
          search: search || undefined,
          limit: '100',
        }),
      ]);
      setProject(projectData);
      setTasks(taskData.data);
      setProjectName(projectData.name);
      setProjectDescription(projectData.description ?? '');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load project');
    } finally {
      setLoading(false);
    }
  }, [projectId, statusFilter, priorityFilter, assigneeFilter, search]);

  useEffect(() => {
    void load();
  }, [load]);

  const grouped = useMemo(() => {
    const map: Record<TaskStatus, Task[]> = {
      TODO: [],
      IN_PROGRESS: [],
      DONE: [],
    };
    for (const task of tasks) map[task.status].push(task);
    return map;
  }, [tasks]);

  function openCreate() {
    setEditing(null);
    setTaskForm(emptyTaskForm);
    setTaskErrors({});
    setTaskModal('create');
  }

  function openEdit(task: Task) {
    setEditing(task);
    setTaskForm({
      title: task.title,
      description: task.description ?? '',
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate ? task.dueDate.slice(0, 10) : '',
      assigneeId: task.assigneeId ?? '',
    });
    setTaskErrors({});
    setTaskModal('edit');
  }

  function validateTask() {
    const next: Record<string, string> = {};
    if (taskForm.title.trim().length < 2) {
      next.title = 'Title must be at least 2 characters';
    }
    setTaskErrors(next);
    return Object.keys(next).length === 0;
  }

  async function saveTask(e: FormEvent) {
    e.preventDefault();
    if (!validateTask()) return;
    setSaving(true);
    setError('');
    try {
      const body = {
        title: taskForm.title.trim(),
        description: taskForm.description.trim() || undefined,
        status: taskForm.status,
        priority: taskForm.priority,
        dueDate: taskForm.dueDate ? new Date(taskForm.dueDate).toISOString() : undefined,
        assigneeId: taskForm.assigneeId || undefined,
      };
      if (taskModal === 'create') {
        await tasksApi.create(projectId, body);
        setSuccess('Task created');
      } else if (editing) {
        await tasksApi.update(projectId, editing.id, {
          ...body,
          assigneeId: taskForm.assigneeId ? taskForm.assigneeId : null,
          dueDate: taskForm.dueDate ? new Date(taskForm.dueDate).toISOString() : null,
        });
        setSuccess('Task updated');
      }
      setTaskModal(null);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not save task');
    } finally {
      setSaving(false);
    }
  }

  async function addMember(e: FormEvent) {
    e.preventDefault();
    if (!memberEmail.trim()) return;
    setSaving(true);
    try {
      await projectsApi.addMember(projectId, memberEmail.trim());
      setMemberEmail('');
      setSuccess('Member added');
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not add member');
    } finally {
      setSaving(false);
    }
  }

  async function saveProject(e: FormEvent) {
    e.preventDefault();
    if (projectName.trim().length < 2) return;
    setSaving(true);
    try {
      await projectsApi.update(projectId, {
        name: projectName.trim(),
        description: projectDescription.trim(),
      });
      setShowEditProject(false);
      setSuccess('Project updated');
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not update project');
    } finally {
      setSaving(false);
    }
  }

  async function runConfirmedDelete() {
    if (!confirmAction) return;
    setSaving(true);
    setError('');
    try {
      if (confirmAction.type === 'task' && editing) {
        await tasksApi.remove(projectId, editing.id);
        setTaskModal(null);
        setSuccess('Task deleted');
        setConfirmAction(null);
        await load();
      } else if (confirmAction.type === 'member') {
        await projectsApi.removeMember(projectId, confirmAction.userId);
        setSuccess('Member removed');
        setConfirmAction(null);
        await load();
      } else if (confirmAction.type === 'project') {
        await projectsApi.remove(projectId);
        setConfirmAction(null);
        window.location.href = '/projects';
      }
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : 'Could not complete delete',
      );
      setConfirmAction(null);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <Link to="/projects" className="brand">
          Task <span>Board</span>
        </Link>
        <div className="topbar-meta">
          <span>
            {user?.name} · {user?.role}
          </span>
          <button className="btn btn-ghost btn-sm" type="button" onClick={logout}>
            Log out
          </button>
        </div>
      </header>

      <main className="page">
        <div className="page-header">
          <div>
            <Link to="/projects" className="eyebrow">
              ← Projects
            </Link>
            <h1>{project?.name ?? 'Project'}</h1>
            <p>{project?.description || 'No description'}</p>
          </div>
          <div className="row">
            {canManage ? (
              <>
                <button className="btn btn-ghost" type="button" onClick={() => setShowMembers(true)}>
                  Members
                </button>
                <button
                  className="btn btn-ghost"
                  type="button"
                  onClick={() => setShowEditProject(true)}
                >
                  Edit
                </button>
              </>
            ) : null}
            <button className="btn btn-primary" type="button" onClick={openCreate}>
              New task
            </button>
          </div>
        </div>

        <div className="filters panel">
          <Field label="Search">
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Title…" />
          </Field>
          <Field label="Status">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">All</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABEL[s]}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Priority">
            <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
              <option value="">All</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
          </Field>
          <Field label="Assignee">
            <select value={assigneeFilter} onChange={(e) => setAssigneeFilter(e.target.value)}>
              <option value="">All</option>
              {project?.members?.map((m) => (
                <option key={m.userId} value={m.userId}>
                  {m.user.name}
                </option>
              ))}
            </select>
          </Field>
        </div>

        {error ? (
          <div style={{ marginBottom: '1rem' }}>
            <Alert>{error}</Alert>
          </div>
        ) : null}
        {success ? (
          <div style={{ marginBottom: '1rem' }}>
            <Alert kind="success">{success}</Alert>
          </div>
        ) : null}

        {loading ? <Spinner /> : null}

        {!loading && tasks.length === 0 ? (
          <EmptyState title="No tasks found" detail="Create a task or clear filters." />
        ) : null}

        {!loading && tasks.length > 0 ? (
          <div className="board">
            {STATUSES.map((status) => (
              <section key={status} className="column">
                <h3>
                  <span>{STATUS_LABEL[status]}</span>
                  <Badge value={String(grouped[status].length)} kind={status} />
                </h3>
                {grouped[status].map((task) => (
                  <article
                    key={task.id}
                    className="task-card"
                    onClick={() => openEdit(task)}
                    onKeyDown={(e) => e.key === 'Enter' && openEdit(task)}
                    role="button"
                    tabIndex={0}
                  >
                    <h4>{task.title}</h4>
                    <p>{task.description || 'No description'}</p>
                    <div className="row" style={{ marginTop: '0.65rem' }}>
                      <Badge value={task.priority} kind={task.priority} />
                      <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
                        {task.assignee?.name ?? 'Unassigned'}
                      </span>
                    </div>
                  </article>
                ))}
              </section>
            ))}
          </div>
        ) : null}
      </main>

      {taskModal ? (
        <Modal
          title={taskModal === 'create' ? 'Create task' : 'Edit task'}
          onClose={() => setTaskModal(null)}
        >
          <form className="stack" onSubmit={saveTask}>
            <Field label="Title" error={taskErrors.title}>
              <input
                value={taskForm.title}
                onChange={(e) => setTaskForm((f) => ({ ...f, title: e.target.value }))}
              />
            </Field>
            <Field label="Description">
              <textarea
                rows={3}
                value={taskForm.description}
                onChange={(e) => setTaskForm((f) => ({ ...f, description: e.target.value }))}
              />
            </Field>
            <div className="row">
              <div style={{ flex: 1 }}>
                <Field label="Status">
                  <select
                    value={taskForm.status}
                    onChange={(e) =>
                      setTaskForm((f) => ({ ...f, status: e.target.value as TaskStatus }))
                    }
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {STATUS_LABEL[s]}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
              <div style={{ flex: 1 }}>
                <Field label="Priority">
                  <select
                    value={taskForm.priority}
                    onChange={(e) =>
                      setTaskForm((f) => ({ ...f, priority: e.target.value as TaskPriority }))
                    }
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </Field>
              </div>
            </div>
            <Field label="Due date">
              <input
                type="date"
                value={taskForm.dueDate}
                onChange={(e) => setTaskForm((f) => ({ ...f, dueDate: e.target.value }))}
              />
            </Field>
            <Field label="Assignee">
              <select
                value={taskForm.assigneeId}
                onChange={(e) => setTaskForm((f) => ({ ...f, assigneeId: e.target.value }))}
              >
                <option value="">Unassigned</option>
                {project?.members?.map((m) => (
                  <option key={m.userId} value={m.userId}>
                    {m.user.name} ({m.user.email})
                  </option>
                ))}
              </select>
            </Field>
            <div className="modal-actions">
              {taskModal === 'edit' ? (
                <button
                  className="btn btn-danger"
                  type="button"
                  onClick={() => setConfirmAction({ type: 'task' })}
                >
                  Delete
                </button>
              ) : (
                <span />
              )}
              <button className="btn btn-ghost" type="button" onClick={() => setTaskModal(null)}>
                Cancel
              </button>
              <button className="btn btn-primary" type="submit" disabled={saving}>
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </form>
        </Modal>
      ) : null}

      {showMembers && project ? (
        <Modal title="Project members" onClose={() => setShowMembers(false)}>
          <ul className="members-list">
            {project.members?.map((m) => (
              <li key={m.id}>
                <div>
                  <strong>{m.user.name}</strong>
                  <div style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>
                    {m.user.email}
                    {project.ownerId === m.userId ? ' · owner' : ''}
                  </div>
                </div>
                {canManage && project.ownerId !== m.userId ? (
                  <button
                    className="btn btn-danger btn-sm"
                    type="button"
                    onClick={() =>
                      setConfirmAction({
                        type: 'member',
                        userId: m.userId,
                        name: m.user.name,
                      })
                    }
                  >
                    Remove
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
          {canManage ? (
            <form className="stack" style={{ marginTop: '1rem' }} onSubmit={addMember}>
              <Field label="Add member by email">
                <input
                  type="email"
                  value={memberEmail}
                  onChange={(e) => setMemberEmail(e.target.value)}
                  placeholder="member@taskboard.local"
                />
              </Field>
              <button className="btn btn-primary" type="submit" disabled={saving}>
                Add member
              </button>
            </form>
          ) : null}
        </Modal>
      ) : null}

      {showEditProject ? (
        <Modal title="Edit project" onClose={() => setShowEditProject(false)}>
          <form className="stack" onSubmit={saveProject}>
            <Field label="Name">
              <input value={projectName} onChange={(e) => setProjectName(e.target.value)} />
            </Field>
            <Field label="Description">
              <textarea
                rows={3}
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
              />
            </Field>
            <div className="modal-actions">
              <button
                className="btn btn-danger"
                type="button"
                onClick={() => setConfirmAction({ type: 'project' })}
              >
                Delete project
              </button>
              <button
                className="btn btn-ghost"
                type="button"
                onClick={() => setShowEditProject(false)}
              >
                Cancel
              </button>
              <button className="btn btn-primary" type="submit" disabled={saving}>
                Save
              </button>
            </div>
          </form>
        </Modal>
      ) : null}

      {confirmAction?.type === 'task' ? (
        <ConfirmDialog
          title="Delete task"
          message={`Delete “${editing?.title ?? 'this task'}”? This cannot be undone.`}
          confirmLabel="Delete task"
          busy={saving}
          onCancel={() => setConfirmAction(null)}
          onConfirm={() => void runConfirmedDelete()}
        />
      ) : null}

      {confirmAction?.type === 'member' ? (
        <ConfirmDialog
          title="Remove member"
          message={`Remove ${confirmAction.name} from this project?`}
          confirmLabel="Remove"
          busy={saving}
          onCancel={() => setConfirmAction(null)}
          onConfirm={() => void runConfirmedDelete()}
        />
      ) : null}

      {confirmAction?.type === 'project' ? (
        <ConfirmDialog
          title="Delete project"
          message={`Delete “${project?.name ?? 'this project'}” and all its tasks? This cannot be undone.`}
          confirmLabel="Delete project"
          busy={saving}
          onCancel={() => setConfirmAction(null)}
          onConfirm={() => void runConfirmedDelete()}
        />
      ) : null}
    </div>
  );
}
