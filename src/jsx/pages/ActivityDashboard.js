import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API = 'https://chitanya-musium-backend-new-and-latest.onrender.com/api/activity';

const ActivityDashboard = () => {
  const [stats, setStats] = useState(null);
  const [logs, setLogs] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [tab, setTab] = useState('overview');
  const [filters, setFilters] = useState({ username: '', action: '', page: '', from_date: '', to_date: '' });

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const [s, l, ss] = await Promise.all([
        axios.get(`${API}/stats`),
        axios.get(`${API}/logs?limit=100`),
        axios.get(`${API}/sessions?limit=50`)
      ]);
      setStats(s.data);
      setLogs(l.data);
      setSessions(ss.data);
    } catch { }
  };

  const fetchLogs = async () => {
    const params = new URLSearchParams(Object.entries(filters).filter(([,v]) => v)).toString();
    const { data } = await axios.get(`${API}/logs?${params}`);
    setLogs(data);
  };

  const actionColor = (a) => {
    const colors = { page_view: '#4facfe', login: '#43e97b', create: '#38f9d7', edit: '#f9d423', delete: '#f5576c', print: '#764ba2', download: '#667eea', search: '#00c6fb', payment: '#fa709a', logout: '#868e96' };
    return colors[a] || '#adb5bd';
  };

  return (
    <div className="container-fluid">
      {/* HEADER */}
      <div className="mb-4">
        <h3 style={{ fontWeight: 700 }}>
          <span style={{ background: 'linear-gradient(135deg, #f5576c, #ff6b6b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            📡 Activity Monitor & Analytics
          </span>
        </h3>
        <p className="text-muted mb-0">Real-time tracking • Who • What • When • Where</p>
      </div>

      {/* STATS CARDS */}
      {stats && (
        <div className="row mb-4">
          {[
            { label: 'Total Actions', value: stats.total_logs, icon: '📊', gradient: 'linear-gradient(135deg, #667eea, #764ba2)' },
            { label: 'Today', value: stats.today_logs, icon: '📅', gradient: 'linear-gradient(135deg, #f093fb, #f5576c)' },
            { label: 'Unique Users', value: stats.unique_users, icon: '👥', gradient: 'linear-gradient(135deg, #4facfe, #00f2fe)' },
            { label: 'Top Page', value: stats.top_pages?.[0]?.page || '-', icon: '🏆', gradient: 'linear-gradient(135deg, #43e97b, #38f9d7)' },
          ].map((card, i) => (
            <div key={i} className="col-md-3 mb-3">
              <div className="card border-0 shadow-sm" style={{ borderRadius: 16, overflow: 'hidden' }}>
                <div className="card-body text-white py-4" style={{ background: card.gradient }}>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <small style={{ opacity: 0.8 }}>{card.label}</small>
                      <h3 className="mb-0 fw-bold">{card.value}</h3>
                    </div>
                    <span style={{ fontSize: 36 }}>{card.icon}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TABS */}
      <div className="mb-3 d-flex gap-2">
        {['overview', 'logs', 'sessions', 'geo'].map(t => (
          <button key={t} className={`btn btn-sm ${tab === t ? 'btn-dark' : 'btn-outline-dark'}`} style={{ borderRadius: 20, textTransform: 'capitalize' }} onClick={() => setTab(t)}>
            {t === 'overview' ? '📊 ' : t === 'logs' ? '📋 ' : t === 'sessions' ? '👁️ ' : '🌍 '}{t}
          </button>
        ))}
      </div>

      {/* OVERVIEW */}
      {tab === 'overview' && stats && (
        <div className="row">
          <div className="col-md-6 mb-4">
            <div className="card border-0 shadow-sm" style={{ borderRadius: 16 }}>
              <div className="card-body">
                <h6 className="fw-bold mb-3">🏆 Top Pages</h6>
                {stats.top_pages?.map((p, i) => (
                  <div key={i} className="d-flex justify-content-between align-items-center mb-2">
                    <span><span className="badge bg-light text-dark me-2">{i + 1}</span> {p.page}</span>
                    <span className="badge" style={{ background: '#4facfe', color: '#fff' }}>{p.visits}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="col-md-6 mb-4">
            <div className="card border-0 shadow-sm" style={{ borderRadius: 16 }}>
              <div className="card-body">
                <h6 className="fw-bold mb-3">👤 Most Active Users</h6>
                {stats.top_users?.map((u, i) => (
                  <div key={i} className="d-flex justify-content-between align-items-center mb-2">
                    <span><span className="badge bg-light text-dark me-2">{i + 1}</span> {u.username}</span>
                    <span className="badge bg-success">{u.actions} actions</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="col-12">
            <div className="card border-0 shadow-sm" style={{ borderRadius: 16 }}>
              <div className="card-body">
                <h6 className="fw-bold mb-3">⏰ Today's Hourly Activity</h6>
                <div className="d-flex align-items-end gap-1" style={{ height: 120 }}>
                  {Array.from({ length: 24 }, (_, h) => {
                    const found = stats.hourly_activity?.find(a => a.hour === h);
                    const count = found?.count || 0;
                    const max = Math.max(...(stats.hourly_activity?.map(a => a.count) || [1]));
                    const height = max ? (count / max) * 100 : 0;
                    return (
                      <div key={h} className="text-center flex-fill" title={`${h}:00 - ${count} actions`}>
                        <div style={{ height: `${Math.max(height, 4)}%`, background: count ? 'linear-gradient(180deg, #4facfe, #00f2fe)' : '#e9ecef', borderRadius: 4, minHeight: 4, transition: 'all 0.3s' }}></div>
                        <small style={{ fontSize: 9, color: '#999' }}>{h}</small>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* LOGS */}
      {tab === 'logs' && (
        <>
          <div className="card border-0 shadow-sm mb-3" style={{ borderRadius: 16 }}>
            <div className="card-body py-3">
              <div className="d-flex gap-2 flex-wrap">
                <input className="form-control form-control-sm" placeholder="Username" value={filters.username} onChange={e => setFilters({ ...filters, username: e.target.value })} style={{ width: 140 }} />
                <select className="form-control form-control-sm" value={filters.action} onChange={e => setFilters({ ...filters, action: e.target.value })} style={{ width: 130 }}>
                  <option value="">All Actions</option>
                  {['page_view','login','logout','create','edit','delete','print','download','search','payment'].map(a => <option key={a} value={a}>{a}</option>)}
                </select>
                <input className="form-control form-control-sm" placeholder="Page" value={filters.page} onChange={e => setFilters({ ...filters, page: e.target.value })} style={{ width: 130 }} />
                <input type="date" className="form-control form-control-sm" value={filters.from_date} onChange={e => setFilters({ ...filters, from_date: e.target.value })} style={{ width: 140 }} />
                <input type="date" className="form-control form-control-sm" value={filters.to_date} onChange={e => setFilters({ ...filters, to_date: e.target.value })} style={{ width: 140 }} />
                <button className="btn btn-sm btn-primary" onClick={fetchLogs}>🔍 Filter</button>
              </div>
            </div>
          </div>
          <div className="card border-0 shadow-sm" style={{ borderRadius: 16 }}>
            <div className="card-body p-0">
              <div className="table-responsive" style={{ maxHeight: 500, overflow: 'auto' }}>
                <table className="table table-hover mb-0" style={{ fontSize: 13 }}>
                  <thead className="bg-light sticky-top">
                    <tr><th>#</th><th>User</th><th>Action</th><th>Page</th><th>Details</th><th>IP</th><th>Location</th><th>Time</th></tr>
                  </thead>
                  <tbody>
                    {logs.map((l, i) => (
                      <tr key={l.id}>
                        <td>{i + 1}</td>
                        <td><strong>{l.username}</strong></td>
                        <td><span className="badge" style={{ background: actionColor(l.action), color: '#fff', fontSize: 11 }}>{l.action}</span></td>
                        <td>{l.page}</td>
                        <td><small className="text-muted">{l.details?.substring(0, 40)}</small></td>
                        <td><code style={{ fontSize: 11 }}>{l.ip_address}</code></td>
                        <td><small>{l.city}{l.country ? `, ${l.country}` : ''}</small></td>
                        <td><small>{new Date(l.created_at).toLocaleString()}</small></td>
                      </tr>
                    ))}
                    {logs.length === 0 && <tr><td colSpan="8" className="text-center py-4">No logs yet</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}

      {/* SESSIONS */}
      {tab === 'sessions' && (
        <div className="card border-0 shadow-sm" style={{ borderRadius: 16 }}>
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover mb-0" style={{ fontSize: 13 }}>
                <thead className="bg-light">
                  <tr><th>#</th><th>User</th><th>Page</th><th>Time Spent</th><th>Clicks</th><th>Device</th><th>Browser</th><th>Location</th><th>When</th></tr>
                </thead>
                <tbody>
                  {sessions.map((s, i) => (
                    <tr key={s.id}>
                      <td>{i + 1}</td>
                      <td><strong>{s.username}</strong></td>
                      <td>{s.page}</td>
                      <td><span className="badge bg-info">{s.time_spent}s</span></td>
                      <td>{s.clicks}</td>
                      <td>{s.device}</td>
                      <td>{s.browser}</td>
                      <td><small>{s.city}{s.country ? `, ${s.country}` : ''}</small></td>
                      <td><small>{new Date(s.created_at).toLocaleString()}</small></td>
                    </tr>
                  ))}
                  {sessions.length === 0 && <tr><td colSpan="9" className="text-center py-4">No sessions yet</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* GEO */}
      {tab === 'geo' && stats && (
        <div className="card border-0 shadow-sm" style={{ borderRadius: 16 }}>
          <div className="card-body">
            <h6 className="fw-bold mb-3">🌍 Recent Locations / IPs</h6>
            <div className="table-responsive">
              <table className="table table-hover" style={{ fontSize: 13 }}>
                <thead className="bg-light">
                  <tr><th>User</th><th>IP Address</th><th>City</th><th>Country</th><th>Last Seen</th></tr>
                </thead>
                <tbody>
                  {stats.recent_ips?.map((r, i) => (
                    <tr key={i}>
                      <td><strong>{r.username}</strong></td>
                      <td><code>{r.ip_address}</code></td>
                      <td>{r.city || '-'}</td>
                      <td>{r.country || '-'}</td>
                      <td><small>{new Date(r.last_seen).toLocaleString()}</small></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityDashboard;
