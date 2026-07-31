import { FormEvent, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ApiError, projectsApi } from '../api';
import { useAuth } from '../auth';
import { Field, Modal } from '../components/Form';
import { Alert, EmptyState, Spinner } from '../components/ui';
import type { Project } from '../types';

export function ProjectsPage() {
  const { user, logout } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  async function load(q = search) {
    setLoading(true);
    setError('');
    try {
      const result = await projectsApi.list({ search: q || undefined, limit: 50 });
      setProjects(result.data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (name.trim().length < 2) next.name = 'Name must be at least 2 characters';
    setFormErrors(next);
    if (Object.keys(next).length) return;

    setSaving(true);
    setError('');
    try {
      await projectsApi.create({
        name: name.trim(),
        description: description.trim() || undefined,
      });
      setShowCreate(false);
      setName('');
      setDescription('');
      setSuccess('Project created');
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not create project');
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
            <div className="eyebrow">Projects</div>
            <h1>Your boards</h1>
            <p>Open a project to manage tasks, members, and progress.</p>
          </div>
          <button className="btn btn-primary" type="button" onClick={() => setShowCreate(true)}>
            New project
          </button>
        </div>

        <div className="row" style={{ marginBottom: '1rem' }}>
          <input
            placeholder="Search projects…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              flex: 1,
              minWidth: 200,
              border: '1px solid var(--line)',
              borderRadius: 999,
              padding: '0.65rem 1rem',
              background: '#fff',
            }}
          />
          <button className="btn btn-ghost" type="button" onClick={() => void load(search)}>
            Search
          </button>
        </div>

        {error ? <Alert>{error}</Alert> : null}
        {success ? (
          <div style={{ marginBottom: '1rem' }}>
            <Alert kind="success">{success}</Alert>
          </div>
        ) : null}

        {loading ? <Spinner /> : null}
        {!loading && !error && projects.length === 0 ? (
          <EmptyState
            title="No projects yet"
            detail="Create your first project to start adding tasks."
          />
        ) : null}

        {!loading && projects.length > 0 ? (
          <div className="project-grid">
            {projects.map((project) => (
              <Link key={project.id} to={`/projects/${project.id}`} className="project-card">
                <h2>{project.name}</h2>
                <p>{project.description || 'No description'}</p>
                <div className="meta">
                  <span>{project._count?.tasks ?? 0} tasks</span>
                  <span>{project.members?.length ?? 0} members</span>
                </div>
              </Link>
            ))}
          </div>
        ) : null}
      </main>

      {showCreate ? (
        <Modal title="Create project" onClose={() => setShowCreate(false)}>
          <form className="stack" onSubmit={onCreate}>
            <Field label="Name" error={formErrors.name}>
              <input value={name} onChange={(e) => setName(e.target.value)} />
            </Field>
            <Field label="Description">
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </Field>
            <div className="modal-actions">
              <button className="btn btn-ghost" type="button" onClick={() => setShowCreate(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" type="submit" disabled={saving}>
                {saving ? 'Creating…' : 'Create'}
              </button>
            </div>
          </form>
        </Modal>
      ) : null}
    </div>
  );
}
