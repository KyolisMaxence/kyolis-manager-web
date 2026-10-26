/* =====================================================================
   KyolisElement — classe de base des composants à shadow DOM.
   Factorise le boilerplate commun (DRY) :
   - création du shadow root
   - rendu d'un template (html + css) au connectedCallback
   Les tokens de charte (:root custom properties) traversent le shadow
   DOM, donc chaque composant utilise var(--color-*) sans les redéclarer.

   Convention : chaque composant définit render() qui retourne { html, css }.
   ===================================================================== */
export class KyolisElement extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    const { html = '', css = '' } = this.render();
    this.shadowRoot.innerHTML = `<style>${css}</style>${html}`;
    this.afterRender?.();
  }

  /** À surcharger : retourne { html, css }. */
  render() {
    return { html: '', css: '' };
  }
}

/**
 * Enregistre un composant si ce n'est pas déjà fait (évite les doublons
 * si un module est importé plusieurs fois).
 * @param {string} tag nom de la balise (doit contenir un tiret)
 * @param {CustomElementConstructor} cls
 */
export function define(tag, cls) {
  if (!customElements.get(tag)) {
    customElements.define(tag, cls);
  }
}
