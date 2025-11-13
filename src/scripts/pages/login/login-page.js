import { loginUser } from '../../data/api';

export default class LoginPage {
  async render() {
    return `
      <section class="container login-page">
        <h1>Login</h1>
        <form id="loginForm" class="login-form">
          <div class="form-group">
            <label for="email">Email</label>
            <input id="email" type="email" placeholder="Masukkan email" required />
          </div>
          <div class="form-group">
            <label for="password">Password</label>
            <input id="password" type="password" placeholder="Masukkan password" required />
          </div>
          <button type="submit" class="btn-login">Login</button>
          <p id="loginMessage"></p>
        </form>
      </section>
    `;
  }

  async afterRender() {
    const loginForm = document.querySelector('#loginForm');
    const messageElement = document.querySelector('#loginMessage');

    loginForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      const email = document.querySelector('#email').value.trim();
      const password = document.querySelector('#password').value.trim();

      messageElement.textContent = ' Sedang login...';
      messageElement.style.color = 'black';

      try {
        const result = await loginUser(email, password);

        if (!result.error) {
          messageElement.style.color = 'green';
          messageElement.textContent = ' Login berhasil! Mengarahkan ke beranda...';


          localStorage.setItem('token', result.loginResult.token);
          localStorage.setItem('userName', result.loginResult.name);

          setTimeout(() => {
            window.location.hash = '/';
            window.location.reload();
          }, 800);
        } else {
          messageElement.style.color = 'red';
          messageElement.textContent = result.message || ' Login gagal. Coba lagi.';
        }
      } catch (error) {
        console.error('Error saat login:', error);
        messageElement.style.color = 'red';
        messageElement.textContent = ' Terjadi kesalahan jaringan.';
      }
    });
  }
}
