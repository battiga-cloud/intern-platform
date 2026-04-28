<template>
  <n-space vertical size="large" class="p-4">
    <n-alert type="info" show-icon class="shadow-sm">
      <span class="font-bold">架构说明：</span>
      系统的核心角色（如 SUPER_ADMIN, SCHOOL_ADMIN 等）基于“代码即事实”原则，已在底层系统枚举中硬编码并受到严格的权限保护。
      为防止系统越权或逻辑崩溃，此处仅允许修改角色的“中文显示名称”与“描述”，不支持随意新增或删除核心角色。
    </n-alert>

    <n-card title="角色管理" :bordered="false" class="shadow-sm">
      <n-data-table
        :loading="loading"
        :columns="columns"
        :data="tableData"
        :row-key="(row) => row.id"
      />
    </n-card>

    <n-modal v-model:show="showModal" preset="card" title="编辑角色配置" class="w-120">
      <n-form ref="formRef" :model="formModel" :rules="rules" label-placement="left" label-width="100">

        <n-form-item label="角色编码" path="code">
          <n-input
            v-model:value="formModel.code"
            disabled
            placeholder="系统底层标识，禁止修改"
          />
          <template #feedback>
            <span class="text-xs text-gray-400">系统的路由拦截和业务越权鉴权极度依赖此字段，不可篡改。</span>
          </template>
        </n-form-item>

        <n-form-item label="显示名称" path="name">
          <n-input v-model:value="formModel.name" placeholder="如：系统超级管理员" />
        </n-form-item>

        <n-form-item label="角色描述" path="description">
          <n-input
            v-model:value="formModel.description"
            type="textarea"
            placeholder="请输入该角色的主要职责说明..."
          />
        </n-form-item>

        <n-form-item label="排序" path="sort">
          <n-input-number v-model:value="formModel.sort" :min="0" />
        </n-form-item>

      </n-form>

      <template #footer>
        <n-space justify="end">
          <n-button @click="showModal = false">取消</n-button>
          <n-button type="primary" @click="submitForm" :loading="submitLoading">保存修改</n-button>
        </n-space>
      </template>
    </n-modal>

  </n-space>
</template>

<script setup lang="ts">
import { ref, reactive, h, onMounted } from 'vue';
import { NTag, NButton, NSpace, useMessage } from 'naive-ui';
// 引入接口 (注意：需要在 api/system.ts 中补充 updateRole 方法)
import { fetchRoleList, updateRole } from '@/service/api/system';
// import { formatDateTime } from '@/utils/common'; // 若有时间格式化工具可引入

const message = useMessage();

// ================= 状态定义 =================
const loading = ref(false);
const submitLoading = ref(false);
const tableData = ref<Api.System.Role[]>([]);

const showModal = ref(false);
const formRef = ref<any>(null);

const formModel = reactive({
  id: '',
  code: '',
  name: '',
  description: '',
  sort: 0,
});

const rules = {
  name: { required: true, message: '角色显示名称不能为空', trigger: 'blur' },
};

// ================= 表格列定义 =================
const columns = [
  { title: '角色名称', key: 'name', width: 180, className: 'font-bold' },
  {
    title: '角色编码 (Code)',
    key: 'code',
    width: 200,
    render(row: any) {
      // 对核心角色做特殊颜色标记
      let tagType = 'default';
      if (row.code === 'SUPER_ADMIN') tagType = 'error';
      else if (row.code === 'PLATFORM_ADMIN') tagType = 'warning';
      else if (row.code === 'SCHOOL_ADMIN') tagType = 'info';
      else if (row.code === 'USER') tagType = 'success';

      return h(NTag, { type: tagType as any, bordered: false }, { default: () => row.code });
    }
  },
  { title: '角色描述', key: 'description', width: 250 },
  { title: '排序', key: 'sort', width: 80 },
  { title: '更新时间', key: 'updatedAt', width: 180 }, // 渲染时可用 dayjs 格式化
  {
    title: '操作',
    key: 'actions',
    width: 120,
    render(row: any) {
      return h(NButton, {
        size: 'small',
        type: 'primary',
        text: true,
        onClick: () => openEditModal(row),
      }, { default: () => '编辑' });
    }
  }
];

// ================= 数据加载 =================
async function loadData() {
  loading.value = true;
  try {
    // 角色数量通常很少，直接获取全量数据即可，不需要复杂分页
    const { data } = await fetchRoleList();
    // 根据 sort 升序排列
    tableData.value = (data || []).sort((a: Api.System.Role, b: Api.System.Role) => a.sort - b.sort);
  } finally {
    loading.value = false;
  }
}

// ================= 弹窗交互 =================
function openEditModal(row: any) {
  formModel.id = row.id;
  formModel.code = row.code;
  formModel.name = row.name;
  formModel.description = row.description || '';
  formModel.sort = row.sort;

  showModal.value = true;
}

async function submitForm() {
  await formRef.value?.validate();
  submitLoading.value = true;
  try {
    await updateRole(formModel.id, {
      name: formModel.name,
      description: formModel.description,
      sort: formModel.sort,
      // 绝对不提交 code 字段
    });

    message.success('角色信息已更新');
    showModal.value = false;
    loadData(); // 刷新表格
  } finally {
    submitLoading.value = false;
  }
}

// ================= 初始化 =================
onMounted(() => {
  loadData();
});
</script>

<style scoped>
.w-120 {
  width: 30rem;
}
</style>
