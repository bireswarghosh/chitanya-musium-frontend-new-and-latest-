import React, { useState, useEffect } from 'react';
import axios from 'axios';
import swal from 'sweetalert';
import jsPDF from 'jspdf';
import QRCode from 'qrcode';

const API = 'https://chitanya-musium-backend-new-and-latest.onrender.com/api/camping';

const INTEREST_OPTIONS = [
  { value: 'High', label: '🔥 High Interest' },
  { value: 'Medium', label: '⚡ Medium Interest' },
  { value: 'Low', label: '🌱 Basic Interest' }
];

const SOURCE_OPTIONS = ['Online Public Portal', 'Social Media', 'Walk-in', 'Referral', 'Phone', 'Camp Visit', 'Other'];

const CampingEntry = () => {
  const [activeCampings, setActiveCampings] = useState([]);
  const [selectedCamp, setSelectedCamp] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submittedLead, setSubmittedLead] = useState(null);
  const [showPassModal, setShowPassModal] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    camping_id: '',
    patient_name: '',
    phone: '',
    email: '',
    age: '',
    interest: 'High',
    source: 'Online Public Portal',
    date: today
  });

  useEffect(() => {
    fetchActiveCampings();
  }, []);

  const fetchActiveCampings = async () => {
    try {
      const { data } = await axios.get(`${API}?status=Active`);
      const filtered = data.filter(c => (c.status || 'Active') === 'Active');
      setActiveCampings(filtered);
      if (filtered.length > 0) {
        setFormData(prev => ({ ...prev, camping_id: filtered[0].id.toString() }));
        setSelectedCamp(filtered[0]);
      }
    } catch (err) {
      console.error("Failed to fetch active campings", err);
      swal("Error!", "Could not load active camp events. Please try again later.", "error");
    }
  };

  const handleCampChange = (e) => {
    const campId = e.target.value;
    setFormData(prev => ({ ...prev, camping_id: campId }));
    const camp = activeCampings.find(c => c.id.toString() === campId.toString());
    setSelectedCamp(camp || null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.camping_id) {
      return swal("Required", "Please select an active camp", "warning");
    }
    if (!formData.patient_name.trim()) {
      return swal("Required", "Please enter full name", "warning");
    }
    if (!formData.phone.trim()) {
      return swal("Required", "Please enter phone number", "warning");
    }

    setLoading(true);
    try {
      const { data } = await axios.post(`${API}/leads`, formData);
      
      const campTitle = selectedCamp ? selectedCamp.camping_name : 'Camping Event';
      const qrData = `Camp:${campTitle}|Name:${formData.patient_name}|Phone:${formData.phone}|Date:${formData.date}`;
      let qrUrl = '';
      try {
        qrUrl = await QRCode.toDataURL(qrData, { margin: 1, width: 250 });
      } catch (err) {
        console.warn("QR code generation error", err);
      }

      const leadRecord = {
        ...formData,
        id: data.id || Math.floor(1000 + Math.random() * 9000),
        camping_name: campTitle,
        location: selectedCamp ? selectedCamp.location : '',
        organizer: selectedCamp ? selectedCamp.organizer_name : '',
        contact: selectedCamp ? selectedCamp.contact_details : '',
        qrUrl: qrUrl
      };

      setSubmittedLead(leadRecord);
      setShowPassModal(true);
      
      swal({
        title: "Registration Successful! 🎉",
        text: `Thank you ${formData.patient_name}! Your camp registration pass has been generated.`,
        icon: "success",
        buttons: {
          confirm: { text: "View Pass 🎫", value: true }
        }
      });

      // Reset form fields except camping selection
      setFormData(prev => ({
        ...prev,
        patient_name: '',
        phone: '',
        email: '',
        age: '',
        interest: 'High',
        date: today
      }));
    } catch (err) {
      swal("Error!", err.response?.data?.error || "Registration failed. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!submittedLead) return;

    try {
      let qrDataUrl = submittedLead.qrUrl;
      if (!qrDataUrl) {
        const qrData = `Camp:${submittedLead.camping_name}|Name:${submittedLead.patient_name}|Phone:${submittedLead.phone}|Date:${submittedLead.date}`;
        qrDataUrl = await QRCode.toDataURL(qrData, { margin: 1, width: 250 });
      }

      const doc = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: [100, 145]
      });

      // Background Card
      doc.setFillColor(255, 255, 255);
      doc.rect(0, 0, 100, 145, 'F');

      // Outer Border Box
      doc.setDrawColor(37, 99, 235);
      doc.setLineWidth(0.8);
      doc.roundedRect(4, 4, 92, 137, 3, 3, 'S');

      // Header Banner
      doc.setFillColor(30, 64, 175);
      doc.rect(4, 4, 92, 18, 'F');

      // Header Title
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text('SRI CHAITANYA MAHAPRABHU MUSEUM', 50, 11, { align: 'center' });

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.text('OFFICIAL CAMP REGISTRATION PASS', 50, 16, { align: 'center' });

      // Camp Title
      doc.setTextColor(37, 99, 235);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      const cName = submittedLead.camping_name || 'Camp Event';
      doc.text(cName, 50, 28, { align: 'center' });

      // Location Subtitle
      doc.setTextColor(100, 116, 139);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      const locText = `Location: ${submittedLead.location || 'Museum Campus'}`;
      doc.text(locText, 50, 33, { align: 'center' });

      // Details Container Box
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.3);
      doc.roundedRect(7, 37, 86, 52, 2, 2, 'FD');

      // Data Rows
      doc.setFontSize(8.5);
      let curY = 43;

      const addRow = (label, value) => {
        if (!value) return;
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(51, 65, 85);
        doc.text(`${label}:`, 10, curY);

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(15, 23, 42);
        const strVal = String(value);
        const dispVal = strVal.length > 28 ? strVal.substring(0, 26) + '...' : strVal;
        doc.text(dispVal, 38, curY);
        curY += 6;
      };

      addRow('Camp Name', submittedLead.camping_name);
      addRow('Participant', submittedLead.patient_name);
      addRow('Phone', submittedLead.phone);
      if (submittedLead.email) addRow('Email', submittedLead.email);
      if (submittedLead.age) addRow('Age', `${submittedLead.age} yrs`);
      addRow('Reg. Date', submittedLead.date);
      addRow('Interest', submittedLead.interest);

      // QR Code
      if (qrDataUrl) {
        const qrSize = 34;
        const qrX = (100 - qrSize) / 2;
        const qrY = 92;
        doc.addImage(qrDataUrl, 'PNG', qrX, qrY, qrSize, qrSize);
      }

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text('Scan QR code at camp entrance desk', 50, 129, { align: 'center' });

      // Dashed Separator
      doc.setDrawColor(203, 213, 225);
      doc.setLineDashPattern([1, 1], 0);
      doc.line(8, 132, 92, 132);
      doc.setLineDashPattern([], 0);

      // Footer
      doc.setFontSize(6.5);
      doc.setTextColor(100, 116, 139);
      doc.text('Please present this pass at the camp entrance desk.', 50, 136, { align: 'center' });
      doc.text('🌐 chaitanyamuseum.org | 📞 8617528955', 50, 140, { align: 'center' });

      // Direct file download for Mobile & Desktop
      const sanitizedName = (submittedLead.patient_name || 'Participant').replace(/[^a-zA-Z0-9]/g, '_');
      doc.save(`Camp_Pass_${sanitizedName}.pdf`);
    } catch (error) {
      console.error("Failed to generate PDF pass:", error);
      swal("Error!", "Failed to download PDF pass. Please try again.", "error");
    }
  };

  const handlePrintPass = async () => {
    if (!submittedLead) return;

    // Trigger PDF download first (guaranteeing file saved on mobile)
    await handleDownloadPDF();

    // Trigger iframe print for desktop browser compatibility
    try {
      let qrDataUrl = submittedLead.qrUrl;
      if (!qrDataUrl) {
        const qrData = `Camp:${submittedLead.camping_name}|Name:${submittedLead.patient_name}|Phone:${submittedLead.phone}|Date:${submittedLead.date}`;
        qrDataUrl = await QRCode.toDataURL(qrData, { margin: 1, width: 200 });
      }

      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Camp Registration Pass - ${submittedLead.camping_name}</title>
            <style>
              @page { size: auto; margin: 0; }
              body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                width: 320px;
                margin: 15px auto;
                padding: 16px;
                border: 2px dashed #2563EB;
                border-radius: 12px;
                text-align: center;
                color: #0F172A;
                background-color: #FFFFFF;
                -webkit-print-color-adjust: exact;
              }
              .header { border-bottom: 2px solid #E2E8F0; padding-bottom: 10px; margin-bottom: 10px; }
              .title { font-size: 14px; font-weight: 800; color: #1E40AF; margin: 4px 0; text-transform: uppercase; }
              .subtitle { font-size: 11px; color: #64748B; margin: 0; }
              .camp-title { font-size: 17px; font-weight: 800; color: #2563EB; margin: 12px 0 6px 0; }
              .details { text-align: left; font-size: 12px; line-height: 1.6; margin: 10px 0; background: #F8FAFC; padding: 10px 12px; border-radius: 8px; border: 1px solid #E2E8F0; }
              .details p { margin: 3px 0; }
              .qr-code { margin: 12px 0 8px 0; }
              .footer { font-size: 10px; color: #64748B; border-top: 1px dashed #CBD5E1; padding-top: 8px; margin-top: 10px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h3 class="title">SRI CHAITANYA MAHAPRABHU MUSEUM</h3>
              <p class="subtitle">Official Camp Registration Pass</p>
            </div>
            <div class="camp-title">🏕️ ${submittedLead.camping_name}</div>
            <div class="details">
              <p><b>🏕️ Camp Name:</b> ${submittedLead.camping_name}</p>
              <p><b>📍 Location:</b> ${submittedLead.location || 'Museum Campus'}</p>
              <p><b>👤 Name:</b> ${submittedLead.patient_name}</p>
              <p><b>📞 Phone:</b> ${submittedLead.phone}</p>
              ${submittedLead.email ? `<p><b>✉️ Email:</b> ${submittedLead.email}</p>` : ''}
              ${submittedLead.age ? `<p><b>🎂 Age:</b> ${submittedLead.age} yrs</p>` : ''}
              <p><b>📅 Preferred Date:</b> ${submittedLead.date}</p>
              <p><b>⭐ Interest:</b> ${submittedLead.interest}</p>
            </div>
            <div class="qr-code">
              <img src="${qrDataUrl || `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(`Camp:${submittedLead.camping_name}|Name:${submittedLead.patient_name}|Phone:${submittedLead.phone}`)}`}" width="120" alt="QR Code" />
            </div>
            <div class="footer">
              <p>Please present this pass at the camp entrance desk.</p>
              <p>🌐 chaitanyamuseum.org | 📞 8617528955</p>
            </div>
          </body>
        </html>
      `;

      let iframe = document.getElementById('print-pass-iframe');
      if (iframe) iframe.remove();

      iframe = document.createElement('iframe');
      iframe.id = 'print-pass-iframe';
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0px';
      iframe.style.height = '0px';
      iframe.style.border = '0px';
      document.body.appendChild(iframe);

      const doc = iframe.contentWindow.document;
      doc.open();
      doc.write(htmlContent);
      doc.close();

      setTimeout(() => {
        try {
          iframe.contentWindow.focus();
          iframe.contentWindow.print();
        } catch (e) {
          console.warn("Iframe print error", e);
        }
      }, 400);
    } catch (e) {
      console.warn("Print fallback error", e);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #F8FAFC 0%, #EFF6FF 100%)',
      color: '#0F172A',
      padding: '10px 15px',
      display: 'flex',
      flexDirection: 'column',
      justify: 'center',
      fontFamily: "'Outfit', 'Inter', system-ui, -apple-system, sans-serif"
    }}>
      <div className="container" style={{ maxWidth: '1060px', margin: '0 auto' }}>
        
        {/* LIGHT ELEGANT HEADER */}
        <div className="text-center mb-2">
          <div className="d-inline-flex align-items-center justify-content-center mb-1 px-3 py-0.5" style={{
            background: '#EFF6FF',
            border: '1px solid #BFDBFE',
            borderRadius: '50px',
            color: '#1D4ED8',
            fontSize: '11px',
            fontWeight: '700',
            letterSpacing: '0.5px'
          }}>
            🏛️ SRI CHAITANYA MAHAPRABHU MUSEUM
          </div>

          <h2 style={{
            fontWeight: '900',
            fontSize: '22px',
            color: '#1E3A8A',
            margin: '2px 0 1px 0'
          }}>
            {selectedCamp ? `${selectedCamp.camping_name} Registration` : 'Camp Registration'}
          </h2>
          <p style={{ color: '#64748B', fontSize: '12px', margin: 0 }}>
            Register online for upcoming event hosted by Sri Chaitanya Mahaprabhu Museum.
          </p>
        </div>

        {/* MAIN 2-COLUMN LIGHT CARD CONTAINER - FITS IN VIEWPORT WITHOUT SCROLLING */}
        <div className="row g-2 align-items-stretch" style={{ background: '#FFFFFF', borderRadius: '16px', padding: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.05)', border: '1px solid #E2E8F0' }}>
          
          {/* EVENT SUMMARY PANEL */}
          <div className="col-lg-5">
            <div style={{
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '16px',
              padding: '20px',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justify: 'space-between'
            }}>
              <div>
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <h6 style={{ margin: 0, fontWeight: '800', color: '#1E293B' }}>
                    🏕️ Active Camp Event
                  </h6>
                  <span className="badge bg-success px-2 py-1 rounded-pill" style={{ fontSize: '10px' }}>
                    ● ACTIVE
                  </span>
                </div>

                {activeCampings.length === 0 ? (
                  <div className="text-center py-4" style={{ color: '#64748B' }}>
                    <div style={{ fontSize: '32px', marginBottom: '8px' }}>🏕️</div>
                    <h6 style={{ fontSize: '14px' }}>No Active Camp Events</h6>
                    <p style={{ fontSize: '12px', margin: 0 }}>Currently there are no active camping events open for registration.</p>
                  </div>
                ) : (
                  <>
                    <div className="mb-3">
                      <label style={{ fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '4px', display: 'block' }}>
                        Select Camp *
                      </label>
                      <select
                        className="form-select form-select-sm"
                        style={{
                          background: '#FFFFFF',
                          border: '1px solid #CBD5E1',
                          color: '#0F172A',
                          borderRadius: '10px',
                          fontSize: '13px',
                          padding: '8px 12px',
                          fontWeight: '600'
                        }}
                        value={formData.camping_id}
                        onChange={handleCampChange}
                      >
                        {activeCampings.map(c => (
                          <option key={c.id} value={c.id}>
                            {c.camping_name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {selectedCamp && (
                      <div style={{
                        background: '#EFF6FF',
                        border: '1px solid #BFDBFE',
                        borderRadius: '14px',
                        padding: '14px',
                        marginTop: '10px'
                      }}>
                        <h6 style={{ fontWeight: '800', color: '#1E40AF', marginBottom: '10px', fontSize: '15px' }}>
                          {selectedCamp.camping_name}
                        </h6>

                        <div className="mb-1.5 d-flex align-items-center gap-2" style={{ fontSize: '12.5px', color: '#334155' }}>
                          <span>📍</span>
                          <div>
                            <strong>Location:</strong> {selectedCamp.location || 'Museum Campus'}
                          </div>
                        </div>

                        <div className="mb-1.5 d-flex align-items-center gap-2" style={{ fontSize: '12.5px', color: '#334155' }}>
                          <span>📅</span>
                          <div>
                            <strong>Dates:</strong> {selectedCamp.start_date?.split('T')[0]} to {selectedCamp.end_date?.split('T')[0]}
                          </div>
                        </div>

                        <div className="mb-1.5 d-flex align-items-center gap-2" style={{ fontSize: '12.5px', color: '#334155' }}>
                          <span>👤</span>
                          <div>
                            <strong>Organizer:</strong> {selectedCamp.organizer_name}
                          </div>
                        </div>

                        <div className="mb-1.5 d-flex align-items-center gap-2" style={{ fontSize: '12.5px', color: '#334155' }}>
                          <span>📞</span>
                          <div>
                            <strong>Contact:</strong> {selectedCamp.contact_details}
                          </div>
                        </div>

                        {selectedCamp.remarks && (
                          <div className="mt-2 pt-2 border-top border-blue-200" style={{ fontSize: '11.5px', color: '#64748B' }}>
                            💬 {selectedCamp.remarks}
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="mt-3 pt-2 text-center border-top" style={{ fontSize: '11px', color: '#94A3B8' }}>
                Verified By Sri Chaitanya Museum
              </div>
            </div>
          </div>

          {/* COMPACT PUBLIC REGISTRATION FORM PANEL */}
          <div className="col-lg-7">
            <div style={{ padding: '8px 12px' }}>
              <div className="d-flex align-items-center justify-content-between mb-2">
                <h6 style={{ fontWeight: '800', color: '#0F172A', margin: 0, fontSize: '16px' }}>
                  📋 Participant Registration Details
                </h6>
                <small style={{ color: '#64748B', fontSize: '11px' }}>Fill in details to get instant pass</small>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="row g-2">
                  
                  {/* FULL NAME */}
                  <div className="col-md-6">
                    <label style={{ fontSize: '11.5px', fontWeight: '700', color: '#475569', marginBottom: '2px' }}>
                      Full Name *
                    </label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      name="patient_name"
                      placeholder="e.g. Rahul Sharma"
                      value={formData.patient_name}
                      onChange={handleChange}
                      style={{
                        border: '1px solid #CBD5E1',
                        borderRadius: '8px',
                        padding: '6px 10px',
                        fontSize: '12.5px'
                      }}
                      required
                    />
                  </div>

                  {/* PHONE NUMBER */}
                  <div className="col-md-6">
                    <label style={{ fontSize: '11.5px', fontWeight: '700', color: '#475569', marginBottom: '2px' }}>
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      className="form-control form-control-sm"
                      name="phone"
                      placeholder="10-digit mobile number"
                      value={formData.phone}
                      onChange={handleChange}
                      style={{
                        border: '1px solid #CBD5E1',
                        borderRadius: '8px',
                        padding: '6px 10px',
                        fontSize: '12.5px'
                      }}
                      required
                    />
                  </div>

                  {/* EMAIL */}
                  <div className="col-md-6">
                    <label style={{ fontSize: '11.5px', fontWeight: '700', color: '#475569', marginBottom: '2px' }}>
                      Email Address
                    </label>
                    <input
                      type="email"
                      className="form-control form-control-sm"
                      name="email"
                      placeholder="name@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      style={{
                        border: '1px solid #CBD5E1',
                        borderRadius: '8px',
                        padding: '6px 10px',
                        fontSize: '12.5px'
                      }}
                    />
                  </div>

                  {/* AGE */}
                  <div className="col-md-6">
                    <label style={{ fontSize: '11.5px', fontWeight: '700', color: '#475569', marginBottom: '2px' }}>
                      Age (Years)
                    </label>
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      name="age"
                      placeholder="e.g. 28"
                      value={formData.age}
                      onChange={handleChange}
                      min="1"
                      max="120"
                      style={{
                        border: '1px solid #CBD5E1',
                        borderRadius: '8px',
                        padding: '6px 10px',
                        fontSize: '12.5px'
                      }}
                    />
                  </div>

                  {/* INTEREST LEVEL */}
                  <div className="col-md-6">
                    <label style={{ fontSize: '11.5px', fontWeight: '700', color: '#475569', marginBottom: '2px' }}>
                      Interest Level *
                    </label>
                    <select
                      className="form-select form-select-sm"
                      name="interest"
                      value={formData.interest}
                      onChange={handleChange}
                      style={{
                        border: '1px solid #CBD5E1',
                        borderRadius: '8px',
                        padding: '6px 10px',
                        fontSize: '12.5px'
                      }}
                      required
                    >
                      {INTEREST_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* SOURCE */}
                  <div className="col-md-6">
                    <label style={{ fontSize: '11.5px', fontWeight: '700', color: '#475569', marginBottom: '2px' }}>
                      Registration Source *
                    </label>
                    <select
                      className="form-select form-select-sm"
                      name="source"
                      value={formData.source}
                      onChange={handleChange}
                      style={{
                        border: '1px solid #CBD5E1',
                        borderRadius: '8px',
                        padding: '6px 10px',
                        fontSize: '12.5px'
                      }}
                      required
                    >
                      {SOURCE_OPTIONS.map(s => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* PREFERRED DATE */}
                  <div className="col-md-12">
                    <label style={{ fontSize: '11.5px', fontWeight: '700', color: '#475569', marginBottom: '2px' }}>
                      Preferred Registration Date *
                    </label>
                    <input
                      type="date"
                      className="form-control form-control-sm"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      style={{
                        border: '1px solid #CBD5E1',
                        borderRadius: '8px',
                        padding: '6px 10px',
                        fontSize: '12.5px'
                      }}
                      required
                    />
                  </div>

                </div>

                <div className="mt-3">
                  <button
                    type="submit"
                    className="btn btn-primary w-100"
                    disabled={loading || activeCampings.length === 0}
                    style={{
                      background: 'linear-gradient(90deg, #2563EB 0%, #1D4ED8 100%)',
                      border: 'none',
                      color: '#FFFFFF',
                      fontWeight: '800',
                      fontSize: '14px',
                      padding: '10px',
                      borderRadius: '10px',
                      boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)'
                    }}
                  >
                    {loading ? 'Submitting Registration...' : 'Submit Registration & Generate Pass 🎫'}
                  </button>
                </div>
              </form>
            </div>
          </div>

        </div>

      </div>

      {/* REGISTRATION PASS MODAL */}
      {showPassModal && submittedLead && (
        <div className="modal show d-block" style={{ background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)' }}>
          <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '400px' }}>
            <div className="modal-content text-dark" style={{ borderRadius: '20px', overflow: 'hidden', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}>
              <div className="modal-header text-white p-3" style={{ background: 'linear-gradient(135deg, #1E40AF, #2563EB)' }}>
                <div>
                  <h6 className="modal-title" style={{ fontWeight: '800', margin: 0 }}>
                    🎫 Camp Registration Pass
                  </h6>
                  <small style={{ opacity: 0.9, fontSize: '11px' }}>Sri Chaitanya Mahaprabhu Museum</small>
                </div>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowPassModal(false)}></button>
              </div>

              <div className="modal-body p-3 text-center">
                <h5 style={{ color: '#2563EB', fontWeight: '800', margin: '4px 0' }}>
                  {submittedLead.camping_name}
                </h5>
                <p className="text-muted" style={{ fontSize: '12px', margin: '0 0 10px 0' }}>
                  📍 {submittedLead.location || 'Museum Campus'}
                </p>

                <div className="p-2.5 bg-light rounded-3 text-start" style={{ fontSize: '12.5px', lineHeight: '1.6' }}>
                  <div><strong>Camp Name:</strong> {submittedLead.camping_name}</div>
                  <div><strong>Participant Name:</strong> {submittedLead.patient_name}</div>
                  <div><strong>Phone Number:</strong> {submittedLead.phone}</div>
                  {submittedLead.email && <div><strong>Email:</strong> {submittedLead.email}</div>}
                  {submittedLead.age && <div><strong>Age:</strong> {submittedLead.age} yrs</div>}
                  <div><strong>Registration Date:</strong> {submittedLead.date}</div>
                  <div><strong>Interest:</strong> {submittedLead.interest}</div>
                </div>

                {/* QR CODE */}
                <div className="my-2 text-center">
                  <img
                    src={submittedLead.qrUrl || `https://api.qrserver.com/v1/create-qr-code/?size=110x110&data=${encodeURIComponent(`Camp:${submittedLead.camping_name}|Name:${submittedLead.patient_name}|Phone:${submittedLead.phone}`)}`}
                    alt="Registration QR Code"
                    className="border p-1.5 rounded-3 bg-white shadow-sm"
                  />
                  <div className="mt-1 text-muted" style={{ fontSize: '10.5px' }}>
                    Scan QR code at camp entrance desk
                  </div>
                </div>
              </div>

              <div className="modal-footer bg-light d-flex justify-content-between align-items-center p-2.5">
                <button className="btn btn-sm btn-secondary rounded-pill px-3" onClick={() => setShowPassModal(false)}>
                  Close
                </button>
                <div className="d-flex gap-2">
                  <button className="btn btn-sm btn-outline-primary rounded-pill px-3" onClick={handleDownloadPDF}>
                    📥 Save PDF
                  </button>
                  <button className="btn btn-sm btn-primary rounded-pill px-3" style={{ background: '#2563EB', border: 'none' }} onClick={handlePrintPass}>
                    🖨️ Print Pass
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default CampingEntry;
