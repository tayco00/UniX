const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld(
  "unixApi",
  Object.freeze({
    load: () => ipcRenderer.invoke("unix:data:load"),
    save: (data) => ipcRenderer.invoke("unix:data:save", data),
    reset: () => ipcRenderer.invoke("unix:data:reset"),
    exportBackup: () => ipcRenderer.invoke("unix:data:export"),
    importBackup: () => ipcRenderer.invoke("unix:data:import"),
    getAppInfo: () => ipcRenderer.invoke("unix:app:info"),
  }),
);
