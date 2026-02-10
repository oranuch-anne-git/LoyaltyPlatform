import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiGet } from '../api';

type Member = {
  id: string;
  memberId: string;
  name: string | null;
  surname: string | null;
  displayName: string | null;
  email: string | null;
  mobile: string | null;
  channel: string | null;
  pointBalance: number;
  createdAt: string;
  memberLevel: { id: string; code: string; name: string } | null;
};

type Res = { items: Member[]; total: number; page: number; limit: number };

export default function Members() {
  const [data, setData] = useState<Res | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  useEffect(() => {
    apiGet<Res>(`/members?page=${page}&limit=20${search ? `&search=${encodeURIComponent(search)}` : ''}`)
      .then(setData)
      .catch(() => setData(null));
  }, [page, search]);

  return (
    <div className="container">
      <h1 style={{ marginBottom: '1rem', fontWeight: 600 }}>Members</h1>
      <div className="card" style={{ marginBottom: '1rem' }}>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label>Search</label>
          <input
            type="text"
            placeholder="Member ID, name, surname, email, mobile..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
      </div>
      <div className="card">
        {!data ? (
          <p>Loading…</p>
        ) : (
          <>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Member ID</th>
                  <th>Name</th>
                  <th>Surname</th>
                  <th>Level</th>
                  <th>Email</th>
                  <th>Channel</th>
                  <th>Points</th>
                  <th>Joined</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((m) => (
                  <tr key={m.id}>
                    <td><code>{m.memberId}</code></td>
                    <td>{m.name || m.displayName || '—'}</td>
                    <td>{m.surname || '—'}</td>
                    <td><span className="badge">{m.memberLevel?.name ?? '—'}</span></td>
                    <td>{m.email || '—'}</td>
                    <td><span className="badge badge-muted">{m.channel ?? '—'}</span></td>
                    <td>{m.pointBalance}</td>
                    <td>{new Date(m.createdAt).toLocaleDateString()}</td>
                    <td><Link to={`/members/${m.id}`} className="btn btn-ghost" style={{ padding: '0.4rem 0.8rem' }}>View</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
              <span className="text-muted">{data.total} total</span>
              <div>
                <button type="button" className="btn btn-ghost" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</button>
                <span style={{ margin: '0 0.75rem' }}>Page {page}</span>
                <button type="button" className="btn btn-ghost" disabled={page * data.limit >= data.total} onClick={() => setPage((p) => p + 1)}>Next</button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
