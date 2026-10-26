/* =====================================================================
   Atome : <kyolis-icon name="..." size="46">
   Bibliothèque de pictogrammes SVG ligne, centralisée (source unique).
   Tous tracés sur une grille 48, stroke currentColor : la couleur vient
   du contexte (color hérité) ou d'un style local.
   Ajouter un picto = ajouter une entrée dans ICONS.
   ===================================================================== */
import { KyolisElement, define } from '../../core/KyolisElement.js';

const ICONS = {
  shield:   '<path d="M24 4 6 11v12c0 11 8 18 18 21 10-3 18-10 18-21V11L24 4z"/><path d="M17 24l5 5 9-10"/>',
  clock:    '<circle cx="24" cy="24" r="18"/><path d="M24 12v12l8 5"/>',
  building: '<path d="M8 40V20l16-12 16 12v20"/><path d="M8 40h32M18 40V28h12v12"/>',
  badge:    '<path d="M24 4l5 5 7-1 1 7 5 5-5 5 1 7-7-1-5 5-5-5-7 1 1-7-5-5 5-5-1-7 7 1 5-5z"/><path d="M18 24l4 4 9-9"/>',
  lock:     '<rect x="14" y="22" width="20" height="16" rx="4"/><path d="M18 22v-4a6 6 0 0 1 12 0v4"/><circle cx="24" cy="30" r="2"/>',
  offline:  '<path d="M24 6v8M24 34v8M6 24h8M34 24h8"/><circle cx="24" cy="24" r="8"/><path d="M12 12l5 5M36 12l-5 5M12 36l5-5M36 36l-5-5"/>',
  switch:   '<rect x="8" y="16" width="32" height="10" rx="2"/><rect x="8" y="28" width="32" height="10" rx="2"/><circle cx="15" cy="21" r="1.6"/><circle cx="15" cy="33" r="1.6"/>',
  search:   '<circle cx="22" cy="22" r="14"/><path d="M42 42l-8-8"/>',
  pulse:    '<path d="M6 24h8l6 16 8-32 6 16h8"/>',
  gear:     '<circle cx="24" cy="24" r="6"/><path d="M24 6v6M24 36v6M6 24h6M36 24h6M11 11l4 4M33 33l-4-4M37 11l-4 4M11 37l4-4"/>',
  doc:      '<path d="M14 6h20l8 8v28H14z"/><path d="M34 6v8h8M22 24h12M22 30h12M22 36h8"/>',
  download: '<path d="M24 6v24M14 20l10 10 10-10"/><path d="M10 42h28"/>',
  share:    '<circle cx="12" cy="24" r="6"/><circle cx="36" cy="12" r="6"/><circle cx="36" cy="36" r="6"/><path d="M17.4 21.4l13.2-6.8M17.4 26.6l13.2 6.8"/>',
  cube:     '<path d="M24 4l16 9v18l-16 9-16-9V13z"/><path d="M8 13l16 9 16-9M24 22v18"/>',
  mail:     '<rect x="6" y="10" width="36" height="28" rx="3"/><path d="M6 13l18 13 18-13"/>',
  refresh:  '<path d="M42 24a18 18 0 1 1-5-12.6"/><path d="M42 6v8h-8"/>',
};

class KyolisIcon extends KyolisElement {
  render() {
    const name = this.getAttribute('name');
    const size = this.getAttribute('size') || '44';
    const paths = ICONS[name] || '';

    return {
      css: `
        :host{display:inline-flex;line-height:0;color:inherit}
        svg{width:${size}px;height:${size}px;display:block}
      `,
      html: `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`,
    };
  }
}

define('kyolis-icon', KyolisIcon);
