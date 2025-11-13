export default class AboutPage {
  async render() {
    return `
      <section class="container about-container">
        <h1>Tentang Story App</h1>
        <p>
          Story App adalah aplikasi sederhana yang memungkinkan pengguna untuk berbagi cerita 
          dan pengalaman mereka secara singkat. Aplikasi ini dibangun menggunakan arsitektur 
          modular dengan pendekatan Single Page Application (SPA).
        </p>
        <p>
          Aplikasi ini dikembangkan oleh Arya Rafi Wijaya sebagai bagian dari proyek pembelajaran 
          pengembangan web modern. Fitur-fitur seperti autentikasi pengguna, penambahan cerita, 
          dan navigasi dinamis dikelola sepenuhnya melalui JavaScript.
        </p>
      </section>
    `;
  }

  async afterRender() {
  }
}
