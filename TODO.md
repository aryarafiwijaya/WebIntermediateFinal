# Push Notification Implementation Plan

## Information Gathered
- Project is a Story App using Vite, vanilla JS, with authentication.
- API base URL: https://story-api.dicoding.dev/v1
- VAPID public key: BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk
- Notification triggered by creating new story via API.
- No existing push notification code.
- User confirmed to add notification switch ON and OFF.

## Plan
- Create service worker (sw.js) to handle push events and show notifications.
- Register service worker in index.js.
- Add notification permission request and subscription logic.
- Add API functions for subscribe/unsubscribe to /notifications/subscribe.
- Add toggle button in app-bar for enable/disable push notifications.
- Handle notification click to navigate to detail page.
- Customize notification with dynamic title, icon, body.

## Dependent Files to Edit
- src/scripts/index.js: Register service worker.
- src/scripts/data/api.js: Add subscribe/unsubscribe functions.
- src/scripts/views/components/app-bar.js: Add toggle button for notifications.
- src/scripts/utils/auth.js: Add notification subscription management.
- public/sw.js: New service worker file.
- src/index.html: Add manifest if needed, but optional.

## Followup Steps
- [x] Register service worker in index.js.
- [x] Create service worker (sw.js) to handle push events and show notifications.
- [x] Add API functions for subscribe/unsubscribe to /notifications/subscribe.
- [x] Add notification permission request and subscription logic.
- [x] Add toggle button in app-bar for enable/disable push notifications.
- [x] Handle notification click to navigate to detail page.
- [x] Customize notification with dynamic title, icon, body.
- [x] Show local notification when story is created successfully.
- [x] Add CSS styles for notification and logout buttons.
- Test notification permission and subscription.
- Test creating story and receiving notification.
- Test toggle enable/disable.
- Test notification click navigation.
- Ensure HTTPS for push notifications (but since it's local dev, might need to handle).
