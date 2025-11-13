export function isLoggedIn() {
  return !!localStorage.getItem('token');
}

export function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('userName');
  localStorage.removeItem('notificationEnabled');
  window.location.hash = '/login';
}

export function isNotificationEnabled() {
  return localStorage.getItem('notificationEnabled') === 'true';
}

export function setNotificationEnabled(enabled) {
  localStorage.setItem('notificationEnabled', enabled.toString());
}
