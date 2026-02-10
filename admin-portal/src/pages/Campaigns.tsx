import { useEffect, useState } from 'react';
import { apiGet } from '../api';

type Campaign = {
  id: string;
  name: string;
  type: string;
  description: string | null;
  validFrom: string;
  validTo: string;
  active: boolean;
};

export default function Campaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet<Campaign[]>('/campaigns?active=false')
      .then(setCampaigns)
      .catch(() => setCampaigns([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="container">Loading campaigns…</div>;

  return (
    <div className="container">
      <h1 style={{ marginBottom: '1.5rem', fontWeight: 600 }}>Promotions & Campaigns</h1>
      <div className="card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Valid From</th>
              <th>Valid To</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {campaigns.length === 0 ? (
              <tr><td colSpan={5}>No campaigns. Create via API or seed.</td></tr>
            ) : (
              campaigns.map((c) => (
                <tr key={c.id}>
                  <td>{c.name}</td>
                  <td><span className="badge badge-muted">{c.type}</span></td>
                  <td>{new Date(c.validFrom).toLocaleDateString()}</td>
                  <td>{new Date(c.validTo).toLocaleDateString()}</td>
                  <td><span className={c.active ? 'badge badge-success' : 'badge badge-muted'}>{c.active ? 'Active' : 'Inactive'}</span></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
