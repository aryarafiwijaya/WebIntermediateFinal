import routes from '../routes/routes';
import { getActiveRoute } from '../routes/url-parser';
import { isLoggedIn } from '../utils/auth';
import AppBar from '../views/components/app-bar';

class App {
  #content = null;
  #drawerButton = null;
  #navigationDrawer = null;
  #appBar = null;

  constructor({ navigationDrawer, drawerButton, content }) {
    this.#content = content;
    this.#drawerButton = drawerButton;
    this.#navigationDrawer = navigationDrawer;
    this.#appBar = new AppBar();

    this.#setupDrawer();
  }

  #setupDrawer() {
    if (!this.#drawerButton || !this.#navigationDrawer) return;

    this.#drawerButton.addEventListener('click', () => {
      this.#navigationDrawer.classList.toggle('open');
    });

    document.body.addEventListener('click', (event) => {
      if (
        !this.#navigationDrawer.contains(event.target) &&
        !this.#drawerButton.contains(event.target)
      ) {
        this.#navigationDrawer.classList.remove('open');
      }

      this.#navigationDrawer.querySelectorAll('a').forEach((link) => {
        if (link.contains(event.target)) {
          this.#navigationDrawer.classList.remove('open');
        }
      });
    });
  }

  async renderPage() {
    try {
      console.log(' Rendering page...');

      const appBarContainer = document.querySelector('#appBar');
      if (appBarContainer) {
        appBarContainer.innerHTML = await this.#appBar.render();
        await this.#appBar.afterRender();
      }

      const url = getActiveRoute();
      console.log(' Active route:', url);

      const page = routes[url];
      if (!page) {
        this.#content.innerHTML = `
          <section class="container">
            <h2>404 - Halaman Tidak Ditemukan</h2>
            <p>Halaman untuk rute <b>${url}</b> tidak tersedia.</p>
          </section>`;
        return;
      }

      const protectedRoutes = ['/', '/add-story', '/detail/:id'];
      const authRequired = protectedRoutes.includes(url) || url.startsWith('/detail/');

      if (authRequired && !isLoggedIn()) {
        console.warn(' Harus login, alihkan ke /login');
        window.location.hash = '/login';
        return;
      }

      if (['/login', '/register'].includes(url) && isLoggedIn()) {
        console.info('Sudah login, alihkan ke beranda');
        window.location.hash = '/';
        return;
      }

      if (document.startViewTransition) {
        await document.startViewTransition(async () => {
          this.#content.innerHTML = await page.render();
          if (page.afterRender) await page.afterRender();
        });
      } else {
        this.#content.innerHTML = await page.render();
        if (page.afterRender) await page.afterRender();
      }

      console.log('Halaman selesai dirender:', url);
    } catch (error) {
      console.error('Error saat render:', error);
      this.#content.innerHTML = `
        <section class="container">
          <h2>Terjadi Kesalahan</h2>
          <pre style="color:red;">${error}</pre>
        </section>`;
    }
  }
}

export default App;