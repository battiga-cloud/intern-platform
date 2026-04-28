<template>
  <n-space vertical size="large" class="p-4">
    <n-card title="学校/机构管理" :bordered="false" class="shadow-sm">
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

    <n-modal v-model:show="showModal" preset="card" :title="modalType === 'add' ? '新增学校' : '维护学校信息'" class="w-200">
      <n-form ref="formRef" :model="formModel" :rules="rules" label-placement="left" label-width="100">
        <n-tabs type="line" animated>
          <n-tab-pane name="basic" tab="基础信息">
            <div class="py-4">
              <n-grid :cols="2" :x-gap="12">
                <n-form-item-gi label="学校名称" path="name">
                  <n-input v-model:value="formModel.name" placeholder="请输入完整全称" />
                </n-form-item-gi>
                <n-form-item-gi label="学校简称" path="shortName">
                  <n-input v-model:value="formModel.shortName" placeholder="如：东理工" />
                </n-form-item-gi>
              </n-grid>
              <n-form-item label="学校LOGO" path="logo">
                <n-input v-model:value="formModel.logo" placeholder="请输入图片URL" />
              </n-form-item>
              <n-form-item label="学校简介" path="description">
                <n-input v-model:value="formModel.description" type="textarea" placeholder="简短介绍..." />
              </n-form-item>
              <n-divider dashed title-placement="left">联系信息</n-divider>
              <n-grid :cols="2" :x-gap="12">
                <n-form-item-gi label="负责人" path="contactName">
                  <n-input v-model:value="formModel.contactName" />
                </n-form-item-gi>
                <n-form-item-gi label="联系电话" path="phone">
                  <n-input v-model:value="formModel.phone" />
                </n-form-item-gi>
              </n-grid>
              <n-form-item label="详细地址" path="address">
                <n-input v-model:value="formModel.address" />
              </n-form-item>
            </div>
          </n-tab-pane>

          <n-tab-pane name="promo" tab="招聘宣传配置">
            <div class="py-4">
              <n-form-item label="展现形式">
                <n-radio-group v-model:value="formModel.promoType">
                  <n-radio value="RICH_TEXT">富文本编辑器</n-radio>
                  <n-radio value="EXTERNAL_LINK">外部 H5 链接</n-radio>
                </n-radio-group>
              </n-form-item>

              <n-form-item v-if="formModel.promoType === 'EXTERNAL_LINK'" label="H5链接">
                <n-input v-model:value="formModel.promoUrl" placeholder="https://" />
              </n-form-item>

              <n-form-item v-else label="图文内容">
                <WangeEditor
                  v-model="formModel.promoContent"
                  :visible="formModel.promoType === 'RICH_TEXT'"
                />
              </n-form-item>
            </div>
          </n-tab-pane>
        </n-tabs>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showModal = false">取消</n-button>
          <n-button type="primary" :loading="submitLoading" @click="handleSubmit">确认保存</n-button>
        </n-space>
      </template>
    </n-modal>

    <n-drawer v-model:show="showAdminDrawer" :width="500">
      <n-drawer-content :title="`管理团队 - ${currentSchool?.name}`" closable>
        <template #header-extra>
          <n-button type="primary" size="small" @click="showAddAdminModal = true">分配新账号</n-button>
        </template>
        <n-list hoverable clickable>
          <n-list-item v-for="user in schoolAdmins" :key="user.id">
            <n-thing :title="user.name || '未命名'" :description="`账号: ${user.account}`" />
            <template #suffix><n-tag type="info" size="small">学校管理员</n-tag></template>
          </n-list-item>
        </n-list>
      </n-drawer-content>
    </n-drawer>

    <n-modal v-model:show="showAddAdminModal" preset="card" title="开通学校管理员" class="w-100">
      <n-form label-placement="left" label-width="80">
        <n-form-item label="姓名" required><n-input v-model:value="adminForm.name" /></n-form-item>
        <n-form-item label="登录账号" required><n-input v-model:value="adminForm.account" placeholder="通常为手机号" /></n-form-item>
        <n-form-item label="初始密码"><n-input v-model:value="adminForm.password" placeholder="默认 admin123" /></n-form-item>
      </n-form>
      <template #footer>
        <n-button block type="primary" @click="handleAddAdmin">确认开通并绑定</n-button>
      </template>
    </n-modal>
  </n-space>
</template>

<script setup lang="ts">
import { ref, reactive, h, onMounted } from 'vue';
import {
  NButton, NSpace, NSwitch, NTabs, NTabPane, NGrid, NFormItemGi, NDivider,
  NRadioGroup, NRadio, NDrawer, NDrawerContent, NList, NListItem, NThing, NTag,
  useMessage, useDialog
} from 'naive-ui';
import { RoleCode } from '@muxi/shared';
import WangeEditor from '@/components/wange-editor.vue';
import {
  fetchSchoolList, createSchool, updateSchool, updateSchoolStatus, deleteSchool,
  fetchUserList, createAdminUser, fetchRoleList
} from '@/service/api/system';

const message = useMessage();
const dialog = useDialog();

// ========== 页面状态 ==========
const loading = ref(false);
const submitLoading = ref(false);
const tableData = ref<Api.System.School[]>([]);
const pagination = reactive({ page: 1, pageSize: 10, itemCount: 0 });
const searchParams = reactive({ keyword: '' });

// ========== 列定义 ==========
const columns = [
  { title: '学校名称', key: 'name', width: 220 },
  { title: '简称', key: 'shortName', width: 120 },
  { title: '负责人', key: 'contactName', width: 120 },
  { title: '状态', key: 'status', width: 100, render: (row: any) => h(NSwitch, {
    value: row.status === 'ACTIVE',
    onUpdateValue: async (val) => {
      await updateSchoolStatus(row.id, val ? 'ACTIVE' : 'INACTIVE');
      row.status = val ? 'ACTIVE' : 'INACTIVE';
      message.success('状态已同步');
    }
  })},
  { title: '操作', key: 'actions', width: 220, render: (row: any) => h(NSpace, null, {
    default: () => [
      h(NButton, { size: 'small', type: 'primary', text: true, onClick: () => openModal('edit', row) }, { default: () => '维护信息' }),
      h(NButton, { size: 'small', type: 'info', text: true, onClick: () => openAdminManager(row) }, { default: () => '管理团队' }),
      h(NButton, { size: 'small', type: 'error', text: true, onClick: () => handleDelete(row) }, { default: () => '删除' }),
    ]
  })}
];

// ========== 逻辑处理 ==========
async function fetchData() {
  loading.value = true;
  try {
    const { data } = await fetchSchoolList({ ...searchParams, ...pagination } as Api.System.SchoolQueryDto);
    tableData.value = data?.records || [];
    pagination.itemCount = data?.total || 0;
  } finally { loading.value = false; }
}

const showModal = ref(false);
const modalType = ref<'add' | 'edit'>('add');
const formRef = ref<any>(null);
const formModel = reactive({
  id: '', name: '', shortName: '', logo: '', description: '',
  contactName: '', phone: '', address: '',
  promoType: 'RICH_TEXT', promoUrl: '', promoContent: ''
});



// ========== 管理团队管理 ==========
const showAdminDrawer = ref(false);
const currentSchool = ref<any>(null);
const schoolAdmins = ref<Api.System.User[]>([]);
const showAddAdminModal = ref(false);
const adminForm = reactive({ name: '', account: '', password: 'admin123' });

async function openAdminManager(school: any) {
  currentSchool.value = school;
  const { data } = await fetchUserList({ schoolId: school.id, pageSize: 100 });
  schoolAdmins.value = data?.records || [];
  showAdminDrawer.value = true;
}

function openModal(type: 'add' | 'edit', row?: any) {
  modalType.value = type;
  if (type === 'edit' && row) {
    Object.assign(formModel, row);
    if (!formModel.promoType) formModel.promoType = 'RICH_TEXT';
  } else {
    Object.assign(formModel, { id: '', name: '', shortName: '', logo: '', description: '', contactName: '', phone: '', address: '', promoType: 'RICH_TEXT', promoUrl: '', promoContent: '' });
  }
  showModal.value = true;
}

async function handleSubmit() {
  await formRef.value?.validate();
  submitLoading.value = true;
  try {
    const payload = { ...formModel };
    if (payload.promoType === 'RICH_TEXT') payload.promoUrl = '';
    if (payload.promoType === 'EXTERNAL_LINK') payload.promoContent = '';

    if (modalType.value === 'add') await createSchool(payload);
    else await updateSchool(formModel.id, payload);

    message.success('保存成功');
    showModal.value = false;
    fetchData();
  } finally { submitLoading.value = false; }
}

async function handleAddAdmin() {
  // 🔴 逻辑补充：先获取 SCHOOL_ADMIN 的角色 ID
  const { data: roleData } = await fetchRoleList();
  const targetRole = roleData?.find((r: any) => r.code === RoleCode.SCHOOL_ADMIN);

  if (!targetRole) return message.error('系统未配置学校管理员角色');

  await createAdminUser({
    ...adminForm,
    manageSchoolId: currentSchool.value.id,
    roleIds: [targetRole.id]
  });

  message.success('账号开通成功');
  showAddAdminModal.value = false;
  openAdminManager(currentSchool.value);
}

const handlePageChange = (p: number) => { pagination.page = p; fetchData(); };
const resetSearch = () => { searchParams.keyword = ''; fetchData(); };
const handleDelete = (row: any) => dialog.error({ title: '确认删除？', content: `将永久删除 ${row.name}`, onPositiveClick: async () => { await deleteSchool(row.id); fetchData(); }});

onMounted(() => fetchData());
</script>

<style scoped>
.w-200 { width: 50rem; }
.w-100 { width: 25rem; }
</style>
