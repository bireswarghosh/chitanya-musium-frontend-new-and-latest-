import React, { useContext, useState } from "react";
import { Dropdown } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { ThemeContext } from "../../../context/ThemeContext";

const Header = () => {
  const { background, changeBackground } = useContext(ThemeContext);
  const navigate = useNavigate();
  const isDark = background.value === "dark";

  const username = localStorage.getItem('username') || 'Admin';
  const role = localStorage.getItem('userRole') || '';
  const roleLabel = role === 'superadmin' || role === '1' ? 'Super Admin' : 'Admin';

  const [note, setNote] = useState('');
  const [showNote, setShowNote] = useState(false);

  const toggleTheme = () => {
    changeBackground(
      isDark
        ? { value: "light", label: "Light" }
        : { value: "dark", label: "Dark" }
    );
  };

  const onLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userRole');
    navigate('/super-admin-login');
    window.location.reload();
  };

  const dropBg = isDark ? '#1e293b' : '#ffffff';
  const dropBorder = isDark ? '#334155' : '#e2e8f0';
  const dropText = isDark ? '#e2e8f0' : '#1e293b';

  return (
    <div className="header">
      <div className="header-content">
        <nav className="navbar navbar-expand">
          <div className="collapse navbar-collapse justify-content-between">

            <div className="header-left">
              <div className="dashboard_bar" style={{ textTransform: "capitalize", fontWeight: 700, fontSize: "1rem" }}>
                🏛️ Sri Chaitanya Museum
              </div>
            </div>

            <ul className="navbar-nav header-right" style={{ gap: "0.5rem", alignItems: "center" }}>

              {/* Theme Toggle */}
              <li className="nav-item">
                <button
                  onClick={toggleTheme}
                  title={isDark ? "Light mode" : "Dark mode"}
                  style={{
                    background: "none", border: "1.5px solid #e2e8f0",
                    borderRadius: "10px", padding: "6px 10px",
                    cursor: "pointer", fontSize: "1rem",
                    display: "flex", alignItems: "center", gap: "4px",
                    color: "inherit"
                  }}
                >
                  {isDark ? "☀️" : "🌙"}
                </button>
              </li>

              {/* Sticky Note */}
              <li className="nav-item" style={{ position: "relative" }}>
                <button
                  onClick={() => setShowNote(v => !v)}
                  title="Quick Note"
                  style={{
                    background: "none", border: "1.5px solid #e2e8f0",
                    borderRadius: "10px", padding: "6px 10px",
                    cursor: "pointer", fontSize: "1rem",
                    display: "flex", alignItems: "center",
                    color: "inherit"
                  }}
                >
                  📝
                </button>
                {showNote && (
                  <div style={{
                    position: "absolute", top: "calc(100% + 8px)", right: 0,
                    width: 240, background: "#fef9c3", borderRadius: 12,
                    boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                    border: "1px solid #fde68a", zIndex: 9999, padding: "10px"
                  }}>
                    <div style={{ fontSize: "11px", fontWeight: 700, color: "#92400e", marginBottom: 6 }}>📝 Quick Note</div>
                    <textarea
                      value={note}
                      onChange={e => setNote(e.target.value)}
                      placeholder="Type a quick note..."
                      style={{
                        width: "100%", minHeight: 80, border: "none",
                        background: "transparent", resize: "vertical",
                        fontSize: "12px", color: "#1e293b", outline: "none",
                        fontFamily: "inherit"
                      }}
                    />
                    <div style={{ textAlign: "right" }}>
                      <button onClick={() => setShowNote(false)} style={{ fontSize: "11px", background: "none", border: "none", cursor: "pointer", color: "#92400e", fontWeight: 700 }}>Close ✕</button>
                    </div>
                  </div>
                )}
              </li>

              {/* User Dropdown */}
              <Dropdown as="li" className="nav-item dropdown header-profile">
                <Dropdown.Toggle variant="" as="a" className="nav-link i-false c-pointer"
                  style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: "10px",
                    background: "linear-gradient(135deg,#0284c7,#00c2fe)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#fff", fontWeight: 800, fontSize: "0.9rem"
                  }}>
                    {username.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ lineHeight: 1.2 }}>
                    <div style={{ fontWeight: 700, fontSize: "0.82rem" }}>{username}</div>
                    <div style={{ fontSize: "0.68rem", opacity: 0.6 }}>{roleLabel}</div>
                  </div>
                </Dropdown.Toggle>

                <Dropdown.Menu align="end" className="mt-0 dropdown-menu dropdown-menu-end"
                  style={{ minWidth: 180, borderRadius: 14, border: `1px solid ${dropBorder}`, boxShadow: "0 12px 30px rgba(0,0,0,0.12)", background: dropBg }}>

                  {/* Profile info header */}
                  <div style={{ padding: "12px 16px", borderBottom: `1px solid ${dropBorder}` }}>
                    <div style={{ fontWeight: 700, fontSize: "0.85rem", color: dropText }}>{username}</div>
                    <div style={{ fontSize: "0.72rem", color: "#64748b" }}>{roleLabel}</div>
                  </div>

                  {/* Profile link */}
                  <button className="dropdown-item" onClick={() => navigate('/app-profile')}
                    style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", color: dropText, background: "none", border: "none", width: "100%", textAlign: "left", fontSize: "0.85rem" }}>
                    <span>👤</span> Profile
                  </button>

                  <div style={{ height: 1, background: dropBorder, margin: "4px 0" }} />

                  {/* Logout */}
                  <button className="dropdown-item" onClick={onLogout}
                    style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", color: "#dc2626", background: "none", border: "none", width: "100%", textAlign: "left", fontSize: "0.85rem", fontWeight: 600 }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1={21} y1={12} x2={9} y2={12} />
                    </svg>
                    Logout
                  </button>
                </Dropdown.Menu>
              </Dropdown>

            </ul>
          </div>
        </nav>
      </div>
    </div>
  );
};

export default Header;
