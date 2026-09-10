import { appDataSchema, emptyAppData, type AppData, type AppInfo } from "../domain/model";

const BROWSER_KEY = "unix-local-preview-v1";

function browserRepository() {
  return {
    async load(): Promise<AppData> {
      const raw = localStorage.getItem(BROWSER_KEY);
      if (!raw) {
        const initial = emptyAppData();
        localStorage.setItem(BROWSER_KEY, JSON.stringify(initial));
        return initial;
      }
      return appDataSchema.parse(JSON.parse(raw));
    },
    async save(data: AppData): Promise<AppData> {
      const parsed = appDataSchema.parse(data);
      localStorage.setItem(BROWSER_KEY, JSON.stringify(parsed));
      return parsed;
    },
    async reset(): Promise<AppData> {
      const initial = emptyAppData();
      localStorage.setItem(BROWSER_KEY, JSON.stringify(initial));
      return initial;
    },
    async exportBackup(): Promise<{ canceled: boolean; filePath?: string }> { return { canceled: true }; },
    async importBackup(): Promise<{ canceled: boolean; data?: AppData }> { return { canceled: true }; },
    async getAppInfo(): Promise<AppInfo> {
      return { version: "0.1.0-web", dataPath: "Browser-Vorschau (localStorage)", platform: "web" };
    },
  };
}

export const repository = window.unixApi ?? browserRepository();
