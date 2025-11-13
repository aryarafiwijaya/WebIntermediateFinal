import CONFIG from '../config';

const ENDPOINTS = {
  REGISTER: `${CONFIG.BASE_URL}/register`,
  LOGIN: `${CONFIG.BASE_URL}/login`,
  STORIES: `${CONFIG.BASE_URL}/stories`,
  STORY_DETAIL: (id) => `${CONFIG.BASE_URL}/stories/${id}`,
  GUEST_STORY: `${CONFIG.BASE_URL}/stories/guest`,
  NOTIFICATIONS_SUBSCRIBE: `${CONFIG.BASE_URL}/notifications/subscribe`,
};

async function safeFetch(url, options = {}) {
  try {
    const response = await fetch(url, options);
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Terjadi kesalahan');
    return data;
  } catch (error) {
    console.error('[API Error]', error);
    return { error: true, message: error.message };
  }
}

export async function registerUser(name, email, password) {
  return safeFetch(ENDPOINTS.REGISTER, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });
}

export async function loginUser(email, password) {
  return safeFetch(ENDPOINTS.LOGIN, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
}

export async function getAllStories(token, page = 1, size = 10, location = 0) {
  return safeFetch(`${ENDPOINTS.STORIES}?page=${page}&size=${size}&location=${location}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function getStoryDetail(token, id) {
  return safeFetch(ENDPOINTS.STORY_DETAIL(id), {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function addNewStory(token, description, photo, lat = null, lon = null) {
  const formData = new FormData();
  formData.append('description', description);
  formData.append('photo', photo);
  if (lat) formData.append('lat', lat);
  if (lon) formData.append('lon', lon);

  return safeFetch(ENDPOINTS.STORIES, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
}

export async function addGuestStory(description, photo, lat = null, lon = null) {
  const formData = new FormData();
  formData.append('description', description);
  formData.append('photo', photo);
  if (lat) formData.append('lat', lat);
  if (lon) formData.append('lon', lon);

  return safeFetch(ENDPOINTS.GUEST_STORY, {
    method: 'POST',
    body: formData,
  });
}

export async function subscribeNotification(token, endpoint, keys) {
  return safeFetch(ENDPOINTS.NOTIFICATIONS_SUBSCRIBE, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      endpoint,
      keys: {
        p256dh: keys.p256dh,
        auth: keys.auth
      }
    }),
  });
}

export async function unsubscribeNotification(token, endpoint) {
  return safeFetch(ENDPOINTS.NOTIFICATIONS_SUBSCRIBE, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ endpoint }),
  });
}
