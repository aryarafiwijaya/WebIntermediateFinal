export function requireAuth() {
  const token = localStorage.getItem('token');

  if (!token) {
    alert('Anda harus login untuk mengakses halaman ini.');
    window.location.hash = '/login';
    return false;
  }

  return true;
}
