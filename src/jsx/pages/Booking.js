import React, { useState } from 'react';
import axios from 'axios';
import swal from 'sweetalert';
import '../../css/forms-premium.css';

const API = 'https://chitanya-musium-backend-new-and-latest.onrender.com/api/booking';

// Default hall rates — editable in the form (visit-entry style)
const DEFAULT_SERVICE_CHARGE = 1000;
const DEFAULT_BOOKING_CHARGE = 3000; // base hours included
const DEFAULT_EXTRA_HOUR_CHARGE = 1000;
const DEFAULT_BASE_HOURS = 3;

const num = (v, fb = 0) => {
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? n : fb;
};

const Booking = () => {
  const [formData, setFormData] = useState({
    fullname: '', phone: '', email: '', address: '',
    booking_date: '', booking_time: '',
    extra_hours: '0', payment: '0', txn_id: ''
  });
  const [loading, setLoading] = useState(false);

  // Editable rates (same calculation logic, defaults preserved)
  const [serviceCharge, setServiceCharge] = useState(DEFAULT_SERVICE_CHARGE);
  const [bookingCharge, setBookingCharge] = useState(DEFAULT_BOOKING_CHARGE);
  const [extraHourCharge, setExtraHourCharge] = useState(DEFAULT_EXTRA_HOUR_CHARGE);
  const [baseHours, setBaseHours] = useState(DEFAULT_BASE_HOURS);

  const svc = num(serviceCharge);
  const book = num(bookingCharge);
  const ehr = num(extraHourCharge);
  const bh = Math.max(1, Math.floor(num(baseHours, DEFAULT_BASE_HOURS)) || DEFAULT_BASE_HOURS);
  const extraHours = Math.max(0, Math.floor(num(formData.extra_hours)));
  const extraCharge = extraHours * ehr;
  const totalAmt = svc + book + extraCharge;
  const totalHours = bh + extraHours;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      ...formData,
      hours: totalHours,
      service_charge: svc,
      booking_charge: book,
      extra_charge: extraCharge,
      total_amt: totalAmt
    };

    // Online payment → Razorpay
    if (formData.payment === '1') {
      try {
        const { data: order } = await axios.post(
          'https://chitanya-musium-backend-new-and-latest.onrender.com/api/razorpay/create-order',
          { amount: totalAmt }
        );

        const options = {
          key: 'rzp_live_RkF1Uzk5QpuC1K',
          amount: order.amount,
          currency: order.currency || 'INR',
          name: 'Booking Payment',
          description: `${totalHours} Hours Booking`,
          order_id: order.id,
          prefill: {
            name: formData.firstname || '',
            contact: formData.phone || ''
          },
          handler: async function (response) {
            const finalPayload = { ...payload, payment: '1', txn_id: response.razorpay_payment_id };
            await axios.post(API, finalPayload);
            swal("Success!", "Payment Done & Booking Confirmed!", "success");
            resetForm();
          },
          theme: { color: '#3399cc' }
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (response) {
          swal("Payment Failed", response.error?.description || "Payment was not completed", "error");
        });
        rzp.open();
      } catch (err) {
        swal("Error!", err.response?.data?.error || "Payment order creation failed", "error");
      } finally { setLoading(false); }
      return;
    }

    // Cash payment
    try {
      await axios.post(API, payload);
      swal("Success!", "Booking Created!", "success");
      resetForm();
    } catch {
      swal("Error!", "Failed to create booking", "error");
    } finally { setLoading(false); }
  };

  const rateField = (val, setVal, title) => (
    <input
      type="number"
      value={val}
      min="0"
      title={title}
      onChange={(e) => {
        const v = e.target.value;
        setVal(v === '' ? '' : Math.max(0, Number(v)));
      }}
    />
  );

  const resetForm = () => {
    setFormData({ fullname: '', phone: '', email: '', address: '', booking_date: '', booking_time: '', extra_hours: '0', payment: '0', txn_id: '' });
  };

  return (
    <div className="pf-page">
      <div className="pf-shell">
        <div className="pf-topbar">
          <span className="pf-brandchip"><span className="pf-mark">🏛️</span> Sri Chaitanya Museum · Hall Booking</span>
          <span className="pf-live"><span className="dot" /> Live counter · auto total</span>
        </div>

        <div className="pf-title">
          <h1>🏟️ Hall Booking Form</h1>
          <p>Adjust rates if needed — default tariff applies automatically</p>
        </div>

        <div className="pf-card">
          <div className="pf-card-accent" />
          <div className="pf-card-body">
            <form onSubmit={handleSubmit}>
              {/* EDITABLE TARIFF */}
              <div className="pf-section-head">
                <span className="pf-ico">💰</span>
                <div><h3>Hall Tariff</h3><small>Tap any rate to edit — changes reflect instantly</small></div>
                <span className="pf-tag">✏️ Editable</span>
              </div>

              <div className="pf-rates">
                <div className="pf-rate">
                  <span className="pf-emoji">🧹</span>
                  <small>Service</small>
                  <div className="pf-rate-edit"><span className="cur">₹</span>{rateField(serviceCharge, setServiceCharge, 'Edit service charge')}</div>
                  <span className="pf-rate-hint">flat</span>
                </div>
                <div className="pf-rate">
                  <span className="pf-emoji">🏟️</span>
                  <small>Hall ({bh}h)</small>
                  <div className="pf-rate-edit"><span className="cur">₹</span>{rateField(bookingCharge, setBookingCharge, 'Edit hall booking charge')}</div>
                  <span className="pf-rate-hint">base pack</span>
                </div>
                <div className="pf-rate">
                  <span className="pf-emoji">⏱️</span>
                  <small>Extra /hr</small>
                  <div className="pf-rate-edit"><span className="cur">₹</span>{rateField(extraHourCharge, setExtraHourCharge, 'Edit extra hour charge')}</div>
                  <span className="pf-rate-hint">per hour</span>
                </div>
                <div className="pf-rate">
                  <span className="pf-emoji">🕙</span>
                  <small>Base hrs</small>
                  <div className="pf-rate-edit">{rateField(baseHours, setBaseHours, 'Edit base hours')}<span className="cur">h</span></div>
                  <span className="pf-rate-hint">included</span>
                </div>
              </div>

              {/* PERSONAL */}
              <div className="pf-section-head">
                <span className="pf-ico">👤</span>
                <div><h3>Personal Info</h3><small>Booker contact details</small></div>
              </div>
              <div className="pf-grid">
                <div className="pf-field pf-c6">
                  <label>Full Name <span className="req">*</span></label>
                  <input placeholder="e.g. Rahul Sharma" name="fullname" value={formData.fullname} onChange={handleChange} required />
                </div>
                <div className="pf-field pf-c6">
                  <label>Phone <span className="req">*</span></label>
                  <input placeholder="10-digit mobile number" name="phone" value={formData.phone} onChange={handleChange} required />
                </div>
                <div className="pf-field pf-c6">
                  <label>Email</label>
                  <input placeholder="name@example.com" name="email" value={formData.email} onChange={handleChange} />
                </div>
                <div className="pf-field pf-c6">
                  <label>Address</label>
                  <input placeholder="City / address" name="address" value={formData.address} onChange={handleChange} />
                </div>
              </div>

              {/* BOOKING */}
              <div className="pf-section-head pf-mt">
                <span className="pf-ico">📅</span>
                <div><h3>Booking Details</h3><small>Date, time & extra hours</small></div>
              </div>
              <div className="pf-grid">
                <div className="pf-field pf-c4">
                  <label>Booking Date <span className="req">*</span></label>
                  <input type="date" name="booking_date" value={formData.booking_date} onChange={handleChange} required />
                </div>
                <div className="pf-field pf-c4">
                  <label>Booking Time</label>
                  <input type="time" name="booking_time" value={formData.booking_time} onChange={handleChange} />
                </div>
                <div className="pf-field pf-c4">
                  <label>Extra Hours (₹{ehr}/hr)</label>
                  <input type="number" name="extra_hours" value={formData.extra_hours} onChange={handleChange} min="0" />
                </div>
              </div>

              {/* TOTAL */}
              <div className="pf-total">
                <div className="pf-break">
                  Service <b>₹{svc}</b> + Hall ({bh}h) <b>₹{book}</b> + Extra ({extraHours}h) <b>₹{extraCharge}</b>
                </div>
                <div className="pf-amt">
                  <small>Total · {totalHours} hours</small>
                  <strong><span className="cur">₹</span>{totalAmt}</strong>
                </div>
              </div>

              {/* PAYMENT */}
              <div className="pf-section-head pf-mt">
                <span className="pf-ico">💳</span>
                <div><h3>Payment</h3><small>Collection channel</small></div>
              </div>
              <div className="pf-pay">
                <div className={`pf-pay-opt ${formData.payment === '0' ? 'active' : ''}`} onClick={() => setFormData(p => ({ ...p, payment: '0' }))}>
                  <span className="pf-emoji">💵</span>
                  <div><b>Cash</b><small>Instant confirmation</small></div>
                </div>
                <div className={`pf-pay-opt ${formData.payment === '1' ? 'active' : ''}`} onClick={() => setFormData(p => ({ ...p, payment: '1' }))}>
                  <span className="pf-emoji">⚡</span>
                  <div><b>Online</b><small>Razorpay / UPI</small></div>
                </div>
              </div>
              <div className="pf-grid pf-mt">
                <div className="pf-field pf-c6">
                  <label>Mode</label>
                  <select name="payment" value={formData.payment} onChange={handleChange}>
                    <option value="0">Cash</option>
                    <option value="1">Online</option>
                  </select>
                </div>
                <div className="pf-field pf-c6">
                  <label>Transaction ID</label>
                  <input placeholder="UPI ref / slip no." name="txn_id" value={formData.txn_id} onChange={handleChange} />
                </div>
              </div>

              <button className="pf-submit" disabled={loading}>
                {loading ? 'Processing…' : (<>Confirm Booking <span className="pf-price-pill">₹{totalAmt}</span></>)}
              </button>
            </form>
          </div>
        </div>

        <div className="pf-foot">🌐 chaitanyamuseum.org · 📞 8617528955 · No refunds · Hall tariff subject to management rates</div>
      </div>
    </div>
  );
};

export default Booking;
