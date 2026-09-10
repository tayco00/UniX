const { contextBridge, ipcRenderer } = require("electron");

const channels = Object.freeze({
  load: "unix:data:load",
  save: "unix:data:save",
  reset: "unix:data:reset",
  export: "unix:data:export",
  import: "unix:data:import",
  info: "unix:app:info",
});

contextBridge.exposeInMainWorld(
  "unixApi",
  Object.freeze({
    load: () => ipcRenderer.invoke(channels.load),
    save: (data) => ipcRenderer.invoke(channels.save, data),
    reset: () => ipcRenderer.invoke(channels.reset),
    exportBackup: () => ipcRenderer.invoke(channels.export),
    importBackup: () => ipcRenderer.invoke(channels.import),
    getAppInfo: () => ipcRenderer.invoke(channels.info),
  }),
);
