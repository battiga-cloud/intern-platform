import { createSSRApp } from "vue";
import App from "./App.vue";
import "uno.css"; // 引入 UnoCSS 核心样式

export function createApp() {
  const app = createSSRApp(App);
  return {
    app,
  };
}
