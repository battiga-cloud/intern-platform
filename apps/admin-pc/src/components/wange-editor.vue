<script setup lang="ts">
import '@wangeditor/editor/dist/css/style.css';
import { createEditor, createToolbar, type IDomEditor, type IEditorConfig, type IToolbarConfig } from '@wangeditor/editor';
import { onMounted, onBeforeUnmount, ref, shallowRef, watch, nextTick } from 'vue';

// 接收父组件参数
type Props = {
  modelValue: string;
  visible?: boolean;
};
const props = defineProps<Props>();
const emit = defineEmits<{ (e: 'update:modelValue', value: string): void }>();

// DOM 容器与编辑器实例
const editorRef = shallowRef<IDomEditor | null>(null);
const editorContainer = ref<HTMLElement | null>(null);
const toolbarContainer = ref<HTMLElement | null>(null);

// 监听父组件的数据回显 (编辑模式下)
watch(
  () => props.modelValue,
  (newVal) => {
    const editor = editorRef.value;
    if (!editor) return;
    // 只有当传入的值和当前编辑器内容不同时才赋值，防止光标跳动
    if (newVal !== editor.getHtml() && newVal !== '<p><br></p>') {
      editor.setHtml(newVal || '<p><br></p>');
    }
  }
);

onMounted(() => {
  // 使用 nextTick 确保 Naive UI 弹窗动画完成后 DOM 已完全渲染
  nextTick(() => {
    if (!editorContainer.value || !toolbarContainer.value) return;

    // 1. 配置编辑器
    const editorConfig: Partial<IEditorConfig> = {
      placeholder: '请输入或粘贴排版好的宣传内容...',
      MENU_CONF: {
        // 如果后续有图片上传需求，在这里配置 uploadImage
      },
      onChange(editor) {
        // 同步数据给父组件的 v-model
        const html = editor.getHtml();
        emit('update:modelValue', editor.isEmpty() ? '' : html);
      }
    };

    // 2. 创建编辑器实例
    const editor = createEditor({
      selector: editorContainer.value,
      html: props.modelValue || '',
      config: editorConfig,
      mode: 'default'
    });

    editorRef.value = editor;

    // 3. 创建工具栏
    const toolbarConfig: Partial<IToolbarConfig> = {};
    createToolbar({
      editor,
      selector: toolbarContainer.value,
      config: toolbarConfig,
      mode: 'default'
    });
  });
});

// 销毁时清理内存
onBeforeUnmount(() => {
  const editor = editorRef.value;
  if (editor == null) return;
  editor.destroy();
  editorRef.value = null;
});
</script>

<template>
  <div style="border: 1px solid #e5e7eb; border-radius: 4px; z-index: 100; position: relative; width: 100%; line-height: normal;">
    <div ref="toolbarContainer" style="border-bottom: 1px solid #e5e7eb;"></div>
    <div ref="editorContainer" style="height: 350px; overflow-y: hidden;"></div>
  </div>
</template>

<style scoped>
/* 修复富文本组件在某些框架下被全局样式覆盖的问题 */
:deep(.w-e-text-container) {
  background-color: #fff;
}
</style>
