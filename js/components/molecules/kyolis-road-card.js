/* =====================================================================
   Molécule : <kyolis-road-card heading="..." feature>
   Carte de la feuille de route.
   Attributs :
     heading  : titre de la carte
     feature  : présent => carte différenciateur (fond vert pâle + badge)
   Contenu (description) en slot.
   Compose : kyolis-badge.
   ===================================================================== */
import { KyolisElement, define } from '../../core/KyolisElement.js';
import '../atoms/kyolis-badge.js';

class KyolisRoadCard extends KyolisElement {
  render() {
    const heading = this.getAttribute('heading') || '';
    const feature = this.hasAttribute('feature');

    return {
      css: `
        :host{display:block}
        .card{
          padding:32px 28px;border-radius:var(--radius-md);
          background:var(--color-paper);border:1px solid var(--color-line);
          transition:transform var(--ease),box-shadow var(--ease);height:100%;
        }
        .card:hover{transform:translateY(-4px);box-shadow:var(--shadow-card)}
        .card.feature{background:var(--color-green-pale);border-color:rgba(53,154,102,.3)}
        h3{font-family:var(--font-display);font-size:18px;font-weight:700;
          color:var(--color-ink);margin:0 0 8px}
        ::slotted(p){font-size:14.5px;color:var(--color-gray);margin:0}
        .top{margin-bottom:14px;display:flex;flex-direction:column;gap:12px;align-items:flex-start}
      `,
      html: `
        <div class="card ${feature ? 'feature' : ''}">
          <div class="top">
            ${feature ? '<kyolis-badge tone="solid">Différenciateur majeur</kyolis-badge>' : ''}
            <kyolis-badge tone="upcoming">À venir</kyolis-badge>
          </div>
          <h3>${heading}</h3>
          <slot></slot>
        </div>
      `,
    };
  }
}

define('kyolis-road-card', KyolisRoadCard);
