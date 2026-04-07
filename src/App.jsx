import { useState, useEffect } from "react";

/* ─────────────────────────────────────────────────────────────────────────────
   DATA
───────────────────────────────────────────────────────────────────────────── */

const RANKS = [
  { name: "Novato",   short: "I",   icon: "◇", min: 0,    color: "#6b7280", glow: "#6b728040" },
  { name: "Bronce",   short: "II",  icon: "◈", min: 100,  color: "#cd7f32", glow: "#cd7f3240" },
  { name: "Plata",    short: "III", icon: "◆", min: 300,  color: "#94a3b8", glow: "#94a3b840" },
  { name: "Oro",      short: "IV",  icon: "★", min: 600,  color: "#f59e0b", glow: "#f59e0b50" },
  { name: "Platino",  short: "V",   icon: "✦", min: 1000, color: "#38bdf8", glow: "#38bdf850" },
  { name: "Élite",    short: "VI",  icon: "⬡", min: 1500, color: "#f43f5e", glow: "#f43f5e60" },
];

const ZONES = [
  { id: "pecho",   label: "Pecho",   emoji: "💪", accent: "#f43f5e", bg: "rgba(244,63,94,0.08)" },
  { id: "espalda", label: "Espalda", emoji: "🏋️", accent: "#38bdf8", bg: "rgba(56,189,248,0.08)" },
  { id: "piernas", label: "Piernas", emoji: "🦵", accent: "#4ade80", bg: "rgba(74,222,128,0.08)" },
  { id: "core",    label: "Core",    emoji: "⚡", accent: "#f59e0b", bg: "rgba(245,158,11,0.08)" },
  { id: "cardio",  label: "Cardio",  emoji: "❤️", accent: "#c084fc", bg: "rgba(192,132,252,0.08)" },
];

const EXERCISES = {
  pecho:   [
    { name: "Flexiones",           sets: 3, reps: "10", xp: 30 },
    { name: "Flexiones diamante",  sets: 3, reps: "8",  xp: 40 },
    { name: "Press banca (barra)", sets: 3, reps: "8",  xp: 60 },
    { name: "Press inclinado",     sets: 3, reps: "8",  xp: 55 },
    { name: "Flexiones arqueras",  sets: 3, reps: "6",  xp: 50 },
  ],
  espalda: [
    { name: "Dominadas (barra)",   sets: 3, reps: "6",  xp: 60 },
    { name: "Remo con barra",      sets: 3, reps: "10", xp: 55 },
    { name: "Superman",            sets: 3, reps: "12", xp: 25 },
    { name: "Remo con mochila",    sets: 3, reps: "10", xp: 35 },
  ],
  piernas: [
    { name: "Sentadillas",         sets: 4, reps: "12", xp: 35 },
    { name: "Zancadas",            sets: 3, reps: "10", xp: 35 },
    { name: "Sentadilla c/barra",  sets: 4, reps: "10", xp: 65 },
    { name: "Peso muerto rumano",  sets: 3, reps: "10", xp: 60 },
    { name: "Puente de glúteos",   sets: 3, reps: "15", xp: 30 },
    { name: "Sentadilla búlgara",  sets: 3, reps: "8",  xp: 45 },
  ],
  core:    [
    { name: "Plancha",              sets: 3, reps: "30s", xp: 30 },
    { name: "Abdominales",          sets: 3, reps: "15",  xp: 25 },
    { name: "Mountain climbers",    sets: 3, reps: "20",  xp: 35 },
    { name: "Plancha lateral",      sets: 3, reps: "20s", xp: 30 },
    { name: "Elevación de piernas", sets: 3, reps: "12",  xp: 35 },
  ],
  cardio:  [
    { name: "Saltar en sitio",  sets: 3, reps: "60s", xp: 40 },
    { name: "Jumping jacks",    sets: 3, reps: "40",  xp: 35 },
    { name: "Burpees",          sets: 3, reps: "10",  xp: 55 },
    { name: "High knees",       sets: 3, reps: "30s", xp: 40 },
    { name: "Skipping",         sets: 3, reps: "45s", xp: 40 },
  ],
};

const DAILY = [
  { day: "Lunes",     zones: ["pecho",   "cardio"],   label: "Pecho & Cardio" },
  { day: "Martes",    zones: ["piernas", "core"],     label: "Piernas & Core" },
  { day: "Miércoles", zones: ["espalda", "cardio"],   label: "Espalda & Cardio" },
  { day: "Jueves",    zones: ["pecho",   "core"],     label: "Pecho & Core" },
  { day: "Viernes",   zones: ["piernas", "espalda"],  label: "Piernas & Espalda" },
  { day: "Sábado",    zones: ["cardio",  "core"],     label: "Cardio & Core" },
  { day: "Domingo",   zones: [],                      label: "Descanso" },
];

/* ─────────────────────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────────────────────── */
const getRank     = xp => [...RANKS].reverse().find(r => xp >= r.min) ?? RANKS[0];
const getNextRank = xp => RANKS.find(r => xp < r.min) ?? null;
const xpPct       = xp => {
  const r = getRank(xp), n = getNextRank(xp);
  if (!n) return 100;
  return Math.round(((xp - r.min) / (n.min - r.min)) * 100);
};
const DEFAULT_STATE = () => ({
  xp: Object.fromEntries(ZONES.map(z => [z.id, 0])),
  streak: 0, lastDay: null, totalSessions: 0, log: [],
});

/* ─────────────────────────────────────────────────────────────────────────────
   GLOBAL STYLES
───────────────────────────────────────────────────────────────────────────── */
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');

*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}

:root {
  --bg:#07090f;
  --surface:#0c1018;
  --card:#111827;
  --border:rgba(255,255,255,0.07);
  --border2:rgba(255,255,255,0.13);
  --text:#dde4f0;
  --muted:#4b5a6e;
  --accent:#f59e0b;
}

.frpg {
  min-height:100svh; background:var(--bg);
  color:var(--text); font-family:'DM Sans',sans-serif; font-size:14px;
  max-width:430px; margin:0 auto; position:relative; overflow-x:hidden;
}

/* Subtle grid bg */
.frpg::before {
  content:''; position:fixed; inset:0; pointer-events:none; z-index:0;
  background-image:
    linear-gradient(rgba(255,255,255,0.018) 1px,transparent 1px),
    linear-gradient(90deg,rgba(255,255,255,0.018) 1px,transparent 1px);
  background-size:40px 40px;
}
.frpg>*{position:relative;z-index:1;}

.scroll-area{overflow-y:auto;padding:16px 16px 96px;height:calc(100svh - 56px);}

/* ── Topbar ── */
.topbar{
  height:56px;display:flex;align-items:center;justify-content:space-between;
  padding:0 20px;border-bottom:1px solid var(--border);
  background:rgba(7,9,15,0.9);backdrop-filter:blur(20px);
  position:sticky;top:0;z-index:10;
}
.logo{font-family:'Rajdhani',sans-serif;font-weight:700;font-size:20px;letter-spacing:4px;}
.logo span{color:var(--accent);}
.xp-pill{
  display:flex;align-items:center;gap:8px;
  background:var(--surface);border:1px solid var(--border2);
  border-radius:100px;padding:5px 14px;font-size:12px;font-weight:600;color:var(--muted);
}
.xp-pill b{color:var(--accent);}

/* ── Bottom nav ── */
.botnav{
  position:fixed;bottom:0;left:50%;transform:translateX(-50%);
  width:100%;max-width:430px;height:64px;
  background:rgba(7,9,15,0.96);backdrop-filter:blur(20px);
  border-top:1px solid var(--border);
  display:flex;align-items:center;justify-content:space-around;z-index:10;
}
.bnbtn{
  display:flex;flex-direction:column;align-items:center;gap:2px;
  background:none;border:none;cursor:pointer;color:var(--muted);
  transition:color .2s;padding:4px 20px;
}
.bnbtn.on{color:var(--accent);}
.bnbtn svg{width:20px;height:20px;stroke-width:1.8;}
.bnlbl{font-size:10px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;}
.bndot{width:4px;height:4px;border-radius:50%;background:var(--accent);opacity:0;margin:0 auto;transition:opacity .2s;}
.bnbtn.on .bndot{opacity:1;}

/* ── Hero ── */
.hero{
  border-radius:20px;padding:24px;
  border:1px solid var(--border2);background:var(--card);
  position:relative;overflow:hidden;margin-bottom:0;
}
.hero::after{
  content:'';position:absolute;top:-80px;right:-80px;
  width:220px;height:220px;border-radius:50%;
  background:radial-gradient(circle,var(--hglow) 0%,transparent 70%);
  pointer-events:none;
}
.hero-watermark{
  font-family:'Rajdhani',sans-serif;font-size:88px;font-weight:700;
  opacity:.07;position:absolute;right:8px;bottom:-16px;
  color:var(--hcolor);line-height:1;user-select:none;
}
.hero-lbl{font-size:11px;font-weight:600;letter-spacing:.15em;text-transform:uppercase;color:var(--muted);margin-bottom:6px;}
.hero-rank{font-family:'Rajdhani',sans-serif;font-size:36px;font-weight:700;letter-spacing:2px;color:var(--hcolor);line-height:1;}
.hero-sub{font-size:12px;color:var(--muted);margin-top:4px;}

/* ── XP bar ── */
.xb-track{height:4px;border-radius:4px;background:rgba(255,255,255,0.06);margin-top:14px;}
.xb-fill{height:100%;border-radius:4px;transition:width .8s cubic-bezier(.4,0,.2,1);}
.xb-meta{display:flex;justify-content:space-between;margin-top:5px;font-size:10px;color:var(--muted);}

/* ── Section title ── */
.sec{
  font-size:11px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;
  color:var(--muted);margin:22px 0 10px;
  display:flex;align-items:center;gap:8px;
}
.sec::after{content:'';flex:1;height:1px;background:var(--border);}

/* ── Today card ── */
.today{
  border-radius:16px;padding:18px 20px;
  border:1px solid rgba(245,158,11,.2);background:rgba(245,158,11,.05);
  display:flex;align-items:center;justify-content:space-between;
  cursor:pointer;transition:background .2s;
}
.today:hover{background:rgba(245,158,11,.09);}
.today-name{font-family:'Rajdhani',sans-serif;font-size:22px;font-weight:700;color:var(--accent);}
.today-sub{font-size:12px;color:var(--muted);margin-top:2px;}
.today-arrow{
  width:38px;height:38px;border-radius:50%;
  background:rgba(245,158,11,.13);border:1px solid rgba(245,158,11,.25);
  display:flex;align-items:center;justify-content:center;
  color:var(--accent);font-size:18px;flex-shrink:0;
}

/* ── Zone grid ── */
.zgrid{display:grid;grid-template-columns:1fr 1fr;gap:10px;}
.zcard{
  border-radius:16px;padding:16px;border:1px solid var(--border);
  background:var(--card);cursor:pointer;text-align:left;
  transition:transform .18s,border-color .18s;position:relative;overflow:hidden;
}
.zcard::before{content:'';position:absolute;inset:0;background:var(--zbg);pointer-events:none;}
.zcard:active{transform:scale(.97);}
.zcard:hover{border-color:var(--border2);}
.z-emoji{font-size:26px;margin-bottom:8px;display:block;}
.z-lbl{font-size:10px;font-weight:600;letter-spacing:.09em;text-transform:uppercase;color:var(--muted);margin-bottom:2px;}
.z-rank{font-family:'Rajdhani',sans-serif;font-size:17px;font-weight:700;color:var(--zacc);}
.z-bar{height:3px;background:rgba(255,255,255,.06);border-radius:3px;margin-top:8px;}
.z-bar-fill{height:100%;border-radius:3px;transition:width .6s ease;}
.z-xp{font-size:10px;color:var(--muted);margin-top:4px;}

/* ── Exercise list ── */
.exitem{
  display:flex;align-items:center;gap:12px;
  padding:14px 16px;border-radius:14px;border:1px solid var(--border);
  background:var(--card);cursor:pointer;transition:all .18s;margin-bottom:8px;
}
.exitem.done{background:rgba(74,222,128,.05);border-color:rgba(74,222,128,.22);}
.excheck{
  width:22px;height:22px;border-radius:50%;border:2px solid var(--muted);
  display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all .2s;
}
.exitem.done .excheck{background:#4ade80;border-color:#4ade80;}
.excheck-inner{width:8px;height:8px;border-radius:50%;background:white;opacity:0;transition:opacity .2s;}
.exitem.done .excheck-inner{opacity:1;}
.exname{font-weight:600;font-size:14px;transition:color .2s;}
.exitem.done .exname{color:var(--muted);text-decoration:line-through;}
.exmeta{font-size:12px;color:var(--muted);margin-top:1px;}
.exxp{margin-left:auto;font-family:'Rajdhani',sans-serif;font-weight:700;font-size:16px;color:var(--accent);}

/* ── Buttons ── */
.back{
  display:flex;align-items:center;gap:6px;background:none;border:none;
  cursor:pointer;color:var(--muted);font-size:14px;font-weight:500;
  padding:0;margin-bottom:18px;transition:color .2s;
}
.back:hover{color:var(--text);}
.save-btn{
  width:100%;padding:16px;border-radius:14px;border:none;cursor:pointer;
  font-family:'Rajdhani',sans-serif;font-size:16px;font-weight:700;letter-spacing:2px;text-transform:uppercase;
  background:linear-gradient(135deg,#f59e0b,#f97316);color:#07090f;
  box-shadow:0 0 28px rgba(245,158,11,.28);transition:opacity .2s,transform .15s;margin-top:8px;
}
.save-btn:active{transform:scale(.98);opacity:.9;}
.reset-btn{
  width:100%;padding:13px;background:none;border:1px solid rgba(239,68,68,.18);
  border-radius:12px;color:rgba(239,68,68,.5);font-size:13px;font-weight:600;
  cursor:pointer;transition:background .2s;margin-top:6px;
}
.reset-btn:hover{background:rgba(239,68,68,.07);}

/* ── Routine rows ── */
.rrow{
  display:flex;align-items:center;justify-content:space-between;
  padding:16px;border-radius:14px;border:1px solid var(--border);
  background:var(--card);cursor:pointer;margin-bottom:10px;transition:border-color .2s;
}
.rrow:hover{border-color:var(--border2);}

/* ── Stats ── */
.stat-trio{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;}
.sbox{background:var(--card);border:1px solid var(--border);border-radius:14px;padding:14px;text-align:center;}
.sval{font-family:'Rajdhani',sans-serif;font-size:28px;font-weight:700;color:var(--text);line-height:1;}
.slbl{font-size:11px;color:var(--muted);margin-top:3px;}
.szrow{background:var(--card);border:1px solid var(--border);border-radius:14px;padding:14px;margin-bottom:8px;}
.szhead{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;}
.szname{font-weight:600;display:flex;align-items:center;gap:6px;}

/* ── Log ── */
.lrow{
  display:flex;align-items:center;justify-content:space-between;
  padding:10px 14px;border-radius:12px;background:var(--surface);margin-bottom:6px;
}
.ldate{font-size:11px;color:var(--muted);}
.lzone{font-size:13px;font-weight:600;}
.lxp{font-family:'Rajdhani',sans-serif;font-weight:700;color:var(--accent);}

/* ── Week strip ── */
.wstrip{display:flex;gap:6px;}
.wday{
  flex:1;border-radius:8px;padding:8px 4px;text-align:center;
  border:1px solid var(--border);background:var(--card);
  font-size:10px;font-weight:600;color:var(--muted);
}
.wday.on{border-color:rgba(245,158,11,.4);background:rgba(245,158,11,.07);color:var(--accent);}
.wday-lbl{font-size:9px;margin-bottom:3px;text-transform:uppercase;letter-spacing:.04em;}

/* ── Rest card ── */
.rest{background:var(--card);border:1px solid var(--border);border-radius:16px;padding:28px;text-align:center;color:var(--muted);}

/* ── Toast ── */
.toast{
  position:fixed;top:68px;left:50%;transform:translateX(-50%);
  background:rgba(12,16,24,0.95);border:1px solid rgba(245,158,11,.35);
  border-radius:100px;padding:8px 20px;font-size:13px;font-weight:600;color:var(--accent);
  white-space:nowrap;z-index:50;backdrop-filter:blur(12px);
  animation:tin .3s ease;
}
@keyframes tin{from{opacity:0;transform:translate(-50%,-10px)}to{opacity:1;transform:translate(-50%,0)}}

/* ── Rank-up modal ── */
.overlay{
  position:fixed;inset:0;background:rgba(0,0,0,.85);
  display:flex;align-items:center;justify-content:center;
  z-index:100;padding:24px;backdrop-filter:blur(8px);
  animation:fin .25s ease;
}
@keyframes fin{from{opacity:0}to{opacity:1}}
.rucard{
  background:var(--card);border:1px solid rgba(245,158,11,.3);
  border-radius:24px;padding:32px 24px;text-align:center;
  max-width:300px;width:100%;
  box-shadow:0 0 60px rgba(245,158,11,.18);
  animation:sin .3s cubic-bezier(.34,1.56,.64,1);
}
@keyframes sin{from{transform:scale(.85);opacity:0}to{transform:scale(1);opacity:1}}
.ru-icon{font-size:56px;margin-bottom:12px;}
.ru-title{font-size:11px;font-weight:600;letter-spacing:.18em;text-transform:uppercase;color:var(--muted);margin-bottom:4px;}
.ru-name{font-family:'Rajdhani',sans-serif;font-size:38px;font-weight:700;letter-spacing:2px;}
.ru-btn{
  margin-top:20px;padding:12px 32px;border-radius:100px;
  background:rgba(245,158,11,.12);border:1px solid rgba(245,158,11,.35);
  color:var(--accent);font-weight:700;font-size:14px;cursor:pointer;transition:background .2s;
}
.ru-btn:hover{background:rgba(245,158,11,.22);}

.pg-title{font-family:'Rajdhani',sans-serif;font-size:28px;font-weight:700;margin-bottom:4px;}
.pg-sub{font-size:12px;color:var(--muted);margin-bottom:20px;}
`;

/* ─────────────────────────────────────────────────────────────────────────────
   COMPONENTS
───────────────────────────────────────────────────────────────────────────── */

function XPBar({ xp, color }) {
  const pct  = xpPct(xp);
  const next = getNextRank(xp);
  return (
    <>
      <div className="xb-track">
        <div className="xb-fill" style={{ width: `${pct}%`, background: color, boxShadow: `0 0 8px ${color}88` }} />
      </div>
      <div className="xb-meta">
        <span>{xp} XP</span>
        <span>{next ? `→ ${next.min} para ${next.name}` : "Rango máximo ✦"}</span>
      </div>
    </>
  );
}

function ZoneCard({ zone, xp, onClick }) {
  const rank = getRank(xp);
  const pct  = xpPct(xp);
  return (
    <button className="zcard" onClick={onClick}
      style={{ "--zbg": zone.bg, "--zacc": zone.accent }}>
      <span className="z-emoji">{zone.emoji}</span>
      <div className="z-lbl">{zone.label}</div>
      <div className="z-rank">{rank.icon} {rank.name}</div>
      <div className="z-bar">
        <div className="z-bar-fill" style={{ width: `${pct}%`, background: zone.accent, boxShadow: `0 0 6px ${zone.accent}` }} />
      </div>
      <div className="z-xp">{xp} XP</div>
    </button>
  );
}

function ExItem({ ex, done, onToggle }) {
  return (
    <div className={`exitem${done ? " done" : ""}`} onClick={onToggle}>
      <div className="excheck"><div className="excheck-inner" /></div>
      <div style={{ flex: 1 }}>
        <div className="exname">{ex.name}</div>
        <div className="exmeta">{ex.sets} series × {ex.reps}</div>
      </div>
      <div className="exxp">+{ex.xp}</div>
    </div>
  );
}

function Toast({ msg, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 2000); return () => clearTimeout(t); }, []);
  return <div className="toast">⚡ {msg}</div>;
}

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN APP
───────────────────────────────────────────────────────────────────────────── */

export default function FitnessRPG() {
  const [state, setState] = useState(() => {
    try { const s = localStorage.getItem("frpg-v3"); return s ? JSON.parse(s) : DEFAULT_STATE(); }
    catch { return DEFAULT_STATE(); }
  });
  const [view, setView]             = useState("home");
  const [activeZone, setActiveZone] = useState(null);
  const [done, setDone]             = useState([]);
  const [toast, setToast]           = useState(null);
  const [rankUp, setRankUp]         = useState(null);

  useEffect(() => {
    const el = document.createElement("style");
    el.textContent = STYLES;
    document.head.appendChild(el);
    return () => document.head.removeChild(el);
  }, []);

  useEffect(() => {
    try { localStorage.setItem("frpg-v3", JSON.stringify(state)); } catch {}
  }, [state]);

  const dayIdx    = new Date().getDay();
  const ridx      = dayIdx === 0 ? 6 : dayIdx - 1;
  const todayR    = DAILY[ridx];
  const totalXP   = Object.values(state.xp).reduce((a, b) => a + b, 0);
  const avgXP     = Math.floor(totalXP / ZONES.length);
  const gRank     = getRank(avgXP);

  function awardXP(zoneId, amount) {
    setState(prev => {
      const old = prev.xp[zoneId], nw = old + amount;
      if (getRank(nw).name !== getRank(old).name) {
        const r = getRank(nw);
        setTimeout(() => setRankUp({ zone: ZONES.find(z => z.id === zoneId).label, rank: r }), 300);
      }
      return { ...prev, xp: { ...prev.xp, [zoneId]: nw } };
    });
    setToast(`+${amount} XP`);
  }

  function toggleEx(ex, zoneId) {
    const isDone = done.includes(ex.name);
    if (isDone) {
      setDone(d => d.filter(x => x !== ex.name));
      setState(prev => ({ ...prev, xp: { ...prev.xp, [zoneId]: Math.max(0, prev.xp[zoneId] - ex.xp) } }));
    } else {
      setDone(d => [...d, ex.name]);
      awardXP(zoneId, ex.xp);
    }
  }

  function openZone(id) { setActiveZone(id); setDone([]); setView("zone"); }

  function finishZone() {
    const earned = EXERCISES[activeZone].filter(e => done.includes(e.name)).reduce((a, e) => a + e.xp, 0);
    setState(prev => ({
      ...prev,
      totalSessions: prev.totalSessions + (done.length > 0 ? 1 : 0),
      log: [...prev.log.slice(-29), {
        date: new Date().toLocaleDateString("es-CL"),
        zone: activeZone, xp: earned, exercises: done.length,
      }],
    }));
    setView("home"); setActiveZone(null); setDone([]);
  }

  function NavBtn({ v, label, d }) {
    return (
      <button className={`bnbtn${view === v ? " on" : ""}`} onClick={() => setView(v)}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
          <path d={d} />
        </svg>
        <span className="bnlbl">{label}</span>
        <div className="bndot" />
      </button>
    );
  }

  /* ── HOME ── */
  function HomeView() {
    return (
      <div>
        <div className="hero" style={{ "--hcolor": gRank.color, "--hglow": gRank.glow }}>
          <div className="hero-lbl">Rango Global</div>
          <div className="hero-rank">{gRank.icon} {gRank.name}</div>
          <div className="hero-sub">{totalXP} XP · {state.totalSessions} sesiones</div>
          <XPBar xp={avgXP} color={gRank.color} />
          <div className="hero-watermark">{gRank.short}</div>
        </div>

        <div className="sec">Hoy · {todayR.day}</div>
        {todayR.zones.length > 0 ? (
          <div className="today" onClick={() => setView("routine")}>
            <div>
              <div className="today-name">{todayR.label}</div>
              <div className="today-sub">{todayR.zones.length} zonas · toca para comenzar</div>
            </div>
            <div className="today-arrow">→</div>
          </div>
        ) : (
          <div className="rest">
            <div style={{ fontSize: 36, marginBottom: 10 }}>🛌</div>
            <div style={{ fontWeight: 600 }}>Día de descanso</div>
            <div style={{ fontSize: 12, marginTop: 4 }}>Vuelve mañana con energía</div>
          </div>
        )}

        <div className="sec">Zonas Musculares</div>
        <div className="zgrid">
          {ZONES.map(z => (
            <ZoneCard key={z.id} zone={z} xp={state.xp[z.id]} onClick={() => openZone(z.id)} />
          ))}
          <button className="zcard" onClick={() => setView("stats")}
            style={{ "--zbg": "transparent", "--zacc": "var(--muted)", display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
            <span className="z-emoji">📊</span>
            <div className="z-lbl">Ver</div>
            <div className="z-rank" style={{ color: "var(--muted)" }}>Stats</div>
          </button>
        </div>

        <div className="sec">Esta Semana</div>
        <div className="wstrip">
          {DAILY.map((r, i) => (
            <div key={r.day} className={`wday${i === ridx ? " on" : ""}`}>
              <div className="wday-lbl">{r.day.slice(0, 3)}</div>
              <div>{r.zones.length > 0 ? "●" : "—"}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ── ROUTINE ── */
  function RoutineView() {
    return (
      <div>
        <button className="back" onClick={() => setView("home")}>← Volver</button>
        <div className="pg-title">{todayR.label}</div>
        <div className="pg-sub">{todayR.day} · {todayR.zones.length} zonas</div>
        {todayR.zones.map(zid => {
          const z = ZONES.find(z => z.id === zid);
          const rank = getRank(state.xp[zid]);
          return (
            <div key={zid} className="rrow" onClick={() => openZone(zid)}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 28 }}>{z.emoji}</span>
                <div>
                  <div style={{ fontWeight: 600 }}>{z.label}</div>
                  <div style={{ fontSize: 12, color: "var(--muted)" }}>{rank.icon} {rank.name} · {state.xp[zid]} XP</div>
                </div>
              </div>
              <span style={{ color: "var(--muted)" }}>→</span>
            </div>
          );
        })}
      </div>
    );
  }

  /* ── ZONE ── */
  function ZoneView() {
    if (!activeZone) return null;
    const z      = ZONES.find(z => z.id === activeZone);
    const exs    = EXERCISES[activeZone];
    const earned = exs.filter(e => done.includes(e.name)).reduce((a, e) => a + e.xp, 0);
    const rank   = getRank(state.xp[activeZone]);
    return (
      <div>
        <button className="back" onClick={finishZone}>← Guardar y volver</button>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
          <div style={{ flex: 1, marginRight: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <span style={{ fontSize: 28 }}>{z.emoji}</span>
              <span className="pg-title" style={{ marginBottom: 0 }}>{z.label}</span>
            </div>
            <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 2 }}>{rank.icon} {rank.name} · {state.xp[activeZone]} XP</div>
            <XPBar xp={state.xp[activeZone]} color={z.accent} />
          </div>
          {earned > 0 && (
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <div style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: 30, fontWeight: 700, color: "var(--accent)", lineHeight: 1 }}>+{earned}</div>
              <div style={{ fontSize: 10, color: "var(--muted)" }}>XP hoy</div>
            </div>
          )}
        </div>
        {exs.map(ex => (
          <ExItem key={ex.name} ex={ex} done={done.includes(ex.name)} onToggle={() => toggleEx(ex, activeZone)} />
        ))}
        {done.length > 0 && (
          <button className="save-btn" onClick={finishZone}>
            Guardar Sesión — {done.length} ejercicios completados
          </button>
        )}
      </div>
    );
  }

  /* ── STATS ── */
  function StatsView() {
    return (
      <div>
        <button className="back" onClick={() => setView("home")}>← Volver</button>
        <div className="pg-title">Estadísticas</div>

        <div className="stat-trio">
          {[["XP Total", totalXP], ["Sesiones", state.totalSessions], ["Racha", `${state.streak}d`]].map(([l, v]) => (
            <div key={l} className="sbox"><div className="sval">{v}</div><div className="slbl">{l}</div></div>
          ))}
        </div>

        <div className="sec">Por Zona</div>
        {ZONES.map(z => {
          const xp = state.xp[z.id], rank = getRank(xp), pct = xpPct(xp);
          return (
            <div key={z.id} className="szrow">
              <div className="szhead">
                <div className="szname"><span>{z.emoji}</span><span>{z.label}</span></div>
                <span style={{ fontSize: 12, fontWeight: 600, color: z.accent }}>{rank.icon} {rank.name}</span>
              </div>
              <div className="xb-track">
                <div className="xb-fill" style={{ width: `${pct}%`, background: z.accent, boxShadow: `0 0 6px ${z.accent}88` }} />
              </div>
              <div className="xb-meta"><span>{xp} XP</span><span>{pct}%</span></div>
            </div>
          );
        })}

        {state.log.length > 0 && (
          <>
            <div className="sec">Historial</div>
            {[...state.log].reverse().slice(0, 10).map((l, i) => {
              const z = ZONES.find(z => z.id === l.zone);
              return (
                <div key={i} className="lrow">
                  <span className="ldate">{l.date}</span>
                  <span className="lzone">{z?.emoji} {z?.label}</span>
                  <span className="lxp">+{l.xp} XP</span>
                </div>
              );
            })}
          </>
        )}

        <div className="sec">Zona de Peligro</div>
        <button className="reset-btn" onClick={() => { if (confirm("¿Reiniciar todo el progreso?")) setState(DEFAULT_STATE()); }}>
          Reiniciar todo el progreso
        </button>
      </div>
    );
  }

  return (
    <div className="frpg">
      {toast   && <Toast msg={toast} onDone={() => setToast(null)} />}
      {rankUp  && (
        <div className="overlay" onClick={() => setRankUp(null)}>
          <div className="rucard" onClick={e => e.stopPropagation()}>
            <div className="ru-icon">{rankUp.rank.icon}</div>
            <div className="ru-title">¡Subida de Rango en {rankUp.zone}!</div>
            <div className="ru-name" style={{ color: rankUp.rank.color }}>{rankUp.rank.name}</div>
            <button className="ru-btn" onClick={() => setRankUp(null)}>Continuar</button>
          </div>
        </div>
      )}

      <div className="topbar">
        <div className="logo">FITNESS<span>RPG</span></div>
        <div className="xp-pill">⚡ <b>{totalXP}</b> XP <span style={{ margin: "0 4px", color: "var(--border2)" }}>|</span> 🔥 <b>{state.streak}</b></div>
      </div>

      <div className="scroll-area">
        {view === "home"    && <HomeView />}
        {view === "routine" && <RoutineView />}
        {view === "zone"    && <ZoneView />}
        {view === "stats"   && <StatsView />}
      </div>

      <nav className="botnav">
        <NavBtn v="home"    label="Inicio" d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10" />
        <NavBtn v="routine" label="Hoy"    d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
        <NavBtn v="stats"   label="Stats"  d="M18 20V10M12 20V4M6 20v-6" />
      </nav>
    </div>
  );
}
