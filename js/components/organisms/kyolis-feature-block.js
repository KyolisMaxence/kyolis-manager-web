/* =====================================================================
   Organisme : <kyolis-feature-block icon="..." kicker="..." heading="..."
                                     shot="..." flip>
   Bloc fonctionnalité : zone de capture + texte, alterné.
   Attributs :
     icon    : picto du kicker
     kicker  : sur-titre (ex. "Monitoring temps réel")
     heading : titre
     shot    : légende de l'emplacement de capture (à remplacer par image)
     flip    : présent => visuel à droite
   Contenu (intro + liste) en slot.
   ===================================================================== */
import { KyolisElement, define } from '../../core/KyolisElement.js';
import '../atoms/kyolis-icon.js';

class KyolisFeatureBlock extends KyolisElement {
  render() {
    const icon = this.getAttribute('icon') || '';
    const kicker = this.getAttribute('kicker') || '';
    const heading = this.getAttribute('heading') || '';
    const shot = this.getAttribute('shot') || 'Capture';
    const flip = this.hasAttribute('flip');

    return {
      css: `
        :host{display:block}
        .block{display:grid;grid-template-columns:1fr 1fr;gap:72px;align-items:center;padding:64px 0}
        .visual{${flip ? 'order:2' : ''}}
        .shot{
          background:repeating-linear-gradient(45deg,var(--color-mist),var(--color-mist) 12px,var(--color-paper) 12px,var(--color-paper) 24px);
          border:1px dashed var(--color-line);border-radius:var(--radius-md);
          display:flex;align-items:center;justify-content:center;color:var(--color-gray);
          font-family:var(--font-display);font-weight:700;font-size:13px;letter-spacing:.04em;
          text-transform:uppercase;min-height:320px;text-align:center;padding:24px}
        .kicker{display:inline-flex;align-items:center;gap:9px;font-family:var(--font-display);
          font-weight:700;font-size:11px;letter-spacing:.1em;text-transform:uppercase;
          color:var(--color-green);margin-bottom:16px}
        .kicker kyolis-icon{color:var(--color-green)}
        h2{font-family:var(--font-display);font-size:30px;font-weight:900;color:var(--color-ink);margin:0 0 16px;line-height:1.15}
        @media(max-width:820px){
          .block{grid-template-columns:1fr;gap:32px;padding:44px 0}
          .visual{order:0}
        }
      `,
      html: `
        <div class="block">
          <div class="visual"><div class="shot">${shot}</div></div>
          <div class="text">
            <span class="kicker"><kyolis-icon name="${icon}" size="18"></kyolis-icon>${kicker}</span>
            <h2>${heading}</h2>
            <slot></slot>
          </div>
        </div>
      `,
    };
  }
}

define('kyolis-feature-block', KyolisFeatureBlock);
