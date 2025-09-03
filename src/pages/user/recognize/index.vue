<template>
  <div class="min-h-screen bg-base-100 text-base-content">
    <!-- 页面标题 -->
    <div class="container mx-auto px-4 py-8">
      <RevealMotion :delay="0">
        <div class="text-center mb-8">
          <h1 class="text-4xl font-bold mb-4">水果识别检测</h1>
          <p class="text-lg opacity-70">上传图片，智能识别并计数水果</p>
        </div>
      </RevealMotion>

      <!-- 主要内容区域 -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- 左侧：图片上传区域 -->
        <RevealMotion :delay="0.1">
          <div class="card bg-base-200 shadow-lg">
            <div class="card-body">
              <h2 class="card-title mb-4">上传图片</h2>
              
              <!-- 图片上传区域 -->
              <div 
                class="border-2 border-dashed border-base-300 rounded-lg p-8 text-center transition-colors hover:border-primary"
                :class="{ 'border-primary bg-primary/10': isDragOver }"
                @drop="handleDrop"
                @dragover.prevent="isDragOver = true"
                @dragleave="isDragOver = false"
                @dragenter.prevent
              >
                <div v-if="!selectedImage" class="space-y-4">
                  <div class="text-6xl opacity-50">📷</div>
                  <div>
                    <p class="text-lg font-medium mb-2">拖拽图片到此处或点击选择</p>
                    <p class="text-sm opacity-70">支持 JPG、PNG、WEBP 格式</p>
                  </div>
                  <input 
                    ref="fileInput"
                    type="file" 
                    accept="image/*" 
                    class="hidden"
                    @change="handleFileSelect"
                  >
                  <button 
                    class="btn btn-primary"
                    @click="$refs.fileInput.click()"
                  >
                    选择图片
                  </button>
                </div>
                
                <!-- 预览图片 -->
                <div v-else class="space-y-4">
                  <div class="relative inline-block">
                    <img 
                      :src="selectedImage" 
                      alt="预览图片"
                      class="max-w-full max-h-64 rounded-lg shadow-md"
                    >
                    <button 
                      class="btn btn-circle btn-sm btn-error absolute -top-2 -right-2"
                      @click="clearImage"
                    >
                      ✕
                    </button>
                  </div>
                  <div class="flex gap-2 justify-center">
                    <button 
                      class="btn btn-primary"
                      :class="{ 'loading': isDetecting }"
                      :disabled="isDetecting"
                      @click="detectFruit"
                    >
                      {{ isDetecting ? '检测中...' : '开始检测' }}
                    </button>
                    <button 
                      class="btn btn-outline"
                      @click="$refs.fileInput.click()"
                    >
                      重新选择
                    </button>
                  </div>
                </div>
              </div>

              <!-- 检测设置 -->
              <div class="mt-6">
                <h3 class="font-semibold mb-3">检测设置</h3>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div class="form-control">
                    <label class="label">
                      <span class="label-text">置信度阈值</span>
                    </label>
                    <input 
                      v-model.number="detectionSettings.confidence_threshold"
                      type="range" 
                      min="0.1" 
                      max="1" 
                      step="0.1" 
                      class="range range-primary"
                    >
                    <div class="text-center text-sm opacity-70 mt-1">
                      {{ detectionSettings.confidence_threshold }}
                    </div>
                  </div>
                  <div class="form-control">
                    <label class="label">
                      <span class="label-text">IoU阈值</span>
                    </label>
                    <input 
                      v-model.number="detectionSettings.iou_threshold"
                      type="range" 
                      min="0.1" 
                      max="1" 
                      step="0.1" 
                      class="range range-primary"
                    >
                    <div class="text-center text-sm opacity-70 mt-1">
                      {{ detectionSettings.iou_threshold }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </RevealMotion>

        <!-- 右侧：检测结果区域 -->
        <RevealMotion :delay="0.2">
          <div class="card bg-base-200 shadow-lg">
            <div class="card-body">
              <h2 class="card-title mb-4">检测结果</h2>
              
              <!-- 检测结果展示 -->
              <div v-if="detectionResult" class="space-y-6">
                <!-- 结果图片 -->
                <div class="relative">
                  <canvas 
                    ref="resultCanvas"
                    class="w-full rounded-lg shadow-md border border-base-300"
                  ></canvas>
                </div>

                <!-- 检测统计 -->
                <div class="stats stats-vertical lg:stats-horizontal shadow w-full">
                  <div class="stat">
                    <div class="stat-title">检测到的水果</div>
                    <div class="stat-value text-primary">{{ detectionResult.total_count }}</div>
                    <div class="stat-desc">个</div>
                  </div>
                  <div class="stat">
                    <div class="stat-title">检测时间</div>
                    <div class="stat-value text-sm">{{ formatTimestamp(detectionResult.detections[0]?.timestamp) }}</div>
                  </div>
                </div>

                <!-- 详细检测结果 -->
                <div class="overflow-x-auto">
                  <table class="table table-zebra w-full">
                    <thead>
                      <tr>
                        <th>水果类型</th>
                        <th>置信度</th>
                        <th>位置</th>
                        <th>价格</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(detection, index) in detectionResult.detections" :key="index">
                        <td>
                          <div class="flex items-center gap-2">
                            <div 
                              class="w-4 h-4 rounded"
                              :style="{ backgroundColor: getColorForFruit(detection.fruit_name) }"
                            ></div>
                            {{ getFruitDisplayName(detection.fruit_name) }}
                          </div>
                        </td>
                        <td>
                          <div class="badge badge-primary">{{ (detection.confidence * 100).toFixed(1) }}%</div>
                        </td>
                        <td class="text-xs">
                          ({{ Math.round(detection.bbox.x1) }}, {{ Math.round(detection.bbox.y1) }})
                        </td>
                        <td class="text-success font-semibold">¥{{ detection.price?.toFixed(2) || '0.00' }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <!-- 操作按钮 -->
                <div class="flex gap-2 justify-center">
                  <button class="btn btn-outline btn-sm" @click="downloadResult">
                    下载结果
                  </button>
                  <button class="btn btn-outline btn-sm" @click="clearResult">
                    清除结果
                  </button>
                </div>
              </div>

              <!-- 空状态 -->
              <div v-else class="text-center py-12">
                <div class="text-6xl opacity-30 mb-4">🔍</div>
                <p class="text-lg opacity-70">上传图片并开始检测</p>
                <p class="text-sm opacity-50 mt-2">检测结果将在此处显示</p>
              </div>
            </div>
          </div>
        </RevealMotion>
      </div>

      <!-- 错误提示 -->
      <div v-if="errorMessage" class="alert alert-error mt-6">
        <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>{{ errorMessage }}</span>
        <button class="btn btn-sm btn-ghost" @click="errorMessage = ''">
          ✕
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, h, defineComponent, computed, onBeforeUnmount } from 'vue'
import { detectFruit as detectFruitApi } from '@/api'
import type { FruitDetectionRequest, FruitDetectionResponse } from '@/types/apis/PagesApi_T'
import { Motion } from 'motion-v'

// 动画组件
const RevealMotion = defineComponent({
  name: 'RevealMotion',
  props: { delay: { type: Number, default: 0 } },
  setup(props, { slots }) {
    const el = ref<HTMLElement | null>(null)
    const inView = ref(false)
    let io: IntersectionObserver | null = null

    const animateProps = computed(() => {
      return inView.value
        ? { opacity: 1, y: 0, transition: { duration: 0.6, delay: props.delay } }
        : { opacity: 0, y: 16 }
    })

    onMounted(() => {
      io = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              inView.value = true
              io?.unobserve(e.target)
            }
          })
        },
        { threshold: 0.15 }
      )
      if (el.value) io.observe(el.value)
    })

    onBeforeUnmount(() => io?.disconnect())

    return () =>
      h('div', { ref: el }, [
        h(Motion as any, {
          initial: { opacity: 0, y: 16 },
          animate: animateProps.value,
        }, slots)
      ])
  },
})

// 响应式数据
const selectedImage = ref<string>('')
const isDragOver = ref(false)
const isDetecting = ref(false)
const detectionResult = ref<FruitDetectionResponse['data'] | null>(null)
const errorMessage = ref('')
const fileInput = ref<HTMLInputElement>()
const resultCanvas = ref<HTMLCanvasElement>()
const originalImageFile = ref<File | null>(null)

// 检测设置
const detectionSettings = ref({
  confidence_threshold: 0.5,
  iou_threshold: 0.4
})

// 水果颜色映射
const fruitColors: Record<string, string> = {
  'apple': '#ff6b6b',
  'banana': '#ffd93d',
  'orange': '#ff8c42',
  'grape': '#9c88ff',
  'mango': '#ffb347',
  'guava': '#98fb98',
  'water melon': '#ff69b4'
}

// 水果中文名映射
const fruitNames: Record<string, string> = {
  'apple': '苹果',
  'banana': '香蕉',
  'orange': '橙子',
  'grape': '葡萄',
  'mango': '芒果',
  'guava': '番石榴',
  'water melon': '西瓜'
}

// 处理文件选择
const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    processFile(file)
  }
}

// 处理拖拽上传
const handleDrop = (event: DragEvent) => {
  event.preventDefault()
  isDragOver.value = false
  
  const files = event.dataTransfer?.files
  if (files && files.length > 0) {
    processFile(files[0])
  }
}

// 处理文件
const processFile = (file: File) => {
  if (!file.type.startsWith('image/')) {
    errorMessage.value = '请选择有效的图片文件'
    return
  }
  
  if (file.size > 10 * 1024 * 1024) { // 10MB限制
    errorMessage.value = '图片文件大小不能超过10MB'
    return
  }
  
  originalImageFile.value = file
  
  const reader = new FileReader()
  reader.onload = (e) => {
    selectedImage.value = e.target?.result as string
    clearResult()
  }
  reader.readAsDataURL(file)
}

// 清除图片
const clearImage = () => {
  selectedImage.value = ''
  originalImageFile.value = null
  clearResult()
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

// 清除结果
const clearResult = () => {
  detectionResult.value = null
  errorMessage.value = ''
}

// 水果检测
const detectFruit = async () => {
  if (!selectedImage.value) {
    errorMessage.value = '请先选择图片'
    return
  }
  
  isDetecting.value = true
  errorMessage.value = ''
  
  try {
    const requestData: FruitDetectionRequest = {
      image: selectedImage.value,
      confidence_threshold: detectionSettings.value.confidence_threshold,
      iou_threshold: detectionSettings.value.iou_threshold
    }
    
    const response = await detectFruitApi(requestData)
    
    if (response.code === 200 && response.data) {
      detectionResult.value = response.data
      await nextTick()
      drawDetectionResult()
    } else {
      errorMessage.value = response.msg || '检测失败，请重试'
    }
  } catch (error) {
    console.error('检测错误:', error)
    errorMessage.value = '检测失败，请检查网络连接后重试'
  } finally {
    isDetecting.value = false
  }
}

// 在Canvas上绘制检测结果
const drawDetectionResult = () => {
  if (!resultCanvas.value || !detectionResult.value || !selectedImage.value) return
  
  const canvas = resultCanvas.value
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  
  const img = new Image()
  img.onload = () => {
    // 设置canvas尺寸
    canvas.width = img.width
    canvas.height = img.height
    
    // 绘制原图
    ctx.drawImage(img, 0, 0)
    
    // 绘制检测框
    detectionResult.value?.detections.forEach((detection, index) => {
      const { bbox, fruit_name, confidence } = detection
      const color = getColorForFruit(fruit_name)
      
      // 绘制边框
      ctx.strokeStyle = color
      ctx.lineWidth = 3
      ctx.strokeRect(
        bbox.x1,
        bbox.y1,
        bbox.x2 - bbox.x1,
        bbox.y2 - bbox.y1
      )
      
      // 绘制标签背景
      const label = `${getFruitDisplayName(fruit_name)} ${(confidence * 100).toFixed(1)}%`
      ctx.font = '16px Arial'
      const textMetrics = ctx.measureText(label)
      const textWidth = textMetrics.width
      const textHeight = 20
      
      ctx.fillStyle = color
      ctx.fillRect(bbox.x1, bbox.y1 - textHeight - 5, textWidth + 10, textHeight + 5)
      
      // 绘制标签文字
      ctx.fillStyle = 'white'
      ctx.fillText(label, bbox.x1 + 5, bbox.y1 - 8)
    })
  }
  img.src = selectedImage.value
}

// 获取水果颜色
const getColorForFruit = (fruitName: string): string => {
  return fruitColors[fruitName] || '#6366f1'
}

// 获取水果显示名称
const getFruitDisplayName = (fruitName: string): string => {
  return fruitNames[fruitName] || fruitName
}

// 格式化时间戳
const formatTimestamp = (timestamp?: number): string => {
  if (!timestamp) return ''
  return new Date(timestamp * 1000).toLocaleString('zh-CN')
}

// 下载结果
const downloadResult = () => {
  if (!resultCanvas.value) return
  
  const link = document.createElement('a')
  link.download = `fruit-detection-${Date.now()}.png`
  link.href = resultCanvas.value.toDataURL()
  link.click()
}
</script>

<style scoped>
.range {
  @apply bg-base-300;
}

.range::-webkit-slider-thumb {
  @apply bg-primary;
}

.range::-moz-range-thumb {
  @apply bg-primary border-primary;
}
</style>