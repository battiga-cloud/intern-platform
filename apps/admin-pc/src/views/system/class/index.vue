<template>
  <n-space vertical size="large" class="p-4">
    <n-card :bordered="false" class="shadow-sm">
      <n-form inline :model="searchParams" label-placement="left">
        <n-form-item label="班级名称">
          <n-input v-model:value="searchParams.keyword" placeholder="请输入班级关键字" clearable />
        </n-form-item>
        <n-form-item label="所属学校">
          <n-select v-model:value="searchParams.schoolId" :options="schoolOptions" placeholder="全部" clearable class="w-48" />
        </n-form-item>
        <n-form-item>
          <n-button type="primary" @click="fetchData">查询</n-button>
          <n-button class="ml-2" @click="resetSearch">重置</n-button>
        </n-form-item>
      </n-form>
    </n-card>

    <n-card title="班级列表" :bordered="false" class="shadow-sm">
      <template #header-extra>
        <n-button type="primary" @click="openModal('add')">新增班级</n-button>
      </template>
      <n-data-table remote :loading="loading" :columns="columns" :data="tableData" :pagination="pagination" @update:page="handlePageChange" />
    </n-card>

    <n-modal v-model:show="showModal" preset="card" :title="modalType === 'add' ? '新增班级' : '编辑班级'" class="w-120">
      <n-form ref="formRef" :model="formModel" :rules="rules" label-placement="left" label-width="100">
        <n-form-item label="所属学校" path="schoolId">
          <n-select v-model:value="formModel.schoolId" :options="schoolOptions" placeholder="请选择所属学校" :disabled="modalType === 'edit'" />
        </n-form-item>
        <n-form-item label="班级名称" path="name">
          <n-input v-model:value="formModel.name" placeholder="例如：计科2201班" />
        </n-form-item>
        <n-form-item label="年级" path="grade">
          <n-input v-model:value="formModel.grade" placeholder="例如：2022级" />
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
import { NButton, NSpace, NTag, useMessage, useDialog } from 'naive-ui';
import { fetchClassList, createClass, updateClass, deleteClass, fetchSchoolList } from '@/service/api/system';

const message = useMessage();
const dialog = useDialog();

const loading = ref(false);
const submitLoading = ref(false);
const tableData = ref([]);
const pagination = reactive({ page: 1, pageSize: 10, itemCount: 0 });
const searchParams = reactive({ keyword: '', schoolId: null });
const schoolOptions = ref([]);

const columns = [
  { title: '班级名称', key: 'name', width: 180 },
  { title: '所属学校', key: 'school.name', width: 200 },
  { title: '年级', key: 'grade', width: 120 },
  {
    title: '班级人数',
    key: 'studentCount',
    width: 120,
    render: (row: any) => h(NTag, { type: 'info' }, { default: () => `${row._count?.classMemberships || 0} 人` })
  },
  { title: '创建时间', key: 'createdAt', width: 150, render: (row: any) => new Date(row.createdAt).toLocaleDateString() },
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

async function loadSchools() {
  // 获取学校下拉列表，限制取 100 条足够作选项
  const { data } = await fetchSchoolList({ pageSize: 100 });
  if (data?.records) {
    schoolOptions.value = data.records.map((s: any) => ({ label: s.name, value: s.id }));
  }
}

async function fetchData() {
  loading.value = true;
  try {
    const { data } = await fetchClassList({ ...searchParams, ...pagination });
    if (data) {
      tableData.value = data.records;
      pagination.itemCount = data.total;
    }
  } finally {
    loading.value = false;
  }
}

function handlePageChange(page: number) { pagination.page = page; fetchData(); }
function resetSearch() { searchParams.keyword = ''; searchParams.schoolId = null; fetchData(); }

const showModal = ref(false);
const modalType = ref<'add' | 'edit'>('add');
const formRef = ref<any>(null);
const formModel = reactive({ id: '', name: '', schoolId: null, grade: '' });
const rules = {
  schoolId: { required: true, message: '请选择所属学校', trigger: 'change' },
  name: { required: true, message: '班级名称不能为空', trigger: 'blur' }
};

function openModal(type: 'add' | 'edit', row?: any) {
  modalType.value = type;
  if (type === 'edit' && row) {
    Object.assign(formModel, row);
  } else {
    Object.assign(formModel, { id: '', name: '', schoolId: null, grade: '' });
  }
  showModal.value = true;
}

async function handleSubmit() {
  await formRef.value?.validate();
  submitLoading.value = true;
  try {
    if (modalType.value === 'add') {
      await createClass(formModel);
      message.success('班级创建成功');
    } else {
      await updateClass(formModel.id, formModel);
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
    content: `确定要删除【${row.name}】吗？如果该班级下有学生则无法删除。`,
    positiveText: '确认删除',
    onPositiveClick: async () => {
      await deleteClass(row.id);
      message.success('删除成功');
      fetchData();
    }
  });
}

onMounted(() => {
  loadSchools();
  fetchData();
});
</script>

<style scoped>.w-120 { width: 30rem; }</style>
