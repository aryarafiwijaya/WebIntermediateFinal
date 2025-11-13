const MYDB_NAME = 'my_story_db';
const MYDB_VERSION = 1;
const STORE_NOTES = 'notes';
const STORE_PENDING = 'pending';
const STORE_LIKED = 'liked';

function connectDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(MYDB_NAME, MYDB_VERSION);

    request.onupgradeneeded = (e) => {
      const db = e.target.result;

      if (!db.objectStoreNames.contains(STORE_NOTES)) {
        db.createObjectStore(STORE_NOTES, { keyPath: 'noteId' });
      }
      if (!db.objectStoreNames.contains(STORE_PENDING)) {
        db.createObjectStore(STORE_PENDING, { autoIncrement: true });
      }
      if (!db.objectStoreNames.contains(STORE_LIKED)) {
        db.createObjectStore(STORE_LIKED, { keyPath: 'noteId' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// ---- Notes CRUD ----
export async function saveNotes(notes = []) {
  try {
    const db = await connectDB();
    const tx = db.transaction(STORE_NOTES, 'readwrite');
    const store = tx.objectStore(STORE_NOTES);
    notes.forEach(note => store.put(note));
    return tx.complete;
  } catch (err) {
    console.error('saveNotes error', err);
  }
}

export async function getAllNotes() {
  try {
    const db = await connectDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NOTES, 'readonly');
      const store = tx.objectStore(STORE_NOTES);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error('getAllNotes error', err);
    return [];
  }
}

export async function deleteNote(noteId) {
  try {
    const db = await connectDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NOTES, 'readwrite');
      const store = tx.objectStore(STORE_NOTES);
      const req = store.delete(noteId);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error('deleteNote error', err);
  }
}

// ---- Pending / Outbox for offline sync ----
export async function savePending(item) {
  try {
    const db = await connectDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_PENDING, 'readwrite');
      const store = tx.objectStore(STORE_PENDING);
      const req = store.add(item);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error('savePending error', err);
  }
}

export async function getPendingItems() {
  try {
    const db = await connectDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_PENDING, 'readonly');
      const store = tx.objectStore(STORE_PENDING);
      const items = [];
      store.openCursor().onsuccess = (e) => {
        const cursor = e.target.result;
        if (cursor) {
          items.push({ key: cursor.key, value: cursor.value });
          cursor.continue();
        } else {
          resolve(items);
        }
      };
      store.openCursor().onerror = () => reject('Failed to read pending items');
    });
  } catch (err) {
    console.error('getPendingItems error', err);
    return [];
  }
}

export async function deletePending(key) {
  try {
    const db = await connectDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_PENDING, 'readwrite');
      const store = tx.objectStore(STORE_PENDING);
      const req = store.delete(key);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error('deletePending error', err);
  }
}

// ---- Liked Notes ----
export async function likeNote(note) {
  try {
    const db = await connectDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_LIKED, 'readwrite');
      const store = tx.objectStore(STORE_LIKED);
      const req = store.put(note);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error('likeNote error', err);
  }
}

export async function getLikedNotes() {
  try {
    const db = await connectDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_LIKED, 'readonly');
      const store = tx.objectStore(STORE_LIKED);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error('getLikedNotes error', err);
    return [];
  }
}

export async function unlikeNote(noteId) {
  try {
    const db = await connectDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_LIKED, 'readwrite');
      const store = tx.objectStore(STORE_LIKED);
      const req = store.delete(noteId);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error('unlikeNote error', err);
  }
}

export async function clearAllLiked() {
  try {
    const db = await connectDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_LIKED, 'readwrite');
      const store = tx.objectStore(STORE_LIKED);
      const req = store.clear();
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error('clearAllLiked error', err);
  }
}

// --- Export alias agar sesuai saved-stories.js ---
export { 
  getLikedNotes as getAllFavorites, 
  unlikeNote as deleteFavorite, 
  clearAllLiked as clearAllFavorites 
};
