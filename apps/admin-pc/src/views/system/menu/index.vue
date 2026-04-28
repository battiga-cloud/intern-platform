<template>
  <n-space vertical size="large" class="p-4">
    <n-card title="菜单管理" :bordered="false" class="shadow-sm">
      <template #header-extra>
        <n-button type="primary" @click="openModal('add')">新增顶级菜单</n-button>
      </template>

      <n-data-table
        :loading="loading"
        :columns="columns"
        :data="menuTree"
        :row-key="row => row.id"
        default-expand-all
      />
    </n-card>

    <n-modal v-model:show="showModal" preset="card" :title="modalType === 'add' ? '新增菜单' : '编辑菜单'" class="w-160">
      <n-form ref="formRef" :model="formModel" :rules="rules" label-placement="left" label-width="100">

        <n-form-item label="菜单类型" path="menuType">
          <n-radio-group v-model:value="formModel.menuType">
            <n-radio-button value="DIR">目录</n-radio-button>
            <n-radio-button value="MENU">菜单</n-radio-button>
            <n-radio-button value="BUTTON">按钮/权限</n-radio-button>
          </n-radio-group>
        </n-form-item>

        <n-form-item label="上级菜单" path="parentId">
          <n-tree-select
            v-model:value="formModel.parentId"
            :options="parentMenuOptions"
            key-field="id"
            label-field="title"
            clearable
            placeholder="留空则为顶级菜单"
          />
        </n-form-item>

        <n-form-item label="菜单标题" path="title">
          <n-input v-model:value="formModel.title" placeholder="如：系统管理" />
        </n-form-item>

        <n-form-item label="路由名称" path="routeName">
          <n-input v-model:value="formModel.routeName" placeholder="如：SystemManage (需唯一)" />
        </n-form-item>

        <n-form-item label="路由路径" path="routePath">
          <n-input v-model:value="formModel.routePath" placeholder="如：/system" />
        </n-form-item>

        <n-form-item v-if="formModel.menuType === 'MENU'" label="组件路径" path="component">
          <n-input v-model:value="formModel.component" placeholder="如：/views/system/menu/index.vue" />
        </n-form-item>

        <n-form-item label="排序" path="sort">
          <n-input-number v-model:value="formModel.sort" :min="0" />
        </n-form-item>

        <n-form-item label="绑定角色" path="roleIds">
          <n-select
            v-model:value="formModel.roleIds"
            multiple
            :options="roleOptions"
            placeholder="哪些角色可以访问此菜单"
          />
        </n-form-item>
      </n-form>

      <template #footer>
        <n-space justify="end">
          <n-button @click="showModal = false">取消</n-button>
          <n-button type="primary" @click="submitForm" :loading="submitLoading">保存</n-button>
        </n-space>
      </template>
    </n-modal>
  </n-space>
</template>

<script setup lang="ts">
import { ref, reactive, h, onMounted, computed } from 'vue';
import { NButton, NSpace, NTag, useMessage, useDialog } from 'naive-ui';
// 假设已在 API 文件中封装
import { fetchMenuTree, createMenu, updateMenu, deleteMenu, fetchRoleList } from '@/service/api/system';

const message = useMessage();
const dialog = useDialog();

// === 状态 ===
const loading = ref(false);
const submitLoading = ref(false);
const menuTree = ref<Api.System.Menu[]>([]);
const roleOptions = ref<{ id: number; name: string }[]>([]);

// 下拉树的选项：过滤掉按钮类型，并且如果是编辑状态，要过滤掉自己（防止死循环）
const parentMenuOptions = computed<Api.System.Menu[]>(() => {
  const filterTree = (nodes: Api.System.Menu[]) => {
    return nodes
      .filter(node => node.menuType !== 'BUTTON' && node.id !== formModel.id)
      .map(node => ({
        ...node,
        children: node.children ? filterTree(node.children) : undefined
      }));
  };
  return filterTree(menuTree.value);
});

// === 表格列 ===
const columns = [
  { title: '菜单标题', key: 'title', width: 200 },
  {
    title: '类型',
    key: 'menuType',
    width: 100,
    render(row: any) {
      const typeMap: Record<string, any> = {
        DIR: { type: 'default', label: '目录' },
        MENU: { type: 'success', label: '菜单' },
        BUTTON: { type: 'warning', label: '按钮' }
      };
      const info = typeMap[row.menuType] || typeMap.DIR;
      return h(NTag, { type: info.type, size: 'small' }, { default: () => info.label });
    }
  },
  { title: '路由路径', key: 'routePath', width: 200 },
  { title: '排序', key: 'sort', width: 80 },
  {
    title: '可见角色',
    key: 'roles',
    render(row: any) {
      if (!row.roles || row.roles.length === 0) return '-';
      return h(NSpace, { size: 'small' }, {
        default: () => row.roles.map((r: any) => h(NTag, { size: 'small', type: 'info' }, { default: () => r.name }))
      });
    }
  },
  {
    title: '操作',
    key: 'actions',
    width: 250,
    render(row: any) {
      return h(NSpace, null, {
        default: () => [
          // 仅目录和菜单允许添加子节点
          row.menuType !== 'BUTTON' && h(NButton, { size: 'small', text: true, type: 'primary', onClick: () => openModal('add', row.id) }, { default: () => '新增子项' }),
          h(NButton, { size: 'small', text: true, type: 'info', onClick: () => openModal('edit', row) }, { default: () => '编辑' }),
          h(NButton, { size: 'small', text: true, type: 'error', onClick: () => handleDelete(row) }, { default: () => '删除' }),
        ]
      });
    }
  }
];

// === 初始化 ===
async function loadData() {
  loading.value = true;
  try {
    const [menuRes, roleRes] = await Promise.all([
      fetchMenuTree(),
      fetchRoleList() // 获取系统所有角色用于绑定
    ]);
    console.log('loadData menuRes, roleRes', menuRes, roleRes);
    menuTree.value = menuRes.data || [];
    roleOptions.value = roleRes.data?.map((r: any) => ({ label: r.name, value: r.id }));
  } finally {
    loading.value = false;
  }
}

// === 弹窗与表单 ===
const showModal = ref(false);
const modalType = ref<'add' | 'edit'>('add');
const formRef = ref<any>(null);

const formModel = reactive({
  id: '', parentId: null, menuType: 'MENU', title: '', routeName: '', routePath: '', component: '', sort: 0, roleIds: [] as string[]
});

const rules = {
  title: { required: true, message: '请输入菜单标题', trigger: 'blur' },
  routeName: { required: true, message: '请输入路由名称', trigger: 'blur' },
  routePath: { required: true, message: '请输入路由路径', trigger: 'blur' }
};

function openModal(type: 'add' | 'edit', payload?: any) {
  modalType.value = type;
  if (type === 'add') {
    Object.assign(formModel, {
      id: '', parentId: typeof payload === 'string' ? payload : null, menuType: 'MENU', title: '', routeName: '', routePath: '', component: '', sort: 0, roleIds: []
    });
  } else {
    Object.assign(formModel, {
      id: payload.id, parentId: payload.parentId, menuType: payload.menuType, title: payload.title, routeName: payload.routeName, routePath: payload.routePath, component: payload.component || '', sort: payload.sort, roleIds: payload.roles?.map((r: any) => r.id) || []
    });
  }
  showModal.value = true;
}

async function submitForm() {
  await formRef.value?.validate();
  submitLoading.value = true;
  try {
    if (modalType.value === 'add') {
      await createMenu(formModel);
    } else {
      await updateMenu(formModel.id, formModel);
    }
    message.success('保存成功');
    showModal.value = false;
    loadData();
  } finally {
    submitLoading.value = false;
  }
}

function handleDelete(row: any) {
  dialog.warning({
    title: '删除警告',
    content: `确认删除菜单【${row.title}】吗？若包含子菜单将无法删除。`,
    positiveText: '确认',
    negativeText: '取消',
    onPositiveClick: async () => {
      await deleteMenu(row.id);
      message.success('删除成功');
      loadData();
    }
  });
}

onMounted(() => {
  loadData();
});
</script>

<style scoped>
.w-160 { width: 40rem; }
</style>
