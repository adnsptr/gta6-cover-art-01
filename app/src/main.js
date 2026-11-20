// Vice Cover Studio — editor wiring: photos, layout/grade chips, panel editing,
// undo/redo, export. A `?shot=` query sets up a fixed scene (./shots.js).
import { drawCover, exportCover } from './cover.js';
import { createState, History, LAYOUTS, GRADES, SIZES } from './state.js';
import { runShot } from './shots.js';

const canvas = document.getElementById('stage');
const statusEl = document.getElementById('status');
const state = createState();
const history = new History(state);
let photos = []; // { id, name, img }
let selected = 0;
let nextId = 1;

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

async function loadSample(name) {
  const img = await loadImage(`samples/${name}.jpg`);
  return { id: nextId++, name, img };
}

function images() {
  return photos.map((p) => p?.img ?? null);
}

function render() {
  // In a cover scene there is no editor, so no selection outline is drawn.
  const selectedSlot = document.body.classList.contains('shot-cover') ? -1 : selected;
  drawCover(canvas, state, images(), { selected: selectedSlot });
}

function renderWithSize() {
  const size = SIZES[state.size];
  canvas.width = size.w;
  canvas.height = size.h;
  render();
}

function setPhotos(list) {
  photos = list;
  state.panels.forEach((p, i) => {
    p.photo = photos.length ? i % photos.length : -1;
    p.zoom = 1;
    p.ox = 0;
    p.oy = 0;
  });
  selected = 0;
  refreshPhotoList();
  syncInspector();
  render();
}

function refreshPhotoList() {
  const list = document.getElementById('photoList');
  list.innerHTML = '';
  photos.forEach((p, i) => {
    const li = document.createElement('li');
    const label = document.createElement('span');
    label.textContent = p.name;
    const use = document.createElement('button');
    use.type = 'button';
    use.textContent = 'Use in panel';
    use.addEventListener('click', () => {
      history.push();
      state.panels[selected].photo = i;
      syncInspector();
      render();
    });
    const remove = document.createElement('button');
    remove.type = 'button';
    remove.textContent = 'Remove';
    remove.addEventListener('click', () => {
      history.push();
      photos.splice(i, 1);
      for (const panel of state.panels) {
        if (panel.photo === i) panel.photo = -1;
        else if (panel.photo > i) panel.photo -= 1;
      }
      refreshPhotoList();
      syncInspector();
      render();
    });
    li.append(label, use, remove);
    list.append(li);
  });
}

function syncInspector() {
  const select = document.getElementById('panelPhoto');
  select.innerHTML = '';
  const empty = document.createElement('option');
  empty.value = '-1';
  empty.textContent = '(empty)';
  select.append(empty);
  photos.forEach((p, i) => {
    const opt = document.createElement('option');
    opt.value = String(i);
    opt.textContent = p.name;
    select.append(opt);
  });
  const panel = state.panels[selected];
  select.value = String(panel.photo);
  document.getElementById('zoomRange').value = String(panel.zoom);
  document.getElementById('panX').value = String(panel.ox);
  document.getElementById('panY').value = String(panel.oy);
}

function buildChips(rowId, entries, current, onPick) {
  const row = document.getElementById(rowId);
  row.innerHTML = '';
  for (const [key, def] of Object.entries(entries)) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = def.label;
    btn.dataset.key = key;
    if (key === current) btn.classList.add('active');
    btn.addEventListener('click', () => {
      history.push();
      onPick(key);
      for (const b of row.children) b.classList.toggle('active', b.dataset.key === key);
      render();
    });
    row.append(btn);
  }
}

function slotRects() {
  return LAYOUTS[state.layout].slots(canvas.width, canvas.height).map((s) => ({
    x: s.x * canvas.width,
    y: s.y * canvas.height,
    w: s.w * canvas.width,
    h: s.h * canvas.height,
  }));
}

function hitSlot(px, py) {
  const rects = slotRects();
  for (let i = rects.length - 1; i >= 0; i--) {
    const r = rects[i];
    if (px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h) return i;
  }
  return -1;
}

function canvasPoint(e) {
  const box = canvas.getBoundingClientRect();
  return {
    x: ((e.clientX - box.left) / box.width) * canvas.width,
    y: ((e.clientY - box.top) / box.height) * canvas.height,
  };
}

function wire() {
  buildChips('layoutRow', LAYOUTS, state.layout, (key) => { state.layout = key; });
  buildChips('gradeRow', GRADES, state.grade, (key) => { state.grade = key; });

  document.getElementById('photoInput').addEventListener('change', async (e) => {
    const files = [...e.target.files].slice(0, 6 - photos.length);
    if (!files.length) return;
    history.push();
    for (const file of files) {
      const img = await loadImage(URL.createObjectURL(file));
      photos.push({ id: nextId++, name: file.name, img });
    }
    refreshPhotoList();
    syncInspector();
    render();
    e.target.value = '';
  });

  document.getElementById('sampleRow').addEventListener('click', async (e) => {
    const name = e.target.dataset?.sample;
    if (!name || photos.length >= 6) return;
    history.push();
    photos.push(await loadSample(name));
    refreshPhotoList();
    syncInspector();
    render();
  });

  const titleInput = document.getElementById('titleInput');
  titleInput.addEventListener('input', () => { state.title = titleInput.value; render(); });
  titleInput.addEventListener('change', () => history.push());
  const subtitleInput = document.getElementById('subtitleInput');
  subtitleInput.addEventListener('input', () => { state.subtitle = subtitleInput.value; render(); });
  subtitleInput.addEventListener('change', () => history.push());

  document.getElementById('colorRow').addEventListener('click', (e) => {
    const color = e.target.dataset?.color;
    if (!color) return;
    history.push();
    state.titleColor = color;
    for (const b of e.currentTarget.children) b.classList.toggle('active', b === e.target);
    render();
  });

  document.getElementById('sizeRow').addEventListener('click', (e) => {
    const size = e.target.dataset?.size;
    if (!size || !SIZES[size]) return;
    history.push();
    state.size = size;
    for (const b of e.currentTarget.children) b.classList.toggle('active', b === e.target);
    renderWithSize();
  });

  document.getElementById('badgeToggle').addEventListener('change', (e) => {
    history.push();
    state.badge = e.target.checked;
    render();
  });
  document.getElementById('grainToggle').addEventListener('change', (e) => {
    history.push();
    state.grain = e.target.checked;
    render();
  });

  document.getElementById('panelPhoto').addEventListener('change', (e) => {
    history.push();
    state.panels[selected].photo = Number(e.target.value);
    render();
  });
  const bindSlider = (id, apply) => {
    const el = document.getElementById(id);
    el.addEventListener('input', () => { apply(Number(el.value)); render(); });
    el.addEventListener('change', () => history.push());
  };
  bindSlider('zoomRange', (v) => { state.panels[selected].zoom = v; });
  bindSlider('panX', (v) => { state.panels[selected].ox = v; });
  bindSlider('panY', (v) => { state.panels[selected].oy = v; });

  let dragging = false;
  let last = null;
  let wheelPushed = false;
  canvas.addEventListener('pointerdown', (e) => {
    const p = canvasPoint(e);
    const hit = hitSlot(p.x, p.y);
    if (hit < 0) return;
    selected = hit;
    syncInspector();
    render();
    dragging = true;
    last = p;
    canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const p = canvasPoint(e);
    const rect = slotRects()[selected];
    const panel = state.panels[selected];
    panel.ox = Math.max(-0.5, Math.min(0.5, panel.ox + (p.x - last.x) / rect.w));
    panel.oy = Math.max(-0.5, Math.min(0.5, panel.oy + (p.y - last.y) / rect.h));
    last = p;
    syncInspector();
    render();
  });
  canvas.addEventListener('pointerup', () => {
    if (dragging) history.push();
    dragging = false;
  });
  canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    const p = canvasPoint(e);
    const hit = hitSlot(p.x, p.y);
    if (hit < 0) return;
    if (!wheelPushed) {
      history.push();
      wheelPushed = true;
      setTimeout(() => { wheelPushed = false; }, 600);
    }
    selected = hit;
    const panel = state.panels[selected];
    panel.zoom = Math.max(1, Math.min(3, panel.zoom * (1 - e.deltaY * 0.001)));
    syncInspector();
    render();
  }, { passive: false });

  document.getElementById('undoBtn').addEventListener('click', () => {
    if (history.undo()) { renderWithSize(); syncInspector(); }
  });
  document.getElementById('redoBtn').addEventListener('click', () => {
    if (history.redo()) { renderWithSize(); syncInspector(); }
  });

  document.getElementById('exportBtn').addEventListener('click', async () => {
    const blob = await exportCover(state, images());
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `vice-cover-${state.size}.png`;
    a.click();
    statusEl.textContent = `Saved vice-cover-${state.size}.png (${Math.round(blob.size / 1024)} KB)`;
  });
}

function syncAllInputs() {
  document.getElementById('titleInput').value = state.title;
  document.getElementById('subtitleInput').value = state.subtitle;
  document.getElementById('badgeToggle').checked = state.badge;
  document.getElementById('grainToggle').checked = state.grain;
  const mark = (rowId, attr, value) => {
    for (const b of document.getElementById(rowId).children) {
      b.classList.toggle('active', b.dataset[attr] === value);
    }
  };
  mark('layoutRow', 'key', state.layout);
  mark('gradeRow', 'key', state.grade);
  mark('colorRow', 'color', state.titleColor);
  mark('sizeRow', 'size', state.size);
  syncInspector();
}

async function init() {
  wire();
  syncInspector();
  const query = new URLSearchParams(location.search);
  const shot = query.get('shot');
  if (shot) {
    await runShot(shot, query, { state, loadSample, setPhotos, render, canvas });
    syncAllInputs();
    return;
  }
  try {
    await document.fonts.load('40px Anton');
    await document.fonts.load('20px Pacifico');
  } catch { /* fall back to system fonts */ }
  setPhotos([await loadSample('pier')]);
  document.fonts.ready.then(render);
}

window.__vice = { state, render, exportCover, images };
init();
