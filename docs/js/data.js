/**
 * Carica i JSON dei contenuti e li mette in relazione.
 * L'interfaccia legge da qui e basta: nessun contenuto vive nel codice.
 */
const FILES = ['meta', 'missions', 'districts', 'collectibles', 'activities', 'characters', 'radio', 'brands', 'tips', 'vehicles', 'weapons', 'news', 'trophies', 'luoghi', 'teorie'];

export const db = {
  meta: null,
  acts: [], missions: [], districts: [], collectibles: [], collectibleCategories: [],
  activities: [], characters: [], radio: [], brands: [], tips: [], vehicles: [], weapons: [], news: [], trophies: [], pois: [], luoghi: [], guide: [], teorie: [],
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
  db.vehicles = raw.vehicles.items || [];
  db.weapons = raw.weapons.items || [];
  db.trophies = raw.trophies.items || [];
  db.news = (raw.news.items || []).sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  // Schede dei luoghi e guide (gtasixmap.com, tradotte): id derivato dallo slug
  db.luoghi = (raw.luoghi.items || []).map((l) => ({ ...l, id: 'luogo-' + l.slug, name: l.name, status: /Confermato/.test((l.badges || []).join(' ')) ? 'verificato' : 'da-verificare', source: 'community', spoilerLevel: 0, example: false }));
  db.teorie = (raw.teorie?.items || []).map((t) => ({ ...t, status: 'da verificare' }));
  db.guide = (raw.luoghi.guides || []).map((g) => ({ ...g, id: 'guida-' + g.slug, status: 'da-verificare', source: 'community', spoilerLevel: 0, example: false }));
  db.pois = db.districts.flatMap((d) => (d.pois || []).map((p) => ({ ...p, districtId: d.id, status: p.status || d.status, source: p.source || d.source, spoilerLevel: p.spoilerLevel ?? 0, example: p.example ?? d.example })));

  db.byId.clear();
  const tag = (list, type) => list.forEach((it) => { it._type = type; db.byId.set(it.id, it); });
  tag(db.acts, 'act'); tag(db.missions, 'mission'); tag(db.districts, 'district');
  tag(db.collectibles, 'collectible'); tag(db.activities, 'activity'); tag(db.characters, 'character');
  tag(db.radio, 'radio'); tag(db.brands, 'brand'); tag(db.tips, 'tip'); tag(db.collectibleCategories, 'category'); tag(db.vehicles, 'vehicle'); tag(db.weapons, 'weapon'); tag(db.news, 'news'); tag(db.trophies, 'trophy'); tag(db.pois, 'poi'); tag(db.luoghi, 'luogo'); tag(db.guide, 'guida'); tag(db.teorie, 'teoria');

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
  character: 'Personaggio', radio: 'Radio', brand: 'Marchio', tip: 'Consiglio', act: 'Atto', category: 'Categoria', vehicle: 'Veicolo', weapon: 'Arma', poi: 'Luogo', news: 'Novità', trophy: 'Trofeo', luogo: 'Scheda luogo', guida: 'Guida', teoria: 'Teoria',
};
export const TYPE_ROUTE = {
  mission: (it) => `/missioni/${it.id}`, district: (it) => `/atlante/${it.id}`,
  collectible: (it) => `/collezionabili?cat=${it.categoryId}&q=${encodeURIComponent(it.name)}`,
  activity: (it) => `/atlante/${it.districtId || ''}`, character: (it) => `/personaggi/${it.id}`,
  radio: (it) => `/cultura/${it.id}`, brand: (it) => `/cultura/${it.id}`, tip: (it) => `/news?tipo=guide#${it.id}`,
  act: (it) => `/missioni?atto=${it.id}`, category: (it) => `/collezionabili?cat=${it.id}`,
  vehicle: (it) => `/veicoli/${it.id}`, weapon: (it) => `/armi/${it.id}`, news: (it) => `/novita/${it.id}`, poi: (it) => `/atlante/${it.districtId}/${it.id}`,
  luogo: (it) => `/mappa/luogo/${it.slug}`, guida: (it) => `/news/${it.id}`, teoria: (it) => `/news?tipo=teorie`,
};
