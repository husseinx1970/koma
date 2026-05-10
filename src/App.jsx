import { useState, useEffect, useRef } from "react";
import {
  Wrench, Calendar, Clock, Phone, Mail, Car, ChevronRight, ChevronLeft,
  Menu, X, Sun, Moon, Upload, CheckCircle, Search, User, Edit, Eye,
  BarChart2, LogOut, ArrowRight, Shield, Star, Zap, Activity, Package,
  AlertTriangle, FileText, Trash2, Bell, Settings, Camera, RefreshCw,
  AlertCircle, MapPin, Check, Filter, Plus, ChevronDown
} from "lucide-react";

// ═══════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════
const PHONE_RAW  = "0790574975";
const PHONE_DISP = "079-057 49 75";
const MAX_MAJOR  = 5;
const MAX_SMALL  = 10;
const ADMIN_USER = "admin";
const ADMIN_PASS = "Hussein2024";

const TIME_SLOTS = ["08:00","09:00","10:00","11:00","13:00","14:00","15:00","16:00"];
const WEEKDAYS   = ["Sön","Mån","Tis","Ons","Tor","Fre","Lör"];

const STATUS_CFG = {
  waiting:      { label:"Väntar",           bg:"bg-amber-50",  text:"text-amber-700",  border:"border-amber-200",  dot:"bg-amber-500"  },
  confirmed:    { label:"Bekräftad",        bg:"bg-blue-50",   text:"text-blue-700",   border:"border-blue-200",   dot:"bg-blue-500"   },
  inprogress:   { label:"Pågår",            bg:"bg-orange-50", text:"text-orange-700", border:"border-orange-200", dot:"bg-orange-500" },
  waitingparts: { label:"Väntar på delar",  bg:"bg-purple-50", text:"text-purple-700", border:"border-purple-200", dot:"bg-purple-500" },
  finished:     { label:"Klar",             bg:"bg-green-50",  text:"text-green-700",  border:"border-green-200",  dot:"bg-green-500"  },
  pickedup:     { label:"Upphämtad",        bg:"bg-slate-50",  text:"text-slate-500",  border:"border-slate-200",  dot:"bg-slate-400"  },
};

const MAJOR_SERVICES = ["Motorutbyte","Växellådsutbyte","Kamremsbyte","Turbobyte","Stor diagnos","Fjädringssystem","Elfelsökning","Annat större arbete"];
const SMALL_SERVICES = ["Oljebyte / Service","Däckbyte","Bromsbelägg","Batteribyte","AC-påfyllning","Snabbdiagnos","Lamputbyte","Annat mindre arbete"];

const SEED_BOOKINGS = [
  { id:"BK-001", category:"major", date:"2026-05-12", time:"09:00", name:"Erik Johansson",  phone:"070-123 45 67", email:"erik.j@gmail.com",   regNumber:"ABC123", carModel:"Volvo V70 2018",       description:"Motorn startar inte. Hör ett klickande ljud vid start.", status:"confirmed",    notes:"Troligtvis startmotorn. Kontrollera batteri först.", estimatedHours:3, estimatedCompletion:"2026-05-12", createdAt:"2026-05-10T07:30:00", serviceType:"Motorproblem",       images:[] },
  { id:"BK-002", category:"small", date:"2026-05-12", time:"10:00", name:"Ingrid Lindqvist",phone:"073-456 78 90", email:"ingrid.l@hotmail.com",regNumber:"XYZ789", carModel:"Toyota Corolla 2020",   description:"Dags för oljebyte, 15 000 km sedan sist.",             status:"waiting",      notes:"", estimatedHours:1, estimatedCompletion:"2026-05-12", createdAt:"2026-05-10T09:15:00", serviceType:"Oljebyte / Service", images:[] },
  { id:"BK-003", category:"major", date:"2026-05-13", time:"08:00", name:"Anders Bergström",phone:"076-234 56 78", email:"anders.b@outlook.com",regNumber:"DEF456", carModel:"BMW 3-serie 2019",       description:"Kamremmen behöver bytas. Bilen har gått 180 000 km.",  status:"inprogress",   notes:"Kamremssats beställd. Klar imorgon eftermiddag.", estimatedHours:6, estimatedCompletion:"2026-05-14", createdAt:"2026-05-09T14:00:00", serviceType:"Kamremsbyte",        images:[] },
  { id:"BK-004", category:"small", date:"2026-05-13", time:"11:00", name:"Sara Nilsson",    phone:"072-345 67 89", email:"sara.n@yahoo.com",    regNumber:"GHI012", carModel:"Volkswagen Golf 2021",   description:"Bromsbeläggen gnisslar vid inbromsning framtill.",     status:"confirmed",    notes:"", estimatedHours:2, estimatedCompletion:"2026-05-13", createdAt:"2026-05-10T10:00:00", serviceType:"Bromsbelägg",        images:[] },
  { id:"BK-005", category:"small", date:"2026-05-14", time:"14:00", name:"Lars Persson",    phone:"070-567 89 01", email:"lars.p@gmail.com",    regNumber:"JKL345", carModel:"Skoda Octavia 2017",     description:"Behöver fylla på AC-gas inför sommaren.",              status:"waiting",      notes:"", estimatedHours:1, estimatedCompletion:"2026-05-14", createdAt:"2026-05-10T11:30:00", serviceType:"AC-påfyllning",      images:[] },
  { id:"BK-006", category:"major", date:"2026-05-14", time:"13:00", name:"Maria Svensson",  phone:"076-789 01 23", email:"maria.s@gmail.com",   regNumber:"MNO678", carModel:"Audi A4 2020",           description:"Turbon låter konstigt vid acceleration.",              status:"waitingparts", notes:"Turboaggregat beställt från leverantör.", estimatedHours:5, estimatedCompletion:"2026-05-16", createdAt:"2026-05-09T16:00:00", serviceType:"Turbobyte",          images:[] },
  { id:"BK-007", category:"small", date:"2026-05-11", time:"09:00", name:"Johan Karlsson",  phone:"073-321 09 87", email:"johan.k@hotmail.com", regNumber:"PQR901", carModel:"Ford Focus 2016",        description:"Vill byta till sommardäck.",                           status:"finished",     notes:"Klart! Mönsterdjup 6mm. Vinterdäck förvaras.", estimatedHours:1, estimatedCompletion:"2026-05-11", createdAt:"2026-05-08T10:00:00", serviceType:"Däckbyte",           images:[] },
];

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════
const genId = () => "BK-" + Math.random().toString(36).slice(2,8).toUpperCase();

function fmtDate(d) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("sv-SE", { weekday:"long", year:"numeric", month:"long", day:"numeric" });
}
function fmtDateShort(d) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("sv-SE", { day:"numeric", month:"short" });
}
function fmtTime() {
  return new Date().toLocaleTimeString("sv-SE", { hour:"2-digit", minute:"2-digit" });
}

function getWorkDates(bookings, category, count = 30) {
  const res = [], today = new Date();
  today.setHours(0,0,0,0);
  const max = category === "major" ? MAX_MAJOR : MAX_SMALL;
  let checked = 0;
  while (res.length < count && checked < 90) {
    checked++;
    const d = new Date(today);
    d.setDate(today.getDate() + checked);
    const dow = d.getDay();
    if (dow === 0 || dow === 6) continue;
    const ds = d.toISOString().split("T")[0];
    const booked = bookings.filter(b => b.date === ds && b.category === category).length;
    res.push({ date: ds, booked, max, available: booked < max, dayName: WEEKDAYS[dow], dayNum: d.getDate(), month: d.toLocaleDateString("sv-SE",{month:"short"}) });
  }
  return res;
}

function getSlotsForDate(bookings, date) {
  const taken = bookings.filter(b => b.date === date).map(b => b.time);
  return TIME_SLOTS.map(t => ({ time: t, taken: taken.includes(t) }));
}

function loadBookings() {
  try { const s = localStorage.getItem("komIn_v3"); return s ? JSON.parse(s) : SEED_BOOKINGS; } catch { return SEED_BOOKINGS; }
}
function saveBookings(bks) {
  try { localStorage.setItem("komIn_v3", JSON.stringify(bks)); } catch {}
}

// ═══════════════════════════════════════════════════════════════
// GLOBAL STYLES
// ═══════════════════════════════════════════════════════════════
function GlobalStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
      *{box-sizing:border-box;margin:0;padding:0}
      body{font-family:'DM Sans',sans-serif;overflow-x:hidden}
      .syne{font-family:'Syne',sans-serif!important}
      @keyframes fadeUp{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:translateY(0)}}
      @keyframes fadeIn{from{opacity:0}to{opacity:1}}
      @keyframes scaleIn{from{opacity:0;transform:scale(.95)}to{opacity:1;transform:scale(1)}}
      @keyframes slideRight{from{opacity:0;transform:translateX(-20px)}to{opacity:1;transform:translateX(0)}}
      @keyframes pulse2{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.08);opacity:.8}}
      @keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
      .afu{animation:fadeUp .65s ease both}
      .afu1{animation:fadeUp .65s .1s ease both}
      .afu2{animation:fadeUp .65s .2s ease both}
      .afu3{animation:fadeUp .65s .3s ease both}
      .afu4{animation:fadeUp .65s .4s ease both}
      .afu5{animation:fadeUp .65s .5s ease both}
      .afi{animation:fadeIn .4s ease both}
      .asi{animation:scaleIn .3s ease both}
      .hero-bg{background:linear-gradient(135deg,#0c1729 0%,#132240 45%,#0a1e36 100%)}
      .hero-grid{background-image:radial-gradient(rgba(255,255,255,.04) 1px,transparent 1px);background-size:32px 32px}
      .btn-cta{background:linear-gradient(135deg,#ea580c,#dc2626);transition:all .2s ease}
      .btn-cta:hover{background:linear-gradient(135deg,#c2410c,#b91c1c);transform:translateY(-2px);box-shadow:0 12px 28px rgba(234,88,12,.4)}
      .btn-cta:active{transform:translateY(0)}
      .btn-outline{border:2px solid rgba(255,255,255,.25);transition:all .2s ease}
      .btn-outline:hover{border-color:rgba(255,255,255,.6);background:rgba(255,255,255,.08)}
      .card-hover{transition:transform .25s ease,box-shadow .25s ease}
      .card-hover:hover{transform:translateY(-5px);box-shadow:0 24px 48px rgba(0,0,0,.12)}
      .service-icon-wrap{transition:transform .25s ease}
      .service-icon-wrap:hover{transform:scale(1.1)}
      .slot-btn{transition:all .15s ease;cursor:pointer}
      .slot-btn:hover:not(:disabled){background:#fff7ed;border-color:#ea580c;color:#ea580c}
      .slot-btn.selected{background:#ea580c!important;border-color:#ea580c!important;color:white!important}
      .slot-btn:disabled{opacity:.4;cursor:not-allowed}
      .date-chip{transition:all .15s ease;cursor:pointer;flex-shrink:0}
      .date-chip:hover:not(.unavail){border-color:#ea580c;color:#ea580c}
      .date-chip.sel{background:#ea580c!important;border-color:#ea580c!important;color:white!important}
      .date-chip.unavail{opacity:.4;cursor:not-allowed}
      input:focus,textarea:focus,select:focus{outline:2px solid #ea580c;outline-offset:1px}
      .modal-back{animation:fadeIn .2s ease both}
      .modal-box{animation:scaleIn .25s ease both}
      .step-bar div{transition:all .4s ease}
      .admin-sidebar-item{transition:all .15s ease}
      .admin-sidebar-item:hover{background:rgba(234,88,12,.08)}
      .admin-sidebar-item.active{background:rgba(234,88,12,.12);color:#ea580c}
      ::-webkit-scrollbar{width:5px;height:5px}
      ::-webkit-scrollbar-track{background:transparent}
      ::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:3px}
      ::-webkit-scrollbar-thumb:hover{background:#94a3b8}
    `}</style>
  );
}

// ═══════════════════════════════════════════════════════════════
// STATUS BADGE
// ═══════════════════════════════════════════════════════════════
function StatusBadge({ status }) {
  const c = STATUS_CFG[status] || STATUS_CFG.waiting;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${c.bg} ${c.text} ${c.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`}></span>
      {c.label}
    </span>
  );
}

// ═══════════════════════════════════════════════════════════════
// NAVBAR
// ═══════════════════════════════════════════════════════════════
function Navbar({ page, setPage, darkMode, toggleDark }) {
  const [open, setOpen] = useState(false);
  const dk = darkMode;
  return (
    <nav className={`fixed inset-x-0 top-0 z-50 border-b backdrop-blur-md transition-colors duration-300 ${dk ? "bg-gray-950/95 border-gray-800" : "bg-white/96 border-slate-100"}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16 md:h-20">
        <button onClick={() => { setPage("home"); setOpen(false); }} className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg shadow-orange-500/20 group-hover:scale-105 transition-transform">
            <Wrench className="w-5 h-5 text-white" />
          </div>
          <div className="text-left">
            <div className={`syne font-bold text-[15px] leading-none ${dk ? "text-white" : "text-gray-900"}`}>Kom In Bilservice</div>
            <div className="text-[10px] text-orange-500 font-semibold tracking-widest uppercase mt-0.5">Auktoriserad verkstad</div>
          </div>
        </button>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-7">
          {[["Hem","home"]].map(([l,p]) => (
            <button key={l} onClick={() => setPage(p)} className={`text-sm font-medium transition-colors ${dk?"text-gray-400 hover:text-white":"text-gray-600 hover:text-gray-900"}`}>{l}</button>
          ))}
          {["Tjänster","Om oss","Kontakt"].map(l => (
            <span key={l} className={`text-sm font-medium cursor-pointer transition-colors ${dk?"text-gray-400 hover:text-white":"text-gray-600 hover:text-gray-900"}`}>{l}</span>
          ))}
          <button onClick={toggleDark} className={`p-2 rounded-lg transition-all ${dk?"bg-gray-800 text-yellow-400 hover:bg-gray-700":"bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
            {dk ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button onClick={() => setPage("booking")} className="btn-cta text-white text-sm font-semibold px-5 py-2.5 rounded-xl">
            Boka tid &rarr;
          </button>
        </div>

        {/* Mobile */}
        <div className="flex md:hidden items-center gap-2">
          <button onClick={toggleDark} className={`p-2 rounded-lg ${dk?"bg-gray-800 text-yellow-400":"bg-gray-100 text-gray-600"}`}>
            {dk ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button onClick={() => setOpen(!open)} className={`p-2 rounded-lg ${dk?"bg-gray-800 text-white":"bg-gray-100 text-gray-900"}`}>
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>
      {open && (
        <div className={`md:hidden border-t px-4 py-3 space-y-1 afi ${dk?"bg-gray-950 border-gray-800":"bg-white border-slate-100"}`}>
          {["Hem","Tjänster","Om oss","Kontakt"].map(l => (
            <button key={l} onClick={() => setOpen(false)} className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium ${dk?"text-gray-300 hover:bg-gray-800":"text-gray-700 hover:bg-gray-50"}`}>{l}</button>
          ))}
          <button onClick={() => { setPage("booking"); setOpen(false); }} className="w-full btn-cta text-white text-sm font-semibold py-3 rounded-xl mt-2">
            Boka tid nu &rarr;
          </button>
        </div>
      )}
    </nav>
  );
}

// ═══════════════════════════════════════════════════════════════
// HOME PAGE
// ═══════════════════════════════════════════════════════════════
function HomePage({ setPage, darkMode }) {
  const dk = darkMode;

  const services = [
    { icon: <Wrench className="w-6 h-6" />, title: "Motor & Drivlina", desc: "Motorutbyte, kamremsbyte, turbobyte och alla typer av motorreparationer.", tag: "Större arbete", color: "from-orange-500 to-red-600" },
    { icon: <RefreshCw className="w-6 h-6" />, title: "Växellåda", desc: "Reparation och utbyte av automatväxellådor och manuella växellådor.", tag: "Större arbete", color: "from-red-500 to-rose-600" },
    { icon: <Activity className="w-6 h-6" />, title: "Fjädring & Styrning", desc: "Stötdämpare, krängningshämmare, styrväxel och hjulupphängning.", tag: "Större arbete", color: "from-blue-600 to-blue-800" },
    { icon: <Zap className="w-6 h-6" />, title: "El & Elektronik", desc: "Diagnos, lambdasond, startmotor, generator och elsystemfelsökning.", tag: "Större arbete", color: "from-indigo-500 to-blue-700" },
    { icon: <Settings className="w-6 h-6" />, title: "Service & Oljebyte", desc: "Komplett service, oljebyte, filterbyten och förebyggande underhåll.", tag: "Snabbt arbete", color: "from-emerald-500 to-teal-600" },
    { icon: <CheckCircle className="w-6 h-6" />, title: "Bromsar & Däck", desc: "Bromsbelägg, bromsskivor, däckbyte och säsongsbyten.", tag: "Snabbt arbete", color: "from-teal-500 to-cyan-600" },
    { icon: <Package className="w-6 h-6" />, title: "Batteribyte & AC", desc: "Batteribyte, laddningssystemkontroll och AC-påfyllning.", tag: "Snabbt arbete", color: "from-violet-500 to-purple-700" },
    { icon: <Search className="w-6 h-6" />, title: "Diagnos & Besiktning", desc: "Felkodsläsning, förbesiktningskontroll och teknisk rådgivning.", tag: "Snabbt arbete", color: "from-slate-600 to-gray-800" },
  ];

  const whyUs = [
    { icon: <Shield className="w-7 h-7" />, title: "Garanterat arbete", desc: "Alla reparationer utförs med garanti. Vi står bakom varje skiftnyckel vi vrider." },
    { icon: <Star className="w-7 h-7" />, title: "Erfarna mekaniker", desc: "Vårt team har över 20 års sammanlagd erfarenhet av alla bilmärken och modeller." },
    { icon: <Clock className="w-7 h-7" />, title: "Transparent prissättning", desc: "Inga dolda avgifter. Du får alltid en klar offert innan arbetet påbörjas." },
    { icon: <Phone className="w-7 h-7" />, title: "Personlig service", desc: "Hussein och teamet svarar alltid på frågor. Ring direkt för snabb hjälp." },
  ];

  const steps = [
    { num:"01", title:"Boka online", desc:"Välj datum och tid som passar dig. Ange bilens registreringsnummer och beskriv problemet." },
    { num:"02", title:"Vi kontaktar dig", desc:"Vi bekräftar din bokning och kan ställa eventuella följdfrågor för att förbereda jobbet." },
    { num:"03", title:"Hämta din bil", desc:"Bilen är klar på avtalad tid. Vi ringer när allt är klart och du kan hämta den." },
  ];

  return (
    <div className={`pt-16 md:pt-20 ${dk?"bg-gray-950":"bg-stone-50"} transition-colors duration-300`}>

      {/* ── HERO ── */}
      <section className="hero-bg hero-grid relative overflow-hidden min-h-[92vh] flex items-center">
        {/* Decorative blobs */}
        <div className="absolute top-[-100px] right-[-100px] w-[600px] h-[600px] bg-orange-600/8 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-60px] left-[-80px] w-[400px] h-[400px] bg-blue-800/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 w-full">
          <div className="max-w-3xl">
            <div className="afu inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/15 border border-orange-500/25 text-orange-400 text-xs font-semibold tracking-widest uppercase mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse"></span>
              Stockholm · Professionell bilservice
            </div>
            <h1 className="afu1 syne text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-[1.05] tracking-tight mb-6">
              Din bil i <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-400">trygga händer</span>
            </h1>
            <p className="afu2 text-lg md:text-xl text-slate-300 leading-relaxed mb-4 max-w-2xl">
              Kom In Bilservice erbjuder professionell bilreparation med snabb service, transparent prissättning och garanterat hantverk. Boka enkelt online — vi tar hand om resten.
            </p>
            <p className="afu3 text-slate-400 italic mb-10 max-w-xl">
              "Är du osäker på vad problemet är? Beskriv bara vad du hör, känner eller upplever när du kör bilen — vi hjälper dig att felsöka problemet."
            </p>
            <div className="afu4 flex flex-col sm:flex-row gap-4">
              <button onClick={() => setPage("booking")} className="btn-cta text-white font-bold text-base px-8 py-4 rounded-2xl inline-flex items-center justify-center gap-2">
                <Calendar className="w-5 h-5" /> Boka tid online
              </button>
              <a href={`tel:${PHONE_RAW}`} className="btn-outline text-white font-semibold text-base px-8 py-4 rounded-2xl inline-flex items-center justify-center gap-2">
                <Phone className="w-5 h-5" /> Ring oss: {PHONE_DISP}
              </a>
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-white/8 bg-white/4 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[["15+","Års erfarenhet"],["2 500+","Nöjda kunder"],["98%","Nöjdhetsgrad"],["48h","Svarstid"]]
              .map(([num, label]) => (
                <div key={label} className="text-center">
                  <div className="syne text-2xl md:text-3xl font-black text-white">{num}</div>
                  <div className="text-xs text-slate-400 mt-0.5 font-medium">{label}</div>
                </div>
              ))}
          </div>
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section id="services" className={`py-24 ${dk?"bg-gray-950":"bg-white"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className={`syne text-sm font-bold tracking-widest uppercase mb-3 ${dk?"text-orange-400":"text-orange-600"}`}>Våra tjänster</div>
            <h2 className={`syne text-4xl md:text-5xl font-extrabold ${dk?"text-white":"text-gray-900"} mb-4`}>Vad vi gör</h2>
            <p className={`text-lg max-w-2xl mx-auto ${dk?"text-gray-400":"text-gray-600"}`}>
              Från snabba servicearbeten till komplexa motorreparationer — vi hanterar alla typer av bilproblem med precision och omsorg.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {services.map((s, i) => (
              <div key={i} className={`relative rounded-2xl p-6 border card-hover ${dk?"bg-gray-900 border-gray-800":"bg-white border-gray-100"} cursor-pointer group`}
                onClick={() => setPage("booking")}>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center text-white mb-4 service-icon-wrap`}>
                  {s.icon}
                </div>
                <div className={`text-[10px] font-bold tracking-widest uppercase mb-2 ${s.tag.includes("Snabbt") ? "text-emerald-500":"text-orange-500"}`}>{s.tag}</div>
                <h3 className={`syne font-bold text-base mb-2 ${dk?"text-white":"text-gray-900"}`}>{s.title}</h3>
                <p className={`text-sm leading-relaxed ${dk?"text-gray-400":"text-gray-600"}`}>{s.desc}</p>
                <div className={`mt-4 flex items-center gap-1 text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity ${dk?"text-orange-400":"text-orange-600"}`}>
                  Boka nu <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY US ── */}
      <section id="about" className={`py-24 ${dk?"bg-gray-900":"bg-stone-50"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className={`syne text-sm font-bold tracking-widest uppercase mb-3 ${dk?"text-orange-400":"text-orange-600"}`}>Varför välja oss</div>
              <h2 className={`syne text-4xl md:text-5xl font-extrabold ${dk?"text-white":"text-gray-900"} mb-6 leading-tight`}>
                Verkstaden som bryr sig om din bil — och dig
              </h2>
              <p className={`text-lg mb-8 leading-relaxed ${dk?"text-gray-400":"text-gray-600"}`}>
                På Kom In Bilservice behandlar vi din bil som om den vore vår egen. Oavsett om det är en enkel service eller en komplex motorreparation — du kan räkna med oss.
              </p>
              <div className="space-y-5">
                {whyUs.map((w, i) => (
                  <div key={i} className={`flex gap-4 p-5 rounded-2xl ${dk?"bg-gray-800":"bg-white"} border ${dk?"border-gray-700":"border-gray-100"}`}>
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white flex-shrink-0">
                      {w.icon}
                    </div>
                    <div>
                      <h3 className={`syne font-bold text-base mb-1 ${dk?"text-white":"text-gray-900"}`}>{w.title}</h3>
                      <p className={`text-sm leading-relaxed ${dk?"text-gray-400":"text-gray-600"}`}>{w.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* CTA card */}
            <div className={`rounded-3xl overflow-hidden ${dk?"bg-gray-800":"bg-white"} border ${dk?"border-gray-700":"border-gray-100"} shadow-2xl`}>
              <div className="hero-bg p-8">
                <div className="syne text-white font-black text-2xl mb-2">Osäker på problemet?</div>
                <p className="text-slate-300 text-sm">Ingen fara — du behöver inga tekniska kunskaper för att boka.</p>
              </div>
              <div className="p-8 space-y-5">
                {[
                  "Beskriv vad du hör, känner eller ser",
                  "Vi felsöker problemet gratis över telefon",
                  "Vi kan inspektera bilen utan bokning",
                  "Alltid transparent offert innan vi påbörjar",
                  "Garanterat arbete med skriftlig garanti",
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3.5 h-3.5 text-orange-600" />
                    </div>
                    <span className={`text-sm font-medium ${dk?"text-gray-300":"text-gray-700"}`}>{item}</span>
                  </div>
                ))}
                <button onClick={() => setPage("booking")} className="w-full btn-cta text-white font-bold text-base py-4 rounded-2xl mt-4">
                  Boka gratis konsultation
                </button>
                <a href={`tel:${PHONE_RAW}`} className={`w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold border-2 ${dk?"border-gray-600 text-gray-300 hover:border-orange-500":"border-gray-200 text-gray-700 hover:border-orange-500"} transition-colors`}>
                  <Phone className="w-4 h-4 text-orange-500" /> Ring Hussein: {PHONE_DISP}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className={`py-24 ${dk?"bg-gray-950":"bg-white"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className={`syne text-sm font-bold tracking-widest uppercase mb-3 ${dk?"text-orange-400":"text-orange-600"}`}>Enkelt och smidigt</div>
            <h2 className={`syne text-4xl md:text-5xl font-extrabold ${dk?"text-white":"text-gray-900"}`}>Hur det fungerar</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((s, i) => (
              <div key={i} className={`relative p-8 rounded-2xl border ${dk?"bg-gray-900 border-gray-800":"bg-stone-50 border-gray-100"}`}>
                <div className="syne text-6xl font-black text-orange-500/20 mb-4">{s.num}</div>
                <h3 className={`syne font-bold text-xl mb-3 ${dk?"text-white":"text-gray-900"}`}>{s.title}</h3>
                <p className={`text-sm leading-relaxed ${dk?"text-gray-400":"text-gray-600"}`}>{s.desc}</p>
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-12 -right-4 z-10">
                    <ArrowRight className={`w-8 h-8 ${dk?"text-gray-700":"text-gray-300"}`} />
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <button onClick={() => setPage("booking")} className="btn-cta text-white font-bold text-base px-10 py-4 rounded-2xl inline-flex items-center gap-2">
              <Calendar className="w-5 h-5" /> Boka din tid nu
            </button>
          </div>
        </div>
      </section>

      {/* ── EMERGENCY ── */}
      <section id="contact" className="py-20 bg-gradient-to-br from-red-600 via-orange-600 to-red-700 relative overflow-hidden">
        <div className="absolute inset-0 hero-grid opacity-20 pointer-events-none" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-6 relative">
            <Phone className="w-8 h-8 text-white" />
            <div className="absolute inset-0 rounded-full bg-white/20 animate-ping" />
          </div>
          <h2 className="syne text-4xl md:text-5xl font-extrabold text-white mb-4">Akut ärende?</h2>
          <p className="text-xl text-red-100 mb-3">Ring Hussein direkt — vi hjälper dig omedelbart</p>
          <p className="text-red-200 mb-8 max-w-xl mx-auto">
            Har du ett akut fel, kör fast på vägen eller behöver omedelbar hjälp? Tveka inte att ringa — vi finns här för dig.
          </p>
          <a href={`tel:${PHONE_RAW}`} className="inline-flex items-center gap-3 bg-white text-red-600 font-black text-xl md:text-2xl px-10 py-5 rounded-2xl shadow-2xl hover:scale-105 transition-transform">
            <Phone className="w-6 h-6" /> {PHONE_DISP}
          </a>
          <div className="mt-6 flex flex-col sm:flex-row justify-center gap-4 text-sm text-red-200">
            <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> Mån–Fre: 07:30–18:00</span>
            <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> Verkstadsgatan 12, Stockholm</span>
            <span className="flex items-center gap-1.5"><Mail className="w-4 h-4" /> kontakt@komin-bilservice.se</span>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className={`py-16 ${dk?"bg-gray-950 border-gray-800":"bg-gray-900 border-gray-800"} border-t`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                  <Wrench className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="syne font-bold text-white text-base">Kom In Bilservice</div>
                  <div className="text-xs text-orange-500 font-semibold tracking-widest uppercase">Auktoriserad verkstad</div>
                </div>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed mb-5 max-w-xs">
                Professionell bilservice och reparation i Stockholm. Vi tar hand om din bil med omsorg, kompetens och ärlighet.
              </p>
              <a href={`tel:${PHONE_RAW}`} className="inline-flex items-center gap-2 text-orange-400 font-semibold text-sm hover:text-orange-300 transition-colors">
                <Phone className="w-4 h-4" /> {PHONE_DISP}
              </a>
            </div>
            <div>
              <div className="syne font-bold text-white text-sm mb-5 tracking-wider uppercase">Tjänster</div>
              <ul className="space-y-3 text-gray-400 text-sm">
                {["Motor & Drivlina","Växellåda","Bromsar & Däck","Service & Oljebyte","El & Diagnos","AC & Klimat"].map(t => (
                  <li key={t} className="hover:text-orange-400 cursor-pointer transition-colors">{t}</li>
                ))}
              </ul>
            </div>
            <div>
              <div className="syne font-bold text-white text-sm mb-5 tracking-wider uppercase">Öppettider</div>
              <ul className="space-y-3 text-gray-400 text-sm">
                <li className="flex justify-between"><span>Måndag–Fredag</span><span className="text-white font-medium">07:30–18:00</span></li>
                <li className="flex justify-between"><span>Lördag</span><span className="text-white font-medium">09:00–14:00</span></li>
                <li className="flex justify-between"><span>Söndag</span><span className="text-gray-600">Stängt</span></li>
              </ul>
              <div className="mt-6 pt-6 border-t border-gray-800">
                <div className="text-xs text-gray-500 mb-2">Admin-inloggning</div>
                <button onClick={() => setPage("admin-login")} className="text-xs text-gray-600 hover:text-gray-400 transition-colors underline">
                  Gå till adminpanel
                </button>
              </div>
            </div>
          </div>
          <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-600">
            <span>© 2026 Kom In Bilservice. Alla rättigheter förbehållna.</span>
            <span>Verkstadsgatan 12, 123 45 Stockholm</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// BOOKING PAGE
// ═══════════════════════════════════════════════════════════════
function BookingPage({ bookings, addBooking, setPage, darkMode }) {
  const dk = darkMode;
  const [step, setStep] = useState(1);
  const [category, setCategory] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [formData, setFormData] = useState({ name:"", phone:"", email:"", regNumber:"", carModel:"", serviceType:"", description:"" });
  const [images, setImages] = useState([]);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [booking, setBooking] = useState(null);
  const dateScrollRef = useRef(null);

  const workDates = category ? getWorkDates(bookings, category) : [];
  const slots = selectedDate ? getSlotsForDate(bookings, selectedDate) : [];
  const services = category === "major" ? MAJOR_SERVICES : SMALL_SERVICES;

  const validate = () => {
    const e = {};
    if (!formData.name.trim()) e.name = "Namn krävs";
    if (!formData.phone.trim()) e.phone = "Telefonnummer krävs";
    if (!formData.regNumber.trim()) e.regNumber = "Registreringsnummer krävs";
    if (!formData.description.trim()) e.description = "Beskriv problemet";
    if (!formData.serviceType) e.serviceType = "Välj servicetyp";
    return e;
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImages(prev => [...prev, { name: file.name, url: ev.target.result }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setSubmitting(true);
    setTimeout(() => {
      const b = {
        id: genId(), category, date: selectedDate, time: selectedTime,
        ...formData,
        status: "waiting", notes: "", estimatedHours: null, estimatedCompletion: null,
        createdAt: new Date().toISOString(), images: images.map(i => i.name)
      };
      addBooking(b);
      setBooking(b);
      setStep(4);
      setSubmitting(false);
    }, 1200);
  };

  const stepLabels = ["Välj typ","Datum & tid","Dina uppgifter","Bekräftelse"];

  const CARD = dk ? "bg-gray-900 border-gray-800" : "bg-white border-gray-100";
  const LBL = dk ? "text-gray-400" : "text-gray-600";
  const HDR = dk ? "text-white" : "text-gray-900";
  const INP = `w-full px-4 py-3 rounded-xl border text-sm transition-colors ${dk?"bg-gray-800 border-gray-700 text-white placeholder-gray-500":"bg-white border-gray-200 text-gray-900 placeholder-gray-400"}`;

  return (
    <div className={`min-h-screen pt-16 md:pt-20 pb-20 ${dk?"bg-gray-950":"bg-stone-50"}`}>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">

        {/* Header */}
        <div className="mb-8">
          <button onClick={() => step > 1 ? setStep(step-1) : setPage("home")} className={`flex items-center gap-1.5 text-sm ${LBL} hover:text-orange-500 transition-colors mb-4`}>
            <ChevronLeft className="w-4 h-4" /> {step > 1 ? "Tillbaka" : "Hem"}
          </button>
          <h1 className={`syne text-3xl md:text-4xl font-extrabold ${HDR} mb-2`}>Boka tid</h1>
          <p className={`text-sm ${LBL}`}>Steg {step} av 4 — {stepLabels[step-1]}</p>
        </div>

        {/* Progress bar */}
        <div className="step-bar flex gap-1.5 mb-10">
          {[1,2,3,4].map(n => (
            <div key={n} className={`h-1.5 flex-1 rounded-full ${n <= step ? "bg-orange-500" : dk?"bg-gray-700":"bg-gray-200"}`} />
          ))}
        </div>

        {/* ── STEP 1: Category ── */}
        {step === 1 && (
          <div className="asi space-y-4">
            <h2 className={`syne text-xl font-bold ${HDR} mb-6`}>Vilken typ av tjänst behöver du?</h2>
            {[
              {
                id:"major", label:"Större reparationer", badge:`Max ${MAX_MAJOR}/dag`,
                icon:<Wrench className="w-8 h-8" />, color:"from-orange-500 to-red-600",
                desc:"Motorbyte, kamrem, turbo, växellåda, fjädring, el-felsökning och andra komplexa arbeten.",
                examples:["Motorutbyte","Kamremsbyte","Turbobyte","Växellådsarbete"]
              },
              {
                id:"small", label:"Enklare service & reparationer", badge:`Max ${MAX_SMALL}/dag`,
                icon:<Settings className="w-8 h-8" />, color:"from-emerald-500 to-teal-600",
                desc:"Oljebyte, däckbyte, bromsbelägg, batteribyte, AC och snabba servicearbeten.",
                examples:["Oljebyte","Däckbyte","Bromsbelägg","AC-påfyllning"]
              }
            ].map(opt => (
              <button key={opt.id}
                onClick={() => { setCategory(opt.id); setSelectedDate(null); setSelectedTime(null); setStep(2); }}
                className={`w-full text-left p-6 rounded-2xl border-2 card-hover transition-all ${category === opt.id ? "border-orange-500 bg-orange-50" : dk?"border-gray-700 bg-gray-900 hover:border-orange-500/50":"border-gray-200 bg-white hover:border-orange-300"}`}>
                <div className="flex items-start gap-5">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${opt.color} flex items-center justify-center text-white flex-shrink-0`}>
                    {opt.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h3 className={`syne font-bold text-lg ${HDR}`}>{opt.label}</h3>
                      <span className="text-xs font-semibold text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full">{opt.badge}</span>
                    </div>
                    <p className={`text-sm ${LBL} mb-3 leading-relaxed`}>{opt.desc}</p>
                    <div className="flex flex-wrap gap-2">
                      {opt.examples.map(ex => (
                        <span key={ex} className={`text-xs px-2.5 py-1 rounded-full font-medium ${dk?"bg-gray-800 text-gray-400":"bg-gray-100 text-gray-600"}`}>{ex}</span>
                      ))}
                    </div>
                  </div>
                  <ChevronRight className={`w-5 h-5 mt-1 flex-shrink-0 ${dk?"text-gray-600":"text-gray-400"}`} />
                </div>
              </button>
            ))}

            {/* Emergency note */}
            <div className="mt-6 p-5 rounded-2xl bg-red-50 border border-red-100">
              <div className="flex gap-3">
                <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="syne font-bold text-red-700 text-sm mb-1">Akut ärende?</div>
                  <p className="text-sm text-red-600">Ring Hussein direkt på <a href={`tel:${PHONE_RAW}`} className="font-bold underline">{PHONE_DISP}</a> för omedelbar hjälp.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 2: Date & Time ── */}
        {step === 2 && (
          <div className="asi">
            <h2 className={`syne text-xl font-bold ${HDR} mb-2`}>Välj datum och tid</h2>
            <p className={`text-sm ${LBL} mb-6`}>{category === "major" ? "Större reparationer" : "Enklare service"} · Max {category === "major" ? MAX_MAJOR : MAX_SMALL} bokningar per dag</p>

            {/* Date picker */}
            <div className={`rounded-2xl border p-5 mb-5 ${CARD}`}>
              <div className={`text-xs font-bold tracking-widest uppercase mb-4 ${dk?"text-gray-500":"text-gray-400"}`}>Välj datum</div>
              <div ref={dateScrollRef} className="flex gap-3 overflow-x-auto pb-2" style={{scrollbarWidth:"none"}}>
                {workDates.map(d => (
                  <button key={d.date}
                    disabled={!d.available}
                    onClick={() => { setSelectedDate(d.date); setSelectedTime(null); }}
                    className={`date-chip text-center min-w-[70px] py-3 px-2 rounded-xl border-2 transition-all ${selectedDate === d.date ? "sel" : !d.available ? "unavail " + (dk?"border-gray-700 text-gray-600":"border-gray-200 text-gray-400") : dk?"border-gray-700 text-gray-300":"border-gray-200 text-gray-700"}`}>
                    <div className="text-xs font-semibold opacity-70">{d.dayName}</div>
                    <div className="text-xl font-black leading-none mt-1">{d.dayNum}</div>
                    <div className="text-xs mt-1">{d.month}</div>
                    {!d.available && <div className="text-[9px] mt-1 text-red-500 font-bold">FULLBOKAD</div>}
                    {d.available && <div className="text-[9px] mt-1 text-emerald-500 font-bold">{d.max-d.booked} kvar</div>}
                  </button>
                ))}
              </div>
            </div>

            {/* Time picker */}
            {selectedDate && (
              <div className={`rounded-2xl border p-5 mb-6 ${CARD}`}>
                <div className={`text-xs font-bold tracking-widest uppercase mb-4 ${dk?"text-gray-500":"text-gray-400"}`}>Välj tid — {fmtDate(selectedDate)}</div>
                <div className="grid grid-cols-4 gap-2.5">
                  {slots.map(s => (
                    <button key={s.time} disabled={s.taken}
                      onClick={() => setSelectedTime(s.time)}
                      className={`slot-btn border-2 rounded-xl py-3 text-sm font-bold transition-all ${selectedTime === s.time ? "selected" : s.taken ? dk?"bg-gray-800 border-gray-700 text-gray-600":"bg-gray-100 border-gray-200 text-gray-400" : dk?"bg-gray-800 border-gray-700 text-gray-300":"bg-white border-gray-200 text-gray-700"}`}>
                      {s.time}
                      {s.taken && <div className="text-[9px] font-medium opacity-60">Bokad</div>}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button disabled={!selectedDate || !selectedTime}
              onClick={() => setStep(3)}
              className={`w-full py-4 rounded-2xl font-bold text-base transition-all ${selectedDate && selectedTime ? "btn-cta text-white" : "bg-gray-200 text-gray-400 cursor-not-allowed"}`}>
              {selectedDate && selectedTime ? `Fortsätt → ${selectedTime} den ${fmtDateShort(selectedDate)}` : "Välj datum och tid för att fortsätta"}
            </button>
          </div>
        )}

        {/* ── STEP 3: Details ── */}
        {step === 3 && (
          <div className="asi">
            <h2 className={`syne text-xl font-bold ${HDR} mb-6`}>Dina uppgifter & bilinfo</h2>

            <div className={`rounded-2xl border p-5 mb-5 ${CARD}`}>
              <div className={`text-xs font-bold tracking-widest uppercase mb-4 ${dk?"text-gray-500":"text-gray-400"}`}>Din bokning</div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className={`p-3 rounded-xl ${dk?"bg-gray-800":"bg-gray-50"}`}>
                  <div className={`text-xs ${LBL} mb-1`}>Typ</div>
                  <div className={`font-semibold ${HDR}`}>{category === "major" ? "Större reparation" : "Enklare service"}</div>
                </div>
                <div className={`p-3 rounded-xl ${dk?"bg-gray-800":"bg-gray-50"}`}>
                  <div className={`text-xs ${LBL} mb-1`}>Tid</div>
                  <div className={`font-semibold ${HDR}`}>{selectedTime}, {fmtDateShort(selectedDate)}</div>
                </div>
              </div>
            </div>

            <div className={`rounded-2xl border p-6 mb-5 space-y-4 ${CARD}`}>
              <div className={`text-xs font-bold tracking-widest uppercase mb-2 ${dk?"text-gray-500":"text-gray-400"}`}>Kontaktuppgifter</div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-xs font-semibold mb-1.5 ${LBL}`}>Fullständigt namn *</label>
                  <input className={INP} placeholder="Anna Svensson"
                    value={formData.name} onChange={e => setFormData({...formData, name:e.target.value})} />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>
                <div>
                  <label className={`block text-xs font-semibold mb-1.5 ${LBL}`}>Telefonnummer *</label>
                  <input className={INP} placeholder="070-123 45 67" type="tel"
                    value={formData.phone} onChange={e => setFormData({...formData, phone:e.target.value})} />
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                </div>
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1.5 ${LBL}`}>E-postadress</label>
                <input className={INP} placeholder="anna@exempel.se" type="email"
                  value={formData.email} onChange={e => setFormData({...formData, email:e.target.value})} />
              </div>

              <div className={`text-xs font-bold tracking-widest uppercase pt-2 pb-1 ${dk?"text-gray-500":"text-gray-400"}`}>Biluppgifter</div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-xs font-semibold mb-1.5 ${LBL}`}>Registreringsnummer *</label>
                  <input className={`${INP} uppercase`} placeholder="ABC 123"
                    value={formData.regNumber} onChange={e => setFormData({...formData, regNumber:e.target.value.toUpperCase()})} />
                  {errors.regNumber && <p className="text-red-500 text-xs mt-1">{errors.regNumber}</p>}
                </div>
                <div>
                  <label className={`block text-xs font-semibold mb-1.5 ${LBL}`}>Bilmärke & modell</label>
                  <input className={INP} placeholder="Volvo V70 2019"
                    value={formData.carModel} onChange={e => setFormData({...formData, carModel:e.target.value})} />
                </div>
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1.5 ${LBL}`}>Typ av service *</label>
                <select className={INP} value={formData.serviceType} onChange={e => setFormData({...formData, serviceType:e.target.value})}>
                  <option value="">Välj servicetyp...</option>
                  {services.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                {errors.serviceType && <p className="text-red-500 text-xs mt-1">{errors.serviceType}</p>}
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1.5 ${LBL}`}>Beskriv problemet *</label>
                <textarea className={`${INP} resize-none`} rows={4}
                  placeholder="Beskriv vad du hör, känner eller upplever med bilen. Du behöver inte ha tekniska kunskaper — beskriv bara problemet med dina egna ord."
                  value={formData.description} onChange={e => setFormData({...formData, description:e.target.value})} />
                {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
              </div>

              {/* Image upload */}
              <div>
                <label className={`block text-xs font-semibold mb-2 ${LBL}`}>Bifoga bilder (valfritt)</label>
                <label className={`flex flex-col items-center justify-center gap-2 py-6 px-4 rounded-xl border-2 border-dashed cursor-pointer transition-colors ${dk?"border-gray-700 hover:border-orange-500/60":"border-gray-200 hover:border-orange-400/60"}`}>
                  <Camera className={`w-8 h-8 ${dk?"text-gray-600":"text-gray-400"}`} />
                  <span className={`text-sm font-medium ${LBL}`}>Klicka för att ladda upp bilder</span>
                  <span className={`text-xs ${dk?"text-gray-600":"text-gray-400"}`}>JPG, PNG, HEIC — max 10 MB</span>
                  <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
                {images.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {images.map((img, i) => (
                      <div key={i} className="relative">
                        <img src={img.url} alt="" className="w-16 h-16 object-cover rounded-lg border border-gray-200" />
                        <button onClick={() => setImages(images.filter((_,j) => j !== i))}
                          className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* GDPR */}
              <p className={`text-xs ${dk?"text-gray-600":"text-gray-400"} leading-relaxed`}>
                Dina uppgifter behandlas säkert och används enbart för att hantera din bokning, i enlighet med GDPR.
              </p>
            </div>

            <button onClick={handleSubmit} disabled={submitting}
              className={`w-full py-4 rounded-2xl font-bold text-base transition-all flex items-center justify-center gap-2 ${submitting ? "bg-orange-400 cursor-not-allowed" : "btn-cta"} text-white`}>
              {submitting ? (<><RefreshCw className="w-5 h-5 animate-spin" /> Skickar bokning...</>) : (<><CheckCircle className="w-5 h-5" /> Bekräfta bokning</>)}
            </button>
          </div>
        )}

        {/* ── STEP 4: Success ── */}
        {step === 4 && booking && (
          <div className="asi text-center">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h2 className={`syne text-3xl font-extrabold ${HDR} mb-3`}>Bokning skickad!</h2>
            <p className={`${LBL} mb-8 max-w-md mx-auto leading-relaxed`}>
              Tack {booking.name.split(" ")[0]}! Din bokningsförfrågan har tagits emot. Vi kontaktar dig inom kort för bekräftelse.
            </p>

            <div className={`rounded-2xl border p-6 mb-6 text-left ${CARD}`}>
              <div className={`text-xs font-bold tracking-widest uppercase mb-4 ${dk?"text-gray-500":"text-gray-400"}`}>Bokningsdetaljer</div>
              <div className="space-y-3">
                {[
                  ["Boknings-ID", booking.id],
                  ["Datum & tid", `${fmtDate(booking.date)} kl. ${booking.time}`],
                  ["Tjänst", booking.serviceType],
                  ["Fordon", booking.carModel || booking.regNumber],
                  ["Status", "Väntar på bekräftelse"]
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between items-start gap-4">
                    <span className={`text-sm ${LBL}`}>{k}</span>
                    <span className={`text-sm font-semibold ${HDR} text-right`}>{v}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className={`rounded-2xl p-5 mb-6 text-left ${dk?"bg-blue-950/40 border border-blue-900":"bg-blue-50 border border-blue-100"}`}>
              <div className="flex gap-3">
                <Bell className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="syne font-bold text-blue-700 text-sm mb-1">Vad händer härnäst?</div>
                  <p className="text-sm text-blue-600 leading-relaxed">Vi kontaktar dig på <span className="font-bold">{booking.phone}</span> inom 2 timmar för att bekräfta din bokning. Har du akuta frågor? Ring Hussein på <a href={`tel:${PHONE_RAW}`} className="font-bold underline">{PHONE_DISP}</a>.</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button onClick={() => setPage("home")} className={`flex-1 py-3.5 rounded-2xl font-semibold border-2 transition-all ${dk?"border-gray-700 text-gray-300 hover:border-orange-500":"border-gray-200 text-gray-700 hover:border-orange-400"}`}>
                Tillbaka till startsidan
              </button>
              <a href={`tel:${PHONE_RAW}`} className="flex-1 btn-cta text-white font-semibold py-3.5 rounded-2xl flex items-center justify-center gap-2">
                <Phone className="w-4 h-4" /> Ring oss
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// ADMIN LOGIN
// ═══════════════════════════════════════════════════════════════
function AdminLoginPage({ onLogin, setPage, darkMode }) {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const dk = darkMode;

  const handleLogin = () => {
    if (!user || !pass) { setErr("Fyll i användarnamn och lösenord."); return; }
    setLoading(true);
    setTimeout(() => {
      if (user === ADMIN_USER && pass === ADMIN_PASS) { onLogin(); }
      else { setErr("Fel användarnamn eller lösenord."); setLoading(false); }
    }, 800);
  };

  const INP = `w-full px-4 py-3 rounded-xl border text-sm transition-colors ${dk?"bg-gray-800 border-gray-700 text-white placeholder-gray-500":"bg-white border-gray-200 text-gray-900 placeholder-gray-400"}`;

  return (
    <div className={`min-h-screen flex items-center justify-center px-4 ${dk?"bg-gray-950":"bg-stone-100"}`}>
      <div className={`w-full max-w-sm rounded-3xl border shadow-2xl overflow-hidden ${dk?"bg-gray-900 border-gray-800":"bg-white border-gray-100"}`}>
        <div className="hero-bg p-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center mx-auto mb-4">
            <Wrench className="w-7 h-7 text-white" />
          </div>
          <div className="syne text-white font-bold text-xl">Kom In Bilservice</div>
          <div className="text-orange-300 text-xs font-semibold tracking-widest uppercase mt-1">Admin-portal</div>
        </div>
        <div className="p-8 space-y-4">
          <div>
            <label className={`block text-xs font-semibold mb-1.5 ${dk?"text-gray-400":"text-gray-600"}`}>Användarnamn</label>
            <input className={INP} placeholder="admin" value={user} onChange={e => setUser(e.target.value)} onKeyDown={e => e.key==="Enter" && handleLogin()} />
          </div>
          <div>
            <label className={`block text-xs font-semibold mb-1.5 ${dk?"text-gray-400":"text-gray-600"}`}>Lösenord</label>
            <input className={INP} placeholder="••••••••" type="password" value={pass} onChange={e => setPass(e.target.value)} onKeyDown={e => e.key==="Enter" && handleLogin()} />
          </div>
          {err && <p className="text-red-500 text-xs flex items-center gap-1.5"><AlertCircle className="w-4 h-4" />{err}</p>}
          <button onClick={handleLogin} disabled={loading}
            className="w-full btn-cta text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2">
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
            {loading ? "Loggar in..." : "Logga in"}
          </button>
          <button onClick={() => setPage("home")} className={`w-full text-sm text-center py-2 transition-colors ${dk?"text-gray-500 hover:text-gray-300":"text-gray-400 hover:text-gray-600"}`}>
            ← Tillbaka till webbplatsen
          </button>
          <p className={`text-xs text-center ${dk?"text-gray-700":"text-gray-400"}`}>Demo: admin / Hussein2024</p>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// BOOKING MODAL (Admin)
// ═══════════════════════════════════════════════════════════════
function BookingModal({ booking, onClose, onUpdate, darkMode }) {
  const [b, setB] = useState({...booking});
  const dk = darkMode;
  const CARD = dk ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200";
  const HDR = dk ? "text-white" : "text-gray-900";
  const LBL = dk ? "text-gray-400" : "text-gray-500";
  const INP = `w-full px-3 py-2.5 rounded-xl border text-sm ${dk?"bg-gray-800 border-gray-700 text-white placeholder-gray-500":"bg-white border-gray-200 text-gray-900"}`;

  const save = () => { onUpdate(b); onClose(); };

  return (
    <div className="modal-back fixed inset-0 z-[100] flex items-start justify-center p-4 pt-10 pb-10 overflow-y-auto" style={{background:"rgba(0,0,0,.6)"}}>
      <div className={`modal-box w-full max-w-2xl rounded-3xl border shadow-2xl ${dk?"bg-gray-900 border-gray-700":"bg-white border-gray-100"}`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b ${dk?"border-gray-800":"border-gray-100"}`}>
          <div>
            <div className="syne font-bold text-lg text-gray-100 dark:text-white" style={{color: dk?"white":"#111827"}}>{b.name}</div>
            <div className={`text-sm ${LBL} mt-0.5`}>{b.id} · {b.regNumber} · {b.carModel}</div>
          </div>
          <button onClick={onClose} className={`p-2 rounded-xl ${dk?"bg-gray-800 text-gray-400 hover:bg-gray-700":"bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Status & category */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${LBL}`}>Status</label>
              <select className={INP} value={b.status} onChange={e => setB({...b, status:e.target.value})}>
                {Object.entries(STATUS_CFG).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${LBL}`}>Uppskattad tid (h)</label>
              <input type="number" min="0.5" step="0.5" className={INP} value={b.estimatedHours || ""} onChange={e => setB({...b, estimatedHours: parseFloat(e.target.value)})} />
            </div>
          </div>

          {/* Info grid */}
          <div className={`rounded-2xl border p-4 grid grid-cols-2 gap-3 text-sm ${CARD}`}>
            {[
              ["Datum",  fmtDate(b.date)],
              ["Tid",    b.time],
              ["Telefon",b.phone],
              ["E-post", b.email],
              ["Tjänst", b.serviceType],
              ["Typ",    b.category === "major" ? "Större reparation" : "Enklare service"],
            ].map(([k,v]) => (
              <div key={k}>
                <div className={`text-xs ${LBL} mb-0.5`}>{k}</div>
                <div className={`font-semibold ${HDR}`}>{v || "—"}</div>
              </div>
            ))}
          </div>

          {/* Description */}
          <div>
            <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${LBL}`}>Kundens beskrivning</label>
            <div className={`p-4 rounded-xl border text-sm leading-relaxed italic ${dk?"bg-gray-800 border-gray-700 text-gray-300":"bg-gray-50 border-gray-200 text-gray-700"}`}>
              "{b.description}"
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${LBL}`}>Interna anteckningar</label>
            <textarea className={`${INP} resize-none`} rows={3} placeholder="Lägg till interna anteckningar om jobbet..."
              value={b.notes} onChange={e => setB({...b, notes:e.target.value})} />
          </div>

          {/* Estimated completion */}
          <div>
            <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${LBL}`}>Beräknat klardatum</label>
            <input type="date" className={INP} value={b.estimatedCompletion || ""} onChange={e => setB({...b, estimatedCompletion:e.target.value})} />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <a href={`tel:${b.phone.replace(/\s|-/g,"")}`} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 text-sm font-semibold transition-all ${dk?"border-gray-700 text-gray-300 hover:border-orange-500":"border-gray-200 text-gray-700 hover:border-orange-400"}`}>
              <Phone className="w-4 h-4 text-orange-500" /> Ring kund
            </a>
            <button onClick={save} className="flex-2 flex-1 btn-cta text-white font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-2">
              <Check className="w-4 h-4" /> Spara ändringar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// ADMIN DASHBOARD
// ═══════════════════════════════════════════════════════════════
function AdminDashboard({ bookings, updateBooking, deleteBooking, onLogout, setPage, darkMode }) {
  const [view, setView] = useState("overview");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [catFilter, setCatFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [selected, setSelected] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const dk = darkMode;

  const today = new Date().toISOString().split("T")[0];

  // Computed stats
  const todayMajor = bookings.filter(b => b.date === today && b.category === "major").length;
  const todaySmall = bookings.filter(b => b.date === today && b.category === "small").length;
  const totalActive = bookings.filter(b => !["pickedup","finished"].includes(b.status)).length;
  const inProgress = bookings.filter(b => b.status === "inprogress").length;
  const waitingParts = bookings.filter(b => b.status === "waitingparts").length;
  const done = bookings.filter(b => b.status === "finished").length;

  // Filtered + sorted bookings
  const filtered = bookings.filter(b => {
    const s = search.toLowerCase();
    if (s && !b.name.toLowerCase().includes(s) && !b.regNumber.toLowerCase().includes(s) && !b.phone.includes(s)) return false;
    if (statusFilter !== "all" && b.status !== statusFilter) return false;
    if (catFilter !== "all" && b.category !== catFilter) return false;
    return true;
  }).sort((a, b) => {
    if (sortBy === "date") return a.date.localeCompare(b.date) || a.time.localeCompare(b.time);
    if (sortBy === "name") return a.name.localeCompare(b.name);
    if (sortBy === "status") return a.status.localeCompare(b.status);
    return 0;
  });

  const BG = dk ? "bg-gray-950" : "bg-slate-100";
  const SBG = dk ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200";
  const CARD = dk ? "bg-gray-900 border-gray-800" : "bg-white border-gray-100";
  const HDR = dk ? "text-white" : "text-gray-900";
  const LBL = dk ? "text-gray-400" : "text-gray-500";
  const INP = `px-3 py-2.5 rounded-xl border text-sm ${dk?"bg-gray-800 border-gray-700 text-white placeholder-gray-500":"bg-white border-gray-200 text-gray-900"}`;

  const navItems = [
    { id:"overview", icon:<BarChart2 className="w-5 h-5" />, label:"Översikt" },
    { id:"bookings", icon:<FileText className="w-5 h-5" />, label:"Bokningar" },
    { id:"calendar", icon:<Calendar className="w-5 h-5" />, label:"Kalender" },
  ];

  // Calendar view helpers
  const calDates = Array.from(new Set(bookings.map(b => b.date))).sort();

  return (
    <div className={`min-h-screen flex ${BG}`}>
      {/* ── SIDEBAR ── */}
      <aside className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 fixed md:relative z-40 flex flex-col w-64 border-r transition-transform duration-300 ${SBG} min-h-screen`}>
        {/* Logo */}
        <div className="p-6 border-b border-gray-800/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
              <Wrench className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className={`syne font-bold text-sm ${HDR}`}>Kom In</div>
              <div className="text-[10px] text-orange-500 font-bold tracking-widest uppercase">Admin</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(item => (
            <button key={item.id} onClick={() => { setView(item.id); setSidebarOpen(false); }}
              className={`admin-sidebar-item w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${view === item.id ? "active" : dk?"text-gray-400 hover:text-white":"text-gray-600 hover:text-gray-900"}`}>
              {item.icon} {item.label}
              {item.id === "bookings" && totalActive > 0 && (
                <span className="ml-auto bg-orange-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">{totalActive}</span>
              )}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className={`p-4 border-t ${dk?"border-gray-800":"border-gray-100"}`}>
          <button onClick={() => setPage("home")} className={`w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm ${LBL} hover:text-orange-500 transition-colors mb-1`}>
            <ArrowRight className="w-4 h-4" /> Till webbplatsen
          </button>
          <button onClick={onLogout} className={`w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm ${LBL} hover:text-red-400 transition-colors`}>
            <LogOut className="w-4 h-4" /> Logga ut
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className={`flex items-center justify-between px-4 sm:px-6 py-4 border-b ${dk?"border-gray-800 bg-gray-900/80":"border-gray-200 bg-white/80"} backdrop-blur-sm sticky top-0 z-30`}>
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="md:hidden p-2 rounded-lg bg-gray-100 text-gray-700">
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className={`syne font-extrabold text-xl ${HDR}`}>
                {view === "overview" ? "Översikt" : view === "bookings" ? "Bokningar" : "Kalender"}
              </h1>
              <p className={`text-xs ${LBL}`}>{new Date().toLocaleDateString("sv-SE",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`hidden sm:flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full ${dk?"bg-gray-800 text-orange-400":"bg-orange-50 text-orange-600"}`}>
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></span>
              Hussein
            </span>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 overflow-auto">

          {/* ── OVERVIEW ── */}
          {view === "overview" && (
            <div className="space-y-6">
              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label:"Idag – Större", value: todayMajor, max: MAX_MAJOR, color:"from-orange-500 to-red-600", icon:<Wrench className="w-5 h-5" /> },
                  { label:"Idag – Service", value: todaySmall, max: MAX_SMALL, color:"from-emerald-500 to-teal-600", icon:<Settings className="w-5 h-5" /> },
                  { label:"Pågående jobb", value: inProgress, color:"from-blue-600 to-blue-800", icon:<Activity className="w-5 h-5" /> },
                  { label:"Väntar på delar", value: waitingParts, color:"from-purple-500 to-purple-700", icon:<Package className="w-5 h-5" /> },
                ].map((s, i) => (
                  <div key={i} className={`rounded-2xl border p-5 ${CARD}`}>
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center text-white mb-4`}>{s.icon}</div>
                    <div className={`syne text-3xl font-black ${HDR}`}>{s.value}{s.max ? <span className={`text-lg font-semibold ${LBL}`}>/{s.max}</span> : ""}</div>
                    <div className={`text-xs font-semibold mt-1 ${LBL}`}>{s.label}</div>
                    {s.max && <div className={`mt-3 h-1.5 rounded-full ${dk?"bg-gray-700":"bg-gray-100"}`}><div className="h-full rounded-full bg-gradient-to-r from-orange-500 to-red-500 transition-all" style={{width:`${(s.value/s.max)*100}%`}} /></div>}
                  </div>
                ))}
              </div>

              {/* Recent bookings */}
              <div className={`rounded-2xl border ${CARD}`}>
                <div className={`flex items-center justify-between p-5 border-b ${dk?"border-gray-800":"border-gray-100"}`}>
                  <h2 className={`syne font-bold text-base ${HDR}`}>Senaste bokningar</h2>
                  <button onClick={() => setView("bookings")} className="text-xs font-semibold text-orange-500 hover:text-orange-600">Visa alla →</button>
                </div>
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                  {bookings.slice(-5).reverse().map(b => (
                    <button key={b.id} onClick={() => setSelected(b)}
                      className={`w-full flex items-center gap-4 px-5 py-4 text-left transition-colors ${dk?"hover:bg-gray-800":"hover:bg-gray-50"}`}>
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${b.category==="major"?"bg-orange-100 text-orange-600":"bg-emerald-100 text-emerald-600"}`}>
                        {b.category === "major" ? <Wrench className="w-5 h-5" /> : <Settings className="w-5 h-5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={`font-semibold text-sm ${HDR} truncate`}>{b.name}</div>
                        <div className={`text-xs ${LBL} mt-0.5`}>{b.regNumber} · {b.serviceType} · {b.time}, {fmtDateShort(b.date)}</div>
                      </div>
                      <StatusBadge status={b.status} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Status breakdown */}
              <div className={`rounded-2xl border p-5 ${CARD}`}>
                <h2 className={`syne font-bold text-base mb-4 ${HDR}`}>Statusöversikt</h2>
                <div className="space-y-3">
                  {Object.entries(STATUS_CFG).map(([k, cfg]) => {
                    const count = bookings.filter(b => b.status === k).length;
                    return (
                      <div key={k} className="flex items-center gap-3">
                        <div className={`w-2.5 h-2.5 rounded-full ${cfg.dot} flex-shrink-0`} />
                        <span className={`text-sm flex-1 ${LBL}`}>{cfg.label}</span>
                        <span className={`syne font-bold text-sm ${HDR}`}>{count}</span>
                        <div className={`w-24 h-1.5 rounded-full ${dk?"bg-gray-700":"bg-gray-100"}`}>
                          <div className={`h-full rounded-full ${cfg.dot}`} style={{width:`${bookings.length > 0 ? (count/bookings.length)*100 : 0}%`, transition:"width .5s"}} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ── BOOKINGS LIST ── */}
          {view === "bookings" && (
            <div className="space-y-4">
              {/* Filters */}
              <div className={`rounded-2xl border p-4 ${CARD}`}>
                <div className="flex flex-wrap gap-3">
                  <div className="relative flex-1 min-w-[180px]">
                    <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${LBL}`} />
                    <input className={`${INP} pl-9 w-full`} placeholder="Sök namn, regnr, telefon..." value={search} onChange={e => setSearch(e.target.value)} />
                  </div>
                  <select className={INP} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                    <option value="all">Alla statusar</option>
                    {Object.entries(STATUS_CFG).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                  <select className={INP} value={catFilter} onChange={e => setCatFilter(e.target.value)}>
                    <option value="all">Alla typer</option>
                    <option value="major">Större reparation</option>
                    <option value="small">Enklare service</option>
                  </select>
                  <select className={INP} value={sortBy} onChange={e => setSortBy(e.target.value)}>
                    <option value="date">Sortera: Datum</option>
                    <option value="name">Sortera: Namn</option>
                    <option value="status">Sortera: Status</option>
                  </select>
                </div>
                <div className={`text-xs ${LBL} mt-3`}>{filtered.length} bokningar visas</div>
              </div>

              {/* List */}
              <div className={`rounded-2xl border overflow-hidden ${CARD}`}>
                {filtered.length === 0 ? (
                  <div className="text-center py-16">
                    <Search className={`w-10 h-10 mx-auto mb-3 ${LBL}`} />
                    <p className={`font-semibold ${HDR}`}>Inga bokningar hittades</p>
                    <p className={`text-sm ${LBL} mt-1`}>Prova att ändra dina filter</p>
                  </div>
                ) : (
                  <div className="divide-y" style={{borderColor: dk?"#1f2937":"#f3f4f6"}}>
                    {/* Header */}
                    <div className={`hidden md:grid grid-cols-[2fr_1fr_1fr_1fr_1fr_80px] gap-4 px-5 py-3 text-xs font-bold uppercase tracking-wider ${LBL} ${dk?"bg-gray-800/50":"bg-gray-50"}`}>
                      <span>Kund / Fordon</span><span>Datum & tid</span><span>Tjänst</span><span>Typ</span><span>Status</span><span></span>
                    </div>
                    {filtered.map(b => (
                      <div key={b.id} className={`grid md:grid-cols-[2fr_1fr_1fr_1fr_1fr_80px] gap-4 px-5 py-4 items-center hover:${dk?"bg-gray-800":"bg-gray-50"} transition-colors`}
                        style={{cursor:"pointer"}} onClick={() => setSelected(b)}>
                        <div>
                          <div className={`font-semibold text-sm ${HDR}`}>{b.name}</div>
                          <div className={`text-xs ${LBL} mt-0.5`}>{b.regNumber} · {b.carModel}</div>
                          <div className={`text-xs font-mono ${LBL}`}>{b.id}</div>
                        </div>
                        <div>
                          <div className={`text-sm font-semibold ${HDR}`}>{b.time}</div>
                          <div className={`text-xs ${LBL}`}>{fmtDateShort(b.date)}</div>
                        </div>
                        <div className={`text-sm ${LBL} hidden md:block truncate`}>{b.serviceType}</div>
                        <div className="hidden md:block">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${b.category==="major"?"bg-orange-100 text-orange-600":"bg-emerald-100 text-emerald-700"}`}>
                            {b.category==="major"?"Större":"Service"}
                          </span>
                        </div>
                        <div><StatusBadge status={b.status} /></div>
                        <div className="flex items-center gap-1 justify-end">
                          <button onClick={e => {e.stopPropagation();setSelected(b);}} className={`p-2 rounded-lg ${dk?"hover:bg-gray-700 text-gray-400":"hover:bg-gray-100 text-gray-500"} transition-colors`}>
                            <Edit className="w-4 h-4" />
                          </button>
                          <button onClick={e => {e.stopPropagation(); if(window.confirm("Ta bort bokning?")) deleteBooking(b.id);}}
                            className={`p-2 rounded-lg ${dk?"hover:bg-red-900/40 text-gray-400 hover:text-red-400":"hover:bg-red-50 text-gray-400 hover:text-red-500"} transition-colors`}>
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── CALENDAR ── */}
          {view === "calendar" && (
            <div className="space-y-4">
              <div className={`rounded-2xl border p-5 ${CARD}`}>
                <h2 className={`syne font-bold text-lg ${HDR} mb-5`}>Kalenderöversikt</h2>
                {calDates.length === 0 ? (
                  <p className={`text-sm ${LBL}`}>Inga bokningar.</p>
                ) : (
                  <div className="space-y-4">
                    {calDates.map(date => {
                      const dayBks = bookings.filter(b => b.date === date).sort((a,b) => a.time.localeCompare(b.time));
                      const isToday = date === today;
                      return (
                        <div key={date} className={`rounded-2xl border overflow-hidden ${isToday ? "border-orange-400" : dk?"border-gray-700":"border-gray-100"}`}>
                          <div className={`px-5 py-3 flex items-center gap-3 ${isToday ? "bg-gradient-to-r from-orange-500 to-red-600" : dk?"bg-gray-800":"bg-gray-50"}`}>
                            <div>
                              <div className={`syne font-bold text-sm ${isToday?"text-white":HDR}`}>{fmtDate(date)}</div>
                              {isToday && <span className="text-xs text-orange-100 font-semibold">IDAG</span>}
                            </div>
                            <div className="ml-auto flex items-center gap-2">
                              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${isToday?"bg-white/20 text-white":"bg-orange-100 text-orange-700"}`}>
                                {dayBks.filter(b=>b.category==="major").length}/{MAX_MAJOR} stora
                              </span>
                              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${isToday?"bg-white/20 text-white":"bg-emerald-100 text-emerald-700"}`}>
                                {dayBks.filter(b=>b.category==="small").length}/{MAX_SMALL} service
                              </span>
                            </div>
                          </div>
                          <div className="divide-y" style={{borderColor:dk?"#1f2937":"#f3f4f6"}}>
                            {dayBks.map(b => (
                              <button key={b.id} onClick={() => setSelected(b)}
                                className={`w-full flex items-center gap-4 px-5 py-3.5 text-left transition-colors ${dk?"hover:bg-gray-800":"hover:bg-gray-50"}`}>
                                <div className={`syne font-black text-sm w-12 flex-shrink-0 ${dk?"text-gray-400":"text-gray-500"}`}>{b.time}</div>
                                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${b.category==="major"?"bg-orange-500":"bg-emerald-500"}`}></div>
                                <div className="flex-1 min-w-0">
                                  <div className={`font-semibold text-sm ${HDR} truncate`}>{b.name}</div>
                                  <div className={`text-xs ${LBL} truncate`}>{b.serviceType} · {b.regNumber}</div>
                                </div>
                                <StatusBadge status={b.status} />
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Sidebar backdrop on mobile */}
      {sidebarOpen && <div className="md:hidden fixed inset-0 z-30 bg-black/50" onClick={() => setSidebarOpen(false)} />}

      {/* Booking modal */}
      {selected && (
        <BookingModal
          booking={selected}
          onClose={() => setSelected(null)}
          onUpdate={(updated) => { updateBooking(updated); setSelected(null); }}
          darkMode={dk}
        />
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// APP
// ═══════════════════════════════════════════════════════════════
export default function App() {
  const [page, setPage] = useState("home");
  const [darkMode, setDarkMode] = useState(false);
  const [bookings, setBookings] = useState(() => loadBookings());
  const [adminAuth, setAdminAuth] = useState(false);

  useEffect(() => { saveBookings(bookings); }, [bookings]);

  const addBooking = (b) => setBookings(prev => [...prev, b]);
  const updateBooking = (updated) => setBookings(prev => prev.map(b => b.id === updated.id ? updated : b));
  const deleteBooking = (id) => setBookings(prev => prev.filter(b => b.id !== id));
  const toggleDark = () => setDarkMode(d => !d);

  const handleLogout = () => { setAdminAuth(false); setPage("home"); };

  return (
    <>
      <GlobalStyles />
      <div style={{fontFamily:"'DM Sans', sans-serif"}} className={darkMode ? "dark" : ""}>
        {page !== "admin" && (
          <Navbar page={page} setPage={setPage} darkMode={darkMode} toggleDark={toggleDark} />
        )}

        {page === "home" && <HomePage setPage={setPage} darkMode={darkMode} />}

        {page === "booking" && (
          <BookingPage
            bookings={bookings}
            addBooking={addBooking}
            setPage={setPage}
            darkMode={darkMode}
          />
        )}

        {page === "admin-login" && (
          <AdminLoginPage
            onLogin={() => { setAdminAuth(true); setPage("admin"); }}
            setPage={setPage}
            darkMode={darkMode}
          />
        )}

        {page === "admin" && adminAuth && (
          <AdminDashboard
            bookings={bookings}
            updateBooking={updateBooking}
            deleteBooking={deleteBooking}
            onLogout={handleLogout}
            setPage={setPage}
            darkMode={darkMode}
          />
        )}

        {page === "admin" && !adminAuth && (
          <AdminLoginPage
            onLogin={() => { setAdminAuth(true); setPage("admin"); }}
            setPage={setPage}
            darkMode={darkMode}
          />
        )}
      </div>
    </>
  );
}