/**
 * Schema dei dati di Leonida, in JS semplice.
 * Tipi: 'string' | 'string?' | 'number' | 'number?' | 'boolean' | 'array' | 'object?' | ['enum', ...valori]
 * ref: nome del file a cui deve appartenere l'id referenziato.
 */
export const STATUS = ['segnaposto', 'da verificare', 'verificato'];
export const SOURCE = ['trailer', 'gioco-mike', 'community'];

export const common = {
  id: 'string',
  status: ['enum', ...STATUS],
  source: ['enum', ...SOURCE],
  spoilerLevel: 'number',
  example: 'boolean',
  updatedAt: 'string?',
  sourceUrl: 'string?',
  image: 'string?',
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
    envelope: { schemaVersion: 'number', items: 'array' },
    items: { ...common, name: 'string', manufacturer: 'string?', class: ['enum', 'super', 'sportiva', 'berlina', 'suv', 'fuoristrada', 'muscle', 'classica', 'coupe', 'moto', 'barca', 'elicottero', 'aereo', 'servizio', 'industriale', 'militare', 'furgone', 'altro'], description: 'string?', howToGet: 'string?' },
    idPrefix: 'veh-',
  },
  weapons: {
    envelope: { schemaVersion: 'number', items: 'array' },
    items: { ...common, name: 'string', manufacturer: 'string?', class: ['enum', 'pistola', 'fucile-assalto', 'mitra', 'fucile-pompa', 'cecchino', 'pesante', 'lancio', 'corpo-a-corpo', 'equipaggiamento'], description: 'string?', howToGet: 'string?' },
    idPrefix: 'wpn-',
  },
  tips: {
    envelope: { schemaVersion: 'number', items: 'array' },
    items: { ...common, category: ['enum', 'prima-ora', 'generale', 'combattimento', 'soldi', 'guida', 'esplorazione', 'online'], title: 'string', body: 'string', priority: 'number?' },
    idPrefix: 'tip-',
  },
};
