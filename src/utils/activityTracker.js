import axios from 'axios';

const API = 'https://chitanya-musium-backend-new-and-latest.onrender.com/api/activity';

let sessionId = localStorage.getItem('sessionId');
if (!sessionId) {
  sessionId = 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  localStorage.setItem('sessionId', sessionId);
}

let geoData = {};

// Get geolocation on load
const fetchGeo = async () => {
  try {
    const res = await fetch('https://ipapi.co/json/');
    const data = await res.json();
    geoData = { city: data.city, region: data.region, country: data.country_name, latitude: data.latitude, longitude: data.longitude, ip: data.ip };
  } catch { }
};
fetchGeo();

// Log an activity
export const logActivity = async (action, page, details = '') => {
  try {
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    await axios.post(`${API}/log`, {
      user_id: userData.user_id || null,
      username: userData.username || localStorage.getItem('username') || 'Guest',
      action, page, details,
      city: geoData.city, region: geoData.region, country: geoData.country,
      latitude: geoData.latitude, longitude: geoData.longitude
    });
  } catch { }
};

// Log page visit session
export const logSession = async (page, timeSpent, clicks = 0) => {
  try {
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    const ua = navigator.userAgent;
    const device = /Mobile|Android|iPhone/i.test(ua) ? 'Mobile' : 'Desktop';
    const browser = ua.includes('Chrome') ? 'Chrome' : ua.includes('Firefox') ? 'Firefox' : ua.includes('Safari') ? 'Safari' : 'Other';

    await axios.post(`${API}/session`, {
      session_id: sessionId,
      user_id: userData.user_id || null,
      username: userData.username || 'Guest',
      page, time_spent: timeSpent, clicks,
      city: geoData.city, country: geoData.country, device, browser
    });
  } catch { }
};

// Actions
export const ACTIONS = {
  PAGE_VIEW: 'page_view',
  LOGIN: 'login',
  LOGOUT: 'logout',
  CREATE: 'create',
  EDIT: 'edit',
  DELETE: 'delete',
  PRINT: 'print',
  DOWNLOAD: 'download',
  SEARCH: 'search',
  PAYMENT: 'payment',
};
