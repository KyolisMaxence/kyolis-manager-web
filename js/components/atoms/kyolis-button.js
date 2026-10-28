/* =====================================================================
   Atome : <kyolis-button>
   Attributs :
     href     : URL (rend un <a>)
     variant  : "green" (défaut, le seul bouton principal du site)
                | "ghost" (secondaire, filet clair)
                | "ghost-dark" (secondaire sur section sombre)
     full     : présent => largeur 100%
   Contenu : le label passe en slot.
   ===================================================================== */
import { KyolisElement, define } from '../../core/KyolisElement.js';

class KyolisButton extends KyolisElement {
  render() {
    const href = this.getAttribute('href') || '#';
    const variant = this.getAttribute('variant') || 'green';

    return {
      css: `
        :host{display:inline-block}
        :host([full]){display:block}
        a{
          display:inline-flex;align-items:center;justify-content:center;gap:8px;
          font-family:var(--font-display);font-weight:600;font-size:15px;
          text-decoration:none;height:46px;padding:0 22px;border-radius:var(--radius-md);
          border:1px solid transparent;
          transition:background var(--ease),border-color var(--ease),color var(--ease);
          text-align:center;cursor:pointer;white-space:nowrap;
        }
        :host([full]) a{display:flex;width:100%}
        a:focus-visible{outline:2px solid var(--color-green);outline-offset:3px}
        /* Vert au repos, dégradé signature en fondu au survol */
        .green{position:relative;isolation:isolate;overflow:hidden;background:var(--color-green);color:var(--color-white)}
        .green::before{content:"";position:absolute;inset:0;z-index:-1;background:var(--gradient-green-kyolis);
          opacity:0;transition:opacity var(--ease)}
        .green:hover::before{opacity:1}
        .ghost{color:var(--color-ink);border-color:var(--color-line-strong);background:var(--color-white)}
        .ghost:hover{border-color:var(--color-petrol)}
        .ghost-dark{color:var(--dark-text);border-color:var(--dark-line-strong);background:transparent}
        .ghost-dark:hover{border-color:var(--dark-mute);color:var(--color-white)}
      `,
      html: `<a class="${variant}" href="${href}"><slot></slot></a>`,
    };
  }
}

define('kyolis-button', KyolisButton);
