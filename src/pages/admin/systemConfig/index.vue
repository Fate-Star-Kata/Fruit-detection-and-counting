<script setup lang="ts">
import { ref } from 'vue'
import { Motion } from 'motion-v'
import EmailConfig from 'components/pages/admin/systemConfig/EmailConfig.vue'

// 动画配置
const pageVariants = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: 'easeOut' }
}

// 响应式数据
const activeTab = ref('emailConfig')

// 标签页配置
const tabList = [
  {
    key: 'emailConfig',
    label: '邮箱配置',
    icon: 'Message'
  }
]

// 切换标签页
const handleTabChange = (tabKey: string) => {
  activeTab.value = tabKey
}
</script>

<template>
  <!-- @vue-ignore -->
  <Motion :initial="pageVariants.initial" :animate="pageVariants.animate" :transition="pageVariants.transition"
    class="system-config h-full overflow-y-auto">
    <el-card>
      <!-- 标签页头部 -->
      <Motion :initial="{ opacity: 0, y: -20 }" :animate="{ opacity: 1, y: 0 }"
        :transition="{ duration: 0.5, delay: 0.1 }">
        <el-tabs v-model="activeTab" @tab-change="handleTabChange" class="config-tabs">
          <el-tab-pane v-for="tab in tabList" :key="tab.key" :label="tab.label" :name="tab.key">
            <template #label>
              <el-space>
                <el-icon>
                  <component :is="tab.icon" />
                </el-icon>
                <span>{{ tab.label }}</span>
              </el-space>
            </template>
          </el-tab-pane>
        </el-tabs>
      </Motion>

      <!-- 配置内容区域 -->
      <Motion :initial="{ opacity: 0, y: 20 }" :animate="{ opacity: 1, y: 0 }"
        :transition="{ duration: 0.6, delay: 0.2 }" class="config-content">
        <!-- 邮箱配置 -->
        <EmailConfig v-if="activeTab === 'emailConfig'" />
      </Motion>
    </el-card>
  </Motion>
</template>

<style scoped lang="scss">
.system-config {
  .el-card {
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);

    :deep(.el-card__body) {
      padding: 24px;
    }
  }

  .config-tabs {
    :deep(.el-tabs__header) {
      margin-bottom: 24px;
      border-bottom: 2px solid #f0f2f5;
    }

    :deep(.el-tabs__nav-wrap) {
      &::after {
        display: none;
      }
    }

    :deep(.el-tabs__item) {
      font-size: 16px;
      font-weight: 500;
      padding: 0 24px;
      height: 48px;
      line-height: 48px;
      transition: all 0.3s ease;

      &:hover {
        color: var(--el-color-primary);
        transform: translateY(-2px);
      }

      &.is-active {
        color: var(--el-color-primary);
        font-weight: 600;
      }
    }

    :deep(.el-tabs__active-bar) {
      height: 3px;
      border-radius: 2px;
      background: linear-gradient(90deg, var(--el-color-primary), var(--el-color-primary-light-3));
    }
  }

  .config-content {
    min-height: 400px;
  }
}
</style>