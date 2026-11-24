/* QuietChess puzzle helpers. QC difficulty = Lichess puzzle rating x 0.9 - 300 (initial conversion, Quiet Chess scale). */
(function(root){'use strict';
const qc=r=>Math.round(r*0.9-300);
const prep=raw=>raw.map(x=>({id:x[0],fen:x[1],mv:x[2].split(' '),r:x[3],q:qc(x[3]),th:x[5]||''}));
const inRange=(P,lo,hi)=>P.filter(p=>p.q>=lo&&p.q<=hi);
function sample(arr,n){const a=arr.slice();for(let i=a.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[a[i],a[j]]=[a[j],a[i]];}return a.slice(0,n);}
function hash(s){let h=2166136261;for(const c of s){h^=c.charCodeAt(0);h=Math.imul(h,16777619);}return h>>>0;}
function daily(P,target,date){const c=P.slice().sort((a,b)=>Math.abs(a.q-target)-Math.abs(b.q-target)||(a.id<b.id?-1:1)).slice(0,20);return c[hash(date)%c.length];}
const api={qc,prep,inRange,sample,daily};if(typeof module!=='undefined')module.exports=api;else root.QCPZ=api;})(this);
