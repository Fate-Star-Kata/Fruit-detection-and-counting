<template>
  <div class="user-table-wrapper relative">
    <!-- 加载蒙层 -->
    <div v-if="loading" class="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center z-10 rounded-lg">
      <div class="flex flex-col items-center">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
        <span class="text-sm text-gray-600">数据加载中...</span>
      </div>
    </div>
    
    <el-table 
      :data="userList" 
      v-loading="loading" 
      border 
      stripe 
      class="user-table" 
      @row-click="handleRowClick"
    >
      <el-table-column label="序号" width="80" align="center">
        <template #default="{ $index }">
          {{ (currentPage - 1) * pageSize + $index + 1 }}
        </template>
      </el-table-column>

      <el-table-column label="用户名" prop="username" min-width="120">
        <template #default="{ row }">
          <span type="primary">
            {{ row.username }}
          </span>
        </template>
      </el-table-column>

      <el-table-column label="邮箱" prop="email" min-width="180">
        <template #default="{ row }">
          <span>{{ row.email }}</span>
        </template>
      </el-table-column>

      <el-table-column label="状态" prop="is_active" width="120" align="center">
        <template #default="{ row }">
          <el-tag :type="row.is_active ? 'success' : 'danger'" size="small">
            {{ row.is_active ? '启用' : '停用' }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column label="工作人员权限" prop="is_staff" width="140" align="center">
        <template #default="{ row }">
          <el-tag :type="row.is_staff ? 'success' : 'info'" size="small">
            {{ row.is_staff ? '是' : '否' }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column label="超级管理员权限" prop="is_superuser" width="160" align="center">
        <template #default="{ row }">
          <el-tag :type="row.is_superuser ? 'warning' : 'info'" size="small">
            {{ row.is_superuser ? '是' : '否' }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column label="操作" width="200" align="center" fixed="right">
        <template #default="{ row }">
          <el-space>
            <Motion :whileHover="{ scale: 1.1 }" :whileTap="{ scale: 0.9 }">
              <el-button 
                type="primary" 
                size="small" 
                :disabled="currentUserId === row.id || loading" 
                @click="handleEdit(row.id)"
              >
                <el-icon>
                  <Edit />
                </el-icon>
                编辑
              </el-button>
            </Motion>
            <Motion :whileHover="{ scale: 1.1 }" :whileTap="{ scale: 0.9 }">
              <el-popconfirm 
                v-if="currentUserId !== row.id" 
                title="确认删除吗?" 
                confirm-button-text="确认"
                cancel-button-text="取消" 
                @confirm="handleDelete(row.id)"
              >
                <template #reference>
                  <el-button type="danger" size="small" :disabled="loading">
                    <el-icon>
                      <Delete />
                    </el-icon>
                    删除
                  </el-button>
                </template>
              </el-popconfirm>
            </Motion>
          </el-space>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { Motion } from 'motion-v'
import { Edit, Delete } from '@element-plus/icons-vue'
import type { User } from '@/types/components/admin'

// Props
const props = defineProps({
  userList: {
    type: Array as () => User[],
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  currentPage: {
    type: Number,
    default: 1
  },
  pageSize: {
    type: Number,
    default: 10
  },
  currentUserId: {
    type: Number,
    default: null
  }
})

// Emits
const emit = defineEmits(['row-click', 'edit', 'delete'])

// 事件处理
const handleRowClick = (row: User) => {
  emit('row-click', row)
}

const handleEdit = (id: number) => {
  emit('edit', id)
}

const handleDelete = (id: number) => {
  emit('delete', id)
}
</script>

<style scoped lang="scss">
.user-table-wrapper {
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