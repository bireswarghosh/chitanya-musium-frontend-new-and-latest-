import React, { useContext, useState } from 'react';
import axios from 'axios';
import swal from 'sweetalert';
import { ThemeContext } from '../../context/ThemeContext';

const API = 'https://chitanya-musium-backend-new-and-latest.onrender.com/api/booking';
const DEFAULT_HALL_CHARGE = 6600;
const DEFAULT_EXTRA_HOUR_CHARGE = 2200;
const DEFAULT_BASE_HOURS = 3;

const num = (v, fb = 0) => { const n = Number(v); return Number.isFinite(n) && n >= 0 ? n : fb; };

const Booking = () => {
  const { background } = useContext(ThemeContext);
  const dk = background.value === 'dark';
  const isLoggedIn = !!localStorage.getItem('isAuthenticated');

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

  // payment: '0'=Cash(admin only), '1'=Online Full, '2'=Online 50%
  const defaultPayment = isLoggedIn ? '0' : '1';

  const [formData, setFormData] = useState({
    fullname: '', phone: '', email: '', address: '', aadhar: '',
    booking_date: '', booking_time: '', extra_hours: '0',
    payment: defaultPayment, txn_id: ''
  });
  const [loading, setLoading] = useState(false);
  const [hallCharge, setHallCharge] = useState(DEFAULT_HALL_CHARGE);
  const [extraHourCharge, setExtraHourCharge] = useState(DEFAULT_EXTRA_HOUR_CHARGE);
  const [baseHours, setBaseHours] = useState(DEFAULT_BASE_HOURS);

  const hall = num(hallCharge);
  const ehr  = num(extraHourCharge);
  const bh   = Math.max(1, Math.floor(num(baseHours, DEFAULT_BASE_HOURS)) || DEFAULT_BASE_HOURS);
  const extraHours  = Math.max(0, Math.floor(num(formData.extra_hours)));
  const extraCharge = extraHours * ehr;
  const totalAmt    = hall + extraCharge;
  const totalHours  = bh + extraHours;
  const halfAmt     = Math.ceil(totalAmt / 2);
  const payAmt      = formData.payment === '2' ? halfAmt : totalAmt;

  const handleChange = (e) => { const { name, value } = e.target; setFormData(prev => ({ ...prev, [name]: value })); };
  const resetForm = () => setFormData({ fullname: '', phone: '', email: '', address: '', aadhar: '', booking_date: '', booking_time: '', extra_hours: '0', payment: defaultPayment, txn_id: '' });

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    const payload = {
      ...formData,
      hours: totalHours, hall_charge: hall,
      extra_charge: extraCharge, total_amt: totalAmt,
      paid_amt: payAmt, payment_type: formData.payment
    };

    // Online payment (full or 50%)
    if (formData.payment === '1' || formData.payment === '2') {
      try {
        const { data: order } = await axios.post('https://chitanya-musium-backend-new-and-latest.onrender.com/api/razorpay/create-order', { amount: payAmt });
        const options = {
          key: 'rzp_live_RkF1Uzk5QpuC1K', amount: order.amount, currency: order.currency || 'INR',
          name: 'Hall Booking Payment',
          description: formData.payment === '2' ? `50% Advance · ${totalHours}h Booking` : `Full Payment · ${totalHours}h Booking`,
          order_id: order.id,
          prefill: { name: formData.fullname || '', contact: formData.phone || '' },
          handler: async function (response) {
            await axios.post(API, { ...payload, txn_id: response.razorpay_payment_id });
            swal("Success!", formData.payment === '2' ? `50% Advance ₹${payAmt} paid! Remaining ₹${totalAmt - payAmt} due at venue.` : "Full Payment Done & Booking Confirmed!", "success");
            resetForm();
          },
          theme: { color: '#3399cc' }
        };
        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (r) { swal("Payment Failed", r.error?.description || "Payment was not completed", "error"); });
        rzp.open();
      } catch (err) { swal("Error!", err.response?.data?.error || "Payment order creation failed", "error"); }
      finally { setLoading(false); }
      return;
    }

    // Cash (admin only)
    try { await axios.post(API, payload); swal("Success!", "Booking Created!", "success"); resetForm(); }
    catch { swal("Error!", "Failed to create booking", "error"); }
    finally { setLoading(false); }
  };

  const inp = { border: `1px solid ${inputBdr}`, borderRadius: '8px', padding: '6px 10px', fontSize: '12.5px', background: inputBg, color: text };

  const rateInput = (val, setVal) => (
    <input type="number" value={val} min="0" className="form-control form-control-sm text-center fw-bold"
      style={{ borderRadius: '8px', fontSize: '13px', background: inputBg, color: text, border: `1px solid ${inputBdr}` }}
      onChange={(e) => { const v = e.target.value; setVal(v === '' ? '' : Math.max(0, Number(v))); }} />
  );

  // Payment options: Cash only for logged-in, Online options always
  const paymentOptions = [
    ...(isLoggedIn ? [{ val: '0', emoji: '\ud83d\udcb5', label: 'Cash', sub: 'Instant confirm' }] : []),
    { val: '1', emoji: '\u26a1', label: 'Online \u2013 Full', sub: `Pay \u20b9${totalAmt}` },
    { val: '2', emoji: '\ud83d\udcb3', label: 'Online \u2013 50%', sub: `Pay \u20b9${halfAmt} now` },
  ];

  return (
    <div style={{ minHeight: '100vh', background: pageBg, color: text, padding: '10px 12px', display: 'flex', flexDirection: 'column', fontFamily: "'Outfit','Inter',system-ui,sans-serif" }}>
      <div className="container" style={{ maxWidth: '1100px', margin: '0 auto' }}>

        {/* HEADER */}
        <div className="text-center mb-2">
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '4px', background: chipBg, border: `1px solid ${chipBdr}`, borderRadius: '50px', color: chipClr, fontSize: '11px', fontWeight: '700', letterSpacing: '0.5px', padding: '4px 14px' }}>
            🏛️ SRI CHAITANYA MAHAPRABHU MUSEUM · HALL BOOKING
          </div>
          <h2 style={{ fontWeight: '900', fontSize: '20px', color: heading, margin: '2px 0 1px 0' }}>🏟️ Hall Booking Form</h2>
          <p style={{ color: muted, fontSize: '12px', margin: 0 }}>Adjust rates if needed — default tariff applies automatically</p>
        </div>

        {/* MAIN 2-COLUMN CARD */}
        <div className="row g-2 align-items-stretch" style={{ background: cardBg, borderRadius: '16px', padding: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.08)', border: `1px solid ${border}` }}>

          {/* LEFT: TARIFF + TOTAL */}
          <div className="col-md-5">
            <div style={{ background: panelBg, border: `1px solid ${border}`, borderRadius: '14px', padding: '16px', height: '100%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div className="d-flex align-items-center justify-content-between">
                <h6 style={{ margin: 0, fontWeight: '800', color: text, fontSize: '14px' }}>💰 Hall Tariff</h6>
                <span style={{ background: chipBg, color: chipClr, border: `1px solid ${chipBdr}`, borderRadius: '20px', fontSize: '10px', fontWeight: '700', padding: '2px 10px' }}>✏️ Editable</span>
              </div>

              {/* Rate Cards */}
              <div className="row g-2">
                {[
                  { emoji: '🏟️', label: `Hall (${bh}h)`, hint: 'base pack', val: hallCharge, set: setHallCharge },
                  { emoji: '⏱️', label: 'Extra /hr', hint: 'per hour', val: extraHourCharge, set: setExtraHourCharge },
                  { emoji: '🕙', label: 'Base hrs', hint: 'included', val: baseHours, set: setBaseHours, suffix: 'h' },
                ].map(({ emoji, label, hint, val, set, suffix }) => (
                  <div className="col-6" key={label}>
                    <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: '12px', padding: '10px', textAlign: 'center' }}>
                      <div style={{ fontSize: '1.2rem' }}>{emoji}</div>
                      <div style={{ fontSize: '10px', fontWeight: '700', color: muted, textTransform: 'uppercase', letterSpacing: '0.5px', margin: '2px 0 4px' }}>{label}</div>
                      <div className="d-flex align-items-center justify-content-center gap-1">
                        {!suffix && <span style={{ fontSize: '11px', color: muted, fontWeight: '700' }}>₹</span>}
                        {rateInput(val, set)}
                        {suffix && <span style={{ fontSize: '11px', color: muted, fontWeight: '700' }}>{suffix}</span>}
                      </div>
                      <div style={{ fontSize: '10px', color: muted, marginTop: '2px' }}>{hint}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Breakdown */}
              <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: '12px', padding: '12px', fontSize: '12px' }}>
                {[
                  { icon: '🏟️', label: `Hall (${bh}h)`, val: hall },
                  { icon: '⏱️', label: `Extra (${extraHours}h)`, val: extraCharge },
                ].map(({ icon, label, val }) => (
                  <div className="d-flex justify-content-between mb-1" key={label}>
                    <span style={{ color: muted }}>{icon} {label}</span>
                    <span style={{ fontWeight: '700', color: text }}>₹{val}</span>
                  </div>
                ))}
                <div style={{ borderTop: `1px dashed ${border}`, marginTop: '6px', paddingTop: '6px' }} className="d-flex justify-content-between">
                  <span style={{ fontWeight: '700', color: text }}>Total · {totalHours}h</span>
                  <span style={{ fontWeight: '900', color: '#0284c7', fontSize: '14px' }}>₹{totalAmt}</span>
                </div>
                {formData.payment === '2' && (
                  <div className="d-flex justify-content-between mt-1" style={{ background: dk ? '#1c2a1a' : '#f0fdf4', borderRadius: '8px', padding: '6px 8px' }}>
                    <span style={{ color: '#16a34a', fontWeight: '700', fontSize: '11px' }}>💳 50% Advance Due Now</span>
                    <span style={{ fontWeight: '900', color: '#16a34a', fontSize: '13px' }}>₹{halfAmt}</span>
                  </div>
                )}
              </div>

              {/* TOTAL BAR */}
              <div style={{ borderRadius: '14px', padding: '14px 16px', color: '#fff', background: 'linear-gradient(135deg,#0f172a 0%,#1e1b4b 50%,#0f172a 100%)', border: '1px solid rgba(255,255,255,0.1)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: '-40%', right: '-10%', width: '200px', height: '200px', background: 'radial-gradient(circle,rgba(79,172,254,0.2) 0%,transparent 70%)', pointerEvents: 'none' }} />
                <div className="d-flex align-items-center justify-content-between" style={{ position: 'relative' }}>
                  <div>
                    <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: 'rgba(255,255,255,0.5)', display: 'block' }}>Total · {totalHours} hours</span>
                    {formData.payment === '2' && <span style={{ fontSize: '10px', color: '#86efac' }}>Pay ₹{halfAmt} now · ₹{totalAmt - halfAmt} at venue</span>}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '3px' }}>
                    <span style={{ fontSize: '16px', fontWeight: '800', color: '#fbbf24' }}>₹</span>
                    <span style={{ fontSize: '28px', fontWeight: '900', color: '#fff', letterSpacing: '-1px' }}>{formData.payment === '2' ? halfAmt : totalAmt}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: BOOKING DETAILS + PAYMENT + SUBMIT */}
          <div className="col-md-7">
            <div style={{ padding: '8px 12px' }}>
              <div className="d-flex align-items-center justify-content-between mb-2">
                <h6 style={{ fontWeight: '800', color: text, margin: 0, fontSize: '15px' }}>📋 Booking Details</h6>
                <small style={{ color: muted, fontSize: '11px' }}>Fill in to confirm booking</small>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="row g-2">
                  <div className="col-md-6">
                    <label style={{ fontSize: '11.5px', fontWeight: '700', color: muted, marginBottom: '2px', display: 'block' }}>Full Name <span style={{ color: '#dc2626' }}>*</span></label>
                    <input className="form-control form-control-sm" style={{ ...inp }} placeholder="e.g. Rahul Sharma" name="fullname" value={formData.fullname} onChange={handleChange} required />
                  </div>
                  <div className="col-md-6">
                    <label style={{ fontSize: '11.5px', fontWeight: '700', color: muted, marginBottom: '2px', display: 'block' }}>Phone <span style={{ color: '#dc2626' }}>*</span></label>
                    <input className="form-control form-control-sm" style={{ ...inp }} placeholder="10-digit mobile" name="phone" value={formData.phone} onChange={handleChange} required />
                  </div>
                  <div className="col-md-6">
                    <label style={{ fontSize: '11.5px', fontWeight: '700', color: muted, marginBottom: '2px', display: 'block' }}>Email</label>
                    <input className="form-control form-control-sm" style={{ ...inp }} placeholder="name@example.com" name="email" value={formData.email} onChange={handleChange} />
                  </div>
                  <div className="col-md-6">
                    <label style={{ fontSize: '11.5px', fontWeight: '700', color: muted, marginBottom: '2px', display: 'block' }}>Aadhar Number</label>
                    <input className="form-control form-control-sm" style={{ ...inp }} placeholder="12-digit Aadhar" name="aadhar" value={formData.aadhar} onChange={handleChange} maxLength={12} />
                  </div>
                  <div className="col-12">
                    <label style={{ fontSize: '11.5px', fontWeight: '700', color: muted, marginBottom: '2px', display: 'block' }}>Address</label>
                    <input className="form-control form-control-sm" style={{ ...inp }} placeholder="City / address" name="address" value={formData.address} onChange={handleChange} />
                  </div>
                  <div className="col-md-4">
                    <label style={{ fontSize: '11.5px', fontWeight: '700', color: muted, marginBottom: '2px', display: 'block' }}>Booking Date <span style={{ color: '#dc2626' }}>*</span></label>
                    <input type="date" className="form-control form-control-sm" style={{ ...inp }} name="booking_date" value={formData.booking_date} onChange={handleChange} required />
                  </div>
                  <div className="col-md-4">
                    <label style={{ fontSize: '11.5px', fontWeight: '700', color: muted, marginBottom: '2px', display: 'block' }}>Booking Time</label>
                    <input type="time" className="form-control form-control-sm" style={{ ...inp }} name="booking_time" value={formData.booking_time} onChange={handleChange} />
                  </div>
                  <div className="col-md-4">
                    <label style={{ fontSize: '11.5px', fontWeight: '700', color: muted, marginBottom: '2px', display: 'block' }}>Extra Hours (₹{ehr}/hr)</label>
                    <input type="number" className="form-control form-control-sm" style={{ ...inp }} name="extra_hours" value={formData.extra_hours} onChange={handleChange} min="0" />
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
                      {paymentOptions.map(({ val, emoji, label, sub }) => (
                        <div className={paymentOptions.length === 3 ? 'col-4' : 'col-6'} key={val}>
                          <div onClick={() => setFormData(p => ({ ...p, payment: val }))} style={{
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
                    <label style={{ fontSize: '11.5px', fontWeight: '700', color: muted, marginBottom: '2px', display: 'block' }}>Transaction ID <span style={{ fontWeight: '400', color: muted }}>(Optional)</span></label>
                    <input className="form-control form-control-sm" style={{ ...inp }} placeholder="UPI ref / slip no." name="txn_id" value={formData.txn_id} onChange={handleChange} />
                  </div>
                </div>

                <div className="mt-3">
                  <button type="submit" className="btn w-100 text-white fw-bold" disabled={loading} style={{ background: 'linear-gradient(90deg,#0284c7 0%,#00c2fe 100%)', border: 'none', fontWeight: '800', fontSize: '14px', padding: '11px', borderRadius: '10px', boxShadow: '0 4px 14px rgba(2,132,199,0.35)' }}>
                    {loading ? 'Processing…' : (
                      <span>Confirm Booking &nbsp;
                        <span style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '20px', padding: '2px 12px', fontSize: '13px', fontWeight: '900' }}>₹{payAmt}</span>
                      </span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '8px', color: muted, fontSize: '11px' }}>
          🌐 chaitanyamuseum.org · 📞 8617528955 · No refunds · Hall tariff subject to management rates
        </div>
      </div>
    </div>
  );
};

export default Booking;
