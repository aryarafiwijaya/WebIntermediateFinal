// CSS imports
import '../styles/styles.css';
import App from './pages/app';
import { registerServiceWorker } from './utils/notification';

document.addEventListener('DOMContentLoaded', async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('✅ Service Worker registered from /public/sw.js:', registration);
    } catch (err) {
      console.error('❌ Service Worker registration failed:', err);
    }
  }

  const app = new App({
    content: document.querySelector('#main-content'),
    drawerButton: document.querySelector('#drawer-button'),
    navigationDrawer: document.querySelector('#navigation-drawer'),
  });

  await app.renderPage();

  window.addEventListener('hashchange', async () => {
    await app.renderPage();
  });

  let deferredPrompt;
  const installBtn = document.querySelector('#installButton');

  window.addEventListener('beforeinstallprompt', (e) => {
    console.log('beforeinstallprompt event fired ✅');
    e.preventDefault();
    deferredPrompt = e;

    if (installBtn) installBtn.style.display = 'block';

    installBtn?.addEventListener('click', async () => {
      installBtn.style.display = 'none';
      deferredPrompt.prompt();

      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        console.log('✅ User accepted the install prompt');
      } else {
        console.log('❌ User dismissed the install prompt');
      }
      deferredPrompt = null;
    });
  });

  window.addEventListener('appinstalled', () => {
    console.log('📱 Aplikasi telah diinstal!');
    if (installBtn) installBtn.style.display = 'none';
  });
});
