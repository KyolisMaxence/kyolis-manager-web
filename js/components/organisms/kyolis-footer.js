/* =====================================================================
   Organisme : <kyolis-footer>
   Pied de page. SOURCE UNIQUE pour toutes les pages.
   ===================================================================== */
import { KyolisElement, define } from '../../core/KyolisElement.js';

class KyolisFooter extends KyolisElement {
  render() {
    return {
      css: `
        :host{display:block;background:var(--dark-0);color:#9aa8ae;font-size:14px;border-top:1px solid var(--dark-line)}
        .wrap{max-width:var(--maxw);margin:0 auto;padding:0 var(--space-4)}
        .top{display:grid;grid-template-columns:1.7fr 1fr 1fr;gap:48px;padding:76px 0 52px}
        .brand{display:inline-block;margin-bottom:18px}
        .brand img{height:52px;width:auto;display:block}
        .desc{font-size:14.5px;line-height:1.65;color:#8b999f;max-width:36ch;margin:0}
        h4{font-family:var(--font-display);font-weight:700;font-size:12px;
          text-transform:uppercase;letter-spacing:.13em;color:#cdd7da;margin:0 0 18px}
        .col a{color:#9aa8ae;text-decoration:none;display:block;margin-bottom:12px;
          font-size:14.5px;width:fit-content;transition:color var(--ease)}
        .col a:hover{color:#fff}
        a:focus-visible{outline:3px solid var(--color-green);outline-offset:3px;border-radius:4px}
        .bottom{border-top:1px solid rgba(255,255,255,.08);
          padding:22px 0 30px;display:flex;justify-content:space-between;
          align-items:center;flex-wrap:wrap;gap:14px;font-size:13px;color:#73838a}
        .bottom .links a{color:#73838a;text-decoration:none;margin-right:22px;transition:color var(--ease)}
        .bottom .links a:hover{color:#cdd7da}
        @media(max-width:760px){
          .top{grid-template-columns:1fr;gap:36px;padding:56px 0 40px}
          .bottom{flex-direction:column;align-items:flex-start;gap:10px}
        }
      `,
      html: `
        <div class="wrap">
          <div class="top">
            <div class="brand-col">
              <a class="brand" href="index.html" aria-label="KYOLIS Manager, accueil"><img src="../assets/img/logo/manager-horizontal-blanc.svg" alt=""></a>
              <p class="desc">Le logiciel d'administration des switches KYOLIS. Observer, diagnostiquer et sécuriser votre parc, depuis un seul poste, édité par le fabricant.</p>
            </div>
            <div class="col">
              <h4>Le produit</h4>
              <a href="fonctionnalites.html">Fonctionnalités</a>
              <a href="securite.html">Sécurité et conformité</a>
              <a href="demande-acces.html">Obtenir l'application</a>
              <a href="ressources.html">L'application</a>
              <!-- Nouveau lien, à faire valider -->
              <a href="versions.html">Notes de version</a>
            </div>
            <div class="col">
              <h4>Rester informé</h4>
              <a href="ressources.html#newsletter">Newsletter et avis de sécurité</a>
              <a href="ressources.html#contact">Contact</a>
              <a href="#">SBOM de l'application</a>
              <a href="versions.html#verifier">Empreintes de vérification</a>
            </div>
          </div>
          <div class="bottom">
            <div class="links">
              <a href="#">Mentions légales</a>
              <a href="#">Politique de confidentialité RGPD</a>
            </div>
            <div>© 2026 KYOLIS. Tous droits réservés.</div>
          </div>
        </div>
      `,
    };
  }
}

define('kyolis-footer', KyolisFooter);
