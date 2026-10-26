/* =====================================================================
   Organisme : <kyolis-header active="securite" tone="dark">
   En-tête de site. SOURCE UNIQUE pour toutes les pages (fin de la
   duplication). L'attribut "active" marque l'onglet courant.
   L'attribut "tone" = "dark" pose l'en-tête sur un héros sombre
   (accueil) ; il redevient clair au défilement.
   La navigation est définie une seule fois ci-dessous (NAV).
   ===================================================================== */
import { KyolisElement, define } from '../../core/KyolisElement.js';

const NAV = [
  { id: 'accueil',         label: 'Accueil',          href: 'index.html' },
  { id: 'fonctionnalites', label: 'Fonctionnalités',  href: 'fonctionnalites.html' },
  { id: 'securite',        label: 'Sécurité',         href: 'securite.html' },
  { id: 'ressources',      label: "L'application",    href: 'ressources.html' },
];

/* Libellé et cible de l'appel principal (accès sur demande) */
export const CTA = { label: "Obtenir l'application", href: 'demande-acces.html' };

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
          display:flex;align-items:center;justify-content:space-between;height:64px}
        .brand{display:inline-flex;align-items:center;gap:10px;font-family:var(--font-display);text-decoration:none}
        .brand__logo{height:30px;width:auto;display:block;border-radius:6px}
        .brand__name{font-weight:700;font-size:14.5px;letter-spacing:.04em;color:var(--color-ink)}
        .brand__sub{margin-left:5px;font-weight:500;color:var(--color-gray)}
        .right{display:flex;align-items:center}
        nav{display:flex;gap:4px}
        nav a{text-decoration:none;font-family:var(--font-display);font-weight:500;font-size:14px;
          padding:7px 12px;border-radius:var(--radius-md);color:var(--color-gray);transition:color var(--ease),background var(--ease)}
        nav a:hover{color:var(--color-ink);background:var(--color-mist)}
        nav a.active{color:var(--color-ink);background:var(--color-mist)}
        .actions{display:flex;align-items:center;gap:8px;margin-left:20px}
        .cta{font-family:var(--font-display);font-weight:600;font-size:14px;
          text-decoration:none;height:36px;display:inline-flex;align-items:center;padding:0 14px;
          border-radius:var(--radius-md);border:1px solid transparent;white-space:nowrap;
          transition:background var(--ease),border-color var(--ease),color var(--ease)}
        .cta--green{background:var(--color-green);color:var(--color-white)}
        .cta--green:hover{background:var(--color-green-deep)}
        .cta--ghost{color:var(--color-ink);border-color:var(--color-line-strong)}
        .cta--ghost:hover{border-color:var(--color-petrol)}
        a:focus-visible{outline:2px solid var(--color-green);outline-offset:3px;border-radius:6px}

        /* Variante sombre (sur le héros de l'accueil) */
        :host([tone="dark"]:not(.is-scrolled)) .brand__name{color:var(--color-white)}
        :host([tone="dark"]:not(.is-scrolled)) .brand__sub{color:var(--dark-mute)}
        :host([tone="dark"]:not(.is-scrolled)) nav a{color:var(--dark-mute)}
        :host([tone="dark"]:not(.is-scrolled)) nav a:hover,
        :host([tone="dark"]:not(.is-scrolled)) nav a.active{color:var(--color-white);background:var(--dark-2)}
        :host([tone="dark"]:not(.is-scrolled)) .cta--ghost{color:var(--dark-text);border-color:var(--dark-line-strong)}

        @media(max-width:920px){nav{display:none}.actions{margin-left:0}}
        @media(max-width:520px){.cta--ghost{display:none}.brand__sub{display:none}.wrap{padding:0 var(--space-2)}}
      `,
      html: `
        <div class="wrap">
          <a class="brand" href="index.html"><img class="brand__logo" src="../assets/img/logo.png" alt=""><span class="brand__name">KYOLIS<span class="brand__sub">MANAGER</span></span></a>
          <div class="right">
            <nav aria-label="Navigation principale">${links}</nav>
            <div class="actions">
              <a class="cta cta--ghost" href="ressources.html#contact">Contacter l'équipe</a>
              <a class="cta cta--green" href="${CTA.href}">${CTA.label}</a>
            </div>
          </div>
        </div>
      `,
    };
  }

  /* En-tête sombre : repasse en clair une fois le héros dépassé */
  afterRender() {
    if (this.getAttribute('tone') !== 'dark') return;
    const onScroll = () => this.classList.toggle('is-scrolled', window.scrollY > 480);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }
}

define('kyolis-header', KyolisHeader);
