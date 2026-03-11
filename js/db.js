// ── db.js ─────────────────────────────────────────────────────────────────────

const NUTRITION = {
  dog:  { calories: 340, protein: 26, fat: 14, carbs: 36, servingG: 85,  fiber: 3.2 },
  cat:  { calories: 220, protein: 32, fat: 12, carbs: 8,  servingG: 60,  fiber: 1.8 },
  fish: { calories: 15,  protein: 2,  fat: 0.5,carbs: 1.5,servingG: 5,   fiber: 0   },
};

const PET_LABEL = { dog: 'Dog', cat: 'Cat', fish: 'Fish' };
const PET_COLOR = { dog: '#c2541a', cat: '#7c4db5', fish: '#1078a0' };
const PET_BG    = { dog: 'rgba(194,84,26,.08)',  cat: 'rgba(124,77,181,.08)',  fish: 'rgba(16,120,160,.08)' };
const PET_BR    = { dog: 'rgba(194,84,26,.2)',   cat: 'rgba(124,77,181,.2)',   fish: 'rgba(16,120,160,.2)'  };

function uid()  { return Math.random().toString(36).slice(2, 9); }
function now()  { return Date.now(); }

function timeAgo(ts) {
  if (!ts) return 'Never';
  const s = Math.floor((now() - ts) / 1000);
  if (s < 60)    return `${s}s ago`;
  if (s < 3600)  return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}
function fmtTime(ts) {
  if (!ts) return '\u2014';
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
function fmtDate(ts) {
  if (!ts) return '';
  return new Date(ts).toLocaleDateString([], { month: 'short', day: 'numeric' });
}
function isToday(ts) {
  const d = new Date(ts), n = new Date();
  return d.getDate() === n.getDate() && d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear();
}

const DB = {
  get(k, d) { try { const v = localStorage.getItem(k); return v !== null ? JSON.parse(v) : d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};

const State = {
  pets:      DB.get('sp_pets',  []),
  logs:      DB.get('sp_logs',  []),
  schedules: DB.get('sp_sched', []),

  save() { DB.set('sp_pets', this.pets); },
  saveLogs()  { DB.set('sp_logs',  this.logs); },
  saveScheds(){ DB.set('sp_sched', this.schedules); },

  addPet(p)    { this.pets.push(p); this.save(); },
  removePet(id){ this.pets = this.pets.filter(p => p.id !== id); this.save(); },
  updatePet(id, ch) { this.pets = this.pets.map(p => p.id === id ? { ...p, ...ch } : p); this.save(); },
  getPet(id)   { return this.pets.find(p => p.id === id); },

  addLog(entry) {
    this.logs.unshift({ id: uid(), ...entry, ts: now() });
    this.logs = this.logs.slice(0, 300);
    this.saveLogs();
  },
  todayLogs()  { return this.logs.filter(l => isToday(l.ts)); },
  todayKcal()  { return this.todayLogs().filter(l => l.type === 'food').reduce((a, l) => a + (NUTRITION[l.petType]?.calories || 0), 0); },
  totalFeeds() { return this.logs.filter(l => l.type === 'food').length; },
  totalWater() { return this.logs.filter(l => l.type === 'water').length; },

  addSchedule(s)    { this.schedules.push(s); this.saveScheds(); },
  removeSchedule(id){ this.schedules = this.schedules.filter(s => s.id !== id); this.saveScheds(); },
  toggleSchedule(id){ this.schedules = this.schedules.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s); this.saveScheds(); },
};
