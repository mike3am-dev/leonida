import { StorageAdapter } from './adapter.js';

export const STORAGE_KEY = 'leonida:progress:v1';

/** Salva tutto in localStorage, sotto una chiave versionata. */
export class LocalAdapter extends StorageAdapter {
  constructor(key = STORAGE_KEY) { super(); this.key = key; }

  async load() {
    try {
      const raw = localStorage.getItem(this.key);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      console.warn('[storage] lettura fallita', e);
      return null;
    }
  }

  async save(state) {
    try {
      localStorage.setItem(this.key, JSON.stringify(state));
      return true;
    } catch (e) {
      console.warn('[storage] scrittura fallita', e);
      return false;
    }
  }

  async clear() { localStorage.removeItem(this.key); }

  get name() { return 'Questo dispositivo (localStorage)'; }
}
