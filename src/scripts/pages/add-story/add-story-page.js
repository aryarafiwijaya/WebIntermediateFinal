import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { addNewStory } from '../../data/api';
import { requireAuth } from '../../utils/auth-middleware';
import { isNotificationEnabled } from '../../utils/auth';

export default class AddStoryPage {
  async render() {
    return `
      <section class="container add-story-page">
        <h1>Tambah Story Baru</h1>
        <form id="addStoryForm" class="add-story-form">
          <div class="form-group">
            <label for="description">Deskripsi</label>
            <textarea id="description" placeholder="Tulis deskripsi story..." required></textarea>
          </div>

          <div class="form-group">
            <label for="photo">Foto</label>
            <input id="photo" type="file" accept="image/*" required />
          </div>

          <div id="map" style="height: 400px; margin-bottom: 16px;"></div>

          <div class="form-group">
            <label for="lat">Latitude</label>
            <input id="lat" type="number" step="any" placeholder="Klik peta untuk otomatis" required />
          </div>

          <div class="form-group">
            <label for="lon">Longitude</label>
            <input id="lon" type="number" step="any" placeholder="Klik peta untuk otomatis" required />
          </div>

          <button type="submit" class="btn-submit">Upload Story</button>
          <p id="uploadMessage"></p>
        </form>
      </section>
    `;
  }

  async afterRender() {
    if (!requireAuth()) return;

    const addStoryForm = document.querySelector('#addStoryForm');
    const messageElement = document.querySelector('#uploadMessage');

    const map = L.map('map').setView([-6.200000, 106.816666], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    let marker = null;

    map.on('click', (e) => {
      const { lat, lng } = e.latlng;
      document.querySelector('#lat').value = lat.toFixed(6);
      document.querySelector('#lon').value = lng.toFixed(6);

      if (marker) map.removeLayer(marker);
      marker = L.marker([lat, lng]).addTo(map);
    });

    addStoryForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      const token = localStorage.getItem('token');
      const description = document.querySelector('#description').value;
      const photo = document.querySelector('#photo').files[0];
      const lat = document.querySelector('#lat').value;
      const lon = document.querySelector('#lon').value;

      messageElement.style.color = 'black';
      messageElement.textContent = 'Sedang mengupload story...';

      try {
        const result = await addNewStory(token, description, photo, lat, lon);

        if (!result.error) {
          messageElement.style.color = 'green';
          messageElement.textContent = 'Story berhasil diupload!';
          // Show notification if enabled
          if (isNotificationEnabled() && 'serviceWorker' in navigator) {
            navigator.serviceWorker.ready.then((registration) => {
              registration.showNotification('Story Berhasil Dibuat', {
                body: `Anda telah membuat story baru dengan deskripsi: ${description}`,
                icon: '/images/logo.png',
                badge: '/images/logo.png',
                data: { storyId: result.story?.id },
                actions: [
                  {
                    action: 'view',
                    title: 'Lihat Detail'
                  }
                ]
              });
            });
          }
          setTimeout(() => {
            window.location.hash = '/';
          }, 1500);
        } else {
          messageElement.style.color = 'red';
          messageElement.textContent = `Gagal upload: ${result.message}`;
        }
      } catch (error) {
        console.error(error);
        messageElement.style.color = 'red';
        messageElement.textContent = 'Terjadi kesalahan jaringan.';
      }
    });
  }
}
