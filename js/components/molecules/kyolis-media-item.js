/* =====================================================================
   Molécule : <kyolis-media-item icon="..." heading="..." tag="...">
   Bloc icône + titre + texte. Réutilisé pour bénéfices et référentiels.
   Attributs :
     icon     : nom de picto (kyolis-icon)
     heading  : titre
     tag      : sur-titre optionnel (ex. "Directive européenne")
   Contenu (paragraphe) en slot.
   Compose : kyolis-icon.
   ===================================================================== */
import { KyolisElement, define } from '../../core/KyolisElement.js';
import '../atoms/kyolis-icon.js';

class KyolisMediaItem extends KyolisElement {
  render() {
    const icon = this.getAttribute('icon') || '';
    const heading = this.getAttribute('heading') || '';
    const tag = this.getAttribute('tag') || '';

    return {
      css: `
        :host{display:block}
        .item{display:flex;gap:22px;align-items:flex-start}
        .ic{flex:none;color:var(--color-green)}
        h3{font-family:var(--font-display);font-size:var(--h3);font-weight:700;
          color:var(--color-ink);margin:0 0 4px}
        .tag{display:block;font-size:13px;color:var(--color-green);font-weight:600;margin-bottom:10px}
        ::slotted(p){font-size:15.5px;color:var(--color-gray);margin:0}
      `,
      html: `
        <div class="item">
          <kyolis-icon class="ic" name="${icon}" size="46"></kyolis-icon>
          <div>
            <h3>${heading}</h3>
            ${tag ? `<span class="tag">${tag}</span>` : ''}
            <slot></slot>
          </div>
        </div>
      `,
    };
  }
}

define('kyolis-media-item', KyolisMediaItem);
