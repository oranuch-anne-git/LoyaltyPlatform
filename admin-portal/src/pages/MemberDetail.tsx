import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiGet, apiPost, apiPatch } from '../api';

type Member = {
  id: string;
  memberId: string;
  name: string | null;
  surname: string | null;
  nationalType: string | null;
  citizenId: string | null;
  passport: string | null;
  sex: string | null;
  birthdate: string | null;
  mobile: string | null;
  email: string | null;
  displayName: string | null;
  channel: string | null;
  pointBalance: number;
  memberLevelId: string | null;
  memberLevel: { id: string; code: string; name: string } | null;
  addr_addressNo: string | null;
  addr_building: string | null;
  addr_road: string | null;
  addr_soi: string | null;
  addr_subdistrict: string | null;
  addr_district: string | null;
  addr_province: string | null;
  addr_postalCode: string | null;
  pointLedgers: { id: string; change: number; type: string; createdAt: string }[];
  transactions: { id: string; amount: number; type: string; createdAt: string }[];
  redemptions: { id: string; pointsUsed: number; reward: { name: string }; createdAt: string }[];
};

function toDateInputValue(d: string | null): string {
  if (!d) return '';
  const date = new Date(d);
  return date.toISOString().slice(0, 10);
}

const emptyProfile = {
  name: '',
  surname: '',
  nationalType: '',
  citizenId: '',
  passport: '',
  sex: '',
  birthdate: '',
  mobile: '',
  email: '',
  displayName: '',
  memberLevelId: '',
};
const emptyAddress = {
  addr_addressNo: '',
  addr_building: '',
  addr_road: '',
  addr_soi: '',
  addr_subdistrict: '',
  addr_district: '',
  addr_province: '',
  addr_postalCode: '',
};

export default function MemberDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [member, setMember] = useState<Member | null>(null);
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState({ ...emptyProfile });
  const [address, setAddress] = useState({ ...emptyAddress });
  const [adjustPoints, setAdjustPoints] = useState('');
  const [adjustReason, setAdjustReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [levels, setLevels] = useState<{ id: string; code: string; name: string }[]>([]);

  useEffect(() => {
    if (!id) return;
    apiGet<Member>(`/members/${id}`)
      .then(setMember)
      .catch(() => setMember(null));
  }, [id]);

  useEffect(() => {
    apiGet<{ id: string; code: string; name: string }[]>('/members/levels').then(setLevels).catch(() => setLevels([]));
  }, []);

  useEffect(() => {
    if (member && editing) {
      setProfile({
        name: member.name ?? '',
        surname: member.surname ?? '',
        nationalType: member.nationalType ?? '',
        citizenId: member.citizenId ?? '',
        passport: member.passport ?? '',
        sex: member.sex ?? '',
        birthdate: toDateInputValue(member.birthdate),
        mobile: member.mobile ?? '',
        email: member.email ?? '',
        displayName: member.displayName ?? '',
        memberLevelId: member.memberLevelId ?? '',
      });
      setAddress({
        addr_addressNo: member.addr_addressNo ?? '',
        addr_building: member.addr_building ?? '',
        addr_road: member.addr_road ?? '',
        addr_soi: member.addr_soi ?? '',
        addr_subdistrict: member.addr_subdistrict ?? '',
        addr_district: member.addr_district ?? '',
        addr_province: member.addr_province ?? '',
        addr_postalCode: member.addr_postalCode ?? '',
      });
    }
  }, [member, editing]);

  const handleAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    const points = parseInt(adjustPoints, 10);
    if (isNaN(points) || !id) return;
    setSubmitting(true);
    try {
      await apiPost('/points/adjust', { memberId: id, points, reason: adjustReason || undefined });
      setAdjustPoints('');
      setAdjustReason('');
      const updated = await apiGet<Member>(`/members/${id}`);
      setMember(updated);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setProfileSaving(true);
    try {
      await apiPatch(`/members/${id}`, {
        name: profile.name || undefined,
        surname: profile.surname || undefined,
        nationalType: profile.nationalType || undefined,
        citizenId: profile.citizenId || undefined,
        passport: profile.passport || undefined,
        sex: profile.sex || undefined,
        birthdate: profile.birthdate || undefined,
        mobile: profile.mobile || undefined,
        email: profile.email || undefined,
        displayName: profile.displayName || undefined,
        memberLevelId: profile.memberLevelId || undefined,
        addr_addressNo: address.addr_addressNo || undefined,
        addr_building: address.addr_building || undefined,
        addr_road: address.addr_road || undefined,
        addr_soi: address.addr_soi || undefined,
        addr_subdistrict: address.addr_subdistrict || undefined,
        addr_district: address.addr_district || undefined,
        addr_province: address.addr_province || undefined,
        addr_postalCode: address.addr_postalCode || undefined,
      });
      const updated = await apiGet<Member>(`/members/${id}`);
      setMember(updated);
      setEditing(false);
    } finally {
      setProfileSaving(false);
    }
  };

  const formatAddressLine = () => {
    if (!member) return '—';
    const parts = [
      member.addr_addressNo,
      member.addr_building,
      member.addr_soi && member.addr_road ? `Soi ${member.addr_soi} ${member.addr_road}` : member.addr_road || member.addr_soi,
      [member.addr_subdistrict, member.addr_district, member.addr_province].filter(Boolean).join(', '),
      member.addr_postalCode,
    ].filter(Boolean);
    return parts.length ? parts.join(', ') : '—';
  };

  if (!member) return <div className="container">Loading or not found.</div>;

  return (
    <div className="container">
      <button type="button" className="btn btn-ghost" style={{ marginBottom: '1rem' }} onClick={() => navigate('/members')}>← Back to Members</button>
      <h1 style={{ marginBottom: '1rem', fontWeight: 600 }}>Member: {member.memberId}</h1>
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <h2 style={{ fontSize: '1.1rem', margin: 0 }}>Profile</h2>
          {!editing ? (
            <button type="button" className="btn btn-primary" onClick={() => setEditing(true)}>Edit profile</button>
          ) : (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button type="button" className="btn btn-ghost" onClick={() => setEditing(false)}>Cancel</button>
              <button type="submit" form="profile-form" className="btn btn-primary" disabled={profileSaving}>{profileSaving ? 'Saving…' : 'Save'}</button>
            </div>
          )}
        </div>
        {!editing ? (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
              <div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Name</div><div>{member.name || '—'}</div></div>
              <div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Surname</div><div>{member.surname || '—'}</div></div>
              <div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>National type</div><div>{member.nationalType === 'THAI' ? 'Thai' : member.nationalType === 'OTHER' ? 'Other' : member.nationalType || '—'}</div></div>
              <div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Citizen ID</div><div>{member.citizenId || '—'}</div></div>
              <div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Passport</div><div>{member.passport || '—'}</div></div>
              <div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Sex</div><div>{member.sex === 'M' ? 'Male' : member.sex === 'F' ? 'Female' : member.sex || '—'}</div></div>
              <div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Birthdate</div><div>{member.birthdate ? new Date(member.birthdate).toLocaleDateString() : '—'}</div></div>
              <div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Mobile</div><div>{member.mobile || '—'}</div></div>
              <div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Email</div><div>{member.email || '—'}</div></div>
              <div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Point balance</div><div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent)' }}>{member.pointBalance}</div></div>
              <div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Level</div><div><span className="badge">{member.memberLevel?.name ?? '—'}</span></div></div>
              <div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Channel</div><div><span className="badge badge-muted">{member.channel ?? '—'}</span></div></div>
              <div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Display name</div><div>{member.displayName || '—'}</div></div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Address</div>
              <div>{formatAddressLine()}</div>
            </div>
          </>
        ) : (
          <form id="profile-form" onSubmit={handleSaveProfile}>
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '0.95rem', marginBottom: '0.75rem' }}>Profile</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                <div className="form-group"><label>Name</label><input type="text" value={profile.name} onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))} placeholder="Given name" /></div>
                <div className="form-group"><label>Surname</label><input type="text" value={profile.surname} onChange={(e) => setProfile((p) => ({ ...p, surname: e.target.value }))} placeholder="Surname" /></div>
                <div className="form-group"><label>National type</label><select value={profile.nationalType} onChange={(e) => setProfile((p) => ({ ...p, nationalType: e.target.value }))}><option value="">—</option><option value="THAI">Thai</option><option value="OTHER">Other</option></select></div>
                <div className="form-group"><label>Citizen ID</label><input type="text" value={profile.citizenId} onChange={(e) => setProfile((p) => ({ ...p, citizenId: e.target.value }))} placeholder="Thai ID" /></div>
                <div className="form-group"><label>Passport</label><input type="text" value={profile.passport} onChange={(e) => setProfile((p) => ({ ...p, passport: e.target.value }))} placeholder="Passport no." /></div>
                <div className="form-group"><label>Sex</label><select value={profile.sex} onChange={(e) => setProfile((p) => ({ ...p, sex: e.target.value }))}><option value="">—</option><option value="M">Male</option><option value="F">Female</option><option value="OTHER">Other</option></select></div>
                <div className="form-group"><label>Birthdate</label><input type="date" value={profile.birthdate} onChange={(e) => setProfile((p) => ({ ...p, birthdate: e.target.value }))} /></div>
                <div className="form-group"><label>Mobile</label><input type="tel" value={profile.mobile} onChange={(e) => setProfile((p) => ({ ...p, mobile: e.target.value }))} placeholder="Mobile" /></div>
                <div className="form-group"><label>Email</label><input type="email" value={profile.email} onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))} placeholder="Email" /></div>
                <div className="form-group"><label>Display name</label><input type="text" value={profile.displayName} onChange={(e) => setProfile((p) => ({ ...p, displayName: e.target.value }))} placeholder="e.g. LINE name" /></div>
                <div className="form-group"><label>Level</label><select value={profile.memberLevelId} onChange={(e) => setProfile((p) => ({ ...p, memberLevelId: e.target.value }))}><option value="">—</option>{levels.map((l) => (<option key={l.id} value={l.id}>{l.name}</option>))}</select></div>
              </div>
            </div>
            <div>
              <h3 style={{ fontSize: '0.95rem', marginBottom: '0.75rem' }}>Address</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                <div className="form-group"><label>Address no.</label><input type="text" value={address.addr_addressNo} onChange={(e) => setAddress((a) => ({ ...a, addr_addressNo: e.target.value }))} placeholder="No." /></div>
                <div className="form-group"><label>Building</label><input type="text" value={address.addr_building} onChange={(e) => setAddress((a) => ({ ...a, addr_building: e.target.value }))} placeholder="Building" /></div>
                <div className="form-group"><label>Road</label><input type="text" value={address.addr_road} onChange={(e) => setAddress((a) => ({ ...a, addr_road: e.target.value }))} placeholder="Road" /></div>
                <div className="form-group"><label>Soi</label><input type="text" value={address.addr_soi} onChange={(e) => setAddress((a) => ({ ...a, addr_soi: e.target.value }))} placeholder="Soi" /></div>
                <div className="form-group"><label>Subdistrict</label><input type="text" value={address.addr_subdistrict} onChange={(e) => setAddress((a) => ({ ...a, addr_subdistrict: e.target.value }))} placeholder="Subdistrict" /></div>
                <div className="form-group"><label>District</label><input type="text" value={address.addr_district} onChange={(e) => setAddress((a) => ({ ...a, addr_district: e.target.value }))} placeholder="District" /></div>
                <div className="form-group"><label>Province</label><input type="text" value={address.addr_province} onChange={(e) => setAddress((a) => ({ ...a, addr_province: e.target.value }))} placeholder="Province" /></div>
                <div className="form-group"><label>Postal code</label><input type="text" value={address.addr_postalCode} onChange={(e) => setAddress((a) => ({ ...a, addr_postalCode: e.target.value }))} placeholder="Postal code" /></div>
              </div>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '1rem' }}>Channel and Point balance are read-only.</p>
          </form>
        )}
      </div>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Adjust Points</h2>
        <form onSubmit={handleAdjust} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ marginBottom: 0, width: '120px' }}>
            <label>Points (+ / -)</label>
            <input type="number" value={adjustPoints} onChange={(e) => setAdjustPoints(e.target.value)} placeholder="e.g. 100 or -50" required />
          </div>
          <div className="form-group" style={{ marginBottom: 0, flex: 1, minWidth: '200px' }}>
            <label>Reason (optional)</label>
            <input type="text" value={adjustReason} onChange={(e) => setAdjustReason(e.target.value)} placeholder="Reason for adjustment" />
          </div>
          <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Saving…' : 'Apply'}</button>
        </form>
      </div>

      <div className="card" style={{ marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Recent Point Ledger</h2>
        <table className="data-table">
          <thead><tr><th>Date</th><th>Change</th><th>Type</th></tr></thead>
          <tbody>
            {member.pointLedgers.slice(0, 20).map((l) => (
              <tr key={l.id}>
                <td>{new Date(l.createdAt).toLocaleString()}</td>
                <td style={{ color: l.change >= 0 ? 'var(--success)' : 'var(--danger)' }}>{l.change >= 0 ? '+' : ''}{l.change}</td>
                <td>{l.type}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card">
        <h2 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Recent Redemptions</h2>
        <table className="data-table">
          <thead><tr><th>Date</th><th>Reward</th><th>Points</th></tr></thead>
          <tbody>
            {member.redemptions.length === 0 ? (
              <tr><td colSpan={3}>No redemptions yet.</td></tr>
            ) : (
              member.redemptions.map((r) => (
                <tr key={r.id}>
                  <td>{new Date(r.createdAt).toLocaleString()}</td>
                  <td>{r.reward.name}</td>
                  <td>{r.pointsUsed}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
