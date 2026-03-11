// ── app.js ────────────────────────────────────────────────────────────────────

// PWA registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));
}

// Load TensorFlow.js + MobileNet
(function () {
  const tf = document.createElement('script');
  tf.src = 'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.10.0/dist/tf.min.js';
  tf.onload = () => {
    const mn = document.createElement('script');
    mn.src = 'https://cdn.jsdelivr.net/npm/@tensorflow-models/mobilenet@2.1.0/dist/mobilenet.min.js';
    document.head.appendChild(mn);
  };
  document.head.appendChild(tf);
})();

// ── Camera instances ──────────────────────────────────────────────────────────
const regCam  = new CameraManager();
const scanCam = new CameraManager();

// ── PWA install ───────────────────────────────────────────────────────────────
let deferredPrompt = null;
window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  deferredPrompt = e;
  document.getElementById('install-banner').classList.remove('hidden');
});
document.getElementById('install-banner').addEventListener('click', async () => {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  if (outcome === 'accepted') {
    document.getElementById('install-banner').classList.add('hidden');
    toast('SmartPaw installed successfully.', 'success');
  }
  deferredPrompt = null;
});

// ── Toast ─────────────────────────────────────────────────────────────────────
function toast(msg, type = 'success', ms = 3200) {
  const wrap = document.getElementById('toast-wrap');
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  const icon = { success: Icons.check(14), error: Icons.x(14), info: Icons.info(14), warning: Icons.info(14) }[type] || '';
  el.innerHTML = `${icon}<span>${escHtml(msg)}</span>`;
  wrap.appendChild(el);
  setTimeout(() => {
    el.style.transition = 'all .25s ease';
    el.style.opacity = '0';
    el.style.transform = 'translateY(-6px)';
    setTimeout(() => el.remove(), 260);
  }, ms);
}

// ── Tab routing ───────────────────────────────────────────────────────────────
let currentTab = 'dash';

function switchTab(id) {
  document.querySelectorAll('.tab-page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(`page-${id}`).classList.add('active');
  document.querySelector(`.tab-btn[data-tab="${id}"]`).classList.add('active');
  document.getElementById('tb-page').textContent = ({ dash: 'Dashboard', log: 'Activity', scan: 'Scanner', sched: 'Schedule', config: 'Config' })[id];
  currentTab = id;

  if (id !== 'scan') { scanCam.stop(); resetScanUI(); }
  if (id !== 'dash')  regCam.stop();

  if (id === 'dash')  renderDash();
  if (id === 'log')   renderLog();
  if (id === 'sched') renderSched();
}

document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => switchTab(btn.dataset.tab));
});

// ── Greeting ──────────────────────────────────────────────────────────────────
function setGreeting() {
  const h = new Date().getHours();
  const g = h < 5 ? 'Good night' : h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : h < 21 ? 'Good evening' : 'Good night';
  document.getElementById('greeting-text').textContent = g;
  const n = State.pets.length;
  document.getElementById('greeting-sub').textContent = n === 0
    ? 'Register your first pet to get started.'
    : `${n} pet${n !== 1 ? 's' : ''} registered. All systems operational.`;
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
function renderDash() {
  setGreeting();
  document.getElementById('sum-pets').textContent     = State.pets.length;
  document.getElementById('sum-feedings').textContent = State.totalFeeds();
  document.getElementById('sum-today').textContent    = State.todayLogs().filter(l => l.type === 'food').length;
  document.getElementById('pet-count-label').textContent = `${State.pets.length} unit${State.pets.length !== 1 ? 's' : ''}`;

  const container = document.getElementById('pet-list');
  container.innerHTML = '';

  if (State.pets.length === 0) {
    container.innerHTML = `<div class="empty">
      <div class="empty-icon">${Icons.paw(40)}</div>
      <div class="empty-title">No pets registered</div>
      <div class="empty-sub">Tap "Register New Pet" to get started</div>
    </div>`;
    return;
  }

  State.pets.forEach(pet => {
    const nut   = NUTRITION[pet.type];
    const color = PET_COLOR[pet.type];
    const bg    = PET_BG[pet.type];
    const br    = PET_BR[pet.type];
    const total = nut.protein + nut.fat + nut.carbs;
    const petIcon = { dog: Icons.dog(20), cat: Icons.cat(20), fish: Icons.fish(20) }[pet.type];

    const card = document.createElement('div');
    card.className = 'pet-card';
    card.innerHTML = `
      <div class="pet-card-header">
        <div class="pet-avatar-wrap">
          <div class="pet-avatar" style="border-color:${br};">
            ${pet.photo ? `<img src="${pet.photo}" alt="${escHtml(pet.name)}">` : ''}
            <span class="pet-avatar-icon" style="color:${color};">${petIcon}</span>
          </div>
          <div class="pet-status" style="background:${color};box-shadow:0 0 0 2px #fff,0 0 0 3px ${color};"></div>
        </div>
        <div class="pet-info">
          <div class="pet-name">${escHtml(pet.name)}</div>
          <div class="pet-tags">
            <span class="tag tag-type">${PET_LABEL[pet.type]}</span>
            <span class="tag tag-meals">${pet.totalFeedings || 0} meals</span>
          </div>
        </div>
        <button class="del-btn" data-del="${pet.id}" title="Remove">${Icons.trash(14)}</button>
      </div>

      <div class="stat-row">
        <div class="stat-cell">
          <div class="stat-cell-label">Last Fed</div>
          <div class="stat-cell-val" style="color:var(--gr);">${timeAgo(pet.lastFed)}</div>
        </div>
        <div class="stat-cell">
          <div class="stat-cell-label">Last Water</div>
          <div class="stat-cell-val" style="color:var(--cy);">${timeAgo(pet.lastWatered)}</div>
        </div>
      </div>

      <div class="nut-section">
        <div class="nut-label">Nutrition — ${nut.servingG}g serving</div>
        <div class="nut-grid">
          ${[
            { l: 'Protein', v: nut.protein, u: 'g', p: (nut.protein/total)*100, c: 'var(--gr)' },
            { l: 'Fat',     v: nut.fat,     u: 'g', p: (nut.fat/total)*100,     c: 'var(--wa)' },
            { l: 'Carbs',   v: nut.carbs,   u: 'g', p: (nut.carbs/total)*100,   c: 'var(--ac)' },
            { l: 'kcal',    v: nut.calories,u: '',  p: Math.min((nut.calories/400)*100,100), c: color },
          ].map(r => `<div class="nut-row">
            <div class="nut-lbl">${r.l}</div>
            <div class="nut-bar"><div class="nut-fill" style="width:${r.p.toFixed(1)}%;background:${r.c};"></div></div>
            <div class="nut-val">${r.v}${r.u}</div>
          </div>`).join('')}
        </div>
      </div>

      <div class="action-row">
        <button class="btn-feed" data-feed="${pet.id}" style="background:${color};">
          ${Icons.utensils(14)} Feed ${escHtml(pet.name)}
        </button>
        <button class="btn-water" data-water="${pet.id}" title="Water">${Icons.droplets(16)}</button>
      </div>`;

    container.appendChild(card);
  });

  container.querySelectorAll('[data-del]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const p = State.getPet(btn.dataset.del);
      if (p && confirm(`Remove ${p.name}?`)) {
        State.removePet(p.id);
        renderDash();
        updateTopbar();
        toast(`${p.name} removed.`, 'info');
      }
    });
  });
  container.querySelectorAll('[data-feed]').forEach(btn => btn.addEventListener('click', () => openConfirmFeed(btn.dataset.feed)));
  container.querySelectorAll('[data-water]').forEach(btn => btn.addEventListener('click', () => doWater(btn.dataset.water)));
}

// ── Confirm feed ──────────────────────────────────────────────────────────────
let confirmPetId = null;

function openConfirmFeed(id) {
  const pet = State.getPet(id); if (!pet) return;
  const nut = NUTRITION[pet.type];
  const color = PET_COLOR[pet.type];
  const br    = PET_BR[pet.type];
  confirmPetId = id;
  const total = nut.protein + nut.fat + nut.carbs;
  const petIcon = { dog: Icons.dog(22), cat: Icons.cat(22), fish: Icons.fish(22) }[pet.type];

  document.getElementById('confirm-avatar').innerHTML = pet.photo ? `<img src="${pet.photo}" alt="">` : `<span style="color:${color};">${petIcon}</span>`;
  document.getElementById('confirm-avatar').style.borderColor = br;
  document.getElementById('confirm-name').textContent = pet.name;
  document.getElementById('confirm-sub').textContent  = `${PET_LABEL[pet.type]} — ${nut.servingG}g serving`;
  document.getElementById('confirm-kcal').textContent = `${nut.calories} kcal`;
  document.getElementById('confirm-kcal').style.cssText = `color:${color};background:${PET_BG[pet.type]};border:1px solid ${br};`;

  const foodNote = document.getElementById('confirm-food-note-wrap');
  foodNote.classList.toggle('hidden', !pet.foodPref);
  if (pet.foodPref) document.getElementById('confirm-food-note').textContent = pet.foodPref;

  document.getElementById('confirm-nut').innerHTML = [
    { l: 'Protein', v: nut.protein, u: 'g', p: (nut.protein/total)*100, c: 'var(--gr)' },
    { l: 'Fat',     v: nut.fat,     u: 'g', p: (nut.fat/total)*100,     c: 'var(--wa)' },
    { l: 'Carbs',   v: nut.carbs,   u: 'g', p: (nut.carbs/total)*100,   c: 'var(--ac)' },
    { l: 'kcal',    v: nut.calories,u: '',  p: Math.min((nut.calories/400)*100,100), c: color },
  ].map(r => `<div class="nut-row">
    <div class="nut-lbl">${r.l}</div>
    <div class="nut-bar"><div class="nut-fill" style="width:${r.p.toFixed(1)}%;background:${r.c};"></div></div>
    <div class="nut-val">${r.v}${r.u}</div>
  </div>`).join('');

  showModal('modal-confirm');
}

async function doFeed(id) {
  const pet = State.getPet(id); if (!pet) return;
  hideModal('modal-confirm');

  const btn = document.querySelector(`[data-feed="${id}"]`);
  if (btn) { btn.disabled = true; btn.innerHTML = `${Icons.clock(14)} Dispensing...`; btn.classList.add('feeding'); }

  const r = await AdafruitIO.sendFeed(pet.feedName);

  if (btn) {
    btn.disabled = false; btn.classList.remove('feeding');
    btn.innerHTML = `${Icons.utensils(14)} Feed ${escHtml(pet.name)}`;
  }

  State.updatePet(id, { lastFed: now(), totalFeedings: (pet.totalFeedings || 0) + 1 });
  State.addLog({ petId: id, petName: pet.name, petType: pet.type, type: 'food' });
  renderDash();
  if (currentTab === 'log') renderLog();

  if (r.ok) {
    toast(`Feeding ${pet.name}${r.demo ? ' (demo mode)' : ''}.`, 'success');
    pushNotify('SmartPaw', `Feeding ${pet.name} — ${NUTRITION[pet.type].calories} kcal`);
  } else {
    toast('IoT command failed. Check settings.', 'error');
  }
}

function doWater(id) {
  const pet = State.getPet(id); if (!pet) return;
  State.updatePet(id, { lastWatered: now(), totalWaterings: (pet.totalWaterings || 0) + 1 });
  State.addLog({ petId: id, petName: pet.name, petType: pet.type, type: 'water' });
  renderDash();
  if (currentTab === 'log') renderLog();
  toast(`Water dispensed for ${pet.name}.`, 'info');
}

// ── Add pet modal ─────────────────────────────────────────────────────────────
let regDetected = null;

function openAddPet() {
  regDetected = null;
  document.getElementById('reg-name').value = '';
  document.getElementById('reg-food').value = '';
  document.getElementById('reg-type-val').value = '';
  document.getElementById('reg-detected').classList.add('hidden');
  document.getElementById('reg-preview').style.display = 'none';
  document.getElementById('reg-cam-hint').style.display = 'flex';
  document.getElementById('reg-video').style.display = 'none';
  regCam.reset();
  resetRegButtons();
  document.querySelectorAll('.type-opt').forEach(o => o.classList.remove('sel'));
  showModal('modal-add');
}

function resetRegButtons() {
  document.getElementById('reg-btn-start').classList.remove('hidden');
  document.getElementById('reg-btn-capture').classList.add('hidden');
  document.getElementById('reg-btn-retake').classList.add('hidden');
  document.getElementById('reg-btn-stop').classList.add('hidden');
}

async function regStartCamera() {
  const v = document.getElementById('reg-video');
  const c = document.getElementById('reg-canvas');
  regCam.init(v, c);
  const ok = await regCam.start();
  if (!ok) { toast('Camera unavailable.', 'error'); return; }
  v.style.display = 'block';
  document.getElementById('reg-cam-hint').style.display = 'none';
  document.getElementById('reg-btn-start').classList.add('hidden');
  document.getElementById('reg-btn-capture').classList.remove('hidden');
  document.getElementById('reg-btn-stop').classList.remove('hidden');
}

async function regCapture() {
  const canvas = regCam.capture(); if (!canvas) return;
  document.getElementById('reg-preview').src = regCam.captured;
  document.getElementById('reg-preview').style.display = 'block';
  document.getElementById('reg-video').style.display   = 'none';
  document.getElementById('reg-cam-hint').style.display = 'none';
  document.getElementById('reg-btn-capture').classList.add('hidden');
  document.getElementById('reg-btn-stop').classList.add('hidden');
  document.getElementById('reg-btn-retake').classList.remove('hidden');
  await runMLDetection(canvas);
}

async function runMLDetection(canvas) {
  const ov = document.getElementById('reg-overlay');
  ov.textContent = 'Scanning...'; ov.classList.remove('hidden');
  const detected = await regCam.detect(canvas);
  ov.classList.add('hidden');
  if (detected) {
    regDetected = detected;
    document.getElementById('reg-type-val').value = detected;
    document.getElementById('reg-detected-text').textContent = `Detected: ${PET_LABEL[detected]}`;
    document.getElementById('reg-detected').classList.remove('hidden');
    document.querySelectorAll('.type-opt').forEach(o => o.classList.toggle('sel', o.dataset.type === detected));
  } else {
    toast('Could not detect pet type — please select manually.', 'warning');
  }
}

function regRetake() {
  regCam.reset();
  document.getElementById('reg-preview').style.display = 'none';
  document.getElementById('reg-video').style.display   = 'none';
  document.getElementById('reg-cam-hint').style.display = 'flex';
  document.getElementById('reg-detected').classList.add('hidden');
  document.getElementById('reg-btn-retake').classList.add('hidden');
  document.getElementById('reg-btn-start').classList.remove('hidden');
}

async function regFromFile(input) {
  const file = input.files[0]; if (!file) return;
  const url = await regCam.fromFile(file);
  const img  = document.getElementById('reg-preview');
  img.src = url; img.style.display = 'block';
  document.getElementById('reg-cam-hint').style.display = 'none';
  document.getElementById('reg-btn-retake').classList.remove('hidden');
  document.getElementById('reg-btn-start').classList.add('hidden');
  img.onload = async () => {
    const c = document.getElementById('reg-canvas');
    c.width = img.naturalWidth || 320; c.height = img.naturalHeight || 320;
    c.getContext('2d').drawImage(img, 0, 0);
    await runMLDetection(c);
  };
}

document.querySelectorAll('.type-opt').forEach(opt => {
  opt.addEventListener('click', () => {
    document.getElementById('reg-type-val').value = opt.dataset.type;
    document.querySelectorAll('.type-opt').forEach(o => o.classList.remove('sel'));
    opt.classList.add('sel');
  });
});

function submitAddPet() {
  const name = document.getElementById('reg-name').value.trim();
  const type = document.getElementById('reg-type-val').value;
  const food = document.getElementById('reg-food').value.trim();
  if (!name) { toast('Please enter a pet name.', 'error'); return; }
  if (!type) { toast('Please select a pet type.', 'error'); return; }

  State.addPet({
    id: uid(), name, type, foodPref: food,
    photo: regCam.captured || null,
    feedName: `feed-${name.toLowerCase().replace(/\s+/g, '-')}`,
    lastFed: null, lastWatered: null,
    totalFeedings: 0, totalWaterings: 0, createdAt: now()
  });
  hideModal('modal-add');
  regCam.reset();
  renderDash(); updateTopbar();
  toast(`${name} has been registered.`, 'success');
}

// ── Log tab ───────────────────────────────────────────────────────────────────
let logFilter = 'all';

function renderLog() {
  document.getElementById('log-kcal').textContent        = State.todayKcal();
  document.getElementById('log-today-sub').textContent   = `${State.todayLogs().filter(l => l.type === 'food').length} feedings today`;
  document.getElementById('log-total-feed').textContent  = State.totalFeeds();
  document.getElementById('log-total-water').textContent = State.totalWater();
  document.getElementById('log-today-count').textContent = State.todayLogs().filter(l => l.type === 'food').length;
  document.getElementById('log-all-kcal').textContent    = State.logs.filter(l => l.type === 'food').reduce((a, l) => a + (NUTRITION[l.petType]?.calories || 0), 0);

  const logs   = logFilter === 'all' ? State.logs : State.logs.filter(l => l.type === logFilter);
  const list   = document.getElementById('log-list');

  if (logs.length === 0) {
    list.innerHTML = `<div class="empty" style="padding:28px"><div class="empty-icon">${Icons.barChart(36)}</div><div class="empty-title">No activity yet</div></div>`;
    return;
  }

  list.innerHTML = logs.slice(0, 100).map(log => {
    const isFood = log.type === 'food';
    const nut    = NUTRITION[log.petType] || {};
    return `<div class="log-item">
      <div class="log-icon-wrap" style="background:${isFood ? 'var(--gr-bg)' : 'rgba(15,126,158,.07)'}; color:${isFood ? 'var(--gr)' : 'var(--cy)'};">
        ${isFood ? Icons.utensils(15) : Icons.droplets(15)}
      </div>
      <div>
        <div class="log-name">${escHtml(log.petName)}</div>
        <div class="log-detail">${isFood ? `${nut.servingG || 0}g &middot; ${nut.calories || 0} kcal` : 'Water dispensed'}</div>
      </div>
      <div class="log-time">
        <div class="log-time-main">${fmtTime(log.ts)}</div>
        <div class="log-time-date">${fmtDate(log.ts)}</div>
      </div>
    </div>`;
  }).join('');
}

document.querySelectorAll('.filter-pill').forEach(pill => {
  pill.addEventListener('click', () => {
    document.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('on'));
    pill.classList.add('on');
    logFilter = pill.dataset.filter;
    renderLog();
  });
});

// ── Scan tab ──────────────────────────────────────────────────────────────────
function resetScanUI() {
  scanCam.reset();
  document.getElementById('scan-video').style.display    = 'none';
  document.getElementById('scan-preview').style.display  = 'none';
  document.getElementById('scan-icon-wrap').style.display = 'block';
  document.getElementById('scan-status').textContent     = 'Camera off';
  document.getElementById('scan-status').className       = 'scan-status';
  document.getElementById('scan-result-box').classList.add('hidden');
  document.getElementById('scan-line').style.display     = 'none';
  document.getElementById('scan-btn-start').classList.remove('hidden');
  document.getElementById('scan-btn-scan').classList.add('hidden');
  document.getElementById('scan-btn-again').classList.add('hidden');
  document.getElementById('scan-btn-stop').classList.add('hidden');
}

async function scanStart() {
  const v = document.getElementById('scan-video'), c = document.getElementById('scan-canvas');
  scanCam.init(v, c);
  const ok = await scanCam.start();
  if (!ok) { toast('Camera unavailable.', 'error'); return; }
  v.style.display = 'block';
  document.getElementById('scan-icon-wrap').style.display = 'none';
  document.getElementById('scan-line').style.display     = 'block';
  document.getElementById('scan-status').textContent     = 'Ready to scan';
  document.getElementById('scan-status').className       = 'scan-status ready';
  document.getElementById('scan-btn-start').classList.add('hidden');
  document.getElementById('scan-btn-scan').classList.remove('hidden');
  document.getElementById('scan-btn-stop').classList.remove('hidden');
}

async function scanNow() {
  const canvas = scanCam.capture(); if (!canvas) return;
  document.getElementById('scan-video').style.display   = 'none';
  document.getElementById('scan-preview').src = scanCam.captured;
  document.getElementById('scan-preview').style.display = 'block';
  document.getElementById('scan-line').style.display    = 'none';
  document.getElementById('scan-status').textContent    = 'Analyzing image...';
  document.getElementById('scan-status').className      = 'scan-status scanning';
  document.getElementById('scan-btn-scan').classList.add('hidden');
  document.getElementById('scan-btn-stop').classList.add('hidden');

  const detected = await scanCam.detect(canvas);

  if (detected) {
    const matches = State.pets.filter(p => p.type === detected);
    document.getElementById('scan-result-val').textContent = PET_LABEL[detected];
    document.getElementById('scan-result-val').style.color = PET_COLOR[detected];
    document.getElementById('scan-result-match').textContent = matches.length > 0
      ? `Matched profile${matches.length > 1 ? 's' : ''}: ${matches.map(p => p.name).join(', ')}`
      : 'No registered pets of this type';
    document.getElementById('scan-status').textContent = 'Detection complete';
    document.getElementById('scan-status').className   = 'scan-status ready';
    toast(`Identified as: ${PET_LABEL[detected]}`, 'success');
  } else {
    document.getElementById('scan-result-val').textContent = 'Unidentified';
    document.getElementById('scan-result-val').style.color = 'var(--mu2)';
    document.getElementById('scan-result-match').textContent = 'Try better lighting or a clearer angle.';
    document.getElementById('scan-status').textContent = 'Not detected';
    document.getElementById('scan-status').className   = 'scan-status';
    toast('Could not identify. Try better lighting.', 'error');
  }

  document.getElementById('scan-result-box').classList.remove('hidden');
  document.getElementById('scan-btn-again').classList.remove('hidden');
}

// ── Schedule tab ──────────────────────────────────────────────────────────────
let schedDays = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

function renderSched() {
  const hasPets = State.pets.length > 0;
  document.getElementById('sched-add-btn').classList.toggle('hidden', !hasPets);
  const container = document.getElementById('sched-list');

  if (!hasPets) {
    container.innerHTML = `<div class="empty"><div class="empty-icon">${Icons.calendar(40)}</div><div class="empty-title">Register a pet first</div></div>`;
    return;
  }
  if (State.schedules.length === 0) {
    container.innerHTML = `<div class="empty" style="padding:28px"><div class="empty-icon">${Icons.clock(36)}</div><div class="empty-title">No schedules yet</div><div class="empty-sub">Tap "Add Schedule" to automate feedings.</div></div>`;
    return;
  }

  container.innerHTML = State.schedules.map(s => {
    const pet = State.getPet(s.petId); if (!pet) return '';
    const color = PET_COLOR[pet.type];
    return `<div class="sched-item">
      <div class="sched-icon" style="color:${color};">${Icons.clock(17)}</div>
      <div style="flex:1;min-width:0;">
        <div class="sched-time">${s.time}</div>
        <div class="sched-meta">${escHtml(pet.name)} &middot; ${s.days.join(', ')}</div>
      </div>
      <label class="toggle-wrap" style="margin-right:10px;" title="${s.enabled ? 'Enabled' : 'Disabled'}">
        <input type="checkbox" ${s.enabled ? 'checked' : ''} onchange="State.toggleSchedule('${s.id}');renderSched();">
        <span class="toggle-track"></span><span class="toggle-thumb"></span>
      </label>
      <button class="sched-del" onclick="State.removeSchedule('${s.id}');renderSched();toast('Schedule removed.','info');">${Icons.trash(13)}</button>
    </div>`;
  }).join('');
}

function openAddSched() {
  const sel = document.getElementById('sched-pet');
  sel.innerHTML = State.pets.map(p => `<option value="${p.id}">${PET_LABEL[p.type]} — ${escHtml(p.name)}</option>`).join('');
  schedDays = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  renderDayPills();
  document.getElementById('sched-time').value = '08:00';
  showModal('modal-sched');
}

function renderDayPills() {
  document.getElementById('sched-days').innerHTML =
    ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d =>
      `<button class="day-pill${schedDays.includes(d) ? ' on' : ''}" onclick="toggleDay('${d}',this)">${d}</button>`
    ).join('');
}

function toggleDay(d, el) {
  schedDays = schedDays.includes(d) ? schedDays.filter(x => x !== d) : [...schedDays, d];
  el.classList.toggle('on', schedDays.includes(d));
}

function submitAddSched() {
  const petId = document.getElementById('sched-pet').value;
  const time  = document.getElementById('sched-time').value;
  if (!petId || !time || schedDays.length === 0) { toast('Select a pet, time and at least one day.', 'error'); return; }
  State.addSchedule({ id: uid(), petId, time, days: [...schedDays], enabled: true });
  hideModal('modal-sched');
  renderSched();
  toast('Schedule added.', 'success');
}

// Auto-schedule ticker
setInterval(() => {
  const n    = new Date();
  const hhmm = `${String(n.getHours()).padStart(2,'0')}:${String(n.getMinutes()).padStart(2,'0')}`;
  const day  = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][n.getDay()];
  State.schedules.forEach(s => {
    if (s.enabled && s.time === hhmm && s.days.includes(day)) {
      const pet = State.getPet(s.petId);
      if (pet) {
        AdafruitIO.sendFeed(pet.feedName);
        State.updatePet(pet.id, { lastFed: now(), totalFeedings: (pet.totalFeedings||0)+1 });
        State.addLog({ petId: pet.id, petName: pet.name, petType: pet.type, type: 'food' });
        pushNotify('SmartPaw', `Auto-feeding ${pet.name}`);
        toast(`Auto-feeding ${pet.name}.`, 'info');
        if (currentTab === 'dash') renderDash();
      }
    }
  });
}, 60000);

// ── Config tab ────────────────────────────────────────────────────────────────
function loadConfig() {
  document.getElementById('cfg-user').value = localStorage.getItem('sp_aio_user') || '';
  document.getElementById('cfg-key').value  = localStorage.getItem('sp_aio_key')  || '';
}

function saveConfig() {
  AdafruitIO.save(document.getElementById('cfg-user').value.trim(), document.getElementById('cfg-key').value.trim());
  toast('Settings saved.', 'success');
}

async function testConnection() {
  const btn = document.getElementById('cfg-test-btn');
  btn.textContent = 'Testing...'; btn.disabled = true;
  const r = await AdafruitIO.test();
  btn.textContent = 'Test Connection'; btn.disabled = false;
  if (r.ok) toast('Connected to Adafruit IO.', 'success');
  else if (r.demo) toast('Demo mode — enter your credentials to connect.', 'warning');
  else toast('Connection failed. Check credentials.', 'error');
}

async function enableNotifications() {
  const ok = await requestNotificationPermission();
  toast(ok ? 'Notifications enabled.' : 'Notification permission denied.', ok ? 'success' : 'error');
}

// ── Modal helpers ─────────────────────────────────────────────────────────────
function showModal(id) { document.getElementById(id).classList.add('show'); document.body.style.overflow = 'hidden'; }
function hideModal(id) { document.getElementById(id).classList.remove('show'); document.body.style.overflow = ''; }

document.querySelectorAll('.backdrop').forEach(bd => {
  bd.addEventListener('click', e => {
    if (e.target === bd) {
      bd.classList.remove('show'); document.body.style.overflow = '';
      if (bd.id === 'modal-add') regCam.stop();
    }
  });
});

// ── Topbar ────────────────────────────────────────────────────────────────────
function updateTopbar() {
  const n = State.pets.length;
  document.getElementById('tb-pet-count').textContent = `${n} pet${n !== 1 ? 's' : ''}`;
}

// ── Utils ─────────────────────────────────────────────────────────────────────
function escHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ── Init ──────────────────────────────────────────────────────────────────────
(function init() {
  loadConfig();
  renderDash();
  updateTopbar();
})();
