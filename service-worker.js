const CACHE_NAME = 'knights-tour-cache-v1.05';
const urlsToCache = [
  '/',
  '/index.html',
  '/index.tsx',
  '/App.tsx',
  '/types.ts',
  '/manifest.json',
  '/components/Board.tsx',
  '/components/CookieConsent.tsx',
  '/components/Footer.tsx',
  '/components/GameOverModal.tsx',
  '/components/LanguageSwitcher.tsx',
  '/components/Square.tsx',
  '/context/LanguageContext.tsx',
  '/screens/CookiePolicyScreen.tsx',
  '/screens/GameScreen.tsx',
  '/screens/PrivacyPolicyScreen.tsx',
  '/screens/SettingsScreen.tsx',
  '/screens/TermsOfServiceScreen.tsx',
  '/locales/de.json',
  '/locales/en.json',
  '/locales/es.json',
  '/locales/fr.json',
  '/locales/ru.json',
  'https://cdn.tailwindcss.com',
  'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js',
  'https://aistudiocdn.com/react@^19.2.0',
  'https://aistudiocdn.com/react-dom@^19.2.0/client',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});