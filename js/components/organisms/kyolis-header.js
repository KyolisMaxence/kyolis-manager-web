/* =====================================================================
   Organisme : <kyolis-header active="securite">
   En-tête de site. SOURCE UNIQUE pour toutes les pages (fin de la
   duplication). L'attribut "active" marque l'onglet courant.
   La navigation est définie une seule fois ci-dessous (NAV).
   ===================================================================== */
import { KyolisElement, define } from '../../core/KyolisElement.js';

const NAV = [
  { id: 'accueil',         label: 'Accueil',          href: 'index.html' },
  { id: 'fonctionnalites', label: 'Fonctionnalités',  href: 'fonctionnalites.html' },
  { id: 'securite',        label: 'Sécurité',         href: 'securite.html' },
  { id: 'ressources',      label: "L'application",    href: 'ressources.html' },
];

class KyolisHeader extends KyolisElement {
  render() {
    const active = this.getAttribute('active') || '';
    const links = NAV.map((n) =>
      `<a href="${n.href}" class="${n.id === active ? 'active' : ''}"${n.id === active ? ' aria-current="page"' : ''}>${n.label}</a>`
    ).join('');

    return {
      css: `
        :host{position:sticky;top:0;z-index:30;display:block;
          background:rgba(255,255,255,.86);backdrop-filter:blur(10px);
          border-bottom:1px solid var(--color-line)}
        .wrap{max-width:var(--maxw);margin:0 auto;padding:0 var(--space-4);
          display:flex;align-items:center;justify-content:space-between;height:72px}
        .brand{display:inline-flex;align-items:center;gap:10px;font-family:var(--font-display);text-decoration:none}
        .brand__logo{height:36px;width:auto;display:block}
        .brand__name{font-weight:500;font-size:14.5px;color:var(--color-gray)}
        .brand__sub{margin-left:5px}
        .right{display:flex;align-items:center}
        nav a{text-decoration:none;font-size:14.5px;margin-left:26px;
          color:var(--color-gray);transition:color var(--ease)}
        nav a:hover,nav a.active{color:var(--color-ink)}
        nav a.active{color:var(--color-green);font-weight:600}
        .actions{display:flex;align-items:center;gap:10px;margin-left:30px}
        .cta{font-family:var(--font-display);font-weight:700;font-size:14px;
          text-decoration:none;padding:9px 18px;border-radius:var(--radius-pill);
          white-space:nowrap;transition:transform var(--ease),background var(--ease),border-color var(--ease)}
        .cta:hover{transform:translateY(-1px)}
        .cta--green{background:var(--color-green);color:var(--color-white)}
        .cta--green:hover{background:var(--color-green-deep)}
        .cta--ghost{color:var(--color-ink);border:1px solid var(--color-line);background:var(--color-white)}
        .cta--ghost:hover{border-color:var(--color-petrol)}
        a:focus-visible{outline:3px solid var(--color-green);outline-offset:3px;border-radius:4px}
        @media(max-width:880px){nav{display:none}.actions{margin-left:0}}
        @media(max-width:520px){.cta--ghost{display:none}.brand__sub{display:none}}
      `,
      html: `
        <div class="wrap">
          <a class="brand" href="index.html"><img class="brand__logo" src="../assets/img/logo.png" alt=""><span class="brand__name">KYOLIS<span class="brand__sub">MANAGER</span></span></a>
          <div class="right">
            <nav aria-label="Navigation principale">${links}</nav>
            <div class="actions">
              <a class="cta cta--ghost" href="#">Contacter l'équipe</a>
              <a class="cta cta--green" href="telechargement.html">Obtenir l'application</a>
            </div>
          </div>
        </div>
      `,
    };
  }
}

define('kyolis-header', KyolisHeader);
