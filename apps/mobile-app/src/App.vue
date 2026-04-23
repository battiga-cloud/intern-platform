<script setup lang="ts">
onLaunch(() => { })
</script>

<style lang="scss">
@use '@wot-ui/ui/styles/theme/index.scss' as *;

.page-wrapper {
  min-height: calc(100vh - var(--window-top));
  box-sizing: border-box;
  // background: var(--wot-filled-content);
  --un-bg-opacity: 1;
  background-color: rgb(249 250 251 / var(--un-bg-opacity));
}

// .wot-theme-dark.page-wrapper {
//   background: #222;
// }
</style>
