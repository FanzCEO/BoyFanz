// BoyFanz Progressive Web App Service Worker
// Advanced caching strategies, offline support, and background sync
// VERSION: 2.3.0 - Added loading state to prevent blank screen

const CACHE_VERSION = '2.4.0';
const CACHE_NAME = `boyfanz-v${CACHE_VERSION}`;
const OFFLINE_CACHE = `boyfanz-offline-v${CACHE_VERSION}`;
const DYNAMIC_CACHE = `boyfanz-dynamic-v${CACHE_VERSION}`;
const IMAGE_CACHE = `boyfanz-images-v${CACHE_VERSION}`;
const API_CACHE = `boyfanz-api-v${CACHE_VERSION}`;

// Static assets to precache (App Shell) - Production compatible paths only
const STATIC_ASSETS = [
  '/',
  '/offline.html',
  '/boyfanz-logo.png',
  '/underground-bg.jpg',
  '/pwa-icons/icon-192x192.png',
  '/pwa-icons/icon-512x512.png',
  '/manifest.json'
];

// Additional assets to discover dynamically
const DYNAMIC_ASSETS = [];

// Environment detection
const isDevelopment = location.hostname === 'localhost' || location.hostname.includes('replit');

// CRITICAL: Endpoints that should NEVER be cached or masked
// Auth failures from these MUST propagate to the UI
const NEVER_CACHE_APIS = [
  '/api/auth',
  '/api/login',
  '/api/logout',
  '/api/infinity-feed',
  '/api/auth/check-admin',
  '/api/platform/current',
  '/api/social-notifications',
  '/api/streams/live',
  '/api/trending',
  '/api/creators/suggested',
  '/api/stories',
  '/api/messages/unread-count'
];

// API endpoints that CAN be cached for offline (non-auth-critical)
const CACHEABLE_APIS = [
  '/api/notifications',
  '/api/messages',
  '/api/content/feed'
];

// Kill switch - if set, SW bypasses all caching
let killSwitchActive = false;

// Background sync tags
const SYNC_TAGS = {
  SEND_MESSAGE: 'send-message',
  LIKE_CONTENT: 'like-content', 
  UPLOAD_CONTENT: 'upload-content',
  UPDATE_PROFILE: 'update-profile'
};

// Install event - cache static assets with error handling
self.addEventListener('install', (event) => {
  console.log('🚀 BoyFanz SW: Installing service worker');
  
  event.waitUntil(
    Promise.all([
      // Cache static app shell with individual error handling
      cacheAssetsWithErrorHandling(CACHE_NAME, STATIC_ASSETS),
      
      // Create offline cache
      caches.open(OFFLINE_CACHE).then((cache) => {
        return cache.add('/offline.html').catch((error) => {
          console.warn('⚠️ BoyFanz SW: Failed to cache offline.html:', error);
          return Promise.resolve(); // Don't fail installation
        });
      }),
      
      // Discover and cache additional assets if in production
      discoverAndCacheAssets()
    ]).then(() => {
      console.log('✅ BoyFanz SW: Installation complete');
      return self.skipWaiting();
    }).catch((error) => {
      console.error('❌ BoyFanz SW: Installation failed:', error);
      // Don't prevent installation - skip waiting anyway
      return self.skipWaiting();
    })
  );
});

// Cache assets with individual error handling
async function cacheAssetsWithErrorHandling(cacheName, assets) {
  try {
    const cache = await caches.open(cacheName);
    console.log('📦 BoyFanz SW: Caching app shell assets');
    
    // Cache each asset individually to prevent one failure from breaking all
    const cachePromises = assets.map(async (asset) => {
      try {
        const response = await fetch(asset);
        if (response.ok) {
          await cache.put(asset, response);
          console.log('✅ BoyFanz SW: Cached:', asset);
        } else {
          console.warn(`⚠️ BoyFanz SW: Failed to fetch ${asset}: ${response.status}`);
        }
      } catch (error) {
        console.warn(`⚠️ BoyFanz SW: Error caching ${asset}:`, error.message);
        // Continue with other assets
      }
    });
    
    await Promise.allSettled(cachePromises);
    console.log('📦 BoyFanz SW: App shell caching completed');
  } catch (error) {
    console.error('❌ BoyFanz SW: Failed to open cache:', error);
  }
}

// Discover and cache build assets dynamically
async function discoverAndCacheAssets() {
  if (isDevelopment) {
    console.log('🔧 BoyFanz SW: Development mode - skipping asset discovery');
    return;
  }
  
  try {
    // In production, try to discover built assets
    const indexResponse = await fetch('/');
    if (indexResponse.ok) {
      const html = await indexResponse.text();
      const cache = await caches.open(CACHE_NAME);
      
      // Extract CSS and JS assets from HTML
      const cssMatches = html.match(/href="(\/assets\/[^"]+\.css[^"]*)"/g) || [];
      const jsMatches = html.match(/src="(\/assets\/[^"]+\.js[^"]*)"/g) || [];
      
      const discoveredAssets = [
        ...cssMatches.map(match => match.match(/href="([^"]+)"/)[1]),
        ...jsMatches.map(match => match.match(/src="([^"]+)"/)[1])
      ];
      
      console.log('🔍 BoyFanz SW: Discovered assets:', discoveredAssets);
      
      // Cache discovered assets
      for (const asset of discoveredAssets) {
        try {
          const response = await fetch(asset);
          if (response.ok) {
            await cache.put(asset, response);
            console.log('✅ BoyFanz SW: Cached discovered asset:', asset);
          }
        } catch (error) {
          console.warn(`⚠️ BoyFanz SW: Failed to cache ${asset}:`, error.message);
        }
      }
    }
  } catch (error) {
    console.warn('⚠️ BoyFanz SW: Asset discovery failed:', error.message);
  }
}

// Activate event - clean up old caches + check kill switch
self.addEventListener('activate', (event) => {
  console.log('🔄 BoyFanz SW: Activating service worker v' + CACHE_VERSION);

  event.waitUntil(
    Promise.all([
      // Check kill switch first
      checkKillSwitch(),

      // Clean up ALL old version caches (version-aware cleanup)
      caches.keys().then((cacheNames) => {
        const currentCaches = [CACHE_NAME, OFFLINE_CACHE, DYNAMIC_CACHE, IMAGE_CACHE, API_CACHE];
        return Promise.all(
          cacheNames.map((cacheName) => {
            // Delete any cache that's not in our current version set
            if (!currentCaches.includes(cacheName)) {
              console.log('🗑️ BoyFanz SW: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),

      // Take control of all clients immediately
      self.clients.claim()
    ]).then(() => {
      console.log('✅ BoyFanz SW: Activation complete v' + CACHE_VERSION);
      // Notify all clients of new SW version
      self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({ type: 'SW_ACTIVATED', version: CACHE_VERSION });
        });
      });
    })
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // KILL SWITCH: If active, bypass SW entirely - let browser handle everything
  if (killSwitchActive) {
    return; // Pass through to network
  }

  // Skip non-GET requests and chrome-extension requests
  if (request.method !== 'GET' || url.protocol === 'chrome-extension:') {
    return;
  }

  // Handle different types of requests with appropriate strategies
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request));
  } else if (isImageRequest(request)) {
    event.respondWith(handleImageRequest(request));
  } else if (isStaticAsset(request)) {
    event.respondWith(handleStaticAsset(request));
  } else {
    event.respondWith(handleNavigationRequest(request));
  }
});

// Check for kill switch on startup
async function checkKillSwitch() {
  try {
    const response = await fetch('/sw-kill.json', { cache: 'no-store' });
    if (response.ok) {
      const data = await response.json();
      if (data.kill === true) {
        console.log('🚨 BoyFanz SW: Kill switch activated - unregistering');
        killSwitchActive = true;
        // Clear all caches
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
        // Unregister this service worker
        await self.registration.unregister();
        // Notify all clients to reload
        const clients = await self.clients.matchAll();
        clients.forEach(client => client.postMessage({ type: 'SW_KILLED' }));
      }
    }
  } catch (e) {
    // No kill switch file = normal operation
  }
}

// API Request Handler - Network First, NO MASKING of auth failures
async function handleApiRequest(request) {
  const url = new URL(request.url);
  const isNeverCache = NEVER_CACHE_APIS.some(api => url.pathname.startsWith(api));

  try {
    // ALWAYS try network first
    const networkResponse = await fetch(request);

    // CRITICAL: Never cache or mask 401/403 responses
    // These MUST propagate to the UI so auth can be handled properly
    if (networkResponse.status === 401 || networkResponse.status === 403) {
      console.log('🔐 BoyFanz SW: Auth failure, passing through:', url.pathname, networkResponse.status);
      return networkResponse; // Pass through directly - DO NOT cache
    }

    // CRITICAL: Never cache endpoints in the NEVER_CACHE list
    if (isNeverCache) {
      return networkResponse; // Pass through without caching
    }

    // Cache successful responses for cacheable endpoints only
    if (networkResponse.ok && CACHEABLE_APIS.some(api => url.pathname.startsWith(api))) {
      const cache = await caches.open(API_CACHE);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    // Network completely unavailable (offline)
    console.log('🌐 BoyFanz SW: Network unavailable for:', url.pathname);

    // NEVER provide cached data for auth-critical endpoints
    if (isNeverCache) {
      return new Response(JSON.stringify({
        error: 'NetworkError',
        message: 'Unable to reach server. Please check your connection.',
        offline: true,
        _sw_error: true
      }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // For cacheable endpoints, try cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      // Clone and add header to indicate this is cached data
      const headers = new Headers(cachedResponse.headers);
      headers.set('X-SW-Cache', 'true');
      return new Response(cachedResponse.body, {
        status: cachedResponse.status,
        statusText: cachedResponse.statusText,
        headers
      });
    }

    // No cache available
    return new Response(JSON.stringify({
      error: 'NetworkError',
      message: 'Unable to reach server and no cached data available.',
      offline: true,
      _sw_error: true
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Image Request Handler - Cache First with network fallback
async function handleImageRequest(request) {
  try {
    // Try cache first for images
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Fetch from network and cache
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(IMAGE_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('🖼️ BoyFanz SW: Image request failed:', request.url);
    // Return placeholder image for offline
    return new Response('', { status: 404 });
  }
}

// Static Asset Handler - Cache First
async function handleStaticAsset(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    return caches.match(request);
  }
}

// Navigation Request Handler - Network First with offline fallback
async function handleNavigationRequest(request) {
  try {
    // Try network first for navigation
    const networkResponse = await fetch(request);
    
    // Cache successful page responses
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('🔍 BoyFanz SW: Navigation failed, checking cache');
    
    // Try cached version
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline page for navigation requests
    return caches.match('/offline.html');
  }
}

// Background Sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('🔄 BoyFanz SW: Background sync:', event.tag);
  
  switch (event.tag) {
    case SYNC_TAGS.SEND_MESSAGE:
      event.waitUntil(syncQueuedMessages());
      break;
    case SYNC_TAGS.LIKE_CONTENT:
      event.waitUntil(syncQueuedLikes());
      break;
    case SYNC_TAGS.UPLOAD_CONTENT:
      event.waitUntil(syncQueuedUploads());
      break;
    case SYNC_TAGS.UPDATE_PROFILE:
      event.waitUntil(syncProfileUpdates());
      break;
  }
});

// Push Notification Handler
self.addEventListener('push', (event) => {
  console.log('📬 BoyFanz SW: Push notification received');
  
  let notificationData = {};
  
  if (event.data) {
    try {
      notificationData = event.data.json();
    } catch (error) {
      notificationData = {
        title: 'BoyFanz',
        body: event.data.text() || 'New notification',
        icon: '/pwa-icons/icon-192x192.png'
      };
    }
  }
  
  const {
    title = 'BoyFanz',
    body = 'New notification',
    icon = '/pwa-icons/icon-192x192.png',
    badge = '/pwa-icons/badge-72x72.png',
    image,
    data = {},
    actions = [],
    tag,
    requireInteraction = false
  } = notificationData;
  
  const notificationOptions = {
    body,
    icon,
    badge,
    data: {
      ...data,
      url: data.url || '/',
      timestamp: Date.now()
    },
    tag: tag || 'boyfanz-notification',
    requireInteraction,
    vibrate: [100, 50, 100],
    actions: actions.length > 0 ? actions : [
      {
        action: 'open',
        title: 'Open BoyFanz',
        icon: '/pwa-icons/icon-72x72.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
        icon: '/pwa-icons/dismiss-72x72.png'
      }
    ]
  };
  
  if (image) {
    notificationOptions.image = image;
  }
  
  event.waitUntil(
    self.registration.showNotification(title, notificationOptions)
  );
});

// Notification Click Handler
self.addEventListener('notificationclick', (event) => {
  console.log('📱 BoyFanz SW: Notification clicked:', event.action);
  
  event.notification.close();
  
  const { data } = event.notification;
  const targetUrl = data?.url || '/';
  
  if (event.action === 'dismiss') {
    return;
  }
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Try to focus existing window
        for (const client of clientList) {
          if (client.url === targetUrl && 'focus' in client) {
            return client.focus();
          }
        }
        
        // Open new window if none found
        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }
      })
  );
});

// Message Handler for communication with main thread
self.addEventListener('message', (event) => {
  console.log('💬 BoyFanz SW: Message received:', event.data);

  const { type, payload } = event.data;

  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
    case 'QUEUE_ACTION':
      queueOfflineAction(payload);
      break;
    case 'CLEAR_CACHE':
      clearSpecificCache(payload.cacheName);
      break;
    case 'UPDATE_BADGE':
      updateAppBadge(payload.count);
      break;
    // KILL SWITCH: Immediately unregister SW and clear all caches
    case 'KILL_SW':
      console.log('🚨 BoyFanz SW: Kill command received - unregistering');
      killSwitchActive = true;
      caches.keys().then(names => Promise.all(names.map(n => caches.delete(n))))
        .then(() => self.registration.unregister())
        .then(() => {
          event.source?.postMessage({ type: 'SW_KILLED', success: true });
        });
      break;
    // Clear all caches but keep SW registered
    case 'CLEAR_ALL_CACHES':
      console.log('🧹 BoyFanz SW: Clearing all caches');
      caches.keys().then(names => Promise.all(names.map(n => caches.delete(n))))
        .then(() => {
          event.source?.postMessage({ type: 'CACHES_CLEARED', success: true });
        });
      break;
    // Force check kill switch file
    case 'CHECK_KILL_SWITCH':
      checkKillSwitch().then(() => {
        event.source?.postMessage({ type: 'KILL_SWITCH_CHECKED', active: killSwitchActive });
      });
      break;
    // Get SW version
    case 'GET_VERSION':
      event.source?.postMessage({ type: 'SW_VERSION', version: CACHE_VERSION });
      break;
  }
});

// Utility Functions

function isImageRequest(request) {
  return request.destination === 'image' || 
         /\.(jpg|jpeg|png|gif|webp|svg|ico)$/i.test(new URL(request.url).pathname);
}

function isStaticAsset(request) {
  const url = new URL(request.url);
  return /\.(js|css|woff|woff2|ttf|eot)$/i.test(url.pathname) ||
         url.pathname.startsWith('/pwa-icons/') ||
         url.pathname.startsWith('/assets/');
}

async function queueOfflineAction(action) {
  try {
    // Store action in IndexedDB for later sync
    const db = await openDB();
    const transaction = db.transaction(['sync_queue'], 'readwrite');
    const store = transaction.objectStore('sync_queue');
    
    await store.add({
      ...action,
      timestamp: Date.now(),
      synced: false
    });
    
    console.log('📥 BoyFanz SW: Action queued for sync:', action.type);
  } catch (error) {
    console.error('❌ BoyFanz SW: Failed to queue action:', error);
  }
}

async function syncQueuedMessages() {
  try {
    const db = await openDB();
    const transaction = db.transaction(['sync_queue'], 'readwrite');
    const store = transaction.objectStore('sync_queue');
    const index = store.index('type');
    
    const messages = await index.getAll('SEND_MESSAGE');
    
    for (const message of messages) {
      if (!message.synced) {
        try {
          const response = await fetch('/api/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(message.data)
          });
          
          if (response.ok) {
            message.synced = true;
            await store.put(message);
            console.log('✅ BoyFanz SW: Message synced:', message.id);
          }
        } catch (error) {
          console.error('❌ BoyFanz SW: Failed to sync message:', error);
        }
      }
    }
  } catch (error) {
    console.error('❌ BoyFanz SW: Message sync failed:', error);
  }
}

async function syncQueuedLikes() {
  // Similar implementation for likes
  console.log('👍 BoyFanz SW: Syncing queued likes');
}

async function syncQueuedUploads() {
  // Similar implementation for content uploads
  console.log('📤 BoyFanz SW: Syncing queued uploads');
}

async function syncProfileUpdates() {
  // Similar implementation for profile updates
  console.log('👤 BoyFanz SW: Syncing profile updates');
}

async function clearSpecificCache(cacheName) {
  try {
    const deleted = await caches.delete(cacheName);
    console.log(`🗑️ BoyFanz SW: Cache ${cacheName} ${deleted ? 'deleted' : 'not found'}`);
  } catch (error) {
    console.error('❌ BoyFanz SW: Failed to clear cache:', error);
  }
}

async function updateAppBadge(count) {
  try {
    if ('setAppBadge' in navigator) {
      await navigator.setAppBadge(count);
    }
  } catch (error) {
    console.error('❌ BoyFanz SW: Failed to update badge:', error);
  }
}

async function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('BoyFanzPWA', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      if (!db.objectStoreNames.contains('sync_queue')) {
        const store = db.createObjectStore('sync_queue', { keyPath: 'id', autoIncrement: true });
        store.createIndex('type', 'type', { unique: false });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
  });
}

console.log('🚀 BoyFanz SW: Service Worker script loaded');