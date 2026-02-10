import { useEffect, useState } from 'react';
import { apiGet } from '../api';

type Reward = {
  id: string;
  name: string;
  description: string | null;
  category: string;
  pointCost: number;
  quantity: number;
  validFrom: string | null;
  validTo: string | null;
  active: boolean;
};

export default function Rewards() {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet<Reward[]>('/rewards?active=false')
      .then(setRewards)
      .catch(() => setRewards([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="container">Loading rewards…</div>;

  return (
    <div className="container">
      <h1 style={{ marginBottom: '1.5rem', fontWeight: 600 }}>Rewards & Privileges</h1>
      <div className="card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Category</th>
              <th>Point Cost</th>
              <th>Quantity</th>
              <th>Valid From</th>
              <th>Valid To</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {rewards.length === 0 ? (
              <tr><td colSpan={7}>No rewards. Create via API or seed.</td></tr>
            ) : (
              rewards.map((r) => (
                <tr key={r.id}>
                  <td>{r.name}</td>
                  <td><span className="badge badge-muted">{r.category}</span></td>
                  <td>{r.pointCost}</td>
                  <td>{r.quantity < 0 ? 'Unlimited' : r.quantity}</td>
                  <td>{r.validFrom ? new Date(r.validFrom).toLocaleDateString() : '—'}</td>
                  <td>{r.validTo ? new Date(r.validTo).toLocaleDateString() : '—'}</td>
                  <td><span className={r.active ? 'badge badge-success' : 'badge badge-muted'}>{r.active ? 'Active' : 'Inactive'}</span></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
