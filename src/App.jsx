import { useState, useEffect, useCallback } from "react";
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Share+Tech+Mono&family=Barlow:wght@400;500;600&family=Barlow+Condensed:wght@600;700;800;900&display=swap');
*, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
html { -webkit-font-smoothing:antialiased; }
body { background:#0E0E0E; }
::selection { background:#FF4500; color:#000; }
input::placeholder { color:#272727; font-family:'Barlow',sans-serif; }
textarea::placeholder { color:#272727; font-family:'Barlow',sans-serif; }
input:focus, textarea:focus { outline:none; }
input[type="date"]::-webkit-calendar-picker-indicator { filter:invert(0.35); cursor:pointer; }
::-webkit-scrollbar { width:4px; }
::-webkit-scrollbar-track { background:#0E0E0E; }
::-webkit-scrollbar-thumb { background:#2A2A2A; }
.checker { background-color:#161616; background-image:repeating-conic-gradient(rgba(255,255,255,0.022) 0% 25%,transparent 0% 50%); background-size:16px 16px; }
.grid-bg { background-image:linear-gradient(rgba(255,255,255,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.025) 1px,transparent 1px); background-size:28px 28px; }
.hazard { background:repeating-linear-gradient(-45deg,#FF4500 0px,#FF4500 8px,#111 8px,#111 18px); }
.hazard-amber { background:repeating-linear-gradient(-45deg,#D4940F 0px,#D4940F 8px,#111 8px,#111 18px); }
@keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
@keyframes fadeDown { from{opacity:0;transform:translateY(-20px)} to{opacity:1;transform:translateY(0)} }
@keyframes fadeIn { from{opacity:0} to{opacity:1} }
@keyframes scaleIn { from{opacity:0;transform:scale(0.92) translateY(16px)} to{opacity:1;transform:scale(1) translateY(0)} }
@keyframes spin { to{transform:rotate(360deg)} }
@keyframes blink { 0%,100%{opacity:1}50%{opacity:0.2} }
@keyframes stampIn { 0%{opacity:0;transform:scale(1.6) rotate(-12deg)} 70%{transform:scale(0.94) rotate(2deg)} 100%{opacity:1;transform:scale(1) rotate(0)} }
.enter { animation:fadeUp 0.3s cubic-bezier(0.22,1,0.36,1) both; }
.back { animation:fadeDown 0.3s cubic-bezier(0.22,1,0.36,1) both; }
.stamp { animation:stampIn 0.6s 0.2s cubic-bezier(0.22,1,0.36,1) both; }
.field:focus { border-color:#FF4500!important; box-shadow:0 0 0 2px rgba(255,69,0,0.12)!important; background:#141414!important; }
.reg-plate:focus { border-color:#FF4500!important; box-shadow:0 0 0 2px rgba(255,69,0,0.12)!important; }
.ghost:hover { border-color:rgba(255,255,255,0.22)!important; color:#fff!important; }
.primary:hover{ filter:brightness(1.1); box-shadow:0 0 40px rgba(255,69,0,0.4)!important; }
.svc:hover { transform:translateY(-3px)!important; }
.slot:hover:not(:disabled) { border-color:#FF4500!important; color:#FF4500!important; background:rgba(255,69,0,0.07)!important; }
.tag:hover { border-color:rgba(255,69,0,0.45)!important; color:#FF4500!important; }
.nav-a:hover { color:#FF4500!important; }
.upload:hover { border-color:#FF4500!important; background:rgba(255,69,0,0.04)!important; }
.statbox:hover{ background:rgba(255,255,255,0.03)!important; cursor:pointer; }
.trow:hover { background:rgba(255,255,255,0.03)!important; }
.stab:hover { background:rgba(255,255,255,0.04)!important; }
.reg-plate { font-family:'Share Tech Mono',monospace; font-size:20px; letter-spacing:8px; text-transform:uppercase; border:2px solid rgba(255,255,255,0.12); border-radius:3px; background:#0E0E0E; color:#E8E8E8; padding:13px 16px; width:100%; text-align:center; transition:all 0.2s; display:block; }
.reg-plate::placeholder { letter-spacing:4px; color:#272727; }
`;

const C = {
bg:"#0E0E0E", bg1:"#111", bg2:"#141414", panel:"#1A1A1A", panelHi:"#1E1E1E",
border:"rgba(255,255,255,0.07)", borderLo:"rgba(255,255,255,0.04)",
accent:"#FF4500", accentDim:"rgba(255,69,0,0.1)", accentGlow:"rgba(255,69,0,0.25)",
amber:"#D4940F", amberDim:"rgba(212,148,15,0.1)",
green:"#0A9E4E", greenDim:"rgba(10,158,78,0.1)",
red:"#C63232", redDim:"rgba(198,50,50,0.1)",
text:"#E4E4E4", sub:"#7A828F", muted:"#3E424A", dim:"#252525",
};
const F = { T:"'Bebas Neue','Impact',sans-serif", M:"'Share Tech Mono',monospace", B:"'Barlow',sans-serif", BC:"'Barlow Condensed',sans-serif" };
const WS = { name:"HUSSEIN'S BILSERVICE", sub:"Auktoriserad Verkstad", phone:"0790-574 975", phonePlain:"0790574975", email:"husseinmormor@gmail.com", hours:"Mån–Fre 08:00–17:00", since:"2010" };
const SLOTS = ["08:00","09:30","11:00","12:30","14:00","15:30"];
const MAX = 5;
const ADMIN_PW = "admin2024";
const TAGS = ["Konstigt ljud","Motorproblem","Vibration","Startar ej","Motorlampa","Oljebyte","Bromsservice","Däckbyte","Kylarsystem","Elektrisk fel"];
const STEPS = [{n:1,lbl:"KUNDINFORMATION"},{n:2,lbl:"SERVICETYP"},{n:3,lbl:"FELANMÄLAN"},{n:4,lbl:"DOKUMENTATION"},{n:5,lbl:"BEKRÄFTELSE"}];
const SVCS_LIST = ["Motor & diagnos","Bromsservice","Oljebyte","Däckbyte","El-system","Kylarsystem","Transmission","Avgassystem"];
function getAll() { try{return JSON.parse(localStorage.getItem("hbs7")||"[]")}catch{return[]} }
function saveAll(a) { localStorage.setItem("hbs7",JSON.stringify(a)) }
function storaOn(d) { return getAll().filter(b=>b.date===d&&b.jobType==="stora").length }
function slotsOn(d) { return getAll().filter(b=>b.date===d).map(b=>b.time) }
function isWe(d) { if(!d)return false; const w=new Date(d+"T12:00:00").getDay(); return w===0||w===6 }
function isPast(d) { if(!d)return false; const t=new Date(); t.setHours(0,0,0,0); return new Date(d+"T00:00:00")<t }
function tod() { return new Date().toISOString().split("T")[0] }
function fmtL(d) { if(!d)return"–"; return new Date(d+"T12:00:00").toLocaleDateString("sv-SE",{weekday:"long",year:"numeric",month:"long",day:"numeric"}) }
function fmtS(d) { if(!d)return"–"; return new Date(d+"T12:00:00").toLocaleDateString("sv-SE",{day:"numeric",month:"short"}) }
function curTime() { return new Date().toLocaleTimeString("sv-SE",{hour:"2-digit",minute:"2-digit"}) }
function sendMail(b) {
const s=encodeURIComponent(`NY BOKNING — ${b.name} — ${fmtS(b.date)}`);
const t=encodeURIComponent(`ARBETSORDER\n${"─".repeat(28)}\nKUND: ${b.name}\nTEL: ${b.phone}\nEPOST: ${b.email}\nREG.NR: ${b.regno||"–"}\n${"─".repeat(28)}\nTJÄNST: ${b.jobType==="enkla"?"Snabbservice":"Större jobb"}\nDATUM: ${b.jobType==="enkla"?"Drop-in":fmtL(b.date)}\nTID: ${b.time}\n${"─".repeat(28)}\nFEL:\n${b.description||"–"}\n\nID: ${b.id}`);
window.open(`mailto:${WS.email}?subject=${s}&body=${t}`,"_blank");
}
/* ── Shared primitives ── */
const Inp = {
base:{ width:"100%",background:C.bg2,border:`1px solid ${C.border}`,borderRadius:0,padding:"11px 14px",color:C.text,fontSize:14,fontFamily:F.B,letterSpacing:"0.1px",transition:"all 0.2s",display:"block" },
};
const Btn = {
primary:{ background:`linear-gradient(180deg,#FF5722 0%,#CC3A10 100%)`,border:"none",padding:"12px 24px",color:"#fff",fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:F.T,letterSpacing:"2px",transition:"all 0.2s",borderRadius:0 },
ghost:{ background:"transparent",border:`1px solid ${C.border}`,padding:"9px 16px",color:C.sub,fontSize:11,cursor:"pointer",fontFamily:F.M,letterSpacing:"1px",transition:"all 0.18s",borderRadius:0 },
};
const Lbl = { fontFamily:F.M,fontSize:9,letterSpacing:"1.5px",textTransform:"uppercase",color:C.muted,margin:0 };

function Glb() { return <style dangerouslySetInnerHTML={{__html:CSS}}/>; }
function Fnt() { return <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Share+Tech+Mono&family=Barlow:wght@400;500;600&family=Barlow+Condensed:wght@600;700;800;900&display=swap" rel="stylesheet"/>; }
function Err({msg}) { return <p style={{fontFamily:F.M,color:C.red,fontSize:9,marginTop:6,letterSpacing:"0.5px"}}>ERR: {msg.toUpperCase()}</p>; }
function WField({ label, ph, type="text", value, err, onChange, hint, min }) {
return (
<div>
<label style={{...Lbl,display:"block",marginBottom:7}}>{label}</label>
<input type={type} placeholder={ph} value={value} min={min} className="field" onChange={e=>onChange(e.target.value)} style={{...Inp.base,...(err?{borderColor:C.red+"70"}:{})}}/>
{hint&&!err&&<p style={{fontFamily:F.M,fontSize:9,color:C.muted,marginTop:5,letterSpacing:"0.5px"}}>{hint}</p>}
{err&&<Err msg={err}/>}
</div>
);
}
function WCard({ title, sub, stepNum, children }) {
return (
<div style={{border:`1px solid ${C.border}`,background:C.panel,boxShadow:"0 20px 60px rgba(0,0,0,0.5)"}}>
<div style={{borderBottom:`1px solid ${C.border}`,padding:"14px 20px",display:"flex",gap:12,alignItems:"flex-start",background:C.panelHi}}>
<div style={{width:3,background:C.accent,alignSelf:"stretch",flexShrink:0}}/>
<div>
<p style={{fontFamily:F.M,fontSize:9,color:C.accent,letterSpacing:"2px",marginBottom:5}}>STEG {String(stepNum).padStart(2,"0")} / 05</p>
<h2 style={{fontFamily:F.T,fontSize:22,color:C.text,letterSpacing:"1px",lineHeight:1,marginBottom:3}}>{title}</h2>
<p style={{fontFamily:F.M,fontSize:9,color:C.muted,letterSpacing:"0.5px"}}>{sub}</p>
</div>
</div>
<div style={{padding:"22px 20px"}}>{children}</div>
</div>
);
}
function NavRow({ step, onNext, onBack, nextLabel="NÄSTA", isLast=false }) {
const ArrowR = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>;
const ArrowL = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>;
return (
<div style={{display:"flex",gap:8,marginTop:20,paddingTop:16,borderTop:`1px solid ${C.border}`}}>
{onBack&&<button onClick={onBack} className="ghost" style={{...Btn.ghost,padding:"11px 14px",flexShrink:0,display:"flex",alignItems:"center",gap:6}}><ArrowL/> TILLBAKA</button>}
<button onClick={onNext} className="primary" style={{...Btn.primary,flex:1,padding:"12px",fontSize:15,letterSpacing:"2.5px",display:"flex",alignItems:"center",justifyContent:"center",gap:10}}>
{nextLabel} <ArrowR/>
</button>
</div>
);
}
/* ══ ADMIN ══ */
function Admin({ onBack }) {
const [auth,setAuth]=useState(false); const [pw,setPw]=useState(""); const [err,setErr]=useState(false); const [ld,setLd]=useState(false);

const [data,setData]=useState([]); const [filt,setFilt]=useState("all"); const [q,setQ]=useState("");
useEffect(()=>{ if(auth) setData(getAll()) },[auth]);
function upd(id,s){ const u=getAll().map(b=>b.id===id?{...b,status:s}:b); saveAll(u); setData(u) }
function del(id){ if(!confirm("Ta bort?"))return; const u=getAll().filter(b=>b.id!==id); saveAll(u); setData(u) }
async function login(){ setLd(true); await new Promise(r=>setTimeout(r,500)); setLd(false); if(pw===ADMIN_PW)setAuth(true); else{setErr(true);setPw("")} }
const sc={Ny:C.amber,Pågående:C.accent,Klar:C.green};
const rows=data.filter(b=>filt==="all"||b.status===filt).filter(b=>!q||b.name.toLowerCase().includes(q.toLowerCase())||b.phone.includes(q)).sort((a,b)=>a.date>b.date?1:-1);
const cnt={all:data.length,Ny:data.filter(b=>b.status==="Ny").length,Pågående:data.filter(b=>b.status==="Pågående").length,Klar:data.filter(b=>b.status==="Klar").length};
if(!auth) return (
<div style={{minHeight:"100vh",background:C.bg,fontFamily:F.B,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
<Glb/><Fnt/>
<div style={{width:"100%",maxWidth:380}}>
<button onClick={onBack} className="ghost" style={{...Btn.ghost,marginBottom:36}}>← TILLBAKA</button>
<div className="hazard" style={{height:8}}/>
<div style={{background:C.panel,border:`1px solid ${C.border}`,borderTop:"none",borderBottom:"none",padding:"28px 28px 32px"}}>
<p style={{fontFamily:F.M,fontSize:9,color:C.accent,letterSpacing:"2px",marginBottom:10}}>// SKYDDAD ÅTKOMST</p>
<h1 style={{fontFamily:F.T,fontSize:60,color:C.text,lineHeight:0.9,marginBottom:4,letterSpacing:"1px"}}>ADMIN<br/><span style={{color:C.accent}}>PANEL</span></h1>
<p style={{fontFamily:F.M,fontSize:9,color:C.muted,marginBottom:28,marginTop:8,letterSpacing:"1px"}}>{WS.name}</p>
<label style={{...Lbl,display:"block",marginBottom:7}}>LÖSENORD</label>
<input type="password" value={pw} autoFocus placeholder="••••••••••" className="field"
onChange={e=>{setPw(e.target.value);setErr(false)}} onKeyDown={e=>e.key==="Enter"&&login()}
style={{...Inp.base,...(err?{borderColor:C.red}:{})}}/>
{err&&<p style={{fontFamily:F.M,color:C.red,fontSize:9,marginTop:7,letterSpacing:"0.5px"}}>ERR: FEL LÖSENORD</p>}
<button onClick={login} disabled={ld} className="primary" style={{...Btn.primary,width:"100%",marginTop:14,padding:"15px",fontSize:18,letterSpacing:"2px"}}>
{ld?<span style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8}}><span style={{width:14,height:14,border:"2px solid rgba(0,0,0,0.3)",borderTopColor:"#000",borderRadius:"50%",display:"inline-block",animation:"spin 0.7s linear infinite"}}/>VERIFIERAR</span>:"LOGGA IN"}
</button>
</div>
<div className="hazard" style={{height:8}}/>
</div>
</div>
);
return (
<div style={{minHeight:"100vh",background:C.bg,fontFamily:F.B,color:C.text}}>
<Glb/><Fnt/>
<div style={{borderBottom:`1px solid ${C.border}`,height:52,display:"flex",alignItems:"center",padding:"0 24px",gap:14,position:"sticky",top:0,background:"rgba(14,14,14,0.97)",backdropFilter:"blur(8px)",zIndex:50}}>
<div style={{width:28,height:28,background:C.accent,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
</div>
<button onClick={onBack} className="ghost" style={{...Btn.ghost,fontSize:10,padding:"5px 10px"}}>← BOKNING</button>
<div style={{width:1,height:14,background:C.border}}/>
<span style={{fontFamily:F.T,fontSize:16,letterSpacing:"2px"}}>{WS.name} — ADMINPANEL</span>
<div style={{marginLeft:"auto"}}>
<input placeholder="Sök kund..." value={q} onChange={e=>setQ(e.target.value)} className="field" style={{...Inp.base,width:200,height:32,padding:"0 12px",fontSize:12}}/>
</div>
</div>

<div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",borderBottom:`1px solid ${C.border}`}}>
{[{l:"TOTALT",n:cnt.all,c:C.sub,k:"all"},{l:"NYA",n:cnt.Ny,c:C.amber,k:"Ny"},{l:"PÅGÅENDE",n:cnt.Pågående,c:C.accent,k:"Pågående"},{l:"KLARA",n:cnt.Klar,c:C.green,k:"Klar"}].map((x,i)=>(
<div key={x.k} className="statbox" onClick={()=>setFilt(x.k)} style={{padding:"18px 24px",borderRight:i<3?`1px solid ${C.border}`:"none",background:filt===x.k?`${x.c}09`:"transparent",transition:"all 0.15s",borderBottom:filt===x.k?`2px solid ${x.c}`:"2px solid transparent"}}>
<p style={{fontFamily:F.M,fontSize:8,color:C.muted,marginBottom:8,letterSpacing:"1.5px"}}>{x.l}</p>
<p style={{fontFamily:F.T,fontSize:44,color:x.c,lineHeight:1,letterSpacing:"1px"}}>{x.n}</p>
</div>
))}
</div>
<div style={{padding:"12px 24px",display:"flex",gap:6,borderBottom:`1px solid ${C.border}`,background:C.bg1}}>
{["all","Ny","Pågående","Klar"].map(f=>(
<button key={f} onClick={()=>setFilt(f)} className="ghost" style={{...Btn.ghost,fontSize:10,padding:"5px 12px",...(filt===f?{borderColor:`${C.accent}80`,color:C.accent,background:C.accentDim}:{})}}>
{f==="all"?"ALLA":f.toUpperCase()}
</button>
))}
</div>
<div style={{padding:"0 24px 60px",overflowX:"auto"}}>
{rows.length===0
?<div style={{textAlign:"center",padding:"80px 0"}}><p style={{fontFamily:F.T,fontSize:36,color:C.muted,letterSpacing:"2px"}}>INGA BOKNINGAR</p></div>
:<table style={{width:"100%",borderCollapse:"collapse",minWidth:820,marginTop:14}}>
<thead><tr style={{borderBottom:`1px solid ${C.border}`}}>{["KUND","FORDON","DATUM / TID","TJÄNST","KONTAKT","STATUS",""].map(h=><th key={h} style={{fontFamily:F.M,fontSize:8,fontWeight:400,letterSpacing:"1.5px",padding:"9px 14px",textAlign:"left",color:C.muted}}>{h}</th>)}</tr></thead>
<tbody>
{rows.map(b=>(
<tr key={b.id} className="trow" style={{borderBottom:`1px solid rgba(255,255,255,0.03)`,transition:"background 0.12s"}}>
<td style={{padding:"13px 14px"}}><p style={{fontFamily:F.BC,fontWeight:700,fontSize:14,color:C.text}}>{b.name}</p><p style={{fontFamily:F.M,fontSize:8,color:C.muted,marginTop:2}}>#{b.id.slice(-6)}</p></td>
<td style={{padding:"13px 14px"}}>{b.regno?<div style={{fontFamily:F.M,fontSize:13,color:C.text,background:"#0E0E0E",border:"1px solid rgba(255,255,255,0.1)",padding:"4px 8px",letterSpacing:"5px",display:"inline-block"}}>{b.regno}</div>:<span style={{color:C.muted,fontSize:10}}>—</span>}</td>
<td style={{padding:"13px 14px"}}><p style={{fontSize:12,color:C.sub}}>{b.date||"Drop-in"}</p><p style={{fontFamily:F.M,fontSize:13,color:C.accent,marginTop:3}}>{b.time}</p></td>
<td style={{padding:"13px 14px"}}><span style={{fontFamily:F.M,fontSize:9,letterSpacing:"0.5px",padding:"4px 8px",color:b.jobType==="enkla"?C.amber:C.accent,background:b.jobType==="enkla"?C.amberDim:C.accentDim}}>{b.jobType==="enkla"?"SNABBSERVICE":"STÖRRE JOBB"}</span></td>
<td style={{padding:"13px 14px"}}><p style={{fontSize:12,color:C.sub}}>{b.phone}</p><p style={{fontSize:10,color:C.muted,marginTop:2}}>{b.email}</p></td>
<td style={{padding:"13px 14px"}}><div style={{display:"flex",gap:4}}>{["Ny","Pågående","Klar"].map(s=><button key={s} onClick={()=>upd(b.id,s)} style={{padding:"4px 8px",border:"none",cursor:"pointer",fontFamily:F.M,fontSize:9,letterSpacing:"0.5px",transition:"all 0.12s",background:b.status===s?`${sc[s]}22`:"transparent",color:b.status===s?sc[s]:C.muted,outline:b.status===s?`1px solid ${sc[s]}55`:"none"}}>{s.toUpperCase()}</button>)}</div></td>
<td style={{padding:"13px 14px"}}><button onClick={()=>del(b.id)} className="ghost" style={{...Btn.ghost,fontSize:9,padding:"4px 8px",color:C.muted}}>TA BORT</button></td>
</tr>
))}
</tbody>
</table>}
</div>
</div>
);
}
/* ══ SUCCESS ══ */
function Success({ booking, onClose }) {
return (
<div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.92)",backdropFilter:"blur(12px)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200,padding:20,animation:"fadeIn 0.3s ease",fontFamily:F.B}}>
<div onClick={e=>e.stopPropagation()} style={{width:"100%",maxWidth:480,animation:"scaleIn 0.35s cubic-bezier(0.22,1,0.36,1) both"}}>

<div className="hazard" style={{height:10}}/>
<div style={{background:C.panel,border:`1px solid ${C.border}`,borderTop:"none",borderBottom:"none"}}>
<div style={{background:C.bg2,borderBottom:`1px solid ${C.border}`,padding:"16px 24px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
<div>
<p style={{fontFamily:F.M,fontSize:8,color:C.muted,letterSpacing:"2px",marginBottom:4}}>ARBETSORDER BEKRÄFTAD</p>
<p style={{fontFamily:F.T,fontSize:24,color:C.text,letterSpacing:"1px"}}>BOKNING MOTTAGEN</p>
</div>
<div className="stamp" style={{width:72,height:72,borderRadius:"50%",border:`3px solid ${C.green}`,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",flexShrink:0}}>
<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
<span style={{fontFamily:F.M,fontSize:7,color:C.green,letterSpacing:"1px",marginTop:3}}>GODKÄND</span>
</div>
</div>
<div style={{padding:"22px 24px"}}>
<p style={{color:C.sub,fontSize:14,lineHeight:1.7,marginBottom:20}}>Tack <strong style={{color:C.text}}>{booking.name}</strong>. Vi ringer dig på <span style={{fontFamily:F.M,color:C.accent}}>{booking.phone}</span> för bekräftelse.</p>
<div style={{border:`1px solid ${C.border}`,background:C.bg2,marginBottom:20}}>
<div style={{background:C.bg1,borderBottom:`1px solid ${C.border}`,padding:"8px 14px",display:"flex",justifyContent:"space-between"}}>
<span style={{fontFamily:F.M,fontSize:8,color:C.muted,letterSpacing:"1.5px"}}>ORDERDETALJER</span>
<span style={{fontFamily:F.M,fontSize:8,color:C.muted}}>{new Date().toLocaleDateString("sv-SE")}</span>
</div>
{[["TJÄNST",booking.jobType==="enkla"?"Snabbservice":"Större jobb"],["DATUM",booking.jobType==="enkla"?"Drop-in":fmtL(booking.date)],["TID",booking.time],["ORDER-ID",`#${booking.id.slice(-8)}`]].map(([l,v],i,a)=>(
<div key={l} style={{display:"flex",padding:"10px 14px",borderBottom:i<a.length-1?`1px solid rgba(255,255,255,0.04)`:"none",alignItems:"center",gap:16}}>
<span style={{fontFamily:F.M,fontSize:8,color:C.muted,letterSpacing:"1.5px",minWidth:68,flexShrink:0}}>{l}</span>
<span style={{fontFamily:F.BC,fontWeight:700,fontSize:14,color:C.sub}}>{v}</span>
</div>
))}
</div>
<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
<a href={`tel:${WS.phonePlain}`} className="ghost" style={{...Btn.ghost,textDecoration:"none",textAlign:"center",padding:"12px",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.62 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.08 6.08l.27-.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
RING OSS
</a>
<button className="primary" style={{...Btn.primary,padding:"12px",fontSize:14,letterSpacing:"2px"}} onClick={onClose}>NY BOKNING</button>
</div>
</div>
</div>
<div className="hazard" style={{height:10}}/>
</div>
</div>
);
}
/* ══ MAIN APP ══ */
export default function App() {
const [view,setView] = useState("booking");
const [step,setStep] = useState(1);
const [dir,setDir] = useState("up");
const [confirmed,setConfirmed] = useState(null);

const [errors,setErrors] = useState({});
const [booked,setBooked] = useState([]);
const [count,setCount] = useState(0);
const [prev,setPrev] = useState(null);
const [sub,setSub] = useState(false);
const [clock,setClock] = useState(curTime());
const [form,setForm] = useState({name:"",phone:"",email:"",regno:"",jobType:"",date:"",time:"",tags:[],description:"",image:null});
useEffect(()=>{ const t=setInterval(()=>setClock(curTime()),30000); return()=>clearInterval(t) },[]);
const refresh=useCallback((d)=>{ if(!d||isWe(d)||isPast(d)){setBooked([]);setCount(0);return} setBooked(slotsOn(d));setCount(storaOn(d)) },[]);
useEffect(()=>{ refresh(form.date) },[form.date,refresh]);
function set(f,v){ setForm(p=>({...p,[f]:v})); if(errors[f]) setErrors(e=>({...e,[f]:undefined})) }
function toggleTag(t){ setForm(p=>({...p,tags:p.tags.includes(t)?p.tags.filter(x=>x!==t):[...p.tags,t]})) }
function go(n){ setDir(n>step?"up":"down"); setStep(n); setErrors({}) }
function validate(){
const e={};
if(step===1){ if(!form.name.trim())e.name="Namn krävs"; if(!form.phone.trim())e.phone="Telefon krävs"; if(!/^\S+@\S+\.\S+$/.test(form.email))e.email="Ogiltig e-postadress" }
if(step===2){ if(!form.jobType)e.jobType="Välj tjänst"; if(form.jobType==="stora"){ if(!form.date)e.date="Datum krävs"; else if(isWe(form.date))e.date="Välj vardag (mån–fre)"; else if(count>=MAX)e.date="Fullbokat"; if(!form.time)e.time="Välj tid" } }
return e;
}
function next(){ const e=validate(); if(Object.keys(e).length){setErrors(e);return} go(step+1) }
function handleImg(e){ const f=e.target.files[0]; if(!f)return; const r=new FileReader(); r.onload=ev=>{setPrev(ev.target.result);set("image",ev.target.result)}; r.readAsDataURL(f) }
async function submit(){
setSub(true); await new Promise(r=>setTimeout(r,800));
const desc=[form.tags.length?form.tags.join(", "):null,form.description||null].filter(Boolean).join("\n\n");
const b={id:Date.now().toString(),...form,description:desc,date:form.jobType==="enkla"?tod():form.date,time:form.jobType==="enkla"?"Drop-in":form.time,status:"Ny",createdAt:new Date().toISOString()};
saveAll([...getAll(),b]); sendMail(b); setSub(false); setConfirmed(b);
}
function reset(){ setConfirmed(null); setForm({name:"",phone:"",email:"",regno:"",jobType:"",date:"",time:"",tags:[],description:"",image:null}); setPrev(null); go(1) }
if(view==="admin") return <Admin onBack={()=>setView("booking")}/>;
const avail = SLOTS.filter(sl=>!booked.includes(sl));
const isFull = form.jobType==="stora"&&form.date&&count>=MAX;
const pct = ((step-1)/4)*100;
const summaryRows=[
["NAMN",form.name],["TELEFON",form.phone],["E-POST",form.email],
...(form.regno?[["REG.NR",form.regno]]:[]),
["TJÄNST",form.jobType==="enkla"?"Snabbservice":form.jobType==="stora"?"Större jobb":"–"],
...(form.jobType==="stora"?[["DATUM",fmtL(form.date)],["TID",form.time]]:[]),
...(form.tags.length?[["FEL",form.tags.join(", ")]]:[] ),

...(form.description?[["NOTERING",form.description]]:[]),
].filter(([,v])=>v&&v!=="–");
return (
<div style={{minHeight:"100vh",background:C.bg,fontFamily:F.B,color:C.text}}>
<Glb/><Fnt/>
{/* ══ HEADER ══ */}
<header style={{borderBottom:`1px solid ${C.border}`,position:"sticky",top:0,zIndex:40,background:"rgba(14,14,14,0.97)",backdropFilter:"blur(8px)"}}>
<div style={{height:3,background:`linear-gradient(90deg,#FF4500,#FF6B35,transparent)`}}/>
<div style={{maxWidth:900,margin:"0 auto",padding:"0 20px",height:52,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
<div style={{display:"flex",alignItems:"center",gap:12}}>
<div style={{width:34,height:34,background:C.accent,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
</div>
<div>
<p style={{fontFamily:F.T,fontSize:17,color:C.text,letterSpacing:"1.5px",lineHeight:1}}>{WS.name}</p>
<p style={{fontFamily:F.M,fontSize:8,color:C.muted,letterSpacing:"1px",marginTop:1}}>{WS.sub.toUpperCase()}</p>
</div>
</div>
<div style={{display:"flex",alignItems:"center",gap:10}}>
<div style={{display:"flex",alignItems:"center",gap:6,background:C.panel,border:`1px solid ${C.border}`,padding:"5px 10px"}}>
<span style={{width:6,height:6,borderRadius:"50%",background:C.green,animation:"blink 2s ease infinite"}}/>
<span style={{fontFamily:F.M,fontSize:11,color:C.green,letterSpacing:"0.5px"}}>{clock}</span>
<span style={{fontFamily:F.M,fontSize:8,color:C.muted,marginLeft:4,letterSpacing:"1px"}}>ÖPPET</span>
</div>
<a href={`tel:${WS.phonePlain}`} className="nav-a" style={{fontFamily:F.M,color:C.muted,fontSize:11,textDecoration:"none",letterSpacing:"0.5px",transition:"color 0.15s"}}>{WS.phone}</a>
<button onClick={()=>setView("admin")} className="ghost" style={{...Btn.ghost,fontSize:9,padding:"5px 10px",letterSpacing:"1.5px"}}>ADMIN</button>
</div>
</div>
<div style={{height:2,background:"rgba(255,255,255,0.05)"}}>
<div style={{height:"100%",background:C.accent,width:`${pct}%`,transition:"width 0.5s cubic-bezier(0.22,1,0.36,1)",boxShadow:`0 0 10px ${C.accentGlow}`}}/>
</div>
</header>
{/* ══ WORKSHOP HERO ══ */}
<div className="grid-bg" style={{borderBottom:`1px solid ${C.border}`,position:"relative",overflow:"hidden"}}>
<div className="hazard" style={{position:"absolute",top:0,right:0,width:100,height:"100%",opacity:0.15,pointerEvents:"none"}}/>
<div style={{maxWidth:900,margin:"0 auto",padding:"30px 20px 26px"}}>
<div style={{display:"grid",gridTemplateColumns:"1fr auto",gap:20,alignItems:"stretch"}}>
<div>
<div style={{display:"inline-flex",alignItems:"center",gap:8,marginBottom:12,background:C.accentDim,border:`1px solid rgba(255,69,0,0.22)`,padding:"5px 12px"}}>
<span style={{width:5,height:5,borderRadius:"50%",background:C.accent,animation:"blink 1.5s ease infinite"}}/>
<span style={{fontFamily:F.M,fontSize:9,color:C.accent,letterSpacing:"2px"}}>ONLINEBOKNING ÖPPEN</span>
</div>
<h2 style={{fontFamily:F.T,fontSize:"clamp(48px,8vw,80px)",lineHeight:0.9,letterSpacing:"0px",marginBottom:12}}>
BOKA DIN<br/>

<span style={{WebkitTextStroke:`2px ${C.accent}`,WebkitTextFillColor:"transparent",textShadow:`0 0 40px ${C.accentGlow}`}}>BILSERVICE</span>
</h2>
<p style={{color:C.sub,fontSize:14,lineHeight:1.7,maxWidth:360,marginBottom:14}}>Fyll i formuläret — vi bekräftar din tid personligen via telefon.</p>
<div style={{display:"flex",flexWrap:"wrap",gap:"6px 20px"}}>
{[`GRUNDAD ${WS.since}`,"AUKTORISERAD VERKSTAD","GRATIS KALKYL"].map(t=>(
<span key={t} style={{fontFamily:F.M,fontSize:8,color:C.muted,letterSpacing:"1.5px",display:"flex",alignItems:"center",gap:6}}><span style={{width:2,height:10,background:C.accent}}/>{t}</span>
))}
</div>
</div>
{/* Contact card */}
<div style={{border:`1px solid ${C.border}`,minWidth:188,flexShrink:0,display:"flex",flexDirection:"column",overflow:"hidden"}}>
<div style={{background:C.accent,padding:"8px 14px"}}><span style={{fontFamily:F.T,fontSize:13,color:"#000",letterSpacing:"1px"}}>KONTAKTA OSS</span></div>
<div style={{background:C.panel,padding:"14px",display:"flex",flexDirection:"column",gap:10,flex:1}}>
{[{l:"TEL",v:WS.phone,h:`tel:${WS.phonePlain}`,accent:true},{l:"EPOST",v:WS.email,h:`mailto:${WS.email}`,accent:false},{l:"ÖPPET",v:WS.hours,h:null,accent:false}].map(({l,v,h,accent})=>(
<div key={l} style={{display:"flex",gap:8,alignItems:"flex-start"}}>
<span style={{fontFamily:F.M,fontSize:7,color:C.muted,letterSpacing:"1px",minWidth:36,paddingTop:1}}>{l}</span>
{h?<a href={h} className="nav-a" style={{color:accent?C.accent:C.sub,fontSize:accent?12:11,textDecoration:"none",transition:"color 0.15s",lineHeight:1.4,wordBreak:"break-all",fontFamily:accent?F.M:F.B}}>{v}</a>
:<span style={{color:C.sub,fontSize:11,lineHeight:1.4}}>{v}</span>}
</div>
))}
<div style={{marginTop:"auto",paddingTop:8,borderTop:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:6}}>
<span style={{width:6,height:6,borderRadius:"50%",background:C.green,animation:"blink 2s ease infinite"}}/>
<span style={{fontFamily:F.M,fontSize:8,color:C.green,letterSpacing:"1.5px"}}>ÖPPET IDAG</span>
</div>
</div>
</div>
</div>
</div>
</div>
{/* ══ MAIN ══ */}
<main style={{maxWidth:900,margin:"0 auto",padding:"24px 20px 80px",display:"grid",gridTemplateColumns:"1fr 210px",gap:20,alignItems:"start"}}>
{/* Form column */}
<div>
{/* Step tabs */}
<div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",border:`1px solid ${C.border}`,borderBottom:"none"}}>
{STEPS.map((st,i)=>{
const done=step>st.n; const cur=step===st.n;
return (
<div key={st.n} className="stab"
style={{padding:"10px 6px",textAlign:"center",borderRight:i<4?`1px solid ${C.border}`:"none",background:cur?"#1E1E1E":done?"#161616":C.bg1,borderBottom:cur?`2px solid ${C.accent}`:"2px solid transparent",transition:"all 0.2s"}}>
<p style={{fontFamily:F.M,fontSize:7,color:done?C.green:cur?C.accent:C.muted,letterSpacing:"1.5px",marginBottom:4}}>{String(st.n).padStart(2,"0")}</p>
{done
?<div style={{display:"flex",justifyContent:"center"}}><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg></div>
:<p style={{fontFamily:F.BC,fontWeight:700,fontSize:9,letterSpacing:"0.5px",color:cur?C.text:C.muted,lineHeight:1.2}}>{st.lbl}</p>}
</div>

);
})}
</div>
{/* Step content */}
<div key={step} className={dir==="up"?"enter":"back"}>
{/* STEP 1 */}
{step===1&&(
<WCard title="KUNDINFORMATION" sub="FYLL I DINA KONTAKTUPPGIFTER" stepNum={1}>
<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
<div style={{gridColumn:"1/-1"}}><WField label="FULLSTÄNDIGT NAMN" ph="Förnamn Efternamn" type="text" value={form.name} err={errors.name} onChange={v=>set("name",v)}/></div>
<WField label="TELEFON" ph="070-XXX XX XX" type="tel" value={form.phone} err={errors.phone} onChange={v=>set("phone",v)}/>
<WField label="E-POST" ph="din@email.se" type="email" value={form.email} err={errors.email} onChange={v=>set("email",v)}/>
</div>
<div>
<label style={{...Lbl,display:"block",marginBottom:8}}>REGISTRERINGSNUMMER <span style={{fontFamily:F.B,textTransform:"none",letterSpacing:0,fontWeight:400,fontSize:10,color:C.muted}}>— valfritt</span></label>
<input type="text" placeholder="ABC 123" value={form.regno} maxLength={8} className="reg-plate" onChange={e=>set("regno",e.target.value.toUpperCase())}/>
<p style={{fontFamily:F.M,fontSize:8,color:C.muted,marginTop:5,letterSpacing:"0.5px"}}>HJÄLPER OSS FÖRBEREDA SERVICE INFÖR DITT BESÖK</p>
</div>
<NavRow step={step} onNext={next}/>
</WCard>
)}
{/* STEP 2 */}
{step===2&&(
<WCard title="SERVICETYP" sub="VÄLJ TYP AV TJÄNST OCH TID" stepNum={2}>
{errors.jobType&&<Err msg={errors.jobType}/>}
<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
{[{v:"enkla",badge:"DROP-IN",label:"SNABBSERVICE",desc:"Enkla åtgärder utan tidsbokning"},{v:"stora",badge:"TIDSBOKNING",label:"STÖRRE JOBB",desc:"Motor, diagnos, broms, el"}].map(svc=>{
const active=form.jobType===svc.v;
return (
<button key={svc.v} onClick={()=>set("jobType",svc.v)} className="svc"
style={{background:active?"#1E1E1E":C.bg2,border:`2px solid ${active?C.accent:C.border}`,padding:"18px 16px",cursor:"pointer",textAlign:"left",transition:"all 0.2s ease",position:"relative",boxShadow:active?`inset 0 0 0 1px rgba(255,69,0,0.2),0 0 30px ${C.accentGlow}`:"none"}}>
{active&&<div style={{position:"absolute",top:0,left:0,width:3,height:"100%",background:C.accent}}/>}
<p style={{fontFamily:F.M,fontSize:8,color:active?C.accent:C.muted,letterSpacing:"1.5px",marginBottom:8}}>{svc.badge}</p>
<p style={{fontFamily:F.T,fontSize:20,color:active?C.text:C.sub,letterSpacing:"1px",marginBottom:5,lineHeight:1}}>{svc.label}</p>
<p style={{fontFamily:F.M,fontSize:9,color:C.muted,lineHeight:1.5,letterSpacing:"0.3px"}}>{svc.desc}</p>
{active&&<div style={{position:"absolute",top:10,right:10,width:18,height:18,background:C.accent,display:"flex",alignItems:"center",justifyContent:"center"}}>
<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
</div>}
</button>
);
})}
</div>
{form.jobType==="enkla"&&(

<div style={{background:C.amberDim,borderLeft:`3px solid ${C.amber}`,padding:"12px 16px",marginBottom:4}}>
<p style={{fontFamily:F.M,fontSize:8,color:C.amber,letterSpacing:"1.5px",marginBottom:4}}>INFO: DROP-IN TILLGÄNGLIGT</p>
<p style={{color:C.sub,fontSize:13,lineHeight:1.6}}>Ingen tidsbokning krävs. Kör in direkt under öppettider.</p>
</div>
)}
{form.jobType==="stora"&&(
<div style={{borderTop:`1px solid ${C.border}`,paddingTop:18}}>
<WField label="DATUM — MÅNDAG TILL FREDAG" type="date" ph="" min={tod()} value={form.date} err={errors.date}
onChange={v=>{ set("date",v); set("time",""); if(isWe(v))setErrors(e=>({...e,date:"Välj en vardag (mån–fre)"})); else setErrors(e=>({...e,date:undefined})) }}/>
{form.date&&!isWe(form.date)&&!errors.date&&(
<div style={{marginTop:12,marginBottom:4}}>
<div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
<span style={{fontFamily:F.M,fontSize:8,color:C.muted,letterSpacing:"1.5px"}}>KAPACITET</span>
<span style={{fontFamily:F.M,fontSize:10,color:count>=MAX?C.red:avail.length<=1?C.amber:C.green,letterSpacing:"1px"}}>{avail.length} / {SLOTS.length} LEDIGA</span>
</div>
<div style={{display:"flex",gap:3}}>
{SLOTS.map((_,i)=>(
<div key={i} style={{flex:1,height:5,background:i<count?(count>=MAX?C.red:count>=4?C.amber:C.accent):"rgba(255,255,255,0.06)",transition:"background 0.3s"}}/>
))}
</div>
</div>
)}
{form.date&&!isWe(form.date)&&!isFull&&(
<div style={{marginTop:16}}>
<label style={{...Lbl,display:"block",marginBottom:10}}>VÄLJ TID</label>
{errors.time&&<Err msg={errors.time}/>}
<div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:6}}>
{SLOTS.map(sl=>{
const taken=booked.includes(sl); const active=form.time===sl;
return (
<button key={sl} disabled={taken} className={!taken?"slot":""}
onClick={()=>!taken&&set("time",sl)}
style={{padding:"14px 8px",border:`1px solid ${active?C.accent:taken?"rgba(255,255,255,0.04)":C.border}`,background:active?"#1E1E1E":taken?"rgba(255,255,255,0.01)":"transparent",color:taken?"#222":active?C.accent:C.sub,cursor:taken?"default":"pointer",opacity:taken?0.35:1,fontFamily:F.M,fontSize:16,letterSpacing:"2px",transition:"all 0.15s",position:"relative",boxShadow:active?`inset 0 0 0 1px ${C.accent},0 0 20px ${C.accentGlow}`:"none"}}>
{sl}
<span style={{display:"block",fontSize:7,marginTop:4,letterSpacing:"1.5px",color:taken?"#222":active?C.accent:C.muted}}>{taken?"BOKAD":"LEDIG"}</span>
{active&&<div style={{position:"absolute",bottom:0,left:0,right:0,height:2,background:C.accent}}/>}
</button>
);
})}
</div>
</div>
)}
{isFull&&(

<div style={{background:C.redDim,borderLeft:`3px solid ${C.red}`,padding:"12px 16px",marginTop:14}}>
<p style={{fontFamily:F.M,fontSize:8,color:C.red,letterSpacing:"1.5px",marginBottom:3}}>VARNING: FULLBOKAT</p>
<p style={{color:C.sub,fontSize:13}}>Välj ett annat datum för att fortsätta.</p>
</div>
)}
</div>
)}
<NavRow step={step} onNext={next} onBack={()=>go(1)}/>
</WCard>
)}
{/* STEP 3 */}
{step===3&&(
<WCard title="FELANMÄLAN" sub="BESKRIV FELET SÅ DETALJERAT SOM MÖJLIGT" stepNum={3}>
<div style={{marginBottom:18}}>
<label style={{...Lbl,display:"block",marginBottom:10}}>FELKOD / KATEGORI</label>
<div style={{display:"flex",flexWrap:"wrap",gap:6}}>
{TAGS.map(t=>{
const sel=form.tags.includes(t);
return (
<button key={t} onClick={()=>toggleTag(t)} className="tag"
style={{padding:"7px 12px",cursor:"pointer",fontFamily:F.M,fontSize:9,letterSpacing:"0.5px",border:`1px solid ${sel?C.accent:C.border}`,background:sel?"#1E1E1E":"transparent",color:sel?C.accent:C.sub,transition:"all 0.15s",position:"relative"}}>
{sel&&<span style={{position:"absolute",left:0,top:0,bottom:0,width:2,background:C.accent}}/>}
{t.toUpperCase()}
</button>
);
})}
</div>
</div>
<div>
<label style={{...Lbl,display:"block",marginBottom:8}}>FELBESKRIVNING <span style={{fontFamily:F.B,textTransform:"none",letterSpacing:0,fontWeight:400,fontSize:11,color:C.muted}}>— valfritt</span></label>
<textarea value={form.description} rows={6} onChange={e=>set("description",e.target.value)} className="field"
placeholder="Beskriv felet — symptom, när det uppstår, hur länge det har pågått..."
style={{...Inp.base,resize:"vertical",height:"auto",padding:"13px 16px",lineHeight:"2.1",fontSize:13,backgroundImage:"repeating-linear-gradient(transparent,transparent 29px,rgba(255,255,255,0.035) 29px,rgba(255,255,255,0.035) 30px)"}}/>
</div>
<NavRow step={step} onNext={next} onBack={()=>go(2)}/>
</WCard>
)}
{/* STEP 4 */}
{step===4&&(
<WCard title="DOKUMENTATION" sub="BIFOGA FOTO PÅ FELET — VALFRITT" stepNum={4}>
<label style={{cursor:"pointer",display:"block"}}>
<input type="file" accept="image/*" style={{display:"none"}} onChange={handleImg}/>
{prev
?<div style={{position:"relative",border:`1px solid ${C.border}`,overflow:"hidden"}}>
<img src={prev} alt="" style={{width:"100%",maxHeight:280,objectFit:"cover",display:"block"}}/>

<div style={{position:"absolute",inset:0,background:"linear-gradient(to top,rgba(0,0,0,0.65),transparent)",display:"flex",alignItems:"flex-end",padding:"14px 16px"}}>
<span style={{fontFamily:F.M,fontSize:9,color:C.sub,letterSpacing:"1px"}}>KLICKA FÖR ATT BYTA BILD</span>
</div>
</div>
:<div className="upload" style={{border:`1.5px dashed ${C.border}`,padding:"52px 20px",textAlign:"center",background:C.bg2,transition:"all 0.2s"}}>
<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" style={{margin:"0 auto 14px",display:"block"}}>
<polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/>
<path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
</svg>
<p style={{fontFamily:F.M,fontSize:10,color:C.sub,letterSpacing:"1px",marginBottom:6}}>KLICKA FÖR ATT LADDA UPP FOTO</p>
<p style={{fontFamily:F.M,fontSize:8,color:C.muted,letterSpacing:"0.5px"}}>JPG · PNG · HEIC — MAX 10 MB</p>
</div>}
</label>
<NavRow step={step} onNext={next} onBack={()=>go(3)} nextLabel="TILL BEKRÄFTELSE"/>
</WCard>
)}
{/* STEP 5 */}
{step===5&&(
<WCard title="BEKRÄFTELSE" sub="GRANSKA ARBETSORDER INNAN DU SKICKAR" stepNum={5}>
<div style={{border:`1px solid ${C.border}`,background:C.bg2,marginBottom:18}}>
<div style={{background:C.bg1,borderBottom:`1px solid ${C.border}`,padding:"8px 14px",display:"flex",justifyContent:"space-between"}}>
<span style={{fontFamily:F.M,fontSize:8,color:C.muted,letterSpacing:"1.5px"}}>ARBETSORDER — FÖRHANDSGRANSKNING</span>
<span style={{fontFamily:F.M,fontSize:8,color:C.muted}}>{new Date().toLocaleDateString("sv-SE")}</span>
</div>
{summaryRows.map(([l,v],i,a)=>(
<div key={l} style={{display:"flex",padding:"10px 14px",borderBottom:i<a.length-1?`1px solid rgba(255,255,255,0.04)`:"none",gap:16,background:i%2===0?"transparent":"rgba(255,255,255,0.012)"}}>
<span style={{fontFamily:F.M,fontSize:8,color:C.muted,letterSpacing:"1.5px",minWidth:70,flexShrink:0,paddingTop:2}}>{l}</span>
<span style={{fontFamily:F.BC,fontWeight:600,fontSize:14,color:C.sub,lineHeight:1.5,wordBreak:"break-word"}}>{v}</span>
</div>
))}
</div>
<p style={{fontFamily:F.M,fontSize:9,color:C.muted,lineHeight:1.7,marginBottom:18,letterSpacing:"0.3px"}}>BEKRÄFTELSE SKICKAS VIA TELEFON TILL: <span style={{color:C.sub}}>{form.phone}</span></p>
<button className="primary" disabled={sub} onClick={submit}
style={{...Btn.primary,width:"100%",padding:"17px",fontSize:17,letterSpacing:"3px",opacity:sub?0.8:1,transition:"all 0.2s",boxShadow:sub?"none":`0 8px 40px ${C.accentGlow}`}}>
{sub?<span style={{display:"flex",alignItems:"center",justifyContent:"center",gap:10}}><span style={{width:16,height:16,border:"2px solid rgba(0,0,0,0.3)",borderTopColor:"#000",borderRadius:"50%",display:"inline-block",animation:"spin 0.7s linear infinite"}}/>SKICKAR...</span>:"BEKRÄFTA BOKNING"}
</button>
<button onClick={()=>go(4)} className="ghost" style={{...Btn.ghost,width:"100%",marginTop:8,padding:"12px",fontSize:10,letterSpacing:"2px",textAlign:"center"}}>GÅ TILLBAKA</button>
</WCard>
)}
</div>
</div>
{/* Sidebar */}
<div style={{display:"flex",flexDirection:"column",gap:10,position:"sticky",top:72}}>
<div style={{border:`1px solid ${C.border}`,overflow:"hidden"}}>
<div style={{height:2,background:`linear-gradient(90deg,${C.accent},transparent)`}}/>

<div style={{background:C.panel,padding:"12px 14px"}}>
<p style={{fontFamily:F.M,fontSize:7,color:C.muted,letterSpacing:"1.5px",marginBottom:10}}>VERKSTADSINFO</p>
{[{l:"TEL",v:WS.phone,h:`tel:${WS.phonePlain}`,c:C.accent,f:F.M},{l:"EPOST",v:WS.email,h:`mailto:${WS.email}`,c:C.sub,f:F.B},{l:"ÖPPET",v:WS.hours,h:null,c:C.sub,f:F.B}].map(({l,v,h,c,f})=>(
<div key={l} style={{display:"flex",gap:8,marginBottom:9,alignItems:"flex-start"}}>
<span style={{fontFamily:F.M,fontSize:7,color:C.muted,letterSpacing:"1px",minWidth:36,paddingTop:1}}>{l}</span>
{h?<a href={h} className="nav-a" style={{color:c,fontSize:11,textDecoration:"none",lineHeight:1.4,wordBreak:"break-all",transition:"color 0.15s",fontFamily:f}}>{v}</a>
:<span style={{color:c,fontSize:11,lineHeight:1.4,fontFamily:f}}>{v}</span>}
</div>
))}
</div>
</div>
<div style={{border:`1px solid ${C.border}`,background:C.panel,padding:"12px 14px"}}>
<p style={{fontFamily:F.M,fontSize:7,color:C.muted,letterSpacing:"1.5px",marginBottom:10}}>TJÄNSTER</p>
{SVCS_LIST.map(s=>(
<div key={s} style={{display:"flex",alignItems:"center",gap:7,marginBottom:7}}>
<span style={{width:2,height:2,background:C.accent,flexShrink:0}}/>
<span style={{fontFamily:F.M,fontSize:9,color:C.muted,letterSpacing:"0.3px"}}>{s.toUpperCase()}</span>
</div>
))}
</div>
<div style={{border:`1px solid rgba(10,158,78,0.2)`,background:C.greenDim,padding:"10px 14px",display:"flex",alignItems:"center",gap:8}}>
<span style={{width:8,height:8,borderRadius:"50%",background:C.green,flexShrink:0,animation:"blink 2s ease infinite"}}/>
<div><p style={{fontFamily:F.M,fontSize:9,color:C.green,letterSpacing:"1.5px",lineHeight:1}}>ÖPPET IDAG</p><p style={{fontFamily:F.M,fontSize:7,color:C.muted,marginTop:3,letterSpacing:"1px"}}>08:00 – 17:00</p></div>
</div>
<div className="hazard-amber" style={{padding:"2px"}}>
<div style={{background:C.panel,padding:"9px 12px"}}>
<p style={{fontFamily:F.M,fontSize:8,color:C.amber,letterSpacing:"1px",lineHeight:1.6}}>BOKA SENAST DAGEN INNAN FÖR GARANTERAD TID</p>
</div>
</div>
</div>
</main>
<div className="hazard" style={{height:4}}/>
<footer style={{background:C.bg1,borderTop:`1px solid ${C.border}`,padding:"14px 20px",textAlign:"center"}}>
<p style={{fontFamily:F.M,fontSize:8,color:C.muted,letterSpacing:"1.5px"}}>{WS.name} · {WS.phone} · {WS.email} · GRUNDAD {WS.since}</p>
</footer>
{confirmed&&<Success booking={confirmed} onClose={reset}/>}
</div>
);
}
