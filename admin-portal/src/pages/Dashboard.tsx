import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiGet } from '../api';
import './Dashboard.css';

type DashboardData = {
  totalMembers: number;
  activeCampaigns: number;
  totalRedemptions: number;
  totalPointsEarned: number;
  totalPointsRedeemed: number;
};

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet<DashboardData>('/analytics/dashboard')
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="container">Loading dashboard…</div>;
  if (!data) return <div className="container">Failed to load dashboard.</div>;

  const cards = [
    { title: 'Total Members', value: data.totalMembers, link: '/members', accent: true },
    { title: 'Active Campaigns', value: data.activeCampaigns, link: '/campaigns' },
    { title: 'Total Redemptions', value: data.totalRedemptions },
    { title: 'Points Earned', value: data.totalPointsEarned.toLocaleString() },
    { title: 'Points Redeemed', value: data.totalPointsRedeemed.toLocaleString() },
  ];

  return (
    <div className="container">
      <h1 style={{ marginBottom: '1.5rem', fontWeight: 600 }}>Dashboard</h1>
      <div className="dashboard-grid">
        {cards.map((c) => (
          <div key={c.title} className="card dashboard-card">
            <div className="dashboard-card-title">{c.title}</div>
            <div className={`dashboard-card-value ${c.accent ? 'accent' : ''}`}>{c.value}</div>
            {c.link && (
              <Link to={c.link} className="dashboard-card-link">
                View →
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
