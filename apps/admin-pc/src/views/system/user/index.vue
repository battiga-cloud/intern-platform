<template>
  <n-space vertical size="large" class="p-4">
    <n-card :bordered="false" class="shadow-sm">
      <n-form inline :model="searchParams" label-placement="left">
        <n-form-item label="姓名/手机号">
          <n-input v-model:value="searchParams.keyword" placeholder="请输入查询关键字" clearable />
        </n-form-item>

        <n-form-item v-if="isPlatformAdmin" label="所属机构">
          <n-select
            v-model:value="searchParams.schoolId"
            :options="schoolOptions"
            placeholder="全部机构"
            clearable
            class="w-48"
            @update:value="handleSearchSchoolChange"
          />
        </n-form-item>

        <n-form-item label="所属班级">
          <n-select
            v-model:value="searchParams.classId"
            :options="searchClassOptions"
            placeholder="全部班级"
            clearable
            class="w-48"
          />
        </n-form-item>

        <n-form-item>
          <n-button type="primary" @click="fetchData">查询</n-button>
          <n-button class="ml-2" @click="resetSearch">重置</n-button>
        </n-form-item>
      </n-form>
    </n-card>

    <n-card title="学员列表" :bordered="false" class="shadow-sm">
      <template #header-extra>
        <n-space>
          <n-button type="primary" @click="openModal('add')">新增学员</n-button>
          <n-button type="info" @click="openImportModal">Excel 批量导入</n-button>
        </n-space>
      </template>

      <n-data-table
        remote
        :loading="loading"
        :columns="columns"
        :data="tableData"
        :pagination="pagination"
        @update:page="handlePageChange"
        @update:page-size="handlePageSizeChange"
      />
    </n-card>

    <n-modal v-model:show="showModal" preset="card" :title="modalType === 'add' ? '新增学员' : '编辑学员资料'" class="w-120">
      <n-form ref="formRef" :model="formModel" :rules="rules" label-placement="left" label-width="100">

        <n-form-item label="手机号" path="phone">
          <n-input v-model:value="formModel.phone" :disabled="modalType === 'edit'" placeholder="输入手机号 (若已注册小程序将自动绑定)" />
        </n-form-item>

        <n-form-item label="姓名" path="name">
          <n-input v-model:value="formModel.name" placeholder="请输入真实姓名" />
        </n-form-item>

        <n-form-item label="身份证号" path="idCard">
          <n-input v-model:value="formModel.idCard" placeholder="请输入身份证号（选填）" />
        </n-form-item>

        <n-divider dashed>归属机构设置</n-divider>

        <n-form-item v-if="isPlatformAdmin" label="所属机构" path="schoolId">
          <n-select
            v-model:value="formModel.schoolId"
            :options="schoolOptions"
            placeholder="请选择目标机构"
            clearable
            @update:value="handleFormSchoolChange"
          />
        </n-form-item>

        <n-form-item label="所属班级" path="classId">
          <n-select
            v-model:value="formModel.classId"
            :options="formClassOptions"
            placeholder="请选择归属班级"
            :disabled="isPlatformAdmin && !formModel.schoolId"
          />
        </n-form-item>

        <n-alert v-if="modalType === 'add'" type="info" class="mt-2" :show-icon="false">
          <span class="text-xs text-gray-500">注：若该手机号已在系统存在，将自动保留其密码并绑定至所选班级。新用户默认密码为 abc12345。</span>
        </n-alert>
      </n-form>

      <template #footer>
        <n-space justify="end">
          <n-button @click="showModal = false">取消</n-button>
          <n-button type="primary" @click="submitForm" :loading="submitLoading">保存</n-button>
        </n-space>
      </template>
    </n-modal>

    <n-modal v-model:show="showImportModal" preset="card" title="批量导入学员" class="w-120">
      <n-form label-placement="left" label-width="100">
        <n-form-item v-if="isPlatformAdmin" label="目标机构" required>
          <n-select
            v-model:value="importForm.schoolId"
            :options="schoolOptions"
            placeholder="请选择机构"
            @update:value="handleImportSchoolChange"
          />
        </n-form-item>

        <n-form-item label="目标班级" required>
          <n-select
            v-model:value="importForm.classId"
            :options="importClassOptions"
            placeholder="必须选择导入的班级"
            :disabled="isPlatformAdmin && !importForm.schoolId"
          />
        </n-form-item>

        <n-form-item label="上传文件" required>
          <n-upload action="" :custom-request="handleExcelUpload" accept=".xlsx, .xls" :max="1">
            <n-button>选择 Excel 文件</n-button>
          </n-upload>
        </n-form-item>

        <n-alert v-if="importForm.users.length > 0" type="success" class="mt-4">
          成功解析到 {{ importForm.users.length }} 条有效数据！
        </n-alert>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showImportModal = false">取消</n-button>
          <n-button type="primary" :disabled="importForm.users.length === 0 || !importForm.classId" @click="submitImport" :loading="submitLoading">
            确认导入
          </n-button>
        </n-space>
      </template>
    </n-modal>

  </n-space>
</template>

<script setup lang="ts">
import { ref, reactive, h, onMounted, computed } from 'vue';
import { NTag, NSwitch, NButton, NSpace, useMessage, useDialog, NDivider, NAlert } from 'naive-ui';
import type { UploadCustomRequestOptions } from 'naive-ui';
import * as xlsx from 'xlsx';

// 引入全局状态与枚举
import { useAuthStore } from '@/store/modules/auth';
import { RoleCode } from '@muxi/shared';

// 引入 API (需确保你在 api/system.ts 中已经暴露了这些方法)
import {
  fetchUserList,
  createSingleUser, // 🔴 对应后端新建的 C 端纳新接口
  updateUser,
  updateUserStatus,
  resetUserPassword,
  importUsers,
  fetchSchoolList,
  fetchClassList
} from '@/service/api/system';

const message = useMessage();
const dialog = useDialog();
const authStore = useAuthStore();

// ================= 身份判定 =================
const isPlatformAdmin = computed(() => {
  console.log('authStore',authStore.userInfo)
  return authStore.userInfo.roles.some((role) =>
    [RoleCode.SUPER_ADMIN, RoleCode.PLATFORM_ADMIN].includes(role)
  );
});

// ================= 基础状态 =================
const loading = ref(false);
const submitLoading = ref(false);
const tableData = ref([]);
const pagination = reactive({
  page: 1, pageSize: 10, itemCount: 0, showSizePicker: true, pageSizes: [10, 20, 50],
});

// ================= 选项数据池 =================
const schoolOptions = ref<any[]>([]);
// 为了防止搜索栏、表单、导入弹窗的级联互相污染，分别定义下拉选项
const searchClassOptions = ref<any[]>([]);
const formClassOptions = ref<any[]>([]);
const importClassOptions = ref<any[]>([]);

const searchParams = reactive({ keyword: '', schoolId: null, classId: null });

// ================= 表格列定义 =================
const columns = [
  { title: '姓名', key: 'name', width: 120 },
  { title: '手机号/账号', key: 'phone', width: 150 }, // 兼容 phone/account
  { title: '身份证号', key: 'idCard', width: 180 },
  {
    title: '所属班级/机构',
    key: 'classMemberships',
    render(row: any) {
      if (!row.classMemberships || row.classMemberships.length === 0) return h('span', '-');
      return h(NSpace, { size: 'small' }, {
        default: () => row.classMemberships.map((cm: any) =>
          h(NTag, { type: 'info', size: 'small' }, {
            default: () => `${cm.class?.school?.name || '未知机构'} - ${cm.class?.name || '未知班级'}`
          })
        )
      });
    },
  },
  {
    title: '状态',
    key: 'status',
    width: 100,
    render: (row: any) => h(NSwitch, {
      value: row.status === 'ACTIVE',
      onUpdateValue: (val) => handleStatusChange(row, val ? 'ACTIVE' : 'INACTIVE'),
    }),
  },
  {
    title: '操作',
    key: 'actions',
    width: 180,
    render: (row: any) => h(NSpace, null, {
      default: () => [
        h(NButton, { size: 'small', type: 'primary', text: true, onClick: () => openModal('edit', row) }, { default: () => '编辑' }),
        h(NButton, { size: 'small', type: 'warning', text: true, onClick: () => handleResetPwd(row) }, { default: () => '重置密码' }),
      ],
    }),
  },
];

// ================= 初始化与联动加载 =================
async function loadBaseData() {
  if (isPlatformAdmin.value) {
    // 平台管理员：加载所有学校，班级等选择了学校后再加载
    const { data } = await fetchSchoolList({ pageSize: 1000 });
    schoolOptions.value = data?.records?.map((s: any) => ({ label: s.name, value: s.id })) || [];
  } else {
    // 机构管理员：直接加载本机构的所有班级 (后端会自动鉴权过滤)
    const { data } = await fetchClassList({ pageSize: 1000 });
    const classList = data?.records?.map((c: any) => ({ label: c.name, value: c.id })) || [];
    searchClassOptions.value = classList;
    formClassOptions.value = classList;
    importClassOptions.value = classList;
  }
}

// 搜索栏级联
async function handleSearchSchoolChange(schoolId: string) {
  searchParams.classId = null;
  if (!schoolId) { searchClassOptions.value = []; return; }
  const { data } = await fetchClassList({ schoolId, pageSize: 1000 });
  searchClassOptions.value = data?.records?.map((c: any) => ({ label: c.name, value: c.id })) || [];
}

// ================= 数据列表查询 =================
async function fetchData() {
  loading.value = true;
  try {
    const params = {
      page: pagination.page,
      pageSize: pagination.pageSize,
      keyword: searchParams.keyword,
      classId: searchParams.classId,
    };
    const { data } = await fetchUserList(params);
    if (data) {
      tableData.value = data.records || [];
      pagination.itemCount = data.total || 0;
    }
  } finally {
    loading.value = false;
  }
}

function resetSearch() {
  searchParams.keyword = '';
  searchParams.schoolId = null;
  searchParams.classId = null;
  searchClassOptions.value = [];
  pagination.page = 1;
  fetchData();
}

function handlePageChange(page: number) { pagination.page = page; fetchData(); }
function handlePageSizeChange(pageSize: number) { pagination.pageSize = pageSize; pagination.page = 1; fetchData(); }

// ================= 新增/编辑学员 =================
const showModal = ref(false);
const modalType = ref<'add' | 'edit'>('add');
const formRef = ref<any>(null);

const formModel = reactive({
  id: '', phone: '', name: '', idCard: '', schoolId: null, classId: null,
});

const rules = {
  phone: { required: true, message: '手机号不能为空', trigger: 'blur' },
  name: { required: true, message: '姓名不能为空', trigger: 'blur' },
  classId: { required: true, message: '必须选择一个班级', trigger: 'change' },
};

// 表单弹窗内级联
async function handleFormSchoolChange(schoolId: string) {
  formModel.classId = null;
  if (!schoolId) { formClassOptions.value = []; return; }
  const { data } = await fetchClassList({ schoolId, pageSize: 1000 });
  formClassOptions.value = data?.records?.map((c: any) => ({ label: c.name, value: c.id })) || [];
}

function openModal(type: 'add' | 'edit', row?: any) {
  modalType.value = type;
  if (type === 'edit' && row) {
    formModel.id = row.id;
    formModel.phone = row.phone || '';
    formModel.name = row.name || '';
    formModel.idCard = row.idCard || '';

    // 数据回填与反显
    if (row.classMemberships?.length > 0) {
      const activeMember = row.classMemberships.find((m: any) => m.status === 'ACTIVE') || row.classMemberships[0];
      formModel.classId = activeMember.classId;

      if (isPlatformAdmin.value && activeMember.class?.schoolId) {
        formModel.schoolId = activeMember.class.schoolId;
        handleFormSchoolChange(formModel.schoolId).then(() => {
          formModel.classId = activeMember.classId; // 重新赋值防止被清空
        });
      }
    }
  } else {
    Object.assign(formModel, { id: '', phone: '', name: '', idCard: '', schoolId: null, classId: null });
    if (isPlatformAdmin.value) formClassOptions.value = [];
  }
  showModal.value = true;
}

async function submitForm() {
  await formRef.value?.validate();
  submitLoading.value = true;
  try {
    const payload = {
      phone: formModel.phone,
      name: formModel.name,
      idCard: formModel.idCard,
      classId: formModel.classId,
    };

    if (modalType.value === 'add') {
      await createSingleUser(payload); // 🔴 调用 C 端纳新融合接口
      message.success('录入成功！');
    } else {
      await updateUser(formModel.id, payload);
      message.success('修改成功！');
    }
    showModal.value = false;
    fetchData();
  } finally {
    submitLoading.value = false;
  }
}

// ================= 批量导入逻辑 =================
const showImportModal = ref(false);
const importForm = reactive({ schoolId: null, classId: null, users: [] as any[] });

async function handleImportSchoolChange(schoolId: string) {
  importForm.classId = null;
  if (!schoolId) { importClassOptions.value = []; return; }
  const { data } = await fetchClassList({ schoolId, pageSize: 1000 });
  importClassOptions.value = data?.records?.map((c: any) => ({ label: c.name, value: c.id })) || [];
}

function openImportModal() {
  importForm.schoolId = null;
  importForm.classId = null;
  importForm.users = [];
  if (isPlatformAdmin.value) importClassOptions.value = [];
  showImportModal.value = true;
}

function handleExcelUpload({ file }: UploadCustomRequestOptions) {
  if (!file.file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook = xlsx.read(data, { type: 'array' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = xlsx.utils.sheet_to_json(worksheet);

      importForm.users = json
        .map((item: any) => ({
          name: String(item['姓名'] || '').trim(),
          phone: String(item['手机号'] || '').trim(),
          idCard: String(item['身份证'] || '').trim(),
        }))
        .filter((item: any) => item.phone && item.name);

      message.success(`解析成功！共提取了 ${importForm.users.length} 条有效数据`);
    } catch (err) {
      message.error('文件解析失败，请检查 Excel 格式');
    }
  };
  reader.readAsArrayBuffer(file.file);
}

async function submitImport() {
  submitLoading.value = true;
  try {
    await importUsers({ classId: importForm.classId, users: importForm.users });
    message.success('批量导入处理成功！');
    showImportModal.value = false;
    fetchData();
  } finally {
    submitLoading.value = false;
  }
}

// ================= 快捷操作 =================
async function handleStatusChange(row: any, newStatus: 'ACTIVE' | 'INACTIVE') {
  try {
    await updateUserStatus(row.id, newStatus);
    row.status = newStatus;
    message.success('状态更新成功');
  } catch (error) { /* 恢复原状态由 NaiveUI 自动处理 */ }
}

function handleResetPwd(row: any) {
  dialog.warning({
    title: '重置密码确认',
    content: `确定要将学员【${row.name || row.phone}】的密码重置为 abc12345 吗？`,
    positiveText: '确定重置',
    onPositiveClick: async () => {
      await resetUserPassword(row.id);
      message.success('密码重置成功');
    },
  });
}

onMounted(() => {
  loadBaseData();
  fetchData();
});
</script>

<style scoped>
.w-120 { width: 30rem; }
</style>
