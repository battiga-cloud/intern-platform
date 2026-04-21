import { createSSRApp } from "vue";
import App from "./App.vue";
// 引入状态管理
import { setupStore, Pinia } from '@/store';
import "uno.css"; // 引入 UnoCSS 核心样式

export function createApp() {
  const app = createSSRApp(App);
  setupStore(app);
  return {
    app,
    Pinia,
  };
}
