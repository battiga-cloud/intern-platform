import { defineConfig, presetUno } from "unocss";

export default defineConfig({
  presets: [presetUno()],
  rules: [
    // 将 px 自动转换为 rpx，保留开发习惯
    [/^m-(\d+)$/, ([, d]) => ({ margin: `${d}rpx` })],
    [/^p-(\d+)$/, ([, d]) => ({ padding: `${d}rpx` })],
  ],
  theme: {
    // 你可以在这里统一定义平台的主题色，比如那个 #007aff
    colors: {
      primary: "#007aff",
    },
  },
});
