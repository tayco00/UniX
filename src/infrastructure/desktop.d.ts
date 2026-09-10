import type { AppData, AppInfo } from "../domain/model";

declare global {
  interface Window {
    unixApi?: {
      load(): Promise<AppData>;
      save(data: AppData): Promise<AppData>;
      reset(): Promise<AppData>;
      exportBackup(): Promise<{ canceled: boolean; filePath?: string }>;
      importBackup(): Promise<{ canceled: boolean; data?: AppData }>;
      getAppInfo(): Promise<AppInfo>;
    };
  }
}

export {};
