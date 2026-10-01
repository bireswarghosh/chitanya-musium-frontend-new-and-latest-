import axios from 'axios';

const API = 'https://chitanya-musium-backend-new-and-latest.onrender.com/api';

// Load permissions for current user's role
export const loadUserPermissions = async () => {
  const roleId = localStorage.getItem('adminRoleId');
  const isSuperAdmin = localStorage.getItem('userRole') === 'superadmin';

  if (isSuperAdmin) {
    localStorage.setItem('permissions', JSON.stringify('SUPER_ADMIN'));
    return;
  }

  if (!roleId) return;

  try {
    const { data } = await axios.get(`${API}/permissions/${roleId}`);
    const permMap = {};
    data.forEach(p => { permMap[p.page_key] = p; });
    localStorage.setItem('permissions', JSON.stringify(permMap));
  } catch (err) {
    console.error('Failed to load permissions', err);
  }
};

// Check permission
export const hasPermission = (pageKey, action = 'can_view') => {
  const stored = localStorage.getItem('permissions');
  if (!stored) return false;
  const perms = JSON.parse(stored);
  if (perms === 'SUPER_ADMIN') return true;
  const pagePerm = perms[pageKey];
  if (!pagePerm) return false;
  return pagePerm[action] === 1;
};

// Hook for components
export const usePermission = (pageKey) => {
  const stored = localStorage.getItem('permissions');
  const perms = stored ? JSON.parse(stored) : null;

  if (!perms) return { canView: false, canAdd: false, canEdit: false, canDelete: false, canDownload: false, canPrint: false };
  if (perms === 'SUPER_ADMIN') return { canView: true, canAdd: true, canEdit: true, canDelete: true, canDownload: true, canPrint: true };

  const p = perms[pageKey] || {};
  return {
    canView: p.can_view === 1,
    canAdd: p.can_add === 1,
    canEdit: p.can_edit === 1,
    canDelete: p.can_delete === 1,
    canDownload: p.can_download === 1,
    canPrint: p.can_print === 1,
  };
};
