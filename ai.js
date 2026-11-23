/* QuietChess own weak-AI (used below Elo 1320 or when Stockfish is unavailable) */
(function(root){'use strict';
const E=root.QCEngine||require('./engine.js'); const V={p:100,n:320,b:330,r:500,q:900,k:0};
function ev(s){let v=0;for(let i=0;i<64;i++){const p=s.b[i];if(p==='.')continue;const x=V[p.toLowerCase()];v+=p<'a'?x:-x;}return s.t==='w'?v:-v;}
function nega(s,d,a,b){const ms=E.legal(s);if(!ms.length)return E.inCheck(s)?-99999-d:0;if(!d)return ev(s);
 ms.sort((x,y)=>(s.b[y.to]!=='.')-(s.b[x.to]!=='.'));let best=-1e9;
 for(const m of ms){const v=-nega(E.make(s,m),d-1,-b,-a);if(v>best)best=v;if(v>a)a=v;if(a>=b)break;}return best;}
function pick(s,elo){const ms=E.legal(s);if(!ms.length)return null;const d=elo<500?1:elo<900?2:3;
 if(Math.random()<Math.max(0,(1000-elo)/1000)*.4)return ms[Math.random()*ms.length|0];
 const nz=Math.max(0,(1500-elo)/6);let best=null,bv=-1e9;
 for(const m of ms){const v=-nega(E.make(s,m),d-1,-1e9,1e9)+Math.random()*nz;if(v>bv){bv=v;best=m;}}return best;}
const api={pick}; if(typeof module!=='undefined')module.exports=api; else root.QCAI=api;
})(this);
