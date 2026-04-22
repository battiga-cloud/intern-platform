import type { Preset, SourceCodeTransformer } from "unocss";
import { defineConfig, presetAttributify } from "unocss";

import {
  presetApplet,
  presetRemRpx,
  transformerAttributify,
} from "unocss-applet";

// uni-app
const isApplet = process.env?.UNI_PLATFORM?.startsWith("mp-") ?? false;
// taro
// const isApplet = process.env.TARO_ENV !== 'h5' ?? false
const presets: Preset[] = [];
const transformers: SourceCodeTransformer[] = [];

if (isApplet) {
  presets.push(presetApplet());
  presets.push(presetRemRpx());
  transformers.push(transformerAttributify({ ignoreAttributes: ["block"] }));
} else {
  presets.push(presetApplet());
  presets.push(presetAttributify());
  presets.push(presetRemRpx({ mode: "rpx2rem" }));
}

export default defineConfig({
  presets: [
    // ...
    ...presets,
  ],
  transformers: [
    // ...
    ...transformers,
  ],
});
