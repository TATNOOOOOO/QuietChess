/* quietchess service worker. Bump VER when you want every device to drop its cached copy. */
const VER='qc-v2';
const CORE=['./','index.html','engine.js','ai.js','book.js','pgn.js','analyze.js','puzzles.js','app.js','puzzles.json','stockfish-19-lite-single.js','stockfish-19-lite-single.wasm','manifest.webmanifest','icon.svg','icon-192.png','icon-512.png','icon-maskable-512.png','apple-touch-icon.png'];
const STATIC=/\.(wasm|json)$|stockfish|icon|apple-touch|\.png$/;
const put=(r,res)=>{if(res&&res.status===200){const c=res.clone();caches.open(VER).then(x=>x.put(r,c));}return res;};
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(VER).then(c=>Promise.allSettled(CORE.map(u=>c.add(u)))));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==VER).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET')return;const u=new URL(r.url);if(u.origin!==location.origin)return;
  if(/\/api\//.test(u.pathname)||/room|token/i.test(u.pathname))return; /* online-match requests are never cached */
  if(STATIC.test(u.pathname)){e.respondWith(caches.match(r).then(h=>h||fetch(r).then(res=>put(r,res))));return;}
  e.respondWith(fetch(r).then(res=>put(r,res)).catch(()=>caches.match(r).then(h=>h||caches.match('index.html'))));});
