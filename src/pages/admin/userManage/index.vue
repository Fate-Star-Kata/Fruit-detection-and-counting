<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { Motion } from 'motion-v'
import { ElMessage } from 'element-plus'
import { cloneDeep } from 'lodash-es'
import type { User, UserQueryParams } from '@/types/components/admin'
import UserSearchForm from '@/components/pages/admin/userManage/UserSearchForm.vue'
import UserTable from '@/components/pages/admin/userManage/UserTable.vue'
import UserPagination from '@/components/pages/admin/userManage/UserPagination.vue'
import EditUserDialog from '@/components/pages/admin/userManage/EditUserDialog.vue'
import AddUserDialog from '@/components/pages/admin/userManage/AddUserDialog.vue'
import {
  getUsersAPI,
  userDetailAPI,
  deleteUserAPI
} from '@/api/admin/users'
import { useUserStore } from '@/stores/auth/user'

// 动画配置
const pageVariants = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: 'easeOut' }
}

// Store
const userStore = useUserStore()

// 响应式数据
const loading = ref(false)
const list = ref<User[]>([])
const total = ref(0)
const editDialogVisible = ref(false)
const addDialogVisible = ref(false)
const currentEditUser = ref<User | null>(null)
const isAdd = ref(false)

// 查询参数
const params = reactive<UserQueryParams>({
  query: '',
  page: 1,
  page_size: 10
})

// 计算属性
const userId = computed(() => userStore.userInfo?.user_id)

// 获取用户列表
const getList = async () => {
  try {
    loading.value = true
    const res = await getUsersAPI(params)
    list.value = res.data.users
    total.value = res.data.total
  } catch (error) {
    console.error('获取数据失败:', error)
    ElMessage.error('获取用户列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = (query: string) => {
  params.query = query
  params.page = 1
  getList()
}

// 重置参数
const handleReset = () => {
  params.page = 1
  params.query = ''
  getList()
}

// 添加用户
const handleAdd = () => {
  addDialogVisible.value = true
}

// 查看用户详情
const detail = async (id: number) => {
  try {
    const res = await userDetailAPI(id)
    console.log('用户详情:', res)
    ElMessage.success('查看用户详情成功')
  } catch (error) {
    console.error('获取用户详情失败:', error)
    ElMessage.error('获取用户详情失败')
  }
}

// 编辑用户
const handleEdit = (id: number) => {
  const user = list.value.find(item => item.id === id)
  if (user) {
    currentEditUser.value = cloneDeep(user)
    editDialogVisible.value = true
  }
}

// 编辑成功回调
const handleEditSuccess = () => {
  getList()
}

// 添加成功回调
const handleAddSuccess = () => {
  getList()
}



// 删除用户
const handleDelete = async (id: number) => {
  try {
    const res = await deleteUserAPI(id)
    ElMessage.success(res.msg || '删除成功')
    getList()
  } catch (error) {
    console.error('删除数据失败:', error)
    ElMessage.error('删除失败')
  }
}

// 分页处理
const handleSizeChange = (size: number) => {
  params.page_size = size
  params.page = 1
  getList()
}

const handlePageChange = (page: number) => {
  params.page = page
  getList()
}

// 行点击事件
const handleRowClick = (row: User) => {
  // 可以在这里添加行点击逻辑
}

// 组件挂载时获取数据
onMounted(() => {
  getList()
})
</script>

<template>
  <!-- @vue-ignore -->
  <Motion :initial="pageVariants.initial" :animate="pageVariants.animate" :transition="pageVariants.transition"
    class="user-manage h-full overflow-y-auto">
    <el-card>
      <!-- 搜索和操作区域 -->
      <Motion :initial="{ opacity: 0, y: -20 }" :animate="{ opacity: 1, y: 0 }"
        :transition="{ duration: 0.5, delay: 0.1 }">
        <UserSearchForm 
          :query="params.query"
          :loading="loading"
          @search="handleSearch"
          @reset="handleReset"
          @add="handleAdd"
        />
      </Motion>

      <!-- 表格区域 -->
      <Motion :initial="{ opacity: 0, y: 20 }" :animate="{ opacity: 1, y: 0 }"
        :transition="{ duration: 0.6, delay: 0.2 }">
        <UserTable 
          :user-list="list"
          :loading="loading"
          :current-page="params.page"
          :page-size="params.page_size"
          :current-user-id="userId"
          @row-click="handleRowClick"
          @edit="handleEdit"
          @delete="handleDelete"
        />
      </Motion>

      <!-- 分页区域 -->
      <Motion :initial="{ opacity: 0, y: 20 }" :animate="{ opacity: 1, y: 0 }"
        :transition="{ duration: 0.5, delay: 0.3 }">
        <UserPagination 
          :current-page="params.page"
          :page-size="params.page_size"
          :total="total"
          :loading="loading"
          @page-change="handlePageChange"
          @size-change="handleSizeChange"
        />
      </Motion>
    </el-card>

    <!-- 编辑用户弹窗 -->
    <EditUserDialog v-model:visible="editDialogVisible" :user-data="currentEditUser" @success="handleEditSuccess" />

    <!-- 添加用户弹窗 -->
    <AddUserDialog v-model:visible="addDialogVisible" @success="handleAddSuccess" />
  </Motion>
</template>

<style scoped lang="scss">
.user-manage {
  .user-table {
    :deep(.el-table__row) {
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }
    }

    :deep(.el-table__header) {
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
    }
  }

  .el-card {
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);

    :deep(.el-card__body) {
      padding: 24px;
    }
  }

  .el-button {
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
  }

  .el-tag {
    transition: all 0.3s ease;

    &:hover {
      transform: scale(1.05);
    }
  }
}
</style>
