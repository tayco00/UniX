import type { AppData } from "../domain/model";

declare global {
  interface Window {
    unixApi?: {
      load: () => Promise<AppData>;
      save: (data: AppData) => Promise<AppData>;
      reset: () => Promise<AppData>;
      exportBackup: () => Promise<{ canceled: boolean }>;
      importBackup: () => Promise<{ canceled: boolean; data?: AppData }>;
      getAppInfo: () => Promise<{
        version: string;
        platform: string;
        recoveredFromBackup: boolean;
      }>;
    };
  }
}

export {};
