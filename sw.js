'use strict';
// 9.7: ВСЕ файлы приложения хранятся одним набором одной версии. Новая версия ставится только если index.html, app.js, styles.css и sw.js одной версии
// (иначе установка отменяется и остаётся прежняя рабочая): так не бывает «половина старая, половина новая».
const VERSION = '9.9.1';
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
