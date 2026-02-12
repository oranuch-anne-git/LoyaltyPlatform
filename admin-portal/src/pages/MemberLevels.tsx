import { useEffect, useMemo, useState } from 'react';
import { apiGet, apiPatch, apiPost } from '../api';

type MemberLevel = {
  id: string;
  code: string;
  name: string;
  sortOrder: number;
  privilegeTh: string | null;
  privilegeEn: string | null;
  createdAt: string;
  updatedAt: string;
};

const defaultForm = {
  code: '',
  name: '',
  sortOrder: 0,
  privilegeTh: '',
  privilegeEn: '',
};

export default function MemberLevels() {
  const [levels, setLevels] = useState<MemberLevel[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<MemberLevel | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const loadLevels = () => {
    apiGet<MemberLevel[]>('/members/levels')
      .then(setLevels)
      .catch((e) => {
        setError(e instanceof Error ? e.message : 'Failed to load');
        setLevels([]);
      });
  };

  useEffect(() => {
    loadLevels();
  }, []);

  const filteredLevels = useMemo(() => {
    if (!levels) return [];
    const q = search.trim().toLowerCase();
    if (!q) return levels;
    return levels.filter(
      (l) =>
        l.code.toLowerCase().includes(q) ||
        l.name.toLowerCase().includes(q) ||
        String(l.sortOrder).includes(q) ||
        (l.privilegeTh ?? '').toLowerCase().includes(q) ||
        (l.privilegeEn ?? '').toLowerCase().includes(q) ||
        l.createdAt.toLowerCase().includes(q) ||
        l.updatedAt.toLowerCase().includes(q),
    );
  }, [levels, search]);

  const openEdit = (level: MemberLevel) => {
    setEditing(level);
    setCreating(false);
    setForm({
      code: level.code,
      name: level.name,
      sortOrder: level.sortOrder,
      privilegeTh: level.privilegeTh ?? '',
      privilegeEn: level.privilegeEn ?? '',
    });
    setSaveError(null);
  };

  const openCreate = () => {
    setCreating(true);
    setEditing(null);
    setForm(defaultForm);
    setSaveError(null);
  };

  const closeModal = () => {
    setEditing(null);
    setCreating(false);
    setSaveError(null);
  };

  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);
    setSaveError(null);
    try {
      await apiPatch<MemberLevel>(`/members/levels/${editing.id}`, {
        name: form.name,
        sortOrder: form.sortOrder,
        privilegeTh: form.privilegeTh || undefined,
        privilegeEn: form.privilegeEn || undefined,
      });
      loadLevels();
      closeModal();
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const handleCreate = async () => {
    if (!form.code.trim() || !form.name.trim()) {
      setSaveError('Code and Name are required');
      return;
    }
    setSaving(true);
    setSaveError(null);
    try {
      await apiPost<MemberLevel>('/members/levels', {
        code: form.code.trim(),
        name: form.name.trim(),
        sortOrder: form.sortOrder,
        privilegeTh: form.privilegeTh || undefined,
        privilegeEn: form.privilegeEn || undefined,
      });
      loadLevels();
      closeModal();
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'Create failed');
    } finally {
      setSaving(false);
    }
  };

  const showModal = editing || creating;

  return (
    <div className="container">
      <h1 style={{ marginBottom: '1rem', fontWeight: 600 }}>Member Levels</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
        Yellow, Silver, Black tiers and their privilege details (Thai / English).
      </p>
      {error && (
        <div className="card" style={{ marginBottom: '1rem', borderColor: 'var(--danger)' }}>
          <p style={{ color: 'var(--danger)', margin: 0 }}>{error}</p>
        </div>
      )}
      <div className="card" style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ marginBottom: 0, flex: '1 1 280px' }}>
            <label>Search</label>
            <input
              type="text"
              placeholder="Code, Name, Order, PrivilegeTH, PrivilegeEN, createdAt, updatedAt..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button type="button" className="btn" onClick={openCreate}>
            Create new level
          </button>
        </div>
      </div>
      <div className="card">
        {levels === null ? (
          <p>Loading…</p>
        ) : filteredLevels.length === 0 ? (
          <p>{search.trim() ? 'No matching member levels.' : 'No member levels.'}</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Name</th>
                  <th>Order</th>
                  <th>PrivilegeTH</th>
                  <th>PrivilegeEN</th>
                  <th>createdAt</th>
                  <th>updatedAt</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filteredLevels.map((level) => (
                  <tr key={level.id}>
                    <td><code>{level.code}</code></td>
                    <td>{level.name}</td>
                    <td>{level.sortOrder}</td>
                    <td style={{ maxWidth: 200, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                      {level.privilegeTh ?? '—'}
                    </td>
                    <td style={{ maxWidth: 200, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                      {level.privilegeEn ?? '—'}
                    </td>
                    <td style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                      {new Date(level.createdAt).toLocaleString()}
                    </td>
                    <td style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                      {new Date(level.updatedAt).toLocaleString()}
                    </td>
                    <td>
                      <button type="button" className="btn btn-ghost" style={{ padding: '0.4rem 0.8rem' }} onClick={() => openEdit(level)}>
                        Update
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
          onClick={closeModal}
        >
          <div
            className="card"
            style={{ maxWidth: '520px', width: '100%', maxHeight: '90vh', overflow: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ marginTop: 0 }}>{creating ? 'Create member level' : `Edit: ${editing?.code}`}</h2>
            {saveError && (
              <p style={{ color: 'var(--danger)', marginBottom: '1rem' }}>{saveError}</p>
            )}
            <div className="form-group">
              <label>Code</label>
              <input
                type="text"
                value={form.code}
                onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
                disabled={!!editing}
                placeholder="e.g. YELLOW"
              />
              {editing && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Code cannot be changed when editing.</span>}
            </div>
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label>Sort order</label>
              <input
                type="number"
                value={form.sortOrder}
                onChange={(e) => setForm((f) => ({ ...f, sortOrder: Number(e.target.value) || 0 }))}
              />
            </div>
            <div className="form-group">
              <label>Privilege (Thai) — one line per item</label>
              <textarea
                rows={4}
                value={form.privilegeTh}
                onChange={(e) => setForm((f) => ({ ...f, privilegeTh: e.target.value }))}
                style={{ fontFamily: 'inherit', fontSize: '0.9rem' }}
              />
            </div>
            <div className="form-group">
              <label>Privilege (English) — one line per item</label>
              <textarea
                rows={4}
                value={form.privilegeEn}
                onChange={(e) => setForm((f) => ({ ...f, privilegeEn: e.target.value }))}
                style={{ fontFamily: 'inherit', fontSize: '0.9rem' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <button type="button" className="btn btn-ghost" onClick={closeModal}>
                Cancel
              </button>
              {creating ? (
                <button type="button" className="btn" onClick={handleCreate} disabled={saving}>
                  {saving ? 'Creating…' : 'Create'}
                </button>
              ) : (
                <button type="button" className="btn" onClick={handleSave} disabled={saving}>
                  {saving ? 'Saving…' : 'Save'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
