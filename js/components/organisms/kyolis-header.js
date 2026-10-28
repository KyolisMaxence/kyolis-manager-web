/* =====================================================================
   Organisme : <kyolis-header active="securite" tone="dark">
   En-tête de site. SOURCE UNIQUE pour toutes les pages (fin de la
   duplication). L'attribut "active" marque l'onglet courant.
   L'attribut "tone" = "dark" pose l'en-tête sur un héros sombre
   (accueil) ; il redevient clair au défilement.
   Sous 1140px, la navigation passe dans un menu déroulant (bouton à trois traits).
   La navigation est définie une seule fois ci-dessous (NAV).
   ===================================================================== */
import { KyolisElement, define } from '../../core/KyolisElement.js';

const NAV = [
  { id: 'accueil',         label: 'Accueil',          href: 'index.html' },
  { id: 'fonctionnalites', label: 'Fonctionnalités',  href: 'fonctionnalites.html' },
  { id: 'securite',        label: 'Sécurité',         href: 'securite.html' },
  { id: 'ressources',      label: "L'application",    href: 'ressources.html' },
  { id: 'versions',        label: 'Notes de version', href: 'versions.html' },
];

/* Libellé et cible de l'appel principal (accès sur demande) */
export const CTA = { label: "Recevoir l'application", href: 'demande-acces.html' };

class KyolisHeader extends KyolisElement {
  render() {
    const active = this.getAttribute('active') || '';
    const links = NAV.map((n) =>
      `<a href="${n.href}" class="${n.id === active ? 'active' : ''}"${n.id === active ? ' aria-current="page"' : ''}>${n.label}</a>`
    ).join('');

    return {
      css: `
        :host{position:sticky;top:0;z-index:30;display:block;
          background:rgba(255,255,255,.88);backdrop-filter:blur(12px);
          border-bottom:1px solid var(--color-line);transition:background var(--ease),border-color var(--ease)}
        :host([tone="dark"]:not(.is-scrolled)){background:rgba(28,39,45,.7);border-bottom-color:var(--dark-line)}
        .wrap{max-width:var(--maxw);margin:0 auto;padding:0 var(--space-4);
          display:flex;align-items:center;justify-content:space-between;height:76px}
        .brand{display:inline-flex;align-items:center;gap:10px;font-family:var(--font-display);text-decoration:none}
        .brand__logo{height:56px;width:auto;display:block}
        .brand__logo--blanc{display:none}
        .right{display:flex;align-items:center}
        nav{display:flex;gap:4px}
        nav a{text-decoration:none;font-family:var(--font-display);font-weight:500;font-size:14px;
          padding:7px 12px;border-radius:var(--radius-md);color:var(--color-gray);white-space:nowrap;transition:color var(--ease),background var(--ease)}
        nav a:hover{color:var(--color-ink);background:var(--color-mist)}
        nav a.active{color:var(--color-ink);background:var(--color-mist)}
        .actions{display:flex;align-items:center;gap:8px;margin-left:20px}
        .cta{font-family:var(--font-display);font-weight:600;font-size:14px;
          text-decoration:none;height:36px;display:inline-flex;align-items:center;padding:0 14px;
          border-radius:var(--radius-md);border:1px solid transparent;white-space:nowrap;
          transition:background var(--ease),border-color var(--ease),color var(--ease)}
        .cta--green{position:relative;isolation:isolate;overflow:hidden;background:var(--color-green);color:var(--color-white)}
        .cta--green::before{content:"";position:absolute;inset:0;z-index:-1;background:var(--gradient-green-kyolis);
          opacity:0;transition:opacity var(--ease)}
        .cta--green:hover::before{opacity:1}
        .cta--ghost{color:var(--color-ink);border-color:var(--color-line-strong)}
        .cta--ghost:hover{border-color:var(--color-petrol)}
        a:focus-visible{outline:2px solid var(--color-green);outline-offset:3px;border-radius:6px}

        /* Variante sombre (sur le héros de l'accueil) */
        :host([tone="dark"]:not(.is-scrolled)) .brand__logo--couleur{display:none}
        :host([tone="dark"]:not(.is-scrolled)) .brand__logo--blanc{display:block}
        :host([tone="dark"]:not(.is-scrolled)) nav a{color:var(--dark-mute)}
        :host([tone="dark"]:not(.is-scrolled)) nav a:hover,
        :host([tone="dark"]:not(.is-scrolled)) nav a.active{color:var(--color-white);background:var(--dark-2)}
        :host([tone="dark"]:not(.is-scrolled)) .cta--ghost{color:var(--dark-text);border-color:var(--dark-line-strong)}

        /* Menu mobile : bouton à trois traits et panneau déroulant (sous 920px) */
        .burger{display:none;width:40px;height:40px;margin-left:8px;padding:0;border:1px solid var(--color-line-strong);
          border-radius:var(--radius-md);background:transparent;cursor:pointer;
          flex-direction:column;align-items:center;justify-content:center;gap:4px}
        .burger span{display:block;width:18px;height:2px;border-radius:1px;background:var(--color-ink);
          transition:transform var(--ease),opacity var(--ease)}
        .burger[aria-expanded="true"] span:nth-child(1){transform:translateY(6px) rotate(45deg)}
        .burger[aria-expanded="true"] span:nth-child(2){opacity:0}
        .burger[aria-expanded="true"] span:nth-child(3){transform:translateY(-6px) rotate(-45deg)}
        .burger:focus-visible{outline:2px solid var(--color-green);outline-offset:3px}
        :host([tone="dark"]:not(.is-scrolled)) .burger{border-color:var(--dark-line-strong)}
        :host([tone="dark"]:not(.is-scrolled)) .burger span{background:var(--color-white)}
        .panel{position:absolute;top:100%;left:0;right:0;background:var(--color-white);
          border-bottom:1px solid var(--color-line);padding:12px var(--space-4) 20px}
        .panel[hidden]{display:none}
        .panel nav{display:flex;flex-direction:column;gap:2px}
        .panel nav a{font-size:16px;padding:12px}
        .panel .cta{display:flex;justify-content:center;height:46px;font-size:15px;margin-top:12px}

        @media(max-width:1140px){.right>nav{display:none}.actions{margin-left:0}.burger{display:inline-flex}}
        @media(min-width:1141px){.panel{display:none}}
        @media(max-width:520px){
          .actions .cta--ghost{display:none}.brand__logo{height:44px}
          .wrap,.panel{padding-left:var(--space-2);padding-right:var(--space-2)}
          .actions .cta{padding:0 12px;font-size:13px}
        }
      `,
      html: `
        <div class="wrap">
          <a class="brand" href="index.html" aria-label="KYOLIS® Manager, accueil">
            <img class="brand__logo brand__logo--couleur" src="../assets/img/logo/manager-horizontal-couleur.svg" alt="">
            <img class="brand__logo brand__logo--blanc" src="../assets/img/logo/manager-horizontal-blanc.svg" alt="">
          </a>
          <div class="right">
            <nav aria-label="Navigation principale">${links}</nav>
            <div class="actions">
              <a class="cta cta--ghost" href="ressources.html#contact">Contacter l'équipe</a>
              <a class="cta cta--green" href="${CTA.href}">${CTA.label}</a>
            </div>
            <button class="burger" type="button" aria-expanded="false" aria-controls="menu-mobile" aria-label="Ouvrir le menu">
              <span></span><span></span><span></span>
            </button>
          </div>
        </div>
        <div class="panel" id="menu-mobile" hidden>
          <nav aria-label="Navigation principale">${links}</nav>
          <a class="cta cta--ghost" href="ressources.html#contact">Contacter l'équipe</a>
        </div>
      `,
    };
  }

  afterRender() {
    const burger = this.shadowRoot.querySelector('.burger');
    const panel = this.shadowRoot.querySelector('.panel');

    /* En-tête sombre : repasse en clair une fois le héros dépassé,
       ou quand le menu mobile est ouvert (panneau sur fond blanc) */
    const syncTone = () => {
      if (this.getAttribute('tone') !== 'dark') return;
      this.classList.toggle('is-scrolled', window.scrollY > 480 || !panel.hidden);
    };
    const setOpen = (open) => {
      panel.hidden = !open;
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
      syncTone();
    };

    burger.addEventListener('click', () => setOpen(panel.hidden));
    panel.addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false); });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !panel.hidden) { setOpen(false); burger.focus(); }
    });
    document.addEventListener('click', (e) => { if (!panel.hidden && !e.composedPath().includes(this)) setOpen(false); });
    window.matchMedia('(min-width: 1141px)').addEventListener('change', (e) => { if (e.matches) setOpen(false); });
    window.addEventListener('scroll', syncTone, { passive: true });
    syncTone();
  }
}

define('kyolis-header', KyolisHeader);
