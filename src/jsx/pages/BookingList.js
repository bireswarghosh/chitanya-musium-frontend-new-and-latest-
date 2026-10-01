import React, { useState, useEffect } from 'react';
import axios from 'axios';
import swal from 'sweetalert';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const API = 'https://chitanya-musium-backend-new-and-latest.onrender.com/api/booking';

const BookingList = () => {
  const [bookings, setBookings] = useState([]);
  const [search, setSearch] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterPayment, setFilterPayment] = useState('');

  useEffect(() => { fetchBookings(); }, []);

  const fetchBookings = async () => {
    try {
      const { data } = await axios.get(API);
      setBookings(data);
    } catch { swal("Error!", "Failed to fetch bookings", "error"); }
  };

  const deleteBooking = async (id) => {
    const confirm = await swal({ title: "Delete?", icon: "warning", buttons: true, dangerMode: true });
    if (confirm) {
      await axios.delete(`${API}/${id}`);
      fetchBookings();
    }
  };

  // FILTER
  const filtered = bookings.filter(b => {
    const matchSearch = !search || 
      b.fullname?.toLowerCase().includes(search.toLowerCase()) ||
      b.phone?.includes(search) ||
      b.email?.toLowerCase().includes(search.toLowerCase()) ||
      b.txn_id?.includes(search);
    const matchDate = !filterDate || b.booking_date?.split('T')[0] === filterDate;
    const matchPayment = !filterPayment || b.payment === filterPayment;
    return matchSearch && matchDate && matchPayment;
  });

  // EXPORT DATA
  const getExportData = () => filtered.map((b, i) => ({
    'SL': i + 1,
    'Name': b.fullname,
    'Phone': b.phone,
    'Email': b.email,
    'Date': b.booking_date?.split('T')[0],
    'Time': b.booking_time,
    'Hours': b.hours,
    'Extra Hrs': b.extra_hours,
    'Service': b.service_charge,
    'Booking': b.booking_charge,
    'Extra': b.extra_charge,
    'Total': b.total_amt,
    'Payment': b.payment === '1' ? 'Online' : 'Cash',
    'Txn ID': b.txn_id || '-'
  }));

  const exportCSV = () => {
    const ws = XLSX.utils.json_to_sheet(getExportData());
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Bookings');
    XLSX.writeFile(wb, 'bookings.csv', { bookType: 'csv' });
  };

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(getExportData());
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Bookings');
    XLSX.writeFile(wb, 'bookings.xlsx');
  };

  const exportPDF = () => {
    const doc = new jsPDF('l');
    doc.text('Booking Report', 14, 15);
    doc.autoTable({
      startY: 20,
      head: [['#', 'Name', 'Phone', 'Date', 'Hours', 'Total', 'Payment', 'Txn ID']],
      body: filtered.map((b, i) => [
        i + 1, b.fullname, b.phone, b.booking_date?.split('T')[0],
        b.hours, `₹${b.total_amt}`, b.payment === '1' ? 'Online' : 'Cash', b.txn_id || '-'
      ]),
      styles: { fontSize: 8 }
    });
    doc.save('bookings.pdf');
  };

  const exportWord = () => {
    let html = `<h2>Booking Report</h2><table border="1" cellpadding="5" cellspacing="0"><tr><th>#</th><th>Name</th><th>Phone</th><th>Date</th><th>Hours</th><th>Total</th><th>Payment</th><th>Txn ID</th></tr>`;
    filtered.forEach((b, i) => {
      html += `<tr><td>${i + 1}</td><td>${b.fullname}</td><td>${b.phone}</td><td>${b.booking_date?.split('T')[0]}</td><td>${b.hours}</td><td>₹${b.total_amt}</td><td>${b.payment === '1' ? 'Online' : 'Cash'}</td><td>${b.txn_id || '-'}</td></tr>`;
    });
    html += '</table>';
    const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
    saveAs(blob, 'bookings.doc');
  };

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>📋 Booking List</h4>
        <div className="d-flex gap-2 flex-wrap">
          <input className="form-control" placeholder="Search name/phone/txn..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: 180 }} />
          <input type="date" className="form-control" value={filterDate} onChange={e => setFilterDate(e.target.value)} style={{ width: 160 }} />
          <select className="form-control" value={filterPayment} onChange={e => setFilterPayment(e.target.value)} style={{ width: 120 }}>
            <option value="">All</option>
            <option value="0">Cash</option>
            <option value="1">Online</option>
          </select>
        </div>
      </div>

      {/* EXPORT BUTTONS */}
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
                <tr>
                  <th>Action</th><th>#</th><th>Name</th><th>Phone</th><th>Date</th><th>Time</th><th>Hours</th><th>Extra</th><th>Total</th><th>Payment</th><th>Txn ID</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((b, i) => (
                  <tr key={b.id}>
                    <td><button className="btn btn-sm btn-danger" onClick={() => deleteBooking(b.id)}>🗑️</button></td>
                    <td>{i + 1}</td>
                    <td>{b.fullname}</td>
                    <td>{b.phone}</td>
                    <td>{b.booking_date?.split('T')[0]}</td>
                    <td>{b.booking_time}</td>
                    <td>{b.hours}</td>
                    <td>{b.extra_hours}</td>
                    <td>₹{b.total_amt}</td>
                    <td><span className={`badge ${b.payment === '1' ? 'bg-success' : 'bg-warning'}`}>{b.payment === '1' ? 'Online' : 'Cash'}</span></td>
                    <td>{b.txn_id || '-'}</td>
                  </tr>
                ))}
                {filtered.length === 0 && <tr><td colSpan="11" className="text-center py-4">No bookings found</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingList;
