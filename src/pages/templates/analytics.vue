<script setup lang="ts">
import { ref, computed } from 'vue'
import { Motion } from 'motion-v'
import { ElMessage } from 'element-plus'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart } from 'echarts/charts'
import { TitleComponent, TooltipComponent, LegendComponent, GridComponent } from 'echarts/components'
import {
  User,
  MapLocation,
  Location,
  ArrowUp,
  Refresh,
  ChatDotRound,
  Star
} from '@element-plus/icons-vue'

// 注册 ECharts 组件
use([CanvasRenderer, LineChart, TitleComponent, TooltipComponent, LegendComponent, GridComponent])

// 数据接口定义
interface HotAttractionItem {
  name: string
  visit_count: number
  rating: string
  city?: string
  province?: string
  address?: string
  description?: string
}
interface UserGrowthChartItem {
  date: string
  count: number
}
interface UserStats {
  total: number
  active: number
  new_this_month: number
  inactive: number
}
interface TripStats {
  total: number
  totalBookings: number
  completed: number
  ongoing: number
  planning: number
}
interface AttractionStats {
  total: number
  active: number
  inactive: number
  avg_rating: number
}
interface ReviewStats {
  total: number
  avg_rating: number
  rating_distribution?: Record<string, number>
  pending_reviews?: number
  approved_reviews?: number
  rejected_reviews?: number
  today_reviews?: number
  weekly_growth?: number
}
interface RevenueStats {
  total: number
}
interface AnalyticsData {
  userStats: UserStats
  tripStats: TripStats
  attractionStats: AttractionStats
  reviewStats: ReviewStats
  revenueStats: RevenueStats
  userGrowthTrend: UserGrowthChartItem[]
  hotAttractions: HotAttractionItem[]
}

// 动画配置
const pageVariants = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: 'easeOut' }
}
const cardVariants = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.5, ease: 'easeOut' }
}

// 假数据
const loading = ref(false)
const analyticsData = ref<AnalyticsData>({
  userStats: {
    total: 123456,
    active: 98654,
    new_this_month: 2345,
    inactive: 2468
  },
  tripStats: {
    total: 5432,
    totalBookings: 8765,
    completed: 3210,
    ongoing: 1234,
    planning: 988
  },
  attractionStats: {
    total: 345,
    active: 300,
    inactive: 45,
    avg_rating: 4.5
  },
  reviewStats: {
    total: 1290,
    avg_rating: 4.2,
    rating_distribution: { '5': 800, '4': 300, '3': 120, '2': 50, '1': 20 },
    pending_reviews: 10,
    approved_reviews: 1250,
    rejected_reviews: 30,
    today_reviews: 15,
    weekly_growth: 8
  },
  revenueStats: {
    total: 9876543
  },
  userGrowthTrend: Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (29 - i) * 86400000).toISOString(),
    count: Math.floor(Math.random() * 200) + 50
  })),
  hotAttractions: Array.from({ length: 10 }, (_, i) => ({
    name: `景点 ${i + 1}`,
    visit_count: Math.floor(Math.random() * 10000) + 1000,
    rating: (Math.random() * 2 + 3).toFixed(1),
    city: '示例市',
    province: '示例省',
    address: `示例地址 ${i + 1}`,
    description: i % 2 === 0 ? '这是一个示例景点描述' : ''
  }))
})

// 刷新数据（假数据直接提示）
const refreshData = () => {
  ElMessage.success('假数据已刷新')
}

// 格式化方法
const formatNumber = (num: number | undefined) => {
  if (num === undefined || num === null) return '0'
  if (num >= 10000) return (num / 10000).toFixed(1) + '万'
  return num.toLocaleString()
}
const getLocationText = (row: any) => {
  const parts: string[] = []
  if (row.city) parts.push(row.city)
  if (row.province && row.province !== row.city) parts.push(row.province)
  if (row.address) parts.push(row.address)
  return parts.join(', ') || '未知位置'
}
const formatCurrency = (amount: number | undefined) => {
  if (amount === undefined || amount === null) return '¥0'
  if (amount >= 10000) return '¥' + (amount / 10000).toFixed(1) + '万'
  return '¥' + amount.toLocaleString()
}
const formatPercentage = (rate: number | undefined) => {
  if (rate === undefined || rate === null) return '0%'
  const sign = rate >= 0 ? '+' : ''
  return sign + rate.toFixed(1) + '%'
}

// 用户增长图表
const userGrowthChartOption = computed(() => {
  const chartData = analyticsData.value.userGrowthTrend || []
  const dates = chartData.map(item => {
    const d = new Date(item.date)
    return `${d.getMonth() + 1}/${d.getDate()}`
  })
  const counts = chartData.map(item => item.count)
  return {
    title: { text: '用户增长趋势（最近30天）', textStyle: { fontSize: 14, fontWeight: 'normal' } },
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => `${params[0].axisValue}<br/>新增用户: ${params[0].value}人`
    },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', data: dates, axisLabel: { fontSize: 12 } },
    yAxis: { type: 'value', axisLabel: { fontSize: 12 } },
    series: [{
      name: '新增用户',
      type: 'line',
      data: counts,
      smooth: true,
      lineStyle: { color: '#409EFF' },
      itemStyle: { color: '#409EFF' },
      areaStyle: {
        color: {
          type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(64, 158, 255, 0.3)' },
            { offset: 1, color: 'rgba(64, 158, 255, 0.1)' }
          ]
        }
      }
    }]
  }
})

// 评论统计辅助
const getRatingColor = (rating: number) => {
  const colors: Record<number, string> = {
    5: '#67C23A', 4: '#95D475', 3: '#E6A23C', 2: '#F78989', 1: '#F56C6C'
  }
  return colors[rating] || '#909399'
}
const getRatingCount = (rating: number) =>
  analyticsData.value.reviewStats.rating_distribution?.[rating.toString()] || 0
const getRatingPercentage = (rating: number) => {
  const reviewStats = analyticsData.value.reviewStats
  if (!reviewStats?.total) return 0
  const count = getRatingCount(rating)
  return reviewStats.total > 0 ? Math.round((count / reviewStats.total) * 100) : 0
}
const getWeeklyGrowth = () => {
  const growth = analyticsData.value.reviewStats.weekly_growth || 0
  return growth > 0 ? `+${growth}%` : `${growth}%`
}
</script>


<template>
  <Motion :initial="pageVariants.initial" :animate="pageVariants.animate" :transition="pageVariants.transition as any"
    class="analytics-page">
    <div class="analytics-container">
      <!-- 页面头部 -->
      <Motion :initial="{ opacity: 0, y: -20 }" :animate="{ opacity: 1, y: 0 }"
        :transition="{ duration: 0.5, delay: 0.1 }">
        <div class="page-header">
          <div class="header-left">
            <h2 class="page-title">数据分析</h2>
            <p class="page-subtitle">智能旅游平台运营数据概览</p>
          </div>
          <div class="header-right">
            <el-space>
              <Motion :whileHover="{ scale: 1.05 }" :whileTap="{ scale: 0.95 }">
                <el-button @click="refreshData" :loading="loading">
                  <el-icon>
                    <Refresh />
                  </el-icon>
                  刷新数据
                </el-button>
              </Motion>
            </el-space>
          </div>
        </div>
      </Motion>

      <!-- 核心指标卡片 -->
      <Motion :initial="{ opacity: 0, y: 20 }" :animate="{ opacity: 1, y: 0 }"
        :transition="{ duration: 0.6, delay: 0.2 }">
        <el-row :gutter="24" class="metrics-row">
          <!-- 用户统计 -->
          <el-col :xs="24" :sm="12" :md="8">
            <Motion v-bind="cardVariants" :transition="{ ...cardVariants.transition, delay: 0.1 } as any">
              <el-card class="metric-card user-card" shadow="hover">
                <div class="metric-content">
                  <div class="metric-icon">
                    <el-icon size="32" color="#409EFF">
                      <User />
                    </el-icon>
                  </div>
                  <div class="metric-info">
                    <h3 class="metric-title">总用户数</h3>
                    <p class="metric-value">{{ formatNumber(analyticsData.userStats.total) }}</p>
                    <p class="metric-change positive">
                      <el-icon>
                        <ArrowUp />
                      </el-icon>
                      {{ formatPercentage(0) }}
                    </p>
                  </div>
                </div>
                <div class="metric-detail">
                  <span>活跃用户: {{ formatNumber(analyticsData.userStats.active) }}</span>
                  <span>本月新增: {{ analyticsData.userStats.new_this_month }}</span>
                </div>
              </el-card>
            </Motion>
          </el-col>

          <!-- 路线统计 -->
          <el-col :xs="24" :sm="12" :md="8">
            <Motion v-bind="cardVariants" :transition="{ ...cardVariants.transition, delay: 0.2 } as any">
              <el-card class="metric-card route-card" shadow="hover">
                <div class="metric-content">
                  <div class="metric-icon">
                    <el-icon size="32" color="#67C23A">
                      <MapLocation />
                    </el-icon>
                  </div>
                  <div class="metric-info">
                    <h3 class="metric-title">总预订数</h3>
                    <p class="metric-value">{{ formatNumber(analyticsData.tripStats.totalBookings) }}</p>
                    <p class="metric-change positive">
                      <el-icon>
                        <ArrowUp />
                      </el-icon>
                      {{ formatPercentage(0) }}
                    </p>
                  </div>
                </div>
                <div class="metric-detail">
                  <span>总行程: {{ analyticsData.tripStats.total }}</span>
                  <span>进行中: {{ analyticsData.tripStats.ongoing }}</span>
                </div>
              </el-card>
            </Motion>
          </el-col>

          <!-- 景点统计 -->
          <el-col :xs="24" :sm="12" :md="8">
            <Motion v-bind="cardVariants" :transition="{ ...cardVariants.transition, delay: 0.3 } as any">
              <el-card class="metric-card attraction-card" shadow="hover">
                <div class="metric-content">
                  <div class="metric-icon">
                    <el-icon size="32" color="#E6A23C">
                      <Location />
                    </el-icon>
                  </div>
                  <div class="metric-info">
                    <h3 class="metric-title">景点总数</h3>
                    <p class="metric-value">{{ formatNumber(analyticsData.attractionStats.total) }}</p>
                    <p class="metric-change positive">
                      <el-icon>
                        <ArrowUp />
                      </el-icon>
                      {{ formatPercentage(0) }}
                    </p>
                  </div>
                </div>
                <div class="metric-detail">
                  <span>活跃景点: {{ analyticsData.attractionStats.active }}</span>
                  <span>平均评分: {{ analyticsData.attractionStats.avg_rating }}</span>
                </div>
              </el-card>
            </Motion>
          </el-col>
        </el-row>
      </Motion>

      <!-- 图表区域 -->
      <Motion :initial="{ opacity: 0, y: 30 }" :animate="{ opacity: 1, y: 0 }"
        :transition="{ duration: 0.6, delay: 0.4 }">
        <el-row :gutter="24" class="charts-row">
          <!-- 用户增长趋势 -->
          <el-col :xs="24" :lg="16">
            <el-card class="chart-card" shadow="hover">
              <template #header>
                <div class="card-header">
                  <h3>用户增长趋势</h3>
                  <el-tag type="info" size="small">近30天</el-tag>
                </div>
              </template>
              <div class="chart-container" v-loading="loading">
                <div class="trend-chart">
                  <VChart :option="userGrowthChartOption" style="height: 450px; width: 100%;" autoresize />
                </div>
              </div>
            </el-card>
          </el-col>

          <!-- 评论统计 -->
          <el-col :xs="24" :lg="8">
            <el-card class="chart-card review-analytics-card" shadow="hover">
              <template #header>
                <div class="card-header">
                  <h3>评论统计分析</h3>
                  <el-tag type="success" size="small">实时</el-tag>
                </div>
              </template>
              <div class="review-analytics-container" v-loading="loading">
                <!-- 核心指标 -->
                <div class="review-metrics">
                  <div class="metric-item total-reviews">
                    <div class="metric-icon-wrapper">
                      <el-icon size="20" color="#409EFF">
                        <ChatDotRound />
                      </el-icon>
                    </div>
                    <div class="metric-content">
                      <div class="metric-number">{{ formatNumber(analyticsData.reviewStats.total) }}</div>
                      <div class="metric-label">总评论数</div>
                    </div>
                  </div>

                  <div class="metric-item avg-rating">
                    <div class="metric-icon-wrapper">
                      <el-icon size="20" color="#F7BA2A">
                        <Star />
                      </el-icon>
                    </div>
                    <div class="metric-content">
                      <div class="metric-number">{{ analyticsData.reviewStats.avg_rating || 0 }}</div>
                      <div class="metric-label">平均评分</div>
                    </div>
                  </div>
                </div>

                <!-- 评分分布 -->
                <div class="rating-distribution">
                  <h4 class="section-title">评分分布</h4>
                  <div class="rating-bars">
                    <div v-for="rating in [5, 4, 3, 2, 1]" :key="rating" class="rating-bar">
                      <div class="rating-label">
                        <el-rate :model-value="rating" disabled size="small" />
                      </div>
                      <div class="rating-progress">
                        <div class="progress-bg">
                          <div class="progress-fill" :style="{
                            width: getRatingPercentage(rating) + '%',
                            backgroundColor: getRatingColor(rating)
                          }"></div>
                        </div>
                        <span class="rating-count">{{ getRatingCount(rating) }}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 统计摘要 -->
                <div class="review-summary">
                  <div class="summary-item">
                    <span class="summary-label">今日新增</span>
                    <span class="summary-value positive">+{{ analyticsData.reviewStats.today_reviews || 0 }}</span>
                  </div>

                  <div class="summary-item">
                    <span class="summary-label">本周增长</span>
                    <span class="summary-value positive">{{ getWeeklyGrowth() }}</span>
                  </div>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </Motion>

      <!-- 热门景点排行 -->
      <Motion :initial="{ opacity: 0, y: 30 }" :animate="{ opacity: 1, y: 0 }"
        :transition="{ duration: 0.6, delay: 0.6 }">
        <el-row :gutter="24" class="tables-row">
          <el-col :xs="24">
            <el-card class="table-card" shadow="hover">
              <template #header>
                <div class="card-header">
                  <h3>热门景点排行</h3>
                  <el-tag type="warning" size="small">TOP 10</el-tag>
                </div>
              </template>
              <div class="table-container" v-loading="loading">
                <el-table :data="analyticsData.hotAttractions.slice(0, 10)" stripe>
                  <el-table-column label="排名" width="80" align="center">
                    <template #default="{ $index }">
                      <el-tag :type="$index === 0 ? 'danger' : $index === 1 ? 'warning' : 'info'" size="small">
                        {{ $index + 1 }}
                      </el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column label="景点名称" prop="name" width="120" />
                  <el-table-column label="访问量" prop="visit_count" width="100" align="center">
                    <template #default="{ row }">
                      <span class="visit-count">{{ formatNumber(row.visit_count) }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column label="评分" prop="rating" width="200" align="center">
                    <template #default="{ row }">
                      <el-rate :model-value="parseFloat(row.rating)" disabled show-score />
                    </template>
                  </el-table-column>
                  <el-table-column label="位置" min-width="150">
                    <template #default="{ row }">
                      <span class="location-text">{{ getLocationText(row) }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column label="描述" prop="description" min-width="200">
                    <template #default="{ row }">
                      <el-tooltip :content="row.description" placement="top" :disabled="!row.description">
                        <span class="description-text">{{ row.description || '暂无描述' }}</span>
                      </el-tooltip>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </el-card>
          </el-col>


        </el-row>
      </Motion>
    </div>
  </Motion>
</template>

<style scoped>
.analytics-page {
  width: 100%;
  min-height: 100vh;
}

.analytics-container {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

/* 页面头部 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 20px 0;
}

.header-left .page-title {
  font-size: 28px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 8px 0;
}

.header-left .page-subtitle {
  font-size: 14px;
  color: #909399;
  margin: 0;
}

/* 指标卡片 */
.metrics-row {
  margin-bottom: 24px;
}

.metric-card {
  border-radius: 12px;
  border: none;
  transition: all 0.3s ease;
  overflow: hidden;
}

.metric-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.metric-content {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.metric-icon {
  margin-right: 16px;
  padding: 12px;
  border-radius: 8px;
  background: rgba(64, 158, 255, 0.1);
}

.user-card .metric-icon {
  background: rgba(64, 158, 255, 0.1);
}

.route-card .metric-icon {
  background: rgba(103, 194, 58, 0.1);
}

.attraction-card .metric-icon {
  background: rgba(230, 162, 60, 0.1);
}

.revenue-card .metric-icon {
  background: rgba(245, 108, 108, 0.1);
}

.metric-info {
  flex: 1;
}

.metric-title {
  font-size: 14px;
  color: #909399;
  margin: 0 0 8px 0;
  font-weight: 500;
}

.metric-value {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 4px 0;
}

.metric-change {
  font-size: 12px;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 4px;
}

.metric-change.positive {
  color: #67C23A;
}

.metric-change.negative {
  color: #F56C6C;
}

.metric-detail {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #909399;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}

/* 图表区域 */
.charts-row {
  margin-bottom: 24px;
}

.chart-card {
  border-radius: 12px;
  border: none;
  min-height: 400px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.chart-container {
  height: 480px;
  width: 100%;
}

.trend-chart {
  width: 100%;
  height: 100%;
}

.chart-placeholder {
  text-align: center;
  color: #909399;
}

.chart-placeholder p {
  margin: 8px 0 4px 0;
  font-size: 16px;
  font-weight: 500;
}

.chart-note {
  font-size: 12px !important;
  color: #C0C4CC !important;
}

/* 评论统计 */
.review-stats {
  width: 100%;
  padding: 20px 0;
}

.review-item {
  margin-bottom: 20px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #409EFF;
}

.review-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.review-label {
  font-size: 14px;
  color: #606266;
  font-weight: 500;
}

.review-value {
  font-size: 18px;
  color: #303133;
  font-weight: 600;
}

/* 表格区域 */
.tables-row {
  margin-bottom: 24px;
}

.table-card {
  border-radius: 12px;
  border: none;
}

.table-container {
  min-height: 300px;
}

.visit-count {
  font-weight: 600;
  color: #409EFF;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .analytics-container {
    padding: 16px;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .header-right {
    width: 100%;
  }

  .metric-value {
    font-size: 20px;
  }

  .chart-container {
    height: 250px;
  }
}

/* 表格样式 */
.visit-count {
  font-weight: 600;
  color: #409EFF;
}

.location-text {
  color: #606266;
  font-size: 13px;
}

/* 卡片阴影效果 */
.el-card {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.el-card:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
}

/* 评论统计样式 */
.review-analytics-card {
  height: 100%;
}

.review-analytics-container {
  padding: 0;
}

.review-metrics {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
}

.metric-item {
  flex: 1;
  display: flex;
  align-items: center;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  gap: 12px;
}

.metric-icon-wrapper {
  padding: 8px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.8);
}

.metric-content .metric-number {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.metric-content .metric-label {
  font-size: 12px;
  color: #909399;
  margin: 0;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 16px 0;
}

.rating-distribution {
  margin-bottom: 24px;
  padding: 0 8px;
}

.rating-bars {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.rating-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 0 4px;
}

.rating-label {
  width: 70px;
  display: flex;
  justify-content: flex-end;
  flex-shrink: 0;
}

.rating-progress {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  max-width: 200px;
}

.progress-bg {
  flex: 1;
  height: 6px;
  background: #f0f0f0;
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.3s ease;
}

.rating-count {
  font-size: 12px;
  color: #909399;
  min-width: 24px;
  width: 24px;
  text-align: right;
  flex-shrink: 0;
}

.review-summary {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #f8f9fa;
  border-radius: 6px;
}

.summary-label {
  font-size: 13px;
  color: #606266;
}

.summary-value {
  font-size: 13px;
  font-weight: 600;
}

.summary-value.positive {
  color: #67C23A;
}

.summary-value.warning {
  color: #E6A23C;
}
</style>