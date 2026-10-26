/* =====================================================================
   Organisme : <kyolis-posture dark>
   Section "KYOLIS conseille, le client agit".
   Attribut :
     dark : présent => version pétrole sombre (page Sécurité, intensité forte)
            absent  => version claire et compacte (rappel sur l'accueil)
   Contenu (paragraphes) en slot.
   ===================================================================== */
import { KyolisElement, define } from '../../core/KyolisElement.js';

class KyolisPosture extends KyolisElement {
  render() {
    const dark = this.hasAttribute('dark');

    return {
      css: `
        :host{display:block}
        .section{padding:${dark ? '124px' : 'var(--space-13)'} 0;text-align:center;position:relative;overflow:hidden}
        .section.dark{background:var(--color-petrol-darker);color:var(--color-white)}
        .halo{position:absolute;inset:0;background:radial-gradient(50% 60% at 50% 0%, rgba(53,154,102,.16) 0%, rgba(53,154,102,0) 70%)}
        .wrap{position:relative;max-width:760px;margin:0 auto;padding:0 var(--space-4)}
        .eyebrow{font-family:var(--font-display);font-weight:700;text-transform:uppercase;
          letter-spacing:.18em;font-size:var(--text-xs);margin-bottom:var(--space-2);
          color:${dark ? 'var(--color-green-soft)' : 'var(--color-green)'}}
        .claim{font-family:var(--font-display);font-weight:900;line-height:1.1;
          font-size:${dark ? '50px' : '40px'};margin:0 auto 34px;max-width:18ch;
          color:${dark ? 'var(--color-white)' : 'var(--color-ink)'}}
        .claim em{font-style:normal;color:${dark ? 'var(--color-green-soft)' : 'var(--color-green)'}}
        .verbs{display:flex;justify-content:center;gap:14px;flex-wrap:wrap;margin-bottom:34px}
        .verbs span{font-family:var(--font-display);font-weight:700;font-size:14px;
          border-radius:var(--radius-pill);padding:11px 24px;
          ${dark
            ? 'color:var(--color-white);border:1px solid rgba(127,208,164,.4)'
            : 'color:var(--color-petrol);border:1px solid var(--color-line)'}}
        ::slotted(p){font-weight:300;margin:0 auto 18px;max-width:64ch;
          font-size:18px;color:${dark ? '#c5d2d6' : 'var(--color-gray)'}}
        @media(max-width:680px){.section{padding:78px 0}.claim{font-size:${dark ? '32px' : '28px'}}}
      `,
      html: `
        <div class="section ${dark ? 'dark' : ''}">
          ${dark ? '<div class="halo"></div>' : ''}
          <div class="wrap">
            <div class="eyebrow">Nos valeurs</div>
            <div class="claim">KYOLIS conseille, <em>vous agissez.</em></div>
            <div class="verbs"><span>Détecte</span><span>Alerte</span><span>Conseille</span><span>Trace</span></div>
            <slot></slot>
          </div>
        </div>
      `,
    };
  }
}

define('kyolis-posture', KyolisPosture);
