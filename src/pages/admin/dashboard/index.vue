<script setup lang="ts">
  import { Motion } from 'motion-v'
  import { Refresh, DataAnalysis, TrendCharts, Clock, Trophy } from '@element-plus/icons-vue'
  import { ref, onMounted, computed, nextTick, watch } from 'vue'
  import { getDetectionStats } from '@/api'
  import type { DetectionStatsData } from '@/types/apis/PagesApi_T'
  import VChart from 'vue-echarts'
  import { use } from 'echarts/core'
  import { CanvasRenderer } from 'echarts/renderers'
  import { PieChart, BarChart } from 'echarts/charts'
  import {
    TitleComponent,
    TooltipComponent,
    LegendComponent,
    GridComponent
  } from 'echarts/components'
  import type { EChartsOption } from 'echarts'
  
  // 注册必要的组件
  use([
    CanvasRenderer,
    PieChart,
    BarChart,
    TitleComponent,
    TooltipComponent,
    LegendComponent,
    GridComponent
  ])
  
  const loading = ref(false)
  const statsData = ref<DetectionStatsData | null>(null)
  const days = ref(7) // 默认查询7天的数据
  const fruitChartRef = ref()
  const dailyChartRef = ref()
  const chartsMounted = ref(false)
  
  // 获取检测统计数据
  const fetchStats = async () => {
    try {
      loading.value = true
      const response = await getDetectionStats({ days: days.value })
      if (response.code === 200) {
        statsData.value = response.data
      }
    } catch (error) {
      console.error('获取统计数据失败:', error)
    } finally {
      loading.value = false
    }
  }
  
  // 计算最近检测次数（最近3天的总和）
  const recentDetections = computed(() => {
    if (!statsData.value?.daily_stats) return 0
    return statsData.value.daily_stats
      .slice(-3)
      .reduce((sum, stat) => sum + stat.count, 0)
  })
  
  // 获取检测最多的水果
  const topFruit = computed(() => {
    if (!statsData.value?.fruit_stats || statsData.value.fruit_stats.length === 0) {
      return { name: '暂无数据', count: 0 }
    }
    const top = statsData.value.fruit_stats.reduce((prev, current) =>
      prev.count > current.count ? prev : current
    )
    return { name: top.fruit_name, count: top.count }
  })
  
  // 水果颜色映射
  const fruitColors: Record<string, string> = {
    '苹果': '#ff6b6b',
    '香蕉': '#ffd93d',
    '橙子': '#ff8c42',
    '葡萄': '#9c88ff',
    '草莓': '#ff6b9d',
    'apple': '#ff6b6b',
    'banana': '#ffd93d',
    'orange': '#ff8c42',
    'grape': '#9c88ff',
    'strawberry': '#ff6b9d'
  }
  
  // 获取水果颜色
  const getFruitColor = (fruitName: string) => {
    return fruitColors[fruitName] || '#6b7280'
  }
  
  // 水果检测计数饼图配置
  const fruitChartOption = computed((): EChartsOption | undefined => {
    if (!statsData.value?.fruit_stats || statsData.value.fruit_stats.length === 0) {
      return undefined
    }
  
    return {
      title: {
        text: '水果检测分布',
        left: 'center',
        textStyle: { fontSize: 16, fontWeight: 'bold' }
      },
      tooltip: { trigger: 'item', formatter: '{a} <br/>{b}: {c} ({d}%)' },
      legend: { orient: 'vertical', left: 'left', top: 'middle' },
      series: [
        {
          name: '检测次数',
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['60%', '50%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: '#fff',
            borderWidth: 2
          },
          label: { show: false, position: 'center' },
          emphasis: { label: { show: true, fontSize: 20, fontWeight: 'bold' } },
          labelLine: { show: false },
          data: statsData.value.fruit_stats.map(fruit => ({
            value: fruit.count,
            name: fruit.fruit_name,
            itemStyle: { color: getFruitColor(fruit.fruit_name) }
          }))
        }
      ]
    }
  })
  
  // 每日检测趋势柱状图配置
  const dailyChartOption = computed((): EChartsOption | undefined => {
    if (!statsData.value?.daily_stats || statsData.value.daily_stats.length === 0) {
      return undefined
    }
  
    return {
      title: {
        text: `最近${statsData.value.period_days}天检测趋势`,
        left: 'center',
        textStyle: { fontSize: 16, fontWeight: 'bold' }
      },
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: {
        type: 'category',
        data: statsData.value.daily_stats.map(day => day.date.slice(-5)),
        axisTick: { alignWithLabel: true }
      },
      yAxis: { type: 'value', name: '检测次数' },
      series: [
        {
          name: '检测次数',
          type: 'bar',
          barWidth: '60%',
          itemStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: '#3b82f6' },
                { offset: 1, color: '#1d4ed8' }
              ]
            },
            borderRadius: [4, 4, 0, 0]
          },
          data: statsData.value.daily_stats.map(day => day.count)
        }
      ]
    }
  })
  
  onMounted(async () => {
    await fetchStats()
    await nextTick()
    chartsMounted.value = true
  
    requestAnimationFrame(() => {
      window.dispatchEvent(new Event('resize'))
      fruitChartRef.value?.resize()
      dailyChartRef.value?.resize()
    })
  })
  
  // 监听图表数据变化，触发 resize
  watch([fruitChartOption, dailyChartOption], () => {
    if (chartsMounted.value) {
      nextTick(() => {
        requestAnimationFrame(() => {
          fruitChartRef.value?.resize()
          dailyChartRef.value?.resize()
        })
      })
    }
  })
  
  // 动画配置
  const cardVariants = {
    initial: { opacity: 0, y: 30, scale: 0.95 },
    animate: { opacity: 1, y: 0, scale: 1 },
    whileHover: { scale: 1.02, y: -5, transition: { duration: 0.2, ease: ['easeOut'] } },
    transition: { duration: 0.4, ease: ['easeOut'] }
  }
  
  const statsCardVariants = {
    initial: { opacity: 0, y: 40, scale: 0.9 },
    animate: { opacity: 1, y: 0, scale: 1 },
    whileHover: { scale: 1.05, y: -8, transition: { duration: 0.3, ease: ['easeOut'] } },
    transition: { duration: 0.5, ease: ['easeOut'] }
  }
  
  const iconVariants = {
    initial: { scale: 0, rotate: -180 },
    animate: { scale: 1, rotate: 0 },
    whileHover: { scale: 1.2, rotate: 10, transition: { duration: 0.2, ease: ['easeOut'] } },
    transition: { duration: 0.6, delay: 0.3, ease: ['easeOut'] }
  }
  </script>
  
  <template>
    <div class="dashboard">
      <!-- 仪表板页面 -->
      <Motion :initial="cardVariants.initial" :animate="cardVariants.animate"
        :whileHover="cardVariants.whileHover as any"
        :transition="{ ...cardVariants.transition, delay: 0.3 } as any">
        <el-card class="mb-6">
          <template #header>
            <div class="flex items-center justify-between">
              <span class="text-lg font-medium">仪表板</span>
              <Motion :initial="{ scale: 0.8, opacity: 0 }" :animate="{ scale: 1, opacity: 1 }"
                :whileHover="{ scale: 1.05 }" :transition="{ duration: 0.3, delay: 0.5 }">
                <el-button type="primary" :icon="Refresh" :loading="loading" circle @click="fetchStats" />
              </Motion>
            </div>
          </template>
  
          <!-- 统计卡片 -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <!-- 总检测次数 -->
            <Motion :initial="statsCardVariants.initial" :animate="statsCardVariants.animate"
              :whileHover="statsCardVariants.whileHover as any"
              :transition="{ ...statsCardVariants.transition, delay: 0.4 } as any"
              class="bg-blue-50 p-6 rounded-lg cursor-pointer">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-blue-600 text-sm font-medium">总检测次数</p>
                  <p class="text-2xl font-bold text-blue-900">{{ statsData?.total_detections || 0 }}</p>
                </div>
                <el-icon size="32" class="text-blue-500"><DataAnalysis /></el-icon>
              </div>
            </Motion>
  
            <!-- 平均置信度 -->
            <Motion :initial="statsCardVariants.initial" :animate="statsCardVariants.animate"
              :whileHover="statsCardVariants.whileHover as any"
              :transition="{ ...statsCardVariants.transition, delay: 0.5 } as any"
              class="bg-green-50 p-6 rounded-lg cursor-pointer">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-green-600 text-sm font-medium">平均置信度</p>
                  <p class="text-2xl font-bold text-green-900">
                    {{ statsData?.avg_confidence ? (statsData.avg_confidence * 100).toFixed(1) + '%' : '0%' }}
                  </p>
                </div>
                <el-icon size="32" class="text-green-500"><TrendCharts /></el-icon>
              </div>
            </Motion>
  
            <!-- 最近3天检测 -->
            <Motion :initial="statsCardVariants.initial" :animate="statsCardVariants.animate"
              :whileHover="statsCardVariants.whileHover as any"
              :transition="{ ...statsCardVariants.transition, delay: 0.6 } as any"
              class="bg-yellow-50 p-6 rounded-lg cursor-pointer">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-yellow-600 text-sm font-medium">最近3天检测</p>
                  <p class="text-2xl font-bold text-yellow-900">{{ recentDetections }}</p>
                </div>
                <el-icon size="32" class="text-yellow-500"><Clock /></el-icon>
              </div>
            </Motion>
  
            <!-- 热门水果 -->
            <Motion :initial="statsCardVariants.initial" :animate="statsCardVariants.animate"
              :whileHover="statsCardVariants.whileHover as any"
              :transition="{ ...statsCardVariants.transition, delay: 0.7 } as any"
              class="bg-purple-50 p-6 rounded-lg cursor-pointer">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-purple-600 text-sm font-medium">热门水果</p>
                  <p class="text-2xl font-bold text-purple-900">{{ topFruit.name }}</p>
                  <p class="text-sm text-purple-600">{{ topFruit.count }}次检测</p>
                </div>
                <el-icon size="32" class="text-purple-500"><Trophy /></el-icon>
              </div>
            </Motion>
          </div>
        </el-card>
      </Motion>
  
      <!-- 图表区域 -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- 水果检测计数图表 -->
        <el-card>
          <template #header>
            <span class="font-medium">水果检测计数</span>
          </template>
          <div class="h-64 min-h-[16rem] p-4">
            <v-chart
              v-show="fruitChartOption && chartsMounted"
              ref="fruitChartRef"
              :option="fruitChartOption"
              class="h-full w-full"
              style="min-height: 240px"
              :autoresize="true"
            />
            <div v-if="!fruitChartOption" class="h-full flex items-center justify-center text-gray-500">
              <el-icon size="48" class="mb-2"><DataAnalysis /></el-icon>
              <p>暂无检测数据</p>
            </div>
          </div>
        </el-card>
  
        <!-- 最近检测次数图表 -->
        <el-card>
          <template #header>
            <span class="font-medium">最近{{ statsData?.period_days || 7 }}天检测趋势</span>
          </template>
          <div class="h-64 min-h-[16rem] p-4">
            <v-chart
              v-show="dailyChartOption && chartsMounted"
              ref="dailyChartRef"
              :option="dailyChartOption"
              class="h-full w-full"
              style="min-height: 240px"
              :autoresize="true"
            />
            <div v-if="!dailyChartOption" class="h-full flex items-center justify-center text-gray-500">
              <el-icon size="48" class="mb-2"><TrendCharts /></el-icon>
              <p>暂无趋势数据</p>
            </div>
          </div>
        </el-card>
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
  