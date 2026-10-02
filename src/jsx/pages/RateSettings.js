import React, { useState, useEffect, useContext } from 'react';
import swal from 'sweetalert';
import { ThemeContext } from '../../context/ThemeContext';
import { rateSettingsService, DEFAULT_RATES } from '../../services/RateSettingsService';

const RateSettings = () => {
  const { background } = useContext(ThemeContext);
  const dk = background.value === 'dark';

  const cardBg   = dk ? '#1e293b' : '#ffffff';
  const panelBg  = dk ? '#0f172a' : '#F8FAFC';
  const border   = dk ? '#334155' : '#E2E8F0';
  const text     = dk ? '#e2e8f0' : '#0F172A';
  const muted    = dk ? '#94a3b8' : '#64748B';
  const heading  = dk ? '#e2e8f0' : '#1E3A8A';
  const inputBg  = dk ? '#0f172a' : '#ffffff';
  const inputBdr = dk ? '#475569' : '#CBD5E1';
  const chipBg   = dk ? '#1e3a5f' : '#EFF6FF';
  const chipClr  = dk ? '#93c5fd' : '#1D4ED8';
  const chipBdr  = dk ? '#1d4ed8' : '#BFDBFE';

  const [rates, setRates] = useState(rateSettingsService.getCachedRates());
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRates = async () => {
      setLoading(true);
      const data = await rateSettingsService.fetchRates();
      setRates(data);
      setLoading(false);
    };
    loadRates();
  }, []);

  const handleChange = (field, value) => {
    setRates(prev => ({
      ...prev,
      [field]: value === '' ? '' : Math.max(0, Number(value))
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await rateSettingsService.saveRates(rates);
      swal("Success!", "Default rates have been updated successfully! Public forms will now reflect these rates.", "success");
    } catch {
      swal("Error!", "Could not save rates. Please try again.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    swal({
      title: "Reset to System Defaults?",
      text: "This will revert rates to ₹50 entry, ₹30 movie, ₹6600 base hall charge, 3 hours, and ₹2200 extra hour charge.",
      icon: "warning",
      buttons: ["Cancel", "Yes, Reset"],
      dangerMode: true,
    }).then(async (willReset) => {
      if (willReset) {
        setRates({ ...DEFAULT_RATES });
        await rateSettingsService.saveRates(DEFAULT_RATES);
        swal("Reset Complete!", "Rates have been reset to factory defaults.", "success");
      }
    });
  };

  const inpStyle = {
    background: inputBg,
    color: text,
    borderColor: inputBdr,
    borderRadius: '10px',
    fontWeight: '700',
    fontSize: '15px'
  };

  return (
    <div style={{ color: text, fontFamily: "'Outfit','Inter',sans-serif", maxWidth: '1000px', margin: '0 auto' }}>
      
      {/* Top Header */}
      <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-4">
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: chipBg, color: chipClr, border: `1px solid ${chipBdr}`, padding: '4px 14px', borderRadius: '50px', fontSize: '12px', fontWeight: '700', marginBottom: '8px' }}>
            ⚙️ SYSTEM CONFIGURATION
          </div>
          <h3 style={{ fontWeight: '900', color: heading, margin: 0 }}>Rate & Tariff Settings</h3>
          <p style={{ color: muted, margin: '4px 0 0', fontSize: '13px' }}>
            Configure default ticket rates and hall tariff for public visitor forms & POS counter.
          </p>
        </div>

        <div className="d-flex gap-2">
          <button 
            type="button" 
            onClick={handleReset} 
            className="btn btn-sm btn-outline-secondary"
            style={{ borderRadius: '10px', fontWeight: '600' }}
          >
            🔄 Reset Defaults
          </button>
        </div>
      </div>

      {/* Info Banner */}
      <div style={{ background: panelBg, border: `1px solid ${border}`, borderRadius: '14px', padding: '14px 18px', marginBottom: '24px' }}>
        <div className="d-flex align-items-center gap-3">
          <div style={{ fontSize: '1.6rem' }}>ℹ️</div>
          <div style={{ fontSize: '12.5px', color: muted, lineHeight: '1.5' }}>
            <strong style={{ color: text }}>How rate protection works:</strong>
            <br />
            • <strong style={{ color: '#059669' }}>Public / Guest Mode:</strong> Visitors on the public website cannot edit these rates. The fields are locked and default rates apply automatically.
            <br />
            • <strong style={{ color: '#0284c7' }}>Admin / Counter Mode:</strong> When logged in, authorized staff can optionally adjust rates per entry if special discounts or override pricing are needed.
          </div>
        </div>
      </div>

      <form onSubmit={handleSave}>
        <div className="row g-4">
          
          {/* SECTION 1: Museum Entry & Movie Show Rates */}
          <div className="col-lg-6">
            <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: '16px', padding: '20px', height: '100%', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
              <div className="d-flex align-items-center gap-2 mb-3">
                <span style={{ fontSize: '1.4rem' }}>🏛️</span>
                <div>
                  <h5 style={{ fontWeight: '800', margin: 0, color: text }}>Museum Ticket Rates</h5>
                  <small style={{ color: muted, fontSize: '11.5px' }}>Applies to public entry form & counter billing</small>
                </div>
              </div>

              {/* Gallery Pass Rate */}
              <div className="mb-3 p-3" style={{ background: panelBg, borderRadius: '12px', border: `1px solid ${border}` }}>
                <label className="d-block mb-1" style={{ fontSize: '12px', fontWeight: '700', color: text }}>
                  Museum Entry (Gallery Pass)
                </label>
                <div style={{ fontSize: '11px', color: muted, marginBottom: '8px' }}>
                  Standard rate per person for museum tour galleries
                </div>
                <div className="input-group">
                  <span className="input-group-text fw-bold text-primary" style={{ background: inputBg, borderColor: inputBdr, color: '#0284c7' }}>₹</span>
                  <input
                    type="number"
                    min="0"
                    className="form-control"
                    style={inpStyle}
                    value={rates.museum_gallery_rate}
                    onChange={(e) => handleChange('museum_gallery_rate', e.target.value)}
                    required
                  />
                  <span className="input-group-text" style={{ background: inputBg, borderColor: inputBdr, color: muted, fontSize: '12px' }}>/ person</span>
                </div>
              </div>

              {/* Movie Show Rate */}
              <div className="p-3" style={{ background: panelBg, borderRadius: '12px', border: `1px solid ${border}` }}>
                <label className="d-block mb-1" style={{ fontSize: '12px', fontWeight: '700', color: text }}>
                  Movie / AV Show Ticket
                </label>
                <div style={{ fontSize: '11px', color: muted, marginBottom: '8px' }}>
                  Standard rate per person for 3D Audio-Visual documentary show
                </div>
                <div className="input-group">
                  <span className="input-group-text fw-bold text-success" style={{ background: inputBg, borderColor: inputBdr, color: '#059669' }}>₹</span>
                  <input
                    type="number"
                    min="0"
                    className="form-control"
                    style={inpStyle}
                    value={rates.museum_movie_rate}
                    onChange={(e) => handleChange('museum_movie_rate', e.target.value)}
                    required
                  />
                  <span className="input-group-text" style={{ background: inputBg, borderColor: inputBdr, color: muted, fontSize: '12px' }}>/ ticket</span>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: Hall Booking Tariff */}
          <div className="col-lg-6">
            <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: '16px', padding: '20px', height: '100%', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
              <div className="d-flex align-items-center gap-2 mb-3">
                <span style={{ fontSize: '1.4rem' }}>🏟️</span>
                <div>
                  <h5 style={{ fontWeight: '800', margin: 0, color: text }}>Hall Booking Tariff</h5>
                  <small style={{ color: muted, fontSize: '11.5px' }}>Auditorium & convention hall booking charges</small>
                </div>
              </div>

              {/* Base Hall Charge */}
              <div className="mb-3 p-3" style={{ background: panelBg, borderRadius: '12px', border: `1px solid ${border}` }}>
                <label className="d-block mb-1" style={{ fontSize: '12px', fontWeight: '700', color: text }}>
                  Base Hall Charge
                </label>
                <div style={{ fontSize: '11px', color: muted, marginBottom: '8px' }}>
                  Standard booking fee for base session duration
                </div>
                <div className="input-group">
                  <span className="input-group-text fw-bold text-primary" style={{ background: inputBg, borderColor: inputBdr, color: '#0284c7' }}>₹</span>
                  <input
                    type="number"
                    min="0"
                    className="form-control"
                    style={inpStyle}
                    value={rates.hall_charge}
                    onChange={(e) => handleChange('hall_charge', e.target.value)}
                    required
                  />
                  <span className="input-group-text" style={{ background: inputBg, borderColor: inputBdr, color: muted, fontSize: '12px' }}>base pack</span>
                </div>
              </div>

              {/* Base Hours */}
              <div className="mb-3 p-3" style={{ background: panelBg, borderRadius: '12px', border: `1px solid ${border}` }}>
                <label className="d-block mb-1" style={{ fontSize: '12px', fontWeight: '700', color: text }}>
                  Base Duration (Included Hours)
                </label>
                <div style={{ fontSize: '11px', color: muted, marginBottom: '8px' }}>
                  Number of hours included in the base package
                </div>
                <div className="input-group">
                  <span className="input-group-text fw-bold" style={{ background: inputBg, borderColor: inputBdr, color: muted }}>⏱️</span>
                  <input
                    type="number"
                    min="1"
                    className="form-control"
                    style={inpStyle}
                    value={rates.base_hours}
                    onChange={(e) => handleChange('base_hours', e.target.value)}
                    required
                  />
                  <span className="input-group-text" style={{ background: inputBg, borderColor: inputBdr, color: muted, fontSize: '12px' }}>hours</span>
                </div>
              </div>

              {/* Extra Hour Rate */}
              <div className="p-3" style={{ background: panelBg, borderRadius: '12px', border: `1px solid ${border}` }}>
                <label className="d-block mb-1" style={{ fontSize: '12px', fontWeight: '700', color: text }}>
                  Extra Hour Rate
                </label>
                <div style={{ fontSize: '11px', color: muted, marginBottom: '8px' }}>
                  Per hour surcharge beyond the base duration
                </div>
                <div className="input-group">
                  <span className="input-group-text fw-bold text-warning" style={{ background: inputBg, borderColor: inputBdr, color: '#d97706' }}>₹</span>
                  <input
                    type="number"
                    min="0"
                    className="form-control"
                    style={inpStyle}
                    value={rates.extra_hour_charge}
                    onChange={(e) => handleChange('extra_hour_charge', e.target.value)}
                    required
                  />
                  <span className="input-group-text" style={{ background: inputBg, borderColor: inputBdr, color: muted, fontSize: '12px' }}>/ hour</span>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="mt-4 p-3 d-flex align-items-center justify-content-between flex-wrap gap-3" style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: '16px' }}>
          <div>
            <div style={{ fontWeight: '700', fontSize: '13px', color: text }}>
              Ready to publish updated rates?
            </div>
            <div style={{ fontSize: '11.5px', color: muted }}>
              Clicking save will instantly update both public visitor forms and counter POS.
            </div>
          </div>

          <button
            type="submit"
            disabled={saving || loading}
            className="btn btn-primary px-4 py-2"
            style={{ borderRadius: '10px', fontWeight: '700', fontSize: '14px', minWidth: '160px' }}
          >
            {saving ? '⏳ Saving...' : '💾 Save Rate Settings'}
          </button>
        </div>
      </form>

    </div>
  );
};

export default RateSettings;

