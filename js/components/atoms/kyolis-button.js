/* =====================================================================
   Atome : <kyolis-button>
   Attributs :
     href     : URL (rend un <a>)
     variant  : "green" (défaut) | "ghost"
     full     : présent => largeur 100%
   Contenu : le label passe en slot.
   ===================================================================== */
import { KyolisElement, define } from '../../core/KyolisElement.js';

class KyolisButton extends KyolisElement {
  render() {
    const href = this.getAttribute('href') || '#';
    const variant = this.getAttribute('variant') || 'green';
    const full = this.hasAttribute('full');

    return {
      css: `
        :host{display:inline-block}
        :host([full]){display:block}
        a{
          display:inline-block;font-family:var(--font-display);font-weight:700;
          font-size:15px;text-decoration:none;padding:16px 32px;
          border-radius:var(--radius-pill);transition:transform var(--ease),background var(--ease),border-color var(--ease);
          text-align:center;cursor:pointer;
        }
        :host([full]) a{display:block;width:100%}
        a:hover{transform:translateY(-2px)}
        a:focus-visible{outline:3px solid var(--color-green);outline-offset:3px}
        .green{background:var(--color-green);color:var(--color-white)}
        .green:hover{background:var(--color-green-deep)}
        .ghost{color:var(--color-ink);border:1px solid var(--color-line);background:var(--color-white)}
        .ghost:hover{border-color:var(--color-petrol)}
      `,
      html: `<a class="${variant}" href="${href}"><slot></slot></a>`,
    };
  }
}

define('kyolis-button', KyolisButton);
