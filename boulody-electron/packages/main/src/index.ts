import { app, BrowserWindow } from 'electron';
import { FakeAudioEngine } from './audio/engine';
import path from 'path';
import fs from 'fs';

let mainWindow: BrowserWindow | undefined;
let audioEngine: FakeAudioEngine | undefined;

const createWindow = () => {
  const preloadPath = path.join(__dirname, 'preload.js');
  console.log(
    '[main] creating window. preload path =',
    preloadPath,
    'exists =',
    fs.existsSync(preloadPath),
  );

  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      // point to built preload (ts compiles preload.ts -> preload.js into dist root alongside index.js)
      preload: preloadPath,
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });
  console.log('[main] window created (contextIsolation=true, sandbox=false)');

  // During dev, load your vite app
  // The 'process.env.NODE_ENV === "development"' isn't working correctly, so let's try direct loading
  win.loadURL('http://localhost:5173'); // default Vite port
  mainWindow = win;
  // Lazy create engine once window exists
  if (!audioEngine) {
    audioEngine = new FakeAudioEngine(() => mainWindow);
    audioEngine.start();
    audioEngine.exposeDevHelpers();
  }

  // After DOM ready, probe for presence of exposed API
  win.webContents.once('dom-ready', () => {
    win.webContents
      .executeJavaScript('typeof window.audioFrames')
      .then((res) => console.log('[main] dom-ready typeof window.audioFrames =', res))
      .catch((err) => console.error('[main] dom-ready probe error', err));
  });
};

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
