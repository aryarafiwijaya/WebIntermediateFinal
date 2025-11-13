import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getStoryDetail } from '../../data/api';
import { requireAuth } from '../../utils/auth-middleware';
import { showFormattedDate } from '../../utils';

export default class DetailPage {
  async render() {
    return `
      <section class="container detail-page">
        <h1>Detail Story</h1>
        <div id="storyDetail" class="story-detail">
          <p>Memuat detail story...</p>
        </div>
        <div id="map" style="height: 400px; margin-top: 24px;"></div>
      </section>
    `;
  }

  async afterRender() {
    if (!requireAuth()) return;

    const storyDetailContainer = document.querySelector('#storyDetail');
    const mapContainer = document.querySelector('#map');
    const urlHash = window.location.hash;
    const storyId = urlHash.split('/')[2];
    const token = localStorage.getItem('token');

    try {
      const response = await getStoryDetail(token, storyId);

      if (response.error) {
        storyDetailContainer.innerHTML = `<p>${response.message}</p>`;
        return;
      }

      const story = response.story;
      const { name, description, photoUrl, createdAt, lat, lon } = story;

      storyDetailContainer.innerHTML = `
        <div class="story-card">
          <img src="${photoUrl}" alt="${name}" class="story-photo" />
          <div class="story-info">
            <h2>${name}</h2>
            <p class="story-date">${showFormattedDate(createdAt, 'id-ID')}</p>
            <p>${description}</p>
          </div>
        </div>
      `;

      const latitude = parseFloat(lat) || -6.200000;
      const longitude = parseFloat(lon) || 106.816666;

      const map = L.map(mapContainer).setView([latitude, longitude], 13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);

      // Buat icon kustom Location.png
      const locationIcon = L.icon({
        iconUrl: '/images/Location.png',
        iconSize: [32, 32],      // ukuran icon
        iconAnchor: [16, 32],    // titik anchor icon
        popupAnchor: [0, -32],   // titik popup
      });

      if (!isNaN(parseFloat(lat)) && !isNaN(parseFloat(lon))) {
        const marker = L.marker([lat, lon], { icon: locationIcon }).addTo(map);
        marker.bindPopup(`
          <strong>${name}</strong><br/>
          ${description}
        `);
      }
    } catch (error) {
      console.error(error);
      storyDetailContainer.innerHTML = `<p>Gagal memuat detail story. Cek console untuk info.</p>`;
    }
  }
}
