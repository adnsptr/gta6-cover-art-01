// Vice Cover Studio — cover renderer: panels, grades, lettering, grain, vignette.
// Draws the state onto any canvas, at preview size or full export size.
import { LAYOUTS, GRADES, SIZES } from './state.js';

let noiseTile = null;

/** A small random-noise tile, built once and reused for the film grain. */
function grainTile() {
  if (noiseTile) return noiseTile;
  const tile = document.createElement('canvas');
  tile.width = 160;
  tile.height = 160;
  const tctx = tile.getContext('2d');
  const data = tctx.createImageData(160, 160);
  for (let i = 0; i < data.data.length; i += 4) {
    const v = 110 + Math.floor(Math.random() * 90);
    data.data[i] = v;
    data.data[i + 1] = v;
    data.data[i + 2] = v;
    data.data[i + 3] = 255;
  }
  tctx.putImageData(data, 0, 0);
  noiseTile = tile;
  return tile;
}

/** Shrink `text` until it fits `maxWidth` at the Anton face, returning the size. */
function fitAnton(ctx, text, startSize, maxWidth) {
  let size = startSize;
  ctx.font = `${size}px Anton, sans-serif`;
  while (size > 14 && ctx.measureText(text).width > maxWidth) {
    size -= 2;
    ctx.font = `${size}px Anton, sans-serif`;
  }
  return size;
}

/** Draw `img` to cover `rect`, panned by (ox, oy) fractions and scaled by zoom. */
function drawPhotoCover(ctx, img, rect, zoom, ox, oy, filter) {
  const scale = Math.max(rect.w / img.naturalWidth, rect.h / img.naturalHeight) * zoom;
  const pw = img.naturalWidth * scale;
  const ph = img.naturalHeight * scale;
  const dx = rect.x + (rect.w - pw) / 2 + ox * rect.w;
  const dy = rect.y + (rect.h - ph) / 2 + oy * rect.h;
  ctx.save();
  ctx.filter = filter;
  ctx.drawImage(img, dx, dy, pw, ph);
  ctx.restore();
}

/** Paint one grade's colour overlays over `rect`. */
function paintGrade(ctx, grade, rect) {
  for (const layer of grade.overlays) {
    let grad;
    if (layer.kind === 'radial') {
      const cx = layer.flip ? rect.x + rect.w : rect.x;
      const cy = layer.flip ? rect.y + rect.h : rect.y;
      const r = Math.max(rect.w, rect.h) * 1.1;
      grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    } else {
      grad = ctx.createLinearGradient(rect.x, rect.y, rect.x, rect.y + rect.h);
    }
    for (const [stop, color] of layer.stops) grad.addColorStop(stop, color);
    ctx.save();
    ctx.globalCompositeOperation = layer.blend;
    ctx.fillStyle = grad;
    ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
    ctx.restore();
  }
}

/** The title block: scrim, rule, Anton title and Pacifico subtitle. */
function drawTitleBlock(ctx, state, zone, w) {
  const scrim = ctx.createLinearGradient(0, zone.y, 0, zone.y + zone.h);
  scrim.addColorStop(0, 'rgba(12,4,24,0)');
  scrim.addColorStop(0.55, 'rgba(12,4,24,0.55)');
  scrim.addColorStop(1, 'rgba(12,4,24,0.88)');
  ctx.fillStyle = scrim;
  ctx.fillRect(zone.x, zone.y, zone.w, zone.h);

  const pad = zone.w * 0.045;
  const textX = zone.x + pad;
  const textW = zone.w - pad * 2;
  const title = state.title.trim().toUpperCase();
  const ruleY = zone.y + zone.h * 0.16;
  ctx.fillStyle = '#ff2d78';
  ctx.fillRect(textX, ruleY, zone.w * 0.16, Math.max(3, zone.h * 0.02));

  if (title) {
    const size = fitAnton(ctx, title, zone.h * 0.42, textW);
    const baseline = zone.y + zone.h * 0.62;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    if (state.titleColor === 'sunset') {
      const grad = ctx.createLinearGradient(textX, 0, textX + textW, 0);
      grad.addColorStop(0, '#ffd166');
      grad.addColorStop(0.55, '#ff7a3d');
      grad.addColorStop(1, '#ff2d78');
      ctx.fillStyle = grad;
    } else if (state.titleColor === 'neon') {
      ctx.fillStyle = '#ff5da2';
      ctx.shadowColor = '#22d3ee';
      ctx.shadowBlur = size * 0.25;
    } else {
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = 'rgba(0,0,0,0.6)';
      ctx.shadowBlur = size * 0.12;
    }
    ctx.fillText(title, textX, baseline);
    ctx.shadowBlur = 0;
  }

  const sub = state.subtitle.trim();
  if (sub) {
    const subSize = Math.max(12, zone.h * 0.13);
    ctx.font = `${subSize}px Pacifico, cursive`;
    ctx.fillStyle = '#ffe9f3';
    ctx.textAlign = 'left';
    ctx.fillText(sub, textX, zone.y + zone.h * 0.86);
  }
}

function drawBadge(ctx, w) {
  const label = '★ VICE — EST. 2026';
  const size = Math.max(13, w * 0.016);
  ctx.font = `${size}px Anton, sans-serif`;
  const tw = ctx.measureText(label).width;
  const pad = size * 0.9;
  const bw = tw + pad * 2;
  const bh = size * 2.1;
  const x = w - bw - w * 0.02;
  const y = w * 0.02;
  ctx.save();
  ctx.fillStyle = 'rgba(12,4,24,0.72)';
  ctx.strokeStyle = '#ff2d78';
  ctx.lineWidth = Math.max(1.5, w * 0.0015);
  ctx.beginPath();
  ctx.roundRect(x, y, bw, bh, bh / 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, x + bw / 2, y + bh / 2 + size * 0.05);
  ctx.restore();
}

/**
 * Draw the whole cover onto `canvas` at its own size.
 * `photos` is an array of loaded images (or nulls). `opts.selected` draws the
 * editor's selection outline around one slot; `opts.forExport` skips it.
 */
export function drawCover(canvas, state, photos, opts = {}) {
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;
  const layout = LAYOUTS[state.layout];
  const grade = GRADES[state.grade];

  ctx.save();
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = '#160a24';
  ctx.fillRect(0, 0, w, h);

  const slots = layout.slots(w, h).map((s) => ({
    x: s.x * w,
    y: s.y * h,
    w: s.w * w,
    h: s.h * h,
    tilt: s.tilt ?? 0,
  }));

  slots.forEach((rect, i) => {
    const panel = state.panels[i] ?? { photo: i, zoom: 1, ox: 0, oy: 0 };
    const photo = photos[panel.photo] ?? null;
    ctx.save();
    if (rect.tilt) {
      ctx.translate(rect.x + rect.w / 2, rect.y + rect.h / 2);
      ctx.rotate(rect.tilt);
      ctx.translate(-rect.w / 2, -rect.h / 2);
      // Polaroid frame: white border with a wider foot.
      ctx.fillStyle = '#fdf8f2';
      ctx.fillRect(-rect.w * 0.03, -rect.h * 0.03, rect.w * 1.06, rect.h * 1.09);
      rect = { x: 0, y: 0, w: rect.w, h: rect.h * 0.94 };
    }
    ctx.beginPath();
    ctx.rect(rect.x, rect.y, rect.w, rect.h);
    ctx.clip();
    if (photo) {
      drawPhotoCover(ctx, photo, rect, panel.zoom, panel.ox, panel.oy, grade.filter);
      paintGrade(ctx, grade, rect);
    } else {
      ctx.fillStyle = '#2a1240';
      ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
      ctx.strokeStyle = 'rgba(255,255,255,0.35)';
      ctx.setLineDash([8, 6]);
      ctx.lineWidth = 2;
      ctx.strokeRect(rect.x + 6, rect.y + 6, rect.w - 12, rect.h - 12);
      ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.font = `${Math.max(12, rect.w * 0.05)}px Anton, sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText('ADD PHOTO', rect.x + rect.w / 2, rect.y + rect.h / 2);
    }
    ctx.restore();

    // Thin poster frame around each panel.
    ctx.save();
    ctx.strokeStyle = 'rgba(255,255,255,0.85)';
    ctx.lineWidth = Math.max(2, w * 0.002);
    if (rect.tilt) {
      ctx.translate(rect.x + rect.w / 2, rect.y + rect.h / 2);
      ctx.rotate(rect.tilt);
      ctx.strokeRect(-rect.w / 2, -rect.h / 2, rect.w, rect.h);
    } else {
      ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
    }
    ctx.restore();

    if (opts.selected === i && !opts.forExport) {
      ctx.save();
      ctx.strokeStyle = '#22d3ee';
      ctx.lineWidth = Math.max(3, w * 0.004);
      ctx.setLineDash([14, 8]);
      ctx.strokeRect(rect.x - 4, rect.y - 4, rect.w + 8, rect.h + 8);
      ctx.restore();
    }
  });

  const zone = {
    x: layout.titleZone.x * w,
    y: layout.titleZone.y * h,
    w: layout.titleZone.w * w,
    h: layout.titleZone.h * h,
  };
  drawTitleBlock(ctx, state, zone, w);
  if (state.badge) drawBadge(ctx, w);

  if (state.grain) {
    const tile = grainTile();
    const pattern = ctx.createPattern(tile, 'repeat');
    ctx.save();
    ctx.globalCompositeOperation = 'overlay';
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = pattern;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }

  const vig = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.42, w / 2, h / 2, Math.max(w, h) * 0.75);
  vig.addColorStop(0, 'rgba(0,0,0,0)');
  vig.addColorStop(1, 'rgba(0,0,0,0.32)');
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
}

/** Render the cover at an export size and hand back the canvas. */
export function renderCover(state, photos) {
  const size = SIZES[state.size];
  const canvas = document.createElement('canvas');
  canvas.width = size.w;
  canvas.height = size.h;
  drawCover(canvas, state, photos, { forExport: true });
  return canvas;
}

/** Export the current cover as a PNG blob at the chosen size. */
export function exportCover(state, photos) {
  return new Promise((resolve) => {
    renderCover(state, photos).toBlob((blob) => resolve(blob), 'image/png');
  });
}
