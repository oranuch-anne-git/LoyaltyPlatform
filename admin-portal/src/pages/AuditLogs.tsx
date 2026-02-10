import { useEffect, useState } from 'react';
import { apiGet } from '../api';

type AuditLog = {
  id: string;
  action: string;
  resource: string;
  resourceId: string | null;
  details: string | null;
  ip: string | null;
  createdAt: string;
  adminUser: { email: string; name: string | null } | null;
};

export default function AuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet<AuditLog[]>('/analytics/audit-logs?limit=100')
      .then(setLogs)
      .catch(() => setLogs([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="container">Loading audit logs…</div>;

  return (
    <div className="container">
      <h1 style={{ marginBottom: '1.5rem', fontWeight: 600 }}>Audit Logs</h1>
      <div className="card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Time</th>
              <th>Admin</th>
              <th>Action</th>
              <th>Resource</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr><td colSpan={5}>No audit logs yet.</td></tr>
            ) : (
              logs.map((l) => (
                <tr key={l.id}>
                  <td>{new Date(l.createdAt).toLocaleString()}</td>
                  <td>{l.adminUser?.email ?? '—'}</td>
                  <td><span className="badge badge-muted">{l.action}</span></td>
                  <td>{l.resource}{l.resourceId ? ` / ${l.resourceId}` : ''}</td>
                  <td style={{ maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis' }}>{l.details || '—'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
