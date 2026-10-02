import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import swal from 'sweetalert';
import { ThemeContext } from '../../context/ThemeContext';

const MuseumEntry = () => {
  const { background } = useContext(ThemeContext);
  const dk = background.value === 'dark';

  // ── theme tokens ──
  const pageBg   = dk ? 'linear-gradient(180deg,#0f172a 0%,#1e293b 100%)' : 'linear-gradient(180deg,#F8FAFC 0%,#EFF6FF 100%)';
  const cardBg   = dk ? '#1e293b' : '#ffffff';
  const panelBg  = dk ? '#0f172a' : '#F8FAFC';
  const border   = dk ? '#334155' : '#E2E8F0';
  const text     = dk ? '#e2e8f0' : '#0F172A';
  const muted    = dk ? '#94a3b8' : '#64748B';
  const heading  = dk ? '#e2e8f0' : '#1E3A8A';
  const chipBg   = dk ? '#1e3a5f' : '#EFF6FF';
  const chipClr  = dk ? '#93c5fd' : '#1D4ED8';
  const chipBdr  = dk ? '#1d4ed8' : '#BFDBFE';
  const inputBg  = dk ? '#0f172a' : '#ffffff';
  const inputBdr = dk ? '#475569' : '#CBD5E1';
  const blueBdr  = dk ? '#1d4ed8' : '#BFDBFE';
  const greenBdr = dk ? '#166534' : '#BBF7D0';
  const discBg   = dk ? '#1c1a0a' : '#FFFBEB';
  const discBdr  = dk ? '#854d0e' : '#F59E0B';

  const [galleryPrice, setGalleryPrice] = useState(50);
  const [moviePrice, setMoviePrice] = useState(30);
  const authStatus = localStorage.getItem('isAuthenticated');
  const isLoggedIn = !!authStatus;
  // eslint-disable-next-line no-unused-vars
  const role = localStorage.getItem('userRole');

  const defaultPayment = isLoggedIn ? '0' : '1';

  const [formData, setFormData] = useState({
    firstname: '', phone: '', address: '',
    num_of_persons: '1', total_amt: '50',
    payment: defaultPayment, gallery: '1',
    movie_show: '0', discount: '0', txn_id: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const persons = Number(formData.num_of_persons) || 0;
    const movieTickets = Number(formData.movie_show) || 0;
    const discount = Math.max(0, Number(formData.discount) || 0);
    const gPrice = Number(galleryPrice) >= 0 ? Number(galleryPrice) : 0;
    const mPrice = Number(moviePrice) >= 0 ? Number(moviePrice) : 0;
    let total = (persons * gPrice) + (movieTickets * mPrice) - discount;
    setFormData(prev => ({ ...prev, total_amt: total > 0 ? total.toString() : '0' }));
  }, [formData.num_of_persons, formData.movie_show, formData.discount, galleryPrice, moviePrice]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePrint = (entry) => {
    const gPrice = Number(galleryPrice) >= 0 ? Number(galleryPrice) : 50;
    const mPrice = Number(moviePrice) >= 0 ? Number(moviePrice) : 30;
    const pCount = Number(entry.num_of_persons) || 1;
    const mCount = Number(entry.movie_show) || 0;
    const dAmt = Number(entry.discount) || 0;
    const entryTotal = pCount * gPrice;
    const movieTotal = mCount * mPrice;
    const qrData = `Name: ${entry.firstname}\nPhone: ${entry.phone}\nDate: ${entry.date}\nPersons: ${pCount}\nAmount: ${entry.total_amt}`;
    const printWindow = window.open('', '');
    printWindow.document.write(`<html><head><title>Entry Pass</title><style>body{font-family:monospace;width:300px;margin:auto;text-align:center}.line{border-top:1px dashed #000;margin:8px 0}h3,h4,p{margin:4px 0}.bold{font-weight:bold}</style></head><body><h3>SRI CHAITANYA MAHAPRABHU MUSEUM</h3><p>Visit: chaitanyamuseum.org</p><p>📞 8617528955</p><div class="line"></div><h4>ENTRY PASS</h4><div class="line"></div><p><b>Txn ID :</b> ${entry.txn_id || '-'}</p><p><b>Name :</b> ${entry.firstname}</p><p><b>Phone :</b> ${entry.phone}</p><p><b>Address :</b> ${entry.address}</p><p><b>Date :</b> ${entry.date}</p><p><b>Persons :</b> ${pCount}</p><br/><img src="https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(qrData)}" /><div class="line"></div><p class="bold">Donation Details</p><p>Entry : ₹${gPrice} x ${pCount} = ₹${entryTotal}</p><p>Movie : ${mCount > 0 ? `${mCount} x ₹${mPrice} = ₹${movieTotal}` : 'None'}</p><p>Discount : ₹${dAmt}</p><div class="line"></div><h3>Total : ₹ ${entry.total_amt}</h3><div class="line"></div><p>[Srivas Angan, Jiva Uddhar, Sankirtan, Philosophy, All Galleries]</p><p>No refunds. Open: 10am–12pm & 3pm–7pm</p><p>Mon Closed</p><p>Thank You. Visit Again!</p><script>window.print();window.onafterprint=()=>window.close();</script></body></html>`);
    printWindow.document.close();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (Number(formData.movie_show) > Number(formData.num_of_persons)) {
      setLoading(false);
      return swal("Error!", "Movie tickets cannot exceed persons", "error");
    }
    const total = Number(formData.total_amt) || 0;
    const halfAmt = Math.ceil(total / 2);
    const payAmt = formData.payment === '2' ? halfAmt : total;

    if (formData.payment === '1' || formData.payment === '2') {
      try {
        const { data: order } = await axios.post('https://chitanya-musium-backend-new-and-latest.onrender.com/api/razorpay/create-order', { amount: payAmt });
        const options = {
          key: 'rzp_live_RkF1Uzk5QpuC1K', amount: order.amount, currency: order.currency || 'INR',
          name: 'Sri Chaitanya Mahaprabhu Museum',
          description: formData.payment === '2' ? '50% Advance Entry Payment' : 'Full Entry Payment',
          order_id: order.id,
          prefill: { name: formData.firstname || '', contact: formData.phone || '' },
          handler: async function (response) {
            const updatedData = { ...formData, payment: formData.payment, txn_id: response.razorpay_payment_id };
            const res = await axios.post('https://chitanya-musium-backend-new-and-latest.onrender.com/api/museum', updatedData);
            swal("Success!", formData.payment === '2' ? `50% Advance ₹${payAmt} paid! Remaining ₹${total - payAmt} due at counter.` : "Payment Successful & Entry Created!", "success").then(() => handlePrint(res.data));
            setFormData({ firstname: '', phone: '', address: '', num_of_persons: '1', total_amt: (Number(galleryPrice) || 50).toString(), payment: defaultPayment, gallery: '1', movie_show: '0', discount: '0', txn_id: '' });
          },
          theme: { color: '#3399cc' }
        };
        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (response) { swal("Payment Failed", response.error?.description || "Payment was not completed", "error"); });
        rzp.open();
      } catch (err) { swal("Error!", err.response?.data?.error || "Payment order creation failed", "error"); }
      finally { setLoading(false); }
      return;
    }
    // Cash (admin only)
    try {
      const res = await axios.post('https://chitanya-musium-backend-new-and-latest.onrender.com/api/museum', formData);
      swal("Success!", "Entry Created!", "success").then(() => handlePrint(res.data));
      setFormData({ firstname: '', phone: '', address: '', num_of_persons: '1', total_amt: (Number(galleryPrice) || 50).toString(), payment: defaultPayment, gallery: '1', movie_show: '0', discount: '0', txn_id: '' });
    } catch { swal("Error!", "Failed", "error"); }
    finally { setLoading(false); }
  };

  const gTotal = (Number(formData.num_of_persons) || 0) * (Number(galleryPrice) || 0);
  const mTotal = (Number(formData.movie_show) || 0) * (Number(moviePrice) || 0);

  const inp = { border: `1px solid ${inputBdr}`, borderRadius: '8px', padding: '6px 10px', fontSize: '12.5px', background: inputBg, color: text };

  return (
    <div style={{ minHeight: '100vh', background: pageBg, color: text, padding: '10px 12px', display: 'flex', flexDirection: 'column', fontFamily: "'Outfit','Inter',system-ui,sans-serif" }}>
      <div className="container" style={{ maxWidth: '1100px', margin: '0 auto' }}>

        {/* HEADER */}
        <div className="text-center mb-2">
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '4px', background: chipBg, border: `1px solid ${chipBdr}`, borderRadius: '50px', color: chipClr, fontSize: '11px', fontWeight: '700', letterSpacing: '0.5px', padding: '4px 14px' }}>
            🏛️ SRI CHAITANYA MAHAPRABHU MUSEUM · POS COUNTER
          </div>
          <h2 style={{ fontWeight: '900', fontSize: '20px', color: heading, margin: '2px 0 1px 0' }}>Museum Entry Form</h2>
          <p style={{ color: muted, fontSize: '12px', margin: 0 }}>Fast counter ticketing · dynamic rate adjustment · instant pass generation</p>
        </div>

        {/* MAIN 2-COLUMN CARD */}
        <div className="row g-2 align-items-stretch" style={{ background: cardBg, borderRadius: '16px', padding: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.08)', border: `1px solid ${border}` }}>

          {/* LEFT: TICKET RATES + TOTAL */}
          <div className="col-md-5">
            <div style={{ background: panelBg, border: `1px solid ${border}`, borderRadius: '14px', padding: '16px', height: '100%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div className="d-flex align-items-center justify-content-between">
                <h6 style={{ margin: 0, fontWeight: '800', color: text, fontSize: '14px' }}>🎟️ Ticket Rates</h6>
                <span style={{ background: chipBg, color: chipClr, border: `1px solid ${chipBdr}`, borderRadius: '20px', fontSize: '10px', fontWeight: '700', padding: '2px 10px' }}>✏️ Editable</span>
              </div>

              {/* Museum Entry Rate Card */}
              <div style={{ background: cardBg, border: `1px solid ${blueBdr}`, borderRadius: '12px', padding: '12px' }}>
                <div className="d-flex align-items-center gap-2 mb-2">
                  <div style={{ width: 36, height: 36, borderRadius: '10px', background: 'linear-gradient(135deg,#4facfe,#00f2fe)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0 }}>🏛️</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '800', fontSize: '13px', color: text }}>Museum Entry</div>
                    <div style={{ fontSize: '11px', color: muted }}>Gallery pass per person</div>
                  </div>
                </div>
                <div className="row g-2">
                  <div className="col-6">
                    <label style={{ fontSize: '11px', fontWeight: '700', color: muted, display: 'block', marginBottom: '3px' }}>Persons</label>
                    <input type="number" className="form-control form-control-sm text-center fw-bold" style={{ ...inp }} name="num_of_persons" value={formData.num_of_persons} onChange={handleChange} min="1" />
                  </div>
                  <div className="col-6">
                    <label style={{ fontSize: '11px', fontWeight: '700', color: muted, display: 'block', marginBottom: '3px' }}>Rate (₹)</label>
                    <div className="input-group input-group-sm">
                      <span className="input-group-text fw-bold text-primary" style={{ borderRadius: '8px 0 0 8px', fontSize: '12px', background: inputBg, border: `1px solid ${inputBdr}`, color: '#0284c7' }}>₹</span>
                      <input type="number" className="form-control text-center fw-bold text-primary border-start-0" style={{ borderRadius: '0 8px 8px 0', fontSize: '13px', background: inputBg, color: '#0284c7', border: `1px solid ${inputBdr}` }} value={galleryPrice} min="0" onChange={(e) => { const v = e.target.value; setGalleryPrice(v === '' ? '' : Math.max(0, Number(v))); }} />
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'right', marginTop: '6px', fontWeight: '800', fontSize: '15px', color: '#0284c7' }}>Subtotal: ₹{gTotal}</div>
              </div>

              {/* Movie Ticket Rate Card */}
              <div style={{ background: cardBg, border: `1px solid ${greenBdr}`, borderRadius: '12px', padding: '12px' }}>
                <div className="d-flex align-items-center gap-2 mb-2">
                  <div style={{ width: 36, height: 36, borderRadius: '10px', background: 'linear-gradient(135deg,#10b981,#059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0 }}>🎬</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '800', fontSize: '13px', color: text }}>Movie Ticket</div>
                    <div style={{ fontSize: '11px', color: muted }}>3D Audio-visual show</div>
                  </div>
                </div>
                <div className="row g-2">
                  <div className="col-6">
                    <label style={{ fontSize: '11px', fontWeight: '700', color: muted, display: 'block', marginBottom: '3px' }}>Tickets</label>
                    <input type="number" className="form-control form-control-sm text-center fw-bold" style={{ ...inp }} name="movie_show" value={formData.movie_show} onChange={handleChange} min="0" max={formData.num_of_persons} />
                  </div>
                  <div className="col-6">
                    <label style={{ fontSize: '11px', fontWeight: '700', color: muted, display: 'block', marginBottom: '3px' }}>Rate (₹)</label>
                    <div className="input-group input-group-sm">
                      <span className="input-group-text fw-bold text-success" style={{ borderRadius: '8px 0 0 8px', fontSize: '12px', background: inputBg, border: `1px solid ${inputBdr}`, color: '#059669' }}>₹</span>
                      <input type="number" className="form-control text-center fw-bold text-success border-start-0" style={{ borderRadius: '0 8px 8px 0', fontSize: '13px', background: inputBg, color: '#059669', border: `1px solid ${inputBdr}` }} value={moviePrice} min="0" onChange={(e) => { const v = e.target.value; setMoviePrice(v === '' ? '' : Math.max(0, Number(v))); }} />
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'right', marginTop: '6px', fontWeight: '800', fontSize: '15px', color: '#059669' }}>Subtotal: ₹{mTotal}</div>
              </div>

              {/* Discount */}
              {authStatus && (
                <div style={{ background: discBg, border: `1px dashed ${discBdr}`, borderRadius: '12px', padding: '12px' }}>
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <div style={{ width: 32, height: 32, borderRadius: '8px', background: 'linear-gradient(135deg,#f59e0b,#d97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0 }}>🏷️</div>
                    <div style={{ fontWeight: '700', fontSize: '13px', color: dk ? '#fbbf24' : '#92400E' }}>Special Discount</div>
                  </div>
                  <div className="input-group input-group-sm">
                    <span className="input-group-text fw-bold text-danger" style={{ borderRadius: '8px 0 0 8px', background: inputBg, border: `1px solid ${inputBdr}` }}>₹</span>
                    <input type="number" className="form-control fw-bold text-danger border-start-0" style={{ borderRadius: '0 8px 8px 0', fontSize: '13px', background: inputBg, color: '#dc2626', border: `1px solid ${inputBdr}` }} name="discount" value={formData.discount} min="0" placeholder="0" onChange={(e) => { if (e.target.value >= 0) handleChange(e); }} />
                  </div>
                </div>
              )}

              {/* TOTAL BAR */}
              <div style={{ borderRadius: '14px', padding: '14px 16px', color: '#fff', background: 'linear-gradient(135deg,#0f172a 0%,#1e1b4b 50%,#0f172a 100%)', border: '1px solid rgba(255,255,255,0.1)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: '-40%', right: '-10%', width: '200px', height: '200px', background: 'radial-gradient(circle,rgba(79,172,254,0.2) 0%,transparent 70%)', pointerEvents: 'none' }} />
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', marginBottom: '4px', position: 'relative' }}>
                  {Number(formData.num_of_persons)||0}×₹{Number(galleryPrice)||0} + {Number(formData.movie_show)||0}×₹{Number(moviePrice)||0}
                  {Number(formData.discount) > 0 && <> − ₹{formData.discount}</>}
                </div>
                <div className="d-flex align-items-center justify-content-between" style={{ position: 'relative' }}>
                  <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: 'rgba(255,255,255,0.5)' }}>Total Payable</span>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '3px' }}>
                    <span style={{ fontSize: '16px', fontWeight: '800', color: '#fbbf24' }}>₹</span>
                    <span style={{ fontSize: '28px', fontWeight: '900', color: '#fff', letterSpacing: '-1px' }}>{formData.total_amt}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: VISITOR INFO + PAYMENT + SUBMIT */}
          <div className="col-md-7">
            <div style={{ padding: '8px 12px' }}>
              <div className="d-flex align-items-center justify-content-between mb-2">
                <h6 style={{ fontWeight: '800', color: text, margin: 0, fontSize: '15px' }}>👤 Visitor Details & Payment</h6>
                <small style={{ color: muted, fontSize: '11px' }}>Fill in to generate entry pass</small>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="row g-2">
                  <div className="col-md-6">
                    <label style={{ fontSize: '11.5px', fontWeight: '700', color: muted, marginBottom: '2px', display: 'block' }}>Full Name <span style={{ color: '#dc2626' }}>*</span></label>
                    <input type="text" className="form-control form-control-sm" style={{ ...inp }} placeholder="e.g. Rahul Sharma" name="firstname" value={formData.firstname} onChange={handleChange} required />
                  </div>
                  <div className="col-md-6">
                    <label style={{ fontSize: '11.5px', fontWeight: '700', color: muted, marginBottom: '2px', display: 'block' }}>Phone Number <span style={{ color: '#dc2626' }}>*</span></label>
                    <input type="tel" className="form-control form-control-sm" style={{ ...inp }} placeholder="10-digit mobile" name="phone" value={formData.phone} onChange={handleChange} required />
                  </div>
                  <div className="col-12">
                    <label style={{ fontSize: '11.5px', fontWeight: '700', color: muted, marginBottom: '2px', display: 'block' }}>Address / City <span style={{ color: '#dc2626' }}>*</span></label>
                    <input type="text" className="form-control form-control-sm" style={{ ...inp }} placeholder="Visitor's city or address" name="address" value={formData.address} onChange={handleChange} required />
                  </div>

                  {/* Payment Mode */}
                  <div className="col-12 mt-1">
                    <label style={{ fontSize: '11.5px', fontWeight: '700', color: muted, marginBottom: '6px', display: 'block' }}>💳 Payment Mode</label>
                    {!isLoggedIn && (
                      <div style={{ background: dk ? '#1c1a0a' : '#fffbeb', border: `1px solid ${dk ? '#854d0e' : '#f59e0b'}`, borderRadius: '8px', padding: '6px 10px', marginBottom: '8px', fontSize: '11px', color: dk ? '#fbbf24' : '#92400e' }}>
                        ⚠️ Guest booking requires minimum 50% advance payment online.
                      </div>
                    )}
                    <div className="row g-2">
                      {[
                        ...(isLoggedIn ? [{ val: '0', emoji: '💵', label: 'Cash', sub: 'Instant pass' }] : []),
                        { val: '1', emoji: '⚡', label: 'Online – Full', sub: `Pay ₹${formData.total_amt}` },
                        { val: '2', emoji: '💳', label: 'Online – 50%', sub: `Pay ₹${Math.ceil(Number(formData.total_amt)/2)} now` },
                      ].map(({ val, emoji, label, sub }) => (
                        <div className={isLoggedIn ? 'col-4' : 'col-6'} key={val}>
                          <div onClick={() => setFormData(prev => ({ ...prev, payment: val }))} style={{
                            border: formData.payment === val ? '2px solid #0284c7' : `1px solid ${border}`,
                            background: formData.payment === val ? (dk ? '#1e3a5f' : '#EFF6FF') : panelBg,
                            borderRadius: '10px', padding: '10px 8px', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s'
                          }}>
                            <span style={{ fontSize: '1.2rem' }}>{emoji}</span>
                            <div>
                              <div style={{ fontWeight: '700', fontSize: '11px', color: text }}>{label}</div>
                              <div style={{ fontSize: '10px', color: muted }}>{sub}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="col-12">
                    <label style={{ fontSize: '11.5px', fontWeight: '700', color: muted, marginBottom: '2px', display: 'block' }}>Transaction / Memo ID <span style={{ fontWeight: '400', color: muted }}>(Optional)</span></label>
                    <input className="form-control form-control-sm" style={{ ...inp }} placeholder="UPI Ref / Cash Counter Slip No." name="txn_id" value={formData.txn_id} onChange={handleChange} />
                  </div>
                </div>

                <div className="mt-3">
                  <button type="submit" className="btn w-100 text-white fw-bold" disabled={loading} style={{ background: 'linear-gradient(90deg,#0284c7 0%,#00c2fe 100%)', border: 'none', fontWeight: '800', fontSize: '14px', padding: '11px', borderRadius: '10px', boxShadow: '0 4px 14px rgba(2,132,199,0.35)' }}>
                    {loading ? (
                      <span className="d-flex align-items-center justify-content-center gap-2">
                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                        Generating Entry Pass...
                      </span>
                    ) : (
                      <span>Confirm & Print Entry Pass &nbsp;
                        <span style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '20px', padding: '2px 12px', fontSize: '13px', fontWeight: '900' }}>₹{formData.payment === '2' ? Math.ceil(Number(formData.total_amt)/2) : formData.total_amt}</span>
                      </span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '8px', color: muted, fontSize: '11px' }}>
          🌐 chaitanyamuseum.org · 📞 8617528955 · No refunds · Open: 10am–12pm & 3pm–7pm · Mon Closed
        </div>
      </div>
    </div>
  );
};

export default MuseumEntry;
