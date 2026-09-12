(() => {
  'use strict';

  const stores = {
    accent: document.querySelector('#accentPicker'),
    other: document.querySelector('#otherPicker'),
    bg: document.querySelector('#bgPicker'),
    border: document.querySelector('#borderPicker')
  };
  const labels = {
    accent: '내 말풍선',
    other: '캐릭터 말풍선',
    bg: '채팅 배경',
    border: '외곽선'
  };
  const hexInputs = {
    accent: document.querySelector('#accentHex'),
    other: document.querySelector('#otherHex'),
    bg: document.querySelector('#bgHex'),
    border: document.querySelector('#borderHex')
  };

  const sheet = document.querySelector('#colorPickerSheet');
  const backdrop = document.querySelector('#colorPickerBackdrop');
  const title = document.querySelector('#colorPickerTitle');
  const done = document.querySelector('#colorPickerDone');
  const chip = document.querySelector('#colorPickerChip');
  const hexLabel = document.querySelector('#colorPickerHex');
  const plane = document.querySelector('#colorPlane');
  const cursor = document.querySelector('#colorPlaneCursor');
  const hue = document.querySelector('#colorHue');

  if (!sheet || !backdrop || !plane || !hue) return;

  let activeKey = null;
  let dragging = false;

  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

  function hexToRgb(hex) {
    const s = String(hex || '#000000').replace('#', '');
    const n = parseInt(s, 16) || 0;
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
  }

  function rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(v => clamp(Math.round(v), 0, 255).toString(16).padStart(2, '0')).join('').toUpperCase();
  }

  function rgbToHsv(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
    let h = 0;
    if (d) {
      if (max === r) h = 60 * (((g - b) / d) % 6);
      else if (max === g) h = 60 * ((b - r) / d + 2);
      else h = 60 * ((r - g) / d + 4);
    }
    if (h < 0) h += 360;
    return { h, s: max === 0 ? 0 : d / max, v: max };
  }

  function hexToHsv(hex) {
    const { r, g, b } = hexToRgb(hex);
    return rgbToHsv(r, g, b);
  }

  function hsvToHex(h, s, v) {
    h = ((h % 360) + 360) % 360;
    s = clamp(s, 0, 1); v = clamp(v, 0, 1);
    const c = v * s;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = v - c;
    let r = 0, g = 0, b = 0;
    if (h < 60) { r = c; g = x; }
    else if (h < 120) { r = x; g = c; }
    else if (h < 180) { g = c; b = x; }
    else if (h < 240) { g = x; b = c; }
    else if (h < 300) { r = x; b = c; }
    else { r = c; b = x; }
    return rgbToHex((r + m) * 255, (g + m) * 255, (b + m) * 255);
  }

  function currentHex() {
    return activeKey && stores[activeKey] ? stores[activeKey].value.toUpperCase() : '#000000';
  }

  function syncSwatchButtons() {
    document.querySelectorAll('[data-color-open]').forEach(button => {
      const key = button.dataset.colorOpen;
      const store = stores[key];
      if (!store) return;
      const span = button.querySelector('span');
      if (span) span.style.background = store.value;
      button.style.setProperty('--picked-color', store.value);
    });
  }

  function syncPickerFromStore() {
    if (!activeKey || !stores[activeKey]) return;
    const hex = currentHex();
    const hsv = hexToHsv(hex);
    hue.value = String(Math.round(hsv.h));
    plane.style.setProperty('--picker-hue', `hsl(${hsv.h} 100% 50%)`);
    cursor.style.left = `${hsv.s * 100}%`;
    cursor.style.top = `${(1 - hsv.v) * 100}%`;
    chip.style.background = hex;
    hexLabel.textContent = hex;
  }

  function pushColor(hex) {
    if (!activeKey || !stores[activeKey]) return;
    const store = stores[activeKey];
    store.value = hex;
    store.dispatchEvent(new Event('input', { bubbles: true }));
    syncSwatchButtons();
    chip.style.background = hex;
    hexLabel.textContent = hex;
  }

  function updateFromPlane(clientX, clientY) {
    if (!activeKey) return;
    const rect = plane.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const s = clamp((clientX - rect.left) / rect.width, 0, 1);
    const v = 1 - clamp((clientY - rect.top) / rect.height, 0, 1);
    const h = Number(hue.value) || 0;
    cursor.style.left = `${s * 100}%`;
    cursor.style.top = `${(1 - v) * 100}%`;
    pushColor(hsvToHex(h, s, v));
  }

  function openPicker(key) {
    if (!stores[key]) return;
    activeKey = key;
    title.textContent = labels[key] || '색 선택';
    sheet.hidden = false;
    backdrop.hidden = false;
    document.documentElement.classList.add('color-picker-open');
    syncPickerFromStore();
  }

  function closePicker() {
    sheet.hidden = true;
    backdrop.hidden = true;
    document.documentElement.classList.remove('color-picker-open');
    activeKey = null;
    dragging = false;
  }

  document.querySelectorAll('[data-color-open]').forEach(button => {
    button.addEventListener('click', () => openPicker(button.dataset.colorOpen));
  });

  plane.addEventListener('pointerdown', event => {
    dragging = true;
    try { plane.setPointerCapture(event.pointerId); } catch (_) {}
    updateFromPlane(event.clientX, event.clientY);
  });
  plane.addEventListener('pointermove', event => {
    if (!dragging) return;
    updateFromPlane(event.clientX, event.clientY);
  });
  plane.addEventListener('pointerup', () => { dragging = false; });
  plane.addEventListener('pointercancel', () => { dragging = false; });

  hue.addEventListener('input', () => {
    if (!activeKey) return;
    const hsv = hexToHsv(currentHex());
    const h = Number(hue.value) || 0;
    plane.style.setProperty('--picker-hue', `hsl(${h} 100% 50%)`);
    pushColor(hsvToHex(h, hsv.s, hsv.v));
  });

  done.addEventListener('click', closePicker);
  backdrop.addEventListener('click', closePicker);
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !sheet.hidden) closePicker();
  });

  Object.values(stores).filter(Boolean).forEach(store => {
    store.addEventListener('input', syncSwatchButtons);
    store.addEventListener('change', syncSwatchButtons);
  });

  Object.values(hexInputs).filter(Boolean).forEach(input => {
    input.addEventListener('change', () => requestAnimationFrame(syncSwatchButtons));
  });

  document.addEventListener('click', event => {
    if (event.target.closest('.preset, #resetTheme')) requestAnimationFrame(syncSwatchButtons);
  });

  syncSwatchButtons();
})();
