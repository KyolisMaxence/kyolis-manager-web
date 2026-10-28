/* =====================================================================
   Organisme : <kyolis-measure-block icon="..." kicker="..." heading="..."
                                     src="..." full="..." flip>
   Grand bloc alterné (visuel + texte) des mesures de sécurité livrées.
   Attributs :
     icon    : nom de picto (grand format), affiché sans capture
     kicker  : sur-titre (ex. "Authentification et accès")
     heading : titre du bloc
     src     : capture de l'app qui prouve la mesure (remplace le picto)
     full    : capture entière, ouverte en grand au clic
     flip    : présent => visuel à droite (alternance gérée par la page)
     inset   : seconde capture, plus petite, posée en coin (inset-alt : son texte alternatif)
   Contenu : la liste <ul><li> passe en slot.
   ===================================================================== */
import { KyolisElement, define } from '../../core/KyolisElement.js';
import '../atoms/kyolis-icon.js';
import './kyolis-app-shot.js';

class KyolisMeasureBlock extends KyolisElement {
  render() {
    const icon = this.getAttribute('icon') || 'shield';
    const kicker = this.getAttribute('kicker') || '';
    const heading = this.getAttribute('heading') || '';
    const src = this.getAttribute('src');
    const full = this.getAttribute('full');
    const flip = this.hasAttribute('flip');
    const inset = this.getAttribute('inset');

    const visual = src
      ? `<kyolis-app-shot class="capture" src="${src}" alt="${heading}"${full ? ` full="${full}"` : ''}></kyolis-app-shot>`
      : `<kyolis-icon class="art" name="${icon}" size="180"></kyolis-icon>`;
    /* Seconde capture, plus petite, posée en coin sur la première */
    const insetShot = src && inset
      ? `<kyolis-app-shot class="inset" src="${inset}" alt="${this.getAttribute('inset-alt') || heading}"></kyolis-app-shot>`
      : '';

    return {
      css: `
        :host{display:block}
        .block{display:grid;grid-template-columns:1fr 1fr;gap:80px;align-items:center;padding:60px 0}
        .visual{position:relative;display:flex;justify-content:center;min-width:0;${flip ? 'order:2' : ''}}
        .visual.has-inset{padding-bottom:56px}
        .art{color:var(--color-green);opacity:.92}
        .capture{width:100%}
        .inset{position:absolute;width:46%;bottom:0;${flip ? 'left:-28px' : 'right:-28px'};
          filter:drop-shadow(0 14px 30px rgba(28,39,45,.22))}
        .kicker{display:inline-flex;align-items:center;gap:9px;font-family:var(--font-display);
          font-weight:700;font-size:11px;letter-spacing:.1em;text-transform:uppercase;
          color:var(--color-green);margin-bottom:16px}
        .kicker::before{content:"";width:7px;height:7px;border-radius:50%;background:var(--color-green)}
        h3{font-family:var(--font-display);font-size:26px;font-weight:700;letter-spacing:-.02em;color:var(--color-ink);
          margin:0 0 18px;line-height:1.2}
        ::slotted(ul){margin:0;padding:0}
        @media(max-width:820px){
          .block{grid-template-columns:1fr;gap:32px;padding:44px 0;text-align:center}
          .visual{order:0}
          .visual.has-inset{flex-direction:column;gap:16px;padding-bottom:0}
          .inset{position:static;width:100%;filter:none}
          .kicker{justify-content:center}
        }
      `,
      html: `
        <div class="block">
          <div class="visual${insetShot ? ' has-inset' : ''}">${visual}${insetShot}</div>
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
