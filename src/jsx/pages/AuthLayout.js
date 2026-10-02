import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '../../css/auth-premium.css';

/* Shared premium auth shell — logic-free, design only.
   variant: 'admin' (blue) | 'super' (crimson) */
function AuthLayout({
  variant = 'admin',
  roleBadge,
  title,
  subtitle,
  heroTitle,
  heroText,
  stats,
  children,
  altLink,
}) {
  const [dark, setDark] = useState(() => {
    try {
      const saved = localStorage.getItem('chaitanya-theme');
      if (saved) return saved === 'dark';
      return document.body.getAttribute('data-theme-version') === 'dark';
    } catch { return false; }
  });

  useEffect(() => {
    try {
      localStorage.setItem('chaitanya-theme', dark ? 'dark' : 'light');
      document.body.setAttribute('data-theme-version', dark ? 'dark' : 'light');
    } catch { /* ignore */ }
  }, [dark]);

  const isSuper = variant === 'super';

  return (
    <div className={`auth-premium ${dark ? 'ap-dark' : ''} ${isSuper ? 'ap-crimson' : ''}`}>
      {/* LEFT — brand */}
      <div className="ap-brand">
        <div className="ap-brand-glow" style={{ top: '-120px', right: '-120px', background: isSuper ? '#fb7185' : '#00f2fe' }} />
        <div className="ap-brand-top">
          <div className="ap-logo-mark">🏛️</div>
          <div className="ap-brand-name">
            <strong>Sri Chaitanya Mahaprabhu</strong>
            <span>Museum · Bagbazar, Kolkata</span>
          </div>
        </div>

        <div className="ap-brand-hero">
          <div className="ap-pill"><span className="ap-pulse" /> {isSuper ? 'Super Admin Console' : 'Staff Operations Console'}</div>
          <h1 dangerouslySetInnerHTML={{ __html: heroTitle }} />
          <p>{heroText}</p>
          {stats && stats.length > 0 && (
            <div className="ap-stats">
              {stats.map((s, i) => (
                <div className="ap-stat" key={i}><b>{s.value}</b><span>{s.label}</span></div>
              ))}
            </div>
          )}
        </div>

        <div className="ap-brand-foot">
          <span>🌐 chaitanyamuseum.org &nbsp;·&nbsp; 📞 8617528955</span>
          <span className="ap-open-hours">🕙 Open 10am–12pm & 3pm–7pm · Mon closed</span>
        </div>
      </div>

      {/* RIGHT — form */}
      <div className="ap-form-wrap">
        <button
          type="button"
          className="ap-theme-btn"
          onClick={() => setDark(d => !d)}
          title={dark ? 'Light mode' : 'Dark mode'}
          aria-label="Toggle theme"
        >
          {dark ? '☀️' : '🌙'}
        </button>

        <div className="ap-card">
          <div className="ap-card-accent" />
          <span className="ap-role-badge">{roleBadge}</span>
          <h2>{title}</h2>
          <p className="ap-sub">{subtitle}</p>

          {children}

          {altLink && (
            <div className="ap-alt-link">
              {altLink.text} <Link to={altLink.to}>{altLink.label}</Link>
            </div>
          )}

          <div className="ap-public-links">
            <Link to="/museum-entry">🎟️ Museum Entry</Link>
            <Link to="/booking">📋 Hall Booking</Link>
            <Link to="/camping-entry">🏕️ Camp Join</Link>
          </div>

          <div className="ap-secure">🔒 Secured counter session · Sri Chaitanya Museum</div>
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;
