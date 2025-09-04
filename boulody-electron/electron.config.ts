import type { Configuration } from 'electron-builder';

const config: Configuration = {
  appId: 'com.boulody.visualizer',
  productName: 'Boulody Visualizer',
  copyright: 'Copyright © 2024 Boulody',
  
  directories: {
    output: 'dist-electron',
    buildResources: 'assets',
  },
  
  files: [
    'packages/main/dist/**/*',
    'packages/renderer/dist/**/*',
    'packages/shared/dist/**/*',
    '!**/node_modules/**/*',
    '!**/.git/**/*',
    '!**/src/**/*',
    '!**/*.ts',
    '!**/*.map'
  ],
  
  extraMetadata: {
    main: 'packages/main/dist/index.js'
  },

  mac: {
    category: 'public.app-category.music',
    target: [
      {
        target: 'dmg',
        arch: ['x64', 'arm64']
      }
    ],
    icon: 'assets/icon.icns',
    darkModeSupport: true,
    hardenedRuntime: true,
    gatekeeperAssess: false,
    entitlements: 'assets/entitlements.mac.plist',
    entitlementsInherit: 'assets/entitlements.mac.plist'
  },
  
  win: {
    target: [
      {
        target: 'nsis',
        arch: ['x64', 'ia32']
      },
      {
        target: 'portable',
        arch: ['x64']
      }
    ],
    icon: 'assets/icon.ico',
    publish: {
      provider: 'github',
      owner: 'sondoannam',
      repo: 'boulody'
    },
    verifyUpdateCodeSignature: false
  },
  
  linux: {
    target: [
      {
        target: 'AppImage',
        arch: ['x64']
      },
      {
        target: 'deb',
        arch: ['x64']
      }
    ],
    category: 'AudioVideo;Audio;Music',
    icon: 'assets/icon.png',
    desktop: {
      desktopActions: {
        open: {
          name: 'Open',
          description: 'Open the application'
        }
      }
    }
  },

  nsis: {
    oneClick: false,
    perMachine: false,
    allowToChangeInstallationDirectory: true,
    createDesktopShortcut: true,
    createStartMenuShortcut: true,
    shortcutName: 'Boulody Visualizer'
  },

  publish: {
    provider: 'github',
    owner: 'sondoannam',
    repo: 'boulody'
  }
};

export default config;
