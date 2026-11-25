'use strict';
// 9.7: ВСЕ файлы приложения хранятся одним набором одной версии. Новая версия ставится только если index.html, app.js, styles.css и sw.js одной версии
// (иначе установка отменяется и остаётся прежняя рабочая): так не бывает «половина старая, половина новая».
const VERSION = '9.9.11';
const CACHE = 'vip-restobar-' + VERSION;
const FILES = ['./index.html', './styles.css', './app.js', './config.js', './manifest.webmanifest', './logo.png', './logo-ink.png', './icons/icon-192.png', './icons/icon-512.png'];
const OFFLINE = '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Нет связи</title><body style="font:18px system-ui;padding:32px;text-align:center"><h2>Нет интернета</h2><p>Приложение откроется, когда появится связь.</p><button style="font:inherit;padding:12px 24px" onclick="location.reload()">Обновить</button>';
const MARK = {
  './index.html': 'name="vip-ver" content="' + VERSION + '"',
  './app.js': "const VER='" + VERSION + "'",
  './styles.css': '--vip-ver:"' + VERSION + '"',
  './config.js': 'CONFIG'
};

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const rs = await Promise.all(FILES.map(f => fetch(new Request(f, {cache: 'reload'}))));
    for (let i = 0; i < FILES.length; i++) {
      const f = FILES[i], r = rs[i];
      if (!r.ok) throw new Error('http ' + r.status + ' ' + f);
      const ct = r.headers.get('content-type') || '';
      if (f !== './index.html' && /text\/html/i.test(ct)) throw new Error('html instead of ' + f);
      if (MARK[f]) { const tx = await r.clone().text(); if (tx.indexOf(MARK[f]) < 0) throw new Error('version mismatch ' + f); }
    }
    const c = await caches.open(CACHE);
    await Promise.all(FILES.map((f, i) => c.put(new Request(f), rs[i].clone())));
    await c.put(new Request('./'), rs[0].clone());
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const ks = await caches.keys();
    await Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const r = event.request;
  if (r.method !== 'GET') return;
  const u = new URL(r.url);
  if (u.origin !== self.location.origin) return;
  if (u.searchParams.has('vh')) return; // проверка связи при самовосстановлении: всегда в сеть
  if (/\/config\.js$/.test(u.pathname)) {
    // config.js — крошечный и не привязан к версии: отдаём из кэша сразу, а свежий скачиваем для следующего запуска
    event.waitUntil((async () => {
      try {
        const n = await fetch(new Request(u.pathname, {cache: 'reload'}));
        if (n.ok && !/text\/html/i.test(n.headers.get('content-type') || '') && (await n.clone().text()).indexOf('CONFIG') >= 0) { const c = await caches.open(CACHE); await c.put(new Request('./config.js'), n); }
      } catch (e) {}
    })());
    event.respondWith((async () => { const c = await caches.open(CACHE); return (await c.match('./config.js')) || fetch(r).catch(() => Response.error()); })());
    return;
  }
  event.respondWith((async () => {
    const c = await caches.open(CACHE);
    const hit = r.mode === 'navigate' ? await c.match('./index.html') : await c.match(r, {ignoreSearch: true});
    if (hit) return hit;
    try { return await fetch(r); }
    catch (e) {
      if (r.mode === 'navigate') return new Response(OFFLINE, {status: 200, headers: {'Content-Type': 'text/html; charset=utf-8'}});
      return Response.error();
    }
  })());
});

// ---------- 9.9.6: push-уведомления (без Telegram) ----------
// Сервер (Cloudflare Worker) шлёт зашифрованное сообщение {ti, b, k, ts}. Мы показываем уведомление и сообщаем открытым страницам (звук и тост в приложении).
self.addEventListener('push', event => {
  event.waitUntil((async () => {
    let d = null;
    try { d = event.data ? event.data.json() : null; } catch (e) { try { d = {ti: 'Кухня ВИАЙПИ', b: event.data.text()}; } catch (e2) {} }
    if (!d || typeof d !== 'object') d = {ti: 'Кухня ВИАЙПИ', b: 'Новое уведомление — откройте приложение', k: 'x'};
    const cl = await self.clients.matchAll({type: 'window', includeUncontrolled: true});
    cl.forEach(c => { try { c.postMessage({type: 'vip-push', d}); } catch (e) {} });
    const ios = /iPhone|iPad|iPod/i.test((self.navigator && self.navigator.userAgent) || '');
    const seen = cl.some(c => c.visibilityState === 'visible' && c.focused);
    // Android/ПК: если приложение открыто и на виду, баннер не нужен — звук и сообщение покажет само приложение. iPhone требует показывать каждое уведомление; таймер показываем всегда.
    if (seen && !ios && d.k !== 'tm') return;
    await self.registration.showNotification(String(d.ti || 'Кухня ВИАЙПИ'), {
      body: String(d.b || ''), icon: './icons/icon-192.png', badge: './icons/icon-192.png',
      tag: 'vip-' + (d.k || 'x') + '-' + String(d.ti || '').slice(0, 40), renotify: true, requireInteraction: d.ri === 1,
      vibrate: d.k === 'tm' ? [400, 200, 400, 200, 800] : [200, 100, 200], timestamp: d.ts || Date.now(), data: {k: d.k || '', url: './'}
    });
  })());
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const k = (event.notification.data && event.notification.data.k) || '';
  event.waitUntil((async () => {
    const cl = await self.clients.matchAll({type: 'window', includeUncontrolled: true});
    for (const c of cl) {
      try { await c.focus(); c.postMessage({type: 'vip-open', k}); return; } catch (e) {}
    }
    if (self.clients.openWindow) await self.clients.openWindow('./');
  })());
});

// страница спрашивает версию службы (для диагностики в 🔔)
self.addEventListener('message', event => {
  const d = event.data;
  if (d && d.type === 'ver' && event.source) { try { event.source.postMessage({type: 'vip-ver', v: VERSION}); } catch (e) {} }
});

// браузер сам сменил подписку — просим открытую страницу подписаться заново (ключ и адрес обновятся при следующем открытии приложения)
self.addEventListener('pushsubscriptionchange', event => {
  event.waitUntil((async () => {
    const cl = await self.clients.matchAll({type: 'window', includeUncontrolled: true});
    cl.forEach(c => { try { c.postMessage({type: 'vip-resub'}); } catch (e) {} });
  })());
});
