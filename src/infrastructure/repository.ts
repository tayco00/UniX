import {
  emptyData,
  migrateData,
  parseData,
  type AppData,
} from "../domain/model";

const key = "unix.v2";

export const repository = {
  async load() {
    if (window.unixApi) return migrateData(await window.unixApi.load());
    const stored = localStorage.getItem(key);
    return stored ? migrateData(JSON.parse(stored)) : emptyData();
  },
  async save(data: AppData) {
    const valid = parseData(data);
    if (window.unixApi) return migrateData(await window.unixApi.save(valid));
    localStorage.setItem(key, JSON.stringify(valid));
    return valid;
  },
  async reset() {
    if (window.unixApi) return migrateData(await window.unixApi.reset());
    localStorage.removeItem(key);
    return emptyData();
  },
  async exportBackup() {
    return window.unixApi ? window.unixApi.exportBackup() : { canceled: true };
  },
  async importBackup() {
    return window.unixApi
      ? window.unixApi.importBackup()
      : { canceled: true as const };
  },
  async info() {
    return window.unixApi
      ? window.unixApi.getAppInfo()
      : { version: "Vorschau", platform: "web", recoveredFromBackup: false };
  },
};
