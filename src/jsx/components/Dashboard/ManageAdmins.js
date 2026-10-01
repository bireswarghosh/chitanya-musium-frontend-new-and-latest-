import React, { useState, useEffect } from 'react';
import { Modal } from 'react-bootstrap';
import { adminService } from '../../../services/AdminService';
import swal from 'sweetalert';

const ManageAdmins = () => {
  const [admins, setAdmins] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [showModal, setShowModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [formData, setFormData] = useState({ 
    username: '', 
    firstname: '', 
    lastname: '', 
    email: '', 
    mobile_no: '', 
    password: '', 
    admin_role_id: '', 
    is_active: 1 
  });

  useEffect(() => {
    fetchAdmins();
    fetchRoles();
  }, []);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const response = await adminService.getAdmins();
      setAdmins(response.data);
    } catch (error) {
      swal('Error', 'Failed to fetch admins', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await adminService.getRoles();
      setRoles(response.data);
    } catch (error) {
      console.error('Failed to fetch roles');
    }
  };

  const handleAdd = () => {
    setEditingAdmin(null);
    setFormData({ 
      username: '', 
      firstname: '', 
      lastname: '', 
      email: '', 
      mobile_no: '', 
      password: '', 
      admin_role_id: '', 
      is_active: 1 
    });
    setShowModal(true);
  };

  const handleEdit = (admin) => {
    setEditingAdmin(admin);
    setFormData({ 
      username: admin.username,
      firstname: admin.firstname, 
      lastname: admin.lastname,
      email: admin.email, 
      mobile_no: admin.mobile_no,
      password: '',
      admin_role_id: admin.admin_role_id,
      is_active: admin.is_active 
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      if (editingAdmin) {
        const updateData = {
          firstname: formData.firstname,
          lastname: formData.lastname,
          email: formData.email,
          mobile_no: formData.mobile_no,
          admin_role_id: formData.admin_role_id,
          is_active: formData.is_active,
          password: formData.password
        };
        await adminService.updateAdmin(editingAdmin.user_id, updateData);
        swal('Success', 'Admin updated successfully', 'success');
      } else {
        await adminService.addAdmin(formData);
        swal('Success', 'Admin added successfully', 'success');
      }
      setShowModal(false);
      fetchAdmins();
    } catch (error) {
      swal('Error', error.response?.data?.error || 'Failed to save admin', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId) => {
    const willDelete = await swal({
      title: 'Are you sure?',
      text: 'Once deleted, you will not be able to recover this admin!',
      icon: 'warning',
      buttons: true,
      dangerMode: true,
    });

    if (willDelete) {
      try {
        setLoading(true);
        await adminService.deleteAdmin(userId);
        swal('Success', 'Admin deleted successfully', 'success');
        fetchAdmins();
      } catch (error) {
        swal('Error', error.response?.data?.error || 'Failed to delete admin', 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h4 className="card-title">Manage Admins</h4>
            <button 
  className="btn text-white fw-bold shadow-sm"
  style={{
    background: "linear-gradient(45deg,#4facfe,#00f2fe)",
    border: "none",
    borderRadius: "8px"
  }}
  onClick={handleAdd}
>
  ➕ Add Admin
</button>
            </div>
            <div className="card-body">
              {loading && <div className="text-center"><div className="spinner-border" role="status"></div></div>}
              <div className="table-responsive">
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>Username</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Mobile</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {admins.map(admin => (
                      <tr key={admin.user_id}>
                        <td>{admin.username}</td>
                        <td>{admin.firstname} {admin.lastname}</td>
                        <td>{admin.email}</td>
                        <td>{admin.mobile_no}</td>
                        <td>{admin.admin_role_title}</td>
                        <td>
                          <span className={`badge ${admin.is_active ? 'bg-success' : 'bg-danger'}`}>
                            {admin.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>
                          <button 
                            className="btn btn-sm btn-warning me-2"
                            onClick={() => handleEdit(admin)}
                          >
                            Edit
                          </button>
                          <button 
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDelete(admin.user_id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{editingAdmin ? 'Edit Admin' : 'Add New Admin'}</Modal.Title>
        </Modal.Header>
        {/* <Modal.Body>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">Username</label>
              <input
                type="text"
                className="form-control"
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                disabled={editingAdmin}
              />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-control"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                placeholder={editingAdmin ? 'Leave blank to keep current' : 'Enter password'}
              />
            </div>
          </div>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">First Name</label>
              <input
                type="text"
                className="form-control"
                value={formData.firstname}
                onChange={(e) => setFormData({...formData, firstname: e.target.value})}
              />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Last Name</label>
              <input
                type="text"
                className="form-control"
                value={formData.lastname}
                onChange={(e) => setFormData({...formData, lastname: e.target.value})}
              />
            </div>
          </div>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-control"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Mobile No</label>
              <input
                type="text"
                className="form-control"
                value={formData.mobile_no}
                onChange={(e) => setFormData({...formData, mobile_no: e.target.value})}
              />
            </div>
          </div>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">Role</label>
              <select
                className="form-control"
                value={formData.admin_role_id}
                onChange={(e) => setFormData({...formData, admin_role_id: e.target.value})}
              >
                <option value="">Select Role</option>
                {roles.map(role => (
                  <option key={role.admin_role_id} value={role.admin_role_id}>
                    {role.admin_role_title}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Status</label>
              <select
                className="form-control"
                value={formData.is_active}
                onChange={(e) => setFormData({...formData, is_active: parseInt(e.target.value)})}
              >
                <option value={1}>Active</option>
                <option value={0}>Inactive</option>
              </select>
            </div>
          </div>
        </Modal.Body> */}
        <Modal.Body>

  <div className="p-2">

    <h6 className="fw-bold mb-3 text-primary">👤 Account Info</h6>

    <div className="row">
      <div className="col-md-6 mb-3">
        <label className="form-label">Username</label>
        <input
          type="text"
          className="form-control shadow-sm"
          value={formData.username}
          onChange={(e) => setFormData({...formData, username: e.target.value})}
          disabled={editingAdmin}
        />
      </div>

      <div className="col-md-6 mb-3">
        <label className="form-label">Password</label>
        <input
          type="password"
          className="form-control shadow-sm"
          value={formData.password}
          onChange={(e) => setFormData({...formData, password: e.target.value})}
          placeholder={editingAdmin ? 'Leave blank to keep current' : 'Enter password'}
        />
      </div>
    </div>

    <hr/>

    <h6 className="fw-bold mb-3 text-success">📇 Personal Info</h6>

    <div className="row">
      <div className="col-md-6 mb-3">
        <label className="form-label">First Name</label>
        <input
          type="text"
          className="form-control shadow-sm"
          value={formData.firstname}
          onChange={(e) => setFormData({...formData, firstname: e.target.value})}
        />
      </div>

      <div className="col-md-6 mb-3">
        <label className="form-label">Last Name</label>
        <input
          type="text"
          className="form-control shadow-sm"
          value={formData.lastname}
          onChange={(e) => setFormData({...formData, lastname: e.target.value})}
        />
      </div>
    </div>

    <div className="row">
      <div className="col-md-6 mb-3">
        <label className="form-label">Email</label>
        <input
          type="email"
          className="form-control shadow-sm"
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
        />
      </div>

      <div className="col-md-6 mb-3">
        <label className="form-label">Mobile No</label>
        <input
          type="text"
          className="form-control shadow-sm"
          value={formData.mobile_no}
          onChange={(e) => setFormData({...formData, mobile_no: e.target.value})}
        />
      </div>
    </div>

    <hr/>

    <h6 className="fw-bold mb-3 text-warning">⚙️ Role & Status</h6>

    <div className="row">
      <div className="col-md-6 mb-3">
        <label className="form-label">Role</label>
        <select
          className="form-control shadow-sm"
          value={formData.admin_role_id}
          onChange={(e) => setFormData({...formData, admin_role_id: e.target.value})}
        >
          <option value="">Select Role</option>
          {roles.map(role => (
            <option key={role.admin_role_id} value={role.admin_role_id}>
              {role.admin_role_title}
            </option>
          ))}
        </select>
      </div>

      <div className="col-md-6 mb-3">
        <label className="form-label">Status</label>
        <select
          className="form-control shadow-sm"
          value={formData.is_active}
          onChange={(e) => setFormData({...formData, is_active: parseInt(e.target.value)})}
        >
          <option value={1}>Active</option>
          <option value={0}>Inactive</option>
        </select>
      </div>
    </div>

  </div>

</Modal.Body>
        {/* <Modal.Footer>
          <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSave}>
            {editingAdmin ? 'Update' : 'Add'} Admin
          </button>
        </Modal.Footer> */}
        <Modal.Footer>
  <button className="btn btn-outline-secondary" onClick={() => setShowModal(false)}>
    Cancel
  </button>

  <button
    className="btn text-white fw-bold"
    style={{
      background: "linear-gradient(45deg,#4facfe,#00f2fe)",
      border: "none"
    }}
    onClick={handleSave}
  >
    {editingAdmin ? 'Update Admin' : 'Create Admin'}
  </button>
</Modal.Footer>
      </Modal>
    </div>
  );
};

export default ManageAdmins;