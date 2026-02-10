import { useEffect, useState } from 'react';
import { apiGet, apiPatch } from '../api';

type MemberLevel = {
  id: string;
  code: string;
  name: string;
  sortOrder: number;
  privilegeDetail: string | null;
  createdAt: string;
  updatedAt: string;
};

export default function MemberLevels() {
  const [levels, setLevels] = useState<MemberLevel[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<MemberLevel | null>(null);
  const [form, setForm] = useState({ name: '', sortOrder: 0, privilegeDetail: '' });
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

  const openEdit = (level: MemberLevel) => {
    setEditing(level);
    setForm({
      name: level.name,
      sortOrder: level.sortOrder,
      privilegeDetail: level.privilegeDetail ?? '',
    });
    setSaveError(null);
  };

  const closeEdit = () => {
    setEditing(null);
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
        privilegeDetail: form.privilegeDetail || undefined,
      });
      loadLevels();
      closeEdit();
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container">
      <h1 style={{ marginBottom: '1rem', fontWeight: 600 }}>Member Levels</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
        Yellow, Silver, Black tiers and their privilege details.
      </p>
      {error && (
        <div className="card" style={{ marginBottom: '1rem', borderColor: 'var(--danger)' }}>
          <p style={{ color: 'var(--danger)', margin: 0 }}>{error}</p>
        </div>
      )}
      <div className="card">
        {levels === null ? (
          <p>Loading…</p>
        ) : levels.length === 0 ? (
          <p>No member levels.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {levels.map((level) => (
              <div
                key={level.id}
                style={{
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  padding: '1rem 1.25rem',
                  background: 'var(--bg-subtle)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span className="badge" style={{ fontSize: '0.9rem' }}>
                      {level.code}
                    </span>
                    <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>{level.name}</h2>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                      Order: {level.sortOrder}
                    </span>
                  </div>
                  <button type="button" className="btn" onClick={() => openEdit(level)}>
                    Update
                  </button>
                </div>
                {level.privilegeDetail ? (
                  <pre
                    style={{
                      margin: 0,
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      fontSize: '0.9rem',
                      lineHeight: 1.5,
                      color: 'var(--text)',
                    }}
                  >
                    {level.privilegeDetail}
                  </pre>
                ) : (
                  <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    No privilege detail.
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {editing && (
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
          onClick={closeEdit}
        >
          <div
            className="card"
            style={{ maxWidth: '520px', width: '100%', maxHeight: '90vh', overflow: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ marginTop: 0 }}>Edit: {editing.code}</h2>
            {saveError && (
              <p style={{ color: 'var(--danger)', marginBottom: '1rem' }}>{saveError}</p>
            )}
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
              <label>Privilege detail (one line per item)</label>
              <textarea
                rows={8}
                value={form.privilegeDetail}
                onChange={(e) => setForm((f) => ({ ...f, privilegeDetail: e.target.value }))}
                style={{ fontFamily: 'inherit', fontSize: '0.9rem' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <button type="button" className="btn btn-ghost" onClick={closeEdit}>
                Cancel
              </button>
              <button type="button" className="btn" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
