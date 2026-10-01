import React, { useState, useEffect } from 'react';
import { Modal } from 'react-bootstrap';
import { adminService } from '../../../services/AdminService';
import { roleService } from '../../../services/RoleService';
import axios from 'axios';
import swal from 'sweetalert';

const API = 'https://chitanya-musium-backend-new-and-latest.onrender.com/api';

// ── Access Control constants ──
const PAGES = [
  { key: 'museum-entry', label: 'Museum Entry Form', icon: '🎟️', group: 'Museum' },
  { key: 'museum-entries', label: 'Museum Entries List', icon: '📋', group: 'Museum' },
  { key: 'camping-management', label: 'Camping Management', icon: '🏕️', group: 'Camping' },
  { key: 'booking', label: 'Booking Form', icon: '📝', group: 'Booking' },
  { key: 'booking-list', label: 'Booking List', icon: '📊', group: 'Booking' },
  { key: 'manage-admins', label: 'Admin Panel', icon: '👥', group: 'Admin' },
  { key: 'profile', label: 'Profile', icon: '👤', group: 'General' },
];
const PERMISSIONS = [
  { key: 'can_view', label: 'View', icon: '👁️', color: '#4facfe' },
  { key: 'can_add', label: 'Add', icon: '➕', color: '#43e97b' },
  { key: 'can_edit', label: 'Edit', icon: '✏️', color: '#f9d423' },
  { key: 'can_delete', label: 'Delete', icon: '🗑️', color: '#f5576c' },
  { key: 'can_download', label: 'Download', icon: '⬇️', color: '#667eea' },
  { key: 'can_print', label: 'Print', icon: '🖨️', color: '#764ba2' },
  { key: 'is_public', label: 'Public', icon: '🌐', color: '#00c6fb' },
];

const ManageAdmins = () => {
  const [activeTab, setActiveTab] = useState('admins');

  // ── Admins state ──
  const [admins, setAdmins] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [adminForm, setAdminForm] = useState({
    username: '', firstname: '', lastname: '', email: '',
    mobile_no: '', password: '', admin_role_id: '', is_active: 1
  });

  // ── Roles state ──
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [roleForm, setRoleForm] = useState({ admin_role_title: '', admin_role_status: 1 });

  // ── Access Control state ──
  const [selectedRole, setSelectedRole] = useState(null);
  const [permissions, setPermissions] = useState({});
  const [acLoading, setAcLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchAdmins(); fetchRoles(); }, []);

  // ── Admin CRUD ──
  const fetchAdmins = async () => {
    try { setLoading(true); const r = await adminService.getAdmins(); setAdmins(r.data); }
    catch { swal('Error', 'Failed to fetch admins', 'error'); }
    finally { setLoading(false); }
  };
  const fetchRoles = async () => {
    try { const r = await adminService.getRoles(); setRoles(r.data); }
    catch { console.error('Failed to fetch roles'); }
  };
  const openAddAdmin = () => {
    setEditingAdmin(null);
    setAdminForm({ username: '', firstname: '', lastname: '', email: '', mobile_no: '', password: '', admin_role_id: '', is_active: 1 });
    setShowModal(true);
  };
  const openEditAdmin = (a) => {
    setEditingAdmin(a);
    setAdminForm({ username: a.username, firstname: a.firstname, lastname: a.lastname, email: a.email, mobile_no: a.mobile_no, password: '', admin_role_id: a.admin_role_id, is_active: a.is_active });
    setShowModal(true);
  };
  const saveAdmin = async () => {
    try {
      setLoading(true);
      if (editingAdmin) {
        await adminService.updateAdmin(editingAdmin.user_id, { firstname: adminForm.firstname, lastname: adminForm.lastname, email: adminForm.email, mobile_no: adminForm.mobile_no, admin_role_id: adminForm.admin_role_id, is_active: adminForm.is_active, password: adminForm.password });
        swal('Success', 'Admin updated', 'success');
      } else {
        await adminService.addAdmin(adminForm);
        swal('Success', 'Admin added', 'success');
      }
      setShowModal(false); fetchAdmins();
    } catch (e) { swal('Error', e.response?.data?.error || 'Failed', 'error'); }
    finally { setLoading(false); }
  };
  const deleteAdmin = async (id) => {
    const ok = await swal({ title: 'Delete admin?', icon: 'warning', buttons: true, dangerMode: true });
    if (ok) { try { setLoading(true); await adminService.deleteAdmin(id); swal('Deleted', '', 'success'); fetchAdmins(); } catch { swal('Error', 'Failed', 'error'); } finally { setLoading(false); } }
  };

  // ── Role CRUD ──
  const fetchRolesList = async () => {
    try { setLoading(true); const r = await roleService.getRoles(); setRoles(r.data); }
    catch { swal('Error', 'Failed to fetch roles', 'error'); }
    finally { setLoading(false); }
  };
  const openAddRole = () => { setEditingRole(null); setRoleForm({ admin_role_title: '', admin_role_status: 1 }); setShowRoleModal(true); };
  const openEditRole = (r) => { setEditingRole(r); setRoleForm({ admin_role_title: r.admin_role_title, admin_role_status: r.admin_role_status }); setShowRoleModal(true); };
  const saveRole = async () => {
    try {
      setLoading(true);
      if (editingRole) { await roleService.updateRole(editingRole.admin_role_id, roleForm); swal('Success', 'Role updated', 'success'); }
      else { await roleService.addRole(roleForm); swal('Success', 'Role added', 'success'); }
      setShowRoleModal(false); fetchRolesList();
    } catch (e) { swal('Error', e.response?.data?.error || 'Failed', 'error'); }
    finally { setLoading(false); }
  };
  const deleteRole = async (id) => {
    const ok = await swal({ title: 'Delete role?', icon: 'warning', buttons: true, dangerMode: true });
    if (ok) { try { setLoading(true); await roleService.deleteRole(id); swal('Deleted', '', 'success'); fetchRolesList(); } catch { swal('Error', 'Failed', 'error'); } finally { setLoading(false); } }
  };

  // ── Access Control ──
  const loadPermissions = async (roleId) => {
    setSelectedRole(roleId); setAcLoading(true);
    try {
      const { data } = await axios.get(`${API}/permissions/${roleId}`);
      const map = {};
      PAGES.forEach(p => {
        const ex = data.find(d => d.page_key === p.key);
        map[p.key] = ex || { page_key: p.key, can_view: 0, can_add: 0, can_edit: 0, can_delete: 0, can_download: 0, can_print: 0, is_public: 0 };
      });
      setPermissions(map);
    } catch { swal('Error!', 'Failed to load permissions', 'error'); }
    finally { setAcLoading(false); }
  };
  const togglePerm = (pk, permKey) => setPermissions(prev => ({ ...prev, [pk]: { ...prev[pk], [permKey]: prev[pk][permKey] ? 0 : 1 } }));
  const toggleAllForPage = (pk) => {
    const allOn = PERMISSIONS.every(p => permissions[pk][p.key]);
    const updated = { ...permissions[pk] };
    PERMISSIONS.forEach(p => { updated[p.key] = allOn ? 0 : 1; });
    setPermissions(prev => ({ ...prev, [pk]: updated }));
  };
  const toggleAllForPerm = (permKey) => {
    const allOn = PAGES.every(p => permissions[p.key]?.[permKey]);
    const updated = { ...permissions };
    PAGES.forEach(p => { updated[p.key] = { ...updated[p.key], [permKey]: allOn ? 0 : 1 }; });
    setPermissions(updated);
  };
  const grantAll = () => { const u = {}; PAGES.forEach(p => { u[p.key] = { page_key: p.key, can_view: 1, can_add: 1, can_edit: 1, can_delete: 1, can_download: 1, can_print: 1, is_public: 1 }; }); setPermissions(u); };
  const revokeAll = () => { const u = {}; PAGES.forEach(p => { u[p.key] = { page_key: p.key, can_view: 0, can_add: 0, can_edit: 0, can_delete: 0, can_download: 0, can_print: 0, is_public: 0 }; }); setPermissions(u); };
  const savePermissions = async () => {
    setSaving(true);
    try { await axios.post(`${API}/permissions`, { role_id: selectedRole, permissions: Object.values(permissions) }); swal('Saved!', 'Permissions updated!', 'success'); }
    catch { swal('Error!', 'Failed to save', 'error'); }
    finally { setSaving(false); }
  };
  const groups = [...new Set(PAGES.map(p => p.group))];

  const tabStyle = (t) => ({
    padding: '8px 20px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: '700', fontSize: '13px',
    background: activeTab === t ? 'linear-gradient(135deg,#0284c7,#00c2fe)' : 'transparent',
    color: activeTab === t ? '#fff' : '#64748B',
    transition: 'all 0.2s'
  });

  return (
    <div className="container-fluid">
      {/* PAGE HEADER */}
      <div className="d-flex align-items-center justify-content-between mb-3">
        <div>
          <h4 style={{ fontWeight: 800, margin: 0 }}>🛡️ Admin Panel</h4>
          <small style={{ color: '#64748B' }}>Manage admins, roles & access permissions</small>
        </div>
      </div>

      {/* TABS */}
      <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '6px', display: 'inline-flex', gap: '4px', marginBottom: '20px' }}>
        <button style={tabStyle('admins')} onClick={() => setActiveTab('admins')}>👥 Manage Admins</button>
        <button style={tabStyle('roles')} onClick={() => { setActiveTab('roles'); fetchRolesList(); }}>🔑 Manage Roles</button>
        <button style={tabStyle('access')} onClick={() => setActiveTab('access')}>🛡️ Access Control</button>
      </div>

      {/* ── TAB: ADMINS ── */}
      {activeTab === 'admins' && (
        <div className="card border-0 shadow-sm" style={{ borderRadius: 16 }}>
          <div className="card-header bg-white border-0 d-flex justify-content-between align-items-center" style={{ borderRadius: '16px 16px 0 0' }}>
            <h5 style={{ fontWeight: 700, margin: 0 }}>👥 Admins</h5>
            <button className="btn text-white fw-bold" style={{ background: 'linear-gradient(45deg,#4facfe,#00f2fe)', border: 'none', borderRadius: 10 }} onClick={openAddAdmin}>
              ➕ Add Admin
            </button>
          </div>
          <div className="card-body">
            {loading && <div className="text-center"><div className="spinner-border text-primary" /></div>}
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr><th>Username</th><th>Name</th><th>Email</th><th>Mobile</th><th>Role</th><th>Status</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {admins.map(a => (
                    <tr key={a.user_id}>
                      <td className="fw-semibold">{a.username}</td>
                      <td>{a.firstname} {a.lastname}</td>
                      <td>{a.email}</td>
                      <td>{a.mobile_no}</td>
                      <td>{a.admin_role_title}</td>
                      <td><span className={`badge ${a.is_active ? 'bg-success' : 'bg-danger'}`}>{a.is_active ? 'Active' : 'Inactive'}</span></td>
                      <td>
                        <button className="btn btn-sm btn-warning me-2" onClick={() => openEditAdmin(a)}>✏️ Edit</button>
                        <button className="btn btn-sm btn-danger" onClick={() => deleteAdmin(a.user_id)}>🗑️</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB: ROLES ── */}
      {activeTab === 'roles' && (
        <div className="card border-0 shadow-sm" style={{ borderRadius: 16 }}>
          <div className="card-header bg-white border-0 d-flex justify-content-between align-items-center" style={{ borderRadius: '16px 16px 0 0' }}>
            <h5 style={{ fontWeight: 700, margin: 0 }}>🔑 Roles</h5>
            <button className="btn text-white fw-bold" style={{ background: 'linear-gradient(45deg,#43e97b,#38f9d7)', border: 'none', borderRadius: 10 }} onClick={openAddRole}>
              ➕ Add Role
            </button>
          </div>
          <div className="card-body">
            {loading && <div className="text-center"><div className="spinner-border text-primary" /></div>}
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr><th>ID</th><th>Role Title</th><th>Status</th><th>Created On</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {roles.map(r => (
                    <tr key={r.admin_role_id}>
                      <td>{r.admin_role_id}</td>
                      <td className="fw-semibold">{r.admin_role_title}</td>
                      <td><span className={`badge ${r.admin_role_status ? 'bg-success' : 'bg-danger'}`}>{r.admin_role_status ? 'Active' : 'Inactive'}</span></td>
                      <td>{new Date(r.admin_role_created_on).toLocaleDateString()}</td>
                      <td>
                        <button className="btn btn-sm btn-warning me-2" onClick={() => openEditRole(r)}>✏️ Edit</button>
                        <button className="btn btn-sm btn-danger" onClick={() => deleteRole(r.admin_role_id)}>🗑️</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB: ACCESS CONTROL ── */}
      {activeTab === 'access' && (
        <div>
          <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: 16, background: 'linear-gradient(135deg,#f5f7fa,#c3cfe2)' }}>
            <div className="card-body py-3">
              <div className="row align-items-center">
                <div className="col-md-4">
                  <label className="fw-bold mb-2">🔑 Select Role</label>
                  <select className="form-select" style={{ borderRadius: 12, border: '2px solid #667eea', fontWeight: 600 }}
                    value={selectedRole || ''} onChange={e => loadPermissions(e.target.value)}>
                    <option value="">-- Choose a Role --</option>
                    {roles.map(r => <option key={r.admin_role_id} value={r.admin_role_id}>{r.admin_role_title}</option>)}
                  </select>
                </div>
                <div className="col-md-8 text-end mt-3 mt-md-0">
                  {selectedRole && (
                    <div className="d-flex gap-2 justify-content-end flex-wrap">
                      <button className="btn btn-success btn-sm px-3" style={{ borderRadius: 20 }} onClick={grantAll}>✅ Grant All</button>
                      <button className="btn btn-outline-danger btn-sm px-3" style={{ borderRadius: 20 }} onClick={revokeAll}>❌ Revoke All</button>
                      <button className="btn btn-primary px-4" style={{ borderRadius: 20, fontWeight: 600, background: 'linear-gradient(135deg,#667eea,#764ba2)', border: 'none' }} onClick={savePermissions} disabled={saving}>
                        {saving ? '⏳ Saving...' : '💾 Save Permissions'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {selectedRole && !acLoading && (
            <div className="card border-0 shadow-sm" style={{ borderRadius: 16 }}>
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-hover mb-0" style={{ fontSize: 14 }}>
                    <thead>
                      <tr style={{ background: 'linear-gradient(135deg,#1a1a2e,#16213e)', color: '#fff' }}>
                        <th style={{ padding: '14px 20px', minWidth: 200 }}>📄 Page / Module</th>
                        {PERMISSIONS.map(p => (
                          <th key={p.key} className="text-center" style={{ padding: '14px 10px', cursor: 'pointer' }} onClick={() => toggleAllForPerm(p.key)}>
                            <div className="d-flex flex-column align-items-center">
                              <span style={{ fontSize: 16 }}>{p.icon}</span>
                              <small style={{ fontSize: 10, opacity: 0.9 }}>{p.label}</small>
                            </div>
                          </th>
                        ))}
                        <th className="text-center" style={{ padding: '14px' }}>All</th>
                      </tr>
                    </thead>
                    <tbody>
                      {groups.map(group => (
                        <React.Fragment key={group}>
                          <tr>
                            <td colSpan={PERMISSIONS.length + 2} style={{ background: '#f8f9ff', padding: '8px 20px', fontWeight: 700, color: '#667eea', fontSize: 12, letterSpacing: 1 }}>
                              {group.toUpperCase()}
                            </td>
                          </tr>
                          {PAGES.filter(p => p.group === group).map(page => {
                            const perm = permissions[page.key] || {};
                            const allOn = PERMISSIONS.every(pr => perm[pr.key]);
                            return (
                              <tr key={page.key}>
                                <td style={{ padding: '12px 20px', fontWeight: 500 }}>
                                  <span style={{ marginRight: 8 }}>{page.icon}</span>{page.label}
                                </td>
                                {PERMISSIONS.map(pr => (
                                  <td key={pr.key} className="text-center" style={{ padding: '12px 10px' }}>
                                    <div onClick={() => togglePerm(page.key, pr.key)} style={{
                                      width: 32, height: 32, borderRadius: '50%', display: 'inline-flex',
                                      alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                                      background: perm[pr.key] ? pr.color : '#e9ecef',
                                      color: perm[pr.key] ? '#fff' : '#adb5bd',
                                      fontWeight: 700, fontSize: 13, transition: 'all 0.2s',
                                      boxShadow: perm[pr.key] ? `0 3px 8px ${pr.color}40` : 'none',
                                      transform: perm[pr.key] ? 'scale(1.1)' : 'scale(1)'
                                    }}>
                                      {perm[pr.key] ? '✓' : '—'}
                                    </div>
                                  </td>
                                ))}
                                <td className="text-center" style={{ padding: '12px' }}>
                                  <div onClick={() => toggleAllForPage(page.key)} style={{
                                    width: 32, height: 32, borderRadius: 8, display: 'inline-flex',
                                    alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                                    background: allOn ? 'linear-gradient(135deg,#667eea,#764ba2)' : '#f1f3f5',
                                    color: allOn ? '#fff' : '#868e96', fontWeight: 700, fontSize: 11, transition: 'all 0.2s'
                                  }}>
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
          {acLoading && <div className="text-center py-5"><div className="spinner-border text-primary" style={{ width: 48, height: 48 }} /></div>}
          {!selectedRole && <div className="text-center py-5"><div style={{ fontSize: 56, opacity: 0.3 }}>🛡️</div><h5 className="text-muted mt-3">Select a role to manage permissions</h5></div>}
        </div>
      )}

      {/* ── ADMIN MODAL ── */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{editingAdmin ? 'Edit Admin' : 'Add New Admin'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="p-1">
            <h6 className="fw-bold mb-3 text-primary">👤 Account Info</h6>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Username</label>
                <input type="text" className="form-control" value={adminForm.username} disabled={!!editingAdmin} onChange={e => setAdminForm({ ...adminForm, username: e.target.value })} />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Password</label>
                <input type="password" className="form-control" value={adminForm.password} placeholder={editingAdmin ? 'Leave blank to keep' : 'Enter password'} onChange={e => setAdminForm({ ...adminForm, password: e.target.value })} />
              </div>
            </div>
            <hr />
            <h6 className="fw-bold mb-3 text-success">📇 Personal Info</h6>
            <div className="row">
              <div className="col-md-6 mb-3"><label className="form-label">First Name</label><input type="text" className="form-control" value={adminForm.firstname} onChange={e => setAdminForm({ ...adminForm, firstname: e.target.value })} /></div>
              <div className="col-md-6 mb-3"><label className="form-label">Last Name</label><input type="text" className="form-control" value={adminForm.lastname} onChange={e => setAdminForm({ ...adminForm, lastname: e.target.value })} /></div>
              <div className="col-md-6 mb-3"><label className="form-label">Email</label><input type="email" className="form-control" value={adminForm.email} onChange={e => setAdminForm({ ...adminForm, email: e.target.value })} /></div>
              <div className="col-md-6 mb-3"><label className="form-label">Mobile</label><input type="text" className="form-control" value={adminForm.mobile_no} onChange={e => setAdminForm({ ...adminForm, mobile_no: e.target.value })} /></div>
            </div>
            <hr />
            <h6 className="fw-bold mb-3 text-warning">⚙️ Role & Status</h6>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Role</label>
                <select className="form-control" value={adminForm.admin_role_id} onChange={e => setAdminForm({ ...adminForm, admin_role_id: e.target.value })}>
                  <option value="">Select Role</option>
                  {roles.map(r => <option key={r.admin_role_id} value={r.admin_role_id}>{r.admin_role_title}</option>)}
                </select>
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Status</label>
                <select className="form-control" value={adminForm.is_active} onChange={e => setAdminForm({ ...adminForm, is_active: parseInt(e.target.value) })}>
                  <option value={1}>Active</option>
                  <option value={0}>Inactive</option>
                </select>
              </div>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <button className="btn btn-outline-secondary" onClick={() => setShowModal(false)}>Cancel</button>
          <button className="btn text-white fw-bold" style={{ background: 'linear-gradient(45deg,#4facfe,#00f2fe)', border: 'none' }} onClick={saveAdmin}>
            {editingAdmin ? 'Update Admin' : 'Create Admin'}
          </button>
        </Modal.Footer>
      </Modal>

      {/* ── ROLE MODAL ── */}
      <Modal show={showRoleModal} onHide={() => setShowRoleModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{editingRole ? 'Edit Role' : 'Add New Role'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-3">
            <label className="form-label">Role Title</label>
            <input type="text" className="form-control" value={roleForm.admin_role_title} onChange={e => setRoleForm({ ...roleForm, admin_role_title: e.target.value })} />
          </div>
          <div className="mb-3">
            <label className="form-label">Status</label>
            <select className="form-control" value={roleForm.admin_role_status} onChange={e => setRoleForm({ ...roleForm, admin_role_status: parseInt(e.target.value) })}>
              <option value={1}>Active</option>
              <option value={0}>Inactive</option>
            </select>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <button className="btn btn-secondary" onClick={() => setShowRoleModal(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={saveRole}>{editingRole ? 'Update' : 'Add'} Role</button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ManageAdmins;
