/* QuietChess PGN import/export */
(function(root){'use strict';const E=root.QCEngine||require('./engine.js');
const norm=t=>t.replace(/[+#!?]/g,'').replace(/0/g,'O').replace(/e\.p\./,'');
const wrap=s=>{let l='',o=[];for(const x of s.split(' ')){if((l+x).length>78){o.push(l.trim());l='';}l+=x+' ';}o.push(l.trim());return o.join('\n');};
function toPGN(g){const tg=[['Event',g.event||'Quiet Chess'],['Site','Quiet Chess'],['Date',(g.date||'').replace(/-/g,'.')||'????.??.??'],['White',g.white||'White'],['Black',g.black||'Black'],['Result',g.result||'*']];
 let m='';g.sans.forEach((x,i)=>{if(i%2===0)m+=(i/2+1)+'. ';m+=x+' ';});m+=g.result||'*';
 return tg.map(([k,v])=>`[${k} "${v}"]`).join('\n')+'\n\n'+wrap(m)+'\n';}
function parse(txt){txt=txt.replace(/\r/g,'');const games=txt.split(/(?=\[Event )/).filter(x=>x.trim());let t=games[0]||txt;
 const tags={};t.replace(/\[(\w+)\s+"([^"]*)"\]/g,(a,k,v)=>{tags[k]=v;return a;});
 let mt=t.replace(/\[[^\]]*\]/g,' ').replace(/\{[^}]*\}/g,' ').replace(/;[^\n]*/g,' ');
 for(let i=0;i<5;i++)mt=mt.replace(/\([^()]*\)/g,' ');
 const toks=mt.replace(/\$\d+/g,' ').split(/\s+/).map(x=>x.replace(/^\d+\.+/,'')).filter(Boolean);
 let s=E.fromFEN(tags.FEN||E.START);const states=[s],moves=[],sans=[];let result=tags.Result||'*';
 for(const k of toks){if(/^(1-0|0-1|1\/2-1\/2|\*)$/.test(k)){result=k;break;}
  const m=E.legal(s).find(x=>norm(E.san(s,x))===norm(k));if(!m)throw new Error('「'+k+'」を読み取れませんでした('+(sans.length+1)+'手目)');
  sans.push(E.san(s,m));moves.push(m);s=E.make(s,m);states.push(s);}
 if(!moves.length)throw new Error('指し手が見つかりませんでした');
 return {tags,sans,moves,states,result,white:tags.White||'白',black:tags.Black||'黒',date:(tags.Date||'').replace(/\./g,'-')};}
const api={toPGN,parse};if(typeof module!=='undefined')module.exports=api;else root.QCPGN=api;})(this);
