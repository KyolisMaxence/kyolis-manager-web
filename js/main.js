/* =====================================================================
   Point d'entrée. Importe tous les composants (les enregistre) et
   active la révélation au scroll sur les éléments marqués [data-reveal].
   Une seule balise <script type="module" src="js/main.js"> par page.
   ===================================================================== */

// Atomes
import './components/atoms/kyolis-button.js';
import './components/atoms/kyolis-icon.js';
import './components/atoms/kyolis-badge.js';

// Molécules
import './components/molecules/kyolis-media-item.js';
import './components/molecules/kyolis-road-card.js';
import './components/molecules/kyolis-faq-item.js';

// Organismes
import './components/organisms/kyolis-header.js';
import './components/organisms/kyolis-footer.js';
import './components/organisms/kyolis-posture.js';
import './components/organisms/kyolis-measure-block.js';
import './components/organisms/kyolis-feature-block.js';

// Reveal au scroll : tout élément avec [data-reveal] dans le light DOM
import { observeReveal } from './core/reveal.js';

function initReveals() {
  document.querySelectorAll('[data-reveal]').forEach(observeReveal);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initReveals);
} else {
  initReveals();
}
