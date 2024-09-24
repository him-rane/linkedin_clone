import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 2000,
    outDir: "dist", // This is the directory Vite will output the build files to
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"], // Example: split large dependencies like react or lodash
        },
      },
    },
  },
});
