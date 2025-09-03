<script setup lang="ts">
import { Motion } from 'motion-v'
import { Refresh } from '@element-plus/icons-vue'
import { ref } from 'vue'
const loading = ref(false)

// 动画配置
const cardVariants = {
  initial: { opacity: 0, y: 30, scale: 0.95 },
  animate: { opacity: 1, y: 0, scale: 1 },
  whileHover: {
    scale: 1.02,
    y: -5,
    transition: { duration: 0.2, ease: ['easeOut'] }
  },
  transition: { duration: 0.4, ease: ['easeOut'] }
}

const statsCardVariants = {
  initial: { opacity: 0, y: 40, scale: 0.9 },
  animate: { opacity: 1, y: 0, scale: 1 },
  whileHover: {
    scale: 1.05,
    y: -8,
    transition: { duration: 0.3, ease: ['easeOut'] }
  },
  transition: { duration: 0.5, ease: ['easeOut'] }
}

const iconVariants = {
  initial: { scale: 0, rotate: -180 },
  animate: { scale: 1, rotate: 0 },
  whileHover: {
    scale: 1.2,
    rotate: 10,
    transition: { duration: 0.2, ease: ['easeOut'] }
  },
  transition: { duration: 0.6, delay: 0.3, ease: ['easeOut'] }
}
</script>

<template>
  <div class="dashboard">
    <!-- 仪表板页面 -->
    <Motion :initial="cardVariants.initial" :animate="cardVariants.animate" :whileHover="cardVariants.whileHover as any"
      :transition="{ ...cardVariants.transition, delay: 0.3 } as any">
      <el-card class="mb-6">
        <template #header>
          <div class="flex items-center justify-between">
            <span class="text-lg font-medium">仪表板</span>
            <Motion :initial="{ scale: 0.8, opacity: 0 }" :animate="{ scale: 1, opacity: 1 }"
              :whileHover="{ scale: 1.05 }" :transition="{ duration: 0.3, delay: 0.5 }">
              <el-button type="primary" :icon="Refresh" :loading="loading" circle @click="null" />
            </Motion>
          </div>
        </template>

        <!-- 统计卡片 -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">

          <Motion :initial="statsCardVariants.initial" :animate="statsCardVariants.animate"
            :whileHover="statsCardVariants.whileHover as any"
            :transition="{ ...statsCardVariants.transition, delay: 0.4 } as any"
            class="bg-blue-50 p-6 rounded-lg cursor-pointer">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-blue-600 text-sm font-medium">总用户数</p>
                <Motion :initial="{ opacity: 0, y: 10 }" :animate="{ opacity: 1, y: 0 }"
                  :transition="{ duration: 0.4, delay: 0.6 }">
                  <p class="text-2xl font-bold text-blue-900">1,234</p>
                </Motion>
              </div>
              <Motion :initial="iconVariants.initial" :animate="iconVariants.animate"
                :whileHover="iconVariants.whileHover as any"
                :transition="{ ...iconVariants.transition, delay: 0.5 } as any" class="text-blue-500">
                <el-icon size="32">
                  <User />
                </el-icon>
              </Motion>
            </div>
          </Motion>

          <Motion :initial="statsCardVariants.initial" :animate="statsCardVariants.animate"
            :whileHover="statsCardVariants.whileHover as any"
            :transition="{ ...statsCardVariants.transition, delay: 0.5 } as any"
            class="bg-green-50 p-6 rounded-lg cursor-pointer">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-green-600 text-sm font-medium">今日订单</p>
                <Motion :initial="{ opacity: 0, y: 10 }" :animate="{ opacity: 1, y: 0 }"
                  :transition="{ duration: 0.4, delay: 0.7 }">
                  <p class="text-2xl font-bold text-green-900">567</p>
                </Motion>
              </div>
              <Motion :initial="iconVariants.initial" :animate="iconVariants.animate"
                :whileHover="iconVariants.whileHover as any"
                :transition="{ ...iconVariants.transition, delay: 0.6 } as any" class="text-green-500">
                <el-icon size="32">
                  <ShoppingCart />
                </el-icon>
              </Motion>
            </div>
          </Motion>

          <Motion :initial="statsCardVariants.initial" :animate="statsCardVariants.animate"
            :whileHover="statsCardVariants.whileHover as any"
            :transition="{ ...statsCardVariants.transition, delay: 0.6 } as any"
            class="bg-yellow-50 p-6 rounded-lg cursor-pointer">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-yellow-600 text-sm font-medium">总收入</p>
                <Motion :initial="{ opacity: 0, y: 10 }" :animate="{ opacity: 1, y: 0 }"
                  :transition="{ duration: 0.4, delay: 0.8 }">
                  <p class="text-2xl font-bold text-yellow-900">¥89,012</p>
                </Motion>
              </div>
              <Motion :initial="iconVariants.initial" :animate="iconVariants.animate"
                :whileHover="iconVariants.whileHover as any"
                :transition="{ ...iconVariants.transition, delay: 0.7 } as any" class="text-yellow-500">
                <el-icon size="32">
                  <Money />
                </el-icon>
              </Motion>
            </div>
          </Motion>

          <Motion :initial="statsCardVariants.initial" :animate="statsCardVariants.animate"
            :whileHover="statsCardVariants.whileHover as any"
            :transition="{ ...statsCardVariants.transition, delay: 0.7 } as any"
            class="bg-purple-50 p-6 rounded-lg cursor-pointer">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-purple-600 text-sm font-medium">活跃用户</p>
                <Motion :initial="{ opacity: 0, y: 10 }" :animate="{ opacity: 1, y: 0 }"
                  :transition="{ duration: 0.4, delay: 0.9 }">
                  <p class="text-2xl font-bold text-purple-900">345</p>
                </Motion>
              </div>
              <Motion :initial="iconVariants.initial" :animate="iconVariants.animate"
                :whileHover="iconVariants.whileHover as any"
                :transition="{ ...iconVariants.transition, delay: 0.8 } as any" class="text-purple-500">
                <el-icon size="32">
                  <TrendCharts />
                </el-icon>
              </Motion>
            </div>
          </Motion>

        </div>
      </el-card>
    </Motion>

    <!-- 图表区域 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Motion :initial="cardVariants.initial" :animate="cardVariants.animate"
        :whileHover="cardVariants.whileHover as any" :transition="{ ...cardVariants.transition, delay: 0.8 } as any">
        <el-card>
          <template #header>
            <span class="font-medium">销售趋势</span>
          </template>
          <div class="h-64 flex items-center justify-center text-gray-500">
            <Motion :initial="{ opacity: 0, scale: 0.8 }" :animate="{ opacity: 1, scale: 1 }"
              :whileHover="{ scale: 1.1, rotate: 5 }" :transition="{ duration: 0.5, delay: 1.0 }" class="text-center">
              <Motion :initial="{ y: -20, opacity: 0 }" :animate="{ y: 0, opacity: 1 }"
                :transition="{ duration: 0.4, delay: 1.2 }">
                <el-icon size="48" class="mb-2">
                  <TrendCharts />
                </el-icon>
              </Motion>
              <Motion :initial="{ opacity: 0 }" :animate="{ opacity: 1 }" :transition="{ duration: 0.3, delay: 1.4 }">
                <p>图表组件待集成</p>
              </Motion>
            </Motion>
          </div>
        </el-card>
      </Motion>

      <Motion :initial="cardVariants.initial" :animate="cardVariants.animate"
        :whileHover="cardVariants.whileHover as any" :transition="{ ...cardVariants.transition, delay: 0.9 } as any">
        <el-card>
          <template #header>
            <span class="font-medium">用户分布</span>
          </template>
          <div class="h-64 flex items-center justify-center text-gray-500">
            <Motion :initial="{ opacity: 0, scale: 0.8 }" :animate="{ opacity: 1, scale: 1 }"
              :whileHover="{ scale: 1.1, rotate: -5 }" :transition="{ duration: 0.5, delay: 1.1 }" class="text-center">
              <Motion :initial="{ y: -20, opacity: 0 }" :animate="{ y: 0, opacity: 1 }"
                :transition="{ duration: 0.4, delay: 1.3 }">
                <el-icon size="48" class="mb-2">
                  <PieChart />
                </el-icon>
              </Motion>
              <Motion :initial="{ opacity: 0 }" :animate="{ opacity: 1 }" :transition="{ duration: 0.3, delay: 1.5 }">
                <p>图表组件待集成</p>
              </Motion>
            </Motion>
          </div>
        </el-card>
      </Motion>
    </div>
  </div>
</template>

<style scoped>
.dashboard {
  width: 100%;
}

/* 统计卡片增强样式 */
.cursor-pointer {
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.3s ease;
}

.cursor-pointer:hover {
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

/* 响应式动画优化 */
@media (prefers-reduced-motion: reduce) {
  .cursor-pointer {
    transition: none;
  }
}

/* 增强卡片视觉效果 */
.el-card {
  border-radius: 12px;
  border: none;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.el-card:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
}
</style>