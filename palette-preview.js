(() => {
  'use strict';

  const palette = document.querySelector('#palette');
  const accent = document.querySelector('#accentPicker');
  const other = document.querySelector('#otherPicker');
  const chat = document.querySelector('#bgPicker');
  if (!palette || !accent || !other || !chat) return;

  const clamp = (v, min = 0, max = 255) => Math.max(min, Math.min(max, v));
  const hexToRgb = hex => {
    const n = parseInt(String(hex || '#000000').replace('#', ''), 16) || 0;
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
  };
  const rgbToHex = ({ r, g, b }) => '#' + [r, g, b]
    .map(v => clamp(Math.round(v)).toString(16).padStart(2, '0'))
    .join('').toUpperCase();
  const mix = (a, b, t) => {
    const x = hexToRgb(a), y = hexToRgb(b);
    return rgbToHex({
      r: x.r + (y.r - x.r) * t,
      g: x.g + (y.g - x.g) * t,
      b: x.b + (y.b - x.b) * t
    });
  };
  const luminance = hex => {
    const { r, g, b } = hexToRgb(hex);
    const f = v => {
      v /= 255;
      return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4);
    };
    return .2126 * f(r) + .7152 * f(g) + .0722 * f(b);
  };
  const textFor = bg => luminance(bg) > .48 ? '#191919' : '#FFFFFF';

  function removeDuplicatePresets() {
    const seen = new Set();
    document.querySelectorAll('.presets .preset').forEach(button => {
      const key = button.textContent.trim();
      if (seen.has(key)) button.remove();
      else seen.add(key);
    });
  }

  function renderPalette() {
    const a = accent.value.toUpperCase();
    const c = chat.value.toUpperCase();
    const hover = luminance(a) > .55 ? mix(a, '#000000', .08) : mix(a, '#FFFFFF', .10);
    const surface = luminance(c) < .28 ? mix(c, '#FFFFFF', .86) : '#FFFFFF';
    const line = mix(surface, textFor(surface), .10);

    palette.innerHTML = [
      ['Accent', a],
      ['Hover', hover],
      ['Chat', c],
      ['Surface', surface],
      ['Line', line]
    ].map(([name, color]) => (
      `<div style="background:${color};color:${textFor(color)}"><span>${name}<br>${color}</span></div>`
    )).join('');
  }

  [accent, other, chat].forEach(input => {
    input.addEventListener('input', renderPalette);
    input.addEventListener('change', renderPalette);
  });

  document.addEventListener('click', event => {
    if (event.target.closest('.preset, #resetTheme')) requestAnimationFrame(renderPalette);
  });

  removeDuplicatePresets();
  renderPalette();
})();
