import { defineConfig } from "vite";
import { configDefaults } from "vitest/config";
import react from "@vitejs/plugin-react";
import { copyFileSync } from "fs";

import { resolve } from "path";

const copyCssPlugin = () => ({
  name: "copy-css",
  closeBundle: () => {
    try {
      copyFileSync(
        "./ts/dist/frontend.css",
        "./resources/public/css/ts-style.css",
      );
    } catch (e) {
      console.log("Error copying css file", e);
    }
  },
});

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), copyCssPlugin()],
  test: {
    exclude: [...configDefaults.exclude, "target/**", "resources/**"],
    environment: "jsdom",
  },
  resolve: {
    alias: {
      "@target": resolve(__dirname, "./target/storybook"),
    },
  },
  // define: {
  //   'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
  // },
  build: {
    outDir: './ts/dist/',
    emptyOutDir: true,
    lib: {
      entry: './ts/src/index.tsx',
      fileName: (format) => `index.js`,
      formats: ['es'],
    },
    rollupOptions: {
      external: ['react', 'react-dom'],
      output: {
        globals: {
          react: 'React',
          "react-dom": "ReactDOM",
        },
      },
    }
  },
});
