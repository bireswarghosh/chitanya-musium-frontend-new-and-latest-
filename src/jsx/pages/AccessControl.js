import React, { useState, useEffect } from 'react';
import axios from 'axios';
import swal from 'sweetalert';

const API = 'https://chitanya-musium-backend-new-and-latest.onrender.com/api';

const PAGES = [
  { key: 'museum-entry', label: 'Museum Entry Form', icon: '🎟️', group: 'Museum' },
  { key: 'museum-entries', label: 'Museum Entries List', icon: '📋', group: 'Museum' },
  { key: 'camping-management', label: 'Camping Management', icon: '🏕️', group: 'Camping' },
  { key: 'booking', label: 'Booking Form', icon: '📝', group: 'Booking' },
  { key: 'booking-list', label: 'Booking List', icon: '📊', group: 'Booking' },
  { key: 'manage-admins', label: 'Manage Admins', icon: '👥', group: 'Admin' },
  { key: 'manage-roles', label: 'Manage Roles', icon: '🔑', group: 'Admin' },
  { key: 'access-control', label: 'Access Control', icon: '🛡️', group: 'Admin' },
  { key: 'profile', label: 'Profile', icon: '👤', group: 'General' },
];

const PERMISSIONS = [
  { key: 'can_view', label: 'View', icon: '👁️', color: '#4facfe' },
  { key: 'can_add', label: 'Add', icon: '➕', color: '#43e97b' },
  { key: 'can_edit', label: 'Edit', icon: '✏️', color: '#f9d423' },
  { key: 'can_delete', label: 'Delete', icon: '🗑️', color: '#f5576c' },
  { key: 'can_download', label: 'Download', icon: '⬇️', color: '#667eea' },
  { key: 'can_print', label: 'Print', icon: '🖨️', color: '#764ba2' },
  { key: 'is_public', label: 'Guest/Public', icon: '🌐', color: '#00c6fb' },
];

const AccessControl = () => {
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [permissions, setPermissions] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchRoles(); }, []);

  const fetchRoles = async () => {
    try {
      const { data } = await axios.get(`${API}/roles`);
      setRoles(data);
    } catch { swal("Error!", "Failed to fetch roles", "error"); }
  };

  const loadPermissions = async (roleId) => {
    setSelectedRole(roleId);
    setLoading(true);
    try {
      const { data } = await axios.get(`${API}/permissions/${roleId}`);
      const permMap = {};
      PAGES.forEach(p => {
        const existing = data.find(d => d.page_key === p.key);
        permMap[p.key] = existing || {
          page_key: p.key, can_view: 0, can_add: 0, can_edit: 0,
          can_delete: 0, can_download: 0, can_print: 0, is_public: 0
        };
      });
      setPermissions(permMap);
    } catch { swal("Error!", "Failed to load permissions", "error"); }
    finally { setLoading(false); }
  };

  const togglePerm = (pageKey, permKey) => {
    setPermissions(prev => ({
      ...prev,
      [pageKey]: { ...prev[pageKey], [permKey]: prev[pageKey][permKey] ? 0 : 1 }
    }));
  };

  const toggleAllForPage = (pageKey) => {
    const current = permissions[pageKey];
    const allOn = PERMISSIONS.every(p => current[p.key]);
    const newVal = allOn ? 0 : 1;
    const updated = { ...current };
    PERMISSIONS.forEach(p => { updated[p.key] = newVal; });
    setPermissions(prev => ({ ...prev, [pageKey]: updated }));
  };

  const toggleAllForPerm = (permKey) => {
    const allOn = PAGES.every(p => permissions[p.key]?.[permKey]);
    const newVal = allOn ? 0 : 1;
    const updated = { ...permissions };
    PAGES.forEach(p => { updated[p.key] = { ...updated[p.key], [permKey]: newVal }; });
    setPermissions(updated);
  };

  const grantAll = () => {
    const updated = {};
    PAGES.forEach(p => {
      updated[p.key] = { page_key: p.key, can_view: 1, can_add: 1, can_edit: 1, can_delete: 1, can_download: 1, can_print: 1, is_public: 1 };
    });
    setPermissions(updated);
  };

  const revokeAll = () => {
    const updated = {};
    PAGES.forEach(p => {
      updated[p.key] = { page_key: p.key, can_view: 0, can_add: 0, can_edit: 0, can_delete: 0, can_download: 0, can_print: 0, is_public: 0 };
    });
    setPermissions(updated);
  };

  const savePermissions = async () => {
    setSaving(true);
    try {
      const permsArray = Object.values(permissions);
      await axios.post(`${API}/permissions`, { role_id: selectedRole, permissions: permsArray });
      swal("Saved!", "Permissions updated successfully!", "success");
    } catch { swal("Error!", "Failed to save", "error"); }
    finally { setSaving(false); }
  };

  const groups = [...new Set(PAGES.map(p => p.group))];

  return (
    <div className="container-fluid">
      {/* HEADER */}
      <div className="mb-4">
        <div className="d-flex align-items-center justify-content-between">
          <div>
            <h3 className="mb-1" style={{ fontWeight: 700 }}>
              <span style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                🛡️ Access Control Center
              </span>
            </h3>
            <p className="text-muted mb-0">Manage granular permissions for each role</p>
          </div>
        </div>
      </div>

      {/* ROLE SELECTOR */}
      <div className="card border-0 shadow-lg mb-4" style={{ borderRadius: 16, background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
        <div className="card-body py-4">
          <div className="row align-items-center">
            <div className="col-md-4">
              <label className="fw-bold mb-2">🔑 Select Role</label>
              <select
                className="form-select form-select-lg"
                style={{ borderRadius: 12, border: '2px solid #667eea', fontWeight: 600 }}
                value={selectedRole || ''}
                onChange={e => loadPermissions(e.target.value)}
              >
                <option value="">-- Choose a Role --</option>
                {roles.map(r => (
                  <option key={r.admin_role_id} value={r.admin_role_id}>{r.admin_role_title}</option>
                ))}
              </select>
            </div>
            <div className="col-md-8 text-end mt-3 mt-md-0">
              {selectedRole && (
                <div className="d-flex gap-2 justify-content-end flex-wrap">
                  <button className="btn btn-success btn-sm px-3" style={{ borderRadius: 20 }} onClick={grantAll}>✅ Grant All</button>
                  <button className="btn btn-outline-danger btn-sm px-3" style={{ borderRadius: 20 }} onClick={revokeAll}>❌ Revoke All</button>
                  <button className="btn btn-primary px-4" style={{ borderRadius: 20, fontWeight: 600, background: 'linear-gradient(135deg, #667eea, #764ba2)', border: 'none' }} onClick={savePermissions} disabled={saving}>
                    {saving ? '⏳ Saving...' : '💾 Save Permissions'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* PERMISSIONS MATRIX */}
      {selectedRole && !loading && (
        <div className="card border-0 shadow-lg" style={{ borderRadius: 16 }}>
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover mb-0" style={{ fontSize: 14 }}>
                <thead>
                  <tr style={{ background: 'linear-gradient(135deg, #1a1a2e, #16213e)', color: '#fff' }}>
                    <th style={{ padding: '16px 20px', borderRadius: '16px 0 0 0', minWidth: 220 }}>📄 Page / Module</th>
                    {PERMISSIONS.map(perm => (
                      <th key={perm.key} className="text-center" style={{ padding: '16px 12px', cursor: 'pointer' }} onClick={() => toggleAllForPerm(perm.key)}>
                        <div className="d-flex flex-column align-items-center">
                          <span style={{ fontSize: 18 }}>{perm.icon}</span>
                          <small style={{ fontSize: 11, opacity: 0.9 }}>{perm.label}</small>
                        </div>
                      </th>
                    ))}
                    <th className="text-center" style={{ padding: '16px', borderRadius: '0 16px 0 0' }}>All</th>
                  </tr>
                </thead>
                <tbody>
                  {groups.map(group => (
                    <React.Fragment key={group}>
                      <tr>
                        <td colSpan={PERMISSIONS.length + 2} style={{ background: '#f8f9ff', padding: '10px 20px', fontWeight: 700, color: '#667eea', fontSize: 13, letterSpacing: 1 }}>
                          {group.toUpperCase()}
                        </td>
                      </tr>
                      {PAGES.filter(p => p.group === group).map(page => {
                        const perm = permissions[page.key] || {};
                        const allOn = PERMISSIONS.every(pr => perm[pr.key]);
                        return (
                          <tr key={page.key} style={{ transition: 'all 0.2s' }}>
                            <td style={{ padding: '14px 20px', fontWeight: 500 }}>
                              <span style={{ marginRight: 8, fontSize: 16 }}>{page.icon}</span>
                              {page.label}
                            </td>
                            {PERMISSIONS.map(pr => (
                              <td key={pr.key} className="text-center" style={{ padding: '14px 12px' }}>
                                <div
                                  onClick={() => togglePerm(page.key, pr.key)}
                                  style={{
                                    width: 36, height: 36, borderRadius: '50%', display: 'inline-flex',
                                    alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                                    background: perm[pr.key] ? pr.color : '#e9ecef',
                                    color: perm[pr.key] ? '#fff' : '#adb5bd',
                                    fontWeight: 700, fontSize: 14, transition: 'all 0.3s ease',
                                    boxShadow: perm[pr.key] ? `0 4px 12px ${pr.color}40` : 'none',
                                    transform: perm[pr.key] ? 'scale(1.1)' : 'scale(1)'
                                  }}
                                >
                                  {perm[pr.key] ? '✓' : '—'}
                                </div>
                              </td>
                            ))}
                            <td className="text-center" style={{ padding: '14px' }}>
                              <div
                                onClick={() => toggleAllForPage(page.key)}
                                style={{
                                  width: 36, height: 36, borderRadius: 8, display: 'inline-flex',
                                  alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                                  background: allOn ? 'linear-gradient(135deg, #667eea, #764ba2)' : '#f1f3f5',
                                  color: allOn ? '#fff' : '#868e96', fontWeight: 700, fontSize: 12,
                                  transition: 'all 0.3s ease'
                                }}
                              >
                                {allOn ? 'ALL' : 'OFF'}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status" style={{ width: 48, height: 48 }}></div>
          <p className="mt-3 text-muted">Loading permissions...</p>
        </div>
      )}

      {!selectedRole && (
        <div className="text-center py-5">
          <div style={{ fontSize: 64, opacity: 0.3 }}>🛡️</div>
          <h5 className="text-muted mt-3">Select a role to manage permissions</h5>
          <p className="text-muted">Super Admin has full access by default</p>
        </div>
      )}
    </div>
  );
};

export default AccessControl;
