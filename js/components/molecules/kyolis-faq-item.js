/* =====================================================================
   Molécule : <kyolis-faq-item question="...">
   Accordéon natif (<details>) accessible au clavier.
   Attribut : question
   Contenu (réponse) en slot.
   ===================================================================== */
import { KyolisElement, define } from '../../core/KyolisElement.js';

class KyolisFaqItem extends KyolisElement {
  render() {
    const question = this.getAttribute('question') || '';

    return {
      css: `
        :host{display:block;border-bottom:1px solid var(--color-line)}
        details{padding:4px 0}
        summary{cursor:pointer;list-style:none;padding:22px 40px 22px 0;position:relative;
          font-family:var(--font-display);font-weight:700;font-size:18px;color:var(--color-ink)}
        summary::-webkit-details-marker{display:none}
        summary::after{content:"+";position:absolute;right:6px;top:50%;
          transform:translateY(-50%);font-size:24px;color:var(--color-green);
          font-weight:400;transition:transform var(--ease)}
        details[open] summary::after{transform:translateY(-50%) rotate(45deg)}
        summary:focus-visible{outline:3px solid var(--color-green);outline-offset:3px;border-radius:4px}
        .answer{padding:0 40px 22px 0;color:#3c4a50;font-size:16px}
      `,
      html: `
        <details>
          <summary>${question}</summary>
          <div class="answer"><slot></slot></div>
        </details>
      `,
    };
  }
}

define('kyolis-faq-item', KyolisFaqItem);
