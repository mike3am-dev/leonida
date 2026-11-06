/**
 * Mappa illustrata di Leonida: un'illustrazione originale, non un ricalco.
 * Griglia 1000×1000. I distretti usano map.x / map.y dai dati per i segnaposto.
 */
import { esc } from '../ui/dom.js';

const ICON = {
  'dis-vice-city': 'city', 'dis-vice-beach': 'beach', 'dis-keys': 'anchor', 'dis-grassrivers': 'swamp', 'dis-port-gellhorn': 'anchor',
  'dis-ambrosia': 'field', 'dis-mount-kalaga': 'mountain', 'dis-waning-sands': 'town', 'dis-hamlet': 'town', 'dis-capri': 'town',
};
// Posizioni dei segnaposto sulla nuova illustrazione (sovrascrivono map.x/y dei dati per coerenza visiva)
const POS = {
  'dis-mount-kalaga': [520, 150], 'dis-port-gellhorn': [275, 300], 'dis-ambrosia': [560, 390], 'dis-waning-sands': [800, 300],
  'dis-capri': [255, 560], 'dis-grassrivers': [470, 610], 'dis-vice-city': [775, 520], 'dis-vice-beach': [905, 560],
  'dis-hamlet': [690, 720], 'dis-keys': [640, 865],
};
const glyph = {
  city: '<rect x="-9" y="-4" width="5" height="12"/><rect x="-2" y="-10" width="5" height="18"/><rect x="5" y="-1" width="5" height="9"/>',
  beach: '<path d="M-10 6 Q0 -2 10 6" fill="none" stroke="currentColor" stroke-width="2.5"/><circle cx="4" cy="-5" r="3.2"/>',
  anchor: '<circle cx="0" cy="-7" r="2.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M0 -4v14M-8 3q0 7 8 7t8-7M-5 3h10" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>',
  swamp: '<path d="M-10 6h20M-6 6v-8M-6 -4l-3 3M-6 -4l3 3M3 6v-10M3 -6l-3 3M3 -6l3 3" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>',
  field: '<path d="M-10 7 L-3 -7 L4 7M-6 0h7M2 7 L7 -3 L11 7" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/>',
  mountain: '<path d="M-11 8 L-3 -8 L2 1 L5 -4 L11 8Z" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/>',
  town: '<path d="M-8 8V-1l8-7 8 7v9z" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/>',
};

export function mapSvg(districts, activeId, { interactive = true } = {}) {
  const pins = districts.filter((d) => POS[d.id]).map((d) => {
    const [x, y] = POS[d.id]; const k = ICON[d.id] || 'town'; const active = d.id === activeId;
    const big = ['dis-vice-city', 'dis-keys', 'dis-mount-kalaga', 'dis-grassrivers', 'dis-port-gellhorn', 'dis-ambrosia'].includes(d.id);
    return `<a href="#/mappa?zona=${esc(d.id)}" class="pin ${active ? 'pin--active' : ''} ${big ? 'pin--big' : ''}" aria-label="${esc(d.name)}">
      <circle class="pin__hit" cx="${x}" cy="${y}" r="46" />
      <g transform="translate(${x} ${y})"><circle class="pin__dot" r="${big ? 17 : 13}"/><g class="pin__glyph" fill="currentColor">${glyph[k]}</g></g>
      <text class="pin__label ${big ? '' : 'pin__label--sm'}" x="${x}" y="${y + (big ? 40 : 33)}" text-anchor="middle">${esc(d.name.replace(' National Park', ''))}</text>
    </a>`;
  }).join('');

  return `<svg class="leonida-map" viewBox="0 0 1000 1000" role="img" aria-label="Mappa illustrata dello stato di Leonida">
    <defs>
      <radialGradient id="m-sea" cx="60%" cy="55%" r="80%"><stop offset="0" stop-color="#1a6b8a"/><stop offset=".6" stop-color="#0e4766"/><stop offset="1" stop-color="#082a40"/></radialGradient>
      <linearGradient id="m-land" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8bb36a"/><stop offset=".55" stop-color="#9dbd6d"/><stop offset="1" stop-color="#c7c27c"/></linearGradient>
      <linearGradient id="m-forest" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3f7a46"/><stop offset="1" stop-color="#2f5f3b"/></linearGradient>
      <linearGradient id="m-swamp" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#4d8c6c"/><stop offset="1" stop-color="#2e6a58"/></linearGradient>
      <linearGradient id="m-field" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#e2b55a"/><stop offset="1" stop-color="#d9a04a"/></linearGradient>
      <linearGradient id="m-city" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e86aa5"/><stop offset="1" stop-color="#b14c93"/></linearGradient>
      <pattern id="m-grid" width="14" height="14" patternUnits="userSpaceOnUse"><path d="M14 0H0v14" fill="none" stroke="rgba(255,255,255,.35)" stroke-width="1"/></pattern>
      <pattern id="m-waves" width="60" height="30" patternUnits="userSpaceOnUse"><path d="M0 15q15-10 30 0t30 0" fill="none" stroke="rgba(255,255,255,.07)" stroke-width="2"/></pattern>
      <filter id="m-shadow" x="-10%" y="-10%" width="120%" height="120%"><feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="#000" flood-opacity=".45"/></filter>
      <filter id="m-glow"><feGaussianBlur stdDeviation="10" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    </defs>

    <!-- Mare -->
    <rect width="1000" height="1000" fill="url(#m-sea)"/>
    <rect width="1000" height="1000" fill="url(#m-waves)"/>
    <!-- Bassi fondali attorno alla terra -->
    <path class="shoal" d="M150 95 Q 420 40 720 80 Q 880 120 890 400 Q 905 700 820 870 Q 650 975 330 905 Q 120 790 150 95 Z" fill="#2c8aa6" opacity=".35"/>
    <path class="shoal" d="M500 790 Q 650 800 800 850 Q 850 900 800 930 Q 640 930 520 870 Z" fill="#2c8aa6" opacity=".35"/>

    <!-- Terraferma -->
    <path class="land" d="M200 120 Q 330 80 470 95 Q 600 85 690 130 Q 790 180 800 270 Q 860 330 850 420 Q 870 520 840 600 Q 820 690 760 740 Q 700 780 640 770 Q 600 790 560 760 Q 480 740 400 700 Q 300 690 230 640 Q 170 560 190 460 Q 170 360 180 250 Q 170 170 200 120 Z" fill="url(#m-land)" filter="url(#m-shadow)"/>
    <!-- Isola barriera: Vice Beach -->
    <path class="land" d="M882 440 Q 905 430 912 470 L 918 660 Q 915 700 895 700 Q 878 690 880 650 Z" fill="url(#m-land)" filter="url(#m-shadow)"/>
    <!-- Keys -->
    <g class="land" fill="url(#m-land)" filter="url(#m-shadow)">
      <path d="M560 805 q40 -14 80 2 q20 10 -4 22 q-45 14 -80 2 q-18 -12 4 -26z"/>
      <path d="M650 835 q40 -8 70 10 q16 12 -8 20 q-40 8 -70 -6 q-14 -12 8 -24z"/>
      <path d="M725 860 q36 0 60 18 q10 14 -14 18 q-36 2 -60 -12 q-12 -12 14 -24z"/>
      <path d="M520 822 q20 -8 36 4 q6 10 -8 14 q-22 4 -36 -6 q-6 -8 8 -12z"/>
    </g>
    <!-- Isolotti di Capri / costa ovest -->
    <path class="land" d="M180 520 q-30 20 -20 60 q30 20 60 0 q10 -40 -40 -60z" fill="url(#m-land)" filter="url(#m-shadow)"/>

    <!-- Terreni -->
    <path class="forest" d="M250 150 Q 420 110 620 130 Q 740 170 740 260 Q 700 300 600 290 Q 480 300 380 280 Q 280 270 250 210 Z" fill="url(#m-forest)"/>
    <g class="peaks" fill="#dfe6d8" opacity=".9"><path d="M470 175 l22 -42 l22 42z"/><path d="M515 190 l18 -34 l18 34z"/><path d="M430 195 l16 -30 l16 30z"/></g>
    <path class="swamp" d="M330 560 Q 420 520 540 540 Q 600 600 560 680 Q 480 720 390 690 Q 320 650 330 560 Z" fill="url(#m-swamp)"/>
    <g class="reeds" stroke="rgba(255,255,255,.35)" stroke-width="2" stroke-linecap="round"><path d="M400 600v-16M410 606v-12M470 650v-16M480 656v-12M520 580v-16M530 586v-12M440 680v-14"/></g>
    <path class="field" d="M470 330 Q 600 310 700 350 Q 720 420 660 470 Q 560 480 490 440 Q 440 390 470 330 Z" fill="url(#m-field)"/>
    <g class="furrows" stroke="rgba(0,0,0,.18)" stroke-width="2"><path d="M490 360h190M486 385h200M495 410h180M510 435h150"/></g>
    <!-- Lago Leonida -->
    <ellipse cx="620" cy="300" rx="62" ry="40" fill="#2d8fb0"/>
    <ellipse cx="620" cy="300" rx="52" ry="31" fill="#3aa4c4" opacity=".7"/>
    <!-- Fiumi -->
    <path class="river" d="M520 300 Q 500 400 470 470 Q 430 540 400 600" fill="none" stroke="#3aa4c4" stroke-width="5" stroke-linecap="round"/>
    <path class="river" d="M680 320 Q 720 420 700 520" fill="none" stroke="#3aa4c4" stroke-width="4" stroke-linecap="round"/>
    <!-- Vice City: trama urbana -->
    <path class="city" d="M700 450 Q 800 430 850 470 Q 870 560 820 640 Q 760 690 700 650 Q 670 560 700 450 Z" fill="url(#m-city)" filter="url(#m-glow)"/>
    <path d="M700 450 Q 800 430 850 470 Q 870 560 820 640 Q 760 690 700 650 Q 670 560 700 450 Z" fill="url(#m-grid)"/>
    <g class="towers" fill="#ffd6ec" opacity=".9"><rect x="770" y="520" width="8" height="40"/><rect x="784" y="505" width="10" height="55"/><rect x="800" y="528" width="7" height="32"/><rect x="756" y="535" width="6" height="25"/></g>
    <!-- Waning Sands e Hamlet: piccoli centri -->
    <circle cx="800" cy="330" r="34" fill="#e39dc2" opacity=".55"/>
    <circle cx="690" cy="745" r="26" fill="#e39dc2" opacity=".55"/>
    <circle cx="275" cy="330" r="30" fill="#e39dc2" opacity=".55"/>
    <circle cx="255" cy="590" r="24" fill="#e39dc2" opacity=".55"/>

    <!-- Strade -->
    <g class="roads" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <path class="hwy" d="M785 700 Q 790 560 790 430 Q 780 330 720 250 Q 640 210 560 200" stroke="#f3ede4" stroke-width="7"/>
      <path class="hwy" d="M785 700 Q 790 560 790 430 Q 780 330 720 250 Q 640 210 560 200" stroke="#d9534f" stroke-width="3"/>
      <path class="hwy" d="M300 330 Q 500 350 700 500" stroke="#f3ede4" stroke-width="6"/>
      <path class="hwy" d="M300 330 Q 500 350 700 500" stroke="#d9534f" stroke-width="2.5"/>
      <path class="road" d="M700 650 Q 690 700 690 745 Q 650 790 600 815 Q 650 840 700 850 Q 740 860 770 875" stroke="#f3ede4" stroke-width="3.5" stroke-dasharray="0"/>
      <path class="road" d="M255 590 Q 350 640 470 660 Q 580 670 700 650" stroke="#f3ede4" stroke-width="3"/>
      <path class="road" d="M275 330 Q 300 220 420 190" stroke="#f3ede4" stroke-width="3"/>
      <path class="road" d="M800 330 Q 850 420 850 470" stroke="#f3ede4" stroke-width="3"/>
      <path class="rail" d="M275 345 Q 450 330 560 330 Q 700 360 760 470 Q 795 560 800 690" stroke="#2b2b33" stroke-width="3" stroke-dasharray="8 6"/>
      <path class="rail" d="M275 345 Q 450 330 560 330 Q 700 360 760 470 Q 795 560 800 690" stroke="#f3ede4" stroke-width="1" stroke-dasharray="8 6" stroke-dashoffset="7"/>
    </g>
    <!-- Ponti verso Vice Beach e la Keys Causeway -->
    <path d="M850 540 L 890 560" stroke="#f3ede4" stroke-width="3"/><path d="M840 600 L 895 640" stroke="#f3ede4" stroke-width="3"/>

    <!-- Nomi delle acque -->
    <text class="water-label" x="930" y="420" text-anchor="middle" transform="rotate(90 930 420)">Oceano Atlantico</text>
    <text class="water-label" x="90" y="560" text-anchor="middle" transform="rotate(-90 90 560)">Golfo del Messico</text>
    <text class="water-label water-label--sm" x="620" y="305" text-anchor="middle">Lago Leonida</text>

    ${interactive ? pins : ''}

    <!-- Bussola e scala -->
    <g transform="translate(925 905)" class="compass"><circle r="34" fill="rgba(8,42,64,.7)" stroke="#f3ede4" stroke-width="1.5"/><path d="M0 -24 L7 0 L0 24 L-7 0 Z" fill="#f3ede4"/><path d="M0 -24 L7 0 L-7 0 Z" fill="#ff3d8b"/><text y="-38" text-anchor="middle" fill="#f3ede4" font-size="14" font-weight="700">N</text></g>
    <g transform="translate(60 930)" fill="#f3ede4" font-size="13"><rect x="0" y="0" width="60" height="6" fill="#f3ede4"/><rect x="60" y="0" width="60" height="6" fill="#0b0a0f" stroke="#f3ede4"/><text x="0" y="22">0</text><text x="110" y="22">10 km</text><text x="0" y="-8" font-style="italic" opacity=".7">Scala indicativa</text></g>
    <text class="map-title" x="50" y="70">Stato di Leonida</text>
    <text class="map-sub" x="50" y="92">Illustrazione originale · posizioni da verificare giocando</text>
  </svg>`;
}
