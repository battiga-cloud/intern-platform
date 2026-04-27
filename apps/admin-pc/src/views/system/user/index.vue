<template>
  <n-space vertical size="large" class="p-4">
    <n-card :bordered="false" class="shadow-sm">
      <n-form inline :model="searchParams" label-placement="left">
        <n-form-item label="姓名/手机号">
          <n-input v-model:value="searchParams.keyword" placeholder="请输入查询关键字" clearable />
        </n-form-item>
        <n-form-item label="所属班级">
          <n-select
            v-model:value="searchParams.classId"
            :options="classOptions"
            placeholder="请选择班级"
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

    <n-card title="用户列表" :bordered="false" class="shadow-sm">
      <template #header-extra>
        <n-space>
          <n-button type="primary" @click="openAddModal">新增用户</n-button>
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

    <n-modal v-model:show="showImportModal" preset="card" title="批量导入学生" class="w-120">
      <n-form label-placement="left" label-width="120">
        <n-form-item label="选择目标班级" required>
          <n-select v-model:value="importForm.classId" :options="classOptions" placeholder="必须选择导入的班级" />
        </n-form-item>
        <n-form-item label="上传 Excel 数据" required>
          <n-upload action="" :custom-request="handleExcelUpload" accept=".xlsx, .xls" :max="1">
            <n-button>点击选择文件</n-button>
          </n-upload>
        </n-form-item>

        <n-alert v-if="importForm.users.length > 0" type="success" class="mt-4">
          成功解析到 {{ importForm.users.length }} 条待导入数据！
        </n-alert>

        <p class="text-gray-400 text-xs mt-4">
          注：Excel 表头必须包含“姓名”、“手机号”（可选“身份证”）。<br/>
          手机号如果已注册系统，将自动绑定到该班级；未注册则自动开通账号，初始密码为 abc12345。
        </p>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showImportModal = false">取消</n-button>
          <n-button type="primary" :disabled="importForm.users.length === 0" @click="submitImport" :loading="submitLoading">
            确认导入
          </n-button>
        </n-space>
      </template>
    </n-modal>

    <n-modal v-model:show="showEditModal" preset="card" title="编辑学员资料" class="w-120">
      <n-form ref="editFormRef" :model="editForm" label-placement="left" label-width="100">
        <n-form-item label="手机号" path="phone">
          <n-input v-model:value="editForm.phone" disabled placeholder="手机号作为账号不可修改" />
        </n-form-item>
        <n-form-item label="姓名" path="name" required>
          <n-input v-model:value="editForm.name" placeholder="请输入真实姓名" />
        </n-form-item>
        <n-form-item label="身份证号" path="idCard">
          <n-input v-model:value="editForm.idCard" placeholder="请输入身份证号（选填）" />
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showEditModal = false">取消</n-button>
          <n-button type="primary" @click="submitEdit" :loading="submitLoading">保存修改</n-button>
        </n-space>
      </template>
    </n-modal>

  </n-space>
</template>

<script setup lang="ts">
import { ref, reactive, h, onMounted } from 'vue';
import { NTag, NSwitch, NButton, NSpace, useMessage, useDialog } from 'naive-ui';
import type { UploadCustomRequestOptions } from 'naive-ui';
import * as xlsx from 'xlsx';

// 引入刚刚封装的 API
import {
  fetchUserList,
  importUsers,
  updateUserStatus,
  resetUserPassword,
  updateUser
} from '@/service/api/system';

const message = useMessage();
const dialog = useDialog();

// ================= 状态定义 =================
const loading = ref(false);
const submitLoading = ref(false);
const tableData = ref([]);
const pagination = reactive({
  page: 1,
  pageSize: 10,
  itemCount: 0,
  showSizePicker: true,
  pageSizes: [10, 20, 50],
});

const searchParams = reactive({
  keyword: '',
  classId: null,
});

// TODO: 后续可调用获取班级列表接口替换此处静态数据
const classOptions = ref([
  { label: '计科 2201 班', value: 'class-01' },
  { label: '软件工程 2202 班', value: 'class-02' },
]);

// ================= 表格列定义 =================
const columns = [
  { title: '姓名', key: 'name', width: 120 },
  { title: '手机号', key: 'phone', width: 150 },
  { title: '身份证号', key: 'idCard', width: 180 },
  {
    title: '所属班级/机构',
    key: 'classMemberships',
    render(row: any) {
      if (!row.classMemberships || row.classMemberships.length === 0) return h('span', '-');
      return row.classMemberships.map((cm: any) =>
        h(NTag, { type: 'info', size: 'small', class: 'mr-1 mb-1' }, { default: () => cm.class?.name || '未知机构' })
      );
    },
  },
  {
    title: '状态',
    key: 'status',
    width: 100,
    render(row: any) {
      return h(NSwitch, {
        value: row.status === 'ACTIVE',
        onUpdateValue: (val) => handleStatusChange(row, val ? 'ACTIVE' : 'INACTIVE'),
      });
    },
  },
  {
    title: '操作',
    key: 'actions',
    width: 180,
    render(row: any) {
      return h(NSpace, null, {
        default: () => [
          h(NButton, { size: 'small', type: 'primary', text: true, onClick: () => openEditModal(row) }, { default: () => '编辑' }),
          h(NButton, { size: 'small', type: 'warning', text: true, onClick: () => handleResetPwd(row) }, { default: () => '重置密码' }),
        ],
      });
    },
  },
];

// ================= 1. 数据列表查询 =================
async function fetchData() {
  loading.value = true;
  try {
    // 组装查询参数
    const params = {
      page: pagination.page,
      pageSize: pagination.pageSize,
      account: searchParams.keyword, // 可以将 keyword 映射到 account 或 phone
    };

    const { data } = await fetchUserList(params);
    if (data) {
      tableData.value = data.records || [];
      pagination.itemCount = data.total || 0;
    }
  } catch (error) {
    // 错误通常已被底层拦截器提示，此处可留空或做日志
  } finally {
    loading.value = false;
  }
}

function resetSearch() {
  searchParams.keyword = '';
  searchParams.classId = null;
  pagination.page = 1;
  fetchData();
}

function handlePageChange(page: number) {
  pagination.page = page;
  fetchData();
}

function handlePageSizeChange(pageSize: number) {
  pagination.pageSize = pageSize;
  pagination.page = 1;
  fetchData();
}

// ================= 2. 状态切换与重置密码 =================
async function handleStatusChange(row: any, newStatus: 'ACTIVE' | 'INACTIVE') {
  try {
    await updateUserStatus(row.id, newStatus);
    row.status = newStatus;
    message.success('状态更新成功');
  } catch (error) {
    // 恢复原来的状态
  }
}

function handleResetPwd(row: any) {
  dialog.warning({
    title: '重置密码确认',
    content: `确定要将学员【${row.name || row.phone}】的密码重置为 abc12345 吗？`,
    positiveText: '确定重置',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        await resetUserPassword(row.id);
        message.success('密码重置成功');
      } catch (error) {}
    },
  });
}

// ================= 3. 编辑学员信息 =================
const showEditModal = ref(false);
const editFormRef = ref<any>(null);
const editForm = reactive({
  id: '',
  phone: '',
  name: '',
  idCard: '',
});

function openEditModal(row: any) {
  editForm.id = row.id;
  editForm.phone = row.phone || '';
  editForm.name = row.name || '';
  editForm.idCard = row.idCard || '';
  showEditModal.value = true;
}

async function submitEdit() {
  if (!editForm.name) {
    message.error('姓名不能为空');
    return;
  }

  submitLoading.value = true;
  try {
    await updateUser(editForm.id, {
      name: editForm.name,
      idCard: editForm.idCard
    });
    message.success('资料更新成功');
    showEditModal.value = false;
    fetchData(); // 刷新表格
  } catch (error) {
  } finally {
    submitLoading.value = false;
  }
}

function openAddModal() {
  // 新增逻辑：通常复用 EditModal，这里清空 ID 即可，暂略
  message.info('可以复用编辑弹窗来实现新增');
}

// ================= 4. 批量导入逻辑 =================
const showImportModal = ref(false);
const importForm = reactive({
  classId: null,
  users: [] as any[],
});

function openImportModal() {
  importForm.classId = null;
  importForm.users = [];
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

      // 字段映射
      importForm.users = json
        .map((item: any) => ({
          name: String(item['姓名'] || '').trim(),
          phone: String(item['手机号'] || '').trim(),
          idCard: String(item['身份证'] || '').trim(),
        }))
        .filter((item: any) => item.phone && item.name); // 过滤掉无效行

      message.success(`解析成功！共提取了 ${importForm.users.length} 条有效数据`);
    } catch (err) {
      message.error('文件解析失败，请检查 Excel 格式');
    }
  };
  reader.readAsArrayBuffer(file.file);
}

async function submitImport() {
  if (!importForm.classId) {
    message.warning('请先选择目标班级');
    return;
  }

  submitLoading.value = true;
  try {
    await importUsers({
      classId: importForm.classId,
      users: importForm.users
    });
    message.success('批量导入成功！');
    showImportModal.value = false;
    fetchData();
  } catch (error) {
  } finally {
    submitLoading.value = false;
  }
}

// ================= 初始化 =================
onMounted(() => {
  fetchData();
});
</script>

<style scoped>
.w-120 {
  width: 30rem;
}
</style>
