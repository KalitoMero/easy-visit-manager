
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
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
