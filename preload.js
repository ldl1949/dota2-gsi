const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    sendSaveIntervals: (intervalData) => ipcRenderer.send('save-intervals', intervalData),
    sendStartSounds: () => ipcRenderer.send('start-sounds'),
    onClockTimeUpdate: (callback) => ipcRenderer.on('clockTime', callback)
});
