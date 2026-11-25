/* QuietChess puzzle helpers. QC difficulty = Lichess puzzle rating x 0.9 - 300 (initial conversion, Quiet Chess scale). */
(function(root){'use strict';
const qc=r=>Math.round(r*0.9-300);
const prep=raw=>raw.map(x=>({id:x[0],fen:x[1],mv:x[2].split(' '),r:x[3],q:qc(x[3]),th:x[5]||''}));
const inRange=(P,lo,hi)=>P.filter(p=>p.q>=lo&&p.q<=hi);
function sample(arr,n){const a=arr.slice();for(let i=a.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[a[i],a[j]]=[a[j],a[i]];}return a.slice(0,n);}
function hash(s){let h=2166136261;for(const c of s){h^=c.charCodeAt(0);h=Math.imul(h,16777619);}return h>>>0;}
function daily(P,target,date){const c=P.slice().sort((a,b)=>Math.abs(a.q-target)-Math.abs(b.q-target)||(a.id<b.id?-1:1)).slice(0,20);return c[hash(date)%c.length];}
function nearest(P,t,used,n){const c=P.filter(p=>!used.has(p.id)).sort((a,b)=>Math.abs(a.q-t)-Math.abs(b.q-t)).slice(0,n||6);return c[Math.random()*c.length|0];}
function qAnswer(z,p,ok){z.used.push(p.id);z.n++;z.hist.push({id:p.id,q:p.q,ok,t:z.est});z.est=Math.max(100,Math.min(2400,z.est+(ok?z.step:-z.step)));z.step=Math.max(40,Math.round(z.step*0.82));}
function qSpread(z,k){const l=z.hist.slice(-k).map(h=>h.t);return l.length?Math.max(...l)-Math.min(...l):9999;}
function qDone(z){return z.n>=30||(z.n>=20&&qSpread(z,6)<=140);}
function qResult(z){const t=z.hist.map(h=>h.t).concat([z.est]).slice(-8),e=t.reduce((a,b)=>a+b,0)/t.length,sp=Math.max(...t)-Math.min(...t);return{est:Math.round(e/10)*10,half:Math.max(100,Math.round((sp/2+60)/10)*10)};}
const api={qc,prep,inRange,sample,daily,nearest,qAnswer,qDone,qResult};if(typeof module!=='undefined')module.exports=api;else root.QCPZ=api;})(this);
