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
const api={analyze,uciEngine,win};if(typeof module!=='undefined')module.exports=api;else root.QCAN=api;})(this);
