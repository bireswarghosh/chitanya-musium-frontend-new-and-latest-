import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { loadUserPermissions } from '../../utils/permissions';
import AuthLayout from './AuthLayout';

function SuperAdminLogin() {
  // Same login logic as before — design only changed
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState({ username: '', password: '' });

  const navigate = useNavigate();

  const onLogin = async (e) => {
    e.preventDefault();

    let error = false;
    const errorObj = { username: '', password: '' };

    if (!username) {
      errorObj.username = 'Username is Required';
      error = true;
    }

    if (!password) {
      errorObj.password = 'Password is Required';
      error = true;
    }

    setErrors(errorObj);
    if (error) return;

    setBusy(true);
    try {
      const res = await axios.post(
        'https://chitanya-musium-backend-new-and-latest.onrender.com/api/auth/login',
        { username, password }
      );

      const user = res.data.user;

      // SUPER ADMIN CHECK
      if (user.admin_role_id !== 1) {
        setBusy(false);
        return setErrors({
          username: 'Not a Super Admin',
          password: ''
        });
      }

      // STORE DATA
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userRole', 'superadmin');
      localStorage.setItem('adminRoleId', user.admin_role_id);
      localStorage.setItem('username', user.username);
      localStorage.setItem('userData', JSON.stringify(user));

      await loadUserPermissions();

      // REDIRECT
      navigate('/museum-entries');
    } catch (err) {
      setErrors({
        username: err.response?.data?.error || 'Login failed',
        password: ''
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthLayout
      variant="super"
      roleBadge="👑 Super Admin"
      title="Command center"
      subtitle="Full museum control — admins, roles, access & activity."
      heroTitle="Total <em>control</em>,<br/>zero chaos."
      heroText="Manage admins, roles, permissions and watch every counter activity live — the museum's mission control."
      stats={[
        { value: '👥', label: 'Admins & roles' },
        { value: '🔐', label: 'Access control' },
        { value: '📡', label: 'Live monitoring' },
      ]}
      altLink={{ text: 'Staff member?', to: '/admin-login', label: 'Staff Login' }}
    >
      <form onSubmit={onLogin}>
        <div className="ap-field">
          <label htmlFor="ap-username">Username</label>
          <div className="ap-input-group">
            <span className="ap-input-icon">👑</span>
            <input
              id="ap-username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Super admin username"
              autoComplete="username"
            />
          </div>
          {errors.username && <div className="ap-error">⚠️ {errors.username}</div>}
        </div>

        <div className="ap-field">
          <label htmlFor="ap-password">Password</label>
          <div className="ap-input-group">
            <span className="ap-input-icon">🔑</span>
            <input
              id="ap-password"
              type={showPass ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              autoComplete="current-password"
            />
            <button
              type="button"
              className="ap-eye"
              onClick={() => setShowPass(s => !s)}
              title={showPass ? 'Hide password' : 'Show password'}
            >
              {showPass ? '🙈' : '👁️'}
            </button>
          </div>
          {errors.password && <div className="ap-error">⚠️ {errors.password}</div>}
        </div>

        <button type="submit" className="ap-submit" disabled={busy}>
          {busy ? (<><span className="ap-spinner" /> Verifying…</>) : (<>Enter Command Center →</>)}
        </button>
      </form>
    </AuthLayout>
  );
}

export default SuperAdminLogin;
