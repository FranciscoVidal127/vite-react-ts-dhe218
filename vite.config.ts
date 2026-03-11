import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { copyFileSync, readdirSync, mkdirSync, statSync } from 'fs'
import { join } from 'path'

function safePublicCopy() {
  return {
    name: 'safe-public-copy',
    closeBundle() {
      function copyDirectory(src: string, dest: string) {
        try {
          mkdirSync(dest, { recursive: true });
        } catch (e) {}

        let entries;
        try {
          entries = readdirSync(src, { withFileTypes: true });
        } catch (e) {
          return;
        }

        for (const entry of entries) {
          const srcPath = join(src, entry.name);
          const destPath = join(dest, entry.name);

          try {
            if (entry.isDirectory()) {
              copyDirectory(srcPath, destPath);
            } else {
              copyFileSync(srcPath, destPath);
            }
          } catch (err: any) {
            if (err.code !== 'EAGAIN') {
              console.warn(`⊙ Could not copy ${entry.name}: ${err.code}`);
            }
          }
        }
      }

      copyDirectory('public', 'dist');
    }
  };
}

export default defineConfig({
  plugins: [react(), safePublicCopy()],
  publicDir: false
})
