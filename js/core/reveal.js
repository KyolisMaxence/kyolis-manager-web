/* =====================================================================
   Reveal — apparition douce au scroll, mutualisée.
   Un seul IntersectionObserver pour toute la page. Les composants
   appellent observeReveal(el) sur les éléments à révéler.
   Respecte prefers-reduced-motion (révèle immédiatement sans animer).
   ===================================================================== */
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const observer = reduceMotion ? null : new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

/**
 * Marque un élément pour révélation au scroll.
 * @param {Element} el élément à révéler
 */
export function observeReveal(el) {
  if (!el) return;
  if (reduceMotion) {
    el.classList.add('is-visible');
    return;
  }
  el.classList.add('reveal');
  observer.observe(el);
}

/* Styles de reveal, injectés une seule fois dans le document hôte.
   Comme les composants en shadow DOM n'héritent pas des classes du
   document, ceux qui révèlent un élément interne incluent ces règles
   dans leur propre <style>. Cette injection couvre le light DOM. */
const STYLE_ID = 'kyolis-reveal-style';
if (!document.getElementById(STYLE_ID)) {
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    .reveal{opacity:0;transform:translateY(24px);transition:opacity .7s ease,transform .7s ease}
    .reveal.is-visible{opacity:1;transform:none}
  `;
  document.head.appendChild(style);
}
