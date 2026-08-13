import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/watermark-tool/",
  build: {
    target: "safari14",
  },
});
