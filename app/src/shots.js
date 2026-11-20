// Fixed scenes for screenshots: ?shot=cover shows the cover alone at the size
// the query names; ?shot=editor shows the editor with a photo loaded.
// window.__shotReady is set once the scene has painted.
export async function runShot(shot, query, api) {
  const { state, loadSample, setPhotos, render, canvas } = api;
  const names = (query.get('photos') ?? query.get('photo') ?? 'pier').split(',');
  const loaded = [];
  for (const name of names) loaded.push(await loadSample(name.trim()));
  setPhotos(loaded);
  if (query.get('layout')) state.layout = query.get('layout');
  if (query.get('grade')) state.grade = query.get('grade');
  if (query.get('title')) state.title = query.get('title');
  if (query.get('subtitle')) state.subtitle = query.get('subtitle');
  if (query.get('color')) state.titleColor = query.get('color');
  const w = Number(query.get('w') ?? 0);
  const h = Number(query.get('h') ?? 0);
  if (w > 0 && h > 0) {
    canvas.width = w;
    canvas.height = h;
  }
  if (shot === 'cover') document.body.classList.add('shot-cover');
  await document.fonts.ready;
  render();
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  window.__shotReady = true;
}
