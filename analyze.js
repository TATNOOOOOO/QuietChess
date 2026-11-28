/* QuietChess full-game analysis (Stockfish via UCI transport). Judgement rules are Quiet Chess's own. */
(function(root){'use strict';const E=root.QCEngine||require('./engine.js');
const win=cp=>50+50*(2/(1+Math.exp(-0.00368208*Math.max(-3000,Math.min(3000,cp))))-1);
const sc=l=>l.mate!=null?Math.sign(l.mate)*(30000-Math.abs(l.mate)*100):l.cp;
const V={p:1,n:3,b:3,r:5,q:9,k:99};
function uciEngine(tp){let cb=null;tp.onLine(d=>cb&&cb(d));tp.send('uci');
 return {search(fen,o){return new Promise(res=>{const best={};cb=d=>{if(d.startsWith('info')&&/ multipv \d/.test(d)){const mp=+d.match(/multipv (\d+)/)[1],m=d.match(/score (cp|mate) (-?\d+)/),pv=d.match(/ pv (.+)$/);if(m&&pv){const u=pv[1].trim().split(' ');best[mp]={[m[1]]:+m[2],uci:u[0],pv:u.slice(0,8)};}}
  else if(d.startsWith('bestmove'))res(Object.keys(best).sort().map(k=>best[k]));};
  tp.send('setoption name MultiPV value '+o.multipv);tp.send('position fen '+fen);tp.send('go depth '+o.depth);});},close(){tp.close&&tp.close();}};}
function sacrifice(s,m,ns){const val=V[s.b[m.from].toLowerCase()];if(val<3||val>9)return false;const cap=s.b[m.to]!=='.'?V[s.b[m.to].toLowerCase()]:0;
 const att=E.legal(ns).filter(x=>x.to===m.to).map(x=>V[ns.b[x.from].toLowerCase()]);if(!att.length)return false;
 return val-cap>=2&&(Math.min(...att)<val||!E.attacked(ns.b,m.to,s.t));}
async function analyze(states,moves,eng,o){o=o||{};const depth=o.depth||12,ev=[];
 for(let i=0;i<states.length;i++){const st=E.status(states[i]);
  ev.push(st?[{cp:st==='checkmate'?-30000:0,uci:''}]:await eng.search(E.toFEN(states[i]),{depth,multipv:2}));
  if(o.onProgress)o.onProgress((i+1)/states.length);}
 return moves.map((m,i)=>{const s=states[i],e=ev[i],bw=win(sc(e[0])),u=E.uci(m),same=e[0].uci===u;
  const pw=same?bw:win(-sc(ev[i+1][0])),loss=same?0:Math.max(0,bw-pw),gap=e[1]?bw-win(sc(e[1])):0;
  let cls='good';
  if(E.legal(s).length===1)cls='forced';
  else if(loss>20)cls='blunder';else if(loss>8)cls='mistake';else if(loss>3)cls='inacc';
  else if(pw>=45&&bw<92&&sacrifice(s,m,states[i+1]))cls='brilliant';
  else if(same&&gap>=12&&bw<97)cls='great';
  const bm=e[0].uci?E.fromUci(s,e[0].uci):null;
  return {cls,loss:Math.round(loss*10)/10,best:e[0].uci,bestSan:bm?E.san(s,bm):'',cp:sc(e[0]),bestPV:e[0].pv||[],playedPV:ev[i+1][0].pv||[]};});}

/* "flow" explanation: what the move allows, and what that makes possible */
const PN={p:'ポーン',n:'ナイト',b:'ビショップ',r:'ルーク',q:'クイーン',k:'キング'},pn=p=>PN[p.toLowerCase()],VAL={p:1,n:3,b:3,r:5,q:9,k:0};
const mat=s=>{let v=0;for(const p of s.b){if(p==='.')continue;const x=VAL[p.toLowerCase()];v+=p<'a'?x:-x;}return v;};
function plyInfo(s,m){const ns=E.make(s,m),me=s.t,opp=me==='w'?'b':'w',san=E.san(s,m),cap=s.b[m.to]!=='.'?s.b[m.to]:(m.fl==='ep'?(me==='w'?'p':'P'):null),tags=[];
  if(E.status(ns)==='checkmate')return{san,txt:'チェックメイト',cap,mate:1};
  if(cap)tags.push(pn(cap)+'を取る');if(m.promo)tags.push(pn(m.promo)+'に成る');if(m.fl==='oo'||m.fl==='ooo')tags.push('キャスリング');if(E.inCheck(ns))tags.push('王手');
  const ns2=Object.assign({},ns,{t:me,ep:-1}),pv=VAL[ns.b[m.to].toLowerCase()],tg=E.legal(ns2).filter(x=>x.from===m.to&&ns.b[x.to]!=='.'&&ns.b[x.to].toUpperCase()!=='K').map(x=>({p:ns.b[x.to],sq:x.to}));
  const worth=tg.filter(t=>VAL[t.p.toLowerCase()]>pv||!E.attacked(ns.b,t.sq,opp));
  if(E.inCheck(ns)&&worth.length>=1){const i=tags.indexOf('王手');if(i>=0)tags[i]=`王手しながら${pn(worth[0].p)}も狙う(フォーク)`;}else if(worth.length>=2)tags.push(`${pn(worth[0].p)}と${pn(worth[1].p)}の両方を狙う(フォーク)`);else if(worth.length===1&&!cap)tags.push(pn(worth[0].p)+'を狙う');
  return{san,txt:tags.join('、'),cap};}
function line(s0,ucis,n){const st=[s0],mv=[],info=[];let s=s0;for(const u of ucis.slice(0,n)){const m=E.fromUci(s,u);if(!m)break;info.push(plyInfo(s,m));mv.push(m);s=E.make(s,m);st.push(s);}return{st,mv,info};}
const steps=L=>L.info.map((x,i)=>({k:i+1,who:i%2===0?'あなた':'相手',text:x.san+(x.txt?'('+x.txt+')':'')}));
const mv2=x=>x.san+(x.txt?'('+x.txt+')':'');
function result(L,me){const mateAt=L.info.findIndex(x=>x.mate);if(mateAt>=0)return mateAt%2===1?'そのまま、詰まされます。':'チェックメイトできます。';
  const k=Math.min(L.st.length-1,4),d=(mat(L.st[k])-mat(L.st[0]))*(me==='w'?1:-1);return d<0?`この流れで、あなたは約${-d}点分の駒損になります。`:d>0?`この流れで、あなたは約${d}点分得をします。`:'';}
function flow(s0,m,an){const me=s0.t,P=line(s0,[E.uci(m)].concat(an.playedPV||[]),6),B=an.best?line(s0,an.bestPV&&an.bestPV.length?an.bestPV:[an.best],6):null;
  let sp='';const p1=P.info[1];if(p1&&p1.txt){sp=`この手を打つと、相手に ${mv2(p1)} を許してしまいます。`;const o2=P.info[3];if(o2&&o2.txt&&!P.info.some(x=>x.mate))sp+=`そのあと、相手は ${mv2(o2)} ができるようになります。`;}
  const rp=result(P,me);let sb='';if(B&&B.info[0])sb=`代わりに ${mv2(B.info[0])} と指せば、`+(B.info.some(x=>x.mate)&&B.info.findIndex(x=>x.mate)%2===0?'チェックメイトできます。':(result(B,me)||'形勢がよくなります。'));
  const k4=Math.min(P.st.length-1,4),d4=(mat(P.st[k4])-mat(P.st[0]))*(me==='w'?1:-1),i1=P.info[1];let alert='';
  if(P.info.some((x,i)=>x.mate&&i%2===1))alert='メイトを許しています(相手に詰まされます)。';
  else if(B&&B.info.some((x,i)=>x.mate&&i%2===0))alert='あなたには、チェックメイトの手がありました。';
  else if(i1&&i1.cap&&i1.cap.toUpperCase()==='Q')alert='クイーンを取られる形です。';
  else if(i1&&i1.cap&&d4<=-3)alert='この流れで、駒をただ取りされる形です。';
  return{playedSteps:steps(P),bestSteps:B?steps(B):[],sumPlayed:sp,resPlayed:rp,sumBest:sb,short:(sp+' '+rp).trim(),alert,bad:P.mv[1]?{from:P.mv[1].from,to:P.mv[1].to,cap:!!(i1&&i1.cap)}:null,best:B&&B.mv[0]?{from:B.mv[0].from,to:B.mv[0].to}:null};}
const api={analyze,uciEngine,win,flow,plyInfo};if(typeof module!=='undefined')module.exports=api;else root.QCAN=api;})(this);
