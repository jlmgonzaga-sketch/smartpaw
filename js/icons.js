// ── icons.js — SVG icon library ──────────────────────────────────────────────
// All icons are inline SVG strings, no emojis used anywhere.

const Icons = {
  _svg(path, size = 20, extra = '') {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" ${extra}>${path}</svg>`;
  },

  paw(size = 20) {
    return this._svg(`
      <path d="M12 16.5c-2.5 0-4.5-1.8-4.5-4 0-1.2.6-2.2 1.5-2.9"/>
      <circle cx="7.5" cy="7.5" r="1.5"/>
      <circle cx="12" cy="6" r="1.5"/>
      <circle cx="16.5" cy="7.5" r="1.5"/>
      <circle cx="18" cy="11.5" r="1.5"/>
      <path d="M12 16.5c2.5 0 4.5-1.8 4.5-4 0-1.2-.6-2.2-1.5-2.9"/>
      <ellipse cx="12" cy="15" rx="4" ry="3.5"/>
    `, size);
  },

  home(size = 20) {
    return this._svg(`<path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/><path d="M9 21V12h6v9"/>`, size);
  },

  barChart(size = 20) {
    return this._svg(`<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>`, size);
  },

  scan(size = 20) {
    return this._svg(`<path d="M3 7V4a1 1 0 011-1h3M17 3h3a1 1 0 011 1v3M21 17v3a1 1 0 01-1 1h-3M7 21H4a1 1 0 01-1-1v-3"/><line x1="7" y1="12" x2="17" y2="12"/>`, size);
  },

  calendar(size = 20) {
    return this._svg(`<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>`, size);
  },

  settings(size = 20) {
    return this._svg(`<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>`, size);
  },

  plus(size = 16) {
    return this._svg(`<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>`, size);
  },

  trash(size = 15) {
    return this._svg(`<polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>`, size);
  },

  utensils(size = 15) {
    return this._svg(`<path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 002-2V2"/><line x1="7" y1="2" x2="7" y2="11"/><path d="M21 15V2a5 5 0 00-5 5v6c0 1.1.9 2 2 2h1v-1a2 2 0 014 0v1h1a2 2 0 002-2v-6c0-2.8-2.2-5-5-5z"/>`, size);
  },

  droplets(size = 16) {
    return this._svg(`<path d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z"/>`, size);
  },

  camera(size = 22) {
    return this._svg(`<path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/>`, size);
  },

  upload(size = 15) {
    return this._svg(`<polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0018 9h-1.26A8 8 0 103 16.3"/>`, size);
  },

  rotateCcw(size = 14) {
    return this._svg(`<polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/>`, size);
  },

  play(size = 13) {
    return this._svg(`<polygon points="5 3 19 12 5 21 5 3"/>`, size);
  },

  stop(size = 13) {
    return this._svg(`<rect x="3" y="3" width="18" height="18" rx="2"/>`, size);
  },

  check(size = 14) {
    return this._svg(`<polyline points="20 6 9 17 4 12"/>`, size);
  },

  x(size = 14) {
    return this._svg(`<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>`, size);
  },

  info(size = 14) {
    return this._svg(`<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>`, size);
  },

  wifi(size = 14) {
    return this._svg(`<path d="M5 12.55a11 11 0 0114.08 0"/><path d="M1.42 9a16 16 0 0121.16 0"/><path d="M8.53 16.11a6 16 0 016.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/>`, size);
  },

  bell(size = 14) {
    return this._svg(`<path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/>`, size);
  },

  clock(size = 16) {
    return this._svg(`<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>`, size);
  },

  chevronRight(size = 16) {
    return this._svg(`<polyline points="9 18 15 12 9 6"/>`, size);
  },

  shield(size = 14) {
    return this._svg(`<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>`, size);
  },

  activity(size = 14) {
    return this._svg(`<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>`, size);
  },

  // Pet type icons
  dog(size = 22) {
    return this._svg(`
      <path d="M10 5.5C10 4.1 11.1 3 12.5 3h.5c.8 0 1.5.3 2 .8L17 5h2.5v2.5l-.8.8v.7A5.5 5.5 0 014.7 10.5a5.5 5.5 0 015.3-5H10V5.5z"/>
      <circle cx="10" cy="9.5" r=".5" fill="currentColor"/>
      <circle cx="14" cy="9.5" r=".5" fill="currentColor"/>
      <path d="M10.5 12c.4.4 1 .6 1.5.6s1.1-.2 1.5-.6"/>
      <path d="M6 15l1.5 2.5h9L18 15"/>
    `, size);
  },

  cat(size = 22) {
    return this._svg(`
      <path d="M8 10.5C8 7.5 9.8 5 12 5s4 2.5 4 5.5v1a4 4 0 01-8 0v-1z"/>
      <path d="M8 10.5L6 6l3 2.5M16 10.5L18 6l-3 2.5"/>
      <circle cx="10.5" cy="11" r=".5" fill="currentColor"/>
      <circle cx="13.5" cy="11" r=".5" fill="currentColor"/>
      <path d="M10.5 13.5c.4.3.95.5 1.5.5s1.1-.2 1.5-.5"/>
    `, size);
  },

  fish(size = 22) {
    return this._svg(`
      <path d="M6 12c0-3 2.7-5.5 6.5-5.5S19 9 19 12s-2.7 5.5-6.5 5.5c-2 0-3.8-.7-5-2"/>
      <path d="M5 9l-2-2M5 15l-2 2M3 12H1"/>
      <circle cx="16" cy="11" r=".75" fill="currentColor"/>
    `, size);
  },

  download(size = 16) {
    return this._svg(`<path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>`, size);
  },
};
