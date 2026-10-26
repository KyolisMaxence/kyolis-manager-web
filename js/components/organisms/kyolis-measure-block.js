/* =====================================================================
   Organisme : <kyolis-measure-block icon="..." kicker="..." heading="..." flip>
   Grand bloc alterné (visuel + texte) des mesures de sécurité livrées.
   Attributs :
     icon    : nom de picto (grand format)
     kicker  : sur-titre (ex. "Authentification et accès")
     heading : titre du bloc
     flip    : présent => visuel à droite (alternance gérée par la page)
   Contenu : la liste <ul><li> passe en slot.
   ===================================================================== */
import { KyolisElement, define } from '../../core/KyolisElement.js';
import '../atoms/kyolis-icon.js';

class KyolisMeasureBlock extends KyolisElement {
  render() {
    const icon = this.getAttribute('icon') || 'shield';
    const kicker = this.getAttribute('kicker') || '';
    const heading = this.getAttribute('heading') || '';
    const flip = this.hasAttribute('flip');

    return {
      css: `
        :host{display:block}
        .block{display:grid;grid-template-columns:1fr 1fr;gap:80px;align-items:center;padding:60px 0}
        .visual{display:flex;justify-content:center;${flip ? 'order:2' : ''}}
        .art{color:var(--color-green);opacity:.92}
        .kicker{display:inline-flex;align-items:center;gap:9px;font-family:var(--font-display);
          font-weight:700;font-size:11px;letter-spacing:.1em;text-transform:uppercase;
          color:var(--color-green);margin-bottom:16px}
        .kicker::before{content:"";width:7px;height:7px;border-radius:50%;background:var(--color-green)}
        h3{font-family:var(--font-display);font-size:26px;font-weight:900;color:var(--color-ink);
          margin:0 0 18px;line-height:1.2}
        ::slotted(ul){margin:0;padding:0}
        @media(max-width:820px){
          .block{grid-template-columns:1fr;gap:32px;padding:44px 0;text-align:center}
          .visual{order:0}
          .kicker{justify-content:center}
        }
      `,
      html: `
        <div class="block">
          <div class="visual">
            <kyolis-icon class="art" name="${icon}" size="180"></kyolis-icon>
          </div>
          <div class="text">
            <span class="kicker">${kicker}</span>
            <h3>${heading}</h3>
            <slot></slot>
          </div>
        </div>
      `,
    };
  }
}

define('kyolis-measure-block', KyolisMeasureBlock);
