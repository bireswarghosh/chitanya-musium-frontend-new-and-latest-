import axios from 'axios';

const isLocal = typeof window !== 'undefined' && 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

const API_BASE_URL = isLocal 
  ? 'http://localhost:3003/api'
  : 'https://chitanya-musium-backend-new-and-latest.onrender.com/api';

const STORAGE_KEY = 'scmm_default_rates';

export const DEFAULT_RATES = {
  museum_gallery_rate: 50,
  museum_movie_rate: 30,
  hall_charge: 6600,
  extra_hour_charge: 2200,
  base_hours: 3
};

export const rateSettingsService = {
  // Synchronous read from cache for instantaneous rendering
  getCachedRates: () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          museum_gallery_rate: Number(parsed.museum_gallery_rate) || DEFAULT_RATES.museum_gallery_rate,
          museum_movie_rate: Number(parsed.museum_movie_rate) || DEFAULT_RATES.museum_movie_rate,
          hall_charge: Number(parsed.hall_charge) || DEFAULT_RATES.hall_charge,
          extra_hour_charge: Number(parsed.extra_hour_charge) || DEFAULT_RATES.extra_hour_charge,
          base_hours: Number(parsed.base_hours) || DEFAULT_RATES.base_hours
        };
      }
    } catch (e) {
      console.warn('Error reading cached rates', e);
    }
    return { ...DEFAULT_RATES };
  },

  // Asynchronous fetch from API and cache update
  fetchRates: async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/settings/rates`, { timeout: 4000 });
      if (res.data) {
        const rates = {
          museum_gallery_rate: Number(res.data.museum_gallery_rate) || DEFAULT_RATES.museum_gallery_rate,
          museum_movie_rate: Number(res.data.museum_movie_rate) || DEFAULT_RATES.museum_movie_rate,
          hall_charge: Number(res.data.hall_charge) || DEFAULT_RATES.hall_charge,
          extra_hour_charge: Number(res.data.extra_hour_charge) || DEFAULT_RATES.extra_hour_charge,
          base_hours: Number(res.data.base_hours) || DEFAULT_RATES.base_hours
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(rates));
        return rates;
      }
    } catch (err) {
      // If API call fails (e.g. Render asleep or offline), fallback to cached
      console.warn('Could not fetch rates from API, using cached or default', err?.message);
    }
    return rateSettingsService.getCachedRates();
  },

  // Save rates to API and cache
  saveRates: async (rates) => {
    const payload = {
      museum_gallery_rate: Number(rates.museum_gallery_rate) >= 0 ? Number(rates.museum_gallery_rate) : DEFAULT_RATES.museum_gallery_rate,
      museum_movie_rate: Number(rates.museum_movie_rate) >= 0 ? Number(rates.museum_movie_rate) : DEFAULT_RATES.museum_movie_rate,
      hall_charge: Number(rates.hall_charge) >= 0 ? Number(rates.hall_charge) : DEFAULT_RATES.hall_charge,
      extra_hour_charge: Number(rates.extra_hour_charge) >= 0 ? Number(rates.extra_hour_charge) : DEFAULT_RATES.extra_hour_charge,
      base_hours: Number(rates.base_hours) >= 1 ? Math.floor(Number(rates.base_hours)) : DEFAULT_RATES.base_hours
    };

    // Save to local cache immediately
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));

    // Also persist to API
    try {
      await axios.post(`${API_BASE_URL}/settings/rates`, payload, { timeout: 8000 });
    } catch (err) {
      console.warn('API save error, cached locally', err?.message);
    }

    // Trigger local storage event for any open tabs
    window.dispatchEvent(new Event('scmm_rates_updated'));
    return payload;
  }
};

