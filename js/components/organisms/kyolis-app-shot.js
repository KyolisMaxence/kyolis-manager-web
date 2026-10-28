/* =====================================================================
   Organisme : <kyolis-app-shot view="parc" src="..." alt="...">
   Aperçu de l'application en attendant les vraies captures.
   Une fenêtre Windows dessinée en HTML/CSS (nette à toute taille,
   légère, animée), avec une vue par fonctionnalité.
   Attributs :
     view : "parc" (défaut) | "firmware" | "maintenance" | "syslog"
            | "ports" | "acces" | "partage"
     src  : chemin d'une vraie capture (recadrage lisible). Si présent,
            l'image remplace la maquette ; la capture ayant sa propre barre
            de titre, la fausse barre n'est pas dessinée.
     full : capture entière, ouverte en grand au clic (avec src)
     alt  : texte alternatif de la capture (avec src)
   Les données affichées sont fictives : la barre de titre le signale
   par la mention « Aperçu illustratif » tant qu'il n'y a pas de src.
   ===================================================================== */
import { KyolisElement, define } from '../../core/KyolisElement.js';

/* --- Petites briques réutilisées par les vues ------------------------ */
const pill = (tone, label) => `<span class="pill pill--${tone}">${label}</span>`;
const dot = (tone) => `<span class="dot dot--${tone}"></span>`;

const SIDEBAR = `
  <aside class="side">
    <div class="side__title">Réseaux</div>
    <div class="side__row is-active"><span class="fold">▾</span>Site Lyon <em>12</em></div>
    <div class="side__row side__row--sub">Bâtiment A <em>7</em></div>
    <div class="side__row side__row--sub">Bâtiment B <em>5</em></div>
    <div class="side__row"><span class="fold">▸</span>Site Grenoble <em>8</em></div>
    <div class="side__row"><span class="fold">▸</span>Entrepôt <em>4</em></div>
    <div class="side__title side__title--gap">Anomalies</div>
    <div class="side__row">${dot('err')}IP en doublon <em>1</em></div>
    <div class="side__row">${dot('err')}Mot de passe faible <em>1</em></div>
    <div class="side__row">${dot('warn')}Firmware <em>1</em></div>
  </aside>`;

/* --- Vues -------------------------------------------------------------- */
const VIEWS = {
  /* Vue du parc après un scan : la vue « héros » */
  parc: () => {
    const rows = [
      ['SW-ACCUEIL',   '192.168.1.10', '2.6.1', pill('ok', 'Robuste'), pill('ok', 'OK')],
      ['SW-ATELIER-1', '192.168.1.21', '2.4.0', pill('ok', 'Robuste'), pill('warn', 'Firmware')],
      ['SW-ATELIER-2', '192.168.1.21', '2.6.1', pill('ok', 'Robuste'), pill('err', 'IP en doublon')],
      ['SW-BUREAUX',   '192.168.1.30', '2.6.1', pill('err', 'Faible'), pill('err', 'Mot de passe')],
      ['SW-QUAI',      '192.168.1.41', '2.6.1', pill('ok', 'Robuste'), pill('ok', 'OK')],
      ['SW-SERVEURS',  '192.168.1.50', '2.6.1', pill('ok', 'Robuste'), pill('ok', 'OK')],
    ];
    return `
      <div class="split">
        ${SIDEBAR}
        <div class="main">
          <div class="toolbar">
            <div class="search">⌕ Rechercher un switch, une IP…</div>
            <span class="btn btn--primary">Scanner</span>
          </div>
          <div class="scan"><span class="scan__bar"></span></div>
          <div class="status">Scan terminé · <b>24 switches</b> · <b class="t-err">3 anomalies</b></div>
          <table>
            <thead><tr><th>Switch</th><th>Adresse IP</th><th class="c-hide">Firmware</th><th class="c-hide">Mot de passe</th><th>État</th></tr></thead>
            <tbody>
              ${rows.map((r, i) => `
                <tr style="--i:${i}" class="${r[4].includes('err') ? 'is-flag' : ''}">
                  <td class="strong">${r[0]}</td><td class="mono">${r[1]}</td>
                  <td class="mono c-hide">${r[2]}</td><td class="c-hide">${r[3]}</td><td>${r[4]}</td>
                </tr>`).join('')}
            </tbody>
          </table>
        </div>
      </div>`;
  },

  firmware: () => {
    const rows = [
      ['SW-ACCUEIL',   '2.6.1', '2.6.1', pill('ok', 'À jour')],
      ['SW-ATELIER-1', '2.4.0', '2.6.1', pill('warn', 'Mise à jour')],
      ['SW-QUAI',      '2.5.2', '2.6.1', pill('warn', 'Mise à jour')],
      ['SW-ENTREPOT',  '1.9.8', '1.9.8', pill('err', 'Fin de maintenance')],
      ['SW-SERVEURS',  '2.6.1', '2.6.1', pill('ok', 'À jour')],
    ];
    return `
      <div class="main main--pad">
        <div class="head"><b>Firmware et cycle de vie</b><span class="mute">Site Lyon · 12 switches</span></div>
        <table>
          <thead><tr><th>Switch</th><th>Installé</th><th class="c-hide">Disponible</th><th>Statut</th></tr></thead>
          <tbody>
            ${rows.map((r, i) => `<tr style="--i:${i}"><td class="strong">${r[0]}</td><td class="mono">${r[1]}</td><td class="mono c-hide">${r[2]}</td><td>${r[3]}</td></tr>`).join('')}
          </tbody>
        </table>
        <div class="actionbar"><span>2 mises à jour disponibles</span><span class="btn btn--primary">Mettre à jour</span></div>
      </div>`;
  },

  /* Palette d'actions en masse, clin d'œil à la palette de commandes */
  maintenance: () => {
    const actions = [
      ['Changer le mot de passe', true],
      ['Redémarrer', false],
      ['Exporter la configuration', false],
      ['Activer le PoE sur les ports', false],
      ['Exporter le monitoring en CSV', false],
    ];
    return `
      <div class="main main--pad main--center">
        <div class="palette">
          <div class="palette__input">Action sur <b>6 switches</b> sélectionnés…</div>
          <div class="palette__group">Maintenance</div>
          ${actions.map(([label, active], i) => `
            <div class="palette__row ${active ? 'is-active' : ''}" style="--i:${i}">
              <span>${label}</span>${active ? '<span class="key">Entrée</span>' : ''}
            </div>`).join('')}
          <div class="palette__foot"><span>KYOLIS® Manager</span><span><span class="key">↑</span><span class="key">↓</span> naviguer</span></div>
        </div>
      </div>`;
  },

  syslog: () => {
    const lines = [
      ['10:42:07', 'SW-ATELIER-1', 'info', 'Port 7 : lien établi, 1 Gb/s full duplex'],
      ['10:42:11', 'SW-QUAI',      'warn', 'PoE port 12 : puissance demandée élevée'],
      ['10:42:15', 'SW-ACCUEIL',   'info', 'Sauvegarde de configuration terminée'],
      ['10:42:19', 'SW-BUREAUX',   'err',  'Échec d\'authentification depuis 192.168.1.77'],
      ['10:42:24', 'SW-SERVEURS',  'info', 'Port 25 SFP : -4,2 dBm'],
      ['10:42:31', 'SW-ATELIER-2', 'warn', 'Conflit d\'adresse IP détecté'],
    ];
    return `
      <div class="main main--pad">
        <div class="head"><b>${dot('live')}Syslog en direct</b><span class="mute">Campagne : jour 3 sur 14</span></div>
        <div class="console">
          ${lines.map(([t, h, lvl, msg], i) => `
            <div class="log" style="--i:${i}"><span class="mute">${t}</span><span class="log__host">${h}</span><span class="lvl lvl--${lvl}">${lvl}</span><span class="log__msg">${msg}</span></div>`).join('')}
        </div>
      </div>`;
  },

  /* Face avant : 24 ports cuivre + 4 SFP */
  ports: () => {
    const state = (n) => ([3, 9, 16, 22].includes(n) ? 'down' : [11].includes(n) ? 'err' : [1, 2, 5, 7, 8, 13, 14].includes(n) ? 'poe' : 'up');
    const port = (n) => `<span class="port port--${state(n)} ${n === 7 ? 'is-sel' : ''}" title="Port ${n}">${n}</span>`;
    const top = Array.from({ length: 12 }, (_, i) => port(i * 2 + 1)).join('');
    const bottom = Array.from({ length: 12 }, (_, i) => port(i * 2 + 2)).join('');
    return `
      <div class="main main--pad">
        <div class="head"><b>SW-ATELIER-1</b><span class="mute">Monitoring temps réel</span></div>
        <div class="panel">
          <div class="panel__ports"><div class="panel__row">${top}</div><div class="panel__row">${bottom}</div></div>
          <div class="panel__sfp"><span class="port port--up">25</span><span class="port port--up">26</span><span class="port port--down">27</span><span class="port port--down">28</span></div>
        </div>
        <div class="legend"><span>${dot('ok')}Lien</span><span>${dot('poe')}PoE</span><span>${dot('off')}Inactif</span><span>${dot('err')}Erreur</span></div>
        <div class="detail">
          <div><span class="mute">Port 7</span><b>1 Gb/s · full duplex</b></div>
          <div><span class="mute">PoE</span><b>6,4 W · classe 2</b></div>
          <div><span class="mute">SFP 25</span><b>-4,2 dBm</b></div>
        </div>
      </div>`;
  },

  acces: () => `
    <div class="main main--pad">
      <div class="alert">
        <div>${pill('err', 'Mot de passe faible')}<b class="alert__title">SW-BUREAUX · 192.168.1.30</b>
          <span class="mute">Temps de cassage estimé : moins d'une minute</span></div>
        <div class="alert__actions"><span class="btn">Interface web</span><span class="btn btn--primary">Ouvrir en SSH</span></div>
      </div>
      <div class="console console--term">
        <div class="log" style="--i:0"><span class="mute">Connexion SSH à 192.168.1.30…</span></div>
        <div class="log" style="--i:1"><span class="t-ok">Connecté.</span></div>
        <div class="log" style="--i:2"><span class="log__host">SW-BUREAUX#</span><span class="caret"></span></div>
      </div>
    </div>`,

  partage: () => `
    <div class="main main--pad main--center">
      <div class="dialog">
        <b class="dialog__title">Partager un réseau</b>
        <div class="field"><span class="mute">Réseau</span><div class="input">Site Lyon · 12 switches</div></div>
        <div class="field"><span class="mute">Clé de partage</span><div class="input mono">••••••••••••••</div></div>
        <label class="check"><span class="box">✓</span>Inclure les identifiants (chiffrés)</label>
        <span class="btn btn--primary btn--block">Créer le fichier</span>
        <div class="file">${dot('ok')}site-lyon.kyolis-share<span class="mute">chiffré</span></div>
      </div>
    </div>`,
};

class KyolisAppShot extends KyolisElement {
  render() {
    const view = VIEWS[this.getAttribute('view')] ? this.getAttribute('view') : 'parc';
    const src = this.getAttribute('src');
    const alt = this.getAttribute('alt') || '';
    if (src) return this.renderCapture(src, this.getAttribute('full'), alt);

    return {
      css: `
        :host{display:block;container-type:inline-size}
        *{box-sizing:border-box}
        .win{background:var(--dark-0);border:1px solid var(--dark-line-strong);border-radius:var(--radius-xl);
          overflow:hidden;color:var(--dark-text);font-family:var(--font-body);font-size:13px;line-height:1.45;
          text-align:left}
        .real{display:block;width:100%;height:auto}

        /* Barre de titre Windows */
        .bar{display:flex;align-items:center;gap:8px;height:36px;padding:0 0 0 12px;
          background:var(--dark-1);border-bottom:1px solid var(--dark-line)}
        .bar img{width:16px;height:16px;border-radius:3px}
        .bar__title{font-family:var(--font-display);font-weight:600;font-size:12px;color:var(--dark-text)}
        .bar__tag{margin-left:8px;font-size:10.5px;color:var(--dark-mute);border:1px solid var(--dark-line-strong);
          border-radius:var(--radius-xs);padding:1px 6px}
        .bar__ctrl{margin-left:auto;display:flex;height:100%}
        .bar__ctrl span{width:40px;display:flex;align-items:center;justify-content:center;color:var(--dark-mute);font-size:12px}

        /* Mise en page */
        .split{display:grid;grid-template-columns:190px 1fr;min-height:330px}
        .side{background:var(--dark-1);border-right:1px solid var(--dark-line);padding:12px 8px}
        .side__title{font-size:10.5px;text-transform:uppercase;letter-spacing:.1em;color:var(--dark-mute);padding:4px 8px 6px}
        .side__title--gap{margin-top:14px}
        .side__row{display:flex;align-items:center;gap:7px;padding:5px 8px;border-radius:var(--radius-sm);color:var(--dark-text);font-size:12.5px}
        .side__row em{margin-left:auto;font-style:normal;color:var(--dark-mute);font-size:11.5px}
        .side__row--sub{padding-left:26px;color:var(--dark-mute)}
        .side__row.is-active{background:var(--dark-2)}
        .fold{color:var(--dark-mute);font-size:10px;width:10px}
        .main{padding:12px 14px;min-width:0}
        .main--pad{padding:16px 18px}
        .main--center{display:flex;align-items:center;justify-content:center;min-height:320px;
          background:radial-gradient(60% 60% at 50% 40%, rgba(53,154,102,.12), transparent 70%)}

        /* Barre d'outils, scan */
        .toolbar{display:flex;gap:8px;align-items:center}
        .search{flex:1;background:var(--dark-1);border:1px solid var(--dark-line);border-radius:var(--radius-md);
          padding:6px 10px;color:var(--dark-mute);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .btn{display:inline-flex;align-items:center;justify-content:center;font-family:var(--font-display);font-weight:600;
          font-size:12px;padding:6px 12px;border-radius:var(--radius-md);border:1px solid var(--dark-line-strong);
          color:var(--dark-text);white-space:nowrap}
        .btn--primary{background:var(--color-green);border-color:var(--color-green);color:var(--color-white)}
        .btn--block{width:100%;margin-top:4px}
        .scan{height:2px;background:var(--dark-line);border-radius:2px;margin:12px 0 8px;overflow:hidden}
        .scan__bar{display:block;height:100%;width:100%;background:var(--color-green);transform-origin:left;
          animation:scan 1.6s cubic-bezier(.4,0,.2,1) both}
        .status{font-size:12px;color:var(--dark-mute);margin-bottom:6px}
        .status b{color:var(--dark-text);font-weight:600}

        /* Tableau */
        table{width:100%;border-collapse:collapse;font-size:12.5px}
        th{font-weight:600;font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:var(--dark-mute);
          text-align:left;padding:8px 8px;border-bottom:1px solid var(--dark-line)}
        td{padding:8px 8px;border-bottom:1px solid var(--dark-line);white-space:nowrap}
        tbody tr{animation:rowIn .45s ease both;animation-delay:calc(1.1s + var(--i) * .12s)}
        tr.is-flag td{background:rgba(211,47,47,.06)}
        .strong{font-weight:600;color:var(--color-white)}
        .mono{font-family:var(--font-mono);font-size:12px;color:var(--dark-text)}
        .mute{color:var(--dark-mute)}
        .t-err{color:var(--color-red-soft)!important}
        .t-ok{color:var(--color-green-soft)}

        /* Pastilles d'état */
        .pill{display:inline-flex;align-items:center;font-size:11px;font-weight:600;padding:2px 8px;border-radius:var(--radius-pill);white-space:nowrap}
        .pill--ok{color:var(--color-green-soft);background:rgba(127,208,164,.12)}
        .pill--warn{color:var(--color-amber);background:rgba(224,160,48,.14)}
        .pill--err{color:var(--color-red-soft);background:rgba(211,47,47,.2)}
        tbody .pill{animation:pop .3s ease both;animation-delay:calc(1.5s + var(--i) * .12s)}
        .dot{display:inline-block;width:7px;height:7px;border-radius:50%;margin-right:6px;flex:none}
        .dot--ok{background:var(--color-green-soft)}
        .dot--poe{background:var(--color-green)}
        .dot--warn{background:var(--color-amber)}
        .dot--err{background:var(--color-red-soft)}
        .dot--off{background:var(--dark-3)}
        .dot--live{background:var(--color-green-soft);animation:live 1.4s ease-in-out infinite}

        /* En-tête de vue, barre d'action */
        .head{display:flex;justify-content:space-between;align-items:baseline;gap:12px;margin-bottom:12px}
        .head b{font-family:var(--font-display);font-weight:600;font-size:14px;display:inline-flex;align-items:center}
        .head .mute{font-size:12px}
        .actionbar{display:flex;justify-content:space-between;align-items:center;margin-top:14px;padding:10px 12px;
          background:var(--dark-1);border:1px solid var(--dark-line);border-radius:var(--radius-md);color:var(--dark-mute);font-size:12.5px}

        /* Palette de commandes */
        .palette{width:min(420px,100%);background:var(--dark-1);border:1px solid var(--dark-line-strong);border-radius:var(--radius-lg);overflow:hidden}
        .palette__input{padding:13px 14px;border-bottom:1px solid var(--dark-line);color:var(--dark-mute);font-size:13.5px}
        .palette__input b{color:var(--dark-text);font-weight:600}
        .palette__group{font-size:10.5px;text-transform:uppercase;letter-spacing:.1em;color:var(--dark-mute);padding:10px 14px 4px}
        .palette__row{display:flex;justify-content:space-between;align-items:center;margin:0 6px;padding:8px 10px;border-radius:var(--radius-sm);
          animation:rowIn .4s ease both;animation-delay:calc(.3s + var(--i) * .08s)}
        .palette__row.is-active{background:var(--dark-2)}
        .palette__foot{display:flex;justify-content:space-between;align-items:center;gap:8px;margin-top:6px;padding:8px 14px;
          border-top:1px solid var(--dark-line);font-size:11.5px;color:var(--dark-mute)}
        .key{display:inline-flex;align-items:center;font-size:10.5px;line-height:1;padding:3px 6px;margin-left:3px;
          border-radius:var(--radius-xs);background:var(--dark-2);border:1px solid var(--dark-line-strong);color:var(--dark-text)}

        /* Console */
        .console{background:var(--dark-1);border:1px solid var(--dark-line);border-radius:var(--radius-md);padding:10px 12px;
          font-family:var(--font-mono);font-size:12px;min-height:200px}
        .console--term{min-height:120px;margin-top:14px}
        .log{display:flex;gap:10px;padding:3px 0;white-space:nowrap;overflow:hidden;animation:rowIn .35s ease both;animation-delay:calc(.4s + var(--i) * .35s)}
        .log__host{color:var(--color-green-soft)}
        .log__msg{overflow:hidden;text-overflow:ellipsis}
        .lvl{width:34px;text-transform:uppercase;font-size:10.5px;padding-top:1px}
        .lvl--info{color:var(--dark-mute)} .lvl--warn{color:var(--color-amber)} .lvl--err{color:var(--color-red-soft)}
        .caret{display:inline-block;width:7px;height:14px;background:var(--dark-text);animation:blink 1s steps(1) infinite}

        /* Face avant */
        .panel{display:flex;gap:14px;align-items:center;padding:14px;background:var(--dark-1);border:1px solid var(--dark-line);border-radius:var(--radius-md)}
        .panel__ports{display:flex;flex-direction:column;gap:6px;flex:1;min-width:0}
        .panel__row{display:grid;grid-template-columns:repeat(12,1fr);gap:5px}
        .panel__sfp{display:grid;grid-template-columns:repeat(2,26px);gap:6px;padding-left:14px;border-left:1px solid var(--dark-line)}
        .port{display:flex;align-items:center;justify-content:center;aspect-ratio:1;min-width:0;border-radius:var(--radius-xs);
          font-size:9.5px;font-weight:600;border:1px solid var(--dark-line-strong);color:var(--dark-mute)}
        .port--up{background:rgba(127,208,164,.16);border-color:rgba(127,208,164,.45);color:var(--color-green-soft)}
        .port--poe{background:var(--color-green);border-color:var(--color-green);color:var(--color-white)}
        .port--err{background:rgba(211,47,47,.25);border-color:var(--color-red-soft);color:var(--color-red-soft)}
        .port.is-sel{outline:2px solid var(--color-white);outline-offset:1px}
        .legend{display:flex;flex-wrap:wrap;gap:14px;margin:10px 2px 14px;font-size:11.5px;color:var(--dark-mute)}
        .legend span{display:inline-flex;align-items:center}
        .detail{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
        .detail div{background:var(--dark-1);border:1px solid var(--dark-line);border-radius:var(--radius-md);padding:9px 11px;display:flex;flex-direction:column;gap:2px}
        .detail .mute{font-size:11px}
        .detail b{font-weight:600;font-size:12.5px}

        /* Alerte + actions */
        .alert{display:flex;justify-content:space-between;align-items:center;gap:14px;flex-wrap:wrap;padding:14px;
          background:var(--dark-1);border:1px solid rgba(242,139,130,.35);border-radius:var(--radius-md)}
        .alert > div:first-child{display:flex;flex-direction:column;align-items:flex-start;gap:6px}
        .alert__title{font-family:var(--font-display);font-weight:600;font-size:14px}
        .alert .mute{font-size:12px}
        .alert__actions{display:flex;gap:8px}

        /* Boîte de dialogue */
        .dialog{width:min(340px,100%);background:var(--dark-1);border:1px solid var(--dark-line-strong);border-radius:var(--radius-lg);
          padding:18px;display:flex;flex-direction:column;gap:12px}
        .dialog__title{font-family:var(--font-display);font-weight:600;font-size:14.5px}
        .field{display:flex;flex-direction:column;gap:5px;font-size:11.5px}
        .input{background:var(--dark-0);border:1px solid var(--dark-line-strong);border-radius:var(--radius-md);padding:7px 10px;font-size:12.5px;color:var(--dark-text)}
        .check{display:flex;align-items:center;gap:8px;font-size:12.5px}
        .box{width:16px;height:16px;border-radius:var(--radius-xs);background:var(--color-green);color:var(--color-white);
          font-size:11px;display:flex;align-items:center;justify-content:center}
        .file{display:flex;align-items:center;gap:4px;font-family:var(--font-mono);font-size:12px;padding:8px 10px;
          border:1px dashed var(--dark-line-strong);border-radius:var(--radius-md);animation:pop .4s ease both;animation-delay:.8s}
        .file .mute{margin-left:auto;font-family:var(--font-body);font-size:11px}

        /* Animations : jouées une fois, coupées si mouvement réduit */
        @keyframes scan{from{transform:scaleX(0)}to{transform:scaleX(1)}}
        @keyframes rowIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}
        @keyframes pop{from{opacity:0;transform:scale(.85)}to{opacity:1;transform:none}}
        @keyframes live{50%{opacity:.35}}
        @keyframes blink{50%{opacity:0}}
        @media (prefers-reduced-motion:reduce){*{animation:none!important}}

        /* Fenêtre étroite (bloc fonctionnalité, mobile) */
        @container (max-width:640px){
          .split{grid-template-columns:1fr}
          .side{display:none}
          .c-hide{display:none}
          .detail{grid-template-columns:repeat(2,1fr)}
          .bar__tag{display:none}
        }
        @container (max-width:420px){
          .panel{flex-direction:column;align-items:stretch}
          .panel__sfp{border-left:none;padding-left:0;grid-template-columns:repeat(4,26px)}
          .port{font-size:0}
        }
      `,
      html: `
        <div class="win" role="img" aria-label="Aperçu illustratif de l'interface de KYOLIS® Manager">
          <div class="bar">
            <img src="../assets/img/logo.png" alt="">
            <span class="bar__title">KYOLIS® Manager</span>
            <span class="bar__tag">Aperçu illustratif</span>
            <span class="bar__ctrl" aria-hidden="true"><span>─</span><span>☐</span><span>✕</span></span>
          </div>
          ${VIEWS[view]()}
        </div>
      `,
    };
  }

  /* Vraie capture : cadre à filet, agrandissement au clic si "full" */
  renderCapture(src, full, alt) {
    return {
      css: `
        :host{display:block}
        .shot{display:block;width:100%;padding:0;margin:0;border:1px solid var(--color-line-strong);
          border-radius:var(--radius-lg);overflow:hidden;background:var(--color-white);
          cursor:${full ? 'zoom-in' : 'default'};transition:border-color var(--ease)}
        .shot:hover{border-color:${full ? 'var(--color-gray)' : 'var(--color-line-strong)'}}
        .shot:focus-visible{outline:2px solid var(--color-green);outline-offset:3px}
        .shot img{display:block;width:100%;height:auto}
        dialog{max-width:min(1600px,96vw);max-height:94vh;padding:0;border:1px solid var(--dark-line-strong);
          border-radius:var(--radius-lg);background:var(--color-white);overflow:auto}
        dialog::backdrop{background:rgba(28,39,45,.8)}
        dialog img{display:block;max-width:100%;height:auto}
        .close{position:sticky;float:right;top:10px;margin:10px 10px -46px 0;width:36px;height:36px;border-radius:var(--radius-md);
          border:1px solid var(--color-line-strong);background:var(--color-white);color:var(--color-ink);font-size:16px;cursor:pointer}
      `,
      html: full
        ? `<button class="shot" type="button" aria-label="Agrandir : ${alt}"><img src="${src}" alt="${alt}" loading="lazy"></button>
           <dialog aria-label="${alt}"><button class="close" type="button" aria-label="Fermer">✕</button><img src="${full}" alt="${alt}"></dialog>`
        : `<figure class="shot"><img src="${src}" alt="${alt}" loading="lazy"></figure>`,
    };
  }

  afterRender() {
    const dialog = this.shadowRoot.querySelector('dialog');
    if (!dialog) return;
    this.shadowRoot.querySelector('.shot').addEventListener('click', () => dialog.showModal());
    dialog.querySelector('.close').addEventListener('click', () => dialog.close());
    /* Clic en dehors de l'image : ferme */
    dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); });
  }
}

define('kyolis-app-shot', KyolisAppShot);
