import { app, BrowserWindow } from 'electron';
import path from 'path';

const createWindow = () => {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'), // optional
    },
  });

  // During dev, load your vite app
  // The 'process.env.NODE_ENV === "development"' isn't working correctly, so let's try direct loading
  win.loadURL('http://localhost:5173'); // default Vite port
};

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
