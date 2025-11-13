import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getAllStories } from '../../data/api';
import { showFormattedDate } from '../../utils';
import { likeNote, getLikedNotes } from '../../utils/idb.js';

export default class HomePage {
  async render() {
    return `
      <section class="container">
        <h1>Daftar Story</h1>
        <div id="map" style="height: 400px; margin-bottom: 24px;"></div>
        <div id="storiesList" class="stories-list">
          <p>Sedang memuat story...</p>
        </div>
      </section>
    `;
  }

  async afterRender() {
    const storiesContainer = document.querySelector('#storiesList');
    const token = localStorage.getItem('token');

    // Buat map
    const map = L.map('map').setView([-6.200000, 106.816666], 5);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    if (!token) {
      storiesContainer.innerHTML = `
        <p>Anda belum login. Silakan <a href="#/login">login</a> untuk melihat story.</p>
      `;
      return;
    }

    try {
      const response = await getAllStories(token, 1, 10, 0);
      const stories = response.listStory || [];

      if (stories.length === 0) {
        storiesContainer.innerHTML = '<p>Belum ada story.</p>';
        return;
      }

      // Ambil semua liked stories dari IndexedDB
      const likedStories = await getLikedNotes();
      const likedIds = likedStories.map(s => s.noteId);

      // Render story list
      const storyItems = stories
        .map(
          (story) => `
            <article class="story-item" data-id="${story.id}">
              <a href="#/detail/${story.id}" class="story-link">
                <img src="${story.photoUrl}" alt="Foto story oleh ${story.name}" class="story-image" />
                <div class="story-info">
                  <h3>${story.name}</h3>
                  <p>${story.description}</p>
                  <p class="story-date">${showFormattedDate(story.createdAt, 'id-ID')}</p>
                  <button class="like-btn" data-id="${story.id}">
                    ${likedIds.includes(story.id) ? '💖 Tersimpan' : '💖 Simpan'}
                  </button>
                </div>
              </a>
            </article>
          `
        )
        .join('');

      storiesContainer.innerHTML = storyItems;

      // Tambahkan event listener tombol Like
      stories.forEach(async (story) => {
        const btn = document.querySelector(`.like-btn[data-id="${story.id}"]`);
        if (btn && !likedIds.includes(story.id)) {
          btn.addEventListener('click', async () => {
            await likeNote({
              noteId: story.id,
              title: story.name,
              content: story.description,
              photoUrl: story.photoUrl,
              createdAt: story.createdAt,
            });
            btn.disabled = true;
            btn.textContent = '💖 Tersimpan';
            const savedList = document.getElementById('saved-list');
            if (savedList) {
              const event = new Event('savedStoryUpdated');
              window.dispatchEvent(event);
            }
          });
        }
      });

      // Buat icon kustom
      const locationIcon = L.icon({
        iconUrl: '/images/Location.png',
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
      });

      // Tambahkan marker di map
      stories.forEach((story) => {
        const lat = parseFloat(story.lat);
        const lon = parseFloat(story.lon);
        if (!isNaN(lat) && !isNaN(lon)) {
          const marker = L.marker([lat, lon], { icon: locationIcon }).addTo(map);
          marker.bindPopup(`
            <strong>${story.name}</strong><br />
            ${story.description}<br />
            <a href="#/detail/${story.id}">Lihat Detail</a>
          `);
        }
      });

    } catch (error) {
      console.error('Error memuat data:', error);
      storiesContainer.innerHTML = '<p>Terjadi kesalahan saat memuat data.</p>';
    }
  }
}
