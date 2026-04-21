import { defineConfig } from "vite";
import { resolve } from 'path';
import uni from "@dcloudio/vite-plugin-uni";
import UnoCSS from "unocss/vite";
import Components from '@uni-helper/vite-plugin-uni-components'
import { WotResolver } from '@uni-helper/vite-plugin-uni-components/resolvers'

const root = process.cwd();

export default defineConfig({
  plugins: [
    
    uni(),
    UnoCSS(), // 引入 UnoCSS
    Components({
      resolvers: [
        WotResolver() // 必须显式注册解析器
      ],
      dts: 'src/components.d.ts' // 自动生成类型声明
    })
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
