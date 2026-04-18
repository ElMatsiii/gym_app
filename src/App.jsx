import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "./supabase";
import AuthScreen from "./AuthScreen";
// ─── API CONFIG ───────────────────────────────────────────────────────────────
// ExerciseDB open-source API (exercisedb.dev) — free, no key required
const EXERCISEDB_BASE = "https://exercisedb.dev/api";

// Map our zone IDs to ExerciseDB body-part slugs
const ZONE_TO_BODYPART = {
  pecho:    "chest",
  espalda:  "back",
  piernas:  "upper legs",
  core:     "waist",
  cardio:   "cardio",
  hombros:  "shoulders",
  brazos:   "upper arms",
};

// ─── RANKS ───────────────────────────────────────────────────────────────────
const RANKS = [
  { name: "Novato",     short: "I",    min: 0,    color: "#6b7280", next: 200  },
  { name: "Bronce",     short: "II",   min: 200,  color: "#b87333", next: 600  },
  { name: "Plata",      short: "III",  min: 600,  color: "#94a3b8", next: 1200 },
  { name: "Oro",        short: "IV",   min: 1200, color: "#f59e0b", next: 2200 },
  { name: "Platino",    short: "V",    min: 2200, color: "#38bdf8", next: 3500 },
  { name: "Diamante",   short: "VI",   min: 3500, color: "#c084fc", next: 5000 },
  { name: "Maestro",    short: "VII",  min: 5000, color: "#fb923c", next: 7000 },
  { name: "Gran Élite", short: "VIII", min: 7000, color: "#f43f5e", next: null },
];

const ZONES = [
  { id: "pecho",    label: "Pecho",    accentDark: "#f43f5e", bg: "rgba(244,63,94,0.07)"  },
  { id: "espalda",  label: "Espalda",  accentDark: "#38bdf8", bg: "rgba(56,189,248,0.07)" },
  { id: "piernas",  label: "Piernas",  accentDark: "#4ade80", bg: "rgba(74,222,128,0.07)" },
  { id: "core",     label: "Core",     accentDark: "#f59e0b", bg: "rgba(245,158,11,0.07)" },
  { id: "cardio",   label: "Cardio",   accentDark: "#c084fc", bg: "rgba(192,132,252,0.07)"},
  { id: "hombros",  label: "Hombros",  accentDark: "#fb923c", bg: "rgba(251,146,60,0.07)" },
  { id: "brazos",   label: "Brazos",   accentDark: "#34d399", bg: "rgba(52,211,153,0.07)" },
];

// ─── FALLBACK EXERCISES (when API unavailable) ────────────────────────────────
const FALLBACK_EXERCISES = {
  pecho: [
    { name: "Flexiones",            sets: 3, reps: "12",  xp: 18, level: 1, muscle: "Pectoral Mayor", timed: false },
    { name: "Flexiones diamante",   sets: 3, reps: "10",  xp: 22, level: 2, muscle: "Pectoral / Tríceps", timed: false },
    { name: "Flexiones arqueras",   sets: 3, reps: "8",   xp: 28, level: 3, muscle: "Pectoral Unilateral", timed: false },
    { name: "Press banca barra",    sets: 4, reps: "8",   xp: 35, level: 2, muscle: "Pectoral / Deltoides", timed: false },
    { name: "Press inclinado",      sets: 3, reps: "10",  xp: 30, level: 2, muscle: "Pectoral Superior", timed: false },
    { name: "Aperturas mancuernas", sets: 3, reps: "12",  xp: 22, level: 2, muscle: "Pectoral", timed: false },
    { name: "Fondos en paralelas",  sets: 3, reps: "10",  xp: 32, level: 3, muscle: "Pectoral / Tríceps", timed: false },
  ],
  espalda: [
    { name: "Remo con mochila",     sets: 3, reps: "12",  xp: 20, level: 1, muscle: "Dorsal Ancho", timed: false },
    { name: "Superman",             sets: 3, reps: "30s", xp: 15, level: 1, muscle: "Erector Espinal", timed: true, timerSecs: 30 },
    { name: "Dominadas asistidas",  sets: 3, reps: "8",   xp: 28, level: 2, muscle: "Dorsal Ancho", timed: false },
    { name: "Dominadas barra",      sets: 4, reps: "6",   xp: 42, level: 3, muscle: "Dorsal / Bíceps", timed: false },
    { name: "Remo con barra",       sets: 4, reps: "10",  xp: 35, level: 2, muscle: "Dorsal / Romboides", timed: false },
    { name: "Jalón al pecho",       sets: 3, reps: "12",  xp: 28, level: 2, muscle: "Dorsal Ancho", timed: false },
    { name: "Peso muerto",          sets: 4, reps: "6",   xp: 48, level: 3, muscle: "Cadena Posterior", timed: false },
  ],
  piernas: [
    { name: "Sentadillas",          sets: 4, reps: "12",  xp: 22, level: 1, muscle: "Cuádriceps", timed: false },
    { name: "Zancadas",             sets: 3, reps: "10",  xp: 20, level: 1, muscle: "Cuádriceps / Glúteos", timed: false },
    { name: "Puente de glúteos",    sets: 3, reps: "15",  xp: 15, level: 1, muscle: "Glúteos", timed: false },
    { name: "Sentadilla c/barra",   sets: 4, reps: "10",  xp: 40, level: 2, muscle: "Cuádriceps / Glúteos", timed: false },
    { name: "Peso muerto rumano",   sets: 4, reps: "10",  xp: 38, level: 2, muscle: "Isquiotibiales", timed: false },
    { name: "Sentadilla búlgara",   sets: 3, reps: "10",  xp: 35, level: 3, muscle: "Cuádriceps Unilateral", timed: false },
    { name: "Hip thrust barra",     sets: 4, reps: "10",  xp: 42, level: 3, muscle: "Glúteos Mayor", timed: false },
  ],
  core: [
    { name: "Plancha",              sets: 3, reps: "30s", xp: 15, level: 1, muscle: "Core Estabilizador", timed: true, timerSecs: 30 },
    { name: "Abdominales",          sets: 3, reps: "20",  xp: 12, level: 1, muscle: "Recto Abdominal", timed: false },
    { name: "Plancha lateral",      sets: 3, reps: "25s", xp: 18, level: 2, muscle: "Oblicuos", timed: true, timerSecs: 25 },
    { name: "Mountain climbers",    sets: 3, reps: "30s", xp: 20, level: 1, muscle: "Core / Cardio", timed: true, timerSecs: 30 },
    { name: "Elevación de piernas", sets: 3, reps: "15",  xp: 22, level: 2, muscle: "Recto Inferior", timed: false },
    { name: "Rueda abdominal",      sets: 3, reps: "10",  xp: 30, level: 3, muscle: "Core Completo", timed: false },
    { name: "Dragon flag",          sets: 3, reps: "6",   xp: 45, level: 4, muscle: "Core Avanzado", timed: false },
    { name: "Hollow body",          sets: 3, reps: "20s", xp: 28, level: 3, muscle: "Core Estabilizador", timed: true, timerSecs: 20 },
  ],
  cardio: [
    { name: "Jumping jacks",        sets: 3, reps: "45s", xp: 15, level: 1, muscle: "Cardio Total", timed: true, timerSecs: 45 },
    { name: "Saltar en sitio",      sets: 3, reps: "60s", xp: 18, level: 1, muscle: "Cardiovascular", timed: true, timerSecs: 60 },
    { name: "High knees",           sets: 3, reps: "30s", xp: 20, level: 1, muscle: "Cardio / Piernas", timed: true, timerSecs: 30 },
    { name: "Burpees",              sets: 4, reps: "10",  xp: 32, level: 2, muscle: "Full Body / Cardio", timed: false },
    { name: "Skipping",             sets: 3, reps: "45s", xp: 22, level: 1, muscle: "Coordinación / Cardio", timed: true, timerSecs: 45 },
    { name: "Box jumps",            sets: 4, reps: "8",   xp: 35, level: 3, muscle: "Potencia / Cardio", timed: false },
    { name: "Battle ropes",         sets: 4, reps: "30s", xp: 30, level: 2, muscle: "Full Body", timed: true, timerSecs: 30 },
  ],
  hombros: [
    { name: "Press militar",        sets: 4, reps: "10",  xp: 30, level: 2, muscle: "Deltoides Anterior", timed: false },
    { name: "Elevaciones laterales",sets: 3, reps: "15",  xp: 20, level: 1, muscle: "Deltoides Lateral", timed: false },
    { name: "Elevaciones frontales",sets: 3, reps: "12",  xp: 18, level: 1, muscle: "Deltoides Anterior", timed: false },
    { name: "Face pulls",           sets: 3, reps: "15",  xp: 22, level: 2, muscle: "Deltoides Posterior", timed: false },
    { name: "Arnold press",         sets: 4, reps: "10",  xp: 32, level: 2, muscle: "Deltoides 360°", timed: false },
    { name: "Remo al mentón",       sets: 3, reps: "12",  xp: 25, level: 2, muscle: "Deltoides / Trapecios", timed: false },
  ],
  brazos: [
    { name: "Curl bíceps mancuernas", sets: 3, reps: "12", xp: 18, level: 1, muscle: "Bíceps", timed: false },
    { name: "Curl martillo",         sets: 3, reps: "10", xp: 20, level: 1, muscle: "Bíceps / Braquial", timed: false },
    { name: "Curl concentrado",      sets: 3, reps: "12", xp: 22, level: 2, muscle: "Bíceps Pico", timed: false },
    { name: "Press francés",         sets: 3, reps: "10", xp: 25, level: 2, muscle: "Tríceps", timed: false },
    { name: "Extensión tríceps polea",sets: 3, reps: "15", xp: 20, level: 1, muscle: "Tríceps", timed: false },
    { name: "Fondos banco tríceps",   sets: 3, reps: "12", xp: 22, level: 2, muscle: "Tríceps", timed: false },
    { name: "Curl barra Z",          sets: 4, reps: "10", xp: 28, level: 2, muscle: "Bíceps", timed: false },
    { name: "Curl inclinado",        sets: 3, reps: "10", xp: 30, level: 3, muscle: "Bíceps Largo", timed: false },
    { name: "Skull crushers",        sets: 3, reps: "10", xp: 35, level: 3, muscle: "Tríceps", timed: false },
    { name: "Curl 21s",              sets: 3, reps: "21", xp: 38, level: 3, muscle: "Bíceps Completo", timed: false },
  ],
};

const DAILY = [
  { day: "Lunes",     zones: ["pecho",   "hombros"],  label: "Push — Pecho & Hombros",    type: "push"  },
  { day: "Martes",    zones: ["piernas", "cardio"],   label: "Piernas & Cardio",            type: "legs"  },
  { day: "Miércoles", zones: ["espalda", "brazos"],   label: "Pull — Espalda & Brazos",     type: "pull"  },
  { day: "Jueves",    zones: ["cardio",  "core"],     label: "Cardio & Core",               type: "cardio"},
  { day: "Viernes",   zones: ["pecho",   "espalda"],  label: "Push + Pull Intensivo",       type: "full"  },
  { day: "Sábado",    zones: ["piernas", "hombros", "brazos"], label: "Piernas & Brazos",   type: "legs"  },
  { day: "Domingo",   zones: [],                      label: "Descanso Activo",             type: "rest"  },
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
  weekStart: null,
});

const ACHIEVEMENTS = [
  { id: "first_session",  name: "Primer Paso",      desc: "Completa tu primera sesión",        icon: "star",   cond: s => s.totalSessions >= 1 },
  { id: "week_streak",    name: "Semana Perfecta",  desc: "Entrena 7 días seguidos",            icon: "flame",  cond: s => s.streak >= 7 },
  { id: "iron_body",      name: "Cuerpo de Hierro", desc: "Alcanza Bronce en 3 zonas",         icon: "shield", cond: s => Object.values(s.xp).filter(x => x >= 200).length >= 3 },
  { id: "centurion",      name: "Centurión",        desc: "Acumula 1,000 XP en total",         icon: "trophy", cond: s => Object.values(s.xp).reduce((a,b)=>a+b,0) >= 1000 },
  { id: "gold_zone",      name: "Zona Dorada",      desc: "Llega a Oro en cualquier zona",     icon: "star",   cond: s => Object.values(s.xp).some(x => x >= 1200) },
  { id: "sessions_10",    name: "Veterano",         desc: "Completa 10 sesiones",              icon: "swords", cond: s => s.totalSessions >= 10 },
  { id: "sessions_25",    name: "Guerrero",         desc: "Completa 25 sesiones",              icon: "swords", cond: s => s.totalSessions >= 25 },
  { id: "all_zones",      name: "Completo",         desc: "Entrena todas las zonas",           icon: "muscle", cond: s => Object.values(s.xp).every(x => x > 0) },
  { id: "platinum_any",   name: "Élite Emergente",  desc: "Llega a Platino en cualquier zona", icon: "trophy", cond: s => Object.values(s.xp).some(x => x >= 2200) },
  { id: "arm_day",        name: "Brazo de Hierro",  desc: "Completa 5 sesiones de brazos",     icon: "muscle", cond: s => s.log && s.log.filter(l => l.zones?.includes("brazos") || l.zone === "brazos").length >= 5 },
];

// ─── API HELPERS ──────────────────────────────────────────────────────────────
async function fetchExercisesForZone(zoneId) {
  const bodyPart = ZONE_TO_BODYPART[zoneId];
  if (!bodyPart) return null;
  try {
    const res = await fetch(
      `${EXERCISEDB_BASE}/exercises/bodyPart/${encodeURIComponent(bodyPart)}?limit=15&offset=0`,
      { signal: AbortSignal.timeout(5000) }
    );
    if (!res.ok) throw new Error("API error");
    const data = await res.json();
    const exercises = (data.data ?? data);
    if (!Array.isArray(exercises) || exercises.length === 0) return null;

    // Transform API response → our format
    return exercises.slice(0, 10).map((ex, i) => {
      const isCardio = ex.bodyPart === "cardio" || ex.equipment === "body weight" && ex.target === "cardiovascular system";
      const hasTimer = ex.name && /plank|hold|static|isometric|wall sit|superman/i.test(ex.name);
      const timerSecs = hasTimer ? 30 : null;
      const diffWords = ex.name?.split(" ").length ?? 1;
      const lvl = diffWords <= 2 ? 1 : diffWords === 3 ? 2 : diffWords <= 5 ? 3 : 4;
      return {
        name: ex.name ?? `Ejercicio ${i + 1}`,
        sets: lvl <= 1 ? 3 : 4,
        reps: hasTimer ? `${timerSecs}s` : isCardio ? "45s" : lvl === 1 ? "12" : lvl === 2 ? "10" : "8",
        xp: 15 + lvl * 7 + (i % 3) * 3,
        level: Math.min(lvl, 3),
        muscle: ex.target ? ex.target.replace(/-/g, " ") : ex.bodyPart ?? zoneId,
        timed: hasTimer || (isCardio && ex.name?.toLowerCase().includes("jump")),
        timerSecs: hasTimer ? timerSecs : isCardio ? 45 : null,
        gifUrl: ex.gifUrl ?? null,
        apiId: ex.id ?? null,
        fromApi: true,
      };
    });
  } catch {
    return null; // fallback silently
  }
}

// ─── STYLES ──────────────────────────────────────────────────────────────────
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;600;700&family=Inter:wght@300;400;500;600&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
:root{
  --bg:#060810;--surface:#0a0d15;--card:#0f1420;--card2:#131827;
  --border:rgba(255,255,255,0.06);--border2:rgba(255,255,255,0.11);--border3:rgba(255,255,255,0.18);
  --text:#cdd6f0;--muted:#4a5568;--muted2:#6b7a8d;
  --accent:#f59e0b;--accent2:#f97316;--red:#f43f5e;--blue:#38bdf8;--green:#4ade80;--purple:#c084fc;
}
.frpg{min-height:100svh;background:var(--bg);color:var(--text);font-family:'Inter',sans-serif;font-size:14px;max-width:430px;margin:0 auto;position:relative;overflow-x:hidden;padding-bottom:env(safe-area-inset-bottom);}
.frpg::before{content:'';position:fixed;inset:0;pointer-events:none;z-index:0;background-image:repeating-linear-gradient(-45deg,rgba(255,255,255,0.012) 0px,rgba(255,255,255,0.012) 1px,transparent 1px,transparent 8px);}
.frpg>*{position:relative;z-index:1;}
.scroll-area{overflow-y:auto;padding:16px 16px calc(88px + env(safe-area-inset-bottom));height:calc(100svh - 52px);}
.topbar{height:52px;display:flex;align-items:center;justify-content:space-between;padding:0 18px;border-bottom:1px solid var(--border);background:rgba(6,8,16,0.93);backdrop-filter:blur(24px);position:sticky;top:0;z-index:10;}
.logo{font-family:'Rajdhani',sans-serif;font-weight:700;font-size:18px;letter-spacing:5px;color:#e2e8f0;}
.logo span{color:var(--accent);}
.tp-right{display:flex;align-items:center;gap:10px;}
.xp-pill{display:flex;align-items:center;gap:6px;background:rgba(245,158,11,0.08);border:1px solid rgba(245,158,11,0.2);border-radius:100px;padding:4px 12px;font-size:11px;font-weight:600;color:var(--muted2);}
.xp-pill b{color:var(--accent);font-size:12px;}
.streak-pill{display:flex;align-items:center;gap:5px;background:rgba(249,115,22,0.08);border:1px solid rgba(249,115,22,0.2);border-radius:100px;padding:4px 10px;font-size:11px;font-weight:600;}
.streak-num{color:#fb923c;font-size:13px;font-weight:700;font-family:'Rajdhani',sans-serif;}
.botnav{position:fixed;bottom:0;left:50%;transform:translateX(-50%);width:100%;max-width:430px;height:calc(60px + env(safe-area-inset-bottom));background:rgba(6,8,16,0.96);backdrop-filter:blur(24px);border-top:1px solid var(--border);display:flex;align-items:center;justify-content:space-around;z-index:10;padding-bottom:env(safe-area-inset-bottom);}
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
.today-zones{display:flex;flex-wrap:wrap;padding:10px 16px;gap:8px;border-top:1px solid rgba(245,158,11,.1);background:rgba(245,158,11,.03);}
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
.api-badge{font-size:9px;font-weight:600;padding:2px 6px;border-radius:4px;background:rgba(56,189,248,0.1);border:1px solid rgba(56,189,248,0.25);color:#38bdf8;margin-top:4px;display:inline-block;}
.exitem{display:flex;align-items:flex-start;gap:12px;padding:13px 16px;border-radius:12px;border:1px solid var(--border);background:var(--card);cursor:pointer;transition:all .18s;margin-bottom:6px;}
.exitem:hover{border-color:var(--border2);background:var(--card2);}
.exitem.done{background:rgba(74,222,128,.04);border-color:rgba(74,222,128,.2);}
.excheck{width:22px;height:22px;border-radius:50%;border:1.5px solid var(--muted);display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all .2s;margin-top:2px;}
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
.ex-timer-btn{display:flex;align-items:center;gap:4px;margin-top:5px;padding:4px 9px;border-radius:6px;border:1px solid rgba(56,189,248,0.3);background:rgba(56,189,248,0.06);color:#38bdf8;font-size:10px;font-weight:600;cursor:pointer;width:fit-content;}
.ex-timer-btn:hover{background:rgba(56,189,248,0.12);}
.ex-timer-btn.running{border-color:rgba(249,115,22,0.4);background:rgba(249,115,22,0.08);color:#fb923c;}
.zone-section-hdr{display:flex;align-items:center;justify-content:space-between;padding:12px 16px;border-radius:12px;border:1px solid var(--border);background:var(--card2);cursor:pointer;margin-bottom:6px;transition:border-color .2s;}
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
.day-summary{display:flex;align-items:center;justify-content:space-between;background:var(--card);border:1px solid var(--border2);border-radius:13px;padding:14px 16px;margin-bottom:16px;}
.day-xp-counter{text-align:right;}
.day-xp-val{font-family:'Rajdhani',sans-serif;font-size:28px;font-weight:700;color:var(--accent);line-height:1;}
.day-xp-lbl{font-size:10px;color:var(--muted);}
.loading-ex{display:flex;align-items:center;gap:8px;padding:12px 16px;border-radius:12px;border:1px solid var(--border);background:var(--card);margin-bottom:6px;color:var(--muted);font-size:12px;}
.loading-spinner{width:14px;height:14px;border:2px solid var(--border2);border-top-color:var(--accent);border-radius:50%;animation:spin .7s linear infinite;flex-shrink:0;}
@keyframes spin{to{transform:rotate(360deg)}}
.api-source{display:flex;align-items:center;gap:6px;font-size:10px;color:var(--muted2);padding:6px 0;margin-bottom:4px;}

/* ── TIMER MODAL ── */
.timer-overlay{position:fixed;inset:0;background:rgba(0,0,0,.92);display:flex;align-items:center;justify-content:center;z-index:200;padding:24px;backdrop-filter:blur(16px);animation:fin .2s ease;}
.timer-card{background:var(--card);border:1px solid rgba(56,189,248,.25);border-radius:24px;padding:36px 28px;text-align:center;max-width:300px;width:100%;animation:sin .28s cubic-bezier(.34,1.56,.64,1);}
.timer-name{font-size:13px;font-weight:600;color:var(--muted2);margin-bottom:8px;letter-spacing:.04em;}
.timer-ring{width:140px;height:140px;margin:0 auto 20px;position:relative;}
.timer-ring svg{width:140px;height:140px;transform:rotate(-90deg);}
.timer-ring-bg{fill:none;stroke:rgba(255,255,255,.05);stroke-width:8;}
.timer-ring-fill{fill:none;stroke:#38bdf8;stroke-width:8;stroke-linecap:round;transition:stroke-dashoffset .5s linear, stroke .3s;}
.timer-ring.done .timer-ring-fill{stroke:#4ade80;}
.timer-number{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-family:'Rajdhani',sans-serif;font-size:42px;font-weight:700;color:var(--text);}
.timer-number.done-txt{color:#4ade80;}
.timer-set{font-size:12px;color:var(--muted2);margin-bottom:20px;}
.timer-controls{display:flex;gap:10px;justify-content:center;}
.timer-btn{padding:10px 22px;border-radius:100px;font-family:'Rajdhani',sans-serif;font-size:13px;font-weight:700;cursor:pointer;transition:opacity .2s;}
.timer-btn-start{background:#38bdf8;color:#060810;border:none;}
.timer-btn-start.paused{background:#f59e0b;}
.timer-btn-reset{background:none;border:1px solid var(--border2);color:var(--muted2);}
.timer-btn-close{background:none;border:1px solid rgba(74,222,128,.3);color:#4ade80;}
.timer-sets-track{display:flex;gap:6px;justify-content:center;margin-bottom:16px;}
.timer-set-dot{width:8px;height:8px;border-radius:50%;background:rgba(255,255,255,.1);border:1px solid var(--border2);transition:all .3s;}
.timer-set-dot.done{background:#4ade80;border-color:#4ade80;}
.timer-set-dot.current{background:rgba(56,189,248,.4);border-color:#38bdf8;}
`;

// ─── ICONS ───────────────────────────────────────────────────────────────────
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
    shield:  "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
    swords:  "M14.5 17.5L3 6V3h3l11.5 11.5M13 19l2-2M3 21l3.5-3.5M21 3L3 21",
    check:   "M20 6L9 17l-5-5",
    arrow:   "M5 12h14M12 5l7 7-7 7",
    back:    "M19 12H5M12 19l-7-7 7-7",
    clock:   "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zM12 6v6l4 2",
    lock:    "M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2zM7 11V7a5 5 0 0 1 10 0v4",
    chevron: "M6 9l6 6 6-6",
    timer:   "M10 2h4M12 14l4-4M6.3 6.3A8 8 0 1 0 17.7 17.7",
    pause:   "M6 4h4v16H6zM14 4h4v16h-4z",
    play:    "M5 3l14 9-14 9V3z",
    refresh: "M1 4v6h6M23 20v-6h-6M20.49 9A9 9 0 0 0 5.64 5.64L1 10M23 14l-4.64 4.36A9 9 0 0 1 3.51 15",
    wifi:    "M1.42 9A16 16 0 0 1 22.58 9M5.51 12.95a10 10 0 0 1 12.98 0M10.98 17a5.01 5.01 0 0 1 2.04 0M12 20h.01",
    calendar:"M8 2v4M16 2v4M3 10h18M3 6h18a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1z",
    close:   "M18 6L6 18M6 6l12 12",
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

// ─── ZONE ILLUSTRATION ────────────────────────────────────────────────────────
const ZoneIllustration = ({ zoneId, size = 40, color = "#ffffff" }) => {
  const illustrations = {
    pecho:   (<svg width={size} height={size} viewBox="0 0 40 40" fill="none"><circle cx="20" cy="20" r="18" fill="rgba(244,63,94,0.12)" stroke="rgba(244,63,94,0.3)" strokeWidth="1"/><path d="M10 18c0-4 3-7 6-7 2 0 3 1 4 2 1-1 2-2 4-2 3 0 6 3 6 7 0 5-5 9-10 11C15 27 10 23 10 18z" fill={color} fillOpacity="0.9"/><path d="M20 13v16" stroke="rgba(0,0,0,0.15)" strokeWidth="1" strokeLinecap="round"/></svg>),
    espalda: (<svg width={size} height={size} viewBox="0 0 40 40" fill="none"><circle cx="20" cy="20" r="18" fill="rgba(56,189,248,0.12)" stroke="rgba(56,189,248,0.3)" strokeWidth="1"/><path d="M14 11h12v4l2 3-2 3v8H14v-8l-2-3 2-3V11z" fill={color} fillOpacity="0.9"/><path d="M14 15h12M14 21h12M20 11v18" stroke="rgba(0,0,0,0.15)" strokeWidth="1" strokeLinecap="round"/></svg>),
    piernas: (<svg width={size} height={size} viewBox="0 0 40 40" fill="none"><circle cx="20" cy="20" r="18" fill="rgba(74,222,128,0.12)" stroke="rgba(74,222,128,0.3)" strokeWidth="1"/><path d="M15 10h10l-2 10 3 10h-4l-2-8-2 8h-4l3-10L15 10z" fill={color} fillOpacity="0.9"/></svg>),
    core:    (<svg width={size} height={size} viewBox="0 0 40 40" fill="none"><circle cx="20" cy="20" r="18" fill="rgba(245,158,11,0.12)" stroke="rgba(245,158,11,0.3)" strokeWidth="1"/><rect x="14" y="11" width="12" height="18" rx="3" fill={color} fillOpacity="0.9"/><path d="M14 16h12M14 20h12M14 24h12" stroke="rgba(0,0,0,0.2)" strokeWidth="1.5" strokeLinecap="round"/></svg>),
    cardio:  (<svg width={size} height={size} viewBox="0 0 40 40" fill="none"><circle cx="20" cy="20" r="18" fill="rgba(192,132,252,0.12)" stroke="rgba(192,132,252,0.3)" strokeWidth="1"/><path d="M8 20h5l3-7 4 14 3-9 2 4 4-2" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" strokeOpacity="0.9"/></svg>),
    hombros: (<svg width={size} height={size} viewBox="0 0 40 40" fill="none"><circle cx="20" cy="20" r="18" fill="rgba(251,146,60,0.12)" stroke="rgba(251,146,60,0.3)" strokeWidth="1"/><circle cx="20" cy="15" r="5" fill={color} fillOpacity="0.9"/><path d="M10 25c0-4 4-6 10-6s10 2 10 6" fill={color} fillOpacity="0.7"/><path d="M8 22l4-3M32 22l-4-3" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeOpacity="0.9"/></svg>),
    brazos:  (<svg width={size} height={size} viewBox="0 0 40 40" fill="none"><circle cx="20" cy="20" r="18" fill="rgba(52,211,153,0.12)" stroke="rgba(52,211,153,0.3)" strokeWidth="1"/><path d="M14 28c0-6 2-10 4-12l2-4 2 4c2 2 4 6 4 12" fill={color} fillOpacity="0.8"/><path d="M16 18c1-2 6-2 8 0" stroke="rgba(0,0,0,0.2)" strokeWidth="1.5" strokeLinecap="round"/><circle cx="20" cy="12" r="3" fill={color} fillOpacity="0.7"/></svg>),
  };
  return illustrations[zoneId] ?? <div style={{width:size,height:size}}/>;
};

// ─── RANK BADGE ───────────────────────────────────────────────────────────────
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
      fontFamily: "'Rajdhani',sans-serif", flexShrink: 0,
      boxShadow: `0 0 12px ${c.border}40`,
    }}>
      {rank.short}
    </div>
  );
};

// ─── EXERCISE TIMER MODAL ─────────────────────────────────────────────────────
function ExerciseTimer({ exercise, onClose }) {
  const totalSecs = exercise.timerSecs ?? 30;
  const totalSets = exercise.sets ?? 3;
  const [currentSet, setCurrentSet] = useState(1);
  const [timeLeft, setTimeLeft] = useState(totalSecs);
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const [allDone, setAllDone] = useState(false);
  const intervalRef = useRef(null);

  const circumference = 2 * Math.PI * 56; // r=56
  const progress = (timeLeft / totalSecs);
  const dashOffset = circumference * (1 - progress);

  useEffect(() => {
    if (running && !finished) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            clearInterval(intervalRef.current);
            setRunning(false);
            setFinished(true);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [running, finished]);

  function handleNextSet() {
    if (currentSet >= totalSets) {
      setAllDone(true);
    } else {
      setCurrentSet(s => s + 1);
      setTimeLeft(totalSecs);
      setFinished(false);
      setRunning(false);
    }
  }

  function handleReset() {
    clearInterval(intervalRef.current);
    setTimeLeft(totalSecs);
    setRunning(false);
    setFinished(false);
  }

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const timeStr = mins > 0 ? `${mins}:${String(secs).padStart(2,"0")}` : `${secs}`;

  return (
    <div className="timer-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="timer-card">
        <div className="timer-name">{exercise.name.toUpperCase()}</div>

        {/* Set dots */}
        <div className="timer-sets-track">
          {Array.from({ length: totalSets }, (_, i) => (
            <div key={i} className={`timer-set-dot${i < currentSet - 1 ? " done" : i === currentSet - 1 ? " current" : ""}`} />
          ))}
        </div>
        <div className="timer-set">
          {allDone ? "¡Ejercicio completado!" : `Serie ${currentSet} de ${totalSets}`}
        </div>

        {/* Ring */}
        {!allDone && (
          <div className={`timer-ring${finished ? " done" : ""}`}>
            <svg viewBox="0 0 120 120">
              <circle className="timer-ring-bg" cx="60" cy="60" r="56"/>
              <circle
                className="timer-ring-fill"
                cx="60" cy="60" r="56"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                style={{ stroke: finished ? "#4ade80" : "#38bdf8" }}
              />
            </svg>
            <div className={`timer-number${finished ? " done-txt" : ""}`}>{timeStr}</div>
          </div>
        )}

        {allDone && (
          <div style={{ fontSize: 48, marginBottom: 20 }}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ margin: "0 auto", display: "block" }}>
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          </div>
        )}

        <div className="timer-controls">
          {!allDone ? (
            <>
              {!finished ? (
                <button
                  className={`timer-btn timer-btn-start${!running && timeLeft < totalSecs ? " paused" : ""}`}
                  onClick={() => setRunning(r => !r)}
                >
                  {running ? "Pausar" : timeLeft === totalSecs ? "Iniciar" : "Reanudar"}
                </button>
              ) : (
                <button className="timer-btn timer-btn-close" onClick={handleNextSet}>
                  {currentSet >= totalSets ? "Finalizar" : "Siguiente serie →"}
                </button>
              )}
              <button className="timer-btn timer-btn-reset" onClick={handleReset}>Reset</button>
            </>
          ) : (
            <button className="timer-btn timer-btn-close" onClick={onClose}>Cerrar ✓</button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function FitnessRPG() {
  const [user, setUser]           = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [state, setState]         = useState(DEFAULT_STATE);

  // Exercise cache from API
  const [apiExercises, setApiExercises] = useState({});
  const [apiLoading, setApiLoading]     = useState({});
  const [apiStatus, setApiStatus]       = useState("unknown"); // "ok" | "offline" | "unknown"

  const [view, setView]               = useState("home");
  const [activeDayIdx, setActiveDayIdx] = useState(null);
  const [activeZone, setActiveZone]   = useState(null);
  const [done, setDone]               = useState({});
  const [openZoneSections, setOpenZoneSections] = useState({});
  const [toast, setToast]             = useState(null);
  const [rankUp, setRankUp]           = useState(null);
  const [achToast, setAchToast]       = useState(null);
  const [activeTimer, setActiveTimer] = useState(null); // exercise object

  useEffect(() => {
    const el = document.createElement("style");
    el.textContent = STYLES;
    document.head.appendChild(el);
    return () => document.head.removeChild(el);
  }, []);

    // Verificar sesión al cargar
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        loadProfile(session.user.id);
      } else {
        setAuthReady(true);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) { setUser(null); setState(DEFAULT_STATE()); setAuthReady(true); }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Cargar perfil desde Supabase
  async function loadProfile(userId) {
    const { data } = await supabase
      .from("profiles")
      .select("state")
      .eq("id", userId)
      .single();
    if (data?.state && Object.keys(data.state).length > 0) {
      setState(prev => ({ ...DEFAULT_STATE(), ...data.state }));
    }
    setAuthReady(true);
  }

  // Guardar en Supabase cuando el estado cambia
  useEffect(() => {
    if (!user) return;
    const timer = setTimeout(async () => {
      await supabase.from("profiles").update({
        state,
        updated_at: new Date().toISOString(),
      }).eq("id", user.id);
    }, 1500); // debounce de 1.5s para no spamear
    return () => clearTimeout(timer);
  }, [state, user]);

  async function handleLogout() {
    await supabase.auth.signOut();
    setUser(null);
    setState(DEFAULT_STATE());
  }

  useEffect(() => {
    const earned = ACHIEVEMENTS.filter(a => a.cond(state));
    const newOnes = earned.filter(a => !state.achievements.includes(a.id));
    if (newOnes.length > 0) {
      setState(prev => ({ ...prev, achievements: [...prev.achievements, ...newOnes.map(a => a.id)] }));
      setAchToast(newOnes[0]);
      setTimeout(() => setAchToast(null), 3500);
    }
  }, [state.xp, state.totalSessions, state.streak, state.log]);

  // Load exercises from API for a given zone
  const loadZoneExercises = useCallback(async (zoneId) => {
    if (apiExercises[zoneId] || apiLoading[zoneId]) return;
    setApiLoading(prev => ({ ...prev, [zoneId]: true }));
    const data = await fetchExercisesForZone(zoneId);
    setApiLoading(prev => ({ ...prev, [zoneId]: false }));
    if (data) {
      setApiExercises(prev => ({ ...prev, [zoneId]: data }));
      setApiStatus("ok");
    } else {
      setApiStatus(prev => prev === "ok" ? "ok" : "offline");
    }
  }, [apiExercises, apiLoading]);

  // Get exercises for a zone (API if available, fallback otherwise)
  function getExercises(zoneId) {
    if (apiExercises[zoneId] && apiExercises[zoneId].length > 0) return apiExercises[zoneId];
    return FALLBACK_EXERCISES[zoneId] ?? [];
  }

  const dayIdx = new Date().getDay();
  const ridx   = dayIdx === 0 ? 6 : dayIdx - 1;
  const todayR = DAILY[ridx];
  const totalXP = Object.values(state.xp).reduce((a, b) => a + b, 0);
  const avgXP   = Math.floor(totalXP / ZONES.length);
  const gRank   = getRank(avgXP);

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  }

  function awardXP(zoneId, amount) {
    setState(prev => {
      const old = prev.xp[zoneId] ?? 0, nw = old + amount;
      if (getRank(nw).min > getRank(old).min) {
        const r = getRank(nw);
        setTimeout(() => setRankUp({ zone: ZONES.find(z => z.id === zoneId)?.label, rank: r }), 400);
      }
      return { ...prev, xp: { ...prev.xp, [zoneId]: nw } };
    });
  }

  function toggleExDay(ex, zoneId) {
    const zDone = done[zoneId] ?? new Set();
    const isDone = zDone.has(ex.name);
    setDone(prev => {
      const nxt = new Set(prev[zoneId] ?? []);
      if (isDone) nxt.delete(ex.name); else nxt.add(ex.name);
      return { ...prev, [zoneId]: nxt };
    });
    if (!isDone) {
      awardXP(zoneId, ex.xp);
      showToast(`+${ex.xp} XP · ${ex.name}`);
    } else {
      setState(prev => ({ ...prev, xp: { ...prev.xp, [zoneId]: Math.max(0, (prev.xp[zoneId] ?? 0) - ex.xp) } }));
    }
  }

  function openDay(idx) {
    const r = DAILY[idx];
    if (!r || r.zones.length === 0) return;
    setActiveDayIdx(idx);
    setDone({});
    const open = {};
    r.zones.forEach(z => { open[z] = true; });
    setOpenZoneSections(open);
    // Kick off API loads for all zones in this day
    r.zones.forEach(z => loadZoneExercises(z));
    setView("day");
  }

  function openZoneView(id) {
    setActiveZone(id);
    setDone({ [id]: new Set() });
    loadZoneExercises(id);
    setView("zone");
  }

  function getWeekStart() {
    const d = new Date();
    d.setDate(d.getDate() - d.getDay());
    return d.toLocaleDateString("es-CL");
  }

  function finishSession(zonesWorked, doneMap) {
    const totalDone = Object.values(doneMap).reduce((acc, s) => acc + s.size, 0);
    if (totalDone > 0) {
      const earnedXP = Object.entries(doneMap).reduce((acc, [zoneId, names]) => {
        return acc + getExercises(zoneId).filter(e => names.has(e.name)).reduce((a, e) => a + e.xp, 0);
      }, 0);
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
    setActiveZone(null);
    setDone({});
  }

  function NavBtn({ v, label, iconName }) {
    const isOn = view === v || (v === "routine" && view === "day");
    return (
      <button className={`bnbtn${isOn ? " on" : ""}`} onClick={() => setView(v)}>
        <Icon name={iconName} size={19} />
        <span className="bnlbl">{label}</span>
      </button>
    );
  }

  // ── HOME VIEW ────────────────────────────────────────────────────────────────
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

        {/* API status indicator */}
        {apiStatus !== "unknown" && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 10, color: apiStatus === "ok" ? "#4ade80" : "var(--muted)", marginTop: 10 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: apiStatus === "ok" ? "#4ade80" : "var(--muted)" }} />
            {apiStatus === "ok" ? "Ejercicios desde ExerciseDB API" : "Modo offline — ejercicios locales"}
          </div>
        )}

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
          <div className="today" onClick={() => openDay(ridx)}>
            <div className="today-header">
              <div>
                <div className="today-name">{todayR.label}</div>
                <div className="today-sub">{todayR.zones.length} zona{todayR.zones.length !== 1 ? "s" : ""} · toca para comenzar</div>
              </div>
              <div className="today-arrow"><Icon name="arrow" size={16} /></div>
            </div>
            <div className="today-zones">
              {todayR.zones.map(zid => {
                const z = ZONES.find(z => z.id === zid);
                return <div key={zid} className="today-zone-badge">{z?.label}</div>;
              })}
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
            const isRest  = r.zones.length === 0;
            const todayObj = new Date();
            const dayDiff  = i - (todayObj.getDay() === 0 ? 6 : todayObj.getDay() - 1);
            const targetDate = new Date(todayObj);
            targetDate.setDate(todayObj.getDate() + dayDiff);
            const dateStr  = targetDate.toLocaleDateString("es-CL");
            const hasDone  = state.log.some(l => l.date === dateStr);
            const isPast   = dayDiff < 0;
            return (
              <div key={r.day} className={`wday${isToday ? " on" : ""}${isRest ? " rest" : ""}${hasDone && !isToday ? " done" : ""}`}>
                <div className="wday-lbl">{r.day.slice(0,3)}</div>
                {isRest ? <span style={{fontSize:8}}>—</span>
                  : hasDone ? <div className="wday-dot" />
                  : isPast ? <span style={{fontSize:8,opacity:.4}}>○</span>
                  : <div className="wday-dot" style={{opacity:.2}} />}
              </div>
            );
          })}
        </div>

        <div className="sec">Zonas Musculares</div>
        <div className="zgrid">
          {ZONES.map(z => {
            const rank = getRank(state.xp[z.id] ?? 0);
            const pct  = xpPct(state.xp[z.id] ?? 0);
            const hasApi = !!apiExercises[z.id];
            return (
              <button key={z.id} className="zcard" onClick={() => openZoneView(z.id)}
                style={{ "--zbg": z.bg, "--zacc": z.accentDark }}>
                <div className="z-top">
                  <ZoneIllustration zoneId={z.id} size={38} color={z.accentDark} />
                  <RankBadge rank={rank} size={28} />
                </div>
                <div className="z-lbl">{z.label}</div>
                <div className="z-rank">{rank.name}</div>
                {hasApi && <div className="api-badge">API</div>}
                <div className="z-bar">
                  <div className="z-bar-fill" style={{ width: `${pct}%`, background: z.accentDark }} />
                </div>
                <div className="z-xp">{state.xp[z.id] ?? 0} / {getNextRank(state.xp[z.id] ?? 0)?.min ?? "MAX"} XP</div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // ── ROUTINE VIEW ─────────────────────────────────────────────────────────────
  function RoutineView() {
    return (
      <div>
        <div className="pg-title">Plan Semanal</div>
        <div className="pg-sub">Toca un día para comenzar a entrenar</div>
        {DAILY.map((r, i) => {
          const isToday = i === ridx;
          const isRest  = r.zones.length === 0;
          const potentialXP = r.zones.reduce((acc, zid) => acc + getExercises(zid).reduce((a, e) => a + e.xp, 0), 0);
          return (
            <div key={r.day}
              className={`rrow${isRest ? " rest-row" : ""}`}
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
                  {r.day.slice(0,3).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 500, fontSize: 13, display: "flex", alignItems: "center", gap: 8 }}>
                    {r.label}
                    {isToday && <span style={{ fontSize: 9, color: "var(--accent)", fontWeight: 700 }}>HOY</span>}
                  </div>
                  <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 2 }}>
                    {r.zones.length > 0
                      ? `${r.zones.map(zid => ZONES.find(z => z.id === zid)?.label).join(" + ")} · hasta +${potentialXP} XP`
                      : "Descanso activo"}
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span className={`rrow-type type-${r.type}`}>{r.type.toUpperCase()}</span>
                {!isRest && <Icon name="arrow" size={14} color="var(--muted)" />}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // ── EXERCISE LIST (shared between day and zone views) ─────────────────────
  function ExerciseList({ zoneId, zoneDone, onToggle }) {
    const exercises  = getExercises(zoneId);
    const isLoading  = apiLoading[zoneId];
    const fromApi    = exercises.length > 0 && exercises[0]?.fromApi;
    const levelLabels = { 1: "Principiante", 2: "Intermedio", 3: "Avanzado", 4: "Élite" };

    if (isLoading) {
      return (
        <div>
          {[1,2,3].map(i => (
            <div key={i} className="loading-ex">
              <div className="loading-spinner" />
              Cargando ejercicios desde API...
            </div>
          ))}
        </div>
      );
    }

    return (
      <div>
        {fromApi && (
          <div className="api-source">
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#38bdf8" }} />
            Ejercicios desde ExerciseDB API
          </div>
        )}
        {[1, 2, 3, 4].map(lvl => {
          const lvlExs = exercises.filter(e => e.level === lvl);
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
                    onClick={() => onToggle(ex)}>
                    <div className="excheck" onClick={e => { e.stopPropagation(); onToggle(ex); }}>
                      {isDone && <Icon name="check" size={12} color="#07090f" />}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div className="exname">{ex.name}</div>
                      <div className="exmeta">{ex.sets} series × {ex.reps}</div>
                      <div className="ex-muscle">{ex.muscle}</div>
                      {/* Timer button for timed exercises */}
                      {ex.timed && ex.timerSecs && (
                        <button
                          className="ex-timer-btn"
                          onClick={e => { e.stopPropagation(); setActiveTimer(ex); }}
                        >
                          <Icon name="timer" size={11} color="currentColor" />
                          Cronometrar ({ex.timerSecs}s × {ex.sets} series)
                        </button>
                      )}
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
    );
  }

  // ── DAY VIEW ─────────────────────────────────────────────────────────────────
  function DayView() {
    if (activeDayIdx === null) return null;
    const dayRoutine = DAILY[activeDayIdx];
    const isToday = activeDayIdx === ridx;
    const totalDoneCount = Object.values(done).reduce((acc, s) => acc + s.size, 0);
    const totalEarnedXP  = Object.entries(done).reduce((acc, [zoneId, names]) => {
      return acc + getExercises(zoneId).filter(e => names.has(e.name)).reduce((a, e) => a + e.xp, 0);
    }, 0);

    return (
      <div>
        <button className="back" onClick={() => finishSession(
          Object.keys(done).filter(z => done[z].size > 0), done
        )}>
          <Icon name="back" size={16} /> {totalDoneCount > 0 ? "Guardar y volver" : "Volver"}
        </button>
        <div style={{ marginBottom: 6 }}>
          <div className="pg-title" style={{ marginBottom: 2 }}>{dayRoutine.label}</div>
          <div style={{ fontSize: 11, color: "var(--muted2)" }}>
            {dayRoutine.day}{isToday ? " · Hoy" : ""}
            {" · "}{dayRoutine.zones.map(zid => ZONES.find(z => z.id === zid)?.label).join(" + ")}
          </div>
        </div>

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

        {dayRoutine.zones.map(zoneId => {
          const z = ZONES.find(z => z.id === zoneId);
          const zoneDone = done[zoneId] ?? new Set();
          const isOpen = openZoneSections[zoneId] ?? false;
          const exs = getExercises(zoneId);
          const zoneEarned = exs.filter(e => zoneDone.has(e.name)).reduce((a, e) => a + e.xp, 0);
          const rank = getRank(state.xp[zoneId] ?? 0);

          return (
            <div key={zoneId}>
              <div
                className={`zone-section-hdr${isOpen ? " open" : ""}`}
                onClick={() => setOpenZoneSections(prev => ({ ...prev, [zoneId]: !prev[zoneId] }))}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <ZoneIllustration zoneId={zoneId} size={36} color={z.accentDark} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14, display: "flex", alignItems: "center", gap: 8 }}>
                      {z.label}
                      {apiLoading[zoneId] && (
                        <div className="loading-spinner" style={{ width: 10, height: 10, borderWidth: 1.5 }} />
                      )}
                      {zoneDone.size > 0 && (
                        <span style={{ fontSize: 10, color: "#4ade80", fontWeight: 700 }}>
                          {zoneDone.size}/{exs.length} ✓
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 10, color: "var(--muted2)", marginTop: 2 }}>
                      {rank.name} · {state.xp[zoneId] ?? 0} XP
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

              {isOpen && (
                <div className="zone-section-body">
                  <ExerciseList
                    zoneId={zoneId}
                    zoneDone={zoneDone}
                    onToggle={ex => toggleExDay(ex, zoneId)}
                  />
                </div>
              )}
            </div>
          );
        })}

        <button
          className="save-btn"
          onClick={() => finishSession(Object.keys(done).filter(z => done[z].size > 0), done)}
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

  // ── ZONE VIEW ─────────────────────────────────────────────────────────────────
  function ZoneView() {
    if (!activeZone) return null;
    const z   = ZONES.find(z => z.id === activeZone);
    const exs = getExercises(activeZone);
    const zoneDone = done[activeZone] ?? new Set();
    const earned = exs.filter(e => zoneDone.has(e.name)).reduce((a, e) => a + e.xp, 0);
    const rank   = getRank(state.xp[activeZone] ?? 0);
    const pct    = xpPct(state.xp[activeZone] ?? 0);

    return (
      <div>
        <button className="back" onClick={() => finishSession(
          zoneDone.size > 0 ? [activeZone] : [], done
        )}>
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
                {apiLoading[activeZone] && <div className="loading-spinner" />}
              </div>
              <div style={{ fontSize: 11, color: "var(--muted2)" }}>{rank.name} · {state.xp[activeZone] ?? 0} XP</div>
              {apiExercises[activeZone] && (
                <div className="api-badge" style={{ marginTop: 4 }}>ExerciseDB API</div>
              )}
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
            <span>{state.xp[activeZone] ?? 0} XP</span>
            <span>{getNextRank(state.xp[activeZone] ?? 0) ? `${getNextRank(state.xp[activeZone] ?? 0).min - (state.xp[activeZone] ?? 0)} para ${getNextRank(state.xp[activeZone] ?? 0).name}` : "Rango máximo"}</span>
          </div>
        </div>

        <ExerciseList
          zoneId={activeZone}
          zoneDone={zoneDone}
          onToggle={ex => toggleExDay(ex, activeZone)}
        />

        {zoneDone.size > 0 && (
          <button className="save-btn" onClick={() => finishSession([activeZone], done)}>
            Completar — {zoneDone.size} ejercicio{zoneDone.size !== 1 ? "s" : ""} · +{earned} XP
          </button>
        )}
      </div>
    );
  }

  // ── STATS VIEW ────────────────────────────────────────────────────────────────
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
          const xp = state.xp[z.id] ?? 0, rank = getRank(xp), pct = xpPct(xp), next = getNextRank(xp);
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
            setApiExercises({});
            setView("home");
          }
        }}>
          Reiniciar todo el progreso
        </button>
      </div>
    );
  }
    if (!authReady) {
    return (
      <div style={{
        minHeight: "100svh", background: "#060810",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: "50%",
          border: "2px solid rgba(245,158,11,0.2)",
          borderTopColor: "#f59e0b",
          animation: "spin 0.7s linear infinite",
        }} />
      </div>
    );
  }

  if (!user) return <AuthScreen onAuth={(u) => { setUser(u); loadProfile(u.id); }} />;
  // ── RENDER ───────────────────────────────────────────────────────────────────
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
      {/* Exercise Timer Modal */}
      {activeTimer && (
        <ExerciseTimer
          exercise={activeTimer}
          onClose={() => setActiveTimer(null)}
        />
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
          <button onClick={handleLogout} style={{
            background: "none", border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "100px", padding: "4px 10px",
            color: "#4a5568", fontSize: 10, fontWeight: 600,
            cursor: "pointer", letterSpacing: "0.05em",
          }}>
            Salir
          </button>
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