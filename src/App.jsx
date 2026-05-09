import { useState, useEffect, useCallback } from "react";

/* ══════════════════════════════════════════
   GLOBAL CSS
══════════════════════════════════════════ */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800;900&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500;600&display=swap');

*,*::before,*::after { box-sizing:border-box; margin:0; padding:0; }
html {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  overflow-x: hidden;
  width: 100%;
}
body {
  background: #0E0E12;
  overflow-x: hidden;
  width: 100%;
  max-width: 100vw;
}
img, video { max-width: 100%; display: block; }
input, textarea, button, select { max-width: 100%; }
/* Prevent iOS zoom on input focus */
input, textarea, select { font-size: 16px !important; }

::selection { background: rgba(196,32,40,.3); color:#fff; }
input::placeholder, textarea::placeholder { color: #2C2C38; }
input:focus, textarea:focus { outline: none; }
input[type="date"]::-webkit-calendar-picker-indicator { filter:invert(.4); cursor:pointer; }
button { -webkit-tap-highlight-color: transparent; touch-action: manipulation; cursor: pointer; }
a { -webkit-tap-highlight-color: transparent; }

/* ── Animations ── */
@keyframes slideUp   { from{opacity:0;transform:translateY(22px)} to{opacity:1;transform:translateY(0)} }
@keyframes slideDown { from{opacity:0;transform:translateY(-22px)} to{opacity:1;transform:translateY(0)} }
@keyframes fadeIn    { from{opacity:0} to{opacity:1} }
@keyframes popIn     { from{opacity:0;transform:scale(.94) translateY(14px)} to{opacity:1;transform:scale(1) translateY(0)} }
@keyframes spin      { to{transform:rotate(360deg)} }
@keyframes drawCheck { from{stroke-dashoffset:60} to{stroke-dashoffset:0} }
@keyframes pulse     { 0%,100%{opacity:1} 50%{opacity:.35} }

.step-in   { animation: slideUp   .3s cubic-bezier(.22,1,.36,1) both; }
.step-out  { animation: slideDown .3s cubic-bezier(.22,1,.36,1) both; }

/* ── Focus styles ── */
.inp:focus {
  border-color: rgba(196,32,40,.6) !important;
  box-shadow: 0 0 0 3px rgba(196,32,40,.1) !important;
}

/* ── Hover (desktop only) ── */
@media (hover:hover) {
  .btn-red:hover    { filter:brightness(1.1); transform:translateY(-1px); box-shadow:0 14px 44px rgba(196,32,40,.35) !important; }
  .btn-ghost:hover  { border-color:rgba(255,255,255,.22) !important; color:#fff !important; }
  .svc-card:hover   { transform:translateY(-3px) !important; border-color:rgba(196,32,40,.5) !important; }
  .slot-btn:not([disabled]):hover { border-color:rgba(196,32,40,.5) !important; color:#E82030 !important; background:rgba(196,32,40,.07) !important; }
  .tag-pill:hover   { border-color:rgba(196,32,40,.45) !important; color:#E82030 !important; background:rgba(196,32,40,.07) !important; }
  .nav-link:hover   { color:#E82030 !important; }
  .admin-row:hover  { background:rgba(255,255,255,.025) !important; }
}

/* ── Responsive breakpoints ── */
@media (max-width:640px) {
  .hero-title    { font-size: clamp(48px,13vw,68px) !important; line-height:.88 !important; letter-spacing:-1px !important; }
  .svc-grid      { grid-template-columns: 1fr !important; }
  .slot-grid     { grid-template-columns: repeat(2,1fr) !important; }
  .card-inner    { padding: 22px 18px 22px 22px !important; }
  .header-inner  { padding: 0 14px !important; }
  .hero-section  { padding: 36px 16px 0 !important; }
  .main-wrap     { padding: 36px 14px 80px !important; }
  .step-labels   { display: none !important; }
  .modal-body    { padding: 20px 18px !important; }
  .stat-grid     { grid-template-columns: 1fr 1fr !important; }
  .hdr-wordmark  { display: none !important; }
  .footer-inner  { flex-direction: column !important; gap: 10px !important; }
}
@media (min-width:641px) and (max-width:900px) {
  .hero-title { font-size: clamp(68px,10vw,84px) !important; }
  .slot-grid  { grid-template-columns: repeat(3,1fr) !important; }
}
@media (min-width:901px) {
  .hero-title { font-size: 90px !important; }
  .slot-grid  { grid-template-columns: repeat(3,1fr) !important; }
}
`;

/* ══════════════════════════════════════════
   COLOR TOKENS  —  Real Workshop Palette
   Steel dark + Warning Red + Clean white
══════════════════════════════════════════ */
const C = {
  // Backgrounds — warm dark steel
  bg:      "#0E0E12",
  surface: "#14141A",
  card:    "#1A1A22",
  cardAlt: "#20202A",
  stripe:  "#242430",

  // Borders
  bd:      "rgba(255,255,255,.08)",
  bdFaint: "rgba(255,255,255,.04)",

  // Accent — Workshop Red (Snap-on / Bosch / Ferrari Service)
  red:     "#C42028",
  redL:    "#E82030",
  redD:    "#8C1418",
  redDim:  "rgba(196,32,40,.09)",
  redGlow: "rgba(196,32,40,.22)",

  // Text
  white:   "#F4F2EE",
  g1:      "#9A9AA8",
  g2:      "#60606E",
  g3:      "#30303C",

  // Status
  ok:      "#3A9460",
  warn:    "#D4922A",
  blue:    "#2E72C4",
  err:     "#D44040",
};

const F = {
  display: "'Barlow Condensed', sans-serif",
  body:    "'Inter', sans-serif",
  mono:    "'JetBrains Mono', monospace",
};

/* ══════════════════════════════════════════
   WORKSHOP CONFIG
══════════════════════════════════════════ */
const WS = {
  name:    "Kom In Bilservice",
  short:   "KI",
  tagline: "Auktoriserad Bilverkstad",
  city:    "Stockholm",
  phone:   "0790-574 975",
  tel:     "0790574975",
  email:   "husseinmormor@gmail.com",
  hours:   "Mån – Fre  ·  08:00 – 17:00",
  est:     "Est. 2010",
};

const SLOTS  = ["08:00","09:30","11:00","12:30","14:00","15:30"];
const MAX    = 5;
const ADM_PW = "admin2024";
const TAGS   = ["Konstigt ljud","Motorproblem","Vibration","Startar ej","Motorlampa","Oljebyte","Bromsservice","Däckbyte"];
const STEPS  = [{n:1,l:"Kontakt"},{n:2,l:"Tjänst"},{n:3,l:"Ärende"},{n:4,l:"Bekräfta"}];

/* ══════════════════════════════════════════
   STORAGE & UTILS
══════════════════════════════════════════ */
const KEY      = "ki_v2";
const getAll   = ()  => { try{return JSON.parse(localStorage.getItem(KEY)||"[]")}catch{return[]} };
const saveAll  = a   => localStorage.setItem(KEY, JSON.stringify(a));
const storaOn  = d   => getAll().filter(b=>b.date===d&&b.jobType==="stora").length;
const slotsOn  = d   => getAll().filter(b=>b.date===d).map(b=>b.time);
const isWknd   = d   => { if(!d)return false; const w=new Date(d+"T12:00:00").getDay(); return w===0||w===6; };
const isPast   = d   => { if(!d)return false; const t=new Date(); t.setHours(0,0,0,0); return new Date(d+"T00:00:00")<t; };
const todayStr = ()  => new Date().toISOString().split("T")[0];
const fmtLong  = d   => !d?"–":new Date(d+"T12:00:00").toLocaleDateString("sv-SE",{weekday:"long",year:"numeric",month:"long",day:"numeric"});
const fmtShort = d   => !d?"–":new Date(d+"T12:00:00").toLocaleDateString("sv-SE",{day:"numeric",month:"short",year:"numeric"});
const cap      = s   => s?s[0].toUpperCase()+s.slice(1):s;
const orderNo  = id  => "KI-"+String(id).slice(-5).toUpperCase();

function sendMail(b) {
  const sub  = encodeURIComponent(`Ny bokning – ${b.name} – ${fmtShort(b.date)}`);
  const body = encodeURIComponent(
`ARBETSORDER  ${orderNo(b.id)}
${WS.name.toUpperCase()}  ·  ${WS.city}
${"═".repeat(36)}

KUND:       ${b.name}
TELEFON:    ${b.phone}
E-POST:     ${b.email}

TJÄNST:     ${b.jobType==="enkla"?"Snabbservice (drop-in)":"Större jobb – tidsbokning"}
DATUM:      ${b.jobType==="enkla"?"Drop-in (inget datum)":fmtLong(b.date)}
TID:        ${b.time}

BESKRIVNING:
${b.description||"(ingen angiven)"}

${"═".repeat(36)}
Bokning-ID:  ${b.id}
Inkommen:    ${new Date(b.createdAt).toLocaleString("sv-SE")}
`);
  window.open(`mailto:${WS.email}?subject=${sub}&body=${body}`,"_blank");
}

/* ══════════════════════════════════════════
   ATOMS
══════════════════════════════════════════ */
const GS   = () => <style dangerouslySetInnerHTML={{__html:CSS}}/>;
const Mono = ({s="10",col,children,style={},...r}) =>
  <span style={{fontFamily:F.mono,fontSize:s,letterSpacing:"1.5px",color:col||C.g2,...style}}>{children}</span>;
const Cap  = ({children}) =>
  <p style={{fontFamily:F.mono,fontSize:"9px",fontWeight:600,letterSpacing:"2px",textTransform:"uppercase",color:C.g2,marginBottom:8}}>{children}</p>;
const Rule = ({my=20,col}) =>
  <div style={{height:1,background:col||C.bd,margin:`${my}px 0`}}/>;
const ErrTxt = ({msg}) =>
  <p style={{color:C.err,fontSize:13,marginTop:7,display:"flex",gap:5,alignItems:"center",fontFamily:F.body}}>
    <span style={{fontWeight:700}}>—</span>{msg}
  </p>;

/* Logo badge */
const KIBadge = ({size=38}) => (
  <div style={{width:size,height:size,borderRadius:6,background:C.red,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,boxShadow:`0 4px 16px ${C.redGlow}`}}>
    <span style={{fontFamily:F.display,fontSize:size*.48,fontWeight:900,color:"#fff",lineHeight:1,letterSpacing:"-1px"}}>KI</span>
  </div>
);

/* Spinner */
const Spin = () =>
  <span style={{width:16,height:16,border:"2px solid rgba(255,255,255,.2)",borderTopColor:"#fff",borderRadius:"50%",animation:"spin .7s linear infinite",display:"inline-block"}}/>;

/* Buttons */
function RedBtn({children,onClick,disabled,full,large,style={}}) {
  const [press,setPress] = useState(false);
  return (
    <button className="btn-red" disabled={disabled} onClick={onClick}
      onPointerDown={()=>setPress(true)} onPointerUp={()=>setPress(false)} onPointerLeave={()=>setPress(false)}
      style={{background:`linear-gradient(150deg,${C.redL} 0%,${C.red} 50%,${C.redD} 100%)`,border:"none",borderRadius:6,
        padding:large?"17px 28px":"13px 24px",width:full?"100%":"auto",color:"#fff",
        fontFamily:F.display,fontWeight:900,fontSize:large?20:17,letterSpacing:"2px",textTransform:"uppercase",
        transition:"all .2s ease",transform:press?"scale(.975)":"scale(1)",
        boxShadow:press?"none":`0 6px 28px ${C.redGlow}`,opacity:disabled?.7:1,
        display:"flex",alignItems:"center",justifyContent:"center",gap:10,
        minHeight:large?56:48,...style}}>
      {disabled?<Spin/>:children}
    </button>
  );
}

function GhostBtn({children,onClick,full,style={}}) {
  return (
    <button className="btn-ghost" onClick={onClick}
      style={{background:"transparent",border:`1px solid ${C.bd}`,borderRadius:6,
        padding:"13px 20px",width:full?"100%":"auto",color:C.g1,fontFamily:F.body,
        fontSize:14,fontWeight:500,transition:"all .18s",minHeight:48,...style}}>
      {children}
    </button>
  );
}

/* Field */
function Field({label,type="text",value,onChange,placeholder,error,min}) {
  return (
    <div style={{width:"100%"}}>
      <Cap>{label}</Cap>
      <input type={type} value={value} onChange={e=>onChange(e.target.value)}
        placeholder={placeholder} min={min} className="inp"
        style={{width:"100%",background:C.surface,border:`1.5px solid ${error?C.err+"55":C.bd}`,
          borderRadius:8,padding:"13px 16px",color:C.white,fontFamily:F.body,
          transition:"border-color .2s,box-shadow .2s",minHeight:50}}/>
      {error&&<ErrTxt msg={error}/>}
    </div>
  );
}

/* ══════════════════════════════════════════
   ADMIN PANEL
══════════════════════════════════════════ */
function Admin({onBack}) {
  const [auth,setAuth] = useState(false);
  const [pw,setPw]     = useState("");
  const [pwErr,setErr] = useState(false);
  const [busy,setBusy] = useState(false);
  const [data,setData] = useState([]);
  const [tab,setTab]   = useState("all");
  const [q,setQ]       = useState("");

  useEffect(()=>{ if(auth) setData(getAll()); },[auth]);

  const upd = (id,s) => { const u=getAll().map(b=>b.id===id?{...b,status:s}:b); saveAll(u); setData(u); };
  const del = id => { if(!confirm("Ta bort?"))return; const u=getAll().filter(b=>b.id!==id); saveAll(u); setData(u); };

  const SC  = {Ny:C.red,Pågående:C.blue,Klar:C.ok};
  const cnt = {all:data.length,Ny:data.filter(b=>b.status==="Ny").length,Pågående:data.filter(b=>b.status==="Pågående").length,Klar:data.filter(b=>b.status==="Klar").length};
  const rows = data.filter(b=>tab==="all"||b.status===tab).filter(b=>!q||b.name.toLowerCase().includes(q.toLowerCase())||b.phone.includes(q)).sort((a,b)=>a.date>b.date?1:-1);

  async function doLogin() {
    setBusy(true); await new Promise(r=>setTimeout(r,500)); setBusy(false);
    if(pw===ADM_PW) setAuth(true); else { setErr(true); setPw(""); }
  }

  /* Login screen */
  if(!auth) return (
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",padding:20,fontFamily:F.body,overflowX:"hidden",width:"100%"}}>
      <GS/>
      <div style={{width:"100%",maxWidth:380}}>
        <button className="btn-ghost" onClick={onBack} style={{...ghostBase,fontSize:13,marginBottom:40}}>← Tillbaka</button>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:8}}>
          <KIBadge size={42}/>
          <div>
            <p style={{fontFamily:F.display,fontSize:22,fontWeight:900,color:C.white,letterSpacing:"1px",textTransform:"uppercase",lineHeight:1}}>{WS.name}</p>
            <Mono s="9" col={C.g2} style={{letterSpacing:"2px"}}>ADMINPANEL</Mono>
          </div>
        </div>
        <Rule my={28}/>
        <Cap>Lösenord</Cap>
        <input type="password" value={pw} autoFocus placeholder="••••••••••" className="inp"
          onChange={e=>{setPw(e.target.value);setErr(false);}}
          onKeyDown={e=>{ if(e.key==="Enter") doLogin(); }}
          style={{width:"100%",background:C.surface,border:`1.5px solid ${pwErr?C.err+"55":C.bd}`,borderRadius:8,padding:"13px 16px",color:C.white,fontFamily:F.body,minHeight:50,marginBottom:6}}/>
        {pwErr&&<ErrTxt msg="Fel lösenord. Försök igen."/>}
        <RedBtn full large onClick={doLogin} disabled={busy} style={{marginTop:14}}>{busy?<Spin/>:"Logga in"}</RedBtn>
      </div>
    </div>
  );

  /* Admin dashboard */
  return (
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:F.body,color:C.white,overflowX:"hidden",width:"100%"}}>
      <GS/>
      {/* Topbar */}
      <div style={{background:"rgba(14,14,18,.96)",backdropFilter:"blur(16px)",borderBottom:`1px solid ${C.bd}`,height:54,display:"flex",alignItems:"center",padding:"0 20px",gap:14,position:"sticky",top:0,zIndex:50}}>
        <button className="btn-ghost" onClick={onBack} style={{...ghostBase,fontSize:12,padding:"5px 12px",minHeight:34}}>← Bokning</button>
        <div style={{width:1,height:14,background:C.bd}}/>
        <Mono s="10" col={C.g2}>ADMIN — {WS.name.toUpperCase()}</Mono>
        <div style={{marginLeft:"auto"}}>
          <input placeholder="Sök kund…" value={q} onChange={e=>setQ(e.target.value)} className="inp"
            style={{background:C.surface,border:`1px solid ${C.bd}`,borderRadius:6,padding:"0 12px",height:34,width:180,color:C.white,fontFamily:F.body}}/>
        </div>
      </div>

      {/* Stats */}
      <div className="stat-grid" style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",borderBottom:`1px solid ${C.bd}`}}>
        {[{l:"ALLA",n:cnt.all,c:C.g1,k:"all"},{l:"NYA",n:cnt.Ny,c:C.red,k:"Ny"},{l:"PÅGÅENDE",n:cnt.Pågående,c:C.blue,k:"Pågående"},{l:"KLARA",n:cnt.Klar,c:C.ok,k:"Klar"}].map((x,i)=>(
          <div key={x.k} onClick={()=>setTab(x.k)} style={{padding:"18px 20px",cursor:"pointer",borderRight:i<3?`1px solid ${C.bd}`:"none",background:tab===x.k?`${x.c}0C`:"transparent",transition:"background .2s"}}>
            <Mono s="9" col={C.g3} style={{display:"block",marginBottom:8}}>{x.l}</Mono>
            <p style={{fontFamily:F.display,fontSize:44,fontWeight:900,color:x.c,lineHeight:1,letterSpacing:"-2px"}}>{x.n}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{padding:"12px 20px",display:"flex",gap:6,borderBottom:`1px solid ${C.bd}`,flexWrap:"wrap"}}>
        {["all","Ny","Pågående","Klar"].map(f=>(
          <button key={f} className="btn-ghost" onClick={()=>setTab(f)}
            style={{...ghostBase,fontSize:11,padding:"5px 13px",letterSpacing:".5px",...(tab===f?{borderColor:`${C.red}55`,color:C.red,background:C.redDim}:{})}}>
            {f==="all"?"Alla":f}
          </button>
        ))}
      </div>

      {/* Cards */}
      <div style={{padding:"12px 20px 60px",display:"flex",flexDirection:"column",gap:10}}>
        {rows.length===0?(
          <div style={{textAlign:"center",padding:"80px 20px"}}>
            <p style={{fontFamily:F.display,fontSize:28,fontWeight:900,color:C.g3,letterSpacing:"3px",textTransform:"uppercase"}}>Inga bokningar</p>
          </div>
        ):rows.map(b=>(
          <div key={b.id} className="admin-row" style={{background:C.card,border:`1px solid ${C.bd}`,borderRadius:10,overflow:"hidden",borderLeft:`3px solid ${SC[b.status]||C.red}`,transition:"background .15s"}}>
            <div style={{padding:"16px 18px"}}>
              {/* Header row */}
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12,gap:8,flexWrap:"wrap"}}>
                <div>
                  <Mono s="9" col={C.red} style={{display:"block",marginBottom:4}}>{orderNo(b.id)}</Mono>
                  <p style={{fontFamily:F.display,fontSize:22,fontWeight:900,color:C.white,letterSpacing:".5px"}}>{b.name}</p>
                </div>
                <span style={{fontFamily:F.mono,fontSize:10,fontWeight:700,letterSpacing:"1.5px",color:SC[b.status],background:`${SC[b.status]}18`,padding:"5px 10px",border:`1px solid ${SC[b.status]}30`,borderRadius:4}}>{b.status?.toUpperCase()}</span>
              </div>
              {/* Details */}
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",gap:10,marginBottom:14}}>
                {[["Datum",b.date||"Drop-in"],["Tid",b.time],["Telefon",b.phone],["Tjänst",b.jobType==="enkla"?"Snabbservice":"Större jobb"]].map(([l,v])=>(
                  <div key={l}>
                    <Mono s="8" col={C.g3} style={{display:"block",marginBottom:3}}>{l.toUpperCase()}</Mono>
                    <p style={{color:C.g1,fontSize:13,fontWeight:500}}>{v}</p>
                  </div>
                ))}
              </div>
              {b.description&&<p style={{color:C.g2,fontSize:13,lineHeight:1.6,background:C.surface,padding:"9px 12px",borderRadius:6,marginBottom:12,borderLeft:`2px solid ${C.g3}`}}>{b.description}</p>}
              {/* Actions */}
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                {["Ny","Pågående","Klar"].map(s=>(
                  <button key={s} onClick={()=>upd(b.id,s)}
                    style={{flex:1,minWidth:70,padding:"8px 4px",borderRadius:6,border:"none",cursor:"pointer",fontSize:11,fontWeight:700,fontFamily:F.mono,letterSpacing:".8px",textTransform:"uppercase",background:b.status===s?`${SC[s]}22`:"rgba(255,255,255,.04)",color:b.status===s?SC[s]:C.g2,transition:"all .15s",minHeight:38}}>
                    {s}
                  </button>
                ))}
                <button className="btn-ghost" onClick={()=>del(b.id)} style={{...ghostBase,fontSize:11,padding:"8px 14px",color:C.g2,minHeight:38}}>Ta bort</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   SUCCESS MODAL
══════════════════════════════════════════ */
function SuccessModal({booking,onClose}) {
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.88)",backdropFilter:"blur(20px)",zIndex:100,display:"flex",alignItems:"center",justifyContent:"center",padding:16,fontFamily:F.body,animation:"fadeIn .25s ease"}} onClick={onClose}>
      <div style={{background:C.card,width:"100%",maxWidth:460,borderRadius:12,overflow:"hidden",border:`1px solid ${C.bd}`,boxShadow:"0 60px 140px rgba(0,0,0,.8)",animation:"popIn .32s cubic-bezier(.22,1,.36,1) both"}} onClick={e=>e.stopPropagation()}>
        {/* Red top stripe */}
        <div style={{height:3,background:`linear-gradient(90deg,${C.redD},${C.red},${C.redL})`}}/>
        {/* Order header */}
        <div style={{background:C.cardAlt,borderBottom:`1px solid ${C.bd}`,padding:"14px 22px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <Mono s="8" col={C.g3} style={{display:"block",marginBottom:4}}>ARBETSORDER</Mono>
            <Mono s="14" col={C.red} style={{fontWeight:700}}>{orderNo(booking.id)}</Mono>
          </div>
          <span style={{fontFamily:F.mono,fontSize:10,fontWeight:700,letterSpacing:"1.5px",color:C.ok,background:`${C.ok}15`,padding:"5px 10px",border:`1px solid ${C.ok}30`,borderRadius:4}}>BEKRÄFTAD</span>
        </div>
        <div className="modal-body" style={{padding:"24px 22px 20px"}}>
          {/* Check + title */}
          <div style={{display:"flex",gap:14,alignItems:"flex-start",marginBottom:20}}>
            <div style={{width:48,height:48,background:C.redDim,border:`1px solid ${C.red}30`,borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <polyline points="4,11 9,16 18,5" stroke={C.red} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="60" strokeDashoffset="60" style={{animation:"drawCheck .5s .1s ease forwards"}}/>
              </svg>
            </div>
            <div>
              <h2 style={{fontFamily:F.display,fontSize:"clamp(24px,5vw,30px)",fontWeight:900,color:C.white,letterSpacing:"1px",textTransform:"uppercase",lineHeight:1,marginBottom:6}}>Bokning mottagen</h2>
              <p style={{color:C.g1,fontSize:14,lineHeight:1.65}}>Vi ringer dig på <strong style={{color:C.white}}>{booking.phone}</strong> för att bekräfta.</p>
            </div>
          </div>
          {/* Details */}
          <div style={{border:`1px solid ${C.bd}`,borderRadius:8,overflow:"hidden",marginBottom:18}}>
            <div style={{background:C.cardAlt,padding:"7px 14px",borderBottom:`1px solid ${C.bd}`}}>
              <Mono s="8" col={C.g3}>BOKNINGSDETALJER</Mono>
            </div>
            {[["Tjänst",booking.jobType==="enkla"?"Snabbservice":"Större jobb"],["Datum",booking.jobType==="enkla"?"Drop-in":fmtLong(booking.date)],["Tid",booking.time],["Kund",booking.name]].map(([l,v],i,a)=>(
              <div key={l} style={{display:"flex",gap:12,padding:"10px 14px",borderBottom:i<a.length-1?`1px solid ${C.bdFaint}`:"none",background:i%2?"rgba(255,255,255,.012)":"transparent"}}>
                <Mono s="8" col={C.g3} style={{minWidth:58,paddingTop:2,flexShrink:0,textTransform:"uppercase"}}>{l}</Mono>
                <span style={{color:C.g1,fontSize:13,fontWeight:500,lineHeight:1.5}}>{cap(v)}</span>
              </div>
            ))}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            <a href={`tel:${WS.tel}`} className="btn-ghost" style={{...ghostBase,textDecoration:"none",textAlign:"center",display:"block",padding:"12px",fontSize:13}}>Ring oss</a>
            <RedBtn onClick={onClose}>Stäng</RedBtn>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   MAIN APP
══════════════════════════════════════════ */
export default function App() {
  const [view,setView]   = useState("book");
  const [step,setStep]   = useState(1);
  const [dir,setDir]     = useState("up");
  const [conf,setConf]   = useState(null);
  const [errs,setErrs]   = useState({});
  const [booked,setBook] = useState([]);
  const [cnt,setCnt]     = useState(0);
  const [imgPrev,setImg] = useState(null);
  const [busy,setBusy]   = useState(false);
  const [form,setForm]   = useState({name:"",phone:"",email:"",jobType:"",date:"",time:"",tags:[],desc:"",image:null});

  const refresh = useCallback(d=>{ if(!d||isWknd(d)||isPast(d)){setBook([]);setCnt(0);return;} setBook(slotsOn(d)); setCnt(storaOn(d)); },[]);
  useEffect(()=>{ refresh(form.date); },[form.date,refresh]);

  const set = (k,v) => { setForm(p=>({...p,[k]:v})); if(errs[k]) setErrs(e=>({...e,[k]:undefined})); };
  const tag = t => setForm(p=>({...p,tags:p.tags.includes(t)?p.tags.filter(x=>x!==t):[...p.tags,t]}));

  function go(to) { setDir(to>step?"up":"down"); setTimeout(()=>{ setStep(to); setErrs({}); },10); }

  function validate() {
    const e={};
    if(step===1){ if(!form.name.trim())e.name="Namn krävs"; if(!form.phone.trim())e.phone="Telefon krävs"; if(!/^\S+@\S+\.\S+$/.test(form.email))e.email="Ogiltig e-postadress"; }
    if(step===2){ if(!form.jobType)e.jobType="Välj en tjänst för att fortsätta"; if(form.jobType==="stora"){if(!form.date)e.date="Välj ett datum";else if(isWknd(form.date))e.date="Välj en vardag (mån–fre)";else if(cnt>=MAX)e.date="Fullbokat — välj ett annat datum"; if(!form.time)e.time="Välj en tillgänglig tid";} }
    return e;
  }
  function next(){ const e=validate(); if(Object.keys(e).length){setErrs(e);return;} go(step+1); }

  function handleImg(e){ const f=e.target.files[0]; if(!f)return; const r=new FileReader(); r.onload=ev=>{setImg(ev.target.result);set("image",ev.target.result);}; r.readAsDataURL(f); }

  async function submit(){
    setBusy(true); await new Promise(r=>setTimeout(r,700));
    const desc=[form.tags.length?form.tags.join(", "):null,form.desc||null].filter(Boolean).join("\n\n");
    const b={id:Date.now().toString(),...form,description:desc,date:form.jobType==="enkla"?todayStr():form.date,time:form.jobType==="enkla"?"Drop-in":form.time,status:"Ny",createdAt:new Date().toISOString()};
    saveAll([...getAll(),b]); sendMail(b); setBusy(false); setConf(b);
  }

  function reset(){ setConf(null); setForm({name:"",phone:"",email:"",jobType:"",date:"",time:"",tags:[],desc:"",image:null}); setImg(null); go(1); }

  if(view==="admin") return <Admin onBack={()=>setView("book")}/>;

  const avail = SLOTS.filter(s=>!booked.includes(s));
  const full  = form.jobType==="stora"&&form.date&&cnt>=MAX;
  const pct   = ((step-1)/(STEPS.length-1))*100;

  const summary=[
    ["Kund",    form.name],
    ["Telefon", form.phone],
    ["E-post",  form.email],
    ["Tjänst",  form.jobType==="enkla"?"Snabbservice":form.jobType==="stora"?"Större jobb":"–"],
    ...(form.jobType==="stora"?[["Datum",fmtLong(form.date)],["Tid",form.time]]:[]),
    ...(form.tags.length?[["Kategori",form.tags.join(", ")]]:[]),
    ...(form.desc?[["Notering",form.desc]]:[]),
  ].filter(([,v])=>v&&v!=="–");

  return (
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:F.body,color:C.white,overflowX:"hidden",width:"100%",maxWidth:"100vw"}}>
      <GS/>

      {/* ────────── HEADER ────────── */}
      <header style={{background:C.surface,borderBottom:`1px solid ${C.bd}`,position:"sticky",top:0,zIndex:40,width:"100%"}}>
        {/* Red top line */}
        <div style={{height:3,background:`linear-gradient(90deg,${C.redD},${C.red} 40%,transparent)`}}/>
        <div className="header-inner" style={{maxWidth:780,margin:"0 auto",height:58,padding:"0 20px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:10,width:"100%",boxSizing:"border-box"}}>
          {/* Logo */}
          <div style={{display:"flex",alignItems:"center",gap:10,minWidth:0,flex:1,overflow:"hidden"}}>
            <KIBadge size={36}/>
            <div style={{minWidth:0}}>
              <p className="hdr-wordmark" style={{fontFamily:F.display,fontSize:"clamp(14px,3vw,18px)",fontWeight:900,color:C.white,letterSpacing:"1px",textTransform:"uppercase",lineHeight:1,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>
                {WS.name}
              </p>
              <Mono s="9" col={C.g2} style={{letterSpacing:"2px",whiteSpace:"nowrap"}}>{WS.tagline.toUpperCase()}</Mono>
            </div>
          </div>
          {/* Right */}
          <div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
            <a href={`tel:${WS.tel}`} className="nav-link"
              style={{fontFamily:F.mono,fontSize:13,color:C.g1,textDecoration:"none",border:`1px solid ${C.bd}`,borderRadius:6,padding:"7px 14px",display:"flex",alignItems:"center",gap:7,minHeight:40,transition:"color .18s",whiteSpace:"nowrap"}}>
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none" style={{flexShrink:0}}>
                <path d="M2 2.5s1 3 3 5 4.5 4 4.5 4l2-2-2.5-2.5L7.5 8.5S6 7 5 6 2.5 3.5 2.5 3.5L4 2 1.5.5 2 2.5z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>{WS.phone}</span>
            </a>
            <button className="btn-ghost" onClick={()=>setView("admin")} style={{...ghostBase,fontSize:11,padding:"7px 12px",fontFamily:F.mono,letterSpacing:"1px",color:C.g2,minHeight:40}}>ADMIN</button>
          </div>
        </div>
        {/* Progress bar */}
        <div style={{height:2,background:C.stripe}}>
          <div style={{height:"100%",background:`linear-gradient(90deg,${C.redD},${C.red})`,width:`${pct}%`,transition:"width .5s cubic-bezier(.22,1,.36,1)"}}/>
        </div>
      </header>

      <main className="main-wrap" style={{maxWidth:600,margin:"0 auto",padding:"44px 16px 90px",width:"100%",boxSizing:"border-box"}}>

        {/* ────────── HERO ────────── */}
        <div className="hero-section" style={{padding:"0 0",marginBottom:48,overflow:"hidden"}}>

          {/* Live badge */}
          <div style={{display:"inline-flex",alignItems:"center",gap:8,background:C.redDim,border:`1px solid ${C.red}30`,borderRadius:4,padding:"5px 12px",marginBottom:18}}>
            <span style={{width:7,height:7,borderRadius:"50%",background:C.red,animation:"pulse 2s ease-in-out infinite",flexShrink:0}}/>
            <Mono s="9" col={C.red}>BOKNING ÖPPEN</Mono>
          </div>

          <h1 className="hero-title" style={{fontFamily:F.display,fontWeight:900,textTransform:"uppercase",letterSpacing:"-1.5px",lineHeight:.9,marginBottom:16,color:C.white,wordBreak:"break-word"}}>
            Boka din<br/>
            <span style={{color:C.red}}>Bilservice</span>
          </h1>

          <p style={{color:C.g1,fontSize:15,lineHeight:1.8,maxWidth:360}}>
            Ring oss direkt på{" "}
            <a href={`tel:${WS.tel}`} style={{color:C.red,textDecoration:"none",fontWeight:600,borderBottom:`1px solid ${C.red}44`}}>{WS.phone}</a>
            {" "}eller fyll i formuläret nedan.
          </p>

          {/* Quick info bar */}
          <div style={{display:"flex",gap:0,marginTop:24,border:`1px solid ${C.bd}`,borderRadius:8,overflow:"hidden",flexWrap:"wrap"}}>
            {[["Öppettider",WS.hours],["Plats",WS.city],[WS.est,"Erfarenhet"]].map(([l,v],i)=>(
              <div key={l} style={{flex:"1 1 140px",padding:"12px 16px",borderRight:i<2?`1px solid ${C.bd}`:"none"}}>
                <Mono s="8" col={C.g3} style={{display:"block",marginBottom:4}}>{l.toUpperCase()}</Mono>
                <p style={{color:C.g1,fontSize:13,fontWeight:500}}>{v}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ────────── STEP DOTS ────────── */}
        <div style={{marginBottom:28,display:"flex",alignItems:"flex-start",width:"100%"}}>
          {STEPS.map((s,i)=>{
            const done=step>s.n, cur=step===s.n;
            return (
              <div key={s.n} style={{display:"flex",alignItems:"flex-start",flex:i<STEPS.length-1?1:"none"}}>
                <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:6}}>
                  <div style={{width:32,height:32,borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:F.mono,fontSize:11,fontWeight:600,flexShrink:0,transition:"all .3s ease",background:done?C.red:cur?C.redDim:C.g3,color:done?"#fff":cur?C.red:C.g2,border:`1.5px solid ${done?C.red:cur?`${C.red}60`:C.g3}`,boxShadow:cur?`0 0 0 3px ${C.redDim},0 0 20px ${C.redGlow}`:"none"}}>
                    {done?<svg width="12" height="12" viewBox="0 0 12 12" fill="none"><polyline points="2,6 5,9 10,3" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>:`0${s.n}`}
                  </div>
                  <span className="step-labels" style={{fontFamily:F.mono,fontSize:8,letterSpacing:"1px",textTransform:"uppercase",color:done||cur?C.red:C.g3,transition:"color .3s",whiteSpace:"nowrap"}}>{s.l}</span>
                </div>
                {i<STEPS.length-1&&<div style={{flex:1,height:1.5,marginTop:15,background:step>s.n?C.red:C.g3,transition:"background .4s"}}/>}
              </div>
            );
          })}
        </div>

        {/* ────────── STEP CARDS ────────── */}
        <div key={step} className={dir==="up"?"step-in":"step-out"}>

          {/* ══ STEP 1: KONTAKT ══ */}
          {step===1&&(
            <Card>
              <CardHead num="01" title="Dina uppgifter" sub="Vi kontaktar dig på dessa uppgifter."/>
              <div style={{display:"flex",flexDirection:"column",gap:16}}>
                <Field label="Fullständigt namn"  type="text"  value={form.name}  onChange={v=>set("name",v)}  placeholder="Förnamn Efternamn" error={errs.name}/>
                <Field label="Telefonnummer"       type="tel"   value={form.phone} onChange={v=>set("phone",v)} placeholder="070 – XXX XX XX"   error={errs.phone}/>
                <Field label="E-postadress"        type="email" value={form.email} onChange={v=>set("email",v)} placeholder="din@email.se"       error={errs.email}/>
              </div>
              <CardNav onNext={next}/>
            </Card>
          )}

          {/* ══ STEP 2: TJÄNST ══ */}
          {step===2&&(
            <Card>
              <CardHead num="02" title="Välj tjänst" sub="Välj det som passar ditt ärende bäst."/>
              {errs.jobType&&<ErrTxt msg={errs.jobType}/>}

              {/* Service cards */}
              <div className="svc-grid" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:18,marginTop:8}}>
                {[
                  {v:"enkla",code:"S-01",title:"Snabbservice",sub:"Oljebyte, filter, däck – inget bokningskrav"},
                  {v:"stora",code:"J-02",title:"Större jobb", sub:"Motor, diagnos, broms – tidsbokning krävs"},
                ].map(svc=>{
                  const active=form.jobType===svc.v;
                  return (
                    <button key={svc.v} className="svc-card" onClick={()=>set("jobType",svc.v)}
                      style={{background:active?C.redDim:"transparent",border:`1.5px solid ${active?C.red:C.bd}`,borderRadius:8,padding:"20px 16px",textAlign:"left",transition:"all .2s ease",position:"relative",overflow:"hidden",borderLeft:active?`3px solid ${C.red}`:undefined,minHeight:120,display:"flex",flexDirection:"column",boxShadow:active?`0 0 0 1px ${C.red}20,0 8px 32px ${C.redGlow}`:"0 2px 8px rgba(0,0,0,.2)"}}>
                      <Mono s="8" col={active?C.red:C.g3} style={{display:"block",marginBottom:12,transition:"color .2s"}}>{svc.code}</Mono>
                      <p style={{fontFamily:F.display,fontSize:20,fontWeight:900,color:active?C.white:C.g1,textTransform:"uppercase",letterSpacing:".5px",marginBottom:5,transition:"color .2s",lineHeight:1}}>{svc.title}</p>
                      <p style={{color:C.g2,fontSize:12,lineHeight:1.5,flex:1}}>{svc.sub}</p>
                      {active&&<Mono s="8" col={C.red} style={{marginTop:10,display:"block"}}>Vald ✓</Mono>}
                    </button>
                  );
                })}
              </div>

              {/* Snabb info panel */}
              {form.jobType==="enkla"&&(
                <div style={{background:C.redDim,borderLeft:`3px solid ${C.red}`,borderRadius:"0 8px 8px 0",padding:"14px 16px",marginBottom:4}}>
                  <Mono s="9" col={C.red} style={{display:"block",marginBottom:5}}>DROP-IN VÄLKOMMET</Mono>
                  <p style={{color:C.g1,fontSize:13,lineHeight:1.7}}>Ingen tidsbokning krävs. Besök oss direkt — <strong style={{color:C.white}}>{WS.hours}</strong></p>
                </div>
              )}

              {/* Stora: date + time */}
              {form.jobType==="stora"&&(
                <div style={{borderTop:`1px solid ${C.bd}`,paddingTop:20,marginTop:4}}>
                  <Field label="Datum — måndag till fredag" type="date" min={todayStr()} value={form.date} error={errs.date}
                    onChange={v=>{ set("date",v); set("time",""); if(isWknd(v))setErrs(r=>({...r,date:"Välj en vardag (mån–fre)"})); else setErrs(r=>({...r,date:undefined})); }}/>
                  {form.date&&!isWknd(form.date)&&!errs.date&&(
                    <p style={{fontFamily:F.mono,fontSize:9,color:C.red,marginTop:8,letterSpacing:"1px"}}>
                      {avail.length>0?`${avail.length} / ${SLOTS.length} TIDER TILLGÄNGLIGA`:"INGA LEDIGA TIDER"}
                    </p>
                  )}

                  {form.date&&!isWknd(form.date)&&!full&&(
                    <div style={{marginTop:18}}>
                      <Cap>Välj tid</Cap>
                      {errs.time&&<ErrTxt msg={errs.time}/>}
                      <div className="slot-grid" style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginTop:8}}>
                        {SLOTS.map(sl=>{
                          const taken=booked.includes(sl), active=form.time===sl;
                          return (
                            <button key={sl} disabled={taken} className={!taken?"slot-btn":""}
                              onClick={()=>!taken&&set("time",sl)}
                              style={{padding:"15px 8px",borderRadius:6,fontFamily:F.mono,fontSize:16,fontWeight:600,letterSpacing:"1px",border:`1.5px solid ${active?C.red:taken?"rgba(255,255,255,.03)":C.bd}`,background:active?C.redDim:taken?"rgba(255,255,255,.01)":"transparent",color:taken?C.g3:active?C.red:C.g1,cursor:taken?"default":"pointer",opacity:taken?.3:1,transition:"all .18s",boxShadow:active?`0 0 24px ${C.redGlow}`:"none",minHeight:62}}>
                              {sl}
                              <span style={{display:"block",fontFamily:F.mono,fontSize:8,marginTop:5,letterSpacing:"1.5px",textTransform:"uppercase",color:taken?C.g3:active?C.red:C.g3}}>{taken?"Bokad":"Ledig"}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  {full&&(
                    <div style={{background:`${C.err}10`,borderLeft:`3px solid ${C.err}`,borderRadius:"0 6px 6px 0",padding:"12px 16px",marginTop:16}}>
                      <p style={{color:C.err,fontSize:13,fontWeight:500}}>Fullbokat detta datum. Välj ett annat datum.</p>
                    </div>
                  )}
                </div>
              )}
              <CardNav onNext={next} onBack={()=>go(1)}/>
            </Card>
          )}

          {/* ══ STEP 3: ÄRENDE ══ */}
          {step===3&&(
            <Card>
              <CardHead num="03" title="Beskriv ärendet" sub="Välj kategori och/eller beskriv felet med egna ord."/>
              {/* Tags */}
              <div style={{marginBottom:18}}>
                <Cap>Kategori <span style={{fontFamily:F.body,textTransform:"none",letterSpacing:0,fontWeight:400,fontSize:11,color:C.g3}}>— valfritt, välj en eller flera</span></Cap>
                <div style={{display:"flex",flexWrap:"wrap",gap:7,marginTop:8}}>
                  {TAGS.map(t=>{
                    const sel=form.tags.includes(t);
                    return (
                      <button key={t} onClick={()=>tag(t)} className="tag-pill"
                        style={{padding:"8px 14px",borderRadius:6,fontFamily:F.mono,fontSize:10,fontWeight:600,letterSpacing:".5px",textTransform:"uppercase",border:`1px solid ${sel?C.red:C.bd}`,background:sel?C.redDim:"transparent",color:sel?C.red:C.g1,transition:"all .15s",minHeight:38}}>
                        {t}
                      </button>
                    );
                  })}
                </div>
              </div>
              {/* Textarea */}
              <div style={{marginBottom:20}}>
                <Cap>Beskrivning <span style={{fontFamily:F.body,textTransform:"none",letterSpacing:0,fontWeight:400,fontSize:11,color:C.g3}}>— valfritt</span></Cap>
                <textarea value={form.desc} rows={4} onChange={e=>set("desc",e.target.value)} className="inp"
                  placeholder="Beskriv felet, symptom och hur länge det har pågått…"
                  style={{width:"100%",background:C.surface,border:`1.5px solid ${C.bd}`,borderRadius:8,padding:"13px 16px",color:C.white,fontFamily:F.body,resize:"vertical",lineHeight:1.75,minHeight:110,transition:"border-color .2s,box-shadow .2s",marginTop:8}}/>
              </div>
              {/* Image upload */}
              <div>
                <Cap>Bifoga bild <span style={{fontFamily:F.body,textTransform:"none",letterSpacing:0,fontWeight:400,fontSize:11,color:C.g3}}>— valfritt</span></Cap>
                <label style={{cursor:"pointer",display:"block",marginTop:8}}>
                  <input type="file" accept="image/*" style={{display:"none"}} onChange={handleImg}/>
                  {imgPrev?(
                    <div style={{borderRadius:8,overflow:"hidden",border:`1px solid ${C.bd}`,position:"relative"}}>
                      <img src={imgPrev} alt="" style={{width:"100%",maxHeight:220,objectFit:"cover"}}/>
                      <div style={{position:"absolute",inset:0,background:"linear-gradient(to top,rgba(0,0,0,.65) 0%,transparent 45%)",display:"flex",alignItems:"flex-end",padding:"12px 16px"}}>
                        <Mono s="10" col={C.g1}>BYTA BILD →</Mono>
                      </div>
                    </div>
                  ):(
                    <div style={{border:`1.5px dashed ${C.bd}`,borderRadius:8,padding:"40px 20px",textAlign:"center",background:"rgba(255,255,255,.01)"}}>
                      <div style={{width:46,height:46,border:`1px solid ${C.bd}`,borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 14px",background:"rgba(255,255,255,.02)"}}>
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 2v14M2 9h14" stroke={C.g3} strokeWidth="1.5" strokeLinecap="round"/></svg>
                      </div>
                      <p style={{color:C.g1,fontSize:14,fontWeight:500,marginBottom:4}}>Klicka för att ladda upp</p>
                      <Mono s="9" col={C.g3}>JPG / PNG — MAX 10 MB</Mono>
                    </div>
                  )}
                </label>
              </div>
              <CardNav onNext={next} onBack={()=>go(2)} nextLabel="Granska bokning"/>
            </Card>
          )}

          {/* ══ STEP 4: BEKRÄFTA ══ */}
          {step===4&&(
            <Card>
              <CardHead num="04" title="Bekräfta" sub="Kontrollera dina uppgifter och bekräfta bokningen."/>
              {/* Order number badge */}
              <div style={{background:C.cardAlt,border:`1px solid ${C.bd}`,borderRadius:6,padding:"12px 16px",marginBottom:18,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8}}>
                <div>
                  <Mono s="8" col={C.g3} style={{display:"block",marginBottom:3}}>ARBETSORDER</Mono>
                  <Mono s="14" col={C.red} style={{fontWeight:700}}>{orderNo(Date.now().toString())}</Mono>
                </div>
                <div style={{textAlign:"right"}}>
                  <Mono s="8" col={C.g3} style={{display:"block",marginBottom:3}}>DATUM</Mono>
                  <Mono s="12" col={C.g1}>{new Date().toLocaleDateString("sv-SE")}</Mono>
                </div>
              </div>
              {/* Summary table */}
              <div style={{border:`1px solid ${C.bd}`,borderRadius:8,overflow:"hidden",marginBottom:18}}>
                <div style={{background:C.cardAlt,padding:"7px 14px",borderBottom:`1px solid ${C.bd}`}}>
                  <Mono s="8" col={C.g3}>BOKNINGSDETALJER</Mono>
                </div>
                {summary.map(([l,v],i,a)=>(
                  <div key={l} style={{display:"flex",gap:12,padding:"11px 14px",borderBottom:i<a.length-1?`1px solid ${C.bdFaint}`:"none",background:i%2?"rgba(255,255,255,.012)":"transparent",flexWrap:"wrap"}}>
                    <Mono s="8" col={C.g3} style={{minWidth:68,paddingTop:2,flexShrink:0,textTransform:"uppercase"}}>{l}</Mono>
                    <span style={{color:C.g1,fontSize:13,fontWeight:500,flex:1,lineHeight:1.5,wordBreak:"break-word"}}>{cap(v)}</span>
                  </div>
                ))}
              </div>
              <p style={{fontFamily:F.mono,color:C.g3,fontSize:10,lineHeight:1.8,marginBottom:20,letterSpacing:".3px"}}>
                VI RINGER DIG PÅ <span style={{color:C.g2}}>{form.phone}</span> FÖR ATT BEKRÄFTA BOKNINGEN.
              </p>
              <RedBtn full large onClick={submit} disabled={busy}>{busy?<Spin/>:"Bekräfta bokning"}</RedBtn>
              <GhostBtn full onClick={()=>go(3)} style={{marginTop:8}}>Gå tillbaka</GhostBtn>
            </Card>
          )}
        </div>

        {/* ────────── FOOTER ────────── */}
        <div className="footer-inner" style={{marginTop:40,paddingTop:20,borderTop:`1px solid ${C.bd}`,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:"8px 20px"}}>
          <div style={{display:"flex",gap:16,flexWrap:"wrap",alignItems:"center"}}>
            <a href={`tel:${WS.tel}`} className="nav-link" style={{fontFamily:F.mono,fontSize:11,color:C.g2,textDecoration:"none",transition:"color .18s"}}>{WS.phone}</a>
            <a href={`mailto:${WS.email}`} className="nav-link" style={{fontFamily:F.mono,fontSize:11,color:C.g3,textDecoration:"none",transition:"color .18s"}}>{WS.email}</a>
          </div>
          <div style={{display:"flex",gap:16,flexWrap:"wrap"}}>
            <Mono s="11" col={C.g3}>{WS.hours}</Mono>
            <Mono s="11" col={C.g3} style={{opacity:.5}}>{WS.est}</Mono>
          </div>
        </div>
      </main>

      {conf&&<SuccessModal booking={conf} onClose={reset}/>}
    </div>
  );
}

/* ══════════════════════════════════════════
   LAYOUT COMPONENTS
══════════════════════════════════════════ */
function Card({children}) {
  return (
    <div style={{background:C.card,border:`1px solid ${C.bd}`,borderRadius:12,overflow:"hidden",boxShadow:"0 20px 70px rgba(0,0,0,.55)",position:"relative",width:"100%",boxSizing:"border-box"}}>
      {/* Red left accent */}
      <div style={{position:"absolute",top:0,left:0,width:3,height:"100%",background:`linear-gradient(180deg,${C.red},${C.redD} 55%,transparent)`,zIndex:1}}/>
      <div className="card-inner" style={{padding:"28px 28px 28px 32px"}}>{children}</div>
    </div>
  );
}

function CardHead({num,title,sub}) {
  return (
    <div style={{marginBottom:22}}>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
        <Mono s="9" col={C.red}>{num}</Mono>
        <div style={{flex:1,height:1,background:C.bd}}/>
      </div>
      <h2 style={{fontFamily:F.display,fontWeight:900,fontSize:"clamp(22px,5vw,30px)",color:C.white,textTransform:"uppercase",letterSpacing:"1px",lineHeight:1,marginBottom:6}}>{title}</h2>
      <p style={{color:C.g2,fontSize:13,lineHeight:1.55}}>{sub}</p>
    </div>
  );
}

function CardNav({onNext,onBack,nextLabel="Nästa steg"}) {
  return (
    <div style={{display:"flex",gap:8,marginTop:24,paddingTop:18,borderTop:`1px solid ${C.bd}`}}>
      {onBack&&<GhostBtn onClick={onBack} style={{minWidth:100}}>Tillbaka</GhostBtn>}
      <RedBtn full onClick={onNext} style={{flex:1}}>{nextLabel}</RedBtn>
    </div>
  );
}

/* ══════════════════════════════════════════
   STYLE BASES
══════════════════════════════════════════ */
const ghostBase = {
  background:"transparent",border:`1px solid ${C.bd}`,borderRadius:6,
  padding:"9px 14px",color:C.g1,fontSize:13,fontWeight:500,
  cursor:"pointer",fontFamily:F.body,transition:"all .18s",display:"inline-block",textAlign:"center",
};