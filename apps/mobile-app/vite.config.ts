import { defineConfig } from "vite";
import uni from "@dcloudio/vite-plugin-uni";
import UnoCSS from "unocss/vite";

export default defineConfig({
  plugins: [
    uni(),
    UnoCSS(), // 引入 UnoCSS
  ],
  css: {
    preprocessorOptions: {
      scss: {
        api: "modern-compiler", // or 'modern'
        silenceDeprecations: ['legacy-js-api', 'import', 'color-functions', 'global-builtin', 'if-function'],
        javascriptEnabled: true,
      },
    },
  },
});
