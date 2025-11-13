import { isLoggedIn, logout, isNotificationEnabled } from '../../utils/auth';
import { toggleNotifications } from '../../utils/notification';

export default class AppBar {
  async render() {
    return `
      <div class="container app-bar__inner">
        <a href="#/" class="brand-name">Story App</a>

        <button id="drawer-button" class="drawer-button" aria-label="Buka menu">
          ☰
        </button>

        <nav id="navigation-drawer" class="navigation-drawer">
          <ul class="nav-list">
            <li><a href="#/">Beranda</a></li>
            <li><a href="#/about">Tentang</a></li>
            <li><a href="#/add-story">Tambah Story</a></li>
            <li><a href="#/saved-stories">Story Tersimpan</a></li>
            ${
              isLoggedIn()
                ? `<li><button id="notificationToggle" class="btn-notification">${isNotificationEnabled() ? 'Matikan Notifikasi' : 'Aktifkan Notifikasi'}</button></li>
                   <li><button id="logoutBtn" class="btn-logout">Keluar</button></li>`
                : `<li><a href="#/login">Masuk</a></li>
                   <li><a href="#/register">Daftar</a></li>`
            }
          </ul>
        </nav>
      </div>
    `;
  }

  async afterRender() {

    const notificationToggle = document.querySelector('#notificationToggle');
    if (notificationToggle) {
      notificationToggle.addEventListener('click', async () => {
        const token = localStorage.getItem('token');
        if (!token) {
          alert('Anda harus login untuk mengubah pengaturan notifikasi');
          return;
        }

        const success = await toggleNotifications(token);
        if (success) {
          // Update button text
          notificationToggle.textContent = isNotificationEnabled() ? 'Matikan Notifikasi' : 'Aktifkan Notifikasi';
          alert(isNotificationEnabled() ? 'Notifikasi diaktifkan' : 'Notifikasi dimatikan');
        } else {
          alert('Gagal mengubah pengaturan notifikasi');
        }
      });
    }

    const logoutBtn = document.querySelector('#logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        logout();
        window.location.hash = '/login';
      });
    }

    const drawerButton = document.querySelector('#drawer-button');
    const navigationDrawer = document.querySelector('#navigation-drawer');

    if (drawerButton && navigationDrawer) {
      drawerButton.addEventListener('click', () => {
        navigationDrawer.classList.toggle('open');
      });

      document.body.addEventListener('click', (event) => {
        if (
          !navigationDrawer.contains(event.target) &&
          !drawerButton.contains(event.target)
        ) {
          navigationDrawer.classList.remove('open');
        }

        navigationDrawer.querySelectorAll('a').forEach((link) => {
          if (link.contains(event.target)) {
            navigationDrawer.classList.remove('open');
          }
        });
      });
    }
  }
}
