<template>
  <div class="min-h-screen bg-base-100 text-base-content">
    <!-- 页面标题 -->
    <div class="container mx-auto px-4 py-8">
      <RevealMotion :delay="0">
        <div class="text-center mb-8">
          <h1 class="text-3xl md:text-4xl font-bold mb-2">实时水果检测</h1>
          <p class="text-lg opacity-70">开启摄像头进行实时水果识别与计数</p>
        </div>
      </RevealMotion>

      <!-- 主要内容区域 -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- 摄像头画面区域 -->
        <div class="lg:col-span-2">
          <RevealMotion :delay="0.1">
            <div class="card bg-base-200 shadow-lg">
              <div class="card-body">
                <h2 class="card-title mb-4">摄像头画面</h2>
                
                <!-- 摄像头控制按钮 -->
                <div class="flex gap-2 mb-4">
                  <button 
                    @click="startCamera" 
                    :disabled="isStreaming"
                    class="btn btn-primary btn-sm"
                  >
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                    </svg>
                    开启摄像头
                  </button>
                  
                  <button 
                    @click="stopCamera" 
                    :disabled="!isStreaming"
                    class="btn btn-error btn-sm"
                  >
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"></path>
                    </svg>
                    停止摄像头
                  </button>
                  
                  <div class="flex items-center gap-2 ml-auto">
                    <span class="text-sm opacity-70">连接状态:</span>
                    <div class="badge" :class="wsConnected ? 'badge-success' : 'badge-error'">
                      {{ wsConnected ? '已连接' : '未连接' }}
                    </div>
                  </div>
                </div>

                <!-- Canvas 画布 -->
                <div class="relative bg-black rounded-lg overflow-hidden" style="aspect-ratio: 16/9;">
                  <canvas 
                    ref="canvasRef" 
                    class="w-full h-full object-contain"
                    :width="canvasWidth"
                    :height="canvasHeight"
                  ></canvas>
                  
                  <!-- 隐藏的视频元素 -->
                  <video 
                    ref="videoRef" 
                    autoplay 
                    muted 
                    playsinline
                    class="hidden"
                  ></video>
                  
                  <!-- 加载状态 -->
                  <div v-if="isLoading" class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div class="loading loading-spinner loading-lg text-primary"></div>
                  </div>
                  
                  <!-- 错误提示 -->
                  <div v-if="error" class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75">
                    <div class="text-center text-white">
                      <svg class="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                      </svg>
                      <p class="text-sm">{{ error }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </RevealMotion>
        </div>

        <!-- 检测结果面板 -->
        <div class="lg:col-span-1">
          <RevealMotion :delay="0.2">
            <div class="card bg-base-200 shadow-lg">
              <div class="card-body">
                <h2 class="card-title mb-4">检测结果</h2>
                
                <!-- 统计信息 -->
                <div class="stats stats-vertical shadow mb-4">
                  <div class="stat">
                    <div class="stat-title">检测到的水果</div>
                    <div class="stat-value text-primary">{{ detectionStats.totalCount }}</div>
                    <div class="stat-desc">当前帧</div>
                  </div>
                  
                  <div class="stat">
                    <div class="stat-title">处理帧数</div>
                    <div class="stat-value text-secondary">{{ detectionStats.frameCount }}</div>
                    <div class="stat-desc">总计</div>
                  </div>
                  
                  <div class="stat">
                    <div class="stat-title">会话ID</div>
                    <div class="stat-value text-xs">{{ sessionId ? sessionId.slice(-8) : 'N/A' }}</div>
                    <div class="stat-desc">当前会话</div>
                  </div>
                </div>

                <!-- 检测详情列表 -->
                <div class="space-y-2 max-h-96 overflow-y-auto">
                  <h3 class="font-semibold mb-2">检测详情</h3>
                  
                  <div v-if="currentDetections.length === 0" class="text-center py-8 opacity-50">
                    <svg class="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                    </svg>
                    <p class="text-sm">暂无检测结果</p>
                  </div>
                  
                  <div 
                    v-for="(detection, index) in currentDetections" 
                    :key="index"
                    class="card bg-base-100 shadow-sm"
                  >
                    <div class="card-body p-3">
                      <div class="flex items-center justify-between">
                        <div class="flex items-center gap-2">
                          <div 
                            class="w-3 h-3 rounded-full"
                            :style="{ backgroundColor: getFruitColor(detection.fruit_name) }"
                          ></div>
                          <span class="font-medium">{{ getFruitNameCN(detection.fruit_name) }}</span>
                        </div>
                        <div class="badge badge-outline">{{ (detection.confidence * 100).toFixed(1) }}%</div>
                      </div>
                      
                      <div class="text-xs opacity-70 mt-1">
                        位置: ({{ Math.round(detection.bbox.x1) }}, {{ Math.round(detection.bbox.y1) }}) - 
                        ({{ Math.round(detection.bbox.x2) }}, {{ Math.round(detection.bbox.y2) }})
                      </div>
                      
                      <div class="text-xs opacity-70">
                        价格: ¥{{ detection.price }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </RevealMotion>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import WebSocketClient from '@/api/websocket/WebSocket'
import { h, defineComponent, computed } from "vue"
import { Motion } from "motion-v"

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
        { ref: el },
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
const videoRef = ref<HTMLVideoElement>()
const canvasRef = ref<HTMLCanvasElement>()
const isStreaming = ref(false)
const isLoading = ref(false)
const error = ref('')
const wsConnected = ref(false)
const sessionId = ref('')

// Canvas 尺寸
const canvasWidth = 640
const canvasHeight = 480

// 检测结果数据
const currentDetections = ref<any[]>([])
const detectionStats = ref({
  totalCount: 0,
  frameCount: 0
})

// WebSocket 客户端
let wsClient: WebSocketClient | null = null
let mediaStream: MediaStream | null = null
let animationFrameId: number | null = null

// 水果颜色映射
const fruitColors: Record<string, string> = {
  apple: '#ff6b6b',
  orange: '#ffa726',
  banana: '#ffeb3b',
  grape: '#9c27b0',
  strawberry: '#e91e63',
  pear: '#8bc34a',
  peach: '#ffab91',
  kiwi: '#795548'
}

// 水果中文名映射
const fruitNamesCN: Record<string, string> = {
  apple: '苹果',
  orange: '橙子',
  banana: '香蕉',
  grape: '葡萄',
  strawberry: '草莓',
  pear: '梨',
  peach: '桃子',
  kiwi: '猕猴桃'
}

// 获取水果颜色
const getFruitColor = (fruitName: string): string => {
  return fruitColors[fruitName] || '#64748b'
}

// 获取水果中文名
const getFruitNameCN = (fruitName: string): string => {
  return fruitNamesCN[fruitName] || fruitName
}

// 初始化 WebSocket 连接
const initWebSocket = () => {
  const wsUrl = `${import.meta.env.VITE_WEBSOCKET_PATH}/ws/fruit-detection/`
  
  wsClient = new WebSocketClient(wsUrl, {
    onOpen: () => {
      console.log('WebSocket 连接成功')
      wsConnected.value = true
    },
    onMessage: (data) => {
      try {
        const result = JSON.parse(data as string)
        if (result.type === 'detection_success') {
          handleDetectionResult(result)
        }
      } catch (err) {
        console.error('解析 WebSocket 消息失败:', err)
      }
    },
    onClose: () => {
      console.log('WebSocket 连接关闭')
      wsConnected.value = false
    },
    onError: (event) => {
      console.error('WebSocket 错误:', event)
      wsConnected.value = false
    }
  })
  
  wsClient.connect()
}

// 处理检测结果
const handleDetectionResult = (result: any) => {
  currentDetections.value = result.detections || []
  detectionStats.value.totalCount = result.detections?.length || 0
  detectionStats.value.frameCount = result.frame_count || 0
  sessionId.value = result.session_id || ''
  
  // 在 Canvas 上绘制检测结果
  drawDetections(result.detections || [])
}

// 开启摄像头
const startCamera = async () => {
  try {
    isLoading.value = true
    error.value = ''
    
    // 获取摄像头权限
    mediaStream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: canvasWidth },
        height: { ideal: canvasHeight },
        facingMode: 'environment' // 优先使用后置摄像头
      },
      audio: false
    })
    
    if (videoRef.value) {
      videoRef.value.srcObject = mediaStream
      await videoRef.value.play()
      
      isStreaming.value = true
      
      // 初始化 WebSocket 连接
      if (!wsClient) {
        initWebSocket()
      }
      
      // 开始发送视频帧
      startSendingFrames()
    }
  } catch (err: any) {
    console.error('启动摄像头失败:', err)
    error.value = err.message || '无法访问摄像头，请检查权限设置'
  } finally {
    isLoading.value = false
  }
}

// 停止摄像头
const stopCamera = () => {
  isStreaming.value = false
  
  // 停止媒体流
  if (mediaStream) {
    mediaStream.getTracks().forEach(track => track.stop())
    mediaStream = null
  }
  
  // 停止发送帧
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
    animationFrameId = null
  }
  
  // 关闭 WebSocket 连接
  if (wsClient) {
    wsClient.close()
    wsClient = null
    wsConnected.value = false
  }
  
  // 清空检测结果
  currentDetections.value = []
  detectionStats.value = { totalCount: 0, frameCount: 0 }
  sessionId.value = ''
  
  // 清空画布
  clearCanvas()
}

// 开始渲染摄像头画面和发送检测帧
const startSendingFrames = () => {
  let lastSendTime = 0
  const sendInterval = 1000 / 3 // 每秒3帧
  
  const renderAndSend = () => {
    if (!isStreaming.value || !videoRef.value || !canvasRef.value) {
      return
    }
    
    try {
      const canvas = canvasRef.value
      const ctx = canvas.getContext('2d')
      const video = videoRef.value
      
      if (ctx && video.readyState === video.HAVE_ENOUGH_DATA) {
        // 清空画布
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        
        // 实时绘制视频帧到 Canvas
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        
        // 重新绘制检测结果（如果有）
        if (currentDetections.value.length > 0) {
          drawDetections(currentDetections.value)
        }
        
        // 检查是否需要发送检测请求（每秒3帧）
        const currentTime = Date.now()
        if (wsClient?.isConnected() && currentTime - lastSendTime >= sendInterval) {
          // 将 Canvas 转换为 Base64 图片数据
          const imageData = canvas.toDataURL('image/jpeg', 0.8)
          
          // 发送到服务器
          const message = {
            type: 'video_frame',
            frame: imageData
          }
          
          wsClient.send(message)
          lastSendTime = currentTime
        }
      }
    } catch (err) {
      console.error('渲染或发送视频帧失败:', err)
    }
    
    // 继续下一帧（约 30 FPS 渲染）
    animationFrameId = requestAnimationFrame(renderAndSend)
  }
  
  renderAndSend()
}

// 在 Canvas 上绘制检测结果
const drawDetections = (detections: any[]) => {
  if (!canvasRef.value) return
  
  const canvas = canvasRef.value
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  
  // 绘制检测框和标签
  detections.forEach((detection, index) => {
    const { bbox, fruit_name, confidence } = detection
    const color = getFruitColor(fruit_name)
    const label = `${getFruitNameCN(fruit_name)} ${(confidence * 100).toFixed(1)}%`
    
    // 绘制检测框
    ctx.strokeStyle = color
    ctx.lineWidth = 2
    ctx.strokeRect(
      bbox.x1,
      bbox.y1,
      bbox.x2 - bbox.x1,
      bbox.y2 - bbox.y1
    )
    
    // 绘制标签背景
    ctx.fillStyle = color
    ctx.font = '12px sans-serif'
    const textMetrics = ctx.measureText(label)
    const textWidth = textMetrics.width + 8
    const textHeight = 20
    
    ctx.fillRect(
      bbox.x1,
      bbox.y1 - textHeight,
      textWidth,
      textHeight
    )
    
    // 绘制标签文字
    ctx.fillStyle = '#ffffff'
    ctx.fillText(label, bbox.x1 + 4, bbox.y1 - 6)
  })
}

// 清空画布
const clearCanvas = () => {
  if (!canvasRef.value) return
  
  const canvas = canvasRef.value
  const ctx = canvas.getContext('2d')
  if (ctx) {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }
}

// 组件挂载时初始化
onMounted(() => {
  // 设置 Canvas 尺寸
  nextTick(() => {
    if (canvasRef.value) {
      canvasRef.value.width = canvasWidth
      canvasRef.value.height = canvasHeight
    }
  })
})

// 组件卸载时清理资源
onBeforeUnmount(() => {
  stopCamera()
})
</script>

<style scoped>
/* 确保 Canvas 正确显示 */
canvas {
  display: block;
  background-color: #000;
}

/* 滚动条样式 */
.overflow-y-auto::-webkit-scrollbar {
  width: 4px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: rgba(156, 163, 175, 0.3);
  border-radius: 2px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: rgba(156, 163, 175, 0.5);
}
</style>