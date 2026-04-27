<template>
  <n-space vertical size="large" class="p-4">
    <n-card :bordered="false" class="shadow-sm">
      <n-form inline :model="searchParams" label-placement="left">
        <n-form-item label="学校名称">
          <n-input v-model:value="searchParams.keyword" placeholder="请输入学校名称" clearable />
        </n-form-item>
        <n-form-item>
          <n-button type="primary" @click="fetchData">查询</n-button>
          <n-button class="ml-2" @click="resetSearch">重置</n-button>
        </n-form-item>
      </n-form>
    </n-card>

    <n-card title="学校机构列表" :bordered="false" class="shadow-sm">
      <template #header-extra>
        <n-button type="primary" @click="openModal('add')">新增学校</n-button>
      </template>
      <n-data-table
        remote
        :loading="loading"
        :columns="columns"
        :data="tableData"
        :pagination="pagination"
        @update:page="handlePageChange"
      />
    </n-card>

    <n-modal v-model:show="showModal" preset="card" :title="modalType === 'add' ? '新增学校' : '编辑学校'" class="w-120">
      <n-form ref="formRef" :model="formModel" :rules="rules" label-placement="left" label-width="100">
        <n-form-item label="学校名称" path="name">
          <n-input v-model:value="formModel.name" placeholder="请输入完整的学校名称" />
        </n-form-item>
        <n-form-item label="负责人姓名" path="contactName">
          <n-input v-model:value="formModel.contactName" placeholder="选填" />
        </n-form-item>
        <n-form-item label="联系电话" path="phone">
          <n-input v-model:value="formModel.phone" placeholder="选填" />
        </n-form-item>
        <n-form-item label="详细地址" path="address">
          <n-input v-model:value="formModel.address" placeholder="选填" />
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showModal = false">取消</n-button>
          <n-button type="primary" :loading="submitLoading" @click="handleSubmit">确认保存</n-button>
        </n-space>
      </template>
    </n-modal>
  </n-space>
</template>

<script setup lang="ts">
import { ref, reactive, h, onMounted } from 'vue';
import { NButton, NSpace, NSwitch, useMessage, useDialog } from 'naive-ui';
import { fetchSchoolList, createSchool, updateSchool, updateSchoolStatus, deleteSchool } from '@/service/api/system';

const message = useMessage();
const dialog = useDialog();

// ========== 状态 ==========
const loading = ref(false);
const submitLoading = ref(false);
const tableData = ref([]);
const pagination = reactive({ page: 1, pageSize: 10, itemCount: 0 });
const searchParams = reactive({ keyword: '' });

// ========== 表格列 ==========
const columns = [
  { title: '学校名称', key: 'name' },
  { title: '负责人', key: 'contactName' },
  { title: '联系电话', key: 'phone' },
  { title: '创建时间', key: 'createdAt', render: (row: any) => new Date(row.createdAt).toLocaleDateString() },
  {
    title: '状态',
    key: 'status',
    render(row: any) {
      return h(NSwitch, {
        value: row.status === 'ACTIVE',
        onUpdateValue: async (val) => {
          const newStatus = val ? 'ACTIVE' : 'INACTIVE';
          await updateSchoolStatus(row.id, newStatus);
          row.status = newStatus;
          message.success('状态已更新');
        }
      });
    }
  },
  {
    title: '操作',
    key: 'actions',
    render(row: any) {
      return h(NSpace, null, {
        default: () => [
          h(NButton, { size: 'small', type: 'primary', text: true, onClick: () => openModal('edit', row) }, { default: () => '编辑' }),
          h(NButton, { size: 'small', type: 'error', text: true, onClick: () => handleDelete(row) }, { default: () => '删除' }),
        ]
      });
    }
  }
];

// ========== 数据请求 ==========
async function fetchData() {
  loading.value = true;
  try {
    const { data } = await fetchSchoolList({ ...searchParams, ...pagination });
    if (data) {
      tableData.value = data.records;
      pagination.itemCount = data.total;
    }
  } finally {
    loading.value = false;
  }
}

function handlePageChange(page: number) {
  pagination.page = page;
  fetchData();
}

function resetSearch() {
  searchParams.keyword = '';
  fetchData();
}

// ========== 表单弹窗 ==========
const showModal = ref(false);
const modalType = ref<'add' | 'edit'>('add');
const formRef = ref<any>(null);
const formModel = reactive({ id: '', name: '', contactName: '', phone: '', address: '' });
const rules = { name: { required: true, message: '学校名称不能为空', trigger: 'blur' } };

function openModal(type: 'add' | 'edit', row?: any) {
  modalType.value = type;
  if (type === 'edit' && row) {
    Object.assign(formModel, row);
  } else {
    Object.assign(formModel, { id: '', name: '', contactName: '', phone: '', address: '' });
  }
  showModal.value = true;
}

async function handleSubmit() {
  await formRef.value?.validate();
  submitLoading.value = true;
  try {
    if (modalType.value === 'add') {
      await createSchool(formModel);
      message.success('新增成功');
    } else {
      await updateSchool(formModel.id, formModel);
      message.success('修改成功');
    }
    showModal.value = false;
    fetchData();
  } finally {
    submitLoading.value = false;
  }
}

function handleDelete(row: any) {
  dialog.error({
    title: '删除警告',
    content: `确定要删除学校【${row.name}】吗？删除后不可恢复。`,
    positiveText: '确认删除',
    onPositiveClick: async () => {
      await deleteSchool(row.id);
      message.success('删除成功');
      fetchData();
    }
  });
}

onMounted(() => fetchData());
</script>

<style scoped>.w-120 { width: 30rem; }</style>
