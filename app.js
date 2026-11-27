(function(){'use strict';
const E=QCEngine,$=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const IC={flip:'M4 8h13l-3-3M20 16H7l3 3',undo:'M9 14 4 9l5-5M4 9h10a6 6 0 0 1 0 12h-3',flag:'M5 21V4M5 4h11l-2 4 2 4H5',eq:'M5 9h14M5 15h14',play:'M7 4l13 8-13 8z',x:'M6 6l12 12M18 6 6 18',plus:'M12 5v14M5 12h14',menu:'M4 7h16M4 12h16M4 17h16',home:'M4 11 12 4l8 7v9H4zM10 20v-6h4v6',book:'M4 5h6a2 2 0 0 1 2 2v12a2 2 0 0 0-2-2H4zM20 5h-6a2 2 0 0 0-2 2v12a2 2 0 0 1 2-2h6z',swords:'M5 5l10 10M19 5 9 15M12 18l3 3M6 12l3 3M4 4h3M20 4h-3',puzzle:'M10 4a2 2 0 1 1 4 0v2h4v4h-2a2 2 0 1 0 0 4h2v4H6v-4h2a2 2 0 1 0 0-4H6V6h4z',lock:'M6 11h12v9H6zM8 11V8a4 4 0 0 1 8 0v3',target:'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z',history:'M4 12a8 8 0 1 0 3-6.2M4 4v4h4M12 8v4l3 2',sliders:'M4 7h9M17 7h3M4 17h3M11 17h9M15 5v4M9 15v4',users:'M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM3 20a6 6 0 0 1 12 0M16 11a3 3 0 0 0 0-6M17 14a6 6 0 0 1 4 6',back:'M15 5l-7 7 7 7',next:'M9 5l7 7-7 7',first:'M6 5v14M18 5l-8 7 8 7',last:'M18 5v14M6 5l8 7-8 7',dl:'M12 4v11M7 11l5 5 5-5M5 20h14',trash:'M5 7h14M9 7V4h6v3M7 7l1 13h8l1-13'};
const ic=n=>`<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="${IC[n]}"/></svg>`;
$$('[data-ic]').forEach(b=>b.insertAdjacentHTML('afterbegin',ic(b.dataset.ic)));
const TH=[['セージ','#e9ede4','#8c9f88','#6d826b'],['グラファイト','#e8e8e8','#9a9a9e','#55575c'],['サンド','#efe4d3','#b79a7a','#8c6d46'],['ダスク','#e3e7f1','#8a9ab2','#5f7090']];
const eloTxtF=()=>S.meas?String(S.elo):'?';
let S={elo:800,th:2,snd:1,vol:.5,meas:0};try{Object.assign(S,JSON.parse(localStorage.getItem('qc1')||'{}'))}catch(e){}if(!S.meas&&S.elo===540)S.elo=800;
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
let sf=null,sfOK=false,sfCb=null,sfInfo=null;
try{sf=new Worker('stockfish-19-lite-single.js');sf.onerror=()=>{sf=null;sfOK=false};sf.onmessage=e=>{const d=String(e.data);if(d==='uciok')sfOK=true;if(sfInfo&&d.startsWith('info')&&/ multipv \d/.test(d)&&/ depth 6 /.test(d)){const mp=+d.match(/multipv (\d+)/)[1],m=d.match(/score (cp|mate) (-?\d+)/),pv=d.match(/ pv (\S+)/);if(m&&pv)sfInfo[mp]={sc:m[1]==='mate'?Math.sign(+m[2])*10000:+m[2],u:pv[1]};}if(/^bestmove/.test(d)&&sfCb){const c=sfCb;sfCb=null;c(d.split(' ')[1]);}};sf.postMessage('uci');}catch(e){sf=null;}
function askSF(s,elo,cb){const t=setTimeout(()=>{sfCb=null;cb(null)},6000);sfCb=u=>{clearTimeout(t);cb(E.fromUci(s,u))};sf.postMessage('setoption name MultiPV value 1');sf.postMessage('setoption name UCI_LimitStrength value true');sf.postMessage('setoption name UCI_Elo value '+Math.min(3190,elo));sf.postMessage('position fen '+E.toFEN(s));sf.postMessage('go movetime 500');}
function askSample(s,elo,cb){const ms=E.legal(s),d=1320-elo,rp=Math.min(.45,.04+d/1320*.4),T=400+d*.5;
  if(Math.random()<rp){setTimeout(()=>cb(ms[Math.random()*ms.length|0]),0);return;}
  sfInfo={};const t=setTimeout(()=>{sfCb=null;sfInfo=null;cb(null)},6000);
  sfCb=()=>{clearTimeout(t);const c=Object.values(sfInfo||{});sfInfo=null;if(!c.length)return cb(null);const b=Math.max(...c.map(x=>x.sc)),w=c.map(x=>Math.exp((x.sc-b)/T));let r=Math.random()*w.reduce((x,y)=>x+y),i=0;while(r>w[i]&&i<w.length-1){r-=w[i];i++;}cb(E.fromUci(s,c[i].u));};
  sf.postMessage('setoption name UCI_LimitStrength value false');sf.postMessage('setoption name MultiPV value 6');sf.postMessage('position fen '+E.toFEN(s));sf.postMessage('go depth 6');}
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
const pcs=(p,st)=>(st||S.ps)==='letter'?`<span class="lt">${p.toUpperCase()}</span>`:`<svg viewBox="0 0 45 45" aria-hidden="true">${PS[p.toLowerCase()]}</svg>`;

function rep(){const k=key(cur());g.reps[k]=(g.reps[k]||0)+1;return g.reps[k];}
function newGame(mode,hc,elo,tc){g={mode,hc,elo,st:[E.fromFEN(E.START)],sans:[],reps:{},over:'',sel:-1,flip:hc==='b',busy:false,tc:tc&&tc[0]?tc:null,clk:{w:(tc?tc[0]:0)*1000,b:(tc?tc[0]:0)*1000},clkH:[],ts:Date.now()};rep();show('game');render();if(mode==='ai'&&cur().t!==hc)aiMove();}
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
  let msg=g.over||(g.busy?'AIが考えています…':(g.mode==='ai'?'あなたの番です':g.mode==='online'?(s.t===g.hc?'あなたの番です':'相手の番です'):(s.t==='w'?'白の番です':'黒の番です'))+(E.inCheck(s)?'(王手)':''));
  $('#st').textContent=msg;
  $('#mv').innerHTML=g.sans.map((x,i)=>i%2?`<span>${x}</span>`:`<i>${i/2+1}.</i><span>${x}</span>`).join('');$('#mv').scrollTop=1e5;
  $('#draw').hidden=(g.mode!=='local'&&g.mode!=='online')||!!g.over;$('#res').hidden=!!g.over;$('#undo').disabled=g.busy||g.sans.length<(g.mode==='ai'?(g.hc==='w'?2:3):1)&&true;
  if(g.mode==='ai'&&!g.over&&g.sans.length===0)$('#undo').disabled=true;
  $('#ckn').hidden=!(g.chk&&g.over);if(g.chk)$('#undo').disabled=true;$('#ana').hidden=$('#pgn').hidden=!(g.over&&g.sans.length);$('#coach').hidden=!g.train;if(g.train&&g.va&&g.va.ply===g.sans.length)addBadge();clkUI();
}
function doMove(m,na,remote){const s=cur();clkMove(s.t);const cap=s.b[m.to]!=='.'||m.fl==='ep',san=E.san(s,m),ns=E.make(s,m);g.st.push(ns);g.sans.push(san);g.last=m;g.sel=-1;
  const n=rep();let r=E.status(ns);if(!r&&n>=3)r='repetition';const ck=E.inCheck(ns);
  if(r)finish(r);render(na?null:m);play(r?'end':ck?'check':cap?'capture':'move');
  if(g.mode==='online'&&!remote)netPush(m);
  if(!r&&g.mode==='ai'&&ns.t!==g.hc){if(g.train)coachEval(s,m,ns,aiMove);else aiMove();}}
function finish(r){const s=cur(),W=s.t==='w'?'黒':'白';
  g.over={checkmate:`詰み:${W}の勝ちです`,stalemate:'ステイルメイトで引き分けです',repetition:'同一局面が3回現れ、引き分けです',fifty:'50手ルールで引き分けです',insufficient:'駒が足りず、引き分けです',agreed:'合意により引き分けです'}[r]||r;g.res=r==='checkmate'?(s.t==='w'?'0-1':'1-0'):'1/2-1/2';recordCurrent();}
function aiMove(){g.busy=true;$('#st').textContent='AIが考えています…';$('#undo').disabled=true;const gg=g;setTimeout(()=>{if(g!==gg||g.over)return;const s=cur(),done=m=>{if(g!==gg||g.over)return;g.busy=false;doMove(m||QCAI.pick(s,gg.elo));};
  const e=Math.max(100,Math.min(3000,gg.elo+(gg.chk?0:(S.aoff||0)))),bm=bookMove(s,gg,e);if(bm){gg.aiPath='book';done(bm);return;}if(sf&&sfOK){gg.aiPath=e>=1320?'uci':'sample';(e>=1320?askSF:askSample)(s,e,done);}else{gg.aiPath='own';done(QCAI.pick(s,e));}},450);}
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
attach($('#bd'),{ok:()=>g&&!g.over&&!g.busy&&(g.mode==='local'||cur().t===g.hc),st:()=>cur(),get sel(){return g.sel},set sel(v){g.sel=v},paint:()=>render(),move:(m,na)=>doMove(m,na)});
function ask(msg,cb){$('#cft').textContent=msg;const o=$('#cfo');o.className='dg';$('#cf').showModal();play('warn');o.onclick=()=>{$('#cf').close();cb();};}
$$('dialog .x').forEach(b=>b.onclick=()=>b.closest('dialog').close());
$('#flip').onclick=()=>{g.flip=!g.flip;render();};
$('#undo').onclick=()=>{if(g.busy||!g.sans.length)return;if(g.mode==='online'){netOffer('undo');return;}let n=1;if(g.mode==='ai'&&cur().t===g.hc)n=2;if(g.mode==='ai'&&g.over)n=cur().t===g.hc?2:1;
  for(let i=0;i<n&&g.sans.length;i++){const k=key(cur());g.reps[k]--;g.st.pop();g.sans.pop();if(g.clkH&&g.clkH.length)g.clk=g.clkH.pop();}g.ts=Date.now();g.over='';g.last=null;g.sel=-1;render();if(g.mode==='ai'&&cur().t!==g.hc)aiMove();};
$('#res').onclick=()=>ask('投了しますか?',()=>{const s=cur(),loser=(g.mode==='ai'||g.mode==='online')?g.hc:s.t;g.res=loser==='w'?'0-1':'1-0';g.over=`投了:${loser==='w'?'黒':'白'}の勝ちです`;recordCurrent();play('end');render();if(g.mode==='online')netEnd(g.res,g.over);});
$('#draw').onclick=()=>g.mode==='online'?netOffer('draw'):ask('引き分けを提案し、合意しますか?(一台対局のため、相手の承諾をこの場で確認してください)',()=>{finish('agreed');play('end');render();});
$('#new').onclick=()=>{if(g.mode==='online'){show('priv');openOnlineTab();return;}const m=g.mode==='ai'?'ai':'priv',go=()=>{recordCurrent();g=null;show(m);};if(!g.over)ask('いまの対局を終えて、設定画面に戻りますか?',go);else go();};
/* panels */
const TT={chk:'棋力チェック',home:'ホーム',train:'トレーニング',ai:'AI対局',tact:'タクティクス問題',priv:'プライベート対局',map:'学習マップ',rec:'対局の記録',set:'カスタマイズ'};
const SOON={map:'テクニックを一つずつ、盤面で学べるマップを用意します。'};
function show(id){const pid=SOON[id]?'soon':id;$$('.pnl').forEach(p=>p.hidden=p.id!=='p-'+pid);const nav=id==='game'?(g.mode==='ai'?'ai':'priv'):id==='rev'?'rec':(id==='pz'||id==='sr')?'tact':id;if(ss&&!ss.end&&id!=='pz'){clearInterval(ss.tm);ss.end=true;}
 $$('.nv').forEach(b=>b.classList.toggle('on',b.dataset.tab===nav));$('#crumb').textContent=TT[nav];if(SOON[id]){$('#sn').textContent=TT[id];$('#sd').textContent=SOON[id];}
 if(id==='rec')listUI();if(id==='tact')tactUI();if(id==='train')tlUI();if(id==='chk')chkUI();if(id==='set')$('#ckcur').textContent='現在: '+eloTxtF()+' Elo'+(S.meas?(S.man?'(手入力)':'(測定済み)'):'(未測定)')+'。測定しても、学習状況・棋譜は消えません。';if(id==='ai'){$('#elo').value=S.meas?S.elo:'';lvUI();}$('#back').hidden=!g||id==='game'||id==='rev';$('.side').classList.remove('open');scrollTo(0,0);}
$$('.nv').forEach(b=>b.onclick=()=>show(b.dataset.tab));$$('[data-go]').forEach(b=>b.onclick=()=>show(b.dataset.go));$('#back').onclick=()=>show('game');$('#mb').onclick=e=>{e.stopPropagation();$('.side').classList.toggle('open');};document.addEventListener('click',e=>{if(!e.target.closest('.side'))$('.side').classList.remove('open');});
$$('.pt').forEach(b=>b.onclick=()=>{$$('.pt').forEach(x=>x.classList.toggle('on',x===b));$('#pt-local').hidden=b.dataset.pt!=='local';$('#pt-online').hidden=b.dataset.pt!=='online';onlineUI();});
const LV=[['Sweet','ゆったり',-70],['Easy','やさしく',-30],['Normal','いつもどおり',0],['Hard','少し挑戦',30],['Bitter','しっかり挑戦',70],['Custom','自分で決める',null]];
let lv=2;
function lvUI(){$('#lv').innerHTML=LV.map((l,i)=>`<button class="${i===lv?'on':''}" data-l="${i}" title="${l[2]===null?'相手のEloを自分で決めます':'相手の目標Eloが、あなたより '+(l[2]>0?'+':'')+l[2]+' です'}"><b>${l[0]}</b><small>${l[1]}</small><small>${l[2]===null?'自由に設定':(l[2]>0?'+':'')+l[2]+' Elo'}</small></button>`).join('');
  $('#cu').hidden=lv!==5;const t=lv===5?+$('#celo').value:S.elo+LV[lv][2];$('#elom').textContent=S.meas?(S.man?'手入力の値です':'棋力チェックの結果です'):'未測定(?)です。AI相手の強さは、仮に800を基準にしています。';$('#lvd').textContent='相手の目標:'+Math.max(100,t)+' Elo'+(S.meas?'':'(あなたが未測定のため、仮の基準 800 から計算)');}
$('#lv').onclick=e=>{const b=e.target.closest('button');if(!b)return;lv=+b.dataset.l;lvUI();};$('#celo').oninput=lvUI;
$('#elo').value=S.meas?S.elo:'';$('#elo').placeholder='?';$('#elo').oninput=()=>{if($('#elo').value==='')return;S.elo=Math.min(3000,Math.max(100,+$('#elo').value||800));S.meas=1;S.man=1;save();lvUI();};
$('#go').onclick=()=>{const hc=$('#col').value==='r'?(Math.random()<.5?'w':'b'):$('#col').value;const t=lv===5?+$('#celo').value:S.elo+LV[lv][2];newGame('ai',hc,Math.min(3000,Math.max(100,t||600)),tcOf(1));};
$('#golocal').onclick=()=>newGame('local',null,0,tcOf(3));
$('#th').innerHTML=TH.map((t,i)=>`<button data-t="${i}"><span style="display:inline-block;width:28px;height:28px;border-radius:6px;background:linear-gradient(135deg,${t[1]} 50%,${t[2]} 50%)"></span>${t[0]}</button>`).join('');
function thUI(){$$('#th button').forEach(b=>b.classList.toggle('on',+b.dataset.t===S.th));theme();}
$('#th').onclick=e=>{const b=e.target.closest('button');if(!b)return;S.th=+b.dataset.t;save();thUI();if(g)render();};
function sw(id,v){$(id).setAttribute('aria-checked',v?'true':'false');}sw('#snd',S.snd);$('#snd').onclick=()=>{S.snd=S.snd?0:1;sw('#snd',S.snd);save();};$('#vol').value=S.vol;$('#vol').oninput=()=>{S.vol=+$('#vol').value;save();};
$('#vol').onchange=()=>play('move');
/* records & review */
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const GK='qcg1';let GS=[];try{GS=JSON.parse(localStorage.getItem(GK)||'[]')}catch(e){}
const saveG=()=>{try{localStorage.setItem(GK,JSON.stringify(GS.slice(0,60)))}catch(e){}};
function recordCurrent(){if(g&&g.chk&&g.over&&g.res&&g.res!=='*'&&!g.chkDone){g.chkDone=1;chkGameEnd();}if(!g||!g.sans.length||g.saved)return;g.saved=1;g.rid=Date.now();const ai=g.mode==='ai';GS.unshift({id:g.rid,date:new Date().toISOString().slice(0,10),mode:g.train?'train':g.mode,title:g.over||'中断',res:g.res||'*',sans:g.sans.slice(),white:g.names?g.names.w:ai?(g.hc==='w'?'あなた':'Quiet AI '+g.elo):'白',black:g.names?g.names.b:ai?(g.hc==='b'?'あなた':'Quiet AI '+g.elo):'黒'});saveG();}
function listUI(){$('#gl').innerHTML=GS.length?GS.map(r=>`<div class="card gl"><div><b>${esc(r.title)}</b><br><small>${{ai:'AI対局',online:'プライベート対局',train:'トレーニング',local:'一台対局',pgn:'読込棋譜'}[r.mode]||''} · ${esc(r.date)} · ${r.sans.length}手</small></div><span class="sp"></span><button data-v="${r.id}" data-ic="play">振り返る</button><button class="dg" data-d="${r.id}" data-ic="trash">削除</button></div>`).join(''):'<div class="card">まだ記録がありません。対局を終えると、ここに保存されます。</div>';
  $$('#gl [data-ic]').forEach(b=>b.insertAdjacentHTML('afterbegin',ic(b.dataset.ic)));}
$('#gl').onclick=e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.v)openRev(+b.dataset.v);if(b.dataset.d)ask('この記録を削除しますか?(元に戻せません)',()=>{GS=GS.filter(x=>x.id!==+b.dataset.d);saveG();listUI();});};
$('#impb').onclick=()=>{$('#ie').textContent='';$('#imp').showModal();};
$('#pf').onchange=()=>{const f=$('#pf').files[0];if(f){const r=new FileReader();r.onload=()=>{$('#pt').value=r.result;};r.readAsText(f);}};
$('#pgo').onclick=()=>{try{const p=QCPGN.parse($('#pt').value);GS.unshift({id:Date.now(),date:p.date||new Date().toISOString().slice(0,10),mode:'pgn',title:p.white+' vs '+p.black,res:p.result,sans:p.sans,white:p.white,black:p.black});saveG();$('#imp').close();$('#pt').value='';listUI();}catch(e){$('#ie').textContent=e.message;}};
const BG={brilliant:['!!','#2f8f83','Brilliant!!・妙手'],great:['!','#5b7db1','Great!・重要手'],good:['!','#6a9a4a','好手'],inacc:['?!','#b8964a','疑問手'],mistake:['?','#cc8a3f','悪手'],blunder:['??','#c0443a','大きな見落とし']};
let rv=null;
function openRev(id){const r=GS.find(x=>x.id===id);if(!r)return;let p;try{p=QCPGN.parse(QCPGN.toPGN(r));}catch(e){return;}
  rv={r,st:p.states,mv:p.moves,i:p.moves.length,an:r.an||null,flip:(r.mode==='ai'||r.mode==='train')&&r.black==='あなた',sel:-1};$('#rvt').textContent=r.title;show('rev');if(rv.an)revUI();else runAN();}
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
  $('#rvx').hidden=!V;$('#rwhy').hidden=!(V?V.mv.length:rv.i);$('#rs').max=n;$('#rs').value=rv.i;
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
  o.q=(o.q||Promise.resolve()).then(()=>vRun(eng=>Promise.race([QCAN.analyze([s0,s1],[m],eng,{depth:12}),new Promise((_,rj)=>setTimeout(rj,25000))])))
   .then(r=>{v.an[k]=r[0];if(rv===o&&o.v===v)revUI();}).catch(()=>{o.eb=1;if(rv===o&&o.v===v)revUI();});}
attach($('#rbd'),{ok:()=>rv&&$('#ld').hidden,st:()=>rv.v?rv.v.st[rv.v.st.length-1]:rv.st[rv.i],get sel(){return rv.sel},set sel(v){rv.sel=v},paint:()=>revUI(),move:(m,na)=>rvMove(m,na)});
$('#rvx').onclick=()=>{rv.v=null;rv.sel=-1;revUI();};
$('#r0').onclick=()=>rgo(0);$('#r1').onclick=()=>rgo(rv.i-1);$('#r2').onclick=()=>rgo(rv.i+1);$('#r3').onclick=()=>rgo(1e3);$('#rs').oninput=()=>rgo(+$('#rs').value);
$('#rmv').onclick=e=>{const t=e.target.closest('span');if(t)rgo(+t.dataset.i);};$('#rfp').onclick=()=>{rv.flip=!rv.flip;revUI();};
$('#rvb').onclick=()=>{rv=null;if(vw){vw.terminate();vw=ve=null;}show('rec');};
$('#rdl').onclick=()=>{const r=rv.r,u=URL.createObjectURL(new Blob([QCPGN.toPGN({sans:r.sans,result:r.res,white:r.white,black:r.black,date:r.date})],{type:'application/x-chess-pgn'})),l=document.createElement('a');l.href=u;l.download='quietchess_'+r.date+'.pgn';l.click();setTimeout(()=>URL.revokeObjectURL(u),1000);};
document.addEventListener('keydown',e=>{if(!rv||$('#p-rev').hidden)return;if(e.key==='ArrowLeft')rgo(rv.i-1);if(e.key==='ArrowRight')rgo(rv.i+1);});
/* tactics */
const ymd=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'),today=()=>ymd(new Date());
S.tr=S.tr||{lo:340,hi:740,mode:'life',limit:3,order:'asc'};S.daily=S.daily||{};if(S.tr.retry===undefined)S.tr.retry=false;const HK='qct1';let HS=[];try{HS=JSON.parse(localStorage.getItem(HK)||'[]')}catch(e){}const saveT=()=>{try{localStorage.setItem(HK,JSON.stringify(HS.slice(0,30)))}catch(e){}};S.dOff=S.dOff||0;
let PZ=null,ss=null,ctx='',gback='',tp=null;
const gotPZ=raw=>{PZ=QCPZ.prep(raw);tactUI();};
setTimeout(()=>{if(window.__PZ)gotPZ(window.__PZ);else fetch('puzzles.json').then(r=>r.json()).then(gotPZ).catch(()=>{});},0);
const LIM={count:[5,10,20],time:[3,5,10],life:[1,3,5]},LU={count:'問',time:'分',life:'ライフ'};
function streak(){let n=0,d=new Date();const ok=x=>S.daily[ymd(x)]&&S.daily[ymd(x)].ok;if(!ok(d))d.setDate(d.getDate()-1);while(ok(d)){n++;d.setDate(d.getDate()-1);}return n;}
function tactUI(){const o=S.tr;$('#tlo').value=o.lo;$('#thi').value=o.hi;$$('#tmode button').forEach(b=>b.classList.toggle('on',b.dataset.m===o.mode));
  if(!LIM[o.mode].includes(o.limit))o.limit=LIM[o.mode][1];$('#tlim').innerHTML=LIM[o.mode].map(v=>`<option value="${v}" ${v===o.limit?'selected':''}>${v}${LU[o.mode]}</option>`).join('');$('#tord').value=o.order;
  $('#tcnt').textContent=PZ?`この範囲の問題:${QCPZ.inRange(PZ,o.lo,o.hi).length.toLocaleString()}問`:'問題データ(puzzles.json)を読み込めません。index.html と同じフォルダに置いてください。';
  const d=S.daily[today()],tg=S.elo+S.dOff;$('#dinfo').textContent=(d?(d.ok?'今日の一問、正解しました。':'今日の一問は、不正解でした。'):'あなたの棋力に合わせて、毎日ひとつ。')+' 目標難度 '+tg+' QC。';
  $('#dstreak').textContent='連続正解 '+streak()+'日';$('#dgo').lastChild.textContent=d?'今日の一問を見直す':'今日の一問を解く';$('#dgo').disabled=$('#tgo').disabled=!PZ;sw('#tretry',o.retry);
  const MN={count:'問題数',time:'制限時間',life:'ライフ'};$('#thl').innerHTML=HS.length?HS.map(x=>{const ok=x.res.filter(r=>r.ok).length,d=new Date(x.t);return `<div class="gl" style="padding:10px 0;border-bottom:1px solid var(--ln)"><div><b>${ok} / ${x.res.length} 正解</b><br><small>${d.getMonth()+1}/${d.getDate()} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')} · ${MN[x.o.mode]} · ${x.o.lo}〜${x.o.hi} QC${x.o.retry?' · リトライあり':''}</small></div><span class="sp"></span><button data-h="${x.id}" data-ic="play">振り返る</button></div>`;}).join(''):'<p class="sub">まだセッションの記録がありません。</p>';
  $$('#thl [data-ic]').forEach(b=>b.insertAdjacentHTML('afterbegin',ic(b.dataset.ic)));$('#thc').hidden=!HS.length;}
$('#tretry').onclick=()=>{S.tr.retry=!S.tr.retry;sw('#tretry',S.tr.retry);save();};
$('#thl').onclick=e=>{const b=e.target.closest('button');if(b)openHist(+b.dataset.h);};
$('#thc').onclick=()=>ask('セッションの履歴をすべて消しますか?(元に戻せません)',()=>{HS=[];saveT();tactUI();});
function openHist(id){const h=HS.find(x=>x.id===id);if(!h)return;const res=h.res.map(x=>({p:(PZ&&PZ.find(q=>q.id===x.id))||{id:x.id,q:x.q,r:0,fen:'',mv:[]},ok:x.ok,retry:x.retry,skip:x.skip,ms:x.ms}));ss={o:h.o,list:[],idx:0,ok:res.filter(r=>r.ok).length,lives:0,res,end:true,why:h.why,hist:1};ctx='sess';gback='sess';show('sr');srUI();}
$('#tlo').onchange=$('#thi').onchange=()=>{S.tr.lo=+$('#tlo').value||60;S.tr.hi=+$('#thi').value||2400;save();tactUI();};
$('#tpre').onclick=e=>{const b=e.target.closest('button');if(!b)return;const x=S.elo,r={easy:[x-400,x],mid:[x-200,x+200],hard:[x,x+400]}[b.dataset.q];S.tr.lo=Math.max(60,r[0]);S.tr.hi=r[1];save();tactUI();};
$('#tmode').onclick=e=>{const b=e.target.closest('button');if(!b)return;S.tr.mode=b.dataset.m;S.tr.limit=LIM[b.dataset.m][1];save();tactUI();};
$('#tlim').onchange=()=>{S.tr.limit=+$('#tlim').value;save();};$('#tord').onchange=()=>{S.tr.order=$('#tord').value;save();};
$('#aoff').innerHTML=[-300,-200,-100,0,100,200].map(v=>`<option value="${v}">${v===0?'±0(標準)':(v>0?'+':'')+v}</option>`).join('');$('#aoff').value=S.aoff||0;$('#aoff').onchange=()=>{S.aoff=+$('#aoff').value;save();};
$('#doff').innerHTML=[-200,-100,0,100,200,300].map(v=>`<option value="${v}">${v===0?'±0(棋力どおり)':(v>0?'+':'')+v}</option>`).join('');$('#doff').value=S.dOff;$('#doff').onchange=()=>{S.dOff=+$('#doff').value;save();};
function pzPaint(anim){if(!tp)return;const s=tp.s,tg=tp.sel>=0?E.legal(s).filter(m=>m.from===tp.sel&&(!tp.guide||tp.hintTo<0||m.to===tp.hintTo)):[];
  $('#tbd').innerHTML=bhtml(s,tp.flip,tp.last,null,tp.sel,tg);$('#trk').innerHTML=(tp.flip?[1,2,3,4,5,6,7,8]:[8,7,6,5,4,3,2,1]).map(x=>`<span>${x}</span>`).join('');$('#tfl').innerHTML=(tp.flip?'hgfedcba':'abcdefgh').split('').map(x=>`<span>${x}</span>`).join('');
  if(anim)animMove($('#tbd'),tp.flip,anim.m,false);}
function pzBtns(){const dd=tp&&tp.state==='done';$('#pzq').hidden=!(ctx==='quiz'&&tp&&tp.state==='play'&&!tp.guide);$('#pzn').hidden=!((ctx==='quiz'&&dd&&!tp.guide&&!tp.ok)||(ctx==='guide'&&gback==='quiz'&&dd));$('#pzx').hidden=ctx!=='quiz';
  const d=tp&&tp.state==='done';$('#pzback').hidden=!((ctx==='guide'&&gback!=='quiz')||ctx==='daily');$('#pzg').hidden=!((ctx==='daily'&&d&&!tp.guide)||(ctx==='quiz'&&d&&!tp.guide&&!tp.ok));$('#pze').hidden=!(ctx==='sess'||ctx==='quiz');$('#pzs').hidden=!(ctx==='sess'&&tp&&tp.tries>0&&tp.state==='play');}
function hud(){if(ctx==='quiz'&&K){$('#hud').textContent=`① クイズ ${Math.min(K.z.n+1,30)} / 20〜30  ② 実戦 0 / 3局  暫定 ${K.z.est} QC Elo`;return;}if(ctx!=='sess'||!ss){$('#hud').textContent=ctx==='daily'?'DAILY PUZZLE · '+today():'正解の手順を確認';return;}const o=ss.o;
  $('#hud').innerHTML=(o.mode==='count'?`問題 ${Math.min(ss.idx+1,o.limit)} / ${o.limit}`:o.mode==='time'?`⏱ ${Math.floor(ss.left/60)}:${String(ss.left%60).padStart(2,'0')}`:`ライフ <span class="lv2">${'♥'.repeat(Math.max(0,ss.lives))}</span>`)+` <span>✓ ${ss.ok}</span>`;}
function pzLoad(p,guide){const f=E.fromFEN(p.fen),tok=tp={p,s:f,mi:0,flip:f.t==='w',sel:-1,last:null,state:'wait',guide,t0:0,hintTo:-1};
  $('#pzt').textContent='準備しています…';$('#pzm').textContent='';$('#pzi').textContent=`難度 ${p.q} QC(Lichess問題レート ${p.r}) · 出典 ${p.id}`;pzPaint();pzBtns();hud();
  setTimeout(()=>{if(tp!==tok)return;pzApply(E.fromUci(tok.s,p.mv[0]),true);tok.mi=1;tok.state='play';tok.t0=Date.now();pzBtns();$('#pzt').textContent=(tok.s.t==='w'?'白':'黒')+'の番 · よい継続を見つけよう';if(guide)pzHint();},500);}
function pzApply(m,anim){const s=tp.s,cap=s.b[m.to]!=='.'||m.fl==='ep';tp.s=E.make(s,m);tp.last=m;tp.sel=-1;tp.hintTo=-1;pzPaint(anim?{m,rev:false}:null);play(cap?'capture':'move');}
function pzHint(){const m=E.fromUci(tp.s,tp.p.mv[tp.mi]);tp.sel=m.from;tp.hintTo=m.to;pzPaint();$('#pzm').textContent='光っているマスの駒を、示された場所へ動かしてみましょう。';}
function pzMove(m,na){const p=tp.p,tok=tp,ns=E.make(tp.s,m);let ok=E.uci(m)===p.mv[tp.mi];if(!ok&&!tp.guide&&tp.mi===p.mv.length-1&&E.status(ns)==='checkmate')ok=true;
  if(!ok){if(tp.guide){$('#pzm').textContent='その手ではありません。光っているマスの手を指してみましょう。';pzHint();return;}if(ss&&ctx==='sess'&&ss.o.retry){const ps=tp.s,pl=tp.last;tp.tries=(tp.tries||0)+1;tp.state='wait';pzApply(m,!na);play('warn');$('#pzm').textContent='惜しい。元に戻します。';pzBtns();
    setTimeout(()=>{if(tp!==tok)return;tp.s=ps;tp.last=pl;tp.sel=-1;pzPaint({m,rev:true});tp.state='play';$('#pzm').textContent='もう一度考えてみましょう。分からなければスキップできます。';pzBtns();},800);return;}
  tp.state='fail';pzDone(false);return;}
  pzApply(m,!na);tp.mi++;if(tp.mi>=p.mv.length)return pzDone(true);tp.state='wait';
  setTimeout(()=>{if(tp!==tok)return;pzApply(E.fromUci(tp.s,p.mv[tp.mi]),true);tp.mi++;if(tp.mi>=p.mv.length)return pzDone(true);tp.state='play';if(tp.guide)pzHint();},450);}
function pzDone(ok){tp.state='done';if(tp.guide){$('#pzm').textContent='手順を確認できました。';pzBtns();play('end');return;}
  tp.ok=ok;play(ok?'end':'warn');$('#pzm').textContent=ok?(tp.tries>0?'リトライで正解です。':'正解です。'):tp.skipped?'スキップしました。':'不正解です。';
  if(ctx==='quiz'){qRec(ok);return;}if(ctx==='sess'){sRec(ok);return;}if(ctx==='daily'){S.daily[today()]={ok,id:tp.p.id,q:tp.p.q};save();}pzBtns();}
attach($('#tbd'),{ok:()=>tp&&tp.state==='play',st:()=>tp.s,get sel(){return tp.sel},set sel(v){tp.sel=v},paint:()=>pzPaint(),move:(m,na)=>pzMove(m,na)});
function dStart(){const t=today(),st=S.daily[t],p=(st&&PZ.find(x=>x.id===st.id))||QCPZ.daily(PZ,S.elo+S.dOff,t);ctx=st?'guide':'daily';gback='daily';show('pz');pzLoad(p,!!st);}
$('#dgo').onclick=dStart;
function sStart(op){const o=op||S.tr;const pool=QCPZ.inRange(PZ,o.lo,o.hi);if(!pool.length){$('#tcnt').textContent='この範囲に問題がありません。範囲を広げてください。';return;}
  const list=QCPZ.sample(pool,o.mode==='count'?o.limit:60);if(o.order==='asc')list.sort((a,b)=>a.q-b.q);
  const me=ss={o:{...o},list,idx:0,ok:0,lives:o.mode==='life'?o.limit:0,res:[],t0:Date.now(),left:o.mode==='time'?o.limit*60:0,end:false};ctx='sess';show('pz');
  if(o.mode==='time')me.tm=setInterval(()=>{me.left=Math.max(0,o.limit*60-Math.floor((Date.now()-me.t0)/1000));hud();if(me.left<=0)sEnd('時間切れ');},250);sNext();}
function sNext(){const p=ss.list[ss.idx];if(!p)return sEnd('全問終了');pzLoad(p,false);}
function sRec(ok){const ms=Date.now()-tp.t0,me=ss;me.res.push({p:tp.p,ok,ms,retry:ok&&tp.tries>0,skip:!!tp.skipped});if(ok)me.ok++;else if(me.o.mode==='life')me.lives--;me.idx++;hud();
  const end=me.o.mode==='life'&&me.lives<=0?'ライフがなくなりました':me.o.mode==='count'&&me.idx>=me.o.limit?'全問終了':null;
  setTimeout(()=>{if(ss!==me||me.end)return;end?sEnd(end):sNext();},ok?600:1000);}
function sEnd(why){if(!ss||ss.end)return;ss.end=true;clearInterval(ss.tm);ss.why=why;tp=null;if(ss.res.length&&!ss.hist){ss.hist=1;HS.unshift({id:Date.now(),t:Date.now(),o:ss.o,why,res:ss.res.map(x=>({id:x.p.id,q:x.p.q,ok:x.ok,retry:!!x.retry,skip:!!x.skip,ms:x.ms}))});saveT();}show('sr');srUI();}
function srUI(){const r=ss.res,n=r.length,ok=r.filter(x=>x.ok).length,avg=n?r.reduce((s,x)=>s+x.ms,0)/n/1000:0;
  $('#srh').innerHTML=`<div class="eyebrow">SESSION REVIEW</div><div style="font:500 44px Georgia,serif">${ok}<span style="font-size:20px;color:var(--mu)"> / ${n} 正解</span></div><p class="sub">${esc(ss.why)} · 正答率 ${n?Math.round(ok/n*100):0}% · 平均 ${avg.toFixed(1)}秒${r.some(x=>x.retry)?' · リトライ正解 '+r.filter(x=>x.retry).length:''} · 難度 ${ss.o.lo}〜${ss.o.hi} QC</p>`;
  const IC2=x=>x.ok?(x.retry?['↻','#b8964a','リトライで正解']:['✓','#6a9a4a','正解']):(x.skip?['»','#8a8a7e','スキップ']:['✕','#c0443a','不正解']);
  $('#srl').innerHTML=r.map((x,i)=>{const c=IC2(x);return `<div class="card gl"><span class="dot" style="background:${c[1]}">${c[0]}</span><div><b>問題 ${i+1} · ${c[2]}</b><br><small>難度 ${x.p.q} QC · ${(x.ms/1000).toFixed(1)}秒</small></div><span class="sp"></span>${x.p.fen?`<button data-g="${i}" data-ic="play">正解を確認</button>`:''}</div>`;}).join('')||'<div class="card">解いた問題がありません。</div>';
  $$('#srl [data-ic]').forEach(b=>b.insertAdjacentHTML('afterbegin',ic(b.dataset.ic)));}
$('#tgo').onclick=()=>sStart();$('#srag').onclick=()=>sStart(ss.o);$('#pzs').onclick=()=>{if(!tp||tp.state!=='play')return;tp.skipped=true;tp.state='fail';pzDone(false);};$('#srback').onclick=()=>show('tact');$('#pze').onclick=()=>{if(ctx==='quiz'){tp=null;saveK();show('chk');}else sEnd('途中で終了');};
$('#srl').onclick=e=>{const b=e.target.closest('button');if(!b)return;ctx='guide';gback='sess';show('pz');pzLoad(ss.res[+b.dataset.g].p,true);};
$('#pzg').onclick=()=>{const p=tp.p;gback=ctx;ctx='guide';pzLoad(p,true);};
$('#pzback').onclick=()=>{const c=ctx;tp=null;if(c==='guide'&&gback==='sess'){ctx='sess';show('sr');}else show('tact');};
window._qc={get wv(){return wv},get g(){return g},get tp(){return tp},get ss(){return ss}};
/* rating check */
const KK='qck1',KHK='qckh1';let K=null,KH=[];try{K=JSON.parse(localStorage.getItem(KK)||'null');KH=JSON.parse(localStorage.getItem(KHK)||'[]')}catch(e){}
const saveK=()=>{try{localStorage.setItem(KK,JSON.stringify(K));localStorage.setItem(KHK,JSON.stringify(KH.slice(0,30)))}catch(e){}};
const clampE=v=>Math.max(100,Math.min(3000,Math.round(v)));
const halfNow=()=>Math.max(80,Math.round(K.half0*(1-.05*K.games.length)/10)*10);
function chkUI(){const c=$('#ckc'),dis=PZ?'':'disabled';let t;
  if(!K)t=`<div class="card"><h2 class="h2">棋力チェックをはじめる</h2><p class="sub">① クイズ(20〜30問): 正解すると難しく、間違えるとやさしくなります。② 実戦3局: 推定に合わせたAIと指して、確かめます。途中で中断しても保存されます。測定が終わるまで、いまの推定Eloは変わりません。</p><div class="ckb"><button class="pri" data-a="start" data-ic="play" ${dis}>測定をはじめる</button></div></div>`;
  else if(K.phase==='quiz')t=`<div class="card"><div class="eyebrow">① クイズ ${K.z.n} / 20〜30 · ② 実戦 0 / 3局</div><h2 class="h2">クイズの途中です</h2><p class="sub">${K.z.n}問まで終わっています。暫定 ${K.z.est} QC Elo。</p><div class="ckb"><button class="pri" data-a="qres" data-ic="play" ${dis}>続きから</button><button class="dg" data-a="cancel" data-ic="x">測定を取り消す</button></div></div>`;
  else if(K.phase==='games')t=`<div class="card"><div class="eyebrow">① クイズ ${K.z.n}問 完了 · ② 実戦 ${K.games.length} / 3局</div><h2 class="h2">次は、実戦で確かめます</h2><p class="sub">クイズのみの推定は ${K.qEst} QC Elo。相手の目標は ${clampE(K.est)} Elo です(待ったは使えません)。</p><div class="ckb"><button class="pri" data-a="game" data-ic="play">対局をはじめる</button><button class="dg" data-a="cancel" data-ic="x">測定を取り消す</button></div></div>`;
  else{const r=KH[0]||{est:K.est,lo:K.est-100,hi:K.est+100,n:K.z.n,gn:K.games.length};t=`<div class="card" style="text-align:center"><div class="eyebrow">QUIET CHESS ESTIMATE · MODEL V1</div><div class="big">${r.est} <small>QC Elo</small></div><h2 class="h2">比べるのは、昨日の自分。</h2><p class="sub">目安幅 ${r.lo}〜${r.hi} · ${r.n}問・${r.gn}局。<br>クイズのみの推定 ${K.qEst} → 実戦${r.gn}局を反映して ${r.est}。<br>この幅は初期モデル内の不確かさの目安で、誤差±50や統計的な精度保証ではありません。他サービスのレーティングには換算できません。</p><div class="ckb" style="justify-content:center"><button class="pri" data-a="back" data-ic="back">戻る</button><button data-a="game" data-ic="play">追加対局で確かめる</button><button data-a="restart" data-ic="plus">新しく測定する</button><button class="dg" data-a="undo" data-ic="x">この結果を取り消す</button></div></div>`;}
  c.innerHTML=t;$$('#ckc [data-ic]').forEach(b=>b.insertAdjacentHTML('afterbegin',ic(b.dataset.ic)));
  $('#ckh').innerHTML=KH.length?KH.map(r=>{const d=new Date(r.t);return `<div class="gl" style="padding:10px 0;border-bottom:1px solid var(--ln)"><b>${r.est} QC Elo</b><span>目安幅 ${r.lo}〜${r.hi}</span><small>${d.getFullYear()}/${d.getMonth()+1}/${d.getDate()} · ${r.n}問／${r.gn}局</small></div>`;}).join(''):'<p class="sub">まだ測定履歴がありません。</p>';}
$('#ckc').onclick=e=>{const b=e.target.closest('button');if(!b)return;const A=b.dataset.a;
  if(A==='start'||A==='restart'){K={phase:'quiz',z:{est:clampE(S.elo),step:300,n:0,hist:[],used:[]},games:[],prev:K&&K.phase==='done'?K.prev:S.elo,pm:K&&K.phase==='done'?K.pm:S.meas,pman:K&&K.phase==='done'?K.pman:S.man};saveK();qRun();}
  else if(A==='qres')qRun();else if(A==='game')ckGame();else if(A==='back')show('ai');
  else if(A==='cancel')ask('この測定を取り消しますか?(いまの推定Eloは変わりません)',()=>{K=null;saveK();chkUI();});
  else if(A==='undo')ask('この結果を取り消しますか?(推定Eloを測定前に戻します)',()=>{S.elo=K.prev;S.meas=K.pm||0;S.man=K.pman||0;save();KH.shift();K=null;saveK();chkUI();});};
function qRun(){ctx='quiz';show('pz');qNext();}
function qNext(){if(!K||K.phase!=='quiz')return;if(QCPZ.qDone(K.z))return qFin();pzLoad(QCPZ.nearest(PZ,K.z.est,new Set(K.z.used),6),false);}
function qFin(){const r=QCPZ.qResult(K.z);K.qEst=r.est;K.est=r.est;K.half0=r.half;K.phase='games';saveK();tp=null;show('chk');}
function qRec(ok){QCPZ.qAnswer(K.z,tp.p,ok);saveK();hud();if(ok){const me=K;setTimeout(()=>{if(K===me&&ctx==='quiz'&&tp&&tp.ok)qNext();},900);}else pzBtns();}
$('#pzq').onclick=()=>{if(tp&&tp.state==='play'&&ctx==='quiz'){tp.skipped=true;tp.state='fail';pzDone(false);}};
$('#pzn').onclick=()=>{ctx='quiz';qNext();};
$('#pzx').onclick=()=>ask('この測定を取り消しますか?(いまの推定Eloは変わりません)',()=>{K=null;saveK();tp=null;show('chk');});
function ckGame(){const hc=K.games.length%2===0?'w':'b';newGame('ai',hc,clampE(K.est));g.chk=1;render();}
$('#ckn').onclick=()=>show('chk');
function chkGameEnd(){if(!K)return;const w=g.hc==='w',sc=g.res==='1/2-1/2'?.5:((g.res==='1-0')===w?1:0);K.games.push({sc,elo:g.elo});K.est=clampE(K.est+30*(2*sc-1));
  if(K.phase==='games'&&K.games.length>=3){K.phase='done';ckFin(true);}else if(K.phase==='done')ckFin(false);saveK();}
function ckFin(first){const r={t:Date.now(),est:K.est,lo:clampE(K.est-halfNow()),hi:clampE(K.est+halfNow()),n:K.z.n,gn:K.games.length};if(first)KH.unshift(r);else KH[0]=r;S.elo=K.est;S.meas=1;S.man=0;save();}
/* training coach + evaluation detail */
let vq=Promise.resolve();function vRun(fn){const p=vq.then(()=>vEng()).then(fn);vq=p.catch(()=>{});return p;}
const PN={p:'ポーン',n:'ナイト',b:'ビショップ',r:'ルーク',q:'クイーン',k:'キング'},pnm=p=>PN[p.toLowerCase()];
const CL=[['Gentle','とてもやさしく',-150],['Calm','やさしく',-75],['Even','いつもどおり',0],['Step','少し上',75],['Stretch','しっかり',150],['Custom','自分で決める',null]];let tl=2;
function tlUI(){$('#clv').innerHTML=CL.map((l,i)=>`<button class="${i===tl?'on':''}" data-l="${i}"><b>${l[0]}</b><small>${l[1]}</small><small>${l[2]===null?'自由に設定':(l[2]>0?'+':'')+l[2]+' Elo'}</small></button>`).join('');$('#clc').hidden=tl!==5;
  const t=tl===5?+$('#cle').value:S.elo+CL[tl][2];$('#cld').textContent='コーチの目標:'+Math.max(100,t||600)+' Elo(あなたの推定 '+eloTxtF()+(S.meas?' Elo':'。未測定のため、仮の基準 800 から計算')+')';}
$('#clv').onclick=e=>{const b=e.target.closest('button');if(b){tl=+b.dataset.l;tlUI();}};$('#cle').oninput=tlUI;
$('#cgo').onclick=()=>{const hc=$('#ccol').value==='r'?(Math.random()<.5?'w':'b'):$('#ccol').value,t=tl===5?+$('#cle').value:S.elo+CL[tl][2];newGame('ai',hc,clampE(t||600),tcOf(2));g.train=1;g.va=null;render();};
function addBadge(){const b=BG[g.va.an.cls];if(!b||g.va.an.cls==='good')return;const ord=[...Array(64).keys()];if(g.flip)ord.reverse();const c=$('#bd').children[ord.indexOf(g.va.m.to)];if(c&&!c.querySelector('.bg'))c.insertAdjacentHTML('beforeend',`<span class="bg" style="background:${b[1]}">${b[0]}</span>`);}
function coachEval(s0,m,ns,next){const gg=g,ply=g.sans.length;g.busy=true;$('#undo').disabled=true;$('#st').textContent='コーチが確認しています…';
  const fin=an=>{if(g!==gg)return;g.busy=false;$('#undo').disabled=g.sans.length<2;if(an){g.va={ply,an,s0,m};const b=BG[an.cls];
    $('#cv').innerHTML=b?`<span class="dot" style="background:${b[1]}">${b[0]}</span><b>${b[2]}</b>`:'<b>唯一の合法手</b>';
    $('#ct').textContent=an.cls==='brilliant'?'駒を犠牲にしても形勢を保つ、素晴らしい手です。':an.cls==='great'?'この局面で、ほぼ唯一の良い手でした。':['inacc','mistake','blunder'].includes(an.cls)?((QCAN.flow(s0,m,an).short||'もう少しよい候補がありました。')+` 最善は ${an.bestSan} でした。「待った」で戻れます。`):an.loss===0?'最善手です。':'良い手です。';$('#cw').hidden=false;addBadge();}
   else{g.va=null;$('#cv').innerHTML='';$('#ct').textContent='コーチの評価にはStockfishが必要です(公開したサイトで動作します)。対局は続けられます。';$('#cw').hidden=true;}next();};
  vRun(eng=>Promise.race([QCAN.analyze([s0,ns],[m],eng,{depth:12}),new Promise((_,j)=>setTimeout(j,15000))])).then(r=>fin(r[0])).catch(()=>fin(null));}
$('#cw').onclick=()=>{if(g&&g.va)openWhy({s0:g.va.s0,m:g.va.m,an:g.va.an,flip:g.flip});};
$('#rwhy').onclick=()=>{const V=rv.v;if(V&&V.mv.length){const k=V.mv.length-1;openWhy({s0:V.st[k],m:V.mv[k],an:V.an[k],flip:rv.flip});}else if(rv.i)openWhy({s0:rv.st[rv.i-1],m:rv.mv[rv.i-1],an:rv.an&&rv.an[rv.i-1],flip:rv.flip});};
let wv=null;
function lineStates(s0,u){const st=[s0],mv=[];let s=s0;for(const x of u){const m=E.fromUci(s,x);if(!m)break;mv.push(m);s=E.make(s,m);st.push(s);}return{st,mv};}
async function openWhy(c){wv={c,tab:'best',k:0,guide:0,sel:-1,flip:c.flip};$('#why').showModal();$('#wtx').textContent='解析しています…';$('#wpv').innerHTML='';wdraw();let an=c.an;
  try{if(!an||!an.bestPV||!an.playedPV){const s1=E.make(c.s0,c.m);an=(await vRun(eng=>Promise.race([QCAN.analyze([c.s0,s1],[c.m],eng,{depth:12}),new Promise((_,j)=>setTimeout(j,20000))])))[0];}}
  catch(e){if(wv&&wv.c===c)$('#wtx').textContent='評価の理由にはStockfishが必要です(公開したサイトで動作します)。';return;}
  if(!wv||wv.c!==c)return;wv.an=an;const pu=E.uci(c.m);wv.L={best:lineStates(c.s0,an.bestPV.length?an.bestPV:[an.best]),played:lineStates(c.s0,[pu].concat(an.playedPV||[]))};
  for(const t of['best','played'])wv.L[t].san=wv.L[t].mv.map((m,i)=>E.san(wv.L[t].st[i],m));
  wv.ex=explain(c.s0,c.m,an,wv.L.played);$('#wtx').innerHTML=wv.ex.html;wdraw();}
function flowHTML(tab,st){return '<div class="flow">'+st.map(s=>`<button data-t="${tab}" data-k="${s.k}"><b>${s.who}</b> ${esc(s.text)}</button>`).join('<span class="fa">↓</span>')+'</div>';}
function explain(s0,m,an,pl){const F=QCAN.flow(s0,m,an),s1=pl.st[1],r1=pl.mv[1],mp=s0.b[m.from],mk=[],cap1=r1&&s1&&(s1.b[r1.to]!=='.'||r1.fl==='ep')?s1.b[r1.to]:null;let what,alt='';
  if(an.cls==='brilliant')what=`${pnm(mp)}を取られる形ですが、その後も形勢は保たれます。駒を犠牲にして、狙いを実現する手です。`;
  else if(an.cls==='great')what='この局面で、ほぼ唯一の良い手でした。他の手では、形勢が大きく悪くなります。';
  else if(an.loss>3){what=(F.sumPlayed||'目立った駒損や詰みの筋はありませんが、局面の評価が下がります(駒の働きや形勢の面で、より良い手がありました)。')+' '+F.resPlayed;if(cap1)mk.push({sq:r1.to,c:'#c0443a'});}
  else what=an.loss===0?'最善手です。':'最善に近い、良い手です。';
  if(an.loss>3&&an.best){const bm=E.fromUci(s0,an.best);if(bm){alt=F.sumBest||`代わりに ${an.bestSan} が良い手でした。`;mk.push({sq:bm.to,c:'#5b8f4a'});}}
  const wb=Math.round(QCAN.win(an.cp)),res=an.loss>0?`勝率の見積もり: 指した手 ${Math.round(wb-an.loss)}% → 最善 ${wb}%。`:`勝率の見積もり: ${wb}%。`;
  return{html:`<p><b>何が起きたか</b><br>${what}</p>${F.playedSteps.length>1?`<p style="margin-bottom:2px"><b>流れ</b>(押すと、盤で確認できます)</p>${flowHTML('played',F.playedSteps)}`:''}${alt?`<p style="margin-bottom:2px"><b>代わりの手</b><br>${alt}</p>${F.bestSteps.length>1?flowHTML('best',F.bestSteps):''}`:''}<p><b>結果</b><br>${res}右の手順は、有限の探索による一例です。</p>`,mk};}
function sqmark(sq,c,f){const o=f?63-sq:sq;return `<rect x="${(o&7)+.06}" y="${(o>>3)+.06}" width=".88" height=".88" rx=".12" fill="none" stroke="${c}" stroke-width=".09"/>`;}
$('#wtx').onclick=e=>{const b=e.target.closest('button[data-k]');if(!b||!wv||!wv.L)return;wv.tab=b.dataset.t;wv.k=+b.dataset.k;wv.guide=0;wv.sel=-1;const L=wv.L[wv.tab];wdraw(L&&L.mv[wv.k-1]?{m:L.mv[wv.k-1],rev:false}:null);};
function arrow(f,t,c,flip){const o=i=>flip?63-i:i,x=i=>(o(i)&7)+.5,y=i=>(o(i)>>3)+.5,x1=x(f),y1=y(f),x2=x(t),y2=y(t),d=Math.hypot(x2-x1,y2-y1)||1,ux=(x2-x1)/d,uy=(y2-y1)/d,ex=x2-ux*.32,ey=y2-uy*.32;
  return `<line x1="${x1}" y1="${y1}" x2="${ex}" y2="${ey}" stroke="${c}" stroke-width=".16" stroke-linecap="round" opacity=".85"/><polygon points="${x2},${y2} ${ex-uy*.17},${ey+ux*.17} ${ex+uy*.17},${ey-ux*.17}" fill="${c}" opacity=".9"/>`;}
function wdraw(anim){if(!wv)return;const L=wv.L&&wv.L[wv.tab],f=wv.flip,gd=wv.guide===1;let s=L?L.st[wv.k]:wv.c.s0,last=L&&wv.k?L.mv[wv.k-1]:null;const tg=gd&&wv.sel>=0?E.legal(s).filter(m=>m.from===wv.sel):[];
  $('#wbd').innerHTML=bhtml(s,f,last,null,gd?wv.sel:-1,tg);$('#wrk').innerHTML=(f?[1,2,3,4,5,6,7,8]:[8,7,6,5,4,3,2,1]).map(x=>`<span>${x}</span>`).join('');$('#wfl').innerHTML=(f?'hgfedcba':'abcdefgh').split('').map(x=>`<span>${x}</span>`).join('');
  let sv='';const GR='#5b8f4a',BL='#4f7fb0',RD='#c0443a';
  if(L){if(wv.k===0&&!gd){const bm=wv.an.best&&E.fromUci(wv.c.s0,wv.an.best),pm=wv.c.m;if(bm&&E.uci(bm)!==E.uci(pm))sv+=arrow(bm.from,bm.to,GR,f);sv+=arrow(pm.from,pm.to,BL,f);(wv.ex?wv.ex.mk:[]).forEach(q=>{const o=f?63-q.sq:q.sq;sv+=`<rect x="${(o&7)+.06}" y="${(o>>3)+.06}" width=".88" height=".88" rx=".12" fill="none" stroke="${q.c}" stroke-width=".09"/>`;});}
    else if(gd&&wv.k<L.mv.length){const e=L.mv[wv.k];sv+=arrow(e.from,e.to,wv.tab==='best'?GR:BL,f);}
    else if(last){sv+=arrow(last.from,last.to,wv.tab==='best'?GR:(wv.k%2===1?BL:RD),f);if(L.st[wv.k-1].b[last.to]!=='.')sv+=sqmark(last.to,RD,f);}}
  $('#war').innerHTML=sv;if(anim)animMove($('#wbd'),f,anim.m,anim.rev);
  $('#wn').textContent=L?`${wv.k} / ${L.mv.length}`:'';$('#wpv').innerHTML=L?L.san.map((x,i)=>`<span style="padding:2px 6px;border-radius:8px;${i+1===wv.k?'background:var(--li)':''}">${i%2===0&&s0t(L)==='w'?(Math.floor(i/2)+1)+'. ':''}${x}</span>`).join(' '):'';
  $$('.wt').forEach(b=>b.classList.toggle('on',b.dataset.w===wv.tab));}
const s0t=L=>L.st[0].t;
function wstep(d){const L=wv&&wv.L&&wv.L[wv.tab];if(!L||wv.guide===1)return;const nk=wv.k+d;if(nk<0||nk>L.mv.length)return;wv.k=nk;wdraw({m:d>0?L.mv[nk-1]:L.mv[nk],rev:d<0});}
$('#w1').onclick=()=>wstep(-1);$('#w2').onclick=()=>wstep(1);
$$('.wt').forEach(b=>b.onclick=()=>{if(!wv)return;wv.tab=b.dataset.w;wv.k=0;wv.guide=0;wv.sel=-1;wdraw();});
$('#wc').onclick=()=>{$('#why').close();wv=null;};$('#why').addEventListener('close',()=>{wv=null;});
$('#wg').onclick=()=>{if(!wv||!wv.L)return;wv.guide=1;wv.k=0;wv.sel=-1;$('#wtx').insertAdjacentHTML('afterbegin','<p id="wgm" style="color:var(--ac)">矢印の手を、盤の上で指してみましょう。</p>');wdraw();};
attach($('#wbd'),{ok:()=>wv&&wv.guide===1&&wv.L&&wv.L[wv.tab].st[wv.k]&&wv.k<wv.L[wv.tab].mv.length&&!wv.wait,st:()=>wv.L[wv.tab].st[wv.k],get sel(){return wv.sel},set sel(v){wv.sel=v},paint:()=>wdraw(),move:(m,na)=>{const L=wv.L[wv.tab],ex=L.mv[wv.k],g_=$('#wgm');
  if(E.uci(m)!==E.uci(ex)){if(g_)g_.textContent='その手ではありません。矢印の手を指してみましょう。';wv.sel=-1;wdraw();return;}
  wv.k++;wv.sel=-1;wdraw(na?null:{m,rev:false});play('move');if(wv.k>=L.mv.length){wv.guide=2;if(g_)g_.textContent='手順を確認できました。「元の本局へ戻る」で戻れます。';wdraw();return;}
  wv.wait=1;setTimeout(()=>{if(!wv)return;wv.wait=0;const om=L.mv[wv.k];wv.k++;wdraw({m:om,rev:false});play('move');if(wv.k>=L.mv.length){wv.guide=2;if(g_)g_.textContent='手順を確認できました。「元の本局へ戻る」で戻れます。';wdraw();}},450);}});
/* clock + opening book */
const TCB=[[0,'無制限'],[60,'1分'],[180,'3分'],[300,'5分'],[600,'10分'],[900,'15分']],TCI=[[0,'なし'],[2,'2秒'],[5,'5秒'],[10,'10秒']];
S.tcb=S.tcb||0;S.tci=S.tci||0;
[1,2,3,4].forEach(n=>{$('#tcb'+n).innerHTML=TCB.map(x=>`<option value="${x[0]}" ${x[0]===S.tcb?'selected':''}>${x[1]}</option>`).join('');$('#tci'+n).innerHTML=TCI.map(x=>`<option value="${x[0]}" ${x[0]===S.tci?'selected':''}>${x[1]}</option>`).join('');
  $('#tcb'+n).onchange=$('#tci'+n).onchange=()=>{S.tcb=+$('#tcb'+n).value;S.tci=+$('#tci'+n).value;save();[1,2,3,4].forEach(m=>{$('#tcb'+m).value=S.tcb;$('#tci'+m).value=S.tci;});};});
function tcOf(n){return[+$('#tcb'+n).value,+$('#tci'+n).value];}
function clkMove(t){if(g.mode!=='online'&&g.tc&&g.tc[0]&&g.ts){const now=Date.now();g.clkH.push({w:g.clk.w,b:g.clk.b});g.clk[t]=Math.max(0,g.clk[t]-(now-g.ts))+g.tc[1]*1000;g.ts=now;}}
const fmt=ms=>{ms=Math.max(0,ms);const s=ms/1000;return s<20?s.toFixed(1):Math.floor(s/60)+':'+String(Math.floor(s%60)).padStart(2,'0');};
function clkLeft(c){const t=cur().t;return g.clk[c]-(c===t&&!g.over&&g.ts?Date.now()-g.ts:0);}
const pcv={p:1,n:3,b:3,r:5,q:9};
function capInfo(){const cap={w:[],b:[]};for(let i=1;i<g.st.length;i++){const a0=g.st[i-1],b0=g.st[i],c=a0.t,o=c==='w'?'b':'w',cnt=s=>{const r={};for(const p of s.b){if(p!=='.'&&(o==='w')===(p<'a')){const k=p.toLowerCase();r[k]=(r[k]||0)+1;}}return r;},x=cnt(a0),y=cnt(b0);for(const k in x)if(k!=='k'&&(y[k]||0)<x[k])cap[c].push(k);}
  for(const c in cap)cap[c].sort((x,y)=>pcv[y]-pcv[x]);let adv=0;for(const p of cur().b){if(p==='.')continue;const k=p.toLowerCase();if(k!=='k')adv+=p<'a'?pcv[k]:-pcv[k];}return{cap,adv};}
function pname(c){return g.mode==='ai'?(c===g.hc?'あなた':(g.train?'コーチ':'Quiet AI')):g.mode==='online'?(g.names?g.names[c]:'相手'):(c==='w'?'白':'黒');}
function pelo(c){if(g.mode==='ai')return 'Elo '+(c===g.hc?eloTxtF():g.elo);if(g.mode==='online'&&g.elos)return 'Elo '+g.elos[c];return '';}
function clkUI(){if(!g)return;const on=g.tc&&g.tc[0],bot=g.flip?'b':'w',top=bot==='w'?'b':'w',ci=capInfo();
  [['#ctop',top],['#cbot',bot]].forEach(([id,c])=>{const el=$(id),nl=el.querySelector('.nl'),ck=el.querySelector('.ck'),lead=(ci.adv>0&&c==='w')||(ci.adv<0&&c==='b');
    nl.firstElementChild.textContent=pname(c);nl.lastElementChild.textContent=pelo(c);
    el.querySelector('.cap').innerHTML=ci.cap[c].map(t=>`<span class="pc ${c==='w'?'b':'w'}">${pcs(t)}</span>`).join('')+(lead?`<em>+${Math.abs(ci.adv)}</em>`:'');
    ck.hidden=!on;if(on){const v=clkLeft(c);ck.textContent=fmt(v);ck.className='ck '+(c===cur().t&&!g.over?'act ':'')+(v<10000?'low':'');}});}
function hasMat(c){const r=cur().b.filter(p=>p!=='.'&&(c==='w'?p<'a':p>'a')&&p.toUpperCase()!=='K');return r.length>1||(r.length===1&&!'NnBb'.includes(r[0]));}
function flag(t){const w=t==='w'?'b':'w';g.busy=false;if(hasMat(w)){g.over=`時間切れ:${w==='w'?'白':'黒'}の勝ちです`;g.res=w==='w'?'1-0':'0-1';}else{g.over='時間切れ。相手の駒が足りず、引き分けです';g.res='1/2-1/2';}play('end');recordCurrent();render();}
setInterval(()=>{if(!g||!g.tc||!g.tc[0]||g.over)return;const t=cur().t;if(clkLeft(t)<=0){if(g.mode==='online'){if(!g.flg){g.flg=1;g.clk[t]=0;flag(t);netEnd(g.res,g.over);}return;}g.clk[t]=0;flag(t);return;}clkUI();},200);
function bookMove(s,gg,e){const mp=Math.round(Math.min(12,Math.max(2,e/120))),san=QCBook.pick(gg.sans,mp);return san?E.legal(s).find(m=>E.san(s,m).replace(/[+#]/g,'')===san)||null:null;}
/* settings: custom colors, piece style, fonts, PWA */
S.cc=S.cc||{};S.ps=S.ps||'classic';S.font=S.font||'yu';
const FF={yu:'"Yu Gothic","游ゴシック",system-ui,sans-serif',sans:'"Hiragino Sans","Noto Sans JP","Meiryo",system-ui,sans-serif',mincho:'"Yu Mincho","游明朝","Hiragino Mincho ProN","Noto Serif JP",serif',mono:'ui-monospace,"SF Mono",Consolas,monospace'};
function applyCC(){const r=document.documentElement.style,m={ac:'--ac',bg:'--bg',tx:'--tx',li:'--li',da:'--da'};theme();for(const k in m)if(S.cc[k])r.setProperty(m[k],S.cc[k]);
  $$('#cpk input').forEach(i=>{i.value=S.cc[i.dataset.c]||toHex(getComputedStyle(document.documentElement).getPropertyValue(m[i.dataset.c]).trim());});}
function toHex(v){if(/^#[0-9a-f]{6}$/i.test(v))return v;if(/^#[0-9a-f]{3}$/i.test(v))return '#'+[...v.slice(1)].map(x=>x+x).join('');return '#888888';}
$('#cpk').oninput=e=>{const i=e.target;if(!i.dataset.c)return;S.cc[i.dataset.c]=i.value;save();applyCC2();};
function applyCC2(){const r=document.documentElement.style,m={ac:'--ac',bg:'--bg',tx:'--tx',li:'--li',da:'--da'};for(const k in m)if(S.cc[k])r.setProperty(m[k],S.cc[k]);}
$('#creset').onclick=()=>{S.cc={};save();['--bg','--tx'].forEach(k=>document.documentElement.style.removeProperty(k));applyCC();};
const _th=theme;theme=function(){_th();applyCC2();};
function psUI(){document.documentElement.dataset.ps=S.ps;const N=[['classic','クラシック','標準の形'],['line','線画','白黒を、線と淡い色で'],['soft','やわらか','丸みのある太い線'],['letter','レター','文字で覚える']];
  $('#psl').innerHTML=N.map(x=>`<button class="psc ${S.ps===x[0]?'on':''}" data-s="${x[0]}" style="flex-direction:column;align-items:flex-start;height:auto"><span class="pv pv-${x[0]}"><span class="pc w">${pcs('n',x[0])}</span><span class="pc b">${pcs('q',x[0])}</span></span><b>${x[1]}</b><small>${x[2]}</small></button>`).join('');}
$('#psl').onclick=e=>{const b=e.target.closest('button');if(!b)return;S.ps=b.dataset.s;save();psUI();if(g)render();if(rv)revUI();};
/* fonts (stored in IndexedDB) */
function idb(){return new Promise((res,rej)=>{const q=indexedDB.open('qcfonts',1);q.onupgradeneeded=()=>q.result.createObjectStore('f');q.onsuccess=()=>res(q.result);q.onerror=()=>rej(q.error);});}
async function idbSet(k,v){const d=await idb();return new Promise((res,rej)=>{const t=d.transaction('f','readwrite');t.objectStore('f').put(v,k);t.oncomplete=res;t.onerror=()=>rej(t.error);});}
async function idbGet(k){const d=await idb();return new Promise((res,rej)=>{const q=d.transaction('f').objectStore('f').get(k);q.onsuccess=()=>res(q.result);q.onerror=()=>rej(q.error);});}
async function idbDel(k){const d=await idb();return new Promise(res=>{const t=d.transaction('f','readwrite');t.objectStore('f').delete(k);t.oncomplete=res;});}
let uf=null;
function fontUI(){const o=[['yu','游ゴシック(標準)'],['sans','ゴシック・すっきり'],['mincho','明朝'],['mono','等幅']];if(uf)o.push(['user','読み込んだフォント: '+uf.name]);
  $('#fsel').innerHTML=o.map(x=>`<option value="${x[0]}" ${S.font===x[0]?'selected':''}>${x[1]}</option>`).join('');$('#fdel').hidden=!uf;document.documentElement.style.fontFamily=(S.font==='user'&&uf?'"QCUser",':'')+FF[S.font==='user'?'yu':S.font];}
$('#fsel').onchange=()=>{S.font=$('#fsel').value;save();fontUI();};
async function addFont(f){if(!f)return;$('#fmsg').textContent='読み込んでいます…';try{if(!/\.(ttf|otf|woff2?)$/i.test(f.name))throw new Error('TTF / OTF / WOFF のファイルを選んでください');const buf=await f.arrayBuffer(),ff=new FontFace('QCUser',buf);await ff.load();document.fonts.add(ff);uf={name:f.name.replace(/\.[^.]+$/,'')};await idbSet('user',{name:uf.name,buf});S.font='user';save();fontUI();$('#fmsg').textContent='フォントを読み込みました。この端末に保存されます。';}catch(e){$('#fmsg').textContent='読み込めませんでした: '+(e.message||'ファイルを確認してください');}}
$('#fpick').onclick=()=>$('#ffile').click();$('#ffile').onchange=()=>addFont($('#ffile').files[0]);
const dz=$('#fdrop');['dragenter','dragover'].forEach(t=>dz.addEventListener(t,e=>{e.preventDefault();dz.classList.add('on');}));['dragleave','drop'].forEach(t=>dz.addEventListener(t,e=>{e.preventDefault();dz.classList.remove('on');}));dz.addEventListener('drop',e=>addFont(e.dataTransfer.files[0]));
$('#fdel').onclick=()=>ask('読み込んだフォントを削除しますか?',async()=>{await idbDel('user');uf=null;if(S.font==='user')S.font='yu';save();fontUI();$('#fmsg').textContent='削除しました。';});
(async()=>{try{const r=await idbGet('user');if(r){const ff=new FontFace('QCUser',r.buf);await ff.load();document.fonts.add(ff);uf={name:r.name};}}catch(e){}fontUI();})();
/* PWA */
if('serviceWorker' in navigator){const okp=location.protocol==='https:'||((location.hostname==='localhost'||location.hostname==='127.0.0.1')&&/[?&]sw=1/.test(location.search));if(okp)navigator.serviceWorker.register('sw.js').catch(()=>{});}
let ipr=null;addEventListener('beforeinstallprompt',e=>{e.preventDefault();ipr=e;$('#inst').hidden=false;});$('#inst').onclick=()=>{if(ipr){ipr.prompt();ipr=null;$('#inst').hidden=true;}};
$('#upd').onclick=async()=>{try{if('caches' in window)await Promise.all((await caches.keys()).map(k=>caches.delete(k)));if('serviceWorker' in navigator)await Promise.all((await navigator.serviceWorker.getRegistrations()).map(r=>r.update()));}catch(e){}location.reload();};
/* online match (private rooms) */
const toArr=v=>!v?[]:Array.isArray(v)?v.filter(x=>x!=null):Object.keys(v).sort((x,y)=>x-y).map(k=>v[k]);
let NETC=null,room=null,rcode='',runsub=null;const CODEA='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const rcodeGen=()=>Array.from({length:6},()=>CODEA[Math.random()*CODEA.length|0]).join(''),omsg=t=>{$('#onm').textContent=t||'';};
const savePtr=()=>{try{localStorage.setItem('qcroom',JSON.stringify({code:rcode}))}catch(e){}},clearPtr=()=>{try{localStorage.removeItem('qcroom')}catch(e){}};
async function netConn(){if(NETC)return NETC;const cfg=window.QC_FIREBASE,mock=/[?&]mock=1/.test(location.search);if(!mock&&(!cfg||!cfg.databaseURL))throw new Error('オンライン対局の設定(databaseURL)が、まだ入っていません。firebase-config.js を確認してください。');NETC=await QCNet.connect({mock,cfg});return NETC;}
const myColor=v=>NETC.uid===v.host?v.hc:(v.hc==='w'?'b':'w');
function openOnlineTab(){$$('.pt').forEach(x=>x.classList.toggle('on',x.dataset.pt==='online'));$('#pt-local').hidden=true;$('#pt-online').hidden=false;onlineUI();}
function onlineUI(){const w=rcode&&room&&room.status==='wait';$('#on-form').hidden=!!w;$('#on-wait').hidden=!w;if(w){$('#onc2').textContent=rcode;const t=room.tc&&room.tc.b?`${room.tc.b/60}分 + ${room.tc.i||0}秒`:'時間無制限';$('#onti').textContent=`${t} · あなたは${myColor(room)==='w'?'白':'黒'}`;}}
async function onMake(){omsg('');const db=await netConn(),name=($('#onn').value||'あなた').slice(0,12),tc=tcOf(4);let hc=$('#onc').value;if(hc==='r')hc=Math.random()<.5?'w':'b';
  for(let i=0;i<8;i++){const code=rcodeGen(),r=await db.tx('rooms/'+code,cur=>cur===null?{host:db.uid,hostName:name,hostElo:eloTxtF(),hc,tc:{b:tc[0],i:tc[1]},created:db.now(),status:'wait',n:0}:undefined);
    if(r.committed&&r.value){rcode=code;savePtr();watchRoom();return;}}throw new Error('コードを作れませんでした。もう一度お試しください。');}
const friendlyErr=e=>{const m=(e&&e.message)||String(e);if(/[\u3040-\u30ff\u4e00-\u9fff]/.test(m))return m;if(/permission/i.test(m))return 'この部屋には参加できません。コードを確認するか、満員・終了済みでないか確認してください。';if(/network|offline|unavailable|timeout/i.test(m))return '通信に失敗しました。接続を確認してください。';return '予期しないエラーが起きました。もう一度お試しください。';};
async function onJoin(){omsg('');const code=$('#onj').value.trim().toUpperCase();if(!/^[A-HJ-NP-Z2-9]{6}$/.test(code))throw new Error('6文字のコードを入力してください。');const db=await netConn(),name=($('#onn').value||'ゲスト').slice(0,12);
  const pre=await db.get('rooms/'+code);if(!pre)throw new Error('その部屋は見つかりません。コードをもう一度確認してください。');
  const r=await db.tx('rooms/'+code,cur=>{if(cur===null)return cur;if(cur.host===db.uid||cur.guest===db.uid)return undefined;if(cur.guest||cur.status!=='wait'||(cur.created&&db.now()-cur.created>7*864e5))return undefined;cur.guest=db.uid;cur.guestName=name;cur.guestElo=eloTxtF();cur.status='play';cur.ts=db.now();return cur;}),v=r.value;
  if(!v)throw new Error('その部屋は見つかりません。コードをもう一度確認してください。');if(v.host!==db.uid&&v.guest!==db.uid)throw new Error('その部屋は、すでに始まっているか、終了しています。');rcode=code;savePtr();watchRoom();}
function watchRoom(){if(runsub)runsub();runsub=NETC.on('rooms/'+rcode,onRoom);}
function onRoom(v){if(v===null){roomGone();return;}room=v;if(v.status==='wait'){onlineUI();if($('#p-priv').hidden&&(!g||g.mode!=='online')){show('priv');openOnlineTab();}return;}
  if(!g||g.mode!=='online'||g.code!==rcode)startOnline(v);syncGame(v);}
function roomGone(){room=null;if(g&&g.mode==='online'&&!g.over&&g.code===rcode){g.over='部屋が閉じられました';render();}rcode='';clearPtr();onlineUI();}
function startOnline(v){const me=myColor(v);newGame('online',me,0,v.tc&&v.tc.b?[v.tc.b,v.tc.i||0]:null);g.code=rcode;const hn=v.hostName||'ホスト',gn=v.guestName||'ゲスト';g.names={w:v.hc==='w'?hn:gn,b:v.hc==='w'?gn:hn};const he=v.hostElo||'?',ge=v.guestElo||'?';g.elos={w:v.hc==='w'?he:ge,b:v.hc==='w'?ge:he};}
function rollbackTo(n){while(g.sans.length>n){const k=key(cur());g.reps[k]--;g.st.pop();g.sans.pop();}g.over='';g.last=null;g.sel=-1;g.nsv=0;g.saved=0;render();}
function syncGame(v){if(!g||g.mode!=='online'||g.code!==rcode)return;const hs=toArr(v.h),mv=hs.map(x=>x.u);if(g.sans.length>mv.length)rollbackTo(mv.length);
  for(let i=g.sans.length;i<mv.length;i++){const m=E.fromUci(cur(),mv[i]);if(!m){$('#st').textContent='相手の手が正しくありません。';break;}doMove(m,false,true);}
  if(g.tc&&g.tc[0]){const l=hs.length?hs[hs.length-1]:null;g.clk={w:l?l.w:g.tc[0]*1000,b:l?l.b:g.tc[0]*1000};g.ts=(v.ts||NETC.now())-(NETC.now()-Date.now());g.flg=0;}
  if(v.status==='over'&&!g.over){g.over=v.reason||'対局が終了しました';g.res=v.result||'*';play('end');render();}
  if(v.status==='over'&&g.over)onlineSaved();offerUI(v);clkUI();}
async function netPush(m){const db=NETC,code=g.code,me=g.hc,u=E.uci(m),k=g.sans.length-1,over=g.over?{result:g.res||'*',reason:g.over}:null;
  try{await db.tx('rooms/'+code,cur=>{if(cur===null)return cur;if(cur.status!=='play')return undefined;const hs=toArr(cur.h);if(hs.length!==k||(k%2===0?'w':'b')!==me)return undefined;
    const l=hs.length?hs[hs.length-1]:null,c={w:l?l.w:cur.tc.b*1000,b:l?l.b:cur.tc.b*1000};if(cur.tc.b){c[me]=Math.max(0,c[me]-Math.max(0,db.now()-(cur.ts||db.now())))+(cur.tc.i||0)*1000;}
    hs.push({u,w:Math.round(c.w),b:Math.round(c.b)});cur.h=hs;cur.n=hs.length;cur.ts=db.now();cur.offer=null;if(over){cur.status='over';cur.result=over.result;cur.reason=over.reason;}return cur;});}
  catch(e){$('#st').textContent='通信に失敗しました。接続を確認してください。';}}
async function netEnd(res,text){try{await NETC.tx('rooms/'+g.code,cur=>{if(cur===null)return cur;if(cur.status!=='play')return undefined;cur.status='over';cur.result=res;cur.reason=text;cur.offer=null;return cur;});}catch(e){}}
async function netOffer(type){if(!g||g.over)return;try{await NETC.update('rooms/'+g.code,{offer:{type,by:NETC.uid,n:g.sans.length,t:NETC.now()}});$('#st').textContent=(type==='draw'?'引き分けを':'待ったを')+'提案しました。';}catch(e){$('#st').textContent='通信に失敗しました。';}}
function offerUI(v){const o=v.offer;if(!o){g.offerSeen=0;if($('#of').open)$('#of').close();return;}if(o.by===NETC.uid)return;if(g.offerSeen===o.t||g.over)return;g.offerSeen=o.t;$('#oft').textContent=o.type==='draw'?'相手が、引き分けを提案しました。':'相手が、待ったを提案しました。';$('#of').showModal();play('warn');}
$('#ofy').onclick=async()=>{$('#of').close();const db=NETC;try{await db.tx('rooms/'+g.code,cur=>{if(cur===null)return cur;if(cur.status!=='play'||!cur.offer||cur.offer.by===db.uid)return undefined;const o=cur.offer;
  if(o.type==='draw'){cur.status='over';cur.result='1/2-1/2';cur.reason='合意により引き分けです';cur.offer=null;return cur;}
  const hs=toArr(cur.h),reqW=(o.by===cur.host?cur.hc:(cur.hc==='w'?'b':'w'))==='w',k=((hs.length%2===1)===reqW)?1:2;if(hs.length<k)return undefined;hs.length-=k;cur.h=hs.length?hs:null;cur.n=hs.length;cur.ts=db.now();cur.offer=null;return cur;});}catch(e){}};
$('#ofn').onclick=async()=>{$('#of').close();try{await NETC.update('rooms/'+g.code,{offer:null});}catch(e){}};
async function onlineSaved(){if(g.nsv)return;g.nsv=1;recordCurrent();clearPtr();const db=NETC,code=g.code;try{await db.tx('rooms/'+code,cur=>{if(cur===null)return cur;cur.saved=cur.saved||{};cur.saved[db.uid]=true;return Object.keys(cur.saved).length>=2?null:cur;});}catch(e){}}
$('#onmk').onclick=()=>onMake().catch(e=>omsg(friendlyErr(e)));$('#onjb').onclick=()=>onJoin().catch(e=>omsg(friendlyErr(e)));
$('#onx').onclick=async()=>{if(runsub)runsub();runsub=null;try{if(room&&room.status==='wait'&&room.host===NETC.uid)await NETC.remove('rooms/'+rcode);}catch(e){}room=null;rcode='';clearPtr();onlineUI();};
$('#oncp').onclick=async()=>{const u=location.origin+location.pathname+'?room='+rcode;try{await navigator.clipboard.writeText(u);$('#oncp').lastChild.textContent='コピーしました';}catch(e){omsg(u);}setTimeout(()=>{$('#oncp').lastChild.textContent='招待リンクをコピー';},1500);};
function dlText(name,text){const u=URL.createObjectURL(new Blob([text],{type:'application/x-chess-pgn'})),l=document.createElement('a');l.href=u;l.download=name;l.click();setTimeout(()=>URL.revokeObjectURL(u),1000);}
$('#ana').onclick=()=>{recordCurrent();if(g.rid)openRev(g.rid);};
$('#pgn').onclick=()=>{const ai=g.mode==='ai',w=g.names?g.names.w:(ai?(g.hc==='w'?'あなた':'Quiet AI'):'白'),b=g.names?g.names.b:(ai?(g.hc==='b'?'あなた':'Quiet AI'):'黒');dlText('quietchess_'+ymd(new Date())+'.pgn',QCPGN.toPGN({sans:g.sans,result:g.res||'*',white:w,black:b,date:ymd(new Date())}));};
(async()=>{let p=null;try{p=JSON.parse(localStorage.getItem('qcroom')||'null')}catch(e){}const q=/[?&]room=([A-Za-z2-9]{6})/.exec(location.search);if(q){$('#onj').value=q[1].toUpperCase();setTimeout(()=>{show('priv');openOnlineTab();},0);}
  if(!p||!p.code)return;try{const db=await netConn(),v=await db.get('rooms/'+p.code);if(!v||v.status==='over'||(v.created&&db.now()-v.created>7*864e5)||(v.host!==db.uid&&v.guest!==db.uid)){clearPtr();return;}rcode=p.code;watchRoom();}catch(e){}})();
psUI();applyCC();thUI();lvUI();show('home');
})();
