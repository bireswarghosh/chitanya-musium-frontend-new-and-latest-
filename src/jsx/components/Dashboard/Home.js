import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../../../css/dashboard-premium.css';

const MUSEUM_API = 'https://chitanya-musium-backend-new-and-latest.onrender.com/api/museum';
const BOOKING_API = 'https://chitanya-musium-backend-new-and-latest.onrender.com/api/booking';
const CAMPING_API = 'https://chitanya-musium-backend-new-and-latest.onrender.com/api/camping';

const dayKey = (d) => {
  const dt = d instanceof Date ? d : new Date(d);
  return Number.isNaN(dt.getTime()) ? '' : dt.toISOString().split('T')[0];
};
const todayKey = () => new Date().toISOString().split('T')[0];
const inr = (n) => `₹${Number(n) || 0}`;

const Home = () => {
  const [entries, setEntries] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  const username = localStorage.getItem('username') || 'Counter';

  // Read-only stats from existing list endpoints — no logic touched
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [m, b, l] = await Promise.allSettled([
          axios.get(MUSEUM_API),
          axios.get(BOOKING_API),
          axios.get(`${CAMPING_API}/leads`),
        ]);
        if (!alive) return;
        if (m.status === 'fulfilled' && Array.isArray(m.value.data)) setEntries(m.value.data);
        if (b.status === 'fulfilled' && Array.isArray(b.value.data)) setBookings(b.value.data);
        if (l.status === 'fulfilled' && Array.isArray(l.value.data)) setLeads(l.value.data);
      } catch { /* dashboard stays usable offline */ } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const stats = useMemo(() => {
    const tk = todayKey();
    const todayEntries = entries.filter(e => dayKey(e.date) === tk);
    const visitors = todayEntries.reduce((s, e) => s + (Number(e.num_of_persons) || 0), 0);
    const revenue = todayEntries.reduce((s, e) => s + (Number(e.total_amt) || 0), 0);
    const upcoming = bookings.filter(b => (b.booking_date || '').split('T')[0] >= tk).length;
    return { visitors, revenue, upcoming, leads: leads.length, totalEntries: entries.length };
  }, [entries, bookings, leads]);

  const week = useMemo(() => {
    const out = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const k = dayKey(d);
      const count = entries
        .filter(e => dayKey(e.date) === k)
        .reduce((s, e) => s + (Number(e.num_of_persons) || 0), 0);
      out.push({
        key: k,
        label: d.toLocaleDateString('en-IN', { weekday: 'short' }),
        count,
        today: i === 0,
      });
    }
    return out;
  }, [entries]);

  const maxBar = Math.max(1, ...week.map(w => w.count));

  const recentEntries = useMemo(
    () => [...entries].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5),
    [entries]
  );

  const upcomingBookings = useMemo(() => {
    const tk = todayKey();
    return [...bookings]
      .filter(b => (b.booking_date || '').split('T')[0] >= tk)
      .sort((a, b) => new Date(a.booking_date) - new Date(b.booking_date))
      .slice(0, 5);
  }, [bookings]);

  const hour = new Date().getHours();
  const greet = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const dateStr = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div className="db-wrap">
      {/* HEADER */}
      <div className="db-head">
        <div>
          <h1><span className="wave">👋</span> {greet}, {username}!</h1>
          <p>📅 {dateStr} · Here's today's museum pulse</p>
        </div>
        <div className="db-head-actions">
          <Link className="db-btn primary" to="/museum-entry">＋ New Entry</Link>
          <Link className="db-btn" to="/booking">🏟️ New Booking</Link>
        </div>
      </div>

      {/* STATS */}
      <div className="db-stats">
        <Link className={`db-stat db-s1 ${loading ? 'loading' : ''}`} to="/museum-entries">
          <span className="db-emoji">🎟️</span>
          <span className="db-num">{loading ? '…' : stats.visitors}</span>
          <span className="db-lbl">Visitors today</span>
          <span className="db-sub">{stats.totalEntries} total entries →</span>
        </Link>
        <Link className={`db-stat db-s2 ${loading ? 'loading' : ''}`} to="/museum-entries">
          <span className="db-emoji">💰</span>
          <span className="db-num">{loading ? '…' : inr(stats.revenue)}</span>
          <span className="db-lbl">Collected today</span>
          <span className="db-sub">museum counter →</span>
        </Link>
        <Link className={`db-stat db-s3 ${loading ? 'loading' : ''}`} to="/booking-list">
          <span className="db-emoji">🏟️</span>
          <span className="db-num">{loading ? '…' : stats.upcoming}</span>
          <span className="db-lbl">Upcoming hall bookings</span>
          <span className="db-sub">{bookings.length} total bookings →</span>
        </Link>
        <Link className={`db-stat db-s4 ${loading ? 'loading' : ''}`} to="/camping-management">
          <span className="db-emoji">🏕️</span>
          <span className="db-num">{loading ? '…' : stats.leads}</span>
          <span className="db-lbl">Camp registrations</span>
          <span className="db-sub">manage camps →</span>
        </Link>
      </div>

      {/* CHART + LISTS */}
      <div className="db-grid">
        <div className="db-card">
          <div className="db-card-head">
            <div><h3>📊 7-day visitor flow</h3><small>Persons per day · museum counter</small></div>
            <Link className="db-link" to="/museum-entries">View all →</Link>
          </div>
          <div className="db-bars">
            {week.map(w => (
              <div className={`db-bar-col ${w.today ? 'today' : ''}`} key={w.key}>
                <span className="db-bar-val">{w.count}</span>
                <div className="db-bar" style={{ height: `${Math.max(4, (w.count / maxBar) * 100)}%` }} />
                <span className="db-bar-day">{w.label}</span>
              </div>
            ))}
          </div>
          <div className="db-legend">
            <span><i style={{ background: '#0284c7' }} /> Visitors</span>
            <span><i style={{ background: '#ea580c' }} /> Today</span>
          </div>
        </div>

        <div className="db-card">
          <div className="db-card-head">
            <div><h3>🕒 Recent entries</h3><small>Latest museum passes</small></div>
            <Link className="db-link" to="/museum-entries">All →</Link>
          </div>
          <div className="db-list">
            {recentEntries.length === 0 && (
              <div className="db-empty"><span className="big">🎫</span>{loading ? 'Loading…' : 'No entries yet today'}</div>
            )}
            {recentEntries.map((e, i) => (
              <Link className="db-row" to="/museum-entries" key={e.id || i}>
                <span className={`db-avatar ${['', 'violet', 'green', 'orange'][i % 4]}`}>👤</span>
                <span className="db-row-main">
                  <b>{e.firstname || e.fullname || 'Visitor'}</b>
                  <small>{e.num_of_persons || 1} person(s) · {dayKey(e.date)}</small>
                </span>
                <span className="db-row-right">
                  <b>{inr(e.total_amt)}</b>
                  <span className={`db-pill ${e.payment === '1' ? 'online' : 'cash'}`}>{e.payment === '1' ? 'Online' : 'Cash'}</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="db-grid">
        <div className="db-card">
          <div className="db-card-head">
            <div><h3>🏟️ Upcoming hall bookings</h3><small>Next on the calendar</small></div>
            <Link className="db-link" to="/booking-list">All →</Link>
          </div>
          <div className="db-list">
            {upcomingBookings.length === 0 && (
              <div className="db-empty"><span className="big">📅</span>{loading ? 'Loading…' : 'No upcoming bookings'}</div>
            )}
            {upcomingBookings.map((b, i) => (
              <Link className="db-row" to="/booking-list" key={b.id || i}>
                <span className={`db-avatar ${['violet', 'green', 'orange', ''][i % 4]}`}>🏟️</span>
                <span className="db-row-main">
                  <b>{b.fullname || 'Booking'}</b>
                  <small>📅 {(b.booking_date || '').split('T')[0]} {b.booking_time || ''} · {b.hours || 3}h</small>
                </span>
                <span className="db-row-right">
                  <b>{inr(b.total_amt)}</b>
                  <span className={`db-pill ${b.payment === '1' ? 'online' : 'cash'}`}>{b.payment === '1' ? 'Online' : 'Cash'}</span>
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* QUICK ACTIONS */}
        <div className="db-quick">
          <Link className="db-action" to="/museum-entry">
            <span className="db-emoji">🎟️</span>
            <div><b>Museum Entry</b><small>New visitor pass</small></div>
          </Link>
          <Link className="db-action" to="/booking">
            <span className="db-emoji">📋</span>
            <div><b>Hall Booking</b><small>Reserve the hall</small></div>
          </Link>
          <Link className="db-action" to="/camping-management">
            <span className="db-emoji">🏕️</span>
            <div><b>Camps</b><small>Events & leads</small></div>
          </Link>
          <Link className="db-action" to="/data-entry">
            <span className="db-emoji">📝</span>
            <div><b>Data Entry</b><small>Back-office records</small></div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
