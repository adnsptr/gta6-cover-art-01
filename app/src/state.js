// Vice Cover Studio — state, layouts, grades and edit history.
// All values here are plain data: the renderer in cover.js turns them into pixels.

export const LAYOUTS = {
  'hero-three': {
    label: 'Hero + Three',
    slots(w, h) {
      const g = 0.015;
      return [
        { x: 0, y: 0, w: 0.615, h: 1 },
        { x: 0.615 + g, y: 0, w: 0.37, h: (1 - 2 * g) / 3 },
        { x: 0.615 + g, y: (1 + g) / 3, w: 0.37, h: (1 - 2 * g) / 3 },
        { x: 0.615 + g, y: 2 * (1 + g) / 3, w: 0.37, h: (1 - 2 * g) / 3 },
      ];
    },
    titleZone: { x: 0, y: 0.76, w: 0.615, h: 0.24 },
  },
  'grid-four': {
    label: 'Four Grid',
    slots() {
      const g = 0.015;
      const s = (1 - g) / 2;
      return [
        { x: 0, y: 0, w: s, h: s },
        { x: s + g, y: 0, w: s, h: s },
        { x: 0, y: s + g, w: s, h: s },
        { x: s + g, y: s + g, w: s, h: s },
      ];
    },
    titleZone: { x: 0, y: 0.78, w: 1, h: 0.22 },
  },
  'full-bleed': {
    label: 'Full Bleed',
    slots() {
      return [{ x: 0, y: 0, w: 1, h: 1 }];
    },
    titleZone: { x: 0, y: 0.66, w: 1, h: 0.34 },
  },
  trio: {
    label: 'Trio Strips',
    slots() {
      const g = 0.015;
      const s = (1 - 2 * g) / 3;
      return [
        { x: 0, y: 0, w: s, h: 1 },
        { x: s + g, y: 0, w: s, h: 1 },
        { x: 2 * (s + g), y: 0, w: s, h: 1 },
      ];
    },
    titleZone: { x: 0, y: 0.78, w: 1, h: 0.22 },
  },
  nine: {
    label: 'Nine Panel',
    slots() {
      const g = 0.012;
      const s = (1 - 2 * g) / 3;
      const out = [];
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          out.push({ x: c * (s + g), y: r * (s + g), w: s, h: s });
        }
      }
      return out;
    },
    titleZone: { x: 0, y: 0.8, w: 1, h: 0.2 },
  },
  tilted: {
    label: 'Tilted Snaps',
    slots() {
      return [
        { x: 0.04, y: 0.2, w: 0.42, h: 0.56, tilt: -0.1 },
        { x: 0.54, y: 0.16, w: 0.42, h: 0.56, tilt: 0.06 },
        { x: 0.29, y: 0.42, w: 0.42, h: 0.56, tilt: -0.03 },
      ];
    },
    titleZone: { x: 0, y: 0.02, w: 1, h: 0.13 },
  },
};

export const GRADES = {
  sunset: {
    label: 'Sunset',
    filter: 'saturate(1.3) contrast(1.08) brightness(1.03)',
    overlays: [
      { kind: 'linear', stops: [[0, 'rgba(255,170,60,0)'], [1, 'rgba(255,60,120,0.34)']], blend: 'soft-light' },
      { kind: 'linear', stops: [[0, 'rgba(255,200,90,0.10)'], [1, 'rgba(120,20,90,0.16)']], blend: 'overlay' },
    ],
  },
  neon: {
    label: 'Neon Night',
    filter: 'saturate(1.45) contrast(1.15)',
    overlays: [
      { kind: 'radial', stops: [[0, 'rgba(255,45,120,0.40)'], [1, 'rgba(255,45,120,0)']], blend: 'soft-light' },
      { kind: 'radial', stops: [[0, 'rgba(34,211,238,0.34)'], [1, 'rgba(34,211,238,0)']], blend: 'soft-light', flip: true },
    ],
  },
  dusk: {
    label: 'Vice Dusk',
    filter: 'saturate(1.05) contrast(1.12) brightness(0.92)',
    overlays: [
      { kind: 'linear', stops: [[0, 'rgba(90,40,160,0.10)'], [1, 'rgba(40,10,90,0.34)']], blend: 'overlay' },
    ],
  },
  golden: {
    label: 'Golden Hour',
    filter: 'saturate(1.25) brightness(1.06) contrast(1.05) sepia(0.25)',
    overlays: [
      { kind: 'linear', stops: [[0, 'rgba(255,190,80,0.16)'], [1, 'rgba(180,110,20,0.20)']], blend: 'soft-light' },
    ],
  },
  noir: {
    label: 'Mono Noir',
    filter: 'grayscale(1) contrast(1.3) brightness(1.02)',
    overlays: [],
  },
  palm: {
    label: 'Palm Teal',
    filter: 'saturate(1.35) contrast(1.05) hue-rotate(-12deg)',
    overlays: [
      { kind: 'linear', stops: [[0, 'rgba(20,180,170,0.14)'], [1, 'rgba(10,90,120,0.22)']], blend: 'soft-light' },
    ],
  },
};

export const SIZES = {
  '1080x1080': { w: 1080, h: 1080, label: '1080 × 1080' },
  '1080x1350': { w: 1080, h: 1350, label: '1080 × 1350' },
  '1920x1080': { w: 1920, h: 1080, label: '1920 × 1080' },
};

export const TITLE_COLORS = {
  white: { label: 'White' },
  sunset: { label: 'Sunset' },
  neon: { label: 'Neon' },
};

export function createState() {
  return {
    layout: 'hero-three',
    grade: 'sunset',
    title: 'Midnight Boulevard',
    subtitle: 'chasing the neon sunset',
    titleColor: 'white',
    size: '1080x1080',
    badge: true,
    grain: true,
    // One entry per layout slot (nine is the widest): which photo, zoom and pan.
    panels: Array.from({ length: 9 }, (_, i) => ({ photo: i, zoom: 1, ox: 0, oy: 0 })),
  };
}

/** A JSON-safe copy of the editable state (photos live outside it). */
export function snapshot(state) {
  return JSON.parse(JSON.stringify(state));
}

export function restore(state, snap) {
  for (const key of Object.keys(snap)) state[key] = snap[key];
}

/** Undo/redo over state snapshots. */
export class History {
  constructor(state) {
    this.state = state;
    this.past = [];
    this.future = [];
  }

  push() {
    this.past.push(snapshot(this.state));
    if (this.past.length > 60) this.past.shift();
    this.future.length = 0;
  }

  undo() {
    if (!this.past.length) return false;
    this.future.push(snapshot(this.state));
    restore(this.state, this.past.pop());
    return true;
  }

  redo() {
    if (!this.future.length) return false;
    this.past.push(snapshot(this.state));
    restore(this.state, this.future.pop());
    return true;
  }
}
