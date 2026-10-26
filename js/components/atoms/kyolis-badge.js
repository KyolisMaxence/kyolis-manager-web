/* =====================================================================
   Atome : <kyolis-badge tone="...">
   tone : "solid"  => pastille pleine verte (différenciateur)
          "delivered" => point plein + texte vert (état livré)
          "upcoming"  => cercle vide + texte gris (état à venir)
          "ref"    => pastille bordée (NIS2, CRA...)
   Contenu en slot.
   ===================================================================== */
import { KyolisElement, define } from '../../core/KyolisElement.js';

class KyolisBadge extends KyolisElement {
  render() {
    const tone = this.getAttribute('tone') || 'ref';

    return {
      css: `
        :host{display:inline-flex}
        .badge{
          font-family:var(--font-display);font-weight:700;
          display:inline-flex;align-items:center;gap:8px;
          letter-spacing:.06em;text-transform:uppercase;
        }
        /* solid */
        .solid{background:var(--color-green);color:var(--color-white);
          font-size:10px;padding:4px 11px;border-radius:var(--radius-pill)}
        /* delivered */
        .delivered{color:var(--color-green);font-size:11px;letter-spacing:.1em}
        .delivered::before{content:"";width:7px;height:7px;border-radius:50%;background:var(--color-green)}
        /* upcoming */
        .upcoming{color:var(--color-gray);font-size:10.5px;letter-spacing:.1em}
        .upcoming::before{content:"";width:7px;height:7px;border-radius:50%;border:1.5px solid var(--color-gray)}
        /* ref */
        .ref{color:var(--color-petrol);font-size:13px;letter-spacing:.05em;
          background:var(--color-white);border:1px solid var(--color-line);
          border-radius:var(--radius-pill);padding:10px 22px;text-transform:none}
      `,
      html: `<span class="badge ${tone}"><slot></slot></span>`,
    };
  }
}

define('kyolis-badge', KyolisBadge);
