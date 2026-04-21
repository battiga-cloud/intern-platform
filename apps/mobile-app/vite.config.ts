import { defineConfig } from "vite";
import { resolve } from 'path';
import uni from "@dcloudio/vite-plugin-uni";
import UnoCSS from "unocss/vite";

const root = process.cwd();

export default defineConfig({
  plugins: [
    uni(),
    UnoCSS(), // 引入 UnoCSS
  ],
  css: {
    preprocessorOptions: {
      scss: {
        api: "modern-compiler", // or 'modern'
        silenceDeprecations: [
          "legacy-js-api",
          "import",
          "color-functions",
          "global-builtin",
          "if-function",
        ],
        javascriptEnabled: true,
      },
    },
  },
  resolve: {
    alias: {
      "@": resolve(root, "src"),
    },
  },
});
