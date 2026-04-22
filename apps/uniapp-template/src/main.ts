import { createSSRApp } from "vue";
import App from "./App.vue";
// pinia
import store from "@/store/index";
// 路由拦截
import { routeInterceptor } from "@/utils/route";

import "uno.css"; // 引入 UnoCSS 核心样式
// 全局样式
import "@/style/index.scss";
// 修改wot-ui样式
import "@/style/wot-ui.scss";

export function createApp() {
  const app = createSSRApp(App);
  app.use(store);
  app.use(routeInterceptor);
  return {
    app,
  };
}
