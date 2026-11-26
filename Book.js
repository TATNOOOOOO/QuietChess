/* QuietChess opening book: hand-picked mainline openings (SAN). The AI follows them for a few moves, chosen at random. */
(function(root){'use strict';
const L=`e4 e5 Nf3 Nc6 Bb5 a6 Ba4 Nf6 O-O Be7 Re1 b5 Bb3 d6 c3 O-O
e4 e5 Nf3 Nc6 Bb5 Nf6 O-O Nxe4 d4 Nd6 Bxc6 dxc6 dxe5 Nf5 Qxd8+ Kxd8
e4 e5 Nf3 Nc6 Bc4 Bc5 c3 Nf6 d3 d6 O-O O-O
e4 e5 Nf3 Nc6 Bc4 Bc5 b4 Bxb4 c3 Ba5 d4 exd4 O-O
e4 e5 Nf3 Nc6 Bc4 Nf6 d4 exd4 O-O Nxe4 Re1 d5
e4 e5 Nf3 Nc6 d4 exd4 Nxd4 Nf6 Nxc6 bxc6 e5 Qe7
e4 e5 Nf3 Nf6 Nxe5 d6 Nf3 Nxe4 d4 d5 Bd3 Nc6
e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 a6 Be3 e5 Nb3 Be6
e4 c5 Nf3 Nc6 d4 cxd4 Nxd4 Nf6 Nc3 e5 Ndb5 d6
e4 c5 Nf3 e6 d4 cxd4 Nxd4 Nc6 Nc3 Qc7
e4 c5 c3 Nf6 e5 Nd5 d4 cxd4 Nf3 Nc6
e4 c5 Nc3 Nc6 g3 g6 Bg2 Bg7 d3 d6
e4 e6 d4 d5 Nc3 Nf6 Bg5 Be7 e5 Nfd7 Bxe7 Qxe7
e4 e6 d4 d5 e5 c5 c3 Nc6 Nf3 Qb6
e4 e6 d4 d5 Nd2 Nf6 e5 Nfd7 Bd3 c5 c3 Nc6
e4 c6 d4 d5 Nc3 dxe4 Nxe4 Bf5 Ng3 Bg6 h4 h6 Nf3 Nd7
e4 c6 d4 d5 e5 Bf5 Nf3 e6 Be2 c5 O-O Nc6
e4 c6 Nc3 d5 Nf3 Bg4 h3 Bxf3 Qxf3 e6
e4 d5 exd5 Qxd5 Nc3 Qa5 d4 Nf6 Nf3 c6 Bc4 Bf5
e4 d6 d4 Nf6 Nc3 g6 Nf3 Bg7 Be2 O-O O-O c6
d4 d5 c4 e6 Nc3 Nf6 Bg5 Be7 e3 O-O Nf3 h6 Bh4 b6
d4 d5 c4 c6 Nf3 Nf6 Nc3 dxc4 a4 Bf5 e3 e6 Bxc4 Bb4
d4 d5 c4 dxc4 Nf3 Nf6 e3 e6 Bxc4 c5 O-O a6
d4 d5 c4 e6 Nf3 Nf6 g3 Be7 Bg2 O-O O-O dxc4
d4 d5 c4 e6 Nc3 c6 e3 Nf6 Nf3 Nbd7 Bd3 dxc4 Bxc4 b5 Bd3 a6 e4 c5
d4 Nf6 c4 e6 Nc3 Bb4 e3 O-O Bd3 d5 Nf3 c5 O-O Nc6
d4 Nf6 c4 g6 Nc3 Bg7 e4 d6 Nf3 O-O Be2 e5 O-O Nc6
d4 Nf6 c4 e6 Nf3 b6 g3 Bb7 Bg2 Be7 O-O O-O Nc3 Ne4
d4 d5 Bf4 Nf6 e3 c5 c3 Nc6 Nd2 e6 Ngf3 Bd6 Bg3 O-O
d4 Nf6 Bf4 e6 e3 d5 Nf3 Bd6 Bg3 O-O Nbd2 c5
c4 e5 Nc3 Nf6 Nf3 Nc6 g3 d5 cxd5 Nxd5 Bg2 Nb6 O-O Be7
c4 c5 Nf3 Nf6 Nc3 Nc6 g3 d5 cxd5 Nxd5 Bg2 Nxc3 bxc3 g6
Nf3 d5 g3 Nf6 Bg2 e6 O-O Be7 d3 O-O Nbd2 c5 e4 Nc6
Nf3 Nf6 c4 g6 Nc3 Bg7 e4 d6 d4 O-O Be2 e5 O-O Nc6`.split('\n').map(l=>l.trim().split(/\s+/).map(x=>x.replace(/[+#!?]/g,'')));
const n=s=>s.replace(/[+#!?]/g,'');
function pick(sans,maxPly){const k=sans.length;if(k>=maxPly)return null;const c=L.filter(l=>l.length>k&&sans.every((x,i)=>l[i]===n(x)));return c.length?c[Math.random()*c.length|0][k]:null;}
const api={pick,lines:L};if(typeof module!=='undefined')module.exports=api;else root.QCBook=api;})(this);
