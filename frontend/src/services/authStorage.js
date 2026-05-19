const KEYS = {
  access: 'goalsync_access_token',
  refresh: 'goalsync_refresh_token',
  user: 'goalsync_user',
};

export function getAccessToken() {
  return localStorage.getItem(KEYS.access);
}

export function getRefreshToken() {
  return localStorage.getItem(KEYS.refresh);
}

export function getStoredUser() {
  const raw = localStorage.getItem(KEYS.user);
  return raw ? JSON.parse(raw) : null;
}

export function setSession({ accessToken, refreshToken, user }) {
  if (accessToken) localStorage.setItem(KEYS.access, accessToken);
  if (refreshToken) localStorage.setItem(KEYS.refresh, refreshToken);
  if (user) localStorage.setItem(KEYS.user, JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem(KEYS.access);
  localStorage.removeItem(KEYS.refresh);
  localStorage.removeItem(KEYS.user);
  localStorage.removeItem('goalsync_token');
}

export { KEYS };
