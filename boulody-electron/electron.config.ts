import type { Configuration } from 'electron-builder';
import path from 'path';

const config: Configuration = {
  appId: 'com.boulody.electron',
  productName: 'Boulody Electron',
  directories: {
    output: 'dist',
    buildResources: 'assets',
  },
  files: ['packages/main/dist/**/*', 'packages/renderer/dist/**/*'],
  mac: {
    category: 'public.app-category.music',
    target: ['dmg'],
  },
  win: {
    target: ['nsis'],
  },
  linux: {
    target: ['AppImage'],
    category: 'Audio',
  },
};

export default config;
