/* =====================================================================
   Organisme : <kyolis-feature-block icon="..." kicker="..." heading="..."
                                     view="..." src="..." flip>
   Bloc fonctionnalité : aperçu de l'app + texte, alterné.
   Attributs :
     icon    : picto du kicker
     kicker  : sur-titre (ex. "Monitoring temps réel")
     heading : titre
     view    : vue de <kyolis-app-shot> à afficher
     src     : vraie capture (remplace la maquette quand elle existe)
     full    : capture entière, ouverte en grand au clic
     flip    : présent => visuel à droite
   Contenu (intro + liste) en slot.
   ===================================================================== */
import { KyolisElement, define } from '../../core/KyolisElement.js';
import '../atoms/kyolis-icon.js';
import './kyolis-app-shot.js';

class KyolisFeatureBlock extends KyolisElement {
  render() {
    const icon = this.getAttribute('icon') || '';
    const kicker = this.getAttribute('kicker') || '';
    const heading = this.getAttribute('heading') || '';
    const view = this.getAttribute('view') || 'parc';
    const src = this.getAttribute('src');
    const full = this.getAttribute('full');
    const flip = this.hasAttribute('flip');

    return {
      css: `
        :host{display:block}
        .block{display:grid;grid-template-columns:1.1fr .9fr;gap:64px;align-items:center;padding:56px 0;
          border-top:1px solid var(--color-line)}
        :host(:first-of-type) .block{border-top:none}
        .visual{min-width:0;${flip ? 'order:2' : ''}}
        .block{${flip ? 'grid-template-columns:.9fr 1.1fr' : ''}}
        .kicker{display:inline-flex;align-items:center;gap:8px;font-family:var(--font-display);
          font-weight:700;font-size:11px;letter-spacing:.12em;text-transform:uppercase;
          color:var(--color-green);margin-bottom:14px}
        .kicker kyolis-icon{color:var(--color-green)}
        h2{font-family:var(--font-display);font-size:30px;font-weight:700;letter-spacing:-.02em;
          color:var(--color-ink);margin:0 0 14px;line-height:1.15}
        @media(max-width:880px){
          .block{grid-template-columns:1fr;gap:28px;padding:40px 0}
          .visual{order:0}
          h2{font-size:25px}
        }
      `,
      html: `
        <div class="block">
          <div class="visual"><kyolis-app-shot view="${view}"${src ? ` src="${src}" alt="${heading}"` : ''}${full ? ` full="${full}"` : ''}></kyolis-app-shot></div>
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
