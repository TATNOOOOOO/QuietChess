/* QuietChess network layer: one tiny Realtime-Database-like API, two backends (Firebase / local mock for tests). */
(function(root){'use strict';
function mock(){const K='qcmock';let uid=sessionStorage.getItem('qcuid');if(!uid){uid='u'+Math.random().toString(36).slice(2,10);sessionStorage.setItem('qcuid',uid);}
  const rd=()=>{try{return JSON.parse(localStorage.getItem(K)||'{}')}catch(e){return{}}},seg=p=>p.split('/').filter(Boolean);
  const sv=v=>v&&typeof v==='object'?(v['.sv']==='timestamp'?Date.now():Array.isArray(v)?v.map(sv):Object.fromEntries(Object.entries(v).map(([k,x])=>[k,sv(x)]))):v;
  const getp=(o,p)=>seg(p).reduce((a,k)=>a==null?null:(a[k]===undefined?null:a[k]),o);
  const prune=o=>{if(o&&typeof o==='object')for(const k of Object.keys(o)){o[k]=prune(o[k]);if(o[k]===null||o[k]===undefined||(typeof o[k]==='object'&&!Object.keys(o[k]).length))delete o[k];}return o;};
  function setp(o,p,v){const s=seg(p);if(!s.length)return v==null?{}:v;let a=o;for(let i=0;i<s.length-1;i++){if(a[s[i]]==null||typeof a[s[i]]!=='object')a[s[i]]={};a=a[s[i]];}const k=s[s.length-1];if(v==null)delete a[k];else a[k]=v;return o;}
  const L=[],notify=()=>L.slice().forEach(l=>{const v=getp(rd(),l.p),j=JSON.stringify(v);if(j!==l.j){l.j=j;l.cb(v==null?null:JSON.parse(j));}});
  addEventListener('storage',e=>{if(e.key===K)notify();});
  const lock=f=>navigator.locks?navigator.locks.request('qcmock',()=>f()):Promise.resolve().then(f),save=o=>{localStorage.setItem(K,JSON.stringify(prune(o)));notify();},cp=v=>v==null?null:JSON.parse(JSON.stringify(v));
  return{uid,now:()=>Date.now(),off:()=>0,get:async p=>cp(getp(rd(),p)),set:(p,v)=>lock(()=>{save(setp(rd(),p,sv(v)));}),
    update:(p,u)=>lock(()=>{const o=rd();for(const k in u)setp(o,p+'/'+k,sv(u[k]));save(o);}),remove:p=>lock(()=>{save(setp(rd(),p,null));}),
    tx:(p,fn)=>lock(()=>{const o=rd(),cur=getp(o,p),r=fn(cp(cur));if(r===undefined)return{committed:false,value:cp(cur)};save(setp(o,p,sv(r)));return{committed:true,value:cp(r)};}),
    on:(p,cb)=>{const l={p,cb,j:undefined};L.push(l);setTimeout(()=>{const v=getp(rd(),p);l.j=JSON.stringify(v);cb(cp(v));},0);return()=>{const i=L.indexOf(l);if(i>=0)L.splice(i,1);};}};}
async function firebase(cfg){const V='10.12.2',B='https://www.gstatic.com/firebasejs/'+V+'/';
  const [A,D,AU]=await Promise.all([import(B+'firebase-app.js'),import(B+'firebase-database.js'),import(B+'firebase-auth.js')]);
  const app=A.initializeApp(cfg),db=D.getDatabase(app),au=AU.getAuth(app);
  await new Promise((res,rej)=>{const u=AU.onAuthStateChanged(au,x=>{if(x){u();res();}});AU.signInAnonymously(au).catch(rej);});
  let off=0;D.onValue(D.ref(db,'.info/serverTimeOffset'),s=>{off=s.val()||0;});
  return{uid:au.currentUser.uid,now:()=>Date.now()+off,off:()=>off,get:p=>D.get(D.ref(db,p)).then(s=>s.val()),set:(p,v)=>D.set(D.ref(db,p),v),update:(p,o)=>D.update(D.ref(db,p),o),remove:p=>D.remove(D.ref(db,p)),
    tx:(p,fn)=>D.runTransaction(D.ref(db,p),fn).then(r=>({committed:r.committed,value:r.snapshot.val()})),on:(p,cb)=>D.onValue(D.ref(db,p),s=>cb(s.val()))};}
const api={connect:o=>o.mock?Promise.resolve(mock()):firebase(o.cfg)};if(typeof module!=='undefined')module.exports=api;else root.QCNet=api;})(this);
