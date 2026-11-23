/* QuietChess rules engine (own implementation). Board: index 0=a8 ... 63=h1. */
(function(root){
'use strict';
const N=[[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]];
const K=[[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
const B=[[-1,-1],[-1,1],[1,-1],[1,1]], R=[[-1,0],[1,0],[0,-1],[0,1]], Q=B.concat(R);
const START='rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
const isW=p=>p>='A'&&p<='Z';
const name=i=>'abcdefgh'[i&7]+(8-(i>>3));
const idx=s=>'abcdefgh'.indexOf(s[0])+(8-+s[1])*8;
const inb=(r,f)=>r>=0&&r<8&&f>=0&&f<8;
function fromFEN(fen){
  const [pl,t,c,ep,hm,fm]=fen.trim().split(/\s+/); const b=[];
  for(const ch of pl){ if(ch==='/')continue; if(ch>='1'&&ch<='8'){for(let k=0;k<+ch;k++)b.push('.');} else b.push(ch); }
  return {b,t,c:(c==='-'||!c)?'':c,ep:(!ep||ep==='-')?-1:idx(ep),hm:+(hm||0),fm:+(fm||1)};
}
function toFEN(s){
  let o=''; for(let r=0;r<8;r++){ let e=0; for(let f=0;f<8;f++){const p=s.b[r*8+f]; if(p==='.')e++; else{ if(e){o+=e;e=0;} o+=p; }} if(e)o+=e; if(r<7)o+='/'; }
  return o+' '+s.t+' '+(s.c||'-')+' '+(s.ep<0?'-':name(s.ep))+' '+s.hm+' '+s.fm;
}
function attacked(b,i,by){
  const r=i>>3,f=i&7,w=by==='w',pr=r+(w?1:-1);
  for(const df of[-1,1]) if(inb(pr,f+df)&&b[pr*8+f+df]===(w?'P':'p'))return true;
  for(const [dr,df] of N) if(inb(r+dr,f+df)&&b[(r+dr)*8+f+df]===(w?'N':'n'))return true;
  for(const [dr,df] of K) if(inb(r+dr,f+df)&&b[(r+dr)*8+f+df]===(w?'K':'k'))return true;
  for(const [dirs,a] of [[B,'B'],[R,'R']]) for(const [dr,df] of dirs){
    let rr=r+dr,ff=f+df;
    while(inb(rr,ff)){ const p=b[rr*8+ff]; if(p!=='.'){ if(p===(w?a:a.toLowerCase())||p===(w?'Q':'q'))return true; break; } rr+=dr; ff+=df; }
  }
  return false;
}
function pseudo(s){
  const {b,t,c,ep}=s,w=t==='w',opp=w?'b':'w',out=[];
  const own=p=>p!=='.'&&isW(p)===w, enemy=p=>p!=='.'&&isW(p)!==w;
  for(let i=0;i<64;i++){
    const p=b[i]; if(p==='.'||isW(p)!==w)continue;
    const u=p.toUpperCase(),r=i>>3,f=i&7;
    if(u==='P'){
      const dr=w?-1:1,st=w?6:1,last=w?0:7,r1=r+dr;
      const add=(to,fl)=>{ if((to>>3)===last){for(const pr of'qrbn')out.push({from:i,to,promo:pr,fl});} else out.push({from:i,to,promo:'',fl}); };
      if(b[r1*8+f]==='.'){ add(r1*8+f,''); if(r===st&&b[(r+2*dr)*8+f]==='.')out.push({from:i,to:(r+2*dr)*8+f,promo:'',fl:'dp'}); }
      for(const df of[-1,1]){ const ff=f+df; if(ff<0||ff>7)continue; const to=r1*8+ff;
        if(enemy(b[to]))add(to,'x'); else if(to===ep)out.push({from:i,to,promo:'',fl:'ep'}); }
    } else if(u==='N'||u==='K'){
      for(const [dr,df] of(u==='N'?N:K)){ if(!inb(r+dr,f+df))continue; const to=(r+dr)*8+f+df; if(!own(b[to]))out.push({from:i,to,promo:'',fl:''}); }
      if(u==='K'){
        const base=w?56:0,ks=w?'K':'k',qs=w?'Q':'q',rk=w?'R':'r';
        if(i===base+4&&!attacked(b,i,opp)){
          if(c.includes(ks)&&b[base+5]==='.'&&b[base+6]==='.'&&b[base+7]===rk&&!attacked(b,base+5,opp)&&!attacked(b,base+6,opp))out.push({from:i,to:base+6,promo:'',fl:'oo'});
          if(c.includes(qs)&&b[base+3]==='.'&&b[base+2]==='.'&&b[base+1]==='.'&&b[base]===rk&&!attacked(b,base+3,opp)&&!attacked(b,base+2,opp))out.push({from:i,to:base+2,promo:'',fl:'ooo'});
        }
      }
    } else {
      for(const [dr,df] of(u==='B'?B:u==='R'?R:Q)){
        let rr=r+dr,ff=f+df;
        while(inb(rr,ff)){ const to=rr*8+ff; if(own(b[to]))break; out.push({from:i,to,promo:'',fl:''}); if(b[to]!=='.')break; rr+=dr; ff+=df; }
      }
    }
  }
  return out;
}
function make(s,m){
  const b=s.b.slice(),p=b[m.from],w=s.t==='w';
  const cap=b[m.to]!=='.'||m.fl==='ep';
  b[m.to]=m.promo?(w?m.promo.toUpperCase():m.promo):p; b[m.from]='.';
  if(m.fl==='ep')b[m.to+(w?8:-8)]='.';
  if(m.fl==='oo'){b[m.to-1]=b[m.to+1];b[m.to+1]='.';}
  if(m.fl==='ooo'){b[m.to+1]=b[m.to-2];b[m.to-2]='.';}
  let c=s.c; const drop={60:'KQ',4:'kq',63:'K',56:'Q',7:'k',0:'q'};
  for(const sqr of[m.from,m.to]) if(drop[sqr]) for(const ch of drop[sqr]) c=c.replace(ch,'');
  return {b,t:w?'b':'w',c,ep:m.fl==='dp'?(m.from+m.to)/2:-1,hm:(p.toUpperCase()==='P'||cap)?0:s.hm+1,fm:s.fm+(w?0:1)};
}
function kingSq(s,color){ return s.b.indexOf(color==='w'?'K':'k'); }
function inCheck(s){ return attacked(s.b,kingSq(s,s.t),s.t==='w'?'b':'w'); }
function legal(s){
  const opp=s.t==='w'?'b':'w';
  return pseudo(s).filter(m=>{ const ns=make(s,m); return !attacked(ns.b,kingSq(ns,s.t),opp); });
}
function san(s,m){
  const p=s.b[m.from].toUpperCase(); let o;
  if(m.fl==='oo')o='O-O'; else if(m.fl==='ooo')o='O-O-O';
  else{
    const cap=s.b[m.to]!=='.'||m.fl==='ep';
    if(p==='P')o=(cap?'abcdefgh'[m.from&7]+'x':'')+name(m.to)+(m.promo?'='+m.promo.toUpperCase():'');
    else{
      const oth=legal(s).filter(x=>x.to===m.to&&x.from!==m.from&&s.b[x.from]===s.b[m.from]); let d='';
      if(oth.length){ const sf=oth.some(x=>(x.from&7)===(m.from&7)),sr=oth.some(x=>(x.from>>3)===(m.from>>3)); d=!sf?'abcdefgh'[m.from&7]:!sr?String(8-(m.from>>3)):name(m.from); }
      o=p+d+(cap?'x':'')+name(m.to);
    }
  }
  const ns=make(s,m); if(inCheck(ns))o+=legal(ns).length?'+':'#';
  return o;
}
function uci(m){ return name(m.from)+name(m.to)+m.promo; }
function fromUci(s,u){ return legal(s).find(m=>uci(m)===u)||null; }
function status(s){
  if(!legal(s).length) return inCheck(s)?'checkmate':'stalemate';
  if(s.hm>=100)return 'fifty';
  const rest=s.b.filter(p=>p!=='.'&&p.toUpperCase()!=='K');
  if(rest.length===0||(rest.length===1&&'NBnb'.includes(rest[0])))return 'insufficient';
  return '';
}
function perft(s,d){ if(!d)return 1; let n=0; for(const m of legal(s))n+=perft(make(s,m),d-1); return n; }
const api={START,fromFEN,toFEN,legal,make,san,uci,fromUci,inCheck,status,perft,name,idx,attacked};
if(typeof module!=='undefined')module.exports=api; else root.QCEngine=api;
})(this);
