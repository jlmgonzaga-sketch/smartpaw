// ── camera.js ─────────────────────────────────────────────────────────────────

class CameraManager {
  constructor() { this.stream = null; this.videoEl = null; this.canvasEl = null; this.captured = null; this.mlModel = null; }

  init(videoEl, canvasEl) { this.videoEl = videoEl; this.canvasEl = canvasEl; }

  async start() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false });
      this.videoEl.srcObject = this.stream;
      await this.videoEl.play();
      return true;
    } catch { return false; }
  }

  stop() {
    if (this.stream) { this.stream.getTracks().forEach(t => t.stop()); this.stream = null; }
    if (this.videoEl) this.videoEl.srcObject = null;
  }

  capture() {
    if (!this.videoEl || !this.canvasEl) return null;
    const v = this.videoEl, c = this.canvasEl;
    c.width = v.videoWidth || 320; c.height = v.videoHeight || 320;
    c.getContext('2d').drawImage(v, 0, 0);
    this.captured = c.toDataURL('image/jpeg', 0.85);
    this.stop(); return c;
  }

  reset() { this.captured = null; this.stop(); }

  fromFile(file) {
    return new Promise(resolve => {
      const r = new FileReader();
      r.onload = e => { this.captured = e.target.result; resolve(this.captured); };
      r.readAsDataURL(file);
    });
  }

  async loadModel() {
    if (this.mlModel) return this.mlModel;
    if (!window.mobilenet) return null;
    try { this.mlModel = await window.mobilenet.load(); return this.mlModel; } catch { return null; }
  }

  async detect(canvas) {
    const model = await this.loadModel();
    if (!model) return null;
    try {
      const preds = await model.classify(canvas);
      const top   = (preds[0]?.className || '').toLowerCase();
      if (/dog|hound|retriev|terrier|poodle|beagle|labrador|husky|corgi/.test(top)) return 'dog';
      if (/cat|felin|tabby|kitten|persian|siamese/.test(top))                        return 'cat';
      if (/fish|aquar|goldfish|shark|clown|trout/.test(top))                         return 'fish';
      return null;
    } catch { return null; }
  }
}

async function requestNotificationPermission() {
  if (!('Notification' in window)) return false;
  return (await Notification.requestPermission()) === 'granted';
}

function pushNotify(title, body) {
  if ('Notification' in window && Notification.permission === 'granted')
    new Notification(title, { body, icon: './icons/icon-192.png' });
}

// ── adafruit.js ───────────────────────────────────────────────────────────────

const AdafruitIO = {
  get key()  { return localStorage.getItem('sp_aio_key')  || ''; },
  get user() { return localStorage.getItem('sp_aio_user') || ''; },

  save(user, key) { localStorage.setItem('sp_aio_user', user); localStorage.setItem('sp_aio_key', key); },

  async sendFeed(feedName, value = 'FEED') {
    const { user, key } = this;
    if (!user || !key) { await new Promise(r => setTimeout(r, 700)); return { ok: true, demo: true }; }
    try {
      const res = await fetch(`https://io.adafruit.com/api/v2/${user}/feeds/${feedName}/data`, {
        method: 'POST',
        headers: { 'X-AIO-Key': key, 'Content-Type': 'application/json' },
        body: JSON.stringify({ value })
      });
      return { ok: res.ok };
    } catch { return { ok: false }; }
  },

  async test() {
    const { user, key } = this;
    if (!user || !key) return { ok: false, demo: true };
    try {
      const res = await fetch(`https://io.adafruit.com/api/v2/${user}/feeds`, { headers: { 'X-AIO-Key': key } });
      return { ok: res.ok };
    } catch { return { ok: false }; }
  }
};
