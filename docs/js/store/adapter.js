/**
 * Adapter di storage: il contratto che ogni backend deve rispettare.
 * Le viste non parlano mai direttamente con localStorage:
 * passano da progress.js, che usa un adapter.
 *
 * In v2 basterà aggiungere `supabase-adapter.js` con questi stessi metodi.
 */
export class StorageAdapter {
  /** @returns {Promise<object|null>} */
  async load() { throw new Error('load() non implementato'); }
  /** @param {object} state */
  async save(state) { throw new Error('save() non implementato'); }
  /** @returns {Promise<void>} */
  async clear() { throw new Error('clear() non implementato'); }
  /** Nome leggibile, per le Impostazioni */
  get name() { return 'astratto'; }
}
