/* =====================================================================
   Organisme : <kyolis-release-list src="../data/releases.json">
   Notes de version générées depuis data/releases.json (source unique).
   Onglets Toutes / Stable / Bêta, version stable actuelle mise en avant,
   empreinte SHA-256 copiable.

   Exception assumée à la règle shadow DOM : ce composant rend en light
   DOM, pour que le contenu reste indexable et réutilise .check-list.
   Ses styles vivent dans css/pages/versions.css.
   ===================================================================== */
import { define } from '../../core/KyolisElement.js';

const CHANNELS = {
  all:    { label: 'Toutes' },
  stable: { label: 'Stable', badge: 'Stable' },
  beta:   { label: 'Bêta',   badge: 'Bêta' },
};

const EMPTY = {
  beta: "Aucune version bêta publiée pour le moment. Les clients volontaires seront prévenus par e-mail à l'ouverture du programme.",
  stable: 'Aucune version stable publiée pour le moment.',
  all: 'Aucune version publiée pour le moment.',
};

const fmtDate = (iso) => (iso
  ? new Date(iso + 'T00:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
  : 'Date à compléter');

class KyolisReleaseList extends HTMLElement {
  async connectedCallback() {
    this.channel = 'all';
    try {
      const res = await fetch(this.getAttribute('src'));
      const data = await res.json();
      this.releases = data.releases || [];
    } catch {
      this.innerHTML = '<p class="rl-empty">Les notes de version n\'ont pas pu être chargées.</p>';
      return;
    }
    /* La version stable la plus récente est la version « actuelle » */
    this.current = this.releases.find((r) => r.channel === 'stable');
    this.render();
  }

  render() {
    const list = this.releases.filter((r) => this.channel === 'all' || r.channel === this.channel);
    const tabs = Object.entries(CHANNELS).map(([id, c]) => {
      const n = id === 'all' ? this.releases.length : this.releases.filter((r) => r.channel === id).length;
      return `<button type="button" role="tab" aria-selected="${id === this.channel}" data-ch="${id}">${c.label}<span>${n}</span></button>`;
    }).join('');

    this.innerHTML = `
      <div class="rl-tabs" role="tablist" aria-label="Canal de version">${tabs}</div>
      <div class="rl-list">
        ${list.length ? list.map((r) => this.entry(r)).join('') : `<p class="rl-empty">${EMPTY[this.channel]}</p>`}
      </div>`;

    this.querySelectorAll('[data-ch]').forEach((b) => b.addEventListener('click', () => {
      this.channel = b.dataset.ch;
      this.render();
    }));
    this.querySelectorAll('[data-copy]').forEach((b) => b.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(b.dataset.copy);
        b.textContent = 'Copié';
        setTimeout(() => { b.textContent = 'Copier'; }, 1600);
      } catch { /* presse-papiers indisponible : l'empreinte reste sélectionnable */ }
    }));
  }

  entry(r) {
    const isCurrent = r === this.current;
    const badges = [
      `<kyolis-badge tone="${r.channel === 'stable' ? 'soft' : 'muted'}">${CHANNELS[r.channel]?.badge || r.channel}</kyolis-badge>`,
      isCurrent ? '<kyolis-badge tone="solid">Version actuelle</kyolis-badge>' : '',
    ].join('');
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
          <div class="rl-badges">${badges}</div>
          ${r.title ? `<h3>${r.title}</h3>` : ''}
          ${r.summary ? `<p class="rl-lead">${r.summary}</p>` : ''}
          ${sections}
          <dl class="rl-facts">
            <div><dt>Plateforme</dt><dd>Windows</dd></div>
            <div><dt>Taille</dt><dd>${r.size || '<span class="rl-todo">À compléter</span>'}</dd></div>
            <div class="rl-sha"><dt>SHA-256</dt><dd>${sha}</dd></div>
          </dl>
        </div>
      </article>`;
  }
}

define('kyolis-release-list', KyolisReleaseList);
