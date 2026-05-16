import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("kubeExplorerDesktop", {
  window: {
    minimize: () => ipcRenderer.invoke("window:minimize"),
    toggleMaximize: () => ipcRenderer.invoke("window:toggle-maximize"),
    close: () => ipcRenderer.invoke("window:close"),
    isMaximized: () => ipcRenderer.invoke("window:is-maximized"),
    onMaximizedChanged: (callback) => {
      const listener = (_event, maximized) => callback(maximized);
      ipcRenderer.on("window:maximized-changed", listener);

      return () => {
        ipcRenderer.removeListener("window:maximized-changed", listener);
      };
    },
  },
});
