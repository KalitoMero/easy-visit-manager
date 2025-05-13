
const path = require('path');

module.exports = {
  main: {
    // Main process entry file
    entry: 'electron/main.js',
    outDir: 'dist-electron',
  },
  renderer: {
    // Vite config for renderer process
    root: path.join(__dirname, 'src'),
    outDir: path.join(__dirname, 'dist'),
  },
  preload: {
    // Preload script
    entry: path.join(__dirname, 'electron/preload.js'),
  },
};
