import { subscribeNotification, unsubscribeNotification } from '../data/api';
import { setNotificationEnabled, isNotificationEnabled } from './auth';

const VAPID_PUBLIC_KEY = 'BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk';

export async function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered:', registration);
      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return null;
    }
  }
  return null;
}

export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission === 'denied') {
    return false;
  }

  const permission = await Notification.requestPermission();
  return permission === 'granted';
}

export async function subscribeToPushNotifications(token) {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
    });

    const response = await subscribeNotification(token, subscription.endpoint, {
      p256dh: arrayBufferToBase64(subscription.getKey('p256dh')),
      auth: arrayBufferToBase64(subscription.getKey('auth'))
    });

    if (!response.error) {
      setNotificationEnabled(true);
      console.log('Subscribed to push notifications');
      return true;
    } else {
      console.error('Failed to subscribe:', response.message);
      return false;
    }
  } catch (error) {
    console.error('Error subscribing to push notifications:', error);
    return false;
  }
}

export async function unsubscribeFromPushNotifications(token) {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      const response = await unsubscribeNotification(token, subscription.endpoint);

      if (!response.error) {
        await subscription.unsubscribe();
        setNotificationEnabled(false);
        console.log('Unsubscribed from push notifications');
        return true;
      } else {
        console.error('Failed to unsubscribe:', response.message);
        return false;
      }
    } else {
      setNotificationEnabled(false);
      return true;
    }
  } catch (error) {
    console.error('Error unsubscribing from push notifications:', error);
    return false;
  }
}

export async function toggleNotifications(token) {
  const enabled = isNotificationEnabled();

  if (enabled) {
    return await unsubscribeFromPushNotifications(token);
  } else {
    const permissionGranted = await requestNotificationPermission();
    if (permissionGranted) {
      return await subscribeToPushNotifications(token);
    } else {
      alert('Izin notifikasi diperlukan untuk mengaktifkan push notification.');
      return false;
    }
  }
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}
