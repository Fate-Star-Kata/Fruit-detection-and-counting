<template>
  <div class="min-h-screen bg-base-100 text-base-content">
    <!-- 页面标题 -->
    <div class="bg-base-200 border-b border-base-300">
      <div class="container mx-auto px-4 py-6">
        <RevealMotion :delay="0">
          <h1 class="text-3xl font-bold text-center">检测历史记录</h1>
          <p class="text-center text-base-content/70 mt-2">查看您的水果检测历史记录和详细结果</p>
        </RevealMotion>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="container mx-auto px-4 py-8">
      <!-- 筛选和搜索区域 -->
      <RevealMotion :delay="0.1">
        <div class="card bg-base-200 shadow-sm mb-6">
          <div class="card-body p-4">
            <div class="flex flex-col items-end md:flex-row gap-4 items-center">
              <!-- 水果名称筛选 -->
              <div class="form-control">
                <label class="label">
                  <span class="label-text">水果名称</span>
                </label>
                <input 
                  type="text" 
                  v-model="filters.fruit_name" 
                  placeholder="输入水果名称筛选"
                  class="input input-bordered input-sm"
                  @input="applyFilters"
                />
              </div>
              
              <!-- 显示数量限制 -->
              <div class="form-control">
                <label class="label">
                  <span class="label-text">显示数量</span>
                </label>
                <select 
                  v-model="filters.limit" 
                  class="select select-bordered select-sm"
                  @change="applyFilters"
                >
                  <option value="20">20条</option>
                  <option value="50">50条</option>
                  <option value="100">100条</option>
                </select>
              </div>
              
              <!-- 刷新按钮 -->
              <div class="form-control">
                <label class="label">
                  <span class="label-text">&nbsp;</span>
                </label>
                <button 
                  class="btn btn-primary btn-sm"
                  @click="refreshHistory"
                  :disabled="loading"
                >
                  <span v-if="loading" class="loading loading-spinner loading-xs"></span>
                  刷新
                </button>
              </div>
              
              <!-- 统计信息 -->
              <div class="form-control">
                <label class="label">
                  <span class="label-text">统计</span>
                </label>
                <div class="text-sm text-base-content/70">
                  显示 {{ historyStats.returned_count }} / {{ historyStats.total_count }} 条记录
                </div>
              </div>
            </div>
          </div>
        </div>
      </RevealMotion>

      <!-- 历史记录列表 -->
      <RevealMotion :delay="0.2">
        <div class="space-y-4">
          <!-- 加载状态 -->
          <div v-if="loading" class="flex justify-center py-8">
            <span class="loading loading-spinner loading-lg"></span>
          </div>

          <!-- 空状态 -->
          <div v-else-if="!historyList.length" class="text-center py-12">
            <div class="text-6xl mb-4">📱</div>
            <h3 class="text-xl font-semibold mb-2">暂无检测记录</h3>
            <p class="text-base-content/70">开始您的第一次水果检测吧！</p>
            <router-link to="/user/recognize" class="btn btn-primary mt-4">
              开始检测
            </router-link>
          </div>

          <!-- 历史记录卡片 -->
          <div v-else class="grid gap-4">
            <div 
              v-for="(record, index) in historyList" 
              :key="record.id"
              class="card bg-base-200 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
              @click="viewDetail(record)"
            >
              <div class="card-body p-4">
                <div class="flex items-center justify-between">
                  <div class="flex-1">
                    <div class="flex items-center gap-3 mb-2">
                      <div class="avatar">
                        <div class="w-12 h-12 rounded-lg overflow-hidden bg-primary/10 flex items-center justify-center">
                          <img 
                            v-if="record.images?.original_image_url"
                            :src="getImageUrl(record.images.original_image_url)"
                            :alt="getFruitName(record.fruit_name)"
                            class="w-full h-full object-cover"
                          />
                          <span v-else class="text-primary text-xl">🍎</span>
                        </div>
                      </div>
                      <div>
                        <h3 class="font-semibold">{{ getFruitName(record.fruit_name) }}</h3>
                        <p class="text-sm text-base-content/70">
                          {{ formatDate(record.detection_time) }}
                        </p>
                      </div>
                    </div>
                    
                    <div class="flex flex-wrap gap-2 mb-2">
                      <div class="badge badge-primary badge-sm">
                        置信度 {{ (record.confidence * 100).toFixed(1) }}%
                      </div>
                      <div class="badge badge-secondary badge-sm">
                        会话 #{{ record.session_id }}
                      </div>
                    </div>
                    
                    <!-- 边界框信息 -->
                    <div class="text-xs text-base-content/60 mt-2">
                      左上角: ({{ record.bbox.x1 }}, {{ record.bbox.y1 }}) 
                      右下角: ({{ record.bbox.x2 }}, {{ record.bbox.y2 }})
                    </div>
                  </div>
                  
                  <div class="text-right">
                    <button class="btn btn-ghost btn-sm">
                      查看详情
                      <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 加载更多提示 -->
          <div v-if="historyStats.returned_count < historyStats.total_count" class="text-center mt-6">
            <p class="text-sm text-base-content/70 mb-2">
              已显示 {{ historyStats.returned_count }} 条，还有 {{ historyStats.total_count - historyStats.returned_count }} 条记录
            </p>
            <div v-if="loadingMore" class="flex justify-center py-4">
              <span class="loading loading-spinner loading-md"></span>
              <span class="ml-2 text-sm text-base-content/70">正在加载更多...</span>
            </div>
          </div>
          
          <!-- 滚动加载触发器 -->
          <div ref="loadMoreTrigger" class="h-4"></div>
        </div>
      </RevealMotion>
    </div>

    <!-- 详情模态框 -->
    <dialog ref="detailModal" class="modal">
      <div class="modal-box max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-bold text-lg">{{ getFruitName(selectedRecord?.fruit_name || '') }} - 检测详情</h3>
          <button class="btn btn-sm btn-circle btn-ghost" @click="closeDetail">
            ✕
          </button>
        </div>
        
        <div v-if="selectedRecord" class="flex-1 overflow-auto">
          <!-- 基本信息 -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div class="card bg-base-200">
              <div class="card-body p-4">
                <h4 class="font-semibold mb-2">检测信息</h4>
                <div class="space-y-2 text-sm">
                  <div class="flex justify-between">
                    <span>检测时间：</span>
                    <span>{{ formatDate(selectedRecord.detection_time) }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span>水果类型：</span>
                    <span>{{ getFruitName(selectedRecord.fruit_name) }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span>置信度：</span>
                    <span>{{ (selectedRecord.confidence * 100).toFixed(1) }}%</span>
                  </div>
                  <div class="flex justify-between">
                    <span>会话ID：</span>
                    <span>#{{ selectedRecord.session_id }}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="card bg-base-200">
              <div class="card-body p-4">
                <h4 class="font-semibold mb-2">边界框信息</h4>
                <div class="space-y-2 text-sm">
                  <div class="flex justify-between">
                    <span>左上角X：</span>
                    <span>{{ selectedRecord.bbox.x1 }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span>左上角Y：</span>
                    <span>{{ selectedRecord.bbox.y1 }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span>右下角X：</span>
                    <span>{{ selectedRecord.bbox.x2 }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span>右下角Y：</span>
                    <span>{{ selectedRecord.bbox.y2 }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 图片显示 -->
          <div class="card bg-base-200">
            <div class="card-body p-4">
              <h4 class="font-semibold mb-4">检测结果图片</h4>
              
              <!-- 图片选项卡 -->
              <div class="tabs tabs-boxed mb-4">
                <a class="tab" :class="{ 'tab-active': activeImageTab === 'original' }" @click="activeImageTab = 'original'">原始图片</a>
                <a class="tab" :class="{ 'tab-active': activeImageTab === 'annotated' }" @click="activeImageTab = 'annotated'">标注图片</a>
              </div>
              
              <!-- 图片容器 -->
              <div class="relative bg-base-100 rounded-lg p-4 overflow-auto">
                <div v-if="activeImageTab === 'original'" class="text-center">
                  <img 
                    v-if="selectedRecord.images?.original_image_url"
                    :src="getImageUrl(selectedRecord.images.original_image_url)"
                    :alt="'原始图片 - ' + getFruitName(selectedRecord.fruit_name)"
                    class="max-w-full h-auto border border-base-300 rounded"
                    @load="imageLoading = false"
                    @error="imageLoading = false"
                  />
                  <div v-else class="text-base-content/50 py-8">
                    原始图片不可用
                  </div>
                </div>
                
                <div v-if="activeImageTab === 'annotated'" class="text-center">
                  <img 
                    v-if="selectedRecord.images?.annotated_image_url"
                    :src="getImageUrl(selectedRecord.images.annotated_image_url)"
                    :alt="'标注图片 - ' + getFruitName(selectedRecord.fruit_name)"
                    class="max-w-full h-auto border border-base-300 rounded"
                    @load="imageLoading = false"
                    @error="imageLoading = false"
                  />
                  <div v-else class="text-base-content/50 py-8">
                    标注图片不可用
                  </div>
                </div>
                
                <!-- 加载状态 -->
                <div v-if="imageLoading" class="absolute inset-0 flex items-center justify-center bg-base-100/80">
                  <span class="loading loading-spinner loading-lg"></span>
                </div>
              </div>
              
              <!-- 图片信息 -->
              <div class="mt-4 text-sm text-base-content/70">
                <div class="grid grid-cols-2 gap-4">
                  <div v-if="selectedRecord.images?.original_image">
                    <strong>原始图片:</strong> {{ selectedRecord.images.original_image }}
                  </div>
                  <div v-if="selectedRecord.images?.annotated_image">
                    <strong>标注图片:</strong> {{ selectedRecord.images.annotated_image }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop">
        <button @click="closeDetail">关闭</button>
      </form>
    </dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, computed, h, defineComponent, onBeforeUnmount } from 'vue'
import { getDetectionHistory } from '@/api'
import type { DetectionHistoryResponse, DetectionHistoryParams, DetectionHistory } from '@/types/apis/PagesApi_T'
import { Motion } from 'motion-v'

// 获取服务器路径前缀
const serverPath = import.meta.env.VITE_SERVER_PATH || ''

// RevealMotion 组件定义
type RevealProps = { delay?: number }
const RevealMotion = defineComponent<RevealProps>({
  name: "RevealMotion",
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
      h(
        "div",
        {
          ref: el,
        },
        [
          h(
            Motion as any,
            {
              initial: { opacity: 0, y: 16 },
              animate: animateProps.value,
            },
            slots
          )
        ]
      )
  },
})

// 响应式数据
const loading = ref(false)
const loadingMore = ref(false)
const imageLoading = ref(false)
const historyList = ref<DetectionHistory[]>([])
const selectedRecord = ref<DetectionHistory | null>(null)
const detailModal = ref<HTMLDialogElement>()
const loadMoreTrigger = ref<HTMLElement>()
const activeImageTab = ref<'original' | 'annotated'>('original')

// 筛选条件
const filters = ref({
  fruit_name: '',
  limit: 50
})

// 历史记录统计
const historyStats = ref({
  total_count: 0,
  returned_count: 0
})

// 水果颜色映射
const fruitColors: Record<string, string> = {
  apple: '#ff6b6b',
  orange: '#ffa726',
  banana: '#ffeb3b',
  grape: '#9c27b0',
  strawberry: '#e91e63',
  pear: '#8bc34a',
  peach: '#ffab91',
  kiwi: '#795548',
  pineapple: '#ff9800',
  watermelon: '#4caf50'
}

// 水果中文名映射
const fruitNames: Record<string, string> = {
  apple: '苹果',
  orange: '橙子',
  banana: '香蕉',
  grape: '葡萄',
  strawberry: '草莓',
  pear: '梨',
  peach: '桃子',
  kiwi: '猕猴桃',
  pineapple: '菠萝',
  watermelon: '西瓜'
}

// 获取水果颜色
const getFruitColor = (className: string): string => {
  return fruitColors[className] || '#64748b'
}

// 获取水果中文名
const getFruitName = (className: string): string => {
  return fruitNames[className] || className
}

// 格式化日期
const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 获取完整图片URL
const getImageUrl = (imageUrl: string | undefined): string => {
  if (!imageUrl) return ''
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl
  }
  return `${serverPath}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`
}



// 加载历史记录
const loadHistory = async (append = false) => {
  try {
    if (append) {
      loadingMore.value = true
    } else {
      loading.value = true
      historyList.value = [] // 重新加载时清空列表
    }
    
    const params: DetectionHistoryParams = {
      limit: append ? filters.value.limit + 50 : filters.value.limit
    }
    
    if (filters.value.fruit_name) {
      params.fruit_name = filters.value.fruit_name
    }
    
    const response = await getDetectionHistory(params)
     
    if (append) {
      // 追加模式：只添加新数据
      const newData = response.data.history || []
      const existingIds = new Set(historyList.value.map(item => item.id))
      const uniqueNewData = newData.filter(item => !existingIds.has(item.id))
      historyList.value = [...historyList.value, ...uniqueNewData]
      filters.value.limit = params.limit || 50 // 更新limit，如果为undefined则使用默认值50
    } else {
      // 替换模式：完全替换
      historyList.value = response.data.history || []
    }
    
    historyStats.value.total_count = response.data.total_count || 0
    historyStats.value.returned_count = response.data.returned_count || 0
    
  } catch (error) {
    console.error('加载历史记录失败:', error)
    // 这里可以添加错误提示
  } finally {
    loading.value = false
    loadingMore.value = false
  }
}

// 刷新历史记录
const refreshHistory = () => {
  filters.value.limit = 50 // 重置limit
  loadHistory(false)
}

// 应用筛选
const applyFilters = () => {
  loadHistory(false)
}

// 加载更多数据
const loadMore = () => {
  if (loadingMore.value || loading.value) return
  if (historyStats.value.returned_count >= historyStats.value.total_count) return
  
  loadHistory(true)
}

// 查看详情
const viewDetail = (record: DetectionHistory) => {
  selectedRecord.value = record
  activeImageTab.value = 'annotated'
  imageLoading.value = true
  detailModal.value?.showModal()
}

// 关闭详情
const closeDetail = () => {
  detailModal.value?.close()
  selectedRecord.value = null
  imageLoading.value = false
}



// 生命周期
let observer: IntersectionObserver | null = null

onMounted(() => {
  loadHistory()
  
  // 设置无限滚动监听器
  nextTick(() => {
    if (loadMoreTrigger.value) {
      observer = new IntersectionObserver(
        (entries) => {
          const entry = entries[0]
          if (entry.isIntersecting) {
            loadMore()
          }
        },
        {
          rootMargin: '100px' // 提前100px触发加载
        }
      )
      observer.observe(loadMoreTrigger.value)
    }
  })
})

onBeforeUnmount(() => {
  if (observer) {
    observer.disconnect()
  }
})
</script>

<style scoped>
.modal-box {
  max-height: 90vh;
}

.table th,
.table td {
  padding: 0.5rem;
}

canvas {
  max-width: 100%;
  height: auto;
}
</style>
