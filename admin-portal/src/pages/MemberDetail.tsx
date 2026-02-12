import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiGet, apiPost, apiPatch } from '../api';

type Member = {
  id: string;
  memberId: string;
  crmId: string | null;
  firstName: string | null;
  lastName: string | null;
  nationalType: string | null;
  citizenId: string | null;
  passport: string | null;
  gender: string | null;
  birthdate: string | null;
  mobile: string | null;
  email: string | null;
  channel: string | null;
  pointBalance: number;
  levelCode: string | null;
  memberLevel: { id: string; code: string; name: string } | null;
  addr_addressNo: string | null;
  addr_building: string | null;
  addr_road: string | null;
  addr_soi: string | null;
  addr_moo: string | null;
  addr_subdistrict: string | null;
  addr_subdistrictCode: string | null;
  addr_district: string | null;
  addr_districtCode: string | null;
  addr_province: string | null;
  addr_provinceCode: string | null;
  addr_zipCode: string | null;
  addr_country: string | null;
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
  firstName: '',
  lastName: '',
  nationalType: '',
  citizenId: '',
  passport: '',
  gender: '',
  birthdate: '',
  mobile: '',
  email: '',
  levelCode: '',
};
const emptyAddress = {
  addr_addressNo: '',
  addr_building: '',
  addr_road: '',
  addr_soi: '',
  addr_moo: '',
  addr_subdistrict: '',
  addr_subdistrictCode: '',
  addr_district: '',
  addr_districtCode: '',
  addr_province: '',
  addr_provinceCode: '',
  addr_zipCode: '',
  addr_country: '',
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
  const [provinces, setProvinces] = useState<{ id: string; code: string; nameTh: string; nameEn: string | null }[]>([]);
  const [districts, setDistricts] = useState<{ id: string; code: string; nameTh: string; nameEn: string | null }[]>([]);
  const [subdistricts, setSubdistricts] = useState<{ id: string; code: string; nameTh: string; nameEn: string | null; zipCode: string | null }[]>([]);
  const [selectedDistrictId, setSelectedDistrictId] = useState('');
  const [selectedDistrictCode, setSelectedDistrictCode] = useState('');
  type ZipFilter = { provinces: typeof provinces; districts: typeof districts; subdistricts: typeof subdistricts };
  const [zipFilter, setZipFilter] = useState<ZipFilter | null>(null);
  const [zipFilterZip, setZipFilterZip] = useState<string>(''); // zip code that zipFilter was fetched for
  const [zipLoading, setZipLoading] = useState(false);

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
    apiGet<{ id: string; code: string; nameTh: string; nameEn: string | null }[]>('/provinces').then(setProvinces).catch(() => setProvinces([]));
  }, []);

  useEffect(() => {
    if (!address.addr_provinceCode) {
      setDistricts([]);
      setSelectedDistrictId('');
      setSelectedDistrictCode('');
      setSubdistricts([]);
      return;
    }
    if (zipFilter) {
      setDistricts(zipFilter.districts);
      const districtCode = address.addr_districtCode != null ? String(address.addr_districtCode).trim() : '';
      const match = zipFilter.districts.find((d) => String(d.code).trim() === districtCode);
      if (match) {
        setSelectedDistrictId(match.id);
        setSelectedDistrictCode(String(match.code).trim());
      } else {
        setSelectedDistrictId('');
        setSelectedDistrictCode('');
      }
      return;
    }
    apiGet<{ id: string; code: string; nameTh: string; nameEn: string | null }[]>(`/districts?provinceCode=${encodeURIComponent(address.addr_provinceCode)}`)
      .then((list) => {
        setDistricts(Array.isArray(list) ? list : []);
        const districtCode = address.addr_districtCode != null ? String(address.addr_districtCode).trim() : '';
        const match = (Array.isArray(list) ? list : []).find((d) => String(d.code).trim() === districtCode);
        if (match) {
          setSelectedDistrictId(match.id);
          setSelectedDistrictCode(String(match.code).trim());
        } else {
          setSelectedDistrictId('');
          setSelectedDistrictCode('');
        }
      })
      .catch(() => setDistricts([]));
  }, [address.addr_provinceCode, address.addr_districtCode, zipFilter]);

  useEffect(() => {
    const codeToFetch = selectedDistrictCode || (address.addr_districtCode != null ? String(address.addr_districtCode).trim() : '');
    if (!selectedDistrictId) {
      setSubdistricts([]);
      return;
    }
    setSubdistricts([]);
    const url = codeToFetch
      ? `/subdistricts?districtCode=${encodeURIComponent(codeToFetch)}`
      : `/subdistricts?districtId=${encodeURIComponent(selectedDistrictId)}`;
    apiGet<{ id: string; code: string; nameTh: string; nameEn: string | null; zipCode: string | null }[] | { data?: { id: string; code: string; nameTh: string; nameEn: string | null; zipCode: string | null }[] }>(url)
      .then((res) => {
        const list = Array.isArray(res) ? res : (res?.data ?? []);
        setSubdistricts(Array.isArray(list) ? list : []);
      })
      .catch(() => setSubdistricts([]));
  }, [selectedDistrictId, selectedDistrictCode, address.addr_districtCode]);

  const fetchByZip = (zip: string) => {
    if (zip.length !== 5 || !/^\d{5}$/.test(zip)) return;
    setZipLoading(true);
    type ByZipRes = { provinces: ZipFilter['provinces']; districts: ZipFilter['districts']; subdistricts: ZipFilter['subdistricts'] };
    apiGet<ByZipRes | { data?: ByZipRes }>(`/by-zip?zipCode=${encodeURIComponent(zip)}`)
      .then((res) => {
        const data = (res && typeof res === 'object' && 'data' in res ? (res as { data?: ByZipRes }).data : res) as ByZipRes | undefined;
        if (!data || !Array.isArray(data.provinces)) return;
        const filter = { provinces: data.provinces, districts: data.districts ?? [], subdistricts: data.subdistricts ?? [] };
        setZipFilter(filter);
        setZipFilterZip(zip);
        const emptyProvince = !address.addr_provinceCode;
        if (emptyProvince && filter.provinces.length === 1 && filter.districts.length === 1 && filter.subdistricts.length === 1) {
          const p = filter.provinces[0];
          const d = filter.districts[0];
          const s = filter.subdistricts[0];
          setAddress((a) => ({
            ...a,
            addr_provinceCode: p.code,
            addr_province: p.nameTh,
            addr_districtCode: d.code,
            addr_district: d.nameTh,
            addr_subdistrictCode: s.code,
            addr_subdistrict: s.nameTh,
            addr_zipCode: s.zipCode || zip,
          }));
          setSelectedDistrictId(d.id);
          setSelectedDistrictCode(String(d.code).trim());
        }
      })
      .catch(() => {
        setZipFilter(null);
        setZipFilterZip('');
      })
      .finally(() => setZipLoading(false));
  };

  // When zipcode is 5 digits, fetch location by zip and filter dropdowns
  useEffect(() => {
    const zip = (address.addr_zipCode || '').trim();
    if (zip.length !== 5 || !/^\d{5}$/.test(zip)) {
      setZipFilter(null);
      setZipFilterZip('');
      return;
    }
    fetchByZip(zip);
  }, [address.addr_zipCode]);

  const handleZipBlur = () => {
    const zip = (address.addr_zipCode || '').trim();
    if (zip.length === 5 && /^\d{5}$/.test(zip) && zip !== zipFilterZip) fetchByZip(zip);
  };

  useEffect(() => {
    if (member && editing) {
      setProfile({
        firstName: member.firstName ?? '',
        lastName: member.lastName ?? '',
        nationalType: member.nationalType ?? '',
        citizenId: member.citizenId ?? '',
        passport: member.passport ?? '',
        gender: (member.gender === 'M' || member.gender === '1') ? '1' : (member.gender === 'F' || member.gender === '2') ? '2' : '',
        birthdate: toDateInputValue(member.birthdate),
        mobile: member.mobile ?? '',
        email: member.email ?? '',
        levelCode: member.memberLevel?.code ?? (member as { levelCode?: string }).levelCode ?? '',
      });
      setAddress({
        addr_addressNo: member.addr_addressNo ?? '',
        addr_building: member.addr_building ?? '',
        addr_road: member.addr_road ?? '',
        addr_soi: member.addr_soi ?? '',
        addr_moo: member.addr_moo ?? '',
        addr_subdistrict: member.addr_subdistrict ?? '',
        addr_subdistrictCode: member.addr_subdistrictCode ?? '',
        addr_district: member.addr_district ?? '',
        addr_districtCode: member.addr_districtCode ?? '',
        addr_province: member.addr_province ?? '',
        addr_provinceCode: member.addr_provinceCode ?? '',
        addr_zipCode: member.addr_zipCode ?? '',
        addr_country: member.addr_country ?? '',
      });
      setSelectedDistrictId('');
      setSelectedDistrictCode('');
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
        firstName: profile.firstName || undefined,
        lastName: profile.lastName || undefined,
        nationalType: profile.nationalType || undefined,
        citizenId: profile.citizenId || undefined,
        passport: profile.passport || undefined,
        gender: profile.gender || undefined,
        birthdate: profile.birthdate || undefined,
        mobile: profile.mobile || undefined,
        email: profile.email || undefined,
        levelCode: profile.levelCode || undefined,
        addr_addressNo: address.addr_addressNo || undefined,
        addr_building: address.addr_building || undefined,
        addr_road: address.addr_road || undefined,
        addr_soi: address.addr_soi || undefined,
        addr_moo: address.addr_moo || undefined,
        addr_subdistrict: address.addr_subdistrict || undefined,
        addr_subdistrictCode: address.addr_subdistrictCode || undefined,
        addr_district: address.addr_district || undefined,
        addr_districtCode: address.addr_districtCode || undefined,
        addr_province: address.addr_province || undefined,
        addr_provinceCode: address.addr_provinceCode || undefined,
        addr_zipCode: address.addr_zipCode || undefined,
        addr_country: address.addr_country || undefined,
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
      member.addr_moo,
      [member.addr_subdistrict, member.addr_district, member.addr_province].filter(Boolean).join(', '),
      member.addr_zipCode,
      member.addr_country,
    ].filter(Boolean);
    return parts.length ? parts.join(', ') : '—';
  };

  if (!member) return <div className="container">Loading or not found.</div>;

  return (
    <div className="container">
      <button type="button" className="btn btn-ghost" style={{ marginBottom: '1rem' }} onClick={() => navigate('/members')}>← Back to Members</button>
      <h1 style={{ marginBottom: '0.25rem', fontWeight: 600 }}>Member: {member.memberId}</h1>
      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>ID: <code title={member.id}>{member.id}</code></p>
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
              <div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID (UUID)</div><div><code style={{ fontSize: '0.8rem', wordBreak: 'break-all' }}>{member.id}</code></div></div>
              <div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>CRM ID</div><div>{member.crmId || '—'}</div></div>
              <div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>First name</div><div>{member.firstName || '—'}</div></div>
              <div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Last name</div><div>{member.lastName || '—'}</div></div>
              <div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>National type</div><div>{member.nationalType === 'THAI' ? 'Thai' : member.nationalType === 'OTHER' ? 'Other' : member.nationalType || '—'}</div></div>
              <div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Citizen ID</div><div>{member.citizenId || '—'}</div></div>
              <div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Passport</div><div>{member.passport || '—'}</div></div>
              <div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Gender</div><div>{member.gender === '1' || member.gender === 'M' ? 'Male' : member.gender === '2' || member.gender === 'F' ? 'Female' : member.gender || '—'}</div></div>
              <div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Birthdate</div><div>{member.birthdate ? new Date(member.birthdate).toLocaleDateString() : '—'}</div></div>
              <div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Mobile</div><div>{member.mobile || '—'}</div></div>
              <div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Email</div><div>{member.email || '—'}</div></div>
              <div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Point balance</div><div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent)' }}>{member.pointBalance}</div></div>
              <div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Level</div><div><span className="badge">{member.memberLevel?.name ?? '—'}</span> {member.memberLevel?.code ? <span className="badge badge-muted">{member.memberLevel.code}</span> : null}</div></div>
              <div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Channel</div><div><span className="badge badge-muted">{member.channel ?? '—'}</span></div></div>
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
                <div className="form-group"><label>First name</label><input type="text" value={profile.firstName} onChange={(e) => setProfile((p) => ({ ...p, firstName: e.target.value }))} placeholder="Given name" /></div>
                <div className="form-group"><label>Last name</label><input type="text" value={profile.lastName} onChange={(e) => setProfile((p) => ({ ...p, lastName: e.target.value }))} placeholder="Surname" /></div>
                <div className="form-group"><label>National type</label><select value={profile.nationalType} onChange={(e) => setProfile((p) => ({ ...p, nationalType: e.target.value }))}><option value="">—</option><option value="THAI">Thai</option><option value="OTHER">Other</option></select></div>
                <div className="form-group"><label>Citizen ID</label><input type="text" value={profile.citizenId} onChange={(e) => setProfile((p) => ({ ...p, citizenId: e.target.value }))} placeholder="Thai ID" /></div>
                <div className="form-group"><label>Passport</label><input type="text" value={profile.passport} onChange={(e) => setProfile((p) => ({ ...p, passport: e.target.value }))} placeholder="Passport no." /></div>
                <div className="form-group"><label>Gender</label><select value={profile.gender} onChange={(e) => setProfile((p) => ({ ...p, gender: e.target.value }))}><option value="">—</option><option value="1">Male</option><option value="2">Female</option></select></div>
                <div className="form-group"><label>Birthdate</label><input type="date" value={profile.birthdate} onChange={(e) => setProfile((p) => ({ ...p, birthdate: e.target.value }))} /></div>
                <div className="form-group"><label>Mobile</label><input type="tel" value={profile.mobile} onChange={(e) => setProfile((p) => ({ ...p, mobile: e.target.value }))} placeholder="Mobile" /></div>
                <div className="form-group"><label>Email</label><input type="email" value={profile.email} onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))} placeholder="Email" /></div>
                <div className="form-group"><label>Level</label><select value={profile.levelCode} onChange={(e) => setProfile((p) => ({ ...p, levelCode: e.target.value }))}><option value="">—</option>{levels.map((l) => (<option key={l.id} value={l.code}>{l.name} ({l.code})</option>))}</select></div>
              </div>
            </div>
            <div>
              <h3 style={{ fontSize: '0.95rem', marginBottom: '0.75rem' }}>Address</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                <div className="form-group"><label>Address no.</label><input type="text" value={address.addr_addressNo} onChange={(e) => setAddress((a) => ({ ...a, addr_addressNo: e.target.value }))} placeholder="No." /></div>
                <div className="form-group"><label>Building</label><input type="text" value={address.addr_building} onChange={(e) => setAddress((a) => ({ ...a, addr_building: e.target.value }))} placeholder="Building" /></div>
                <div className="form-group"><label>Road</label><input type="text" value={address.addr_road} onChange={(e) => setAddress((a) => ({ ...a, addr_road: e.target.value }))} placeholder="Road" /></div>
                <div className="form-group"><label>Soi</label><input type="text" value={address.addr_soi} onChange={(e) => setAddress((a) => ({ ...a, addr_soi: e.target.value }))} placeholder="Soi" /></div>
                <div className="form-group"><label>Moo</label><input type="text" value={address.addr_moo} onChange={(e) => setAddress((a) => ({ ...a, addr_moo: e.target.value }))} placeholder="Moo" /></div>
                <div className="form-group"><label>Zip code (รหัสไปรษณีย์)</label>
                  <input type="text" value={address.addr_zipCode} onChange={(e) => setAddress((a) => ({ ...a, addr_zipCode: e.target.value }))} onBlur={handleZipBlur} placeholder="5 digits" maxLength={5} />
                  {zipLoading && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '0.25rem' }}>Looking up…</span>}
                  {zipFilter && zipFilterZip === (address.addr_zipCode || '').trim() && <span style={{ fontSize: '0.75rem', color: 'var(--success)', marginLeft: '0.25rem' }}>Filtered by zip</span>}
                  {!zipLoading && (address.addr_zipCode || '').trim().length === 5 && zipFilterZip === (address.addr_zipCode || '').trim() && zipFilter && zipFilter.subdistricts.length === 0 && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.25rem' }}>No locations for this zip in DB. Run in admin-backend: npm run prisma:seed-thailand</span>
                  )}
                </div>
                {(() => {
                  const useZipFilter = zipFilter && (address.addr_zipCode || '').trim() === zipFilterZip;
                  const provinceOptions = useZipFilter ? zipFilter.provinces : provinces;
                  const districtOptions = useZipFilter ? zipFilter.districts : districts;
                  // When a district is selected, always show district-scoped subdistricts only (never the full zip list)
                  const subdistrictOptionsRaw = selectedDistrictId ? subdistricts : (useZipFilter ? zipFilter.subdistricts : subdistricts);
                  const subdistrictOptions = Array.isArray(subdistrictOptionsRaw) ? subdistrictOptionsRaw : [];
                  return (
                    <>
                      <div className="form-group"><label>Province (จังหวัด)</label>
                        <select value={address.addr_provinceCode} onChange={(e) => {
                          const code = e.target.value;
                          const p = provinceOptions.find((x) => x.code === code);
                          setAddress((a) => ({ ...a, addr_provinceCode: code, addr_province: p?.nameTh ?? '', addr_districtCode: '', addr_district: '', addr_subdistrictCode: '', addr_subdistrict: '' }));
                          setSelectedDistrictId('');
                          setSelectedDistrictCode('');
                        }}>
                          <option value="">— เลือกจังหวัด —</option>
                          {provinceOptions.map((p) => (<option key={p.id} value={p.code}>{p.nameTh}</option>))}
                        </select>
                      </div>
                      <div className="form-group"><label>District (อำเภอ/เขต)</label>
                        <select value={selectedDistrictId} onChange={(e) => {
                          const id = e.target.value;
                          const d = districtOptions.find((x) => x.id === id);
                          const districtCode = d ? String(d.code).trim() : '';
                          setSelectedDistrictId(id);
                          setSelectedDistrictCode(districtCode);
                          setAddress((a) => ({ ...a, addr_districtCode: d?.code ?? '', addr_district: d?.nameTh ?? a.addr_district, addr_subdistrictCode: '', addr_subdistrict: '' }));
                        }}>
                          <option value="">— เลือกอำเภอ/เขต —</option>
                          {districtOptions.map((d) => (<option key={d.id} value={d.id}>{d.nameTh}</option>))}
                        </select>
                      </div>
                      <div className="form-group"><label>Subdistrict (ตำบล/แขวง)</label>
                        <select value={subdistrictOptions.find((s) => s.code === address.addr_subdistrictCode)?.id ?? ''} onChange={(e) => {
                          const id = e.target.value;
                          const s = subdistrictOptions.find((x) => x.id === id);
                          if (s) setAddress((a) => ({ ...a, addr_subdistrictCode: s.code, addr_subdistrict: s.nameTh, addr_zipCode: s.zipCode ?? a.addr_zipCode }));
                        }}>
                          <option value="">— เลือกตำบล/แขวง —</option>
                          {subdistrictOptions.map((s) => (<option key={s.id} value={s.id}>{s.nameTh}{s.zipCode ? ` (${s.zipCode})` : ''}</option>))}
                        </select>
                      </div>
                    </>
                  );
                })()}
                <div className="form-group"><label>Country</label><input type="text" value={address.addr_country} onChange={(e) => setAddress((a) => ({ ...a, addr_country: e.target.value }))} placeholder="Country" /></div>
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
