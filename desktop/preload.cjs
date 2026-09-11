const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("unixDesktop", {
  exportBackup: (payload) => ipcRenderer.invoke("unix:export", payload),
  importBackup: () => ipcRenderer.invoke("unix:import"),
  setDirty: (dirty, saving) => ipcRenderer.invoke("unix:dirty", { dirty, saving }),
  getAppInfo: () => ipcRenderer.invoke("unix:info"),
  quit: () => ipcRenderer.invoke("unix:quit"),
});
