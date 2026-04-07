import { useState, useEffect, useRef } from "react";

const RANKS = [
  { name: "Novato",     short: "I",    icon: "N", min: 0,    color: "#6b7280", glow: "#6b728030", next: 200  },
  { name: "Bronce",     short: "II",   icon: "B", min: 200,  color: "#b87333", glow: "#b8733330", next: 600  },
  { name: "Plata",      short: "III",  icon: "P", min: 600,  color: "#94a3b8", glow: "#94a3b830", next: 1200 },
  { name: "Oro",        short: "IV",   icon: "O", min: 1200, color: "#f59e0b", glow: "#f59e0b30", next: 2200 },
  { name: "Platino",    short: "V",    icon: "L", min: 2200, color: "#38bdf8", glow: "#38bdf830", next: 3500 },
  { name: "Diamante",   short: "VI",   icon: "D", min: 3500, color: "#c084fc", glow: "#c084fc30", next: 5000 },
  { name: "Maestro",    short: "VII",  icon: "M", min: 5000, color: "#fb923c", glow: "#fb923c30", next: 7000 },
  { name: "Gran Élite", short: "VIII", icon: "E", min: 7000, color: "#f43f5e", glow: "#f43f5e40", next: null },
];

const ZONES = [
  { id: "pecho",    label: "Pecho",    accentDark: "#f43f5e", accentLight: "#e11d48", bg: "rgba(244,63,94,0.07)"  },
  { id: "espalda",  label: "Espalda",  accentDark: "#38bdf8", accentLight: "#0284c7", bg: "rgba(56,189,248,0.07)" },
  { id: "piernas",  label: "Piernas",  accentDark: "#4ade80", accentLight: "#16a34a", bg: "rgba(74,222,128,0.07)" },
  { id: "core",     label: "Core",     accentDark: "#f59e0b", accentLight: "#d97706", bg: "rgba(245,158,11,0.07)" },
  { id: "cardio",   label: "Cardio",   accentDark: "#c084fc", accentLight: "#7c3aed", bg: "rgba(192,132,252,0.07)"},
  { id: "hombros",  label: "Hombros",  accentDark: "#fb923c", accentLight: "#ea580c", bg: "rgba(251,146,60,0.07)" },
];

const EXERCISES = {
  pecho: [
    { name: "Flexiones",            sets: 3, reps: "12",  xp: 18, level: 1, muscle: "Pectoral Mayor" },
    { name: "Flexiones diamante",   sets: 3, reps: "10",  xp: 22, level: 2, muscle: "Pectoral / Tríceps" },
    { name: "Flexiones arqueras",   sets: 3, reps: "8",   xp: 28, level: 3, muscle: "Pectoral Unilateral" },
    { name: "Press banca barra",    sets: 4, reps: "8",   xp: 35, level: 2, muscle: "Pectoral / Deltoides" },
    { name: "Press inclinado",      sets: 3, reps: "10",  xp: 30, level: 2, muscle: "Pectoral Superior" },
    { name: "Aperturas mancuernas", sets: 3, reps: "12",  xp: 22, level: 2, muscle: "Pectoral" },
    { name: "Fondos en paralelas",  sets: 3, reps: "10",  xp: 32, level: 3, muscle: "Pectoral / Tríceps" },
  ],
  espalda: [
    { name: "Remo con mochila",     sets: 3, reps: "12",  xp: 20, level: 1, muscle: "Dorsal Ancho" },
    { name: "Superman",             sets: 3, reps: "15",  xp: 12, level: 1, muscle: "Erector Espinal" },
    { name: "Dominadas asistidas",  sets: 3, reps: "8",   xp: 28, level: 2, muscle: "Dorsal Ancho" },
    { name: "Dominadas barra",      sets: 4, reps: "6",   xp: 42, level: 3, muscle: "Dorsal / Bíceps" },
    { name: "Remo con barra",       sets: 4, reps: "10",  xp: 35, level: 2, muscle: "Dorsal / Romboides" },
    { name: "Jalón al pecho",       sets: 3, reps: "12",  xp: 28, level: 2, muscle: "Dorsal Ancho" },
    { name: "Peso muerto",          sets: 4, reps: "6",   xp: 48, level: 3, muscle: "Cadena Posterior" },
  ],
  piernas: [
    { name: "Sentadillas",          sets: 4, reps: "12",  xp: 22, level: 1, muscle: "Cuádriceps" },
    { name: "Zancadas",             sets: 3, reps: "10",  xp: 20, level: 1, muscle: "Cuádriceps / Glúteos" },
    { name: "Puente de glúteos",    sets: 3, reps: "15",  xp: 15, level: 1, muscle: "Glúteos" },
    { name: "Sentadilla c/barra",   sets: 4, reps: "10",  xp: 40, level: 2, muscle: "Cuádriceps / Glúteos" },
    { name: "Peso muerto rumano",   sets: 4, reps: "10",  xp: 38, level: 2, muscle: "Isquiotibiales" },
    { name: "Sentadilla búlgara",   sets: 3, reps: "10",  xp: 35, level: 3, muscle: "Cuádriceps Unilateral" },
    { name: "Hip thrust barra",     sets: 4, reps: "10",  xp: 42, level: 3, muscle: "Glúteos Mayor" },
    { name: "Prensa de piernas",    sets: 4, reps: "12",  xp: 30, level: 2, muscle: "Cuádriceps" },
  ],
  core: [
    { name: "Plancha",              sets: 3, reps: "30s", xp: 15, level: 1, muscle: "Core Estabilizador" },
    { name: "Abdominales",          sets: 3, reps: "20",  xp: 12, level: 1, muscle: "Recto Abdominal" },
    { name: "Plancha lateral",      sets: 3, reps: "25s", xp: 18, level: 2, muscle: "Oblicuos" },
    { name: "Mountain climbers",    sets: 3, reps: "20",  xp: 20, level: 1, muscle: "Core / Cardio" },
    { name: "Elevación de piernas", sets: 3, reps: "15",  xp: 22, level: 2, muscle: "Recto Inferior" },
    { name: "Rueda abdominal",      sets: 3, reps: "10",  xp: 30, level: 3, muscle: "Core Completo" },
    { name: "Dragon flag",          sets: 3, reps: "6",   xp: 45, level: 4, muscle: "Core Avanzado" },
    { name: "Hollow body",          sets: 3, reps: "20s", xp: 28, level: 3, muscle: "Core Estabilizador" },
  ],
  cardio: [
    { name: "Jumping jacks",        sets: 3, reps: "40",  xp: 15, level: 1, muscle: "Cardio Total" },
    { name: "Saltar en sitio",      sets: 3, reps: "60s", xp: 18, level: 1, muscle: "Cardiovascular" },
    { name: "High knees",           sets: 3, reps: "30s", xp: 20, level: 1, muscle: "Cardio / Piernas" },
    { name: "Burpees",              sets: 4, reps: "10",  xp: 32, level: 2, muscle: "Full Body / Cardio" },
    { name: "Skipping",             sets: 3, reps: "45s", xp: 22, level: 1, muscle: "Coordinación / Cardio" },
    { name: "Sprint 30m",           sets: 6, reps: "×1",  xp: 28, level: 2, muscle: "Velocidad" },
    { name: "Box jumps",            sets: 4, reps: "8",   xp: 35, level: 3, muscle: "Potencia / Cardio" },
    { name: "Battle ropes",         sets: 4, reps: "30s", xp: 30, level: 2, muscle: "Full Body" },
  ],
  hombros: [
    { name: "Press militar",        sets: 4, reps: "10",  xp: 30, level: 2, muscle: "Deltoides Anterior" },
    { name: "Elevaciones laterales",sets: 3, reps: "15",  xp: 20, level: 1, muscle: "Deltoides Lateral" },
    { name: "Elevaciones frontales",sets: 3, reps: "12",  xp: 18, level: 1, muscle: "Deltoides Anterior" },
    { name: "Face pulls",           sets: 3, reps: "15",  xp: 22, level: 2, muscle: "Deltoides Posterior" },
    { name: "Arnold press",         sets: 4, reps: "10",  xp: 32, level: 2, muscle: "Deltoides 360°" },
    { name: "Remo al mentón",       sets: 3, reps: "12",  xp: 25, level: 2, muscle: "Deltoides / Trapecios" },
  ],
};

const DAILY = [
  { day: "Lunes",     zones: ["pecho",   "hombros"],  label: "Push — Pecho & Hombros",   type: "push"  },
  { day: "Martes",    zones: ["piernas", "cardio"],   label: "Piernas & Cardio",           type: "legs"  },
  { day: "Miércoles", zones: ["espalda", "core"],     label: "Pull — Espalda & Core",      type: "pull"  },
  { day: "Jueves",    zones: ["cardio",  "core"],     label: "Cardio & Core",              type: "cardio"},
  { day: "Viernes",   zones: ["pecho",   "espalda"],  label: "Push + Pull Intensivo",      type: "full"  },
  { day: "Sábado",    zones: ["piernas", "hombros"],  label: "Piernas & Hombros",          type: "legs"  },
  { day: "Domingo",   zones: [],                      label: "Descanso Activo",            type: "rest"  },
];

const getRank     = xp => [...RANKS].reverse().find(r => xp >= r.min) ?? RANKS[0];
const getNextRank = xp => RANKS.find(r => r.min > xp) ?? null;
const xpPct       = xp => {
  const r = getRank(xp), n = getNextRank(xp);
  if (!n) return 100;
  return Math.round(((xp - r.min) / (n.min - r.min)) * 100);
};
const DEFAULT_STATE = () => ({
  xp: Object.fromEntries(ZONES.map(z => [z.id, 0])),
  streak: 0, lastTrainedDate: null, totalSessions: 0,
  log: [], achievements: [], weeklyGoal: 4, weekSessions: 0,
  weekStart: null, personalBests: {},
});

const ACHIEVEMENTS = [
  { id: "first_session",   name: "Primer Paso",       desc: "Completa tu primera sesión",         icon: "star",    cond: s => s.totalSessions >= 1 },
  { id: "week_streak",     name: "Semana Perfecta",   desc: "Entrena 7 días seguidos",             icon: "flame",   cond: s => s.streak >= 7 },
  { id: "iron_body",       name: "Cuerpo de Hierro",  desc: "Alcanza Bronce en 3 zonas",          icon: "shield",  cond: s => Object.values(s.xp).filter(x => x >= 200).length >= 3 },
  { id: "centurion",       name: "Centurión",         desc: "Acumula 1,000 XP en total",          icon: "trophy",  cond: s => Object.values(s.xp).reduce((a,b)=>a+b,0) >= 1000 },
  { id: "gold_zone",       name: "Zona Dorada",       desc: "Llega a Oro en cualquier zona",      icon: "star",    cond: s => Object.values(s.xp).some(x => x >= 1200) },
  { id: "sessions_10",     name: "Veterano",          desc: "Completa 10 sesiones",               icon: "swords",  cond: s => s.totalSessions >= 10 },
  { id: "sessions_25",     name: "Guerrero",          desc: "Completa 25 sesiones",               icon: "swords",  cond: s => s.totalSessions >= 25 },
  { id: "all_zones",       name: "Completo",          desc: "Entrena todas las zonas",            icon: "muscle",  cond: s => Object.values(s.xp).every(x => x > 0) },
  { id: "platinum_any",    name: "Élite Emergente",   desc: "Llega a Platino en cualquier zona",  icon: "trophy",  cond: s => Object.values(s.xp).some(x => x >= 2200) },
];

const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;600;700&family=Inter:wght@300;400;500;600&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
:root{
  --bg:#060810;--surface:#0a0d15;--card:#0f1420;--card2:#131827;
  --border:rgba(255,255,255,0.06);--border2:rgba(255,255,255,0.11);--border3:rgba(255,255,255,0.18);
  --text:#cdd6f0;--muted:#4a5568;--muted2:#6b7a8d;
  --accent:#f59e0b;--accent2:#f97316;--red:#f43f5e;--blue:#38bdf8;--green:#4ade80;--purple:#c084fc;
}
.frpg{min-height:100svh;background:var(--bg);color:var(--text);font-family:'Inter',sans-serif;font-size:14px;max-width:430px;margin:0 auto;position:relative;overflow-x:hidden;}
.frpg::before{content:'';position:fixed;inset:0;pointer-events:none;z-index:0;background-image:repeating-linear-gradient(-45deg,rgba(255,255,255,0.012) 0px,rgba(255,255,255,0.012) 1px,transparent 1px,transparent 8px);}
.frpg>*{position:relative;z-index:1;}
.scroll-area{overflow-y:auto;padding:16px 16px 88px;height:calc(100svh - 52px);}
.topbar{height:52px;display:flex;align-items:center;justify-content:space-between;padding:0 18px;border-bottom:1px solid var(--border);background:rgba(6,8,16,0.93);backdrop-filter:blur(24px);position:sticky;top:0;z-index:10;}
.logo{font-family:'Rajdhani',sans-serif;font-weight:700;font-size:18px;letter-spacing:5px;color:#e2e8f0;}
.logo span{color:var(--accent);}
.tp-right{display:flex;align-items:center;gap:10px;}
.xp-pill{display:flex;align-items:center;gap:6px;background:rgba(245,158,11,0.08);border:1px solid rgba(245,158,11,0.2);border-radius:100px;padding:4px 12px;font-size:11px;font-weight:600;color:var(--muted2);}
.xp-pill b{color:var(--accent);font-size:12px;}
.streak-pill{display:flex;align-items:center;gap:5px;background:rgba(249,115,22,0.08);border:1px solid rgba(249,115,22,0.2);border-radius:100px;padding:4px 10px;font-size:11px;font-weight:600;}
.streak-num{color:#fb923c;font-size:13px;font-weight:700;font-family:'Rajdhani',sans-serif;}
.botnav{position:fixed;bottom:0;left:50%;transform:translateX(-50%);width:100%;max-width:430px;height:60px;background:rgba(6,8,16,0.96);backdrop-filter:blur(24px);border-top:1px solid var(--border);display:flex;align-items:center;justify-content:space-around;z-index:10;}
.bnbtn{display:flex;flex-direction:column;align-items:center;gap:2px;background:none;border:none;cursor:pointer;color:var(--muted);transition:color .2s;padding:4px 18px;}
.bnbtn.on{color:var(--accent);}
.bnlbl{font-size:9px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;margin-top:1px;}
.hero{border-radius:18px;padding:22px 24px;border:1px solid var(--border2);background:var(--card);position:relative;overflow:hidden;}
.hero-scan{position:absolute;top:0;left:-100%;width:60%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.03),transparent);animation:scan 4s ease-in-out infinite;pointer-events:none;}
@keyframes scan{0%,100%{left:-60%}50%{left:120%}}
.hero-corner{position:absolute;top:12px;right:12px;font-family:'Rajdhani',sans-serif;font-size:72px;font-weight:700;line-height:1;user-select:none;opacity:0.05;color:var(--hcolor);}
.hero-lbl{font-size:10px;font-weight:600;letter-spacing:.18em;text-transform:uppercase;color:var(--muted2);margin-bottom:5px;}
.hero-rank{font-family:'Rajdhani',sans-serif;font-size:34px;font-weight:700;letter-spacing:3px;line-height:1;}
.hero-stats{display:flex;gap:18px;margin-top:8px;font-size:11px;color:var(--muted2);}
.hero-stat b{color:var(--text);font-weight:600;}
.xb-track{height:3px;border-radius:3px;background:rgba(255,255,255,.05);margin-top:14px;position:relative;overflow:hidden;}
.xb-fill{height:100%;border-radius:3px;transition:width .9s cubic-bezier(.4,0,.2,1);position:relative;}
.xb-fill::after{content:'';position:absolute;top:0;right:0;bottom:0;width:20px;background:rgba(255,255,255,0.4);filter:blur(4px);}
.xb-meta{display:flex;justify-content:space-between;margin-top:5px;font-size:10px;color:var(--muted);}
.sec{font-size:10px;font-weight:600;letter-spacing:.15em;text-transform:uppercase;color:var(--muted);margin:20px 0 10px;display:flex;align-items:center;gap:8px;}
.sec::after{content:'';flex:1;height:1px;background:var(--border);}
.today{border-radius:16px;padding:0;overflow:hidden;border:1px solid rgba(245,158,11,.18);cursor:pointer;transition:border-color .2s;}
.today:hover{border-color:rgba(245,158,11,.35);}
.today-header{padding:16px 20px;background:linear-gradient(135deg,rgba(245,158,11,0.07),rgba(249,115,22,0.05));display:flex;align-items:center;justify-content:space-between;}
.today-name{font-family:'Rajdhani',sans-serif;font-size:20px;font-weight:700;color:var(--accent);}
.today-sub{font-size:11px;color:var(--muted2);margin-top:2px;}
.today-arrow{width:36px;height:36px;border-radius:50%;background:rgba(245,158,11,.12);border:1px solid rgba(245,158,11,.25);display:flex;align-items:center;justify-content:center;color:var(--accent);flex-shrink:0;}
.today-zones{display:flex;padding:10px 16px;gap:8px;border-top:1px solid rgba(245,158,11,.1);background:rgba(245,158,11,.03);}
.today-zone-badge{padding:4px 12px;border-radius:100px;font-size:11px;font-weight:600;background:rgba(255,255,255,0.05);border:1px solid var(--border2);color:var(--muted2);}
.wstrip{display:flex;gap:5px;}
.wday{flex:1;border-radius:10px;padding:8px 4px;text-align:center;border:1px solid var(--border);background:var(--card);font-size:10px;font-weight:600;color:var(--muted);}
.wday.on{border-color:rgba(245,158,11,.35);background:rgba(245,158,11,.06);color:var(--accent);}
.wday.rest{border-color:var(--border);color:var(--muted);opacity:0.5;}
.wday.done{border-color:rgba(74,222,128,.3);background:rgba(74,222,128,.05);color:#4ade80;}
.wday-lbl{font-size:9px;margin-bottom:4px;text-transform:uppercase;letter-spacing:.04em;opacity:.7;}
.wday-dot{width:5px;height:5px;border-radius:50%;background:currentColor;margin:2px auto 0;opacity:0.7;}
.zgrid{display:grid;grid-template-columns:1fr 1fr;gap:8px;}
.zcard{border-radius:16px;padding:14px 14px 12px;border:1px solid var(--border);background:var(--card);cursor:pointer;text-align:left;transition:transform .18s,border-color .2s,background .2s;position:relative;overflow:hidden;}
.zcard::before{content:'';position:absolute;inset:0;background:var(--zbg);pointer-events:none;}
.zcard:hover{border-color:var(--border2);transform:translateY(-1px);}
.zcard:active{transform:scale(.97);}
.z-top{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:10px;}
.z-lbl{font-size:10px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--muted2);margin-bottom:2px;}
.z-rank{font-family:'Rajdhani',sans-serif;font-size:15px;font-weight:700;color:var(--zacc);}
.z-bar{height:2px;background:rgba(255,255,255,.05);border-radius:2px;margin-top:8px;}
.z-bar-fill{height:100%;border-radius:2px;transition:width .7s ease;}
.z-xp{font-size:10px;color:var(--muted);margin-top:4px;}
.exitem{display:flex;align-items:center;gap:12px;padding:13px 16px;border-radius:12px;border:1px solid var(--border);background:var(--card);cursor:pointer;transition:all .18s;margin-bottom:6px;}
.exitem:hover{border-color:var(--border2);background:var(--card2);}
.exitem.done{background:rgba(74,222,128,.04);border-color:rgba(74,222,128,.2);}
.excheck{width:22px;height:22px;border-radius:50%;border:1.5px solid var(--muted);display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all .2s;}
.exitem.done .excheck{background:#4ade80;border-color:#4ade80;}
.exname{font-weight:500;font-size:14px;color:var(--text);}
.exitem.done .exname{color:var(--muted);text-decoration:line-through;}
.exmeta{font-size:11px;color:var(--muted);margin-top:2px;}
.ex-muscle{font-size:10px;color:var(--muted2);margin-top:1px;font-style:italic;}
.exxp{margin-left:auto;font-family:'Rajdhani',sans-serif;font-weight:700;font-size:15px;color:var(--accent);flex-shrink:0;}
.ex-level{font-size:9px;font-weight:700;letter-spacing:.06em;padding:2px 6px;border-radius:4px;text-transform:uppercase;flex-shrink:0;}
.ex-level.l1{background:rgba(74,222,128,.1);color:#4ade80;border:1px solid rgba(74,222,128,.2);}
.ex-level.l2{background:rgba(245,158,11,.1);color:#f59e0b;border:1px solid rgba(245,158,11,.2);}
.ex-level.l3{background:rgba(248,113,113,.1);color:#f87171;border:1px solid rgba(248,113,113,.2);}
.ex-level.l4{background:rgba(192,132,252,.1);color:#c084fc;border:1px solid rgba(192,132,252,.2);}

/* Zone section in day view - collapsible header */
.zone-section-hdr{
  display:flex;align-items:center;justify-content:space-between;
  padding:12px 16px;border-radius:12px;border:1px solid var(--border);
  background:var(--card2);cursor:pointer;margin-bottom:6px;transition:border-color .2s;
}
.zone-section-hdr.open{border-color:var(--border2);border-radius:12px 12px 0 0;margin-bottom:0;}
.zone-section-body{border:1px solid var(--border2);border-top:none;border-radius:0 0 12px 12px;padding:8px 8px;margin-bottom:8px;background:rgba(255,255,255,.01);}

.back{display:flex;align-items:center;gap:6px;background:none;border:none;cursor:pointer;color:var(--muted2);font-size:13px;font-weight:500;padding:0;margin-bottom:18px;transition:color .2s;}
.back:hover{color:var(--text);}
.save-btn{width:100%;padding:15px;border-radius:13px;border:none;cursor:pointer;font-family:'Rajdhani',sans-serif;font-size:15px;font-weight:700;letter-spacing:2px;text-transform:uppercase;background:linear-gradient(135deg,#f59e0b,#f97316);color:#07090f;transition:opacity .2s,transform .15s;margin-top:8px;}
.save-btn:active{transform:scale(.98);opacity:.9;}
.save-btn:disabled{opacity:.4;cursor:not-allowed;}
.reset-btn{width:100%;padding:12px;background:none;border:1px solid rgba(239,68,68,.15);border-radius:11px;color:rgba(239,68,68,.45);font-size:12px;font-weight:600;cursor:pointer;transition:background .2s;margin-top:6px;}
.reset-btn:hover{background:rgba(239,68,68,.06);}
.rrow{display:flex;align-items:center;justify-content:space-between;padding:14px 16px;border-radius:13px;border:1px solid var(--border);background:var(--card);cursor:pointer;margin-bottom:8px;transition:all .2s;}
.rrow:hover{border-color:var(--border2);background:var(--card2);}
.rrow.rest-row{opacity:.5;cursor:default;}
.rrow-type{font-size:9px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;padding:3px 8px;border-radius:5px;}
.type-push{background:rgba(244,63,94,.1);color:#f43f5e;border:1px solid rgba(244,63,94,.2);}
.type-pull{background:rgba(56,189,248,.1);color:#38bdf8;border:1px solid rgba(56,189,248,.2);}
.type-legs{background:rgba(74,222,128,.1);color:#4ade80;border:1px solid rgba(74,222,128,.2);}
.type-cardio{background:rgba(192,132,252,.1);color:#c084fc;border:1px solid rgba(192,132,252,.2);}
.type-full{background:rgba(245,158,11,.1);color:#f59e0b;border:1px solid rgba(245,158,11,.2);}
.type-rest{background:rgba(107,114,128,.1);color:#6b7280;border:1px solid rgba(107,114,128,.2);}
.stat-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;}
.sbox{background:var(--card);border:1px solid var(--border);border-radius:13px;padding:14px 12px;text-align:center;}
.sval{font-family:'Rajdhani',sans-serif;font-size:26px;font-weight:700;color:var(--text);line-height:1;}
.slbl{font-size:10px;color:var(--muted);margin-top:3px;text-transform:uppercase;letter-spacing:.05em;}
.szrow{background:var(--card);border:1px solid var(--border);border-radius:13px;padding:14px;margin-bottom:8px;}
.szhead{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;}
.lrow{display:flex;align-items:center;justify-content:space-between;padding:9px 13px;border-radius:11px;background:var(--card);margin-bottom:5px;border:1px solid var(--border);}
.ldate{font-size:10px;color:var(--muted);}
.lzone{font-size:12px;font-weight:500;}
.lxp{font-family:'Rajdhani',sans-serif;font-weight:700;color:var(--accent);font-size:14px;}
.ach-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;}
.ach-card{border-radius:13px;padding:13px;border:1px solid var(--border);background:var(--card);}
.ach-card.earned{border-color:rgba(245,158,11,.3);background:rgba(245,158,11,.04);}
.ach-card.locked{opacity:.45;}
.ach-icon{width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;margin-bottom:8px;}
.ach-icon.earned{background:rgba(245,158,11,.15);border:1px solid rgba(245,158,11,.3);color:var(--accent);}
.ach-icon.locked{background:rgba(255,255,255,.04);border:1px solid var(--border);color:var(--muted);}
.ach-name{font-size:12px;font-weight:600;margin-bottom:2px;}
.ach-desc{font-size:10px;color:var(--muted);line-height:1.4;}
.rest-card{background:var(--card);border:1px solid var(--border);border-radius:16px;padding:28px;text-align:center;color:var(--muted);}
.toast{position:fixed;top:62px;left:50%;transform:translateX(-50%);background:rgba(10,13,21,0.95);border:1px solid rgba(245,158,11,.3);border-radius:100px;padding:8px 20px;font-size:12px;font-weight:600;color:var(--accent);white-space:nowrap;z-index:50;backdrop-filter:blur(16px);animation:tin .3s ease;}
@keyframes tin{from{opacity:0;transform:translate(-50%,-12px)}to{opacity:1;transform:translate(-50%,0)}}
.overlay{position:fixed;inset:0;background:rgba(0,0,0,.88);display:flex;align-items:center;justify-content:center;z-index:100;padding:24px;backdrop-filter:blur(12px);animation:fin .22s ease;}
@keyframes fin{from{opacity:0}to{opacity:1}}
.rucard{background:var(--card);border:1px solid rgba(245,158,11,.25);border-radius:22px;padding:32px 24px;text-align:center;max-width:290px;width:100%;animation:sin .32s cubic-bezier(.34,1.56,.64,1);}
@keyframes sin{from{transform:scale(.82);opacity:0}to{transform:scale(1);opacity:1}}
.ru-badge{display:flex;justify-content:center;margin-bottom:16px;}
.ru-title{font-size:10px;font-weight:600;letter-spacing:.18em;text-transform:uppercase;color:var(--muted2);margin-bottom:4px;}
.ru-name{font-family:'Rajdhani',sans-serif;font-size:36px;font-weight:700;letter-spacing:3px;}
.ru-zone{font-size:12px;color:var(--muted2);margin-top:6px;}
.ru-btn{margin-top:20px;padding:11px 28px;border-radius:100px;background:rgba(245,158,11,.1);border:1px solid rgba(245,158,11,.3);color:var(--accent);font-weight:700;font-size:13px;cursor:pointer;}
.ach-toast{position:fixed;top:62px;left:50%;transform:translateX(-50%);background:rgba(10,13,21,0.97);border:1px solid rgba(245,158,11,.35);border-radius:14px;padding:10px 16px;z-index:51;backdrop-filter:blur(16px);animation:tin .3s ease;display:flex;align-items:center;gap:10px;min-width:220px;}
.ach-toast-icon{width:28px;height:28px;border-radius:50%;background:rgba(245,158,11,.15);border:1px solid rgba(245,158,11,.3);display:flex;align-items:center;justify-content:center;color:var(--accent);flex-shrink:0;}
.ach-toast-title{font-size:11px;font-weight:700;color:var(--accent);}
.ach-toast-desc{font-size:10px;color:var(--muted2);}
.pg-title{font-family:'Rajdhani',sans-serif;font-size:26px;font-weight:700;margin-bottom:3px;}
.pg-sub{font-size:11px;color:var(--muted2);margin-bottom:18px;}
.goal-bar{background:var(--card);border:1px solid var(--border);border-radius:13px;padding:14px 16px;}
.goal-track{height:6px;border-radius:6px;background:rgba(255,255,255,.05);margin-top:8px;overflow:hidden;}
.goal-fill{height:100%;border-radius:6px;background:linear-gradient(90deg,#f59e0b,#f97316);transition:width .7s ease;}
.goal-meta{display:flex;justify-content:space-between;margin-top:5px;font-size:10px;color:var(--muted);}
.goal-meta b{color:var(--text);}

/* Day summary bar in day view */
.day-summary{
  display:flex;align-items:center;justify-content:space-between;
  background:var(--card);border:1px solid var(--border2);border-radius:13px;
  padding:14px 16px;margin-bottom:16px;
}
.day-xp-counter{text-align:right;}
.day-xp-val{font-family:'Rajdhani',sans-serif;font-size:28px;font-weight:700;color:var(--accent);line-height:1;}
.day-xp-lbl{font-size:10px;color:var(--muted);}
`;

const Icon = ({ name, size = 20, color = "currentColor", strokeWidth = 1.7 }) => {
  const paths = {
    home:    "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10",
    list:    "M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01",
    chart:   "M18 20V10M12 20V4M6 20v-6",
    trophy:  "M6 9H3.5a2.5 2.5 0 0 1 0-5H6M18 9h2.5a2.5 2.5 0 0 1 0 5H18M12 17v4m-4 0h8M8 9v5a4 4 0 0 0 8 0V9",
    zap:     "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
    flame:   "M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z",
    star:    "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
    muscle:  "M6.5 6.5c2-2 5.5-2 5.5 2v7c0 3-2 4.5-5.5 4.5S2 18.5 2 16V9C2 7.5 3 6 5 6M17.5 6.5c-2-2-5.5-2-5.5 2M12 6v6M17.5 6.5C19.5 8 22 9.5 22 12v2c0 2.5-2 4-4.5 4S13 16.5 13 14V8.5",
    heart:   "M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z",
    shield:  "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
    swords:  "M14.5 17.5L3 6V3h3l11.5 11.5M13 19l2-2M3 21l3.5-3.5M21 3L3 21",
    run:     "M13 4a1 1 0 1 0 2 0 1 1 0 0 0-2 0M5.2 19L8 14.5l3 2 4.5-9L19 19M8 14.5l2-5",
    dumbbell:"M6.5 6.5h.01M17.5 6.5h.01M6.5 17.5h.01M17.5 17.5h.01M2 12h4m12 0h4M6 6.5V17.5M18 6.5V17.5M6 12h12",
    calendar:"M8 2v4M16 2v4M3 10h18M3 6h18a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1z",
    check:   "M20 6L9 17l-5-5",
    arrow:   "M5 12h14M12 5l7 7-7 7",
    close:   "M18 6L6 18M6 6l12 12",
    back:    "M19 12H5M12 19l-7-7 7-7",
    clock:   "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zM12 6v6l4 2",
    lock:    "M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2zM7 11V7a5 5 0 0 1 10 0v4",
    chevron: "M6 9l6 6 6-6",
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      {paths[name]?.split("M").filter(Boolean).map((p, i) => (
        <path key={i} d={"M" + p} />
      ))}
    </svg>
  );
};

const ZoneIllustration = ({ zoneId, size = 40, color = "#ffffff" }) => {
  const illustrations = {
    pecho: (
      <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
        <circle cx="20" cy="20" r="18" fill="rgba(244,63,94,0.12)" stroke="rgba(244,63,94,0.3)" strokeWidth="1"/>
        <path d="M10 18c0-4 3-7 6-7 2 0 3 1 4 2 1-1 2-2 4-2 3 0 6 3 6 7 0 5-5 9-10 11C15 27 10 23 10 18z" fill={color} fillOpacity="0.9"/>
        <path d="M20 13v16" stroke="rgba(0,0,0,0.15)" strokeWidth="1" strokeLinecap="round"/>
      </svg>
    ),
    espalda: (
      <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
        <circle cx="20" cy="20" r="18" fill="rgba(56,189,248,0.12)" stroke="rgba(56,189,248,0.3)" strokeWidth="1"/>
        <path d="M14 11h12v4l2 3-2 3v8H14v-8l-2-3 2-3V11z" fill={color} fillOpacity="0.9"/>
        <path d="M14 15h12M14 21h12M20 11v18" stroke="rgba(0,0,0,0.15)" strokeWidth="1" strokeLinecap="round"/>
      </svg>
    ),
    piernas: (
      <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
        <circle cx="20" cy="20" r="18" fill="rgba(74,222,128,0.12)" stroke="rgba(74,222,128,0.3)" strokeWidth="1"/>
        <path d="M15 10h10l-2 10 3 10h-4l-2-8-2 8h-4l3-10L15 10z" fill={color} fillOpacity="0.9"/>
      </svg>
    ),
    core: (
      <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
        <circle cx="20" cy="20" r="18" fill="rgba(245,158,11,0.12)" stroke="rgba(245,158,11,0.3)" strokeWidth="1"/>
        <rect x="14" y="11" width="12" height="18" rx="3" fill={color} fillOpacity="0.9"/>
        <path d="M14 16h12M14 20h12M14 24h12" stroke="rgba(0,0,0,0.2)" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    cardio: (
      <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
        <circle cx="20" cy="20" r="18" fill="rgba(192,132,252,0.12)" stroke="rgba(192,132,252,0.3)" strokeWidth="1"/>
        <path d="M8 20h5l3-7 4 14 3-9 2 4 4-2" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" strokeOpacity="0.9"/>
      </svg>
    ),
    hombros: (
      <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
        <circle cx="20" cy="20" r="18" fill="rgba(251,146,60,0.12)" stroke="rgba(251,146,60,0.3)" strokeWidth="1"/>
        <circle cx="20" cy="15" r="5" fill={color} fillOpacity="0.9"/>
        <path d="M10 25c0-4 4-6 10-6s10 2 10 6" fill={color} fillOpacity="0.7"/>
        <path d="M8 22l4-3M32 22l-4-3" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeOpacity="0.9"/>
      </svg>
    ),
  };
  return illustrations[zoneId] ?? <div style={{width:size,height:size}}/>;
};

const RankBadge = ({ rank, size = 32 }) => {
  const colors = {
    "Novato":     { bg: "#1f2937", border: "#6b7280", text: "#9ca3af" },
    "Bronce":     { bg: "#1c1009", border: "#b87333", text: "#cd9b6c" },
    "Plata":      { bg: "#111827", border: "#94a3b8", text: "#cbd5e1" },
    "Oro":        { bg: "#1c1500", border: "#f59e0b", text: "#fbbf24" },
    "Platino":    { bg: "#071b24", border: "#38bdf8", text: "#7dd3fc" },
    "Diamante":   { bg: "#1a0f2e", border: "#c084fc", text: "#d8b4fe" },
    "Maestro":    { bg: "#1c0e00", border: "#fb923c", text: "#fdba74" },
    "Gran Élite": { bg: "#1c0008", border: "#f43f5e", text: "#fb7185" },
  };
  const c = colors[rank.name] ?? colors["Novato"];
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: c.bg, border: `2px solid ${c.border}`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.3, fontWeight: 700, color: c.text,
      fontFamily: "'Rajdhani',sans-serif", letterSpacing: 0, flexShrink: 0,
      boxShadow: `0 0 12px ${c.border}40`,
    }}>
      {rank.short}
    </div>
  );
};

export default function FitnessRPG() {
  const [state, setState] = useState(() => {
    try {
      const s = localStorage.getItem("frpg-v4");
      return s ? { ...DEFAULT_STATE(), ...JSON.parse(s) } : DEFAULT_STATE();
    } catch { return DEFAULT_STATE(); }
  });

  // view: "home" | "routine" | "day" | "zone" | "stats"
  const [view, setView]             = useState("home");
  const [activeDayIdx, setActiveDayIdx] = useState(null); // for "day" view
  const [activeZone, setActiveZone] = useState(null);     // for "zone" view
  // done tracks completed exercises: key = zoneId, value = Set of exercise names
  const [done, setDone]             = useState({});
  const [openZoneSections, setOpenZoneSections] = useState({});
  const [toast, setToast]           = useState(null);
  const [rankUp, setRankUp]         = useState(null);
  const [achToast, setAchToast]     = useState(null);

  useEffect(() => {
    const el = document.createElement("style");
    el.textContent = STYLES;
    document.head.appendChild(el);
    return () => document.head.removeChild(el);
  }, []);

  useEffect(() => {
    try { localStorage.setItem("frpg-v4", JSON.stringify(state)); } catch {}
  }, [state]);

  useEffect(() => {
    const earned = ACHIEVEMENTS.filter(a => a.cond(state));
    const newOnes = earned.filter(a => !state.achievements.includes(a.id));
    if (newOnes.length > 0) {
      setState(prev => ({ ...prev, achievements: [...prev.achievements, ...newOnes.map(a => a.id)] }));
      setAchToast(newOnes[0]);
      setTimeout(() => setAchToast(null), 3500);
    }
  }, [state.xp, state.totalSessions, state.streak]);

  const dayIdx  = new Date().getDay();
  const ridx    = dayIdx === 0 ? 6 : dayIdx - 1;
  const todayR  = DAILY[ridx];
  const totalXP = Object.values(state.xp).reduce((a, b) => a + b, 0);
  const avgXP   = Math.floor(totalXP / ZONES.length);
  const gRank   = getRank(avgXP);

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  }

  function awardXP(zoneId, amount) {
    setState(prev => {
      const old = prev.xp[zoneId], nw = old + amount;
      if (getRank(nw).min > getRank(old).min) {
        const r = getRank(nw);
        setTimeout(() => setRankUp({ zone: ZONES.find(z => z.id === zoneId).label, rank: r }), 400);
      }
      return { ...prev, xp: { ...prev.xp, [zoneId]: nw } };
    });
  }

  // Toggle exercise in day view (multi-zone)
  function toggleExDay(ex, zoneId) {
    const zDone = done[zoneId] ?? new Set();
    const isDone = zDone.has(ex.name);
    setDone(prev => {
      const nxt = new Set(prev[zoneId] ?? []);
      if (isDone) { nxt.delete(ex.name); } else { nxt.add(ex.name); }
      return { ...prev, [zoneId]: nxt };
    });
    if (!isDone) {
      awardXP(zoneId, ex.xp);
      showToast(`+${ex.xp} XP · ${ex.name}`);
    } else {
      setState(prev => ({ ...prev, xp: { ...prev.xp, [zoneId]: Math.max(0, prev.xp[zoneId] - ex.xp) } }));
    }
  }

  // Open a specific day (by index in DAILY)
  function openDay(idx) {
    const r = DAILY[idx];
    if (!r || r.zones.length === 0) return;
    setActiveDayIdx(idx);
    setDone({});
    // Open first zone section by default
    const open = {};
    r.zones.forEach(z => { open[z] = true; });
    setOpenZoneSections(open);
    setView("day");
  }

  // Open single zone from zones grid
  function openZoneView(id) {
    setActiveZone(id);
    setDone({ [id]: new Set() });
    setView("zone");
  }

  function finishDay() {
    // Count total exercises done and XP earned
    const totalDone = Object.values(done).reduce((acc, s) => acc + s.size, 0);
    if (totalDone > 0) {
      const earnedXP = Object.entries(done).reduce((acc, [zoneId, names]) => {
        return acc + EXERCISES[zoneId].filter(e => names.has(e.name)).reduce((a, e) => a + e.xp, 0);
      }, 0);
      const zonesWorked = Object.keys(done).filter(z => done[z].size > 0);

      setState(prev => {
        const today = new Date().toLocaleDateString("es-CL");
        const yesterday = new Date(Date.now() - 86400000).toLocaleDateString("es-CL");
        const newStreak = prev.lastTrainedDate === yesterday ? prev.streak + 1
          : prev.lastTrainedDate === today ? prev.streak : 1;
        const weekStart = getWeekStart();
        const weekSessions = prev.weekStart === weekStart ? prev.weekSessions + 1 : 1;
        return {
          ...prev,
          totalSessions: prev.totalSessions + 1,
          streak: newStreak,
          lastTrainedDate: today,
          weekStart,
          weekSessions,
          log: [...prev.log.slice(-49), {
            date: today,
            zone: zonesWorked[0] ?? "pecho",
            zones: zonesWorked,
            xp: earnedXP,
            exercises: totalDone,
          }],
        };
      });
    }
    setView("home");
    setActiveDayIdx(null);
    setDone({});
  }

  // Legacy finishZone for single-zone view
  function finishZone() {
    if (activeZone) {
      const zoneDone = done[activeZone] ?? new Set();
      if (zoneDone.size > 0) {
        const earnedXP = EXERCISES[activeZone]
          .filter(e => zoneDone.has(e.name))
          .reduce((a, e) => a + e.xp, 0);
        setState(prev => {
          const today = new Date().toLocaleDateString("es-CL");
          const yesterday = new Date(Date.now() - 86400000).toLocaleDateString("es-CL");
          const newStreak = prev.lastTrainedDate === yesterday ? prev.streak + 1
            : prev.lastTrainedDate === today ? prev.streak : 1;
          const weekStart = getWeekStart();
          const weekSessions = prev.weekStart === weekStart ? prev.weekSessions + 1 : 1;
          return {
            ...prev,
            totalSessions: prev.totalSessions + 1,
            streak: newStreak,
            lastTrainedDate: today,
            weekStart,
            weekSessions,
            log: [...prev.log.slice(-49), {
              date: today,
              zone: activeZone,
              xp: earnedXP,
              exercises: zoneDone.size,
            }],
          };
        });
      }
    }
    setView("home");
    setActiveZone(null);
    setDone({});
  }

  function getWeekStart() {
    const d = new Date();
    d.setDate(d.getDate() - d.getDay());
    return d.toLocaleDateString("es-CL");
  }

  function NavBtn({ v, label, iconName }) {
    const isOn = view === v || (v === "routine" && (view === "day"));
    return (
      <button className={`bnbtn${isOn ? " on" : ""}`} onClick={() => setView(v)}>
        <Icon name={iconName} size={19} />
        <span className="bnlbl">{label}</span>
      </button>
    );
  }

  // ── HOME ──
  function HomeView() {
    const gNext = getNextRank(avgXP);
    const gPct  = xpPct(avgXP);
    return (
      <div>
        <div className="hero" style={{ "--hcolor": gRank.color }}>
          <div className="hero-scan" />
          <div className="hero-corner">{gRank.short}</div>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
            <RankBadge rank={gRank} size={52} />
            <div style={{ flex: 1 }}>
              <div className="hero-lbl">Rango Global</div>
              <div className="hero-rank" style={{ color: gRank.color }}>{gRank.name}</div>
              <div className="hero-stats">
                <span><b>{totalXP.toLocaleString()}</b> XP total</span>
                <span><b>{state.totalSessions}</b> sesiones</span>
                <span><b>{state.streak}</b> días</span>
              </div>
            </div>
          </div>
          <div className="xb-track">
            <div className="xb-fill" style={{ width: `${gPct}%`, background: `linear-gradient(90deg, ${gRank.color}, ${gRank.color}cc)` }} />
          </div>
          <div className="xb-meta">
            <span>{avgXP} XP prom.</span>
            <span>{gNext ? `${gNext.min - avgXP} XP para ${gNext.name}` : "Rango Máximo"}</span>
          </div>
        </div>

        <div className="sec">Objetivo semanal</div>
        <div className="goal-bar">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 12, fontWeight: 600 }}>Sesiones esta semana</span>
            <span style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: 18, fontWeight: 700, color: "var(--accent)" }}>
              {Math.min(state.weekSessions, state.weeklyGoal)}/{state.weeklyGoal}
            </span>
          </div>
          <div className="goal-track">
            <div className="goal-fill" style={{ width: `${Math.min(100, (state.weekSessions / state.weeklyGoal) * 100)}%` }} />
          </div>
          <div className="goal-meta">
            <span>{state.weeklyGoal - Math.min(state.weekSessions, state.weeklyGoal) > 0
              ? `Faltan ${state.weeklyGoal - state.weekSessions} sesiones`
              : <b style={{ color: "#4ade80" }}>¡Objetivo cumplido!</b>}</span>
            <span>{Math.round((state.weekSessions / state.weeklyGoal) * 100)}%</span>
          </div>
        </div>

        <div className="sec">Hoy · {todayR.day}</div>
        {todayR.zones.length > 0 ? (
          // FIX: onClick now calls openDay(ridx) instead of setView("routine")
          <div className="today" onClick={() => openDay(ridx)}>
            <div className="today-header">
              <div>
                <div className="today-name">{todayR.label}</div>
                <div className="today-sub">{todayR.zones.length} zonas · toca para comenzar</div>
              </div>
              <div className="today-arrow"><Icon name="arrow" size={16} /></div>
            </div>
            <div className="today-zones">
              {todayR.zones.map(zid => {
                const z = ZONES.find(z => z.id === zid);
                return <div key={zid} className="today-zone-badge">{z?.label}</div>;
              })}
              <div className="today-zone-badge" style={{ marginLeft: "auto" }}>
                <span className={`rrow-type type-${todayR.type}`} style={{ border: "none", background: "none", padding: 0, fontSize: 9 }}>
                  {todayR.type.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="rest-card">
            <div style={{ marginBottom: 10 }}><Icon name="clock" size={32} color="var(--muted)" /></div>
            <div style={{ fontWeight: 600, fontSize: 15 }}>Día de Descanso</div>
            <div style={{ fontSize: 12, marginTop: 4 }}>Recuperación activa — camina, estira</div>
          </div>
        )}

        <div className="sec">Esta semana</div>
        <div className="wstrip">
          {DAILY.map((r, i) => {
            const isToday = i === ridx;
            const isRest = r.zones.length === 0;
            const todayObj = new Date();
            const dayOfWeek = todayObj.getDay();
            const dayDiff = i - (dayOfWeek === 0 ? 6 : dayOfWeek - 1);
            const targetDate = new Date(todayObj);
            targetDate.setDate(todayObj.getDate() + dayDiff);
            const dateStr = targetDate.toLocaleDateString("es-CL");
            const hasDone = state.log.some(l => l.date === dateStr);
            const isPast = dayDiff < 0;
            return (
              <div key={r.day} className={`wday${isToday ? " on" : ""}${isRest ? " rest" : ""}${hasDone && !isToday ? " done" : ""}`}>
                <div className="wday-lbl">{r.day.slice(0, 3)}</div>
                {isRest ? <span style={{ fontSize: 8 }}>—</span>
                  : hasDone ? <div className="wday-dot" />
                  : isPast ? <span style={{ fontSize: 8, opacity: 0.4 }}>○</span>
                  : <div className="wday-dot" style={{ opacity: 0.2 }} />}
              </div>
            );
          })}
        </div>

        <div className="sec">Zonas Musculares</div>
        <div className="zgrid">
          {ZONES.map(z => {
            const rank = getRank(state.xp[z.id]);
            const pct  = xpPct(state.xp[z.id]);
            return (
              <button key={z.id} className="zcard" onClick={() => openZoneView(z.id)}
                style={{ "--zbg": z.bg, "--zacc": z.accentDark }}>
                <div className="z-top">
                  <ZoneIllustration zoneId={z.id} size={38} color={z.accentDark} />
                  <RankBadge rank={rank} size={28} />
                </div>
                <div className="z-lbl">{z.label}</div>
                <div className="z-rank">{rank.name}</div>
                <div className="z-bar">
                  <div className="z-bar-fill" style={{ width: `${pct}%`, background: z.accentDark }} />
                </div>
                <div className="z-xp">{state.xp[z.id]} / {getNextRank(state.xp[z.id])?.min ?? "MAX"} XP</div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // ── ROUTINE (weekly plan overview) ──
  function RoutineView() {
    return (
      <div>
        <div className="pg-title">Plan Semanal</div>
        <div className="pg-sub">Toca un día para comenzar a entrenar</div>
        {DAILY.map((r, i) => {
          const isToday = i === ridx;
          const typeClass = `type-${r.type}`;
          const isRest = r.zones.length === 0;
          // XP potential for this day
          const potentialXP = r.zones.reduce((acc, zid) => acc + EXERCISES[zid].reduce((a, e) => a + e.xp, 0), 0);
          return (
            <div key={r.day}
              className={`rrow${isRest ? " rest-row" : ""}`}
              // FIX: clicking any training day now calls openDay(i)
              onClick={() => !isRest && openDay(i)}
              style={isToday ? { borderColor: "rgba(245,158,11,.35)", background: "rgba(245,158,11,.04)" } : {}}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{
                  width: 38, height: 38, borderRadius: 10,
                  background: isToday ? "rgba(245,158,11,.12)" : "rgba(255,255,255,.04)",
                  border: `1px solid ${isToday ? "rgba(245,158,11,.3)" : "var(--border)"}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "'Rajdhani',sans-serif", fontSize: 10, fontWeight: 700,
                  color: isToday ? "var(--accent)" : "var(--muted)",
                }}>
                  {r.day.slice(0, 3).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 500, fontSize: 13, display: "flex", alignItems: "center", gap: 8 }}>
                    {r.label}
                    {isToday && <span style={{ fontSize: 9, color: "var(--accent)", fontWeight: 700, letterSpacing: ".08em" }}>HOY</span>}
                  </div>
                  <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 2 }}>
                    {r.zones.length > 0
                      ? `${r.zones.map(zid => ZONES.find(z => z.id === zid)?.label).join(" + ")} · hasta +${potentialXP} XP`
                      : "Descanso activo"}
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span className={`rrow-type ${typeClass}`}>{r.type.toUpperCase()}</span>
                {!isRest && <Icon name="arrow" size={14} color="var(--muted)" />}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // ── DAY VIEW (multi-zone workout) — THIS IS THE NEW/FIXED VIEW ──
  function DayView() {
    if (activeDayIdx === null) return null;
    const dayRoutine = DAILY[activeDayIdx];
    const isToday = activeDayIdx === ridx;

    const totalDoneCount = Object.values(done).reduce((acc, s) => acc + s.size, 0);
    const totalEarnedXP = Object.entries(done).reduce((acc, [zoneId, names]) => {
      return acc + EXERCISES[zoneId].filter(e => names.has(e.name)).reduce((a, e) => a + e.xp, 0);
    }, 0);

    const levelLabels = { 1: "Principiante", 2: "Intermedio", 3: "Avanzado", 4: "Élite" };

    return (
      <div>
        <button className="back" onClick={finishDay}>
          <Icon name="back" size={16} /> {totalDoneCount > 0 ? "Guardar y volver" : "Volver"}
        </button>

        <div style={{ marginBottom: 6 }}>
          <div className="pg-title" style={{ marginBottom: 2 }}>{dayRoutine.label}</div>
          <div style={{ fontSize: 11, color: "var(--muted2)" }}>
            {dayRoutine.day}{isToday ? " · Hoy" : ""}
            {" · "}{dayRoutine.zones.map(zid => ZONES.find(z => z.id === zid)?.label).join(" + ")}
          </div>
        </div>

        {/* Summary bar */}
        <div className="day-summary">
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 2 }}>Progreso de sesión</div>
            <div style={{ fontSize: 11, color: "var(--muted)" }}>
              {totalDoneCount} ejercicio{totalDoneCount !== 1 ? "s" : ""} completado{totalDoneCount !== 1 ? "s" : ""}
            </div>
          </div>
          <div className="day-xp-counter">
            <div className="day-xp-val">+{totalEarnedXP}</div>
            <div className="day-xp-lbl">XP ganados</div>
          </div>
        </div>

        {/* Each zone as a collapsible section */}
        {dayRoutine.zones.map(zoneId => {
          const z = ZONES.find(z => z.id === zoneId);
          const zoneDone = done[zoneId] ?? new Set();
          const isOpen = openZoneSections[zoneId] ?? false;
          const exs = EXERCISES[zoneId];
          const zoneEarned = exs.filter(e => zoneDone.has(e.name)).reduce((a, e) => a + e.xp, 0);
          const rank = getRank(state.xp[zoneId]);

          return (
            <div key={zoneId}>
              {/* Collapsible header */}
              <div
                className={`zone-section-hdr${isOpen ? " open" : ""}`}
                onClick={() => setOpenZoneSections(prev => ({ ...prev, [zoneId]: !prev[zoneId] }))}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <ZoneIllustration zoneId={zoneId} size={36} color={z.accentDark} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14, display: "flex", alignItems: "center", gap: 8 }}>
                      {z.label}
                      {zoneDone.size > 0 && (
                        <span style={{ fontSize: 10, color: "#4ade80", fontWeight: 700 }}>
                          {zoneDone.size}/{exs.length} ✓
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 10, color: "var(--muted2)", marginTop: 2 }}>
                      {rank.name} · {state.xp[zoneId]} XP
                      {zoneEarned > 0 && <span style={{ color: "var(--accent)" }}> +{zoneEarned} hoy</span>}
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <RankBadge rank={rank} size={26} />
                  <div style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform .2s" }}>
                    <Icon name="chevron" size={16} color="var(--muted)" />
                  </div>
                </div>
              </div>

              {/* Exercise list */}
              {isOpen && (
                <div className="zone-section-body">
                  {/* Group by level */}
                  {[1, 2, 3, 4].map(lvl => {
                    const lvlExs = exs.filter(e => e.level === lvl);
                    if (lvlExs.length === 0) return null;
                    return (
                      <div key={lvl}>
                        <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--muted)", margin: "8px 4px 4px" }}>
                          {levelLabels[lvl]}
                        </div>
                        {lvlExs.map(ex => {
                          const isDone = zoneDone.has(ex.name);
                          return (
                            <div key={ex.name} className={`exitem${isDone ? " done" : ""}`}
                              onClick={() => toggleExDay(ex, zoneId)}>
                              <div className="excheck">
                                {isDone && <Icon name="check" size={12} color="#07090f" />}
                              </div>
                              <div style={{ flex: 1 }}>
                                <div className="exname">{ex.name}</div>
                                <div className="exmeta">{ex.sets} series × {ex.reps}</div>
                                <div className="ex-muscle">{ex.muscle}</div>
                              </div>
                              <div className={`ex-level l${ex.level}`}>
                                {ex.level === 1 ? "Básico" : ex.level === 2 ? "Inter." : ex.level === 3 ? "Avanz." : "Élite"}
                              </div>
                              <div className="exxp">+{ex.xp}</div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        <button
          className="save-btn"
          onClick={finishDay}
          disabled={totalDoneCount === 0}
          style={{ marginTop: 16 }}
        >
          {totalDoneCount > 0
            ? `Finalizar — ${totalDoneCount} ejercicios · +${totalEarnedXP} XP`
            : "Completa al menos un ejercicio"}
        </button>
      </div>
    );
  }

  // ── ZONE VIEW (single zone from zones grid) ──
  function ZoneView() {
    if (!activeZone) return null;
    const z   = ZONES.find(z => z.id === activeZone);
    const exs = EXERCISES[activeZone];
    const zoneDone = done[activeZone] ?? new Set();
    const earned = exs.filter(e => zoneDone.has(e.name)).reduce((a, e) => a + e.xp, 0);
    const rank   = getRank(state.xp[activeZone]);
    const pct    = xpPct(state.xp[activeZone]);
    const levelLabels = { 1: "Principiante", 2: "Intermedio", 3: "Avanzado", 4: "Élite" };

    return (
      <div>
        <button className="back" onClick={finishZone}>
          <Icon name="back" size={16} /> {zoneDone.size > 0 ? "Guardar y volver" : "Volver"}
        </button>
        <div style={{
          background: "var(--card)", border: "1px solid var(--border2)",
          borderRadius: 16, padding: "18px 18px 14px", marginBottom: 16,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
            <ZoneIllustration zoneId={activeZone} size={48} color={z.accentDark} />
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                <span className="pg-title" style={{ marginBottom: 0, fontSize: 22 }}>{z.label}</span>
                <RankBadge rank={rank} size={30} />
              </div>
              <div style={{ fontSize: 11, color: "var(--muted2)" }}>{rank.name} · {state.xp[activeZone]} XP</div>
            </div>
            {earned > 0 && (
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: 28, fontWeight: 700, color: "var(--accent)", lineHeight: 1 }}>+{earned}</div>
                <div style={{ fontSize: 10, color: "var(--muted)" }}>XP hoy</div>
              </div>
            )}
          </div>
          <div className="xb-track">
            <div className="xb-fill" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${z.accentDark}, ${z.accentDark}bb)` }} />
          </div>
          <div className="xb-meta">
            <span>{state.xp[activeZone]} XP</span>
            <span>{getNextRank(state.xp[activeZone]) ? `${getNextRank(state.xp[activeZone]).min - state.xp[activeZone]} para ${getNextRank(state.xp[activeZone]).name}` : "Rango máximo"}</span>
          </div>
        </div>

        {[1, 2, 3, 4].map(lvl => {
          const lvlExs = exs.filter(e => e.level === lvl);
          if (lvlExs.length === 0) return null;
          return (
            <div key={lvl}>
              <div className="sec">{levelLabels[lvl]}</div>
              {lvlExs.map(ex => {
                const isDone = zoneDone.has(ex.name);
                return (
                  <div key={ex.name} className={`exitem${isDone ? " done" : ""}`}
                    onClick={() => toggleExDay(ex, activeZone)}>
                    <div className="excheck">
                      {isDone && <Icon name="check" size={12} color="#07090f" />}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div className="exname">{ex.name}</div>
                      <div className="exmeta">{ex.sets} series × {ex.reps}</div>
                      <div className="ex-muscle">{ex.muscle}</div>
                    </div>
                    <div className={`ex-level l${ex.level}`}>
                      {ex.level === 1 ? "Básico" : ex.level === 2 ? "Inter." : ex.level === 3 ? "Avanz." : "Élite"}
                    </div>
                    <div className="exxp">+{ex.xp}</div>
                  </div>
                );
              })}
            </div>
          );
        })}

        {zoneDone.size > 0 && (
          <button className="save-btn" onClick={finishZone}>
            Completar — {zoneDone.size} ejercicio{zoneDone.size !== 1 ? "s" : ""} · +{earned} XP
          </button>
        )}
      </div>
    );
  }

  // ── STATS ──
  function StatsView() {
    const earnedAchs = ACHIEVEMENTS.filter(a => state.achievements.includes(a.id));
    const lockedAchs = ACHIEVEMENTS.filter(a => !state.achievements.includes(a.id));
    return (
      <div>
        <div className="pg-title">Estadísticas</div>
        <div className="pg-sub">Tu progreso detallado</div>
        <div className="stat-grid">
          {[
            ["XP Total", totalXP.toLocaleString()],
            ["Sesiones", state.totalSessions],
            ["Racha", `${state.streak}d`],
          ].map(([l, v]) => (
            <div key={l} className="sbox">
              <div className="sval">{v}</div>
              <div className="slbl">{l}</div>
            </div>
          ))}
        </div>

        <div className="sec">Por zona</div>
        {ZONES.map(z => {
          const xp = state.xp[z.id], rank = getRank(xp), pct = xpPct(xp), next = getNextRank(xp);
          return (
            <div key={z.id} className="szrow">
              <div className="szhead">
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <ZoneIllustration zoneId={z.id} size={32} color={z.accentDark} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{z.label}</div>
                    <div style={{ fontSize: 10, color: "var(--muted2)" }}>{next ? `${next.min - xp} XP para ${next.name}` : "Rango máximo"}</div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: z.accentDark }}>{rank.name}</span>
                  <RankBadge rank={rank} size={26} />
                </div>
              </div>
              <div className="xb-track">
                <div className="xb-fill" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${z.accentDark}, ${z.accentDark}bb)` }} />
              </div>
              <div className="xb-meta"><span>{xp} XP</span><span>{pct}%</span></div>
            </div>
          );
        })}

        <div className="sec">Logros</div>
        <div className="ach-grid">
          {earnedAchs.map(a => (
            <div key={a.id} className="ach-card earned">
              <div className="ach-icon earned"><Icon name={a.icon} size={16} /></div>
              <div className="ach-name">{a.name}</div>
              <div className="ach-desc">{a.desc}</div>
            </div>
          ))}
          {lockedAchs.map(a => (
            <div key={a.id} className="ach-card locked">
              <div className="ach-icon locked"><Icon name="lock" size={14} /></div>
              <div className="ach-name">{a.name}</div>
              <div className="ach-desc">{a.desc}</div>
            </div>
          ))}
        </div>

        {state.log.length > 0 && (
          <>
            <div className="sec">Historial reciente</div>
            {[...state.log].reverse().slice(0, 12).map((l, i) => {
              const z = ZONES.find(z => z.id === l.zone);
              return (
                <div key={i} className="lrow">
                  <span className="ldate">{l.date}</span>
                  <span className="lzone" style={{ color: z?.accentDark }}>
                    {l.zones ? l.zones.map(zid => ZONES.find(z => z.id === zid)?.label).join("+") : z?.label}
                  </span>
                  <span style={{ fontSize: 11, color: "var(--muted)" }}>{l.exercises} ejerc.</span>
                  <span className="lxp">+{l.xp}</span>
                </div>
              );
            })}
          </>
        )}

        <div className="sec">Zona de peligro</div>
        <button className="reset-btn" onClick={() => {
          if (confirm("¿Reiniciar todo el progreso? Esta acción no se puede deshacer.")) {
            setState(DEFAULT_STATE());
            setView("home");
          }
        }}>
          Reiniciar todo el progreso
        </button>
      </div>
    );
  }

  return (
    <div className="frpg">
      {toast && <div className="toast">⚡ {toast}</div>}
      {achToast && (
        <div className="ach-toast">
          <div className="ach-toast-icon"><Icon name={achToast.icon} size={14} /></div>
          <div>
            <div className="ach-toast-title">¡Logro desbloqueado!</div>
            <div className="ach-toast-desc">{achToast.name}</div>
          </div>
        </div>
      )}
      {rankUp && (
        <div className="overlay" onClick={() => setRankUp(null)}>
          <div className="rucard" onClick={e => e.stopPropagation()}>
            <div className="ru-badge"><RankBadge rank={rankUp.rank} size={72} /></div>
            <div className="ru-title">¡Subida de Rango!</div>
            <div className="ru-name" style={{ color: rankUp.rank.color }}>{rankUp.rank.name}</div>
            <div className="ru-zone">{rankUp.zone}</div>
            <button className="ru-btn" onClick={() => setRankUp(null)}>Continuar</button>
          </div>
        </div>
      )}

      <div className="topbar">
        <div className="logo">FIT<span>RPG</span></div>
        <div className="tp-right">
          <div className="streak-pill">
            <Icon name="flame" size={13} color="#fb923c" />
            <span className="streak-num">{state.streak}</span>
          </div>
          <div className="xp-pill">
            <Icon name="zap" size={12} color="var(--accent)" />
            <b>{totalXP.toLocaleString()}</b>
          </div>
        </div>
      </div>

      <div className="scroll-area">
        {view === "home"    && <HomeView />}
        {view === "routine" && <RoutineView />}
        {view === "day"     && <DayView />}
        {view === "zone"    && <ZoneView />}
        {view === "stats"   && <StatsView />}
      </div>

      <nav className="botnav">
        <NavBtn v="home"    label="Inicio"   iconName="home" />
        <NavBtn v="routine" label="Plan"     iconName="calendar" />
        <NavBtn v="stats"   label="Stats"    iconName="chart" />
      </nav>
    </div>
  );
}