/* =====================================================================
   Organisme : <kyolis-release-list src="../data/releases.json">
   Notes de version générées depuis data/releases.json (source unique).
   Version la plus récente mise en avant, empreinte SHA-256 copiable.

   Exception assumée à la règle shadow DOM : ce composant rend en light
   DOM, pour que le contenu reste indexable et réutilise .check-list.
   Ses styles vivent dans css/pages/versions.css.
   ===================================================================== */
import { define } from '../../core/KyolisElement.js';

/* Tant que le fichier d'une version n'est pas publié, ses dates et taille sont à null :
   on affiche « Bientôt disponible » plutôt qu'un champ vide. */
const BIENTOT = 'Bientôt disponible';
const fmtDate = (iso) => (iso
  ? new Date(iso + 'T00:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
  : BIENTOT);

class KyolisReleaseList extends HTMLElement {
  async connectedCallback() {
    try {
      const res = await fetch(this.getAttribute('src'));
      const data = await res.json();
      this.releases = data.releases || [];
    } catch {
      this.innerHTML = '<p class="rl-empty">Les notes de version n\'ont pas pu être chargées.</p>';
      return;
    }
    this.render();
  }

  render() {
    this.innerHTML = `
      <div class="rl-list">
        ${this.releases.length
          ? this.releases.map((r, i) => this.entry(r, i === 0)).join('')
          : '<p class="rl-empty">Aucune version publiée pour le moment.</p>'}
      </div>`;

    this.querySelectorAll('[data-copy]').forEach((b) => b.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(b.dataset.copy);
        b.textContent = 'Copié';
        setTimeout(() => { b.textContent = 'Copier'; }, 1600);
      } catch { /* presse-papiers indisponible : l'empreinte reste sélectionnable */ }
    }));
  }

  /* La première entrée (la plus récente) est la version « actuelle » */
  entry(r, isCurrent) {
    const badges = isCurrent ? '<kyolis-badge tone="solid">Version actuelle</kyolis-badge>' : '';
    const sections = (r.sections || []).map((s) => `
      <h4>${s.heading}</h4>
      <ul class="check-list rl-items">${s.items.map((i) => `<li>${i}</li>`).join('')}</ul>`).join('');
    const sha = r.sha256
      ? `<code>${r.sha256}</code><button type="button" class="rl-copy" data-copy="${r.sha256}">Copier</button>`
      : '<span class="rl-todo">Publiée avec le fichier</span>';

    return `
      <article class="rl-entry ${isCurrent ? 'is-current' : ''}" id="v${r.version}">
        <div class="rl-meta">
          <a class="rl-ver" href="#v${r.version}">${r.version}</a>
          <span class="rl-date">${fmtDate(r.date)}</span>
        </div>
        <div class="rl-body">
          ${badges ? `<div class="rl-badges">${badges}</div>` : ''}
          ${r.title ? `<h3>${r.title}</h3>` : ''}
          ${r.summary ? `<p class="rl-lead">${r.summary}</p>` : ''}
          ${sections}
          <dl class="rl-facts">
            <div><dt>Plateforme</dt><dd>Windows</dd></div>
            <div><dt>Taille</dt><dd>${r.size || `<span class="rl-todo">${BIENTOT}</span>`}</dd></div>
            <div class="rl-sha"><dt>SHA-256</dt><dd>${sha}</dd></div>
          </dl>
        </div>
      </article>`;
  }
}

define('kyolis-release-list', KyolisReleaseList);
