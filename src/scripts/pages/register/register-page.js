import { registerUser } from '../../data/api';

export default class RegisterPage {
  async render() {
    return `
      <section class="container register-page">
        <h1>Daftar Akun Baru</h1>
        <form id="registerForm" class="register-form">
          <div class="form-group">
            <label for="name">Nama</label>
            <input id="name" type="text" placeholder="Masukkan nama" required />
          </div>
          <div class="form-group">
            <label for="email">Email</label>
            <input id="email" type="email" placeholder="Masukkan email" required />
          </div>
          <div class="form-group">
            <label for="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Minimal 8 karakter"
              required
              minlength="8"
            />
          </div>
          <button type="submit" class="btn-register">Daftar</button>
          <p id="registerMessage"></p>
        </form>
      </section>
    `;
  }

  async afterRender() {
    const registerForm = document.querySelector('#registerForm');
    const messageElement = document.querySelector('#registerMessage');

    registerForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      const name = document.querySelector('#name').value.trim();
      const email = document.querySelector('#email').value.trim();
      const password = document.querySelector('#password').value.trim();

      messageElement.style.color = 'black';
      messageElement.textContent = 'Sedang memproses...';

      try {
        const result = await registerUser(name, email, password);

        if (!result.error) {
          messageElement.style.color = 'green';
          messageElement.textContent = 'Registrasi berhasil!';

          if (result.loginResult && result.loginResult.token) {
            localStorage.setItem('token', result.loginResult.token);
            localStorage.setItem('user', JSON.stringify(result.loginResult));

            messageElement.textContent = 'Registrasi berhasil! Mengarahkan ke beranda...';
            setTimeout(() => {
              window.location.hash = '/';
            }, 1500);
          } else {
            messageElement.textContent = 'Registrasi berhasil! Silakan login.';
            setTimeout(() => {
              window.location.hash = '/login';
            }, 1500);
          }
        } else {
          messageElement.style.color = 'red';
          messageElement.textContent = result.message || 'Registrasi gagal.';
        }
      } catch (error) {
        console.error(error);
        messageElement.style.color = 'red';
        messageElement.textContent = 'Terjadi kesalahan jaringan. Silakan coba lagi.';
      }
    });
  }
}
