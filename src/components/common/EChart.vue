<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import * as echarts from 'echarts/core'
import {
  BarChart,
  LineChart,
  PieChart,
  GaugeChart
} from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  DataZoomComponent
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import type { EChartsOption } from 'echarts'

// 注册必要的组件
echarts.use([
  BarChart,
  LineChart,
  PieChart,
  GaugeChart,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  DataZoomComponent,
  CanvasRenderer
])

interface Props {
  option: EChartsOption
  width?: string | number
  height?: string | number
  loading?: boolean
  theme?: string
}

const props = withDefaults(defineProps<Props>(), {
  width: '100%',
  height: '300px',
  loading: false,
  theme: 'default'
})

const chartRef = ref<HTMLDivElement>()
let chartInstance: echarts.ECharts | null = null

const initChart = async () => {
  if (!chartRef.value) return
  
  await nextTick()
  
  // 销毁已存在的实例
  if (chartInstance) {
    chartInstance.dispose()
  }
  
  // 创建新实例
  chartInstance = echarts.init(chartRef.value, props.theme)
  
  // 设置配置项
  chartInstance.setOption(props.option)
  
  // 监听窗口大小变化
  const resizeHandler = () => {
    chartInstance?.resize()
  }
  
  window.addEventListener('resize', resizeHandler)
  
  // 组件卸载时移除监听器
  onUnmounted(() => {
    window.removeEventListener('resize', resizeHandler)
  })
}

const updateChart = () => {
  if (chartInstance && props.option) {
    chartInstance.setOption(props.option, true)
  }
}

const showLoading = () => {
  chartInstance?.showLoading('default', {
    text: '加载中...',
    color: '#409EFF',
    textColor: '#000',
    maskColor: 'rgba(255, 255, 255, 0.8)',
    zlevel: 0
  })
}

const hideLoading = () => {
  chartInstance?.hideLoading()
}

// 监听配置项变化
watch(
  () => props.option,
  () => {
    updateChart()
  },
  { deep: true }
)

// 监听加载状态
watch(
  () => props.loading,
  (loading) => {
    if (loading) {
      showLoading()
    } else {
      hideLoading()
    }
  }
)

onMounted(() => {
  initChart()
  
  if (props.loading) {
    showLoading()
  }
})

onUnmounted(() => {
  if (chartInstance) {
    chartInstance.dispose()
    chartInstance = null
  }
})

// 暴露实例方法
defineExpose({
  getInstance: () => chartInstance,
  resize: () => chartInstance?.resize(),
  showLoading,
  hideLoading
})
</script>

<template>
  <div
    ref="chartRef"
    :style="{
      width: typeof width === 'number' ? `${width}px` : width,
      height: typeof height === 'number' ? `${height}px` : height
    }"
    class="echart-container"
  />
</template>

<style scoped>
.echart-container {
  min-height: 200px;
}
</style>