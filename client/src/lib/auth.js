export function getUser() { try { return JSON.parse(localStorage.getItem('user') || 'null'); } catch { return null; } }
export function saveAuth(data) { localStorage.setItem('token', data.token); localStorage.setItem('user', JSON.stringify(data.user)); }
export function clearAuth() { localStorage.removeItem('token'); localStorage.removeItem('user'); }
