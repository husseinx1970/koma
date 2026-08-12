import { useState, useEffect, useRef, useCallback } from “react”;
import * as THREE from “three”;
import {
Phone, Calendar, ChevronDown, X, Menu, Check, ArrowRight, Shield,
Star, Zap, Package, Settings, Activity, RefreshCw, CheckCircle,
AlertTriangle, LogOut, FileText, Trash2, Search, Edit, BarChart2,
MapPin, Clock, User, Camera, Bell, ChevronRight, ChevronLeft, Plus, Wrench
} from “lucide-react”;

// ═══════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════
const PHONE_RAW  = “0704002413”;
const PHONE_DISP = “070-400 24 13”;
const MAX_MAJOR  = 5;
const MAX_SMALL  = 10;
const ADMIN_PASS = “Mohammad1962”;
const TIME_SLOTS = [“08:00”,“09:00”,“10:00”,“11:00”,“13:00”,“14:00”,“15:00”,“16:00”];
const WDAYS      = [“Sön”,“Mån”,“Tis”,“Ons”,“Tor”,“Fre”,“Lör”];

const STATUS_CFG = {
waiting:      { label:“Väntar”,           bg:“rgba(234,179,8,.12)”,   text:”#fbbf24”, border:“rgba(234,179,8,.25)”   },
confirmed:    { label:“Bekräftad”,        bg:“rgba(59,130,246,.12)”,  text:”#60a5fa”, border:“rgba(59,130,246,.25)”  },
inprogress:   { label:“Pågår”,            bg:“rgba(232,93,32,.15)”,   text:”#fb923c”, border:“rgba(232,93,32,.3)”    },
waitingparts: { label:“Väntar på delar”,  bg:“rgba(139,92,246,.12)”,  text:”#a78bfa”, border:“rgba(139,92,246,.25)”  },
finished:     { label:“Klar”,             bg:“rgba(34,197,94,.12)”,   text:”#4ade80”, border:“rgba(34,197,94,.25)”   },
pickedup:     { label:“Upphämtad”,        bg:“rgba(107,114,128,.12)”, text:”#9ca3af”, border:“rgba(107,114,128,.2)”  },
};

const SEED = [
{ id:“BK-001”, category:“major”, date:“2026-05-12”, time:“09:00”, name:“Erik Johansson”,   phone:“070-123 45 67”, email:“erik.j@gmail.com”,    regNumber:“ABC123”, carModel:“Volvo V70 2018”,     description:“Motorn startar inte. Hör ett klickande ljud vid start.”,       status:“confirmed”,    notes:“Troligtvis startmotorn.”,               estimatedHours:3, estimatedCompletion:“2026-05-12”, createdAt:“2026-05-10T07:30:00”, serviceType:“Motorproblem” },
{ id:“BK-002”, category:“small”, date:“2026-05-12”, time:“10:00”, name:“Ingrid Lindqvist”, phone:“073-456 78 90”, email:“ingrid.l@hotmail.com”, regNumber:“XYZ789”, carModel:“Toyota Corolla 2020”, description:“Oljebyte, 15 000 km sedan sist.”,                               status:“waiting”,      notes:””,                                      estimatedHours:1, estimatedCompletion:“2026-05-12”, createdAt:“2026-05-10T09:15:00”, serviceType:“Oljebyte / Service” },
{ id:“BK-003”, category:“major”, date:“2026-05-13”, time:“08:00”, name:“Anders Bergström”, phone:“076-234 56 78”, email:“anders.b@outlook.com”, regNumber:“DEF456”, carModel:“BMW 3-serie 2019”,     description:“Kamremmen behöver bytas. Bilen har gått 180 000 km.”,          status:“inprogress”,   notes:“Kamremssats beställd. Klar imorgon em.”, estimatedHours:6, estimatedCompletion:“2026-05-14”, createdAt:“2026-05-09T14:00:00”, serviceType:“Kamremsbyte” },
{ id:“BK-004”, category:“small”, date:“2026-05-13”, time:“11:00”, name:“Sara Nilsson”,     phone:“072-345 67 89”, email:“sara.n@yahoo.com”,     regNumber:“GHI012”, carModel:“Volkswagen Golf 2021”, description:“Bromsbeläggen gnisslar vid inbromsning framtill.”,              status:“confirmed”,    notes:””,                                      estimatedHours:2, estimatedCompletion:“2026-05-13”, createdAt:“2026-05-10T10:00:00”, serviceType:“Bromsbelägg” },
{ id:“BK-005”, category:“small”, date:“2026-05-14”, time:“14:00”, name:“Lars Persson”,     phone:“070-567 89 01”, email:“lars.p@gmail.com”,     regNumber:“JKL345”, carModel:“Skoda Octavia 2017”,  description:“Behöver fylla på AC-gas inför sommaren.”,                       status:“waiting”,      notes:””,                                      estimatedHours:1, estimatedCompletion:“2026-05-14”, createdAt:“2026-05-10T11:30:00”, serviceType:“AC-påfyllning” },
{ id:“BK-006”, category:“major”, date:“2026-05-14”, time:“13:00”, name:“Maria Svensson”,   phone:“076-789 01 23”, email:“maria.s@gmail.com”,    regNumber:“MNO678”, carModel:“Audi A4 2020”,         description:“Turbon låter konstigt vid acceleration.”,                       status:“waitingparts”, notes:“Turboaggregat beställt.”,               estimatedHours:5, estimatedCompletion:“2026-05-16”, createdAt:“2026-05-09T16:00:00”, serviceType:“Turbobyte” },
{ id:“BK-007”, category:“small”, date:“2026-05-11”, time:“09:00”, name:“Johan Karlsson”,   phone:“073-321 09 87”, email:“johan.k@hotmail.com”,  regNumber:“PQR901”, carModel:“Ford Focus 2016”,      description:“Sommardäck ska monteras.”,                                      status:“finished”,     notes:“Klart! Mönsterdjup 6mm.”,               estimatedHours:1, estimatedCompletion:“2026-05-11”, createdAt:“2026-05-08T10:00:00”, serviceType:“Däckbyte” },
];

const genId = () => “BK-” + Math.random().toString(36).slice(2,8).toUpperCase();
const TODAY = new Date().toISOString().split(“T”)[0];

function fmtDate(d) {
if (!d) return “”;
return new Date(d).toLocaleDateString(“sv-SE”,{weekday:“long”,year:“numeric”,month:“long”,day:“numeric”});
}
function fmtShort(d) {
if (!d) return “”;
return new Date(d).toLocaleDateString(“sv-SE”,{day:“numeric”,month:“short”});
}
function loadBks() {
try { const s = localStorage.getItem(“komIn_v4”); return s ? JSON.parse(s) : SEED; } catch { return SEED; }
}
function saveBks(b) {
try { localStorage.setItem(“komIn_v4”, JSON.stringify(b)); } catch {}
}
function getWorkDates(bookings, category, count = 32) {
const res = [], today = new Date();
today.setHours(0,0,0,0);
const max = category === “major” ? MAX_MAJOR : MAX_SMALL;
let n = 0;
while (res.length < count && n < 90) {
n++;
const d = new Date(today);
d.setDate(today.getDate() + n);
const dow = d.getDay();
if (dow === 0 || dow === 6) continue;
const ds = d.toISOString().split(“T”)[0];
const booked = bookings.filter(b => b.date === ds && b.category === category).length;
res.push({ date:ds, booked, max, available:booked < max, dayName:WDAYS[dow], dayNum:d.getDate(), month:d.toLocaleDateString(“sv-SE”,{month:“short”}) });
}
return res;
}
function getSlots(bookings, date) {
const taken = bookings.filter(b => b.date === date).map(b => b.time);
return TIME_SLOTS.map(t => ({ time:t, taken:taken.includes(t) }));
}

// ═══════════════════════════════════════════════════════════
// GLOBAL STYLES
// ═══════════════════════════════════════════════════════════
function GlobalStyles() {
return (
<style>{`
@import url(‘https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@0,400;0,600;0,700;0,800;0,900;1,700;1,800;1,900&family=DM+Sans:wght@300;400;500;600&display=swap’);
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}
body{font-family:‘DM Sans’,sans-serif;background:#05070a;color:#dde0e8;overflow-x:hidden;cursor:none}
@media(max-width:768px){body{cursor:auto}}

```
  /* ── CUSTOM CURSOR ── */
  .cursor-dot{position:fixed;z-index:9999;pointer-events:none;width:8px;height:8px;background:#e85d20;border-radius:50%;transform:translate(-50%,-50%);transition:transform .1s,opacity .2s;mix-blend-mode:normal}
  .cursor-ring{position:fixed;z-index:9998;pointer-events:none;width:36px;height:36px;border:1px solid rgba(232,93,32,.5);border-radius:50%;transform:translate(-50%,-50%);transition:transform .18s cubic-bezier(.23,1,.32,1),width .3s,height .3s,border-color .3s}
  .cursor-ring.hovered{width:56px;height:56px;border-color:rgba(232,93,32,.9)}
  @media(max-width:768px){.cursor-dot,.cursor-ring{display:none}}

  /* ── FONTS ── */
  .barlow{font-family:'Barlow Condensed',sans-serif!important}
  .barlow-italic{font-family:'Barlow Condensed',sans-serif!important;font-style:italic!important}

  /* ── SMOKE ── */
  @keyframes smoke{
    0%{transform:translate(0,0) scale(1);opacity:.06}
    25%{transform:translate(80px,-60px) scale(1.4);opacity:.1}
    50%{transform:translate(150px,-130px) scale(2);opacity:.05}
    75%{transform:translate(60px,-200px) scale(2.5);opacity:.03}
    100%{transform:translate(0,-260px) scale(3);opacity:0}
  }
  @keyframes smokeFade{
    0%,100%{opacity:0}50%{opacity:1}
  }

  /* ── MARQUEE ── */
  @keyframes marquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}
  .mq-inner{animation:marquee 30s linear infinite;display:flex;width:max-content;will-change:transform}

  /* ── SCROLL REVEAL ── */
  .sr{opacity:0;transform:translateY(50px);transition:opacity .9s cubic-bezier(.23,1,.32,1),transform .9s cubic-bezier(.23,1,.32,1)}
  .sr.in{opacity:1;transform:translateY(0)}
  .sr-l{opacity:0;transform:translateX(-50px);transition:opacity .9s cubic-bezier(.23,1,.32,1),transform .9s cubic-bezier(.23,1,.32,1)}
  .sr-l.in{opacity:1;transform:translateX(0)}
  .sr-r{opacity:0;transform:translateX(50px);transition:opacity .9s cubic-bezier(.23,1,.32,1),transform .9s cubic-bezier(.23,1,.32,1)}
  .sr-r.in{opacity:1;transform:translateX(0)}

  /* ── BUTTONS ── */
  .btn-fire{background:linear-gradient(135deg,#e85d20 0%,#c8952a 100%);color:#fff;font-family:'Barlow Condensed',sans-serif;font-weight:700;letter-spacing:.08em;text-transform:uppercase;border:none;cursor:pointer;position:relative;overflow:hidden;transition:box-shadow .3s,transform .2s}
  .btn-fire::after{content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(255,255,255,.15),transparent);opacity:0;transition:opacity .3s}
  .btn-fire:hover::after{opacity:1}
  .btn-fire:hover{box-shadow:0 0 40px rgba(232,93,32,.5),0 0 80px rgba(232,93,32,.2);transform:translateY(-2px)}
  .btn-ghost{background:transparent;border:1px solid rgba(232,93,32,.35);color:#e2e4e8;font-family:'Barlow Condensed',sans-serif;font-weight:600;letter-spacing:.06em;text-transform:uppercase;cursor:pointer;backdrop-filter:blur(10px);transition:all .3s}
  .btn-ghost:hover{border-color:#e85d20;background:rgba(232,93,32,.08);box-shadow:0 0 24px rgba(232,93,32,.15)}

  /* ── CARDS ── */
  .metal-card{background:linear-gradient(145deg,rgba(20,22,28,.9) 0%,rgba(12,14,18,.95) 100%);border:1px solid rgba(255,255,255,.07);transition:border-color .4s,box-shadow .4s,transform .4s}
  .metal-card:hover{border-color:rgba(232,93,32,.25);box-shadow:0 0 40px rgba(232,93,32,.08),0 24px 60px rgba(0,0,0,.4);transform:translateY(-6px)}
  .metal-card::before{content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(232,93,32,.03) 0%,transparent 60%);opacity:0;transition:opacity .4s;pointer-events:none;border-radius:inherit}
  .metal-card:hover::before{opacity:1}

  /* ── GLASS PANEL ── */
  .glass{background:rgba(10,12,16,.88);backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);border:1px solid rgba(255,255,255,.07)}

  /* ── ANGULAR CLIP ── */
  .angular{clip-path:polygon(0 0,calc(100% - 20px) 0,100% 20px,100% 100%,20px 100%,0 calc(100% - 20px))}
  .angular-sm{clip-path:polygon(0 0,calc(100% - 12px) 0,100% 12px,100% 100%,12px 100%,0 calc(100% - 12px))}

  /* ── ORANGE GLOW TEXT ── */
  @keyframes textGlow{0%,100%{text-shadow:0 0 20px rgba(232,93,32,.4)}50%{text-shadow:0 0 60px rgba(232,93,32,.8),0 0 100px rgba(200,149,42,.3)}}
  .glow-text{animation:textGlow 3s ease infinite}

  /* ── PULSE RING ── */
  @keyframes ring{0%{transform:scale(1);opacity:.8}100%{transform:scale(2.5);opacity:0}}
  .pulse-ring::after{content:'';position:absolute;inset:0;border-radius:50%;border:2px solid #e85d20;animation:ring 2s ease-out infinite}

  /* ── SCANLINE ── */
  .scanline{position:fixed;inset:0;background:repeating-linear-gradient(to bottom,transparent 0px,transparent 2px,rgba(0,0,0,.015) 2px,rgba(0,0,0,.015) 4px);pointer-events:none;z-index:6}

  /* ── VIGNETTE ── */
  .vignette{position:fixed;inset:0;background:radial-gradient(ellipse at center,transparent 50%,rgba(0,0,0,.7) 100%);pointer-events:none;z-index:5}

  /* ── NOISE GRAIN ── */
  @keyframes grain{0%,100%{transform:translate(0)}20%{transform:translate(-2%,-1%)}40%{transform:translate(1%,2%)}60%{transform:translate(-1%,1%)}80%{transform:translate(2%,-2%)}}
  .grain::after{content:'';position:fixed;inset:-50%;width:200%;height:200%;opacity:.025;animation:grain .5s steps(1) infinite;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");pointer-events:none;z-index:4}

  /* ── INPUTS ── */
  .field{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1);color:#dde0e8;font-family:'DM Sans',sans-serif;font-size:14px;width:100%;padding:14px 16px;border-radius:4px;outline:none;transition:all .25s}
  .field::placeholder{color:rgba(255,255,255,.25)}
  .field:focus{border-color:rgba(232,93,32,.7);background:rgba(232,93,32,.05);box-shadow:0 0 0 3px rgba(232,93,32,.1),0 8px 24px rgba(232,93,32,.1)}
  select.field option{background:#0e1014;color:#dde0e8}

  /* ── DATE CHIP ── */
  .date-chip{flex-shrink:0;cursor:pointer;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.03);text-align:center;padding:12px 10px;border-radius:4px;transition:all .2s}
  .date-chip:hover:not(.full){border-color:rgba(232,93,32,.5);background:rgba(232,93,32,.08)}
  .date-chip.sel{background:rgba(232,93,32,.2)!important;border-color:#e85d20!important}
  .date-chip.full{opacity:.3;cursor:not-allowed}

  /* ── SLOT ── */
  .slot{border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.03);border-radius:4px;padding:12px 8px;cursor:pointer;transition:all .2s;text-align:center}
  .slot:hover:not(:disabled){border-color:rgba(232,93,32,.6);background:rgba(232,93,32,.1);color:#e85d20}
  .slot.picked{background:rgba(232,93,32,.2)!important;border-color:#e85d20!important;color:#fb923c!important}
  .slot:disabled{opacity:.3;cursor:not-allowed}

  /* ── SCROLLBAR ── */
  ::-webkit-scrollbar{width:4px;height:4px}
  ::-webkit-scrollbar-track{background:#05070a}
  ::-webkit-scrollbar-thumb{background:#2a2c32;border-radius:2px}
  ::-webkit-scrollbar-thumb:hover{background:#e85d20}

  /* ── LOADING ── */
  @keyframes spinRing{from{transform:rotate(0)}to{transform:rotate(360deg)}}
  @keyframes fadeSlide{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}

  /* ── SECTION DIVIDER ── */
  .divider-line{height:1px;background:linear-gradient(90deg,transparent,rgba(232,93,32,.4),rgba(200,149,42,.3),transparent)}

  /* ── STEP PROGRESS ── */
  @keyframes stepFill{from{width:0}to{width:100%}}
  .step-fill{animation:stepFill .6s cubic-bezier(.23,1,.32,1) forwards}

  /* ── SERVICE NUMBER ── */
  .svc-num{position:absolute;top:-10px;right:12px;font-family:'Barlow Condensed',sans-serif;font-size:88px;font-weight:900;color:rgba(255,255,255,.03);line-height:1;pointer-events:none;user-select:none}

  /* ── COUNTER ── */
  @keyframes countUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
  .count-in{animation:countUp .6s ease both}

  /* ── ADMIN ── */
  .admin-nav-item{padding:10px 16px;border-radius:4px;font-size:14px;font-weight:500;cursor:pointer;transition:all .2s;display:flex;align-items:center;gap:10px;color:rgba(221,224,232,.6);border:1px solid transparent}
  .admin-nav-item:hover{color:#dde0e8;background:rgba(255,255,255,.04)}
  .admin-nav-item.active{color:#fb923c;background:rgba(232,93,32,.12);border-color:rgba(232,93,32,.2)}
  .row-hover{transition:background .15s}
  .row-hover:hover{background:rgba(255,255,255,.03)}
`}</style>
```

);
}

// ═══════════════════════════════════════════════════════════
// THREE.JS PARTICLE FIELD
// ═══════════════════════════════════════════════════════════
function ThreeBackground() {
const mountRef = useRef(null);
const mouseRef = useRef({ x:0, y:0 });

useEffect(() => {
const mount = mountRef.current;
const W = window.innerWidth, H = window.innerHeight;

```
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x05070a, 0.0015);

const camera = new THREE.PerspectiveCamera(65, W/H, 1, 3000);
camera.position.set(0, 0, 500);

const renderer = new THREE.WebGLRenderer({ antialias:false, powerPreference:"high-performance" });
renderer.setSize(W, H);
renderer.setClearColor(0x05070a, 1);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
renderer.domElement.style.cssText = "position:fixed;top:0;left:0;z-index:0;pointer-events:none";
mount.appendChild(renderer.domElement);

// Glow texture
const tc = document.createElement("canvas");
tc.width = tc.height = 64;
const tctx = tc.getContext("2d");
const tg = tctx.createRadialGradient(32,32,0,32,32,32);
tg.addColorStop(0, "rgba(255,255,255,1)");
tg.addColorStop(0.4, "rgba(255,255,255,.5)");
tg.addColorStop(1, "rgba(255,255,255,0)");
tctx.fillStyle = tg;
tctx.fillRect(0,0,64,64);
const glowTex = new THREE.CanvasTexture(tc);

// Particles
const SPARKS=70, GOLD=50, DUST=750, TOTAL=SPARKS+GOLD+DUST;
const pos = new Float32Array(TOTAL*3);
const col = new Float32Array(TOTAL*3);
const sz  = new Float32Array(TOTAL);

const orange = new THREE.Color(0xe85d20);
const gold   = new THREE.Color(0xc8952a);
const steel  = new THREE.Color(0x2a2c34);

for (let i=0; i<TOTAL; i++) {
  pos[i*3]   = (Math.random()-.5) * 1800;
  pos[i*3+1] = (Math.random()-.5) * 1000;
  pos[i*3+2] = (Math.random()-.5) * 900;
  let c, s;
  if (i<SPARKS) {
    c = orange.clone().multiplyScalar(.6+Math.random()*.6);
    s = Math.random()*5+2.5;
  } else if (i<SPARKS+GOLD) {
    c = gold.clone().multiplyScalar(.4+Math.random()*.5);
    s = Math.random()*3+1;
  } else {
    c = steel.clone().multiplyScalar(Math.random()*.9+.1);
    s = Math.random()*1.8+.4;
  }
  col[i*3]=c.r; col[i*3+1]=c.g; col[i*3+2]=c.b;
  sz[i] = s;
}

const geo = new THREE.BufferGeometry();
geo.setAttribute("position", new THREE.BufferAttribute(pos,3));
geo.setAttribute("color",    new THREE.BufferAttribute(col,3));
geo.setAttribute("size",     new THREE.BufferAttribute(sz,1));

const mat = new THREE.ShaderMaterial({
  uniforms: { time:{value:0}, tex:{value:glowTex} },
  vertexShader:`
    attribute float size;
    attribute vec3 color;
    varying vec3 vCol;
    varying float vA;
    uniform float time;
    void main(){
      vCol = color;
      vec3 p = position;
      p.y += sin(time*.25 + position.x*.006) * 12.0;
      p.x += cos(time*.18 + position.z*.005) * 8.0;
      p.z += sin(time*.3  + position.y*.007) * 6.0;
      vA = .4 + .6 * abs(sin(time*.5 + position.y*.04));
      vec4 mv = modelViewMatrix * vec4(p,1.0);
      gl_PointSize = size * (380.0 / -mv.z);
      gl_Position = projectionMatrix * mv;
    }
  `,
  fragmentShader:`
    uniform sampler2D tex;
    varying vec3 vCol;
    varying float vA;
    void main(){
      vec4 t = texture2D(tex, gl_PointCoord);
      gl_FragColor = vec4(vCol, vA) * t;
    }
  `,
  blending: THREE.AdditiveBlending,
  transparent: true,
  depthWrite: false,
  vertexColors: true,
});

const pts = new THREE.Points(geo, mat);
scene.add(pts);

// Ambient large dust cloud (separate layer)
const dustGeo = new THREE.BufferGeometry();
const dp = new Float32Array(200*3);
const dc = new Float32Array(200*3);
for (let i=0;i<200;i++){
  dp[i*3]=(Math.random()-.5)*3000; dp[i*3+1]=(Math.random()-.5)*1500; dp[i*3+2]=(Math.random()-.5)*1000;
  const g=Math.random()*.15+.03;
  dc[i*3]=g*.8; dc[i*3+1]=g*.75; dc[i*3+2]=g*.6;
}
dustGeo.setAttribute("position", new THREE.BufferAttribute(dp,3));
dustGeo.setAttribute("color",    new THREE.BufferAttribute(dc,3));
const dustMat = new THREE.PointsMaterial({ size:18, vertexColors:true, transparent:true, opacity:.4, blending:THREE.AdditiveBlending, depthWrite:false, sizeAttenuation:true, map:glowTex });
scene.add(new THREE.Points(dustGeo, dustMat));

const clock = new THREE.Clock();
let animId;
const cam = { tx:0, ty:0 };

const animate = () => {
  animId = requestAnimationFrame(animate);
  const t = clock.getElapsedTime();
  mat.uniforms.time.value = t;
  pts.rotation.y = t * .012;
  pts.rotation.x = Math.sin(t * .007) * .1;
  cam.tx = mouseRef.current.x * 70;
  cam.ty = -mouseRef.current.y * 45;
  camera.position.x += (cam.tx - camera.position.x) * .022;
  camera.position.y += (cam.ty - camera.position.y) * .022;
  camera.lookAt(scene.position);
  renderer.render(scene, camera);
};
animate();

const onMouse = e => {
  mouseRef.current.x = (e.clientX/window.innerWidth)*2-1;
  mouseRef.current.y = (e.clientY/window.innerHeight)*2-1;
};
const onTouch = e => {
  if (e.touches.length) {
    mouseRef.current.x = (e.touches[0].clientX/window.innerWidth)*2-1;
    mouseRef.current.y = (e.touches[0].clientY/window.innerHeight)*2-1;
  }
};
const onResize = () => {
  camera.aspect = window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
};

window.addEventListener("mousemove", onMouse);
window.addEventListener("touchmove", onTouch, {passive:true});
window.addEventListener("resize", onResize);
return () => {
  cancelAnimationFrame(animId);
  window.removeEventListener("mousemove", onMouse);
  window.removeEventListener("touchmove", onTouch);
  window.removeEventListener("resize", onResize);
  if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
  geo.dispose(); mat.dispose(); dustGeo.dispose(); dustMat.dispose();
  renderer.dispose(); glowTex.dispose();
};
```

}, []);

return <div ref={mountRef} style={{position:“fixed”,inset:0,zIndex:0,pointerEvents:“none”}} />;
}

// ═══════════════════════════════════════════════════════════
// ATMOSPHERE LAYERS
// ═══════════════════════════════════════════════════════════
function SmokeOverlay() {
const layers = [
{top:“5%”,left:“15%”,w:700,h:500,dur:20,del:0},
{top:“55%”,right:“5%”,w:600,h:420,dur:26,del:5},
{top:“25%”,left:“55%”,w:800,h:600,dur:22,del:10},
{top:“70%”,left:“30%”,w:500,h:380,dur:18,del:15},
];
return (
<div style={{position:“fixed”,inset:0,zIndex:1,pointerEvents:“none”,overflow:“hidden”}}>
{layers.map((l,i)=>(
<div key={i} style={{
position:“absolute”, top:l.top, left:l.left, right:l.right,
width:l.w, height:l.h, borderRadius:“50%”,
background:“radial-gradient(ellipse, rgba(180,160,130,.07) 0%, rgba(100,90,70,.04) 40%, transparent 70%)”,
filter:“blur(90px)”,
animation:`smoke ${l.dur}s ${l.del}s ease-in-out infinite alternate`,
}}/>
))}
</div>
);
}

function MouseSpotlight() {
const ref = useRef(null);
useEffect(()=>{
const el = ref.current;
const fn = e => { if(el){ el.style.left=e.clientX+“px”; el.style.top=e.clientY+“px”; } };
window.addEventListener(“mousemove”, fn);
return ()=>window.removeEventListener(“mousemove”, fn);
},[]);
return (
<div ref={ref} style={{
position:“fixed”,zIndex:3,pointerEvents:“none”,
width:700,height:700,borderRadius:“50%”,
transform:“translate(-50%,-50%)”,
background:“radial-gradient(circle, rgba(232,93,32,.04) 0%, rgba(200,149,42,.02) 30%, transparent 70%)”,
}}/>
);
}

// ═══════════════════════════════════════════════════════════
// CUSTOM CURSOR
// ═══════════════════════════════════════════════════════════
function CustomCursor() {
const dotRef  = useRef(null);
const ringRef = useRef(null);
useEffect(()=>{
let rx=0, ry=0;
const move = e=>{
const {clientX:x,clientY:y} = e;
if(dotRef.current){ dotRef.current.style.left=x+“px”; dotRef.current.style.top=y+“px”; }
rx += (x-rx)*.15; ry += (y-ry)*.15;
if(ringRef.current){ ringRef.current.style.left=rx+“px”; ringRef.current.style.top=ry+“px”; }
};
const over = e=>{
const t = e.target.closest(“button,a,[data-hover]”);
ringRef.current?.classList.toggle(“hovered”, !!t);
};
let id;
const loop = ()=>{
if(ringRef.current){ ringRef.current.style.left=rx+“px”; ringRef.current.style.top=ry+“px”; }
id=requestAnimationFrame(loop);
};
loop();
window.addEventListener(“mousemove”, move);
document.addEventListener(“mouseover”, over);
return ()=>{ window.removeEventListener(“mousemove”,move); document.removeEventListener(“mouseover”,over); cancelAnimationFrame(id); };
},[]);
return (<><div ref={dotRef} className="cursor-dot"/><div ref={ringRef} className="cursor-ring"/></>);
}

// ═══════════════════════════════════════════════════════════
// LOADING SCREEN
// ═══════════════════════════════════════════════════════════
function LoadingScreen({ onDone }) {
const [phase, setPhase] = useState(0);
useEffect(()=>{
const t1=setTimeout(()=>setPhase(1), 600);
const t2=setTimeout(()=>setPhase(2), 1400);
const t3=setTimeout(()=>setPhase(3), 2100);
const t4=setTimeout(()=>onDone(), 2700);
return ()=>{ clearTimeout(t1);clearTimeout(t2);clearTimeout(t3);clearTimeout(t4); };
},[]);

return (
<div style={{
position:“fixed”,inset:0,zIndex:9000,background:”#05070a”,
display:“flex”,flexDirection:“column”,alignItems:“center”,justifyContent:“center”,
opacity: phase>=3?0:1, transition:“opacity .6s ease”,
pointerEvents: phase>=3?“none”:“all”,
}}>
{/* Radial glow */}
<div style={{position:“absolute”,inset:0,background:“radial-gradient(ellipse at 50% 50%, rgba(232,93,32,.06) 0%, transparent 60%)”,pointerEvents:“none”}}/>

```
  {/* Logo ring */}
  <div style={{position:"relative",marginBottom:36}}>
    <svg width="100" height="100" viewBox="0 0 100 100" style={{display:"block"}}>
      <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(232,93,32,.1)" strokeWidth="1"/>
      <circle cx="50" cy="50" r="46" fill="none" stroke="#e85d20" strokeWidth="1.5"
        strokeDasharray={289} strokeDashoffset={phase>=1?0:289}
        style={{transition:"stroke-dashoffset 1s cubic-bezier(.23,1,.32,1)",transformOrigin:"50px 50px",transform:"rotate(-90deg)"}}/>
      <circle cx="50" cy="50" r="34" fill="none" stroke="rgba(200,149,42,.12)" strokeWidth="1"/>
    </svg>
    <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <Wrench style={{width:30,height:30,color:"#e85d20",opacity:phase>=1?1:0,transition:"opacity .4s .3s"}}/>
    </div>
  </div>

  {/* Text */}
  <div style={{
    fontFamily:"'Barlow Condensed',sans-serif",fontWeight:900,
    fontSize:"clamp(28px,5vw,42px)",letterSpacing:8,textTransform:"uppercase",
    color:"#dde0e8",
    opacity:phase>=2?1:0,transform:phase>=2?"translateY(0)":"translateY(12px)",
    transition:"all .6s cubic-bezier(.23,1,.32,1)",
  }}>KOM IN BILSERVICE</div>

  <div style={{
    fontSize:11,fontWeight:600,letterSpacing:4,color:"#e85d20",
    textTransform:"uppercase",marginTop:8,
    opacity:phase>=2?1:0,transition:"opacity .5s .15s ease",
  }}>INITIERAR SYSTEM</div>

  {/* Progress bar */}
  <div style={{width:220,height:1,background:"rgba(255,255,255,.08)",marginTop:40,overflow:"hidden"}}>
    <div style={{
      height:"100%",background:"linear-gradient(90deg,#e85d20,#c8952a)",
      width: phase===0?"0%":phase===1?"35%":phase===2?"70%":"100%",
      transition:"width .8s cubic-bezier(.23,1,.32,1)",
    }}/>
  </div>
</div>
```

);
}

// ═══════════════════════════════════════════════════════════
// HOOKS
// ═══════════════════════════════════════════════════════════
function useReveal(opts={}) {
const ref  = useRef(null);
const [vis, setVis] = useState(false);
useEffect(()=>{
const el = ref.current;
if (!el) return;
const obs = new IntersectionObserver(([e])=>{ if(e.isIntersecting){setVis(true);obs.disconnect();} },{ threshold:opts.threshold||0.12 });
obs.observe(el);
return ()=>obs.disconnect();
},[]);
return [ref, vis];
}

function useCounter(target, active) {
const [val, setVal] = useState(0);
useEffect(()=>{
if (!active) return;
const steps = 50, dur = 1800;
let i = 0;
const id = setInterval(()=>{
i++;
setVal(Math.floor(target * (i/steps)));
if (i>=steps){ setVal(target); clearInterval(id); }
}, dur/steps);
return ()=>clearInterval(id);
},[active,target]);
return val;
}

// ═══════════════════════════════════════════════════════════
// NAVBAR
// ═══════════════════════════════════════════════════════════
function Navbar({ setPage }) {
const [open, setOpen]     = useState(false);
const [scrolled, setScrolled] = useState(false);

useEffect(()=>{
const fn=()=>setScrolled(window.scrollY>60);
window.addEventListener(“scroll”,fn);
return ()=>window.removeEventListener(“scroll”,fn);
},[]);

const navStyle={
position:“fixed”,inset:“0 0 auto”,zIndex:200,
transition:“background .4s, border-color .4s”,
borderBottom:“1px solid”,
borderColor: scrolled?“rgba(255,255,255,.07)”:“transparent”,
background: scrolled?“rgba(5,7,10,.92)”:“transparent”,
backdropFilter: scrolled?“blur(20px)”:“none”,
};

return (
<nav style={navStyle}>
<div style={{maxWidth:1300,margin:“0 auto”,padding:“0 24px”,display:“flex”,alignItems:“center”,justifyContent:“space-between”,height:72}}>

```
    {/* Logo */}
    <button onClick={()=>{setPage("home");setOpen(false);}} data-hover style={{display:"flex",alignItems:"center",gap:12,background:"none",border:"none",cursor:"pointer"}}>
      <div style={{width:40,height:40,background:"linear-gradient(135deg,#e85d20,#c8952a)",display:"flex",alignItems:"center",justifyContent:"center",clipPath:"polygon(0 0,calc(100% - 8px) 0,100% 8px,100% 100%,8px 100%,0 calc(100% - 8px))"}}>
        <Wrench style={{width:18,height:18,color:"#fff"}}/>
      </div>
      <div style={{textAlign:"left"}}>
        <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:15,letterSpacing:2,textTransform:"uppercase",color:"#dde0e8",lineHeight:1}}>Kom In Bilservice</div>
        <div style={{fontSize:9,fontWeight:600,letterSpacing:3,color:"#e85d20",textTransform:"uppercase",marginTop:3}}>Auktoriserad verkstad</div>
      </div>
    </button>

    {/* Desktop nav */}
    <div style={{display:"flex",alignItems:"center",gap:32}} className="hidden-mobile">
      {["Tjänster","Om oss","Kontakt"].map(l=>(
        <span key={l} data-hover style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:500,color:"rgba(221,224,232,.65)",cursor:"pointer",letterSpacing:.5,transition:"color .2s"}}
          onMouseEnter={e=>e.target.style.color="#dde0e8"} onMouseLeave={e=>e.target.style.color="rgba(221,224,232,.65)"}>{l}</span>
      ))}
      <div style={{width:1,height:20,background:"rgba(255,255,255,.12)"}}/>
      <button onClick={()=>setPage("booking")} data-hover className="btn-fire angular-sm" style={{padding:"10px 24px",fontSize:13,borderRadius:4}}>
        Boka tid
      </button>
    </div>

    {/* Mobile */}
    <button onClick={()=>setOpen(!open)} data-hover style={{display:"none",background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.1)",color:"#dde0e8",padding:"8px 10px",borderRadius:4,cursor:"pointer"}} className="mobile-menu-btn">
      {open ? <X style={{width:20,height:20}}/> : <Menu style={{width:20,height:20}}/>}
    </button>
  </div>

  {/* Mobile menu */}
  {open && (
    <div style={{background:"rgba(5,7,10,.97)",borderTop:"1px solid rgba(255,255,255,.07)",padding:"16px 24px",display:"flex",flexDirection:"column",gap:8}}>
      {["Tjänster","Om oss","Kontakt"].map(l=>(
        <button key={l} onClick={()=>setOpen(false)} style={{background:"none",border:"none",color:"rgba(221,224,232,.7)",fontFamily:"'Barlow Condensed',sans-serif",fontSize:18,fontWeight:600,letterSpacing:1,textTransform:"uppercase",textAlign:"left",padding:"10px 0",cursor:"pointer",borderBottom:"1px solid rgba(255,255,255,.06)"}}>
          {l}
        </button>
      ))}
      <button onClick={()=>{setPage("booking");setOpen(false);}} className="btn-fire" style={{padding:"14px 24px",fontSize:15,borderRadius:4,marginTop:8}}>
        BOKA TID NU →
      </button>
    </div>
  )}

  <style>{`
    @media(max-width:768px){
      .hidden-mobile{display:none!important}
      .mobile-menu-btn{display:flex!important}
    }
  `}</style>
</nav>
```

);
}

// ═══════════════════════════════════════════════════════════
// HERO SECTION
// ═══════════════════════════════════════════════════════════
function Hero({ setPage }) {
const [ref, vis] = useReveal({ threshold: 0 });
const [mounted, setMounted] = useState(false);
useEffect(()=>{ const t=setTimeout(()=>setMounted(true), 200); return ()=>clearTimeout(t); },[]);

return (
<section ref={ref} style={{minHeight:“100vh”,display:“flex”,flexDirection:“column”,justifyContent:“center”,position:“relative”,zIndex:10,padding:“120px 0 80px”}}>
<div style={{maxWidth:1300,margin:“0 auto”,padding:“0 24px”,width:“100%”}}>

```
    {/* Overline */}
    <div style={{
      display:"inline-flex",alignItems:"center",gap:16,marginBottom:32,
      opacity:mounted?1:0,transform:mounted?"translateY(0)":"translateY(20px)",
      transition:"all .8s cubic-bezier(.23,1,.32,1)",
    }}>
      <div style={{width:40,height:1,background:"linear-gradient(90deg,transparent,#e85d20)"}}/>
      <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:11,fontWeight:700,letterSpacing:5,color:"#e85d20",textTransform:"uppercase"}}>Kungsbacka · Auktoriserad Verkstad</span>
      <div style={{width:40,height:1,background:"linear-gradient(90deg,#e85d20,transparent)"}}/>
    </div>

    {/* Main headline */}
    <div style={{overflow:"hidden",marginBottom:8}}>
      <h1 style={{
        fontFamily:"'Barlow Condensed',sans-serif",fontStyle:"italic",fontWeight:900,
        fontSize:"clamp(72px,12vw,160px)",lineHeight:.92,letterSpacing:-2,
        color:"#dde0e8",textTransform:"uppercase",
        opacity:mounted?1:0,transform:mounted?"translateY(0)":"translateY(60px)",
        transition:"all 1s .1s cubic-bezier(.23,1,.32,1)",
      }}>KOM IN</h1>
    </div>
    <div style={{overflow:"hidden",marginBottom:28}}>
      <h1 style={{
        fontFamily:"'Barlow Condensed',sans-serif",fontStyle:"italic",fontWeight:900,
        fontSize:"clamp(72px,12vw,160px)",lineHeight:.92,letterSpacing:-2,
        textTransform:"uppercase",
        background:"linear-gradient(120deg,#e85d20 0%,#c8952a 40%,#e85d20 100%)",
        WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text",
        opacity:mounted?1:0,transform:mounted?"translateY(0)":"translateY(60px)",
        transition:"all 1s .2s cubic-bezier(.23,1,.32,1)",
      }}>BILSERVICE</h1>
    </div>

    {/* Tagline */}
    <p style={{
      fontSize:"clamp(15px,1.8vw,20px)",fontWeight:300,color:"rgba(221,224,232,.6)",
      maxWidth:560,lineHeight:1.7,marginBottom:14,
      opacity:mounted?1:0,transition:"all .9s .4s cubic-bezier(.23,1,.32,1)",
    }}>
      Kompromisslös precision. Garanterat hantverk. Vi behandlar din bil med samma omsorg som om den vore vår egen.
    </p>
    <p style={{
      fontSize:14,fontStyle:"italic",color:"rgba(221,224,232,.38)",marginBottom:48,
      opacity:mounted?1:0,transition:"all .9s .5s cubic-bezier(.23,1,.32,1)",
    }}>
      "Osäker på vad felet är? Beskriv bara vad du upplever — vi löser resten."
    </p>

    {/* CTAs */}
    <div style={{
      display:"flex",flexWrap:"wrap",gap:16,
      opacity:mounted?1:0,transition:"all .9s .6s cubic-bezier(.23,1,.32,1)",
    }}>
      <button onClick={()=>setPage("booking")} data-hover className="btn-fire angular" style={{padding:"16px 40px",fontSize:15,borderRadius:2,display:"flex",alignItems:"center",gap:10}}>
        <Calendar style={{width:18,height:18}}/> BOKA TID ONLINE
      </button>
      <a href={`tel:${PHONE_RAW}`} data-hover className="btn-ghost angular" style={{padding:"16px 40px",fontSize:15,borderRadius:2,display:"flex",alignItems:"center",gap:10,textDecoration:"none",color:"#dde0e8"}}>
        <Phone style={{width:18,height:18,color:"#e85d20"}}/> {PHONE_DISP}
      </a>
    </div>

    {/* Scroll indicator */}
    <div style={{marginTop:80,display:"flex",alignItems:"center",gap:16,opacity:mounted?.6:0,transition:"opacity 1s .9s"}}>
      <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
        <div style={{width:1,height:48,background:"linear-gradient(to bottom,transparent,#e85d20,transparent)",animation:"grain 2s infinite"}}/>
        <ChevronDown style={{width:14,height:14,color:"#e85d20"}}/>
      </div>
      <span style={{fontSize:10,letterSpacing:4,fontWeight:600,color:"rgba(221,224,232,.3)",textTransform:"uppercase"}}>Skrolla</span>
    </div>
  </div>
</section>
```

);
}

// ═══════════════════════════════════════════════════════════
// MARQUEE STRIP
// ═══════════════════════════════════════════════════════════
function Marquee() {
const items = [“PRECISION”,“KRAFT”,“ERFARENHET”,“GARANTI”,“EXPERTIS”,“SNABB SERVICE”,“TRANSPARENS”,“PÅLITLIGHET”];
const arr = […items,…items];
return (
<div style={{position:“relative”,zIndex:10,background:“rgba(232,93,32,.08)”,borderTop:“1px solid rgba(232,93,32,.2)”,borderBottom:“1px solid rgba(232,93,32,.2)”,padding:“14px 0”,overflow:“hidden”}}>
<div className="mq-inner">
{arr.map((t,i)=>(
<span key={i} style={{display:“inline-flex”,alignItems:“center”,gap:32,whiteSpace:“nowrap”,padding:“0 32px”}}>
<span style={{fontFamily:”‘Barlow Condensed’,sans-serif”,fontWeight:800,fontSize:12,letterSpacing:4,color:”#e85d20”,textTransform:“uppercase”}}>{t}</span>
<span style={{color:“rgba(200,149,42,.4)”,fontSize:8}}>◆</span>
</span>
))}
</div>
</div>
);
}

// ═══════════════════════════════════════════════════════════
// SERVICES SECTION
// ═══════════════════════════════════════════════════════════
function Services({ setPage }) {
const [ref, vis] = useReveal();
const services = [
{ num:“01”, icon:<Wrench style={{width:24,height:24}}/>, title:“Motor & Drivlina”, desc:“Motorutbyte, kamremsbyte, turbobyte och alla typer av komplexa motorreparationer med garanti.”, tag:“Större”, tagColor:”#fb923c” },
{ num:“02”, icon:<RefreshCw style={{width:24,height:24}}/>, title:“Växellåda”, desc:“Reparation och utbyte av automatväxellådor och manuella växellådor från alla tillverkare.”, tag:“Större”, tagColor:”#fb923c” },
{ num:“03”, icon:<Activity style={{width:24,height:24}}/>, title:“Fjädring & Styrning”, desc:“Stötdämpare, bussningar, krängningshämmare, styrväxel och komplett hjulgeometri.”, tag:“Större”, tagColor:”#fb923c” },
{ num:“04”, icon:<Zap style={{width:24,height:24}}/>, title:“El & Diagnos”, desc:“Avancerad felkodsläsning, lambdasond, startmotor, generator och komplex elfelsökning.”, tag:“Större”, tagColor:”#fb923c” },
{ num:“05”, icon:<Settings style={{width:24,height:24}}/>, title:“Service & Oljebyte”, desc:“Komplett service paket, oljebyte, filterbyten och förebyggande underhåll.”, tag:“Service”, tagColor:”#4ade80” },
{ num:“06”, icon:<CheckCircle style={{width:24,height:24}}/>, title:“Bromsar & Däck”, desc:“Bromsbelägg, bromsskivor, säsongsbyten och komplett hjulservice.”, tag:“Service”, tagColor:”#4ade80” },
{ num:“07”, icon:<Package style={{width:24,height:24}}/>, title:“Batteri & AC”, desc:“Batteribyte, laddningssystemkontroll och AC-service inför sommarsäsongen.”, tag:“Service”, tagColor:”#4ade80” },
{ num:“08”, icon:<Shield style={{width:24,height:24}}/>, title:“Förbesiktning”, desc:“Komplett förbesiktningskontroll så att din bil klarar besiktningen utan problem.”, tag:“Service”, tagColor:”#4ade80” },
];

return (
<section style={{position:“relative”,zIndex:10,padding:“100px 0”,background:“linear-gradient(to bottom,rgba(5,7,10,.96),rgba(5,7,10,.99))”}}>
<div style={{maxWidth:1300,margin:“0 auto”,padding:“0 24px”}}>

```
    {/* Header */}
    <div ref={ref} style={{marginBottom:64,opacity:vis?1:0,transform:vis?"none":"translateY(40px)",transition:"all .9s cubic-bezier(.23,1,.32,1)"}}>
      <div style={{display:"flex",alignItems:"center",gap:16,marginBottom:20}}>
        <div style={{width:32,height:1,background:"#e85d20"}}/>
        <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:11,fontWeight:700,letterSpacing:5,color:"#e85d20",textTransform:"uppercase"}}>Vad vi gör</span>
      </div>
      <h2 style={{fontFamily:"'Barlow Condensed',sans-serif",fontStyle:"italic",fontWeight:900,fontSize:"clamp(48px,7vw,80px)",color:"#dde0e8",lineHeight:.95,textTransform:"uppercase",letterSpacing:-1}}>
        Alla typer<br/>
        <span style={{background:"linear-gradient(120deg,#e85d20,#c8952a)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>av bilservice</span>
      </h2>
    </div>

    {/* Grid */}
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:2}}>
      {services.map((s,i)=>(
        <button key={i} onClick={()=>setPage("booking")} data-hover
          className="metal-card" style={{
            position:"relative",padding:"36px 28px",border:"none",cursor:"pointer",textAlign:"left",
            borderRadius:2,overflow:"hidden",
            opacity:vis?1:0,transform:vis?"none":"translateY(40px)",
            transition:`opacity .9s ${.06*i}s cubic-bezier(.23,1,.32,1), transform .9s ${.06*i}s cubic-bezier(.23,1,.32,1), box-shadow .4s, border-color .4s`,
          }}>
          <div className="svc-num">{s.num}</div>
          <div style={{color:"#e85d20",marginBottom:16,display:"flex"}}>{s.icon}</div>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
            <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:9,fontWeight:700,letterSpacing:3,color:s.tagColor,textTransform:"uppercase",background:`${s.tagColor}18`,padding:"3px 8px",borderRadius:2}}>{s.tag}</span>
          </div>
          <h3 style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:22,color:"#dde0e8",textTransform:"uppercase",letterSpacing:.5,marginBottom:12,lineHeight:1}}>{s.title}</h3>
          <p style={{fontSize:13,lineHeight:1.7,color:"rgba(221,224,232,.5)",marginBottom:20}}>{s.desc}</p>
          <div style={{display:"flex",alignItems:"center",gap:6,color:"#e85d20",fontSize:12,fontWeight:600,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:2,textTransform:"uppercase"}}>
            BOKA <ArrowRight style={{width:14,height:14}}/>
          </div>
        </button>
      ))}
    </div>
  </div>
</section>
```

);
}

// ═══════════════════════════════════════════════════════════
// STATS SECTION
// ═══════════════════════════════════════════════════════════
function Stats() {
const [ref, vis] = useReveal();
const stats = [
{ num:15, suffix:”+”, label:“Års erfarenhet”, sub:“Kompetens du kan lita på” },
{ num:2500, suffix:”+”, label:“Nöjda kunder”, sub:“Av oss behandlade bilar” },
{ num:98, suffix:”%”, label:“Nöjdhetsgrad”, sub:“Baserat på kundrecensioner” },
{ num:48, suffix:“h”, label:“Snabb service”, sub:“Genomsnittlig handläggningstid” },
];

return (
<section style={{position:“relative”,zIndex:10,background:“rgba(5,7,10,.98)”,borderTop:“1px solid rgba(255,255,255,.04)”,borderBottom:“1px solid rgba(255,255,255,.04)”}}>
<div style={{maxWidth:1300,margin:“0 auto”,padding:“0 24px”}}>
<div ref={ref} style={{display:“grid”,gridTemplateColumns:“repeat(auto-fill,minmax(200px,1fr))”,borderLeft:“1px solid rgba(255,255,255,.04)”}}>
{stats.map((s,i)=>{
const val = useCounter(s.num, vis);
return (
<div key={i} style={{
padding:“56px 40px”,borderRight:“1px solid rgba(255,255,255,.04)”,borderBottom:“1px solid rgba(255,255,255,.04)”,
opacity:vis?1:0,transform:vis?“none”:“translateY(30px)”,
transition:`all .9s ${.1*i}s cubic-bezier(.23,1,.32,1)`,
}}>
<div style={{fontFamily:”‘Barlow Condensed’,sans-serif”,fontStyle:“italic”,fontWeight:900,fontSize:“clamp(56px,6vw,80px)”,lineHeight:.9,marginBottom:12}}>
<span style={{background:“linear-gradient(120deg,#e85d20,#c8952a)”,WebkitBackgroundClip:“text”,WebkitTextFillColor:“transparent”,backgroundClip:“text”}}>{val}</span>
<span style={{color:“rgba(232,93,32,.5)”,fontSize:“0.5em”}}>{s.suffix}</span>
</div>
<div style={{fontFamily:”‘Barlow Condensed’,sans-serif”,fontWeight:700,fontSize:14,color:”#dde0e8”,textTransform:“uppercase”,letterSpacing:2,marginBottom:6}}>{s.label}</div>
<div style={{fontSize:12,color:“rgba(221,224,232,.35)”}}>{s.sub}</div>
</div>
);
})}
</div>
</div>
</section>
);
}

// ═══════════════════════════════════════════════════════════
// ABOUT / WHY US SECTION
// ═══════════════════════════════════════════════════════════
function About({ setPage }) {
const [refL, visL] = useReveal();
const [refR, visR] = useReveal();
const trust = [
{ icon:<Shield style={{width:20,height:20}}/>, title:“Garanterat arbete”, desc:“Skriftlig garanti på allt vi utför. Vi rätar upp eventuella fel utan extra kostnad.” },
{ icon:<Star style={{width:20,height:20}}/>, title:“Transparenta priser”, desc:“Ingen faktura utan din godkännande. Du vet alltid vad det kostar i förväg.” },
{ icon:<Clock style={{width:20,height:20}}/>, title:“Håller tider”, desc:“Vi respekterar din tid och informerar aktivt om ändringar i tidsplan.” },
{ icon:<Phone style={{width:20,height:20}}/>, title:“Direkt kontakt”, desc:“Ring Mohammad direkt. Ingen call-center. Verkstadsmästaren svarar personligen.” },
];

return (
<section style={{position:“relative”,zIndex:10,padding:“100px 0”,background:“rgba(5,7,10,.97)”}}>
<div style={{maxWidth:1300,margin:“0 auto”,padding:“0 24px”,display:“grid”,gridTemplateColumns:“1fr 1fr”,gap:80,alignItems:“center”}}>

```
    {/* Left */}
    <div ref={refL} style={{opacity:visL?1:0,transform:visL?"none":"translateX(-50px)",transition:"all 1s cubic-bezier(.23,1,.32,1)"}}>
      <div style={{display:"flex",alignItems:"center",gap:16,marginBottom:24}}>
        <div style={{width:32,height:1,background:"#e85d20"}}/>
        <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:11,fontWeight:700,letterSpacing:5,color:"#e85d20",textTransform:"uppercase"}}>Varför oss</span>
      </div>
      <blockquote style={{
        fontFamily:"'Barlow Condensed',sans-serif",fontStyle:"italic",fontWeight:800,
        fontSize:"clamp(36px,5vw,60px)",lineHeight:1.05,color:"#dde0e8",
        textTransform:"uppercase",marginBottom:32,letterSpacing:-1,
      }}>
        "Vi behandlar din bil som om den vore vår <span style={{color:"#e85d20"}}>egen.</span>"
      </blockquote>
      <p style={{fontSize:15,color:"rgba(221,224,232,.5)",lineHeight:1.8,marginBottom:28}}>
        På Kom In Bilservice möter du mekaniker som genuint bryr sig om resultatet. Vi tar oss tid, förklarar vad som gjorts och ser till att du lämnar nöjd varje gång.
      </p>
      <p style={{fontSize:14,fontStyle:"italic",color:"rgba(221,224,232,.3)",lineHeight:1.7,borderLeft:"2px solid rgba(232,93,32,.3)",paddingLeft:16}}>
        Osäker på vad felet är? Beskriv bara vad du hör, känner eller upplever med bilen — vi felsöker problemet och förklarar det på ett begripligt sätt. Du behöver inga tekniska förkunskaper.
      </p>
      <button onClick={()=>setPage("booking")} data-hover className="btn-fire angular-sm" style={{marginTop:36,padding:"14px 32px",fontSize:14,borderRadius:2,display:"inline-flex",alignItems:"center",gap:8}}>
        BOKA GRATIS KONSULTATION <ArrowRight style={{width:16,height:16}}/>
      </button>
    </div>

    {/* Right */}
    <div ref={refR} style={{opacity:visR?1:0,transform:visR?"none":"translateX(50px)",transition:"all 1s .2s cubic-bezier(.23,1,.32,1)",display:"flex",flexDirection:"column",gap:2}}>
      {trust.map((t,i)=>(
        <div key={i} className="metal-card" style={{position:"relative",padding:"24px 28px",borderRadius:2,display:"flex",gap:20,alignItems:"flex-start"}}>
          <div style={{width:44,height:44,background:"rgba(232,93,32,.1)",border:"1px solid rgba(232,93,32,.2)",display:"flex",alignItems:"center",justifyContent:"center",color:"#e85d20",flexShrink:0,clipPath:"polygon(0 0,calc(100% - 8px) 0,100% 8px,100% 100%,8px 100%,0 calc(100% - 8px))"}}>
            {t.icon}
          </div>
          <div>
            <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:16,color:"#dde0e8",textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>{t.title}</div>
            <div style={{fontSize:13,color:"rgba(221,224,232,.45)",lineHeight:1.6}}>{t.desc}</div>
          </div>
        </div>
      ))}
    </div>
  </div>

  <style>{`@media(max-width:768px){div[style*="grid-template-columns: 1fr 1fr"]{grid-template-columns:1fr!important}}`}</style>
</section>
```

);
}

// ═══════════════════════════════════════════════════════════
// PROCESS SECTION
// ═══════════════════════════════════════════════════════════
function Process({ setPage }) {
const [ref, vis] = useReveal();
const steps = [
{ n:“01”, title:“Boka online”, desc:“Välj datum, tid och beskriv problemet. Ladda upp bilder om du vill. Tar under 3 minuter.” },
{ n:“02”, title:“Vi bekräftar”, desc:“Vi återkommer inom 2 timmar med bekräftelse och eventuella frågor om jobbet.” },
{ n:“03”, title:“Lämna bilen”, desc:“Kom in vid bokad tid. Vi tar hand om allt. Du kan lämna och gå.” },
{ n:“04”, title:“Hämta & kör”, desc:“Bilen är klar vid avtalad tid. Vi ringer dig. Betala och kör därifrån.” },
];

return (
<section style={{position:“relative”,zIndex:10,padding:“100px 0”,background:“rgba(5,7,10,.98)”}}>
<div style={{maxWidth:1300,margin:“0 auto”,padding:“0 24px”}}>
<div ref={ref} style={{textAlign:“center”,marginBottom:64,opacity:vis?1:0,transform:vis?“none”:“translateY(30px)”,transition:“all .9s cubic-bezier(.23,1,.32,1)”}}>
<div style={{display:“inline-flex”,alignItems:“center”,gap:16,marginBottom:20}}>
<div style={{width:32,height:1,background:”#e85d20”}}/>
<span style={{fontFamily:”‘Barlow Condensed’,sans-serif”,fontSize:11,fontWeight:700,letterSpacing:5,color:”#e85d20”,textTransform:“uppercase”}}>Hur det fungerar</span>
<div style={{width:32,height:1,background:”#e85d20”}}/>
</div>
<h2 style={{fontFamily:”‘Barlow Condensed’,sans-serif”,fontStyle:“italic”,fontWeight:900,fontSize:“clamp(48px,7vw,80px)”,color:”#dde0e8”,lineHeight:.95,textTransform:“uppercase”,letterSpacing:-1}}>
Enkelt som att <span style={{color:”#e85d20”}}>andas</span>
</h2>
</div>

```
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:2}}>
      {steps.map((s,i)=>(
        <div key={i} className="metal-card" style={{
          position:"relative",padding:"40px 32px",borderRadius:2,overflow:"hidden",
          opacity:vis?1:0,transform:vis?"none":"translateY(40px)",
          transition:`all .9s ${.1*i}s cubic-bezier(.23,1,.32,1)`,
        }}>
          <div className="svc-num" style={{fontSize:100,top:-14}}>{s.n}</div>
          <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontStyle:"italic",fontWeight:900,fontSize:56,color:"rgba(232,93,32,.15)",marginBottom:20,lineHeight:1}}>{s.n}</div>
          <h3 style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:22,color:"#dde0e8",textTransform:"uppercase",letterSpacing:1,marginBottom:12}}>{s.title}</h3>
          <p style={{fontSize:13,color:"rgba(221,224,232,.45)",lineHeight:1.7}}>{s.desc}</p>
          {i < steps.length-1 && (
            <div style={{position:"absolute",top:40,right:-1,width:1,height:80,background:"linear-gradient(to bottom,transparent,rgba(232,93,32,.3),transparent)"}}/>
          )}
        </div>
      ))}
    </div>

    <div style={{textAlign:"center",marginTop:56,opacity:vis?1:0,transition:"opacity .9s .5s ease"}}>
      <button onClick={()=>setPage("booking")} data-hover className="btn-fire angular" style={{padding:"16px 48px",fontSize:15,borderRadius:2}}>
        BOKA DIN TID NU →
      </button>
    </div>
  </div>
</section>
```

);
}

// ═══════════════════════════════════════════════════════════
// EMERGENCY SECTION
// ═══════════════════════════════════════════════════════════
function Emergency() {
const [ref, vis] = useReveal();
return (
<section style={{position:“relative”,zIndex:10,overflow:“hidden”}}>
<div style={{
background:“linear-gradient(135deg,#1a0800 0%,#2d0f00 30%,#1a0800 60%,#0d0500 100%)”,
borderTop:“1px solid rgba(232,93,32,.3)”, borderBottom:“1px solid rgba(232,93,32,.3)”,
padding:“80px 24px”,textAlign:“center”,position:“relative”,
}}>
{/* Glowing backdrop */}
<div style={{position:“absolute”,inset:0,background:“radial-gradient(ellipse at 50% 50%,rgba(232,93,32,.08) 0%,transparent 70%)”,pointerEvents:“none”}}/>

```
    <div ref={ref} style={{maxWidth:600,margin:"0 auto",position:"relative",opacity:vis?1:0,transform:vis?"none":"translateY(30px)",transition:"all .9s cubic-bezier(.23,1,.32,1)"}}>
      {/* Pulsing icon */}
      <div style={{position:"relative",width:72,height:72,margin:"0 auto 32px",display:"flex",alignItems:"center",justifyContent:"center"}}>
        <div style={{position:"absolute",inset:0,borderRadius:"50%",background:"rgba(232,93,32,.15)",animation:"ring 2s ease-out infinite"}}/>
        <div style={{width:72,height:72,borderRadius:"50%",background:"rgba(232,93,32,.2)",border:"1px solid rgba(232,93,32,.4)",display:"flex",alignItems:"center",justifyContent:"center"}}>
          <Phone style={{width:30,height:30,color:"#e85d20"}}/>
        </div>
      </div>

      <h2 className="glow-text" style={{fontFamily:"'Barlow Condensed',sans-serif",fontStyle:"italic",fontWeight:900,fontSize:"clamp(48px,8vw,80px)",color:"#dde0e8",textTransform:"uppercase",letterSpacing:-1,marginBottom:8,lineHeight:.95}}>
        AKUT ÄRENDE?
      </h2>
      <p style={{fontSize:18,color:"rgba(221,224,232,.6)",marginBottom:36,lineHeight:1.7}}>
        Ring Mohammad direkt — vi hjälper dig omedelbart. Ingen telefonkö. Direkt kontakt med verkstadsmästaren.
      </p>
      <a href={`tel:${PHONE_RAW}`} data-hover style={{
        display:"inline-flex",alignItems:"center",gap:16,
        background:"linear-gradient(135deg,rgba(232,93,32,.2),rgba(200,149,42,.1))",
        border:"1px solid rgba(232,93,32,.5)",
        padding:"20px 48px",borderRadius:2,textDecoration:"none",
        transition:"all .3s",backdropFilter:"blur(10px)",
      }}
        onMouseEnter={e=>e.currentTarget.style.boxShadow="0 0 60px rgba(232,93,32,.5)"}
        onMouseLeave={e=>e.currentTarget.style.boxShadow="none"}>
        <Phone style={{width:24,height:24,color:"#e85d20"}}/>
        <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:900,fontSize:"clamp(24px,4vw,36px)",color:"#dde0e8",letterSpacing:2}}>{PHONE_DISP}</span>
      </a>

      <div style={{display:"flex",justifyContent:"center",gap:32,marginTop:36,flexWrap:"wrap"}}>
        {[["Mån–Fre","07:30–18:00"],["Lördag","09:00–14:00"],["Söndag","Stängt"]].map(([d,t])=>(
          <div key={d} style={{fontSize:13,color:"rgba(221,224,232,.4)"}}>
            <span style={{color:"rgba(221,224,232,.7)",fontWeight:600}}>{d}</span> {t}
          </div>
        ))}
      </div>
    </div>
  </div>
</section>
```

);
}

// ═══════════════════════════════════════════════════════════
// FOOTER
// ═══════════════════════════════════════════════════════════
function Footer({ setPage }) {
return (
<footer style={{position:“relative”,zIndex:10,background:”#03050a”,borderTop:“1px solid rgba(255,255,255,.05)”,padding:“64px 24px 32px”}}>
<div style={{maxWidth:1300,margin:“0 auto”}}>
<div style={{display:“grid”,gridTemplateColumns:“2fr 1fr 1fr 1fr”,gap:48,marginBottom:48}}>

```
      <div>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:24}}>
          <div style={{width:36,height:36,background:"linear-gradient(135deg,#e85d20,#c8952a)",display:"flex",alignItems:"center",justifyContent:"center",clipPath:"polygon(0 0,calc(100% - 8px) 0,100% 8px,100% 100%,8px 100%,0 calc(100% - 8px))"}}>
            <Wrench style={{width:16,height:16,color:"#fff"}}/>
          </div>
          <div>
            <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:14,letterSpacing:2,color:"#dde0e8",textTransform:"uppercase"}}>Kom In Bilservice</div>
            <div style={{fontSize:9,fontWeight:600,letterSpacing:3,color:"#e85d20",textTransform:"uppercase",marginTop:2}}>Auktoriserad Verkstad</div>
          </div>
        </div>
        <p style={{fontSize:13,color:"rgba(221,224,232,.35)",lineHeight:1.8,maxWidth:280}}>
          Professionell bilservice i Kungsbacka. Vi tar hand om din bil med omsorg, kompetens och total ärlighet.
        </p>
        <a href={`tel:${PHONE_RAW}`} style={{display:"inline-flex",alignItems:"center",gap:8,marginTop:20,color:"#e85d20",fontSize:13,fontWeight:600,textDecoration:"none"}}>
          <Phone style={{width:14,height:14}}/> {PHONE_DISP}
        </a>
      </div>

      {[
        { title:"Tjänster", items:["Motor & Drivlina","Växellåda","Bromsar & Däck","Service & Oljebyte","El & Diagnos","AC & Klimat"] },
        { title:"Information", items:["Hur det fungerar","Boka tid","Om oss","Kontakt","Garanti"] },
        { title:"Öppettider", items:["Mån–Fre  07:30–18:00","Lördag  09:00–14:00","Söndag  Stängt","","Akut: Ring direkt"] },
      ].map(col=>(
        <div key={col.title}>
          <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:11,letterSpacing:4,color:"#e85d20",textTransform:"uppercase",marginBottom:20}}>{col.title}</div>
          <ul style={{listStyle:"none",display:"flex",flexDirection:"column",gap:10}}>
            {col.items.map(item=>(
              <li key={item} style={{fontSize:12,color:"rgba(221,224,232,.4)",fontFamily:"'DM Sans',sans-serif",whiteSpace:"pre"}}>{item}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>

    <div className="divider-line" style={{marginBottom:24}}/>

    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:16}}>
      <span style={{fontSize:11,color:"rgba(221,224,232,.2)"}}>© 2026 Kom In Bilservice. Energigatan 2 , Kungsbacka.</span>
      <button onClick={()=>setPage("admin-login")} style={{fontSize:11,color:"rgba(221,224,232,.15)",background:"none",border:"none",cursor:"pointer",textDecoration:"underline"}} data-hover>
        Admin
      </button>
    </div>
  </div>

  <style>{`@media(max-width:768px){footer div[style*="grid-template-columns:2fr"]{grid-template-columns:1fr 1fr!important}}`}</style>
</footer>
```

);
}

// ═══════════════════════════════════════════════════════════
// HOME PAGE
// ═══════════════════════════════════════════════════════════
function HomePage({ setPage }) {
return (
<div style={{position:“relative”}}>
<Hero setPage={setPage}/>
<Marquee/>
<Services setPage={setPage}/>
<Stats/>
<About setPage={setPage}/>
<Process setPage={setPage}/>
<Emergency/>
<Footer setPage={setPage}/>
</div>
);
}

// ═══════════════════════════════════════════════════════════
// BOOKING PAGE
// ═══════════════════════════════════════════════════════════
function BookingPage({ bookings, addBooking, setPage }) {
const [step,     setStep]     = useState(1);
const [category, setCategory] = useState(null);
const [selDate,  setSelDate]  = useState(null);
const [selTime,  setSelTime]  = useState(null);
const [form, setForm] = useState({ name:””,phone:””,email:””,regNumber:””,carModel:””,serviceType:””,description:”” });
const [images, setImages]   = useState([]);
const [errors, setErrors]   = useState({});
const [loading, setLoading] = useState(false);
const [done, setDone]       = useState(null);

const workDates = category ? getWorkDates(bookings, category) : [];
const slots     = selDate  ? getSlots(bookings, selDate) : [];
const svcs      = category === “major”
? [“Motorutbyte”,“Växellådsutbyte”,“Kamremsbyte”,“Turbobyte”,“Stor diagnos”,“Fjädringssystem”,“Elfelsökning”,“Annat”]
: [“Oljebyte / Service”,“Däckbyte”,“Bromsbelägg”,“Batteribyte”,“AC-påfyllning”,“Snabbdiagnos”,“Lamputbyte”,“Annat”];

const err = (k,msg) => setErrors(e=>({…e,[k]:msg}));
const clearErr = k => setErrors(e=>{const n={…e};delete n[k];return n;});

const validate = () => {
const e = {};
if (!form.name.trim())        e.name=“Namn krävs”;
if (!form.phone.trim())       e.phone=“Telefon krävs”;
if (!form.regNumber.trim())   e.regNumber=“Regnr krävs”;
if (!form.serviceType)        e.serviceType=“Välj tjänst”;
if (!form.description.trim()) e.description=“Beskriv problemet”;
return e;
};

const handleImg = e => {
Array.from(e.target.files).forEach(f=>{
const r = new FileReader();
r.onload = ev => setImages(prev=>[…prev,{name:f.name,url:ev.target.result}]);
r.readAsDataURL(f);
});
};

const submit = () => {
const e = validate();
if (Object.keys(e).length) { setErrors(e); return; }
setLoading(true);
setTimeout(()=>{
const b = { id:genId(), category, date:selDate, time:selTime, …form, status:“waiting”, notes:””, estimatedHours:null, estimatedCompletion:null, createdAt:new Date().toISOString(), images:images.map(i=>i.name) };
addBooking(b);
setDone(b);
setStep(4);
setLoading(false);
}, 1400);
};

const stepLabels = [“Välj typ”,“Datum & tid”,“Uppgifter”,“Klart”];

const S = {
page: { minHeight:“100vh”, padding:“90px 0 80px”, position:“relative”, zIndex:10, background:“rgba(5,7,10,.96)” },
wrap: { maxWidth:700, margin:“0 auto”, padding:“0 24px” },
card: { background:“rgba(14,16,20,.9)”, border:“1px solid rgba(255,255,255,.07)”, borderRadius:2, padding:“32px” },
h2:   { fontFamily:”‘Barlow Condensed’,sans-serif”, fontWeight:900, fontSize:“clamp(32px,5vw,48px)”, color:”#dde0e8”, textTransform:“uppercase”, letterSpacing:-1 },
label:{ display:“block”, fontSize:11, fontWeight:600, letterSpacing:3, color:“rgba(221,224,232,.4)”, textTransform:“uppercase”, marginBottom:8 },
};

return (
<div style={S.page}>
<div style={S.wrap}>

```
    {/* Back */}
    <button onClick={()=>step>1?setStep(step-1):setPage("home")} data-hover
      style={{display:"flex",alignItems:"center",gap:8,background:"none",border:"none",cursor:"pointer",color:"rgba(221,224,232,.4)",fontSize:13,marginBottom:32,fontFamily:"'DM Sans',sans-serif",padding:0}}
      onMouseEnter={e=>e.currentTarget.style.color="#e85d20"} onMouseLeave={e=>e.currentTarget.style.color="rgba(221,224,232,.4)"}>
      <ChevronLeft style={{width:16,height:16}}/> {step>1?"Tillbaka":"Till startsidan"}
    </button>

    {/* Title */}
    <h1 style={{...S.h2, marginBottom:4}}>BOKA TID</h1>
    <p style={{fontSize:13,color:"rgba(221,224,232,.35)",marginBottom:32}}>Steg {step} av 4 — {stepLabels[step-1]}</p>

    {/* Progress */}
    <div style={{display:"flex",gap:3,marginBottom:40}}>
      {[1,2,3,4].map(n=>(
        <div key={n} style={{flex:1,height:3,borderRadius:1,background:n<=step?"linear-gradient(90deg,#e85d20,#c8952a)":"rgba(255,255,255,.08)",transition:"background .4s"}}/>
      ))}
    </div>

    {/* ── STEP 1 ── */}
    {step===1 && (
      <div>
        <h2 style={{...S.h2,marginBottom:6}}>TYP AV TJÄNST</h2>
        <p style={{fontSize:14,color:"rgba(221,224,232,.4)",marginBottom:28}}>Välj vilken kategori som bäst passar ditt behov</p>
        <div style={{display:"flex",flexDirection:"column",gap:3}}>
          {[
            { id:"major", title:"STÖRRE REPARATIONER", sub:`Max ${MAX_MAJOR} bokningar/dag`, desc:"Motor, växellåda, kamrem, turbo, fjädring, el-felsökning och övriga komplexa arbeten.", examples:["Motorutbyte","Kamremsbyte","Turbobyte","Fjädringssystem"] },
            { id:"small", title:"SERVICE & ENKLARE REPARATIONER", sub:`Max ${MAX_SMALL} bokningar/dag`, desc:"Oljebyte, däckbyte, bromsbelägg, batteribyte, AC och snabba servicearbeten.", examples:["Oljebyte","Däckbyte","Bromsbelägg","AC-påfyllning"] },
          ].map(opt=>(
            <button key={opt.id} data-hover onClick={()=>{setCategory(opt.id);setSelDate(null);setSelTime(null);setStep(2);}}
              style={{
                textAlign:"left",padding:"28px",border:"1px solid rgba(255,255,255,.07)",
                background:"rgba(14,16,20,.9)",borderRadius:2,cursor:"pointer",
                transition:"border-color .3s,background .3s,box-shadow .3s",
              }}
              onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(232,93,32,.4)";e.currentTarget.style.background="rgba(232,93,32,.05)";}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(255,255,255,.07)";e.currentTarget.style.background="rgba(14,16,20,.9)";}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
                <div>
                  <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:900,fontSize:22,color:"#dde0e8",letterSpacing:1,marginBottom:4}}>{opt.title}</div>
                  <div style={{fontSize:11,color:"#e85d20",fontWeight:600,letterSpacing:2,textTransform:"uppercase"}}>{opt.sub}</div>
                </div>
                <ArrowRight style={{width:20,height:20,color:"rgba(232,93,32,.4)",marginTop:4}}/>
              </div>
              <p style={{fontSize:13,color:"rgba(221,224,232,.45)",lineHeight:1.7,marginBottom:16}}>{opt.desc}</p>
              <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                {opt.examples.map(ex=>(
                  <span key={ex} style={{fontSize:11,padding:"4px 10px",background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.08)",borderRadius:2,color:"rgba(221,224,232,.5)",fontFamily:"'DM Sans',sans-serif"}}>{ex}</span>
                ))}
              </div>
            </button>
          ))}
        </div>

        {/* Emergency note */}
        <div style={{marginTop:24,padding:"18px 20px",background:"rgba(232,93,32,.07)",border:"1px solid rgba(232,93,32,.2)",borderRadius:2,display:"flex",gap:12}}>
          <AlertTriangle style={{width:18,height:18,color:"#e85d20",flexShrink:0,marginTop:2}}/>
          <div>
            <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:14,color:"#e85d20",letterSpacing:1,marginBottom:4}}>AKUT ÄRENDE?</div>
            <p style={{fontSize:13,color:"rgba(221,224,232,.5)"}}>Ring Mohammad direkt på <a href={`tel:${PHONE_RAW}`} style={{color:"#e85d20",fontWeight:700,textDecoration:"none"}}>{PHONE_DISP}</a> för omedelbar hjälp.</p>
          </div>
        </div>
      </div>
    )}

    {/* ── STEP 2 ── */}
    {step===2 && (
      <div>
        <h2 style={{...S.h2,marginBottom:6}}>DATUM & TID</h2>
        <p style={{fontSize:13,color:"rgba(221,224,232,.35)",marginBottom:28}}>{category==="major"?"Större reparationer":"Service & enklare reparationer"}</p>

        {/* Dates */}
        <div style={{...S.card,marginBottom:12}}>
          <div style={S.label}>Välj datum</div>
          <div style={{display:"flex",gap:8,overflowX:"auto",paddingBottom:8}}>
            {workDates.map(d=>(
              <button key={d.date} disabled={!d.available} onClick={()=>{setSelDate(d.date);setSelTime(null);}} data-hover
                className={`date-chip ${selDate===d.date?"sel":""} ${!d.available?"full":""}`}
                style={{minWidth:68,background:"none",border:"none",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",color:"rgba(221,224,232,.7)"}}>
                <div style={{fontSize:10,fontWeight:600,letterSpacing:1,opacity:.6}}>{d.dayName}</div>
                <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:900,fontSize:24,lineHeight:1.1}}>{d.dayNum}</div>
                <div style={{fontSize:10,opacity:.6}}>{d.month}</div>
                {!d.available && <div style={{fontSize:9,color:"#f87171",fontWeight:600,marginTop:2,letterSpacing:.5}}>FULL</div>}
                {d.available  && <div style={{fontSize:9,color:"#4ade80",fontWeight:600,marginTop:2}}>{d.max-d.booked} kvar</div>}
              </button>
            ))}
          </div>
        </div>

        {/* Times */}
        {selDate && (
          <div style={{...S.card,marginBottom:20}}>
            <div style={S.label}>Välj tid — {fmtDate(selDate)}</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
              {slots.map(s=>(
                <button key={s.time} disabled={s.taken} onClick={()=>setSelTime(s.time)} data-hover
                  className={`slot ${selTime===s.time?"picked":""}`}
                  style={{background:"none",border:"none",cursor:"pointer",color:"rgba(221,224,232,.7)",fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:16,letterSpacing:1}}>
                  {s.time}
                  {s.taken && <div style={{fontSize:9,fontWeight:400,color:"rgba(221,224,232,.3)",marginTop:2,fontFamily:"'DM Sans',sans-serif"}}>Bokad</div>}
                </button>
              ))}
            </div>
          </div>
        )}

        <button disabled={!selDate||!selTime} onClick={()=>setStep(3)} data-hover
          className={!selDate||!selTime?"":"btn-fire"}
          style={{width:"100%",padding:"16px",fontSize:14,borderRadius:2,border:"none",cursor:!selDate||!selTime?"not-allowed":"pointer",background:!selDate||!selTime?"rgba(255,255,255,.06)":"",color:!selDate||!selTime?"rgba(221,224,232,.3)":"#fff",fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,letterSpacing:2,textTransform:"uppercase"}}>
          {selDate&&selTime ? `FORTSÄTT → ${selTime}, ${fmtShort(selDate)}` : "VÄLJ DATUM OCH TID"}
        </button>
      </div>
    )}

    {/* ── STEP 3 ── */}
    {step===3 && (
      <div>
        <h2 style={{...S.h2,marginBottom:6}}>DINA UPPGIFTER</h2>
        <p style={{fontSize:13,color:"rgba(221,224,232,.35)",marginBottom:28}}>{selTime}, {fmtDate(selDate)}</p>

        <div style={{...S.card,marginBottom:12,display:"flex",flexDirection:"column",gap:20}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
            <div>
              <label style={S.label}>Fullständigt namn *</label>
              <input className="field" placeholder="Anna Svensson" value={form.name}
                onChange={e=>{setForm(f=>({...f,name:e.target.value}));clearErr("name");}}/>
              {errors.name && <div style={{fontSize:11,color:"#f87171",marginTop:4}}>{errors.name}</div>}
            </div>
            <div>
              <label style={S.label}>Telefonnummer *</label>
              <input className="field" placeholder="0704002413" type="tel" value={form.phone}
                onChange={e=>{setForm(f=>({...f,phone:e.target.value}));clearErr("phone");}}/>
              {errors.phone && <div style={{fontSize:11,color:"#f87171",marginTop:4}}>{errors.phone}</div>}
            </div>
          </div>

          <div>
            <label style={S.label}>E-postadress</label>
            <input className="field" placeholder="anna@exempel.se" type="email" value={form.email}
              onChange={e=>setForm(f=>({...f,email:e.target.value}))}/>
          </div>

          <div style={{borderTop:"1px solid rgba(255,255,255,.06)",paddingTop:20}}>
            <div style={{...S.label,marginBottom:16,color:"#e85d20"}}>BILUPPGIFTER</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
              <div>
                <label style={S.label}>Registreringsnummer *</label>
                <input className="field" placeholder="ABC 123" style={{textTransform:"uppercase"}} value={form.regNumber}
                  onChange={e=>{setForm(f=>({...f,regNumber:e.target.value.toUpperCase()}));clearErr("regNumber");}}/>
                {errors.regNumber && <div style={{fontSize:11,color:"#f87171",marginTop:4}}>{errors.regNumber}</div>}
              </div>
              <div>
                <label style={S.label}>Bilmärke & modell</label>
                <input className="field" placeholder="Volvo V70 2019" value={form.carModel}
                  onChange={e=>setForm(f=>({...f,carModel:e.target.value}))}/>
              </div>
            </div>
          </div>

          <div>
            <label style={S.label}>Typ av tjänst *</label>
            <select className="field" value={form.serviceType}
              onChange={e=>{setForm(f=>({...f,serviceType:e.target.value}));clearErr("serviceType");}}>
              <option value="">Välj tjänst...</option>
              {svcs.map(s=><option key={s} value={s}>{s}</option>)}
            </select>
            {errors.serviceType && <div style={{fontSize:11,color:"#f87171",marginTop:4}}>{errors.serviceType}</div>}
          </div>

          <div>
            <label style={S.label}>Beskriv problemet *</label>
            <textarea className="field" rows={4} style={{resize:"vertical"}}
              placeholder="Beskriv vad du hör, känner eller upplever med bilen. Inga tekniska kunskaper krävs — vi förstår dig."
              value={form.description}
              onChange={e=>{setForm(f=>({...f,description:e.target.value}));clearErr("description");}}/>
            {errors.description && <div style={{fontSize:11,color:"#f87171",marginTop:4}}>{errors.description}</div>}
          </div>

          {/* Image upload */}
          <div>
            <label style={S.label}>Bifoga bilder (valfritt)</label>
            <label data-hover style={{display:"flex",flexDirection:"column",alignItems:"center",gap:10,padding:"28px",border:"1px dashed rgba(255,255,255,.1)",borderRadius:2,cursor:"pointer",transition:"border-color .3s,background .3s"}}
              onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(232,93,32,.4)";e.currentTarget.style.background="rgba(232,93,32,.04)";}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(255,255,255,.1)";e.currentTarget.style.background="transparent";}}>
              <Camera style={{width:28,height:28,color:"rgba(221,224,232,.25)"}}/>
              <span style={{fontSize:13,color:"rgba(221,224,232,.4)"}}>Klicka för att ladda upp bilder</span>
              <input type="file" multiple accept="image/*" style={{display:"none"}} onChange={handleImg}/>
            </label>
            {images.length>0 && (
              <div style={{display:"flex",flexWrap:"wrap",gap:8,marginTop:12}}>
                {images.map((img,i)=>(
                  <div key={i} style={{position:"relative"}}>
                    <img src={img.url} alt="" style={{width:64,height:64,objectFit:"cover",borderRadius:2,border:"1px solid rgba(255,255,255,.1)"}}/>
                    <button onClick={()=>setImages(p=>p.filter((_,j)=>j!==i))} style={{position:"absolute",top:-6,right:-6,width:18,height:18,borderRadius:"50%",background:"#ef4444",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff"}}>
                      <X style={{width:10,height:10}}/>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <p style={{fontSize:11,color:"rgba(221,224,232,.2)",lineHeight:1.7}}>
            Dina personuppgifter behandlas säkert i enlighet med GDPR och används enbart för att hantera din bokning.
          </p>
        </div>

        <button onClick={submit} disabled={loading} data-hover
          className="btn-fire" style={{width:"100%",padding:"18px",fontSize:15,borderRadius:2,border:"none",cursor:loading?"not-allowed":"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:10,opacity:loading?.8:1}}>
          {loading ? (<><RefreshCw style={{width:18,height:18,animation:"spinRing 1s linear infinite"}}/> SKICKAR BOKNING...</>)
                   : (<><CheckCircle style={{width:18,height:18}}/> BEKRÄFTA BOKNING</>)}
        </button>
      </div>
    )}

    {/* ── STEP 4 SUCCESS ── */}
    {step===4 && done && (
      <div style={{textAlign:"center"}}>
        <div style={{width:80,height:80,borderRadius:"50%",background:"rgba(34,197,94,.12)",border:"1px solid rgba(34,197,94,.3)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 28px"}}>
          <CheckCircle style={{width:36,height:36,color:"#4ade80"}}/>
        </div>
        <h2 style={{...S.h2,marginBottom:8}}>BOKNING SKICKAD!</h2>
        <p style={{fontSize:15,color:"rgba(221,224,232,.5)",marginBottom:36,lineHeight:1.7}}>
          Tack {done.name.split(" ")[0]}! Vi kontaktar dig på <span style={{color:"#dde0e8",fontWeight:600}}>{done.phone}</span> inom 2 timmar.
        </p>

        <div style={{...S.card,textAlign:"left",marginBottom:20}}>
          {[["Boknings-ID",done.id],["Datum & tid",`${fmtDate(done.date)} kl. ${done.time}`],["Tjänst",done.serviceType],["Fordon",done.carModel||done.regNumber],["Status","Väntar på bekräftelse"]].map(([k,v])=>(
            <div key={k} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 0",borderBottom:"1px solid rgba(255,255,255,.05)"}}>
              <span style={{fontSize:12,color:"rgba(221,224,232,.35)",fontWeight:600,letterSpacing:1,textTransform:"uppercase",fontFamily:"'Barlow Condensed',sans-serif"}}>{k}</span>
              <span style={{fontSize:14,color:"#dde0e8",fontWeight:500}}>{v}</span>
            </div>
          ))}
        </div>

        <div style={{display:"flex",gap:12}}>
          <button onClick={()=>setPage("home")} data-hover style={{flex:1,padding:"14px",fontSize:14,borderRadius:2,background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.1)",cursor:"pointer",color:"rgba(221,224,232,.7)",fontFamily:"'Barlow Condensed',sans-serif",fontWeight:600,letterSpacing:2,textTransform:"uppercase",transition:"all .2s"}}
            onMouseEnter={e=>e.currentTarget.style.borderColor="rgba(232,93,32,.4)"} onMouseLeave={e=>e.currentTarget.style.borderColor="rgba(255,255,255,.1)"}>
            ← STARTSIDAN
          </button>
          <a href={`tel:${PHONE_RAW}`} className="btn-fire" data-hover style={{flex:1,padding:"14px",fontSize:14,borderRadius:2,textDecoration:"none",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
            <Phone style={{width:16,height:16}}/> RING OSS
          </a>
        </div>
      </div>
    )}
  </div>
</div>
```

);
}

// ═══════════════════════════════════════════════════════════
// ADMIN LOGIN
// ═══════════════════════════════════════════════════════════
function AdminLogin({ onLogin, setPage }) {
const [user, setUser] = useState(””);
const [pass, setPass] = useState(””);
const [err,  setErr]  = useState(””);
const [busy, setBusy] = useState(false);

const login = () => {
if (!pass) { setErr(“Ange lösenord.”); return; }
setBusy(true);
setTimeout(()=>{
if (user===“admin” && pass===ADMIN_PASS) { onLogin(); }
else { setErr(“Fel uppgifter.”); setBusy(false); }
}, 700);
};

return (
<div style={{minHeight:“100vh”,display:“flex”,alignItems:“center”,justifyContent:“center”,position:“relative”,zIndex:10,padding:“24px”,background:“rgba(5,7,10,.95)”}}>
<div style={{width:“100%”,maxWidth:400,background:“rgba(10,12,16,.95)”,border:“1px solid rgba(255,255,255,.08)”,borderRadius:2,overflow:“hidden”}}>
<div style={{background:“linear-gradient(135deg,#0e1014,#1a0800)”,padding:“36px”,textAlign:“center”,borderBottom:“1px solid rgba(232,93,32,.2)”}}>
<div style={{width:50,height:50,background:“linear-gradient(135deg,#e85d20,#c8952a)”,margin:“0 auto 16px”,display:“flex”,alignItems:“center”,justifyContent:“center”,clipPath:“polygon(0 0,calc(100% - 10px) 0,100% 10px,100% 100%,10px 100%,0 calc(100% - 10px))”}}>
<Wrench style={{width:22,height:22,color:”#fff”}}/>
</div>
<div style={{fontFamily:”‘Barlow Condensed’,sans-serif”,fontWeight:900,fontSize:20,letterSpacing:3,color:”#dde0e8”,textTransform:“uppercase”}}>ADMIN PORTAL</div>
<div style={{fontSize:10,fontWeight:600,letterSpacing:3,color:”#e85d20”,textTransform:“uppercase”,marginTop:6}}>Kom In Bilservice</div>
</div>
<div style={{padding:“32px”,display:“flex”,flexDirection:“column”,gap:16}}>
<div>
<label style={{display:“block”,fontSize:10,fontWeight:600,letterSpacing:3,color:“rgba(221,224,232,.35)”,textTransform:“uppercase”,marginBottom:8}}>Användarnamn</label>
<input className=“field” placeholder=“admin” value={user} onChange={e=>setUser(e.target.value)} onKeyDown={e=>e.key===“Enter”&&login()}/>
</div>
<div>
<label style={{display:“block”,fontSize:10,fontWeight:600,letterSpacing:3,color:“rgba(221,224,232,.35)”,textTransform:“uppercase”,marginBottom:8}}>Lösenord</label>
<input className=“field” type=“password” placeholder=”••••••••••” value={pass} onChange={e=>setPass(e.target.value)} onKeyDown={e=>e.key===“Enter”&&login()}/>
</div>
{err && <div style={{fontSize:12,color:”#f87171”,display:“flex”,alignItems:“center”,gap:6}}><AlertTriangle style={{width:14,height:14}}/>{err}</div>}
<button onClick={login} disabled={busy} data-hover className=“btn-fire” style={{padding:“14px”,fontSize:14,borderRadius:2,width:“100%”,border:“none”,cursor:“pointer”,display:“flex”,alignItems:“center”,justifyContent:“center”,gap:8}}>
{busy?<RefreshCw style={{width:16,height:16,animation:“spinRing 1s linear infinite”}}/>:null}
{busy?“LOGGAR IN…”:“LOGGA IN”}
</button>
<button onClick={()=>setPage(“home”)} style={{background:“none”,border:“none”,color:“rgba(221,224,232,.25)”,fontSize:12,cursor:“pointer”,fontFamily:”‘DM Sans’,sans-serif”}} data-hover>
← Tillbaka till webbplatsen
</button>
<div style={{fontSize:11,color:“rgba(221,224,232,.15)”,textAlign:“center”}}>Demo: admin / Mohammad1962</div>
</div>
</div>
</div>
);
}

// ═══════════════════════════════════════════════════════════
// BOOKING MODAL (Admin)
// ═══════════════════════════════════════════════════════════
function BkModal({ b: init, onClose, onSave }) {
const [b, setB] = useState({…init});

return (
<div onClick={onClose} style={{position:“fixed”,inset:0,zIndex:500,background:“rgba(0,0,0,.75)”,backdropFilter:“blur(4px)”,display:“flex”,alignItems:“flex-start”,justifyContent:“center”,padding:“24px”,overflowY:“auto”}}>
<div onClick={e=>e.stopPropagation()} style={{width:“100%”,maxWidth:680,background:”#0a0c10”,border:“1px solid rgba(255,255,255,.08)”,borderRadius:2,marginTop:24,marginBottom:24}}>
{/* Header */}
<div style={{display:“flex”,alignItems:“center”,justifyContent:“space-between”,padding:“24px 28px”,borderBottom:“1px solid rgba(255,255,255,.06)”}}>
<div>
<div style={{fontFamily:”‘Barlow Condensed’,sans-serif”,fontWeight:900,fontSize:22,color:”#dde0e8”,textTransform:“uppercase”,letterSpacing:1}}>{b.name}</div>
<div style={{fontSize:12,color:“rgba(221,224,232,.35)”,marginTop:2}}>{b.id} · {b.regNumber} · {b.carModel}</div>
</div>
<button onClick={onClose} data-hover style={{background:“rgba(255,255,255,.05)”,border:“1px solid rgba(255,255,255,.08)”,color:“rgba(221,224,232,.6)”,width:36,height:36,borderRadius:2,cursor:“pointer”,display:“flex”,alignItems:“center”,justifyContent:“center”}}>
<X style={{width:16,height:16}}/>
</button>
</div>

```
    <div style={{padding:"24px 28px",display:"flex",flexDirection:"column",gap:20}}>
      {/* Status + hours */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
        <div>
          <label style={{display:"block",fontSize:10,fontWeight:600,letterSpacing:3,color:"rgba(221,224,232,.35)",textTransform:"uppercase",marginBottom:8}}>Status</label>
          <select className="field" value={b.status} onChange={e=>setB(p=>({...p,status:e.target.value}))}>
            {Object.entries(STATUS_CFG).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
          </select>
        </div>
        <div>
          <label style={{display:"block",fontSize:10,fontWeight:600,letterSpacing:3,color:"rgba(221,224,232,.35)",textTransform:"uppercase",marginBottom:8}}>Uppskattad tid (h)</label>
          <input type="number" min="0.5" step="0.5" className="field" value={b.estimatedHours||""} onChange={e=>setB(p=>({...p,estimatedHours:parseFloat(e.target.value)}))}/>
        </div>
      </div>

      {/* Info grid */}
      <div style={{background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.06)",borderRadius:2,padding:"16px 20px",display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        {[["Datum",fmtDate(b.date)],["Tid",b.time],["Telefon",b.phone],["E-post",b.email],["Tjänst",b.serviceType],["Typ",b.category==="major"?"Större rep.":"Service"]].map(([k,v])=>(
          <div key={k}>
            <div style={{fontSize:10,color:"rgba(221,224,232,.3)",fontWeight:600,letterSpacing:2,textTransform:"uppercase",fontFamily:"'Barlow Condensed',sans-serif",marginBottom:2}}>{k}</div>
            <div style={{fontSize:13,color:"#dde0e8",fontWeight:500}}>{v||"—"}</div>
          </div>
        ))}
      </div>

      {/* Description */}
      <div>
        <div style={{fontSize:10,color:"rgba(221,224,232,.3)",fontWeight:600,letterSpacing:2,textTransform:"uppercase",fontFamily:"'Barlow Condensed',sans-serif",marginBottom:8}}>Kundens beskrivning</div>
        <div style={{background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.06)",borderRadius:2,padding:"14px 16px",fontSize:13,color:"rgba(221,224,232,.5)",fontStyle:"italic",lineHeight:1.7}}>
          "{b.description}"
        </div>
      </div>

      {/* Notes */}
      <div>
        <label style={{display:"block",fontSize:10,fontWeight:600,letterSpacing:3,color:"rgba(221,224,232,.35)",textTransform:"uppercase",marginBottom:8}}>Interna anteckningar</label>
        <textarea className="field" rows={3} style={{resize:"vertical"}} placeholder="Anteckningar om jobbet..."
          value={b.notes} onChange={e=>setB(p=>({...p,notes:e.target.value}))}/>
      </div>

      {/* Completion date */}
      <div>
        <label style={{display:"block",fontSize:10,fontWeight:600,letterSpacing:3,color:"rgba(221,224,232,.35)",textTransform:"uppercase",marginBottom:8}}>Beräknat klardatum</label>
        <input type="date" className="field" value={b.estimatedCompletion||""} onChange={e=>setB(p=>({...p,estimatedCompletion:e.target.value}))}/>
      </div>

      {/* Actions */}
      <div style={{display:"flex",gap:10}}>
        <a href={`tel:${b.phone.replace(/[\s-]/g,"")}`} data-hover style={{flex:1,padding:"13px",borderRadius:2,border:"1px solid rgba(255,255,255,.1)",background:"rgba(255,255,255,.03)",color:"rgba(221,224,232,.7)",fontSize:13,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:600,letterSpacing:1,textTransform:"uppercase",display:"flex",alignItems:"center",justifyContent:"center",gap:8,textDecoration:"none",transition:"all .2s"}}
          onMouseEnter={e=>e.currentTarget.style.borderColor="rgba(232,93,32,.4)"} onMouseLeave={e=>e.currentTarget.style.borderColor="rgba(255,255,255,.1)"}>
          <Phone style={{width:16,height:16,color:"#e85d20"}}/> RING KUND
        </a>
        <button onClick={()=>{ onSave(b); onClose(); }} data-hover className="btn-fire" style={{flex:1,padding:"13px",borderRadius:2,border:"none",cursor:"pointer",fontSize:13,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
          <Check style={{width:16,height:16}}/> SPARA ÄNDRINGAR
        </button>
      </div>
    </div>
  </div>
</div>
```

);
}

// ═══════════════════════════════════════════════════════════
// STATUS PILL
// ═══════════════════════════════════════════════════════════
function StatusPill({ status }) {
const c = STATUS_CFG[status] || STATUS_CFG.waiting;
return (
<span style={{display:“inline-flex”,alignItems:“center”,gap:6,padding:“4px 10px”,borderRadius:2,background:c.bg,border:`1px solid ${c.border}`,color:c.text,fontSize:11,fontWeight:600,fontFamily:”‘Barlow Condensed’,sans-serif”,letterSpacing:1,textTransform:“uppercase”,whiteSpace:“nowrap”}}>
<span style={{width:5,height:5,borderRadius:“50%”,background:c.text}}/>
{c.label}
</span>
);
}

// ═══════════════════════════════════════════════════════════
// ADMIN DASHBOARD
// ═══════════════════════════════════════════════════════════
function AdminDashboard({ bookings, updateBooking, deleteBooking, onLogout, setPage }) {
const [view,   setView]   = useState(“overview”);
const [search, setSearch] = useState(””);
const [sFilt,  setSFilt]  = useState(“all”);
const [cFilt,  setCFilt]  = useState(“all”);
const [sortBy, setSortBy] = useState(“date”);
const [modal,  setModal]  = useState(null);
const [sbOpen, setSbOpen] = useState(false);

const todayMajor = bookings.filter(b=>b.date===TODAY&&b.category===“major”).length;
const todaySmall = bookings.filter(b=>b.date===TODAY&&b.category===“small”).length;
const inProg     = bookings.filter(b=>b.status===“inprogress”).length;
const wParts     = bookings.filter(b=>b.status===“waitingparts”).length;
const active     = bookings.filter(b=>![“pickedup”,“finished”].includes(b.status)).length;

const filtered = bookings.filter(b=>{
const s = search.toLowerCase();
if (s && !b.name.toLowerCase().includes(s) && !b.regNumber.toLowerCase().includes(s) && !b.phone.includes(s)) return false;
if (sFilt!==“all” && b.status!==sFilt) return false;
if (cFilt!==“all” && b.category!==cFilt) return false;
return true;
}).sort((a,b)=>{
if (sortBy===“date”)   return a.date.localeCompare(b.date)||a.time.localeCompare(b.time);
if (sortBy===“name”)   return a.name.localeCompare(b.name);
if (sortBy===“status”) return a.status.localeCompare(b.status);
return 0;
});

const calDates = […new Set(bookings.map(b=>b.date))].sort();

const SB = {
background:”#08090d”,borderRight:“1px solid rgba(255,255,255,.06)”,
width:220,flexShrink:0,display:“flex”,flexDirection:“column”,minHeight:“100vh”,
position:“fixed”,top:0,left:0,zIndex:100,transition:“transform .3s”,
};
const MAIN = { flex:1,marginLeft:220,background:”#05070a”,minHeight:“100vh” };
const CARD = { background:“rgba(10,12,16,.9)”,border:“1px solid rgba(255,255,255,.06)”,borderRadius:2,overflow:“hidden” };
const LABEL = { fontSize:10,fontWeight:600,letterSpacing:3,color:“rgba(221,224,232,.3)”,textTransform:“uppercase”,fontFamily:”‘Barlow Condensed’,sans-serif” };

const navItems = [
{ id:“overview”, label:“Översikt”,  icon:<BarChart2 style={{width:16,height:16}}/> },
{ id:“bookings”, label:“Bokningar”, icon:<FileText style={{width:16,height:16}}/>, badge:active },
{ id:“calendar”, label:“Kalender”,  icon:<Calendar style={{width:16,height:16}}/> },
];

return (
<div style={{display:“flex”,minHeight:“100vh”,fontFamily:”‘DM Sans’,sans-serif”,position:“relative”,zIndex:10}}>

```
  {/* Sidebar */}
  <aside style={{...SB, transform:sbOpen||typeof window!=="undefined"&&window.innerWidth>=768?"translateX(0)":"translateX(-100%)"}}>
    <div style={{padding:"24px 20px",borderBottom:"1px solid rgba(255,255,255,.05)"}}>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <div style={{width:32,height:32,background:"linear-gradient(135deg,#e85d20,#c8952a)",display:"flex",alignItems:"center",justifyContent:"center",clipPath:"polygon(0 0,calc(100% - 6px) 0,100% 6px,100% 100%,6px 100%,0 calc(100% - 6px))"}}>
          <Wrench style={{width:14,height:14,color:"#fff"}}/>
        </div>
        <div>
          <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:13,letterSpacing:2,color:"#dde0e8",textTransform:"uppercase"}}>Admin Panel</div>
          <div style={{fontSize:9,color:"#e85d20",fontWeight:600,letterSpacing:2,textTransform:"uppercase"}}>Kom In</div>
        </div>
      </div>
    </div>

    <nav style={{flex:1,padding:"16px 12px",display:"flex",flexDirection:"column",gap:2}}>
      {navItems.map(item=>(
        <button key={item.id} onClick={()=>{setView(item.id);setSbOpen(false);}}
          className={`admin-nav-item ${view===item.id?"active":""}`}
          style={{background:"none",border:"none",cursor:"pointer",justifyContent:"flex-start",width:"100%",textAlign:"left"}}>
          {item.icon}
          <span>{item.label}</span>
          {item.badge>0 && <span style={{marginLeft:"auto",background:"rgba(232,93,32,.25)",color:"#fb923c",fontSize:10,fontWeight:700,padding:"2px 6px",borderRadius:2}}>{item.badge}</span>}
        </button>
      ))}
    </nav>

    <div style={{padding:"12px",borderTop:"1px solid rgba(255,255,255,.05)"}}>
      <button onClick={()=>setPage("home")} className="admin-nav-item" style={{background:"none",border:"none",cursor:"pointer",width:"100%",textAlign:"left",marginBottom:4}}>
        <ArrowRight style={{width:16,height:16}}/> Webbplatsen
      </button>
      <button onClick={onLogout} className="admin-nav-item" style={{background:"none",border:"none",cursor:"pointer",width:"100%",textAlign:"left",color:"rgba(248,113,113,.6)"}}>
        <LogOut style={{width:16,height:16}}/> Logga ut
      </button>
    </div>
  </aside>

  {/* Main */}
  <div style={MAIN}>
    {/* Top bar */}
    <header style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 24px",height:64,borderBottom:"1px solid rgba(255,255,255,.05)",position:"sticky",top:0,zIndex:50,background:"rgba(5,7,10,.97)",backdropFilter:"blur(12px)"}}>
      <div style={{display:"flex",alignItems:"center",gap:16}}>
        <button onClick={()=>setSbOpen(!sbOpen)} style={{display:"none",background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.08)",color:"#dde0e8",padding:"6px 8px",borderRadius:2,cursor:"pointer"}} className="sb-toggle">
          <Menu style={{width:18,height:18}}/>
        </button>
        <div>
          <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:900,fontSize:20,color:"#dde0e8",textTransform:"uppercase",letterSpacing:1}}>
            {view==="overview"?"Översikt":view==="bookings"?"Bokningar":"Kalender"}
          </div>
          <div style={{fontSize:11,color:"rgba(221,224,232,.3)"}}>{new Date().toLocaleDateString("sv-SE",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}</div>
        </div>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:8}}>
        <div style={{background:"rgba(232,93,32,.12)",border:"1px solid rgba(232,93,32,.2)",padding:"6px 14px",borderRadius:2,fontSize:12,fontWeight:600,color:"#fb923c",display:"flex",alignItems:"center",gap:6}}>
          <span style={{width:6,height:6,borderRadius:"50%",background:"#e85d20",animation:"grain .8s steps(2) infinite"}}/>
          MOHAMMAD
        </div>
      </div>
    </header>

    <main style={{padding:"24px"}}>

      {/* ── OVERVIEW ── */}
      {view==="overview" && (
        <div style={{display:"flex",flexDirection:"column",gap:20}}>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:2}}>
            {[
              { label:"Idag / Stor",  val:todayMajor, max:MAX_MAJOR, c:"#fb923c" },
              { label:"Idag / Service",val:todaySmall, max:MAX_SMALL, c:"#4ade80" },
              { label:"Pågående jobb", val:inProg,     c:"#60a5fa" },
              { label:"Väntar delar",  val:wParts,     c:"#a78bfa" },
            ].map((s,i)=>(
              <div key={i} style={{...CARD,padding:"24px"}}>
                <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontStyle:"italic",fontWeight:900,fontSize:56,lineHeight:.9,marginBottom:10}}>
                  <span style={{color:s.c}}>{s.val}</span>
                  {s.max&&<span style={{color:"rgba(255,255,255,.15)",fontSize:28}}>/{s.max}</span>}
                </div>
                <div style={{...LABEL}}>{s.label}</div>
                {s.max&&<div style={{marginTop:12,height:2,background:"rgba(255,255,255,.06)",borderRadius:1}}><div style={{height:"100%",background:s.c,width:`${(s.val/s.max)*100}%`,borderRadius:1,transition:"width .5s"}}/></div>}
              </div>
            ))}
          </div>

          {/* Recent */}
          <div style={CARD}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"16px 20px",borderBottom:"1px solid rgba(255,255,255,.05)"}}>
              <span style={{...LABEL}}>Senaste bokningar</span>
              <button onClick={()=>setView("bookings")} style={{fontSize:11,color:"#e85d20",background:"none",border:"none",cursor:"pointer",fontWeight:600,letterSpacing:1,textTransform:"uppercase",fontFamily:"'Barlow Condensed',sans-serif"}}>VISA ALLA →</button>
            </div>
            {bookings.slice(-6).reverse().map(b=>(
              <button key={b.id} onClick={()=>setModal(b)} data-hover className="row-hover"
                style={{width:"100%",display:"flex",alignItems:"center",gap:16,padding:"14px 20px",borderBottom:"1px solid rgba(255,255,255,.03)",background:"none",border:"none",cursor:"pointer",textAlign:"left"}}>
                <div style={{width:36,height:36,background:b.category==="major"?"rgba(232,93,32,.12)":"rgba(34,197,94,.1)",border:`1px solid ${b.category==="major"?"rgba(232,93,32,.2)":"rgba(34,197,94,.2)"}`,display:"flex",alignItems:"center",justifyContent:"center",borderRadius:2,flexShrink:0,color:b.category==="major"?"#fb923c":"#4ade80"}}>
                  <Wrench style={{width:16,height:16}}/>
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:14,fontWeight:600,color:"#dde0e8",marginBottom:2}}>{b.name}</div>
                  <div style={{fontSize:11,color:"rgba(221,224,232,.35)"}}>{b.regNumber} · {b.serviceType} · {b.time}, {fmtShort(b.date)}</div>
                </div>
                <StatusPill status={b.status}/>
              </button>
            ))}
          </div>

          {/* Status breakdown */}
          <div style={{...CARD,padding:"20px"}}>
            <div style={{...LABEL,marginBottom:16}}>Status översikt</div>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {Object.entries(STATUS_CFG).map(([k,c])=>{
                const count = bookings.filter(b=>b.status===k).length;
                const pct = bookings.length>0?(count/bookings.length)*100:0;
                return (
                  <div key={k} style={{display:"flex",alignItems:"center",gap:12}}>
                    <span style={{width:6,height:6,borderRadius:"50%",background:c.text,flexShrink:0}}/>
                    <span style={{fontSize:12,flex:1,color:"rgba(221,224,232,.5)"}}>{c.label}</span>
                    <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:18,color:"#dde0e8",minWidth:24,textAlign:"right"}}>{count}</span>
                    <div style={{width:80,height:2,background:"rgba(255,255,255,.06)",borderRadius:1}}>
                      <div style={{height:"100%",background:c.text,width:`${pct}%`,borderRadius:1,transition:"width .5s",opacity:.7}}/>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── BOOKINGS ── */}
      {view==="bookings" && (
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          {/* Filters */}
          <div style={{...CARD,padding:"16px 20px",display:"flex",flexWrap:"wrap",gap:10}}>
            <div style={{position:"relative",flex:1,minWidth:200}}>
              <Search style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",width:14,height:14,color:"rgba(221,224,232,.3)"}}/>
              <input className="field" style={{paddingLeft:36}} placeholder="Sök namn, regnr, telefon..." value={search} onChange={e=>setSearch(e.target.value)}/>
            </div>
            <select className="field" style={{width:"auto",minWidth:160}} value={sFilt} onChange={e=>setSFilt(e.target.value)}>
              <option value="all">Alla statusar</option>
              {Object.entries(STATUS_CFG).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
            </select>
            <select className="field" style={{width:"auto",minWidth:140}} value={cFilt} onChange={e=>setCFilt(e.target.value)}>
              <option value="all">Alla typer</option>
              <option value="major">Större</option>
              <option value="small">Service</option>
            </select>
            <select className="field" style={{width:"auto",minWidth:140}} value={sortBy} onChange={e=>setSortBy(e.target.value)}>
              <option value="date">Datum</option>
              <option value="name">Namn</option>
              <option value="status">Status</option>
            </select>
          </div>
          <div style={{...LABEL,paddingLeft:4}}>{filtered.length} bokningar</div>

          <div style={CARD}>
            {filtered.length===0 ? (
              <div style={{textAlign:"center",padding:"60px 24px",color:"rgba(221,224,232,.3)"}}>
                <Search style={{width:32,height:32,margin:"0 auto 12px",display:"block"}}/>
                <div style={{fontSize:14}}>Inga bokningar hittades</div>
              </div>
            ) : filtered.map(b=>(
              <div key={b.id} className="row-hover" style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr 80px",gap:16,alignItems:"center",padding:"14px 20px",borderBottom:"1px solid rgba(255,255,255,.03)",cursor:"pointer"}} onClick={()=>setModal(b)}>
                <div>
                  <div style={{fontSize:14,fontWeight:600,color:"#dde0e8",marginBottom:2}}>{b.name}</div>
                  <div style={{fontSize:11,color:"rgba(221,224,232,.35)"}}>{b.regNumber} · {b.carModel}</div>
                </div>
                <div>
                  <div style={{fontSize:13,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,color:"#dde0e8"}}>{b.time}</div>
                  <div style={{fontSize:11,color:"rgba(221,224,232,.35)"}}>{fmtShort(b.date)}</div>
                </div>
                <div style={{fontSize:12,color:"rgba(221,224,232,.4)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{b.serviceType}</div>
                <StatusPill status={b.status}/>
                <div style={{display:"flex",gap:4,justifyContent:"flex-end"}} onClick={e=>e.stopPropagation()}>
                  <button onClick={()=>setModal(b)} data-hover style={{width:30,height:30,background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.08)",borderRadius:2,cursor:"pointer",color:"rgba(221,224,232,.5)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                    <Edit style={{width:13,height:13}}/>
                  </button>
                  <button onClick={()=>{ if(window.confirm("Ta bort bokning?")) deleteBooking(b.id); }} data-hover style={{width:30,height:30,background:"rgba(239,68,68,.07)",border:"1px solid rgba(239,68,68,.15)",borderRadius:2,cursor:"pointer",color:"rgba(248,113,113,.6)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                    <Trash2 style={{width:13,height:13}}/>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── CALENDAR ── */}
      {view==="calendar" && (
        <div style={{display:"flex",flexDirection:"column",gap:16}}>
          {calDates.length===0 ? <p style={{color:"rgba(221,224,232,.35)",fontSize:14}}>Inga bokningar.</p> :
            calDates.map(date=>{
              const dayBks = bookings.filter(b=>b.date===date).sort((a,b)=>a.time.localeCompare(b.time));
              const isToday = date===TODAY;
              return (
                <div key={date} style={{...CARD,border:`1px solid ${isToday?"rgba(232,93,32,.35)":"rgba(255,255,255,.06)"}`}}>
                  <div style={{padding:"14px 20px",display:"flex",alignItems:"center",gap:12,background:isToday?"rgba(232,93,32,.08)":"rgba(255,255,255,.02)",borderBottom:"1px solid rgba(255,255,255,.04)"}}>
                    <div>
                      <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:16,color:isToday?"#fb923c":"#dde0e8",textTransform:"uppercase",letterSpacing:1}}>{fmtDate(date)}</div>
                      {isToday&&<div style={{fontSize:10,color:"#e85d20",fontWeight:700,letterSpacing:3,textTransform:"uppercase"}}>IDAG</div>}
                    </div>
                    <div style={{marginLeft:"auto",display:"flex",gap:8}}>
                      <span style={{fontSize:11,background:"rgba(232,93,32,.12)",border:"1px solid rgba(232,93,32,.2)",color:"#fb923c",padding:"3px 10px",borderRadius:2,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:600,letterSpacing:1}}>{dayBks.filter(b=>b.category==="major").length}/{MAX_MAJOR} STOR</span>
                      <span style={{fontSize:11,background:"rgba(34,197,94,.1)",border:"1px solid rgba(34,197,94,.2)",color:"#4ade80",padding:"3px 10px",borderRadius:2,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:600,letterSpacing:1}}>{dayBks.filter(b=>b.category==="small").length}/{MAX_SMALL} SVC</span>
                    </div>
                  </div>
                  {dayBks.map(b=>(
                    <button key={b.id} onClick={()=>setModal(b)} className="row-hover" data-hover
                      style={{width:"100%",display:"flex",alignItems:"center",gap:16,padding:"12px 20px",borderBottom:"1px solid rgba(255,255,255,.03)",background:"none",border:"none",cursor:"pointer",textAlign:"left"}}>
                      <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:900,fontSize:16,color:"rgba(221,224,232,.5)",minWidth:44}}>{b.time}</span>
                      <span style={{width:6,height:6,borderRadius:"50%",background:b.category==="major"?"#e85d20":"#4ade80",flexShrink:0}}/>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:13,fontWeight:600,color:"#dde0e8"}}>{b.name}</div>
                        <div style={{fontSize:11,color:"rgba(221,224,232,.35)"}}>{b.serviceType} · {b.regNumber}</div>
                      </div>
                      <StatusPill status={b.status}/>
                    </button>
                  ))}
                </div>
              );
            })
          }
        </div>
      )}
    </main>
  </div>

  {/* Modal */}
  {modal && <BkModal b={modal} onClose={()=>setModal(null)} onSave={b=>{ updateBooking(b); setModal(null); }}/>}

  {/* Sidebar backdrop mobile */}
  {sbOpen && <div onClick={()=>setSbOpen(false)} style={{position:"fixed",inset:0,zIndex:99,background:"rgba(0,0,0,.6)",display:"none"}} className="sb-backdrop"/>}

  <style>{`
    @media(max-width:900px){
      div[style*="margin-left:220px"]{margin-left:0!important}
      aside[style*="width:220px"]{transform:${sbOpen?"translateX(0)":"translateX(-100%)"}!important;position:fixed!important}
      .sb-toggle{display:flex!important}
      .sb-backdrop{display:block!important}
    }
    @media(max-width:600px){
      div[style*="grid-template-columns:2fr 1fr 1fr 1fr"]{grid-template-columns:1fr 1fr!important}
    }
  `}</style>
</div>
```

);
}

// ═══════════════════════════════════════════════════════════
// APP
// ═══════════════════════════════════════════════════════════
export default function App() {
const [page,      setPage]      = useState(“home”);
const [loading,   setLoading]   = useState(true);
const [bookings,  setBookings]  = useState(()=>loadBks());
const [adminAuth, setAdminAuth] = useState(false);

useEffect(()=>{ saveBks(bookings); }, [bookings]);

const addBooking    = b  => setBookings(p=>[…p,b]);
const updateBooking = u  => setBookings(p=>p.map(b=>b.id===u.id?u:b));
const deleteBooking = id => setBookings(p=>p.filter(b=>b.id!==id));

const isAdmin = page===“admin”||page===“admin-login”;

return (
<>
<GlobalStyles/>

```
  {/* Atmosphere (always present) */}
  <ThreeBackground/>
  <SmokeOverlay/>
  <MouseSpotlight/>
  <CustomCursor/>
  <div className="vignette"/>
  <div className="scanline"/>

  {/* Loading screen */}
  {loading && <LoadingScreen onDone={()=>setLoading(false)}/>}

  {/* App */}
  <div style={{position:"relative",zIndex:10}}>
    {!isAdmin && <Navbar setPage={setPage}/>}

    {page==="home" && <HomePage setPage={setPage}/>}
    {page==="booking" && <BookingPage bookings={bookings} addBooking={addBooking} setPage={setPage}/>}
    {page==="admin-login" && <AdminLogin onLogin={()=>{setAdminAuth(true);setPage("admin");}} setPage={setPage}/>}
    {page==="admin" && adminAuth && <AdminDashboard bookings={bookings} updateBooking={updateBooking} deleteBooking={deleteBooking} onLogout={()=>{setAdminAuth(false);setPage("home");}} setPage={setPage}/>}
    {page==="admin" && !adminAuth && <AdminLogin onLogin={()=>{setAdminAuth(true);setPage("admin");}} setPage={setPage}/>}
  </div>
</>
```

);
}