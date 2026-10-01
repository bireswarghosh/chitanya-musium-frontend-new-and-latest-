import React, { useState, useEffect } from 'react';
import { Modal } from 'react-bootstrap';
import { roleService } from '../../../services/RoleService';
import swal from 'sweetalert';

const ManageRoles = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [showModal, setShowModal] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [formData, setFormData] = useState({ 
    admin_role_title: '', 
    admin_role_status: 1 
  });

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {  
    try {
      setLoading(true);
      const response = await roleService.getRoles();
      setRoles(response.data);
    } catch (error) {
      swal('Error', 'Failed to fetch roles', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingRole(null);
    setFormData({ 
      admin_role_title: '', 
      admin_role_status: 1 
    });
    setShowModal(true);
  };

  const handleEdit = (role) => {
    setEditingRole(role);
    setFormData({ 
      admin_role_title: role.admin_role_title,
      admin_role_status: role.admin_role_status 
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      if (editingRole) {
        await roleService.updateRole(editingRole.admin_role_id, formData);
        swal('Success', 'Role updated successfully', 'success');
      } else {
        await roleService.addRole(formData);
        swal('Success', 'Role added successfully', 'success');
      }
      setShowModal(false);
      fetchRoles();
    } catch (error) {
      swal('Error', error.response?.data?.error || 'Failed to save role', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (roleId) => {
    const willDelete = await swal({
      title: 'Are you sure?',
      text: 'Once deleted, you will not be able to recover this role!',
      icon: 'warning',
      buttons: true,
      dangerMode: true,
    });

    if (willDelete) {
      try {
        setLoading(true);
        await roleService.deleteRole(roleId);
        swal('Success', 'Role deleted successfully', 'success');
        fetchRoles();
      } catch (error) {
        swal('Error', error.response?.data?.error || 'Failed to delete role', 'error');
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
              <h4 className="card-title">Manage Roles</h4>
              <button className="btn btn-primary" onClick={handleAdd}>
                Add New Role
              </button>
            </div>
            <div className="card-body">
              {loading && <div className="text-center"><div className="spinner-border" role="status"></div></div>}
              <div className="table-responsive">
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Role Title</th>
                      <th>Status</th>
                      <th>Created On</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {roles.map(role => (
                      <tr key={role.admin_role_id}>
                        <td>{role.admin_role_id}</td>
                        <td>{role.admin_role_title}</td>
                        <td>
                          <span className={`badge ${role.admin_role_status ? 'bg-success' : 'bg-danger'}`}>
                            {role.admin_role_status ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>{new Date(role.admin_role_created_on).toLocaleDateString()}</td>
                        <td>
                          <button 
                            className="btn btn-sm btn-warning me-2"
                            onClick={() => handleEdit(role)}
                          >
                            Edit
                          </button>
                          <button 
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDelete(role.admin_role_id)}
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
          <Modal.Title>{editingRole ? 'Edit Role' : 'Add New Role'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-3">
            <label className="form-label">Role Title</label>
            <input
              type="text"
              className="form-control"
              value={formData.admin_role_title}
              onChange={(e) => setFormData({...formData, admin_role_title: e.target.value})}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Status</label>
            <select
              className="form-control"
              value={formData.admin_role_status}
              onChange={(e) => setFormData({...formData, admin_role_status: parseInt(e.target.value)})}
            >
              <option value={1}>Active</option>
              <option value={0}>Inactive</option>
            </select>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSave}>
            {editingRole ? 'Update' : 'Add'} Role
          </button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ManageRoles;