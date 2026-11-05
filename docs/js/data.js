/**
 * Carica i JSON dei contenuti e li mette in relazione.
 * L'interfaccia legge da qui e basta: nessun contenuto vive nel codice.
 */
const FILES = ['meta', 'missions', 'districts', 'collectibles', 'activities', 'characters', 'radio', 'brands', 'tips'];

export const db = {
  meta: null,
  acts: [], missions: [], districts: [], collectibles: [], collectibleCategories: [],
  activities: [], characters: [], radio: [], brands: [], tips: [],
  byId: new Map(),
  ready: false,
};

export async function loadAll() {
  const results = await Promise.all(FILES.map(async (name) => {
    const res = await fetch(`data/${name}.json`, { cache: 'no-cache' });
    if (!res.ok) throw new Error(`Non riesco a leggere data/${name}.json (${res.status})`);
    return [name, await res.json()];
  }));
  const raw = Object.fromEntries(results);

  db.meta = raw.meta;
  db.acts = raw.missions.acts || [];
  db.missions = raw.missions.items || [];
  db.districts = raw.districts.items || [];
  db.collectibleCategories = raw.collectibles.categories || [];
  db.collectibles = raw.collectibles.items || [];
  db.activities = raw.activities.items || [];
  db.characters = raw.characters.items || [];
  db.radio = raw.radio.items || [];
  db.brands = raw.brands.items || [];
  db.tips = raw.tips.items || [];

  db.byId.clear();
  const tag = (list, type) => list.forEach((it) => { it._type = type; db.byId.set(it.id, it); });
  tag(db.acts, 'act'); tag(db.missions, 'mission'); tag(db.districts, 'district');
  tag(db.collectibles, 'collectible'); tag(db.activities, 'activity'); tag(db.characters, 'character');
  tag(db.radio, 'radio'); tag(db.brands, 'brand'); tag(db.tips, 'tip'); tag(db.collectibleCategories, 'category');

  db.missions.sort((a, b) => actNum(a.actId) - actNum(b.actId) || (a.chapter || 0) - (b.chapter || 0) || (a.order || 0) - (b.order || 0));
  db.ready = true;
  return db;
}

export function actNum(actId) { return db.acts.find((a) => a.id === actId)?.number ?? 99; }
export function byId(id) { return db.byId.get(id); }

/** Filtra via le voci ESEMPIO quando l'utente le ha nascoste */
export function visible(list, showExamples) {
  return showExamples ? list : list.filter((x) => !x.example);
}

export const TYPE_LABEL = {
  mission: 'Missione', district: 'Distretto', collectible: 'Collezionabile', activity: 'Attività',
  character: 'Personaggio', radio: 'Radio', brand: 'Marchio', tip: 'Consiglio', act: 'Atto', category: 'Categoria',
};
export const TYPE_ROUTE = {
  mission: (it) => `/missioni/${it.id}`, district: (it) => `/atlante/${it.id}`,
  collectible: (it) => `/collezionabili?cat=${it.categoryId}&q=${encodeURIComponent(it.name)}`,
  activity: (it) => `/atlante/${it.districtId || ''}`, character: (it) => `/personaggi/${it.id}`,
  radio: (it) => `/cultura/${it.id}`, brand: (it) => `/cultura/${it.id}`, tip: () => `/prima-ora`,
  act: (it) => `/missioni?atto=${it.id}`, category: (it) => `/collezionabili?cat=${it.id}`,
};
