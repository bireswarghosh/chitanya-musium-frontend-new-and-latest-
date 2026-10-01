import React, { useState, useEffect } from 'react';
import axios from 'axios';
import swal from 'sweetalert';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const API = 'https://chitanya-musium-backend-new-and-latest.onrender.com/api/camping';

const INTEREST_OPTIONS = ['High', 'Medium', 'Low'];
const SOURCE_OPTIONS = ['Walk-in', 'Referral', 'Online', 'Phone', 'Social Media', 'Camp Visit', 'Other'];

const CampingManagement = () => {
  const [tab, setTab] = useState('events');
  const [campings, setCampings] = useState([]);
  const [leads, setLeads] = useState([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [filterCamping, setFilterCamping] = useState('');
  const [filterInterest, setFilterInterest] = useState('');
  const [filterSource, setFilterSource] = useState('');
  const [filterDate, setFilterDate] = useState('');

  const [campForm, setCampForm] = useState({
    camping_name: '', location: '', start_date: '', end_date: '',
    organizer_name: '', contact_details: '', participants_count: '', remarks: '', status: 'Active'
  });

  const [leadForm, setLeadForm] = useState({
    camping_id: '', patient_name: '', phone: '', email: '', age: '', interest: '', source: '', date: ''
  });

  useEffect(() => { fetchCampings(); }, []);
  useEffect(() => { if (tab === 'leads') fetchLeads(); }, [tab, filterCamping]);

  const isSuperAdmin = () => {
    const role = (localStorage.getItem('userRole') || '').toLowerCase();
    const perms = localStorage.getItem('permissions');
    return role === 'superadmin' || perms === '"SUPER_ADMIN"';
  };

  const fetchCampings = async () => {
    try {
      const { data } = await axios.get(API);
      setCampings(data);
    } catch { swal("Error!", "Failed to fetch camping records", "error"); }
  };

  const fetchLeads = async () => {
    try {
      const url = filterCamping ? `${API}/leads?camping_id=${filterCamping}` : `${API}/leads`;
      const { data } = await axios.get(url);
      setLeads(data);
    } catch { swal("Error!", "Failed to fetch leads", "error"); }
  };

  // CAMPING HANDLERS
  const handleCampSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await axios.put(`${API}/${editId}`, campForm);
        swal("Success!", "Updated!", "success");
      } else {
        await axios.post(API, { ...campForm, status: campForm.status || 'Active' });
        swal("Success!", "Camping Created!", "success");
      }
      closeModal(); fetchCampings();
    } catch { swal("Error!", "Failed", "error"); }
  };

  const toggleCampingStatus = async (c) => {
    if (!isSuperAdmin()) {
      swal("Permission Denied", "Only Super Admin has permission to activate/inactivate camp events.", "warning");
      return;
    }
    const currentStatus = c.status || 'Active';
    const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
    
    try {
      await axios.put(`${API}/${c.id}`, {
        camping_name: c.camping_name,
        location: c.location || '',
        start_date: c.start_date?.split('T')[0],
        end_date: c.end_date?.split('T')[0],
        organizer_name: c.organizer_name,
        contact_details: c.contact_details,
        participants_count: c.participants_count || 0,
        remarks: c.remarks || '',
        doctors: c.doctors || '',
        status: newStatus
      });
      swal("Status Updated!", `Camping "${c.camping_name}" is now ${newStatus}.`, "success");
      fetchCampings();
    } catch {
      try {
        await axios.patch(`${API}/${c.id}/status`, { status: newStatus });
        swal("Status Updated!", `Camping "${c.camping_name}" is now ${newStatus}.`, "success");
        fetchCampings();
      } catch {
        swal("Error!", "Failed to update status", "error");
      }
    }
  };

  const editCamping = (c) => {
    setCampForm({
      camping_name: c.camping_name, location: c.location,
      start_date: c.start_date?.split('T')[0], end_date: c.end_date?.split('T')[0],
      organizer_name: c.organizer_name, contact_details: c.contact_details,
      participants_count: c.participants_count, remarks: c.remarks,
      status: c.status || 'Active'
    });
    setEditId(c.id); setShowModal(true);
  };

  const deleteCamping = async (id) => {
    const confirm = await swal({ title: "Delete?", text: "All leads will also be deleted!", icon: "warning", buttons: true, dangerMode: true });
    if (confirm) { await axios.delete(`${API}/${id}`); fetchCampings(); }
  };

  // LEAD HANDLERS
  const handleLeadSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await axios.put(`${API}/leads/${editId}`, leadForm);
        swal("Success!", "Updated!", "success");
      } else {
        await axios.post(`${API}/leads`, leadForm);
        swal("Success!", "Lead Added!", "success");
      }
      closeModal(); fetchLeads();
    } catch { swal("Error!", "Failed", "error"); }
  };

  const editLead = (l) => {
    setLeadForm({
      camping_id: l.camping_id, patient_name: l.patient_name,
      phone: l.phone, email: l.email, age: l.age,
      interest: l.interest, source: l.source, date: l.date?.split('T')[0]
    });
    setEditId(l.id); setShowModal(true);
  };

  const deleteLead = async (id) => {
    const confirm = await swal({ title: "Delete?", icon: "warning", buttons: true, dangerMode: true });
    if (confirm) { await axios.delete(`${API}/leads/${id}`); fetchLeads(); }
  };

  const closeModal = () => {
    setShowModal(false); setEditId(null);
    setCampForm({ camping_name: '', location: '', start_date: '', end_date: '', organizer_name: '', contact_details: '', participants_count: '', remarks: '', status: 'Active' });
    setLeadForm({ camping_id: '', patient_name: '', phone: '', email: '', age: '', interest: '', source: '', date: '' });
  };

  const copyPublicLink = () => {
    const publicUrl = `${window.location.origin}/camping-entry`;
    navigator.clipboard.writeText(publicUrl);
    swal("Public Link Copied! 🔗", `Shareable Public Registration Link:\n${publicUrl}`, "success");
  };

  // Active campings for lead dropdown
  const activeCampings = campings.filter(c => (c.status || 'Active') === 'Active');

  // FILTERS
  const filteredCampings = campings.filter(c =>
    c.camping_name?.toLowerCase().includes(search.toLowerCase()) ||
    c.location?.toLowerCase().includes(search.toLowerCase()) ||
    c.organizer_name?.toLowerCase().includes(search.toLowerCase()) ||
    c.contact_details?.includes(search)
  );

  const filteredLeads = leads.filter(l => {
    const matchSearch = !search ||
      l.patient_name?.toLowerCase().includes(search.toLowerCase()) ||
      l.phone?.includes(search) ||
      l.email?.toLowerCase().includes(search.toLowerCase());
    const matchInterest = !filterInterest || l.interest === filterInterest;
    const matchSource = !filterSource || l.source === filterSource;
    const matchDate = !filterDate || l.date?.split('T')[0] === filterDate;
    return matchSearch && matchInterest && matchSource && matchDate;
  });

  // EXPORT LEADS
  const getLeadExportData = () => filteredLeads.map((l, i) => ({
    'SL': i + 1, 'Camping': l.camping_name || '', 'Patient Name': l.patient_name,
    'Phone': l.phone, 'Email': l.email, 'Age': l.age,
    'Interest': l.interest, 'Source': l.source, 'Date': l.date?.split('T')[0] || ''
  }));

  const exportCSV = () => {
    const ws = XLSX.utils.json_to_sheet(getLeadExportData());
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Leads');
    XLSX.writeFile(wb, 'camping_leads.csv', { bookType: 'csv' });
  };

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(getLeadExportData());
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Leads');
    XLSX.writeFile(wb, 'camping_leads.xlsx');
  };

  const exportPDF = () => {
    const doc = new jsPDF('l');
    doc.text('Camping Lead Report', 14, 15);
    doc.autoTable({
      startY: 20,
      head: [['#', 'Camping', 'Patient', 'Phone', 'Email', 'Age', 'Interest', 'Source', 'Date']],
      body: filteredLeads.map((l, i) => [
        i + 1, l.camping_name || '', l.patient_name, l.phone, l.email, l.age, l.interest, l.source, l.date?.split('T')[0] || ''
      ]),
      styles: { fontSize: 8 }
    });
    doc.save('camping_leads.pdf');
  };

  const exportWord = () => {
    let html = `<h2>Camping Lead Report</h2><table border="1" cellpadding="5" cellspacing="0"><tr><th>#</th><th>Camping</th><th>Patient</th><th>Phone</th><th>Email</th><th>Age</th><th>Interest</th><th>Source</th><th>Date</th></tr>`;
    filteredLeads.forEach((l, i) => {
      html += `<tr><td>${i + 1}</td><td>${l.camping_name || ''}</td><td>${l.patient_name}</td><td>${l.phone}</td><td>${l.email}</td><td>${l.age}</td><td>${l.interest}</td><td>${l.source}</td><td>${l.date?.split('T')[0] || ''}</td></tr>`;
    });
    html += '</table>';
    const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
    saveAs(blob, 'camping_leads.doc');
  };

  return (
    <div className="container-fluid">
      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>🏕️ Camping Management</h4>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-info" onClick={copyPublicLink} title="Copy Public Registration Form Link">
            🌐 Copy Public Form Link
          </button>
          <input className="form-control" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: 180 }} />
          <button className="btn btn-success" onClick={() => { closeModal(); setShowModal(true); }}>+ Add New</button>
        </div>
      </div>

      {/* TABS */}
      <div className="mb-3">
        <button className={`btn me-2 ${tab === 'events' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setTab('events')}>🏕️ Camping Events</button>
        <button className={`btn ${tab === 'leads' ? 'btn-danger' : 'btn-outline-danger'}`} onClick={() => setTab('leads')}>👥 Lead Management</button>
      </div>

      {/* CAMPING EVENTS TAB */}
      {tab === 'events' && (
        <div className="card">
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="bg-light">
                  <tr>
                    <th>Action</th>
                    <th>#</th>
                    <th>Camping Name</th>
                    <th>Location</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Organizer</th>
                    <th>Contact</th>
                    <th>Participants</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCampings.map((c, i) => {
                    const statusVal = c.status || 'Active';
                    const isActive = statusVal === 'Active';
                    return (
                      <tr key={c.id}>
                        <td>
                          <button className="btn btn-sm btn-warning me-1" title="Edit" onClick={() => editCamping(c)}>✏️</button>
                          <button className="btn btn-sm btn-danger me-1" title="Delete" onClick={() => deleteCamping(c.id)}>🗑️</button>
                        </td>
                        <td>{i + 1}</td>
                        <td><strong>{c.camping_name}</strong></td>
                        <td>{c.location}</td>
                        <td>{c.start_date?.split('T')[0]}</td>
                        <td>{c.end_date?.split('T')[0]}</td>
                        <td>{c.organizer_name}</td>
                        <td>{c.contact_details}</td>
                        <td>{c.participants_count}</td>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <span className={`badge ${isActive ? 'bg-success' : 'bg-secondary'}`}>
                              {isActive ? '● Active' : '○ Inactive'}
                            </span>
                            <button
                              className={`btn btn-xs ${isActive ? 'btn-outline-danger' : 'btn-outline-success'}`}
                              style={{ padding: '2px 8px', fontSize: '11px' }}
                              onClick={() => toggleCampingStatus(c)}
                              title={isSuperAdmin() ? "Click to toggle Active/Inactive" : "Super Admin only"}
                            >
                              {isActive ? 'Deactivate' : 'Activate'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredCampings.length === 0 && <tr><td colSpan="10" className="text-center py-4">No records</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* LEADS TAB */}
      {tab === 'leads' && (
        <>
          {/* FILTERS */}
          <div className="mb-3 d-flex gap-2 flex-wrap">
            <select className="form-control" style={{ width: 220 }} value={filterCamping} onChange={e => setFilterCamping(e.target.value)}>
              <option value="">🏕️ All Campings</option>
              {campings.map(c => <option key={c.id} value={c.id}>{c.camping_name} {(c.status || 'Active') === 'Inactive' ? '(Inactive)' : ''}</option>)}
            </select>
            <select className="form-control" style={{ width: 140 }} value={filterInterest} onChange={e => setFilterInterest(e.target.value)}>
              <option value="">All Interest</option>
              {INTEREST_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
            <select className="form-control" style={{ width: 150 }} value={filterSource} onChange={e => setFilterSource(e.target.value)}>
              <option value="">All Source</option>
              {SOURCE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
            <input type="date" className="form-control" style={{ width: 160 }} value={filterDate} onChange={e => setFilterDate(e.target.value)} />
          </div>

          {/* EXPORT */}
          <div className="mb-3 d-flex gap-2">
            <button className="btn btn-sm btn-outline-success" onClick={exportExcel}>📗 Excel</button>
            <button className="btn btn-sm btn-outline-info" onClick={exportCSV}>📄 CSV</button>
            <button className="btn btn-sm btn-outline-danger" onClick={exportPDF}>📕 PDF</button>
            <button className="btn btn-sm btn-outline-primary" onClick={exportWord}>📘 Word</button>
          </div>

          <div className="card">
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="bg-light">
                    <tr><th>Action</th><th>#</th><th>Camping</th><th>Patient Name</th><th>Phone</th><th>Email</th><th>Age</th><th>Interest</th><th>Source</th><th>Date</th></tr>
                  </thead>
                  <tbody>
                    {filteredLeads.map((l, i) => (
                      <tr key={l.id}>
                        <td>
                          <button className="btn btn-sm btn-warning me-1" onClick={() => editLead(l)}>✏️</button>
                          <button className="btn btn-sm btn-danger" onClick={() => deleteLead(l.id)}>🗑️</button>
                        </td>
                        <td>{i + 1}</td><td>{l.camping_name}</td><td>{l.patient_name}</td>
                        <td>{l.phone}</td><td>{l.email}</td><td>{l.age}</td>
                        <td><span className={`badge ${l.interest === 'High' ? 'bg-danger' : l.interest === 'Medium' ? 'bg-warning' : 'bg-secondary'}`}>{l.interest}</span></td>
                        <td>{l.source}</td><td>{l.date?.split('T')[0]}</td>
                      </tr>
                    ))}
                    {filteredLeads.length === 0 && <tr><td colSpan="10" className="text-center py-4">No records</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}

      {/* MODAL */}
      {showModal && (
        <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5>{editId ? 'Edit' : '+ Add'} {tab === 'events' ? 'Camping' : 'Lead'}</h5>
                <button className="btn-close" onClick={closeModal}></button>
              </div>
              <div className="modal-body">

                {tab === 'events' ? (
                  <form onSubmit={handleCampSubmit}>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label>Camping Name *</label>
                        <input className="form-control" value={campForm.camping_name} onChange={e => setCampForm({ ...campForm, camping_name: e.target.value })} required />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label>Location</label>
                        <input className="form-control" value={campForm.location} onChange={e => setCampForm({ ...campForm, location: e.target.value })} />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label>📅 Start Date *</label>
                        <input type="date" className="form-control" value={campForm.start_date} onChange={e => setCampForm({ ...campForm, start_date: e.target.value })} required />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label>📅 End Date *</label>
                        <input type="date" className="form-control" value={campForm.end_date} onChange={e => setCampForm({ ...campForm, end_date: e.target.value })} required />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label>👤 Organizer Name *</label>
                        <input className="form-control" value={campForm.organizer_name} onChange={e => setCampForm({ ...campForm, organizer_name: e.target.value })} required />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label>📞 Contact Details *</label>
                        <input className="form-control" value={campForm.contact_details} onChange={e => setCampForm({ ...campForm, contact_details: e.target.value })} required />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label>👥 Participants Count</label>
                        <input type="number" className="form-control" value={campForm.participants_count} onChange={e => setCampForm({ ...campForm, participants_count: e.target.value })} />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label>Status</label>
                        <select className="form-control" value={campForm.status || 'Active'} onChange={e => setCampForm({ ...campForm, status: e.target.value })}>
                          <option value="Active">Active</option>
                          <option value="Inactive">Inactive</option>
                        </select>
                      </div>
                      <div className="col-md-12 mb-3">
                        <label>📝 Remarks</label>
                        <textarea className="form-control" value={campForm.remarks} onChange={e => setCampForm({ ...campForm, remarks: e.target.value })} />
                      </div>
                    </div>
                    <button className="btn btn-primary w-100">{editId ? 'Update' : 'Create'} Camping</button>
                  </form>
                ) : (
                  <form onSubmit={handleLeadSubmit}>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label>Select Camping * (Only Active Campings)</label>
                        <select className="form-control" value={leadForm.camping_id} onChange={e => setLeadForm({ ...leadForm, camping_id: e.target.value })} required>
                          <option value="">-- Select Active Camping --</option>
                          {activeCampings.map(c => <option key={c.id} value={c.id}>{c.camping_name}</option>)}
                        </select>
                      </div>
                      <div className="col-md-6 mb-3">
                        <label>Patient Name *</label>
                        <input className="form-control" value={leadForm.patient_name} onChange={e => setLeadForm({ ...leadForm, patient_name: e.target.value })} required />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label>Phone</label>
                        <input className="form-control" value={leadForm.phone} onChange={e => setLeadForm({ ...leadForm, phone: e.target.value })} />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label>Email</label>
                        <input type="email" className="form-control" value={leadForm.email} onChange={e => setLeadForm({ ...leadForm, email: e.target.value })} />
                      </div>
                      <div className="col-md-4 mb-3">
                        <label>Age</label>
                        <input type="number" className="form-control" value={leadForm.age} onChange={e => setLeadForm({ ...leadForm, age: e.target.value })} />
                      </div>
                      <div className="col-md-4 mb-3">
                        <label>Interest *</label>
                        <select className="form-control" value={leadForm.interest} onChange={e => setLeadForm({ ...leadForm, interest: e.target.value })} required>
                          <option value="">-- Select --</option>
                          {INTEREST_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                      </div>
                      <div className="col-md-4 mb-3">
                        <label>Source *</label>
                        <select className="form-control" value={leadForm.source} onChange={e => setLeadForm({ ...leadForm, source: e.target.value })} required>
                          <option value="">-- Select --</option>
                          {SOURCE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                      </div>
                      <div className="col-md-6 mb-3">
                        <label>Date</label>
                        <input type="date" className="form-control" value={leadForm.date} onChange={e => setLeadForm({ ...leadForm, date: e.target.value })} />
                      </div>
                    </div>
                    <button className="btn btn-primary w-100">{editId ? 'Update' : 'Add'} Lead</button>
                  </form>
                )}

              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampingManagement;
