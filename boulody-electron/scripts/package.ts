import { build } from 'electron-builder';
import config from '../electron.config';

async function packageApp() {
  try {
    console.log('Starting packaging process...');
    await build({
      config,
    });
    console.log('Packaging completed successfully!');
  } catch (error) {
    console.error('Packaging failed:', error);
    process.exit(1);
  }
}

packageApp();
