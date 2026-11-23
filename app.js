(function(){'use strict';
const E=QCEngine,$=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const IC={flip:'M4 8h13l-3-3M20 16H7l3 3',undo:'M9 14 4 9l5-5M4 9h10a6 6 0 0 1 0 12h-3',flag:'M5 21V4M5 4h11l-2 4 2 4H5',eq:'M5 9h14M5 15h14',play:'M7 4l13 8-13 8z',x:'M6 6l12 12M18 6 6 18',plus:'M12 5v14M5 12h14',menu:'M4 7h16M4 12h16M4 17h16',home:'M4 11 12 4l8 7v9H4zM10 20v-6h4v6',book:'M4 5h6a2 2 0 0 1 2 2v12a2 2 0 0 0-2-2H4zM20 5h-6a2 2 0 0 0-2 2v12a2 2 0 0 1 2-2h6z',swords:'M5 5l10 10M19 5 9 15M12 18l3 3M6 12l3 3M4 4h3M20 4h-3',puzzle:'M10 4a2 2 0 1 1 4 0v2h4v4h-2a2 2 0 1 0 0 4h2v4H6v-4h2a2 2 0 1 0 0-4H6V6h4z',lock:'M6 11h12v9H6zM8 11V8a4 4 0 0 1 8 0v3',target:'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z',history:'M4 12a8 8 0 1 0 3-6.2M4 4v4h4M12 8v4l3 2',sliders:'M4 7h9M17 7h3M4 17h3M11 17h9M15 5v4M9 15v4',users:'M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM3 20a6 6 0 0 1 12 0M16 11a3 3 0 0 0 0-6M17 14a6 6 0 0 1 4 6',back:'M15 5l-7 7 7 7',next:'M9 5l7 7-7 7',first:'M6 5v14M18 5l-8 7 8 7',last:'M18 5v14M6 5l8 7-8 7',dl:'M12 4v11M7 11l5 5 5-5M5 20h14',trash:'M5 7h14M9 7V4h6v3M7 7l1 13h8l1-13'};
const ic=n=>`<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="${IC[n]}"/></svg>`;
$$('[data-ic]').forEach(b=>b.insertAdjacentHTML('afterbegin',ic(b.dataset.ic)));
const TH=[['セージ','#e9ede4','#8c9f88','#6d826b'],['グラファイト','#e8e8e8','#9a9a9e','#55575c'],['サンド','#efe4d3','#b79a7a','#8c6d46'],['ダスク','#e3e7f1','#8a9ab2','#5f7090']];
let S={elo:540,th:2,snd:1,vol:.5};try{Object.assign(S,JSON.parse(localStorage.getItem('qc1')||'{}'))}catch(e){}
const save=()=>{try{localStorage.setItem('qc1',JSON.stringify(S))}catch(e){}};
function theme(){const t=TH[S.th];const r=document.documentElement.style;r.setProperty('--li',t[1]);r.setProperty('--da',t[2]);r.setProperty('--ac',t[3]);}
/* sound */
let ac;const files={};
function tone(f,d,ty,v,t0,sl){if(!S.snd)return;ac=ac||new(window.AudioContext||window.webkitAudioContext)();const o=ac.createOscillator(),g=ac.createGain(),t=ac.currentTime+(t0||0);o.type=ty;o.frequency.setValueAtTime(f,t);if(sl)o.frequency.exponentialRampToValueAtTime(sl,t+d);g.gain.setValueAtTime(v*S.vol,t);g.gain.exponentialRampToValueAtTime(1e-4,t+d);o.connect(g);g.connect(ac.destination);o.start(t);o.stop(t+d);}
const SFX={move:()=>tone(180,.12,'triangle',.6,0,90),capture:()=>{tone(150,.16,'triangle',.8,0,60);tone(900,.04,'square',.1)},check:()=>{tone(660,.1,'sine',.35);tone(880,.14,'sine',.35,.1)},end:()=>{tone(523,.2,'sine',.35);tone(392,.3,'sine',.35,.18)},click:()=>tone(520,.05,'sine',.2),warn:()=>tone(300,.15,'sawtooth',.18)};
function load(n,i){i=i||0;const ex=['mp3','ogg','wav'];if(i>2)return;const a=new Audio('sounds/'+n+'.'+ex[i]);a.addEventListener('canplaythrough',()=>files[n]=a,{once:true});a.addEventListener('error',()=>load(n,i+1),{once:true});a.load();}
['move','capture','check','end','click'].forEach(n=>load(n));
function play(n){if(!S.snd)return;const a=files[n];if(a){const c=a.cloneNode();c.volume=S.vol;c.play().catch(()=>{});}else SFX[n]&&SFX[n]();}
document.addEventListener('click',e=>{const b=e.target.closest('button');if(b&&!b.hasAttribute('data-ownsfx'))play('click');});
/* Stockfish (optional: used if stockfish-19-lite-single.js sits next to index.html) */
let sf=null,sfOK=false,sfCb=null;
try{sf=new Worker('stockfish-19-lite-single.js');sf.onerror=()=>{sf=null;sfOK=false};sf.onmessage=e=>{const d=String(e.data);if(d==='uciok')sfOK=true;if(/^bestmove/.test(d)&&sfCb){const c=sfCb;sfCb=null;c(d.split(' ')[1]);}};sf.postMessage('uci');}catch(e){sf=null;}
function askSF(s,elo,cb){const t=setTimeout(()=>{sfCb=null;cb(null)},6000);sfCb=u=>{clearTimeout(t);cb(E.fromUci(s,u))};sf.postMessage('setoption name UCI_LimitStrength value true');sf.postMessage('setoption name UCI_Elo value '+Math.min(3190,elo));sf.postMessage('position fen '+E.toFEN(s));sf.postMessage('go movetime 500');}
/* game */
let g=null;const cur=()=>g.st[g.st.length-1],isW=p=>p<'a';
const key=s=>E.toFEN(s).split(' ').slice(0,3).join(' ');
const PS={
p:'<circle cx="22.5" cy="13.5" r="5.3"/><path d="M19.2 18.2h6.6l-1 3.2c3.3 2 5.6 6.4 5.6 12.1H14.6c0-5.7 2.3-10.1 5.6-12.1z"/><rect x="12.5" y="33.5" width="20" height="4.5" rx="1.8"/>',
r:'<path d="M15 33.5l1-14h13l1 14z"/><path d="M12.5 20v-9h4.5v3h3v-3h5v3h3v-3h4.5v9z"/><rect x="12" y="33.5" width="21" height="4.5" rx="1.8"/>',
b:'<path d="M16.5 33.5c0-5 2-8 3.2-10.4-2.6-2-4-4.8-4-7.6 0-4.5 3.3-8 7-9.5 3.7 1.5 7 5 7 9.5 0 2.8-1.4 5.6-4 7.6 1.2 2.4 3.2 5.4 3.2 10.4z"/><circle cx="22.7" cy="5" r="2"/><path class="d" d="M20.2 15l4.8 4.8"/><rect x="12.5" y="33.5" width="20" height="4.5" rx="1.8"/>',
n:'<path d="M13.5 37.5c0-7 3-9.5 5.5-13 1.5-2.2 1-3.5 0-4.5l-4 2.5c-1 .6-2.5 0-2.5-1.5 0-1.2.8-2.2 1.8-3 2-1.8 4.2-5.5 6-8 1-1.5 2-2.2 3.2-2.4V5.5l2 1.8c5.5 1.5 11 6 11 14.2v16z"/><circle class="e" cx="21.5" cy="14.5" r="1.3"/><circle class="e" cx="14.5" cy="19.6" r=".9"/><rect x="12" y="34" width="24.5" height="4.2" rx="1.8"/>',
q:'<path d="M14 34L12.5 16L16 23.5L17.5 12.5L20.2 23L22.5 10.5L24.8 23L27.5 12.5L29 23.5L32.5 16L31 34Z"/><circle cx="12.5" cy="15" r="1.7"/><circle cx="17.5" cy="11.5" r="1.7"/><circle cx="22.5" cy="9.5" r="1.7"/><circle cx="27.5" cy="11.5" r="1.7"/><circle cx="32.5" cy="15" r="1.7"/><rect x="12" y="33.5" width="21" height="4.5" rx="1.8"/>',
k:'<path d="M14 34c-1-6 0-9 3-12-2-2-3.5-4.5-3.5-7.5 0-3 2.5-5.5 5.5-5.5h5c3 0 5.5 2.5 5.5 5.5 0 3-1.5 5.5-3.5 7.5 3 3 4 6 3 12z"/><path d="M20.9 9.2V7H18.4V4.4h2.5V1.3h3.2v3.1h2.5V7h-2.5v2.2z"/><rect x="12" y="33.5" width="21" height="4.5" rx="1.8"/>'};
const pcs=p=>`<svg viewBox="0 0 45 45" aria-hidden="true">${PS[p.toLowerCase()]}</svg>`;

function rep(){const k=key(cur());g.reps[k]=(g.reps[k]||0)+1;return g.reps[k];}
function newGame(mode,hc,elo){g={mode,hc,elo,st:[E.fromFEN(E.START)],sans:[],reps:{},over:'',sel:-1,flip:hc==='b',busy:false};rep();show('game');render();if(mode==='ai'&&cur().t!==hc)aiMove();}
function render(last){
  const s=cur(),ms=g.over?[]:E.legal(s),lm=g.mv&&0,bd=$('#bd');
  const ord=[...Array(64).keys()];if(g.flip)ord.reverse();
  const tg=g.sel>=0?ms.filter(m=>m.from===g.sel):[],lastM=g.last;
  const ks=E.inCheck(s)?s.b.indexOf(s.t==='w'?'K':'k'):-1;
  bd.innerHTML=ord.map(i=>{const p=s.b[i],r=i>>3,f=i&7,t=tg.find(m=>m.to===i);
    const c=['sq',(r+f)%2?'d':'',i===g.sel?'sel':'',lastM&&(lastM.from===i||lastM.to===i)?'ls':'',t?'tg':'',t&&p!=='.'?'cp':'',i===ks?'ck':''].join(' ');
    return `<div class="${c}" data-i="${i}">${p==='.'?'':`<span class="pc ${isW(p)?'w':'b'}">${pcs(p)}</span>`}</div>`}).join('');
  $('#rk').innerHTML=(g.flip?[1,2,3,4,5,6,7,8]:[8,7,6,5,4,3,2,1]).map(n=>`<span>${n}</span>`).join('');
  $('#fl').innerHTML=(g.flip?'hgfedcba':'abcdefgh').split('').map(n=>`<span>${n}</span>`).join('');
  if(last)animMove(bd,g.flip,last,false);
  let msg=g.over||(g.busy?'AIが考えています…':(g.mode==='ai'?'あなたの番です':(s.t==='w'?'白の番です':'黒の番です'))+(E.inCheck(s)?'(王手)':''));
  $('#st').textContent=msg;
  $('#mv').innerHTML=g.sans.map((x,i)=>i%2?`<span>${x}</span>`:`<i>${i/2+1}.</i><span>${x}</span>`).join('');$('#mv').scrollTop=1e5;
  $('#draw').hidden=g.mode!=='local'||!!g.over;$('#res').hidden=!!g.over;$('#undo').disabled=g.busy||g.sans.length<(g.mode==='ai'?(g.hc==='w'?2:3):1)&&true;
  if(g.mode==='ai'&&!g.over&&g.sans.length===0)$('#undo').disabled=true;
}
function doMove(m,na){const s=cur(),cap=s.b[m.to]!=='.'||m.fl==='ep',san=E.san(s,m),ns=E.make(s,m);g.st.push(ns);g.sans.push(san);g.last=m;g.sel=-1;
  const n=rep();let r=E.status(ns);if(!r&&n>=3)r='repetition';const ck=E.inCheck(ns);
  if(r)finish(r);render(na?null:m);play(r?'end':ck?'check':cap?'capture':'move');
  if(!r&&g.mode==='ai'&&ns.t!==g.hc)aiMove();}
function finish(r){const s=cur(),W=s.t==='w'?'黒':'白';
  g.over={checkmate:`詰み:${W}の勝ちです`,stalemate:'ステイルメイトで引き分けです',repetition:'同一局面が3回現れ、引き分けです',fifty:'50手ルールで引き分けです',insufficient:'駒が足りず、引き分けです',agreed:'合意により引き分けです'}[r]||r;g.res=r==='checkmate'?(s.t==='w'?'0-1':'1-0'):'1/2-1/2';recordCurrent();}
function aiMove(){g.busy=true;$('#st').textContent='AIが考えています…';$('#undo').disabled=true;const gg=g;setTimeout(()=>{if(g!==gg||g.over)return;const s=cur(),done=m=>{if(g!==gg||g.over)return;g.busy=false;doMove(m||QCAI.pick(s,gg.elo));};
  if(gg.elo>=1320&&sf&&sfOK)askSF(s,gg.elo,done);else done(QCAI.pick(s,gg.elo));},450);}
function slide(bd,flip,f,t){const o=i=>flip?63-i:i,c=bd.children[o(t)],el=c&&c.querySelector('.pc');if(!el)return;el.style.transform=`translate(${((o(f)&7)-(o(t)&7))*100}%,${((o(f)>>3)-(o(t)>>3))*100}%)`;el.offsetWidth;el.classList.add('an');el.style.transform='';}
function animMove(bd,flip,m,rev){slide(bd,flip,rev?m.to:m.from,rev?m.from:m.to);
  if(m.fl==='oo')rev?slide(bd,flip,m.to-1,m.to+1):slide(bd,flip,m.to+1,m.to-1);if(m.fl==='ooo')rev?slide(bd,flip,m.to+1,m.to-2):slide(bd,flip,m.to-2,m.to+1);}
function attach(bd,c){
  const mv=(cand,na)=>{if(cand[0].promo)askPromo(cand,m=>c.move(m,na),c.st().t);else c.move(cand[0],na);};
  bd.onclick=e=>{const q=e.target.closest('.sq');if(!q||!c.ok())return;const i=+q.dataset.i,s=c.st();
    if(c.sel>=0){const cand=E.legal(s).filter(m=>m.from===c.sel&&m.to===i);if(cand.length)return mv(cand);}
    const p=s.b[i];c.sel=(p!=='.'&&isW(p)===(s.t==='w'))?i:-1;c.paint();};
  bd.onpointerdown=e=>{if(e.button||!c.ok())return;const q=e.target.closest('.sq');if(!q)return;const i=+q.dataset.i,s=c.st(),p=s.b[i];if(p==='.'||isW(p)!==(s.t==='w'))return;
    c.sel=i;c.paint();const cell=[...bd.children].find(x=>+x.dataset.i===i),pc=cell&&cell.querySelector('.pc');if(!pc)return;
    const sz=cell.getBoundingClientRect().width,fs=getComputedStyle(pc).fontSize,x0=e.clientX,y0=e.clientY;let gh=null;
    const mvf=ev=>{if(!gh){if(Math.hypot(ev.clientX-x0,ev.clientY-y0)<6)return;gh=pc.cloneNode(true);gh.className=pc.className+' gh';gh.style.fontSize=fs;gh.style.width=sz+'px';gh.style.height=sz+'px';document.body.appendChild(gh);pc.style.opacity='.3';}
      gh.style.left=ev.clientX-sz/2+'px';gh.style.top=ev.clientY-sz/2+'px';};
    const up=ev=>{removeEventListener('pointermove',mvf);removeEventListener('pointerup',up);removeEventListener('pointercancel',up);if(!gh)return;gh.remove();
      const t=document.elementFromPoint(ev.clientX,ev.clientY),tq=t&&t.closest('.sq'),cand=tq&&bd.contains(tq)?E.legal(s).filter(m=>m.from===i&&m.to===+tq.dataset.i):[];
      if(cand.length){c.sel=-1;mv(cand,true);}else c.paint();};
    addEventListener('pointermove',mvf);addEventListener('pointerup',up);addEventListener('pointercancel',up);};}
function askPromo(c,cb,t){const pp=$('#pp');pp.innerHTML=c.map(m=>`<button data-p="${m.promo}"><span class="pc ${t==='w'?'w':'b'}">${pcs(m.promo)}</span></button>`).join('');$('#pm').showModal();
  pp.onclick=e=>{const b=e.target.closest('button');if(!b)return;$('#pm').close();cb(c.find(m=>m.promo===b.dataset.p));};}
attach($('#bd'),{ok:()=>g&&!g.over&&!g.busy&&(g.mode!=='ai'||cur().t===g.hc),st:()=>cur(),get sel(){return g.sel},set sel(v){g.sel=v},paint:()=>render(),move:(m,na)=>doMove(m,na)});
function ask(msg,cb){$('#cft').textContent=msg;const o=$('#cfo');o.className='dg';$('#cf').showModal();play('warn');o.onclick=()=>{$('#cf').close();cb();};}
$$('dialog .x').forEach(b=>b.onclick=()=>b.closest('dialog').close());
$('#flip').onclick=()=>{g.flip=!g.flip;render();};
$('#undo').onclick=()=>{if(g.busy||!g.sans.length)return;let n=1;if(g.mode==='ai'&&cur().t===g.hc)n=2;if(g.mode==='ai'&&g.over)n=cur().t===g.hc?2:1;
  for(let i=0;i<n&&g.sans.length;i++){const k=key(cur());g.reps[k]--;g.st.pop();g.sans.pop();}g.over='';g.last=null;g.sel=-1;render();if(g.mode==='ai'&&cur().t!==g.hc)aiMove();};
$('#res').onclick=()=>ask('投了しますか?',()=>{const s=cur(),loser=g.mode==='ai'?g.hc:s.t;g.res=loser==='w'?'0-1':'1-0';g.over=`投了:${loser==='w'?'黒':'白'}の勝ちです`;recordCurrent();play('end');render();});
$('#draw').onclick=()=>ask('引き分けを提案し、合意しますか?(一台対局のため、相手の承諾をこの場で確認してください)',()=>{finish('agreed');play('end');render();});
$('#new').onclick=()=>{const m=g.mode==='ai'?'ai':'priv',go=()=>{recordCurrent();g=null;show(m);};if(!g.over)ask('いまの対局を終えて、設定画面に戻りますか?',go);else go();};
/* panels */
const TT={home:'ホーム',train:'トレーニング',ai:'AI対局',tact:'タクティクス問題',priv:'プライベート対局',map:'学習マップ',rec:'対局の記録',set:'カスタマイズ'};
const SOON={train:'基本的な駒損の確認と、コーチによる一手ごとの解説を用意します。',tact:'難度の範囲を決めて、問題数・時間・ライフで解くセッションを用意します。',map:'テクニックを一つずつ、盤面で学べるマップを用意します。'};
function show(id){const pid=SOON[id]?'soon':id;$$('.pnl').forEach(p=>p.hidden=p.id!=='p-'+pid);const nav=id==='game'?(g.mode==='ai'?'ai':'priv'):id==='rev'?'rec':id;
 $$('.nv').forEach(b=>b.classList.toggle('on',b.dataset.tab===nav));$('#crumb').textContent=TT[nav];if(SOON[id]){$('#sn').textContent=TT[id];$('#sd').textContent=SOON[id];}
 if(id==='rec')listUI();$('#back').hidden=!g||id==='game'||id==='rev';$('.side').classList.remove('open');scrollTo(0,0);}
$$('.nv').forEach(b=>b.onclick=()=>show(b.dataset.tab));$$('[data-go]').forEach(b=>b.onclick=()=>show(b.dataset.go));$('#back').onclick=()=>show('game');$('#mb').onclick=e=>{e.stopPropagation();$('.side').classList.toggle('open');};document.addEventListener('click',e=>{if(!e.target.closest('.side'))$('.side').classList.remove('open');});
$$('.pt').forEach(b=>b.onclick=()=>{$$('.pt').forEach(x=>x.classList.toggle('on',x===b));$('#pt-local').hidden=b.dataset.pt!=='local';$('#pt-online').hidden=b.dataset.pt!=='online';});
const LV=[['Sweet','ゆったり',-70],['Easy','やさしく',-30],['Normal','いつもどおり',0],['Hard','少し挑戦',30],['Bitter','しっかり挑戦',70],['Custom','自分で決める',null]];
let lv=2;
function lvUI(){$('#lv').innerHTML=LV.map((l,i)=>`<button class="${i===lv?'on':''}" data-l="${i}" title="${l[2]===null?'相手のEloを自分で決めます':'相手の目標Eloが、あなたより '+(l[2]>0?'+':'')+l[2]+' です'}"><b>${l[0]}</b><small>${l[1]}</small><small>${l[2]===null?'自由に設定':(l[2]>0?'+':'')+l[2]+' Elo'}</small></button>`).join('');
  $('#cu').hidden=lv!==5;const t=lv===5?+$('#celo').value:S.elo+LV[lv][2];$('#lvd').textContent='相手の目標:'+Math.max(100,t)+' Elo(暫定AI。序盤の定跡は未実装です)';}
$('#lv').onclick=e=>{const b=e.target.closest('button');if(!b)return;lv=+b.dataset.l;lvUI();};$('#celo').oninput=lvUI;
$('#elo').value=S.elo;$('#elo').oninput=()=>{S.elo=Math.min(3000,Math.max(100,+$('#elo').value||540));save();lvUI();};
$('#go').onclick=()=>{const hc=$('#col').value==='r'?(Math.random()<.5?'w':'b'):$('#col').value;const t=lv===5?+$('#celo').value:S.elo+LV[lv][2];newGame('ai',hc,Math.min(3000,Math.max(100,t||600)));};
$('#golocal').onclick=()=>newGame('local',null,0);
$('#th').innerHTML=TH.map((t,i)=>`<button data-t="${i}"><span style="display:inline-block;width:28px;height:28px;border-radius:6px;background:linear-gradient(135deg,${t[1]} 50%,${t[2]} 50%)"></span>${t[0]}</button>`).join('');
function thUI(){$$('#th button').forEach(b=>b.classList.toggle('on',+b.dataset.t===S.th));theme();}
$('#th').onclick=e=>{const b=e.target.closest('button');if(!b)return;S.th=+b.dataset.t;save();thUI();if(g)render();};
$('#snd').checked=!!S.snd;$('#snd').onchange=()=>{S.snd=$('#snd').checked?1:0;save();};$('#vol').value=S.vol;$('#vol').oninput=()=>{S.vol=+$('#vol').value;save();};
$('#vol').onchange=()=>play('move');
/* records & review */
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const GK='qcg1';let GS=[];try{GS=JSON.parse(localStorage.getItem(GK)||'[]')}catch(e){}
const saveG=()=>{try{localStorage.setItem(GK,JSON.stringify(GS.slice(0,60)))}catch(e){}};
function recordCurrent(){if(!g||!g.sans.length||g.saved)return;g.saved=1;const ai=g.mode==='ai';GS.unshift({id:Date.now(),date:new Date().toISOString().slice(0,10),mode:g.mode,title:g.over||'中断',res:g.res||'*',sans:g.sans.slice(),white:ai?(g.hc==='w'?'あなた':'Quiet AI '+g.elo):'白',black:ai?(g.hc==='b'?'あなた':'Quiet AI '+g.elo):'黒'});saveG();}
function listUI(){$('#gl').innerHTML=GS.length?GS.map(r=>`<div class="card gl"><div><b>${esc(r.title)}</b><br><small>${{ai:'AI対局',local:'一台対局',pgn:'読込棋譜'}[r.mode]||''} · ${esc(r.date)} · ${r.sans.length}手</small></div><span class="sp"></span><button data-v="${r.id}" data-ic="play">振り返る</button><button class="dg" data-d="${r.id}" data-ic="trash">削除</button></div>`).join(''):'<div class="card">まだ記録がありません。対局を終えると、ここに保存されます。</div>';
  $$('#gl [data-ic]').forEach(b=>b.insertAdjacentHTML('afterbegin',ic(b.dataset.ic)));}
$('#gl').onclick=e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.v)openRev(+b.dataset.v);if(b.dataset.d)ask('この記録を削除しますか?(元に戻せません)',()=>{GS=GS.filter(x=>x.id!==+b.dataset.d);saveG();listUI();});};
$('#impb').onclick=()=>{$('#ie').textContent='';$('#imp').showModal();};
$('#pf').onchange=()=>{const f=$('#pf').files[0];if(f){const r=new FileReader();r.onload=()=>{$('#pt').value=r.result;};r.readAsText(f);}};
$('#pgo').onclick=()=>{try{const p=QCPGN.parse($('#pt').value);GS.unshift({id:Date.now(),date:p.date||new Date().toISOString().slice(0,10),mode:'pgn',title:p.white+' vs '+p.black,res:p.result,sans:p.sans,white:p.white,black:p.black});saveG();$('#imp').close();$('#pt').value='';listUI();}catch(e){$('#ie').textContent=e.message;}};
const BG={brilliant:['!!','#2f8f83','Brilliant!!・妙手'],great:['!','#5b7db1','Great!・重要手'],good:['!','#6a9a4a','好手'],inacc:['?!','#b8964a','疑問手'],mistake:['?','#cc8a3f','悪手'],blunder:['??','#c0443a','大きな見落とし']};
let rv=null;
function openRev(id){const r=GS.find(x=>x.id===id);if(!r)return;let p;try{p=QCPGN.parse(QCPGN.toPGN(r));}catch(e){return;}
  rv={r,st:p.states,mv:p.moves,i:p.moves.length,an:r.an||null,flip:r.mode==='ai'&&r.black==='あなた',sel:-1};$('#rvt').textContent=r.title;show('rev');if(rv.an)revUI();else runAN();}
function anFail(){if(!rv)return;rv.fail=1;$('#ld').hidden=true;revUI();}
function runAN(){const me=rv;$('#ld').hidden=false;$('#pgb').value=0;$('#lp').textContent='0%';revUI();let w,ok=false;
  try{w=new Worker('stockfish-19-lite-single.js');}catch(e){return anFail();}
  const dead=()=>{if(rv===me&&!me.an){w.terminate();anFail();}};w.onerror=dead;setTimeout(()=>{if(!ok)dead();},10000);
  const eng=QCAN.uciEngine({send:s=>w.postMessage(s),onLine:f=>{w.onmessage=e=>String(e.data).split('\n').forEach(l=>f(l.trim()));},close:()=>w.terminate()});
  QCAN.analyze(rv.st,rv.mv,eng,{depth:12,onProgress:p=>{ok=true;if(rv===me){$('#pgb').value=p;$('#lp').textContent=Math.round(p*100)+'%';}}})
   .then(an=>{w.terminate();me.an=an;me.r.an=an;saveG();if(rv===me){$('#ld').hidden=true;revUI();}}).catch(()=>{w.terminate();if(rv===me)anFail();});}
function cmText(an){if(!an)return'';const b=BG[an.cls];return(b?b[2]+'。':an.cls==='forced'?'唯一の合法手です。':'')+(an.cls==='brilliant'?'駒を犠牲にしても形勢を保つ、最善級の手です。':an.cls==='great'?'この局面で、ほぼ唯一の良い手でした。':['inacc','mistake','blunder'].includes(an.cls)?`最善は ${an.bestSan} でした。勝率の見積もりが約${an.loss}%下がりました。`:an.loss===0?'最善手です。':'')+'(有限の探索による目安です)';}
function bhtml(s,flip,last,an,sel,tg){const ord=[...Array(64).keys()];if(flip)ord.reverse();
  return ord.map(i=>{const p=s.b[i],r=i>>3,f=i&7,t=tg&&tg.find(m=>m.to===i),b=an&&last&&i===last.to&&BG[an.cls]&&an.cls!=='good'?BG[an.cls]:null;
   return `<div class="sq ${(r+f)%2?'d':''} ${last&&(last.from===i||last.to===i)?'ls':''} ${i===sel?'sel':''} ${t?'tg':''} ${t&&p!=='.'?'cp':''}" data-i="${i}">${p==='.'?'':`<span class="pc ${isW(p)?'w':'b'}">${pcs(p)}</span>`}${b?`<span class="bg" style="background:${b[1]}">${b[0]}</span>`:''}</div>`;}).join('');}
function revUI(anim){if(!rv)return;const V=rv.v,s=V?V.st[V.st.length-1]:rv.st[rv.i],n=rv.mv.length,last=V?(V.mv.length?V.mv[V.mv.length-1]:null):(rv.i?rv.mv[rv.i-1]:null),an=V?V.an[V.an.length-1]:(rv.an&&rv.an[rv.i-1]);
  const tg=rv.sel>=0?E.legal(s).filter(m=>m.from===rv.sel):[];
  $('#rbd').innerHTML=bhtml(s,rv.flip,last,an,rv.sel,tg);$('#rrk').innerHTML=(rv.flip?[1,2,3,4,5,6,7,8]:[8,7,6,5,4,3,2,1]).map(x=>`<span>${x}</span>`).join('');$('#rfl').innerHTML=(rv.flip?'hgfedcba':'abcdefgh').split('').map(x=>`<span>${x}</span>`).join('');
  if(anim)animMove($('#rbd'),rv.flip,anim.m,anim.rev);
  $('#rvx').hidden=!V;$('#rs').max=n;$('#rs').value=rv.i;
  $('#rn').textContent=V?`${rv.i}手目から変化を確認中`:`${rv.i} / ${n} 手`+(rv.i?`(${rv.i%2?'白':'黒'}:${rv.r.sans[rv.i-1]})`:'');
  if(V)$('#cm').textContent='変化: '+V.sans.map((x,k)=>{const p=rv.i+k;return(p%2===0?(p/2+1)+'. ':(k===0?(Math.ceil(p/2))+'... ':''))+x;}).join(' ')+'。'+(an?cmText(an):rv.eb?'評価にはStockfishが必要です。':'評価中…');
  else $('#cm').textContent=an?cmText(an):rv.fail?'解析できませんでした(Stockfishを読み込めません)。判定なしで手順を確認できます。':'';
  if(rv.an){const rows=['brilliant','great','good','inacc','mistake','blunder'].map(c=>`<tr><td><span class="dot" style="background:${BG[c][1]}">${BG[c][0]}</span>${BG[c][2]}</td><td>${rv.an.filter((x,i)=>i%2===0&&x.cls===c).length}</td><td>${rv.an.filter((x,i)=>i%2===1&&x.cls===c).length}</td></tr>`).join('');$('#sum').innerHTML=`<table class="sm"><tr><th>判定</th><th>白</th><th>黒</th></tr>${rows}</table>`;}else $('#sum').innerHTML='';
  $('#rmv').innerHTML=rv.r.sans.map((x,i)=>{const c=rv.an&&rv.an[i],b=c&&BG[c.cls]&&c.cls!=='good'?BG[c.cls]:null,t=`<span data-i="${i+1}" class="${!V&&i+1===rv.i?'on':''}">${x}${b?` <b style="color:${b[1]}">${b[0]}</b>`:''}</span>`;return i%2?t:`<i>${i/2+1}.</i>${t}`;}).join('');}
function rgo(i){if(!rv)return;i=Math.max(0,Math.min(rv.mv.length,i));const old=rv.i,hadV=!!rv.v;rv.v=null;rv.sel=-1;rv.i=i;
  const an=!hadV&&i===old+1?{m:rv.mv[old],rev:false}:!hadV&&i===old-1?{m:rv.mv[i],rev:true}:null;revUI(an);
  const m=i?rv.mv[i-1]:null;if(m&&i!==old)play(rv.st[i-1].b[m.to]!=='.'||m.fl==='ep'?'capture':'move');}
let vw=null,ve=null;
function vEng(){if(ve)return Promise.resolve(ve);return new Promise((res,rej)=>{try{vw=new Worker('stockfish-19-lite-single.js');}catch(e){return rej(e);}vw.onerror=()=>{ve=null;rej(new Error('x'));};
  ve=QCAN.uciEngine({send:s=>vw.postMessage(s),onLine:f=>{vw.onmessage=e=>String(e.data).split('\n').forEach(l=>f(l.trim()));}});res(ve);});}
function rvMove(m,na){const o=rv;if(!o.v)o.v={st:[o.st[o.i]],mv:[],sans:[],an:[]};const v=o.v,s=v.st[v.st.length-1],cap=s.b[m.to]!=='.'||m.fl==='ep';
  v.sans.push(E.san(s,m));v.mv.push(m);v.st.push(E.make(s,m));v.an.push(null);o.sel=-1;revUI(na?null:{m,rev:false});play(cap?'capture':'move');
  const k=v.mv.length-1,s0=v.st[k],s1=v.st[k+1];
  o.q=(o.q||Promise.resolve()).then(()=>vEng().then(eng=>Promise.race([QCAN.analyze([s0,s1],[m],eng,{depth:12}),new Promise((_,rj)=>setTimeout(rj,25000))])))
   .then(r=>{v.an[k]=r[0];if(rv===o&&o.v===v)revUI();}).catch(()=>{o.eb=1;if(rv===o&&o.v===v)revUI();});}
attach($('#rbd'),{ok:()=>rv&&$('#ld').hidden,st:()=>rv.v?rv.v.st[rv.v.st.length-1]:rv.st[rv.i],get sel(){return rv.sel},set sel(v){rv.sel=v},paint:()=>revUI(),move:(m,na)=>rvMove(m,na)});
$('#rvx').onclick=()=>{rv.v=null;rv.sel=-1;revUI();};
$('#r0').onclick=()=>rgo(0);$('#r1').onclick=()=>rgo(rv.i-1);$('#r2').onclick=()=>rgo(rv.i+1);$('#r3').onclick=()=>rgo(1e3);$('#rs').oninput=()=>rgo(+$('#rs').value);
$('#rmv').onclick=e=>{const t=e.target.closest('span');if(t)rgo(+t.dataset.i);};$('#rfp').onclick=()=>{rv.flip=!rv.flip;revUI();};
$('#rvb').onclick=()=>{rv=null;if(vw){vw.terminate();vw=ve=null;}show('rec');};
$('#rdl').onclick=()=>{const r=rv.r,u=URL.createObjectURL(new Blob([QCPGN.toPGN({sans:r.sans,result:r.res,white:r.white,black:r.black,date:r.date})],{type:'application/x-chess-pgn'})),l=document.createElement('a');l.href=u;l.download='quietchess_'+r.date+'.pgn';l.click();setTimeout(()=>URL.revokeObjectURL(u),1000);};
document.addEventListener('keydown',e=>{if(!rv||$('#p-rev').hidden)return;if(e.key==='ArrowLeft')rgo(rv.i-1);if(e.key==='ArrowRight')rgo(rv.i+1);});
thUI();lvUI();show('home');
})();
