/**
 * Schema dei dati di Leonida, in JS semplice.
 * Tipi: 'string' | 'string?' | 'number' | 'number?' | 'boolean' | 'array' | 'object?' | ['enum', ...valori]
 * ref: nome del file a cui deve appartenere l'id referenziato.
 */
export const STATUS = ['segnaposto', 'da verificare', 'verificato'];
export const SOURCE = ['trailer', 'gioco-mike', 'community', 'stampa', 'rumor', 'leak'];

export const common = {
  id: 'string',
  status: ['enum', ...STATUS],
  source: ['enum', ...SOURCE],
  spoilerLevel: 'number',
  example: 'boolean',
  updatedAt: 'string?',
  sourceUrl: 'string?',
  image: 'string?',
  gallery: 'array?',
};

export const schema = {
  meta: {
    envelope: { schemaVersion: 'number', dataVersion: 'string', updatedAt: 'string', releaseDate: 'string', changelog: 'array' },
  },
  missions: {
    envelope: { schemaVersion: 'number', acts: 'array', items: 'array' },
    acts: { ...common, number: 'number', title: 'string' },
    items: {
      ...common,
      title: 'string', actId: { ref: 'acts' }, chapter: 'number?', order: 'number?',
      protagonist: ['enum', 'jason', 'lucia', 'entrambi'],
      districtId: { ref: 'districts', optional: true },
      summary: 'string?', prerequisites: { refList: 'missions' }, unlocks: 'array', rewards: 'array',
      extraObjectives: 'array', tips: 'array', secrets: 'array',
    },
    idPrefix: 'mis-',
  },
  districts: {
    envelope: { schemaVersion: 'number', items: 'array' },
    items: { ...common, name: 'string', region: 'string?', tagline: 'string?', description: 'string?', map: 'object?', pois: 'array', subAreas: 'array', activityIds: { refList: 'activities' } },
    idPrefix: 'dis-',
  },
  collectibles: {
    envelope: { schemaVersion: 'number', categories: 'array', items: 'array' },
    categories: { ...common, name: 'string', icon: 'string?' },
    items: { ...common, categoryId: { ref: 'categories' }, name: 'string', districtId: { ref: 'districts', optional: true }, directions: 'string?', reward: 'string?' },
    idPrefix: 'col-',
  },
  activities: {
    envelope: { schemaVersion: 'number', items: 'array' },
    items: { ...common, type: ['enum', 'attività', 'side-quest', 'sfida'], name: 'string', districtId: { ref: 'districts', optional: true }, description: 'string?', requirements: 'array', rewards: 'array', steps: 'array' },
    idPrefix: 'act-',
  },
  characters: {
    envelope: { schemaVersion: 'number', items: 'array' },
    items: { ...common, name: 'string', role: 'string?', isProtagonist: 'boolean', tagline: 'string?', bio: 'string?', districtId: { ref: 'districts', optional: true }, firstMissionId: { ref: 'missions', optional: true }, relations: { refList: 'characters' } },
    idPrefix: 'chr-',
  },
  radio: {
    envelope: { schemaVersion: 'number', items: 'array' },
    items: { ...common, name: 'string', genre: 'string?', host: 'string?', description: 'string?', highlights: 'array' },
    idPrefix: 'rad-',
  },
  brands: {
    envelope: { schemaVersion: 'number', items: 'array' },
    items: { ...common, name: 'string', category: 'string?', description: 'string?' },
    idPrefix: 'brd-',
  },
  vehicles: {
    // groups: le sei schede del gioco (Progresso / Veicoli) con le classi e i totali; «fuori-elenco» = visti nel mondo ma non nell'elenco del gioco
    envelope: { schemaVersion: 'number', groups: 'array', items: 'array' },
    items: { ...common, name: 'string', manufacturer: 'string?', class: ['enum', 'coupe', 'muscle', 'fuoristrada', 'pickup', 'berlina', 'sportiva', 'supercar', 'suv', 'furgone', 'moto', 'imbarcazioni', 'velivoli', 'camion', 'servizio', 'emergenza', 'militari', 'industriali', 'trasporto', 'sp-ultra-lusso', 'sp-gara-strada', 'sp-stock-car', 'sp-moto-gara', 'sp-demolition-derby', 'sp-mudder', 'sp-donk', 'sp-lowrider', 'sp-hot-rod', 'sp-pompati', 'sp-retro', 'sp-fuoristrada', 'sp-pistoni-ardenti', 'sp-chopper', 'sp-promozionali', 'sp-scintillanti', 'sp-girlypop', 'sp-patriottici', 'sp-palude', 'sp-leonidiani', 'sp-belle-arti', 'sp-forze-ordine', 'sp-visibilita', 'sp-pedali', 'sp-nostalgia', 'fuori-elenco'], description: 'string?', howToGet: 'string?', rating: 'string?' },
    idPrefix: 'veh-',
  },
  weapons: {
    envelope: { schemaVersion: 'number', items: 'array' },
    items: { ...common, name: 'string', manufacturer: 'string?', class: ['enum', 'pistola', 'fucile-assalto', 'mitra', 'fucile-pompa', 'cecchino', 'pesante', 'lancio', 'corpo-a-corpo', 'equipaggiamento'], description: 'string?', howToGet: 'string?' },
    idPrefix: 'wpn-',
  },
  news: {
    envelope: { schemaVersion: 'number', items: 'array' },
    items: { ...common, date: 'string', title: 'string', body: 'string', topic: ['enum', 'gameplay', 'mappa', 'personaggi', 'veicoli', 'armi', 'musica', 'uscita', 'tecnica', 'business', 'online', 'community'], outlet: 'string?', relatedIds: 'array?' },
    idPrefix: 'new-',
  },
  trophies: {
    envelope: { schemaVersion: 'number', items: 'array' },
    items: { ...common, name: 'string', description: 'string?', tier: ['enum', 'platino', 'oro', 'argento', 'bronzo'], category: ['enum', 'storia', 'completamento', 'collezionabili', 'attivita', 'mondo', 'online'], guide: 'string?' },
    idPrefix: 'tro-',
  },
  tips: {
    envelope: { schemaVersion: 'number', items: 'array' },
    items: { ...common, category: ['enum', 'prima-ora', 'generale', 'combattimento', 'soldi', 'guida', 'esplorazione', 'online', 'trasporti', 'sistemi', 'tecnica', 'storia'], title: 'string', body: 'string', priority: 'number?' },
    idPrefix: 'tip-',
  },
};
