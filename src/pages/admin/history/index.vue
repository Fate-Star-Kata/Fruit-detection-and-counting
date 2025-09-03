<script setup lang="ts">
import { Motion } from 'motion-v'
import { 
  Search, 
  View, 
  Delete, 
  Refresh, 
  Calendar, 
  Filter,
  Picture,
  DataAnalysis,
  Close
} from '@element-plus/icons-vue'
import { ref, onMounted, computed, reactive, nextTick } from 'vue'
import { 
  getAdminDetections, 
  getAdminDetectionDetail, 
  deleteDetection, 
  batchDeleteDetections 
} from '@/api'

// 获取环境变量中的服务器路径
const serverPath = import.meta.env.VITE_SERVER_PATH || 'http://localhost:8000'
import type { 
  AdminDetectionListParams,
  AdminDetectionRecord,
  AdminDetectionListData,
  AdminDetectionDetail
} from '@/types/apis/PagesApi_T'
import { ElMessage, ElMessageBox } from 'element-plus'

// 响应式数据
const loading = ref(false)
const detectionList = ref<AdminDetectionRecord[]>([])
const total = ref(0)
const selectedIds = ref<number[]>([])
const detailDialogVisible = ref(false)
const currentDetail = ref<AdminDetectionDetail | null>(null)
const canvasRef = ref<HTMLCanvasElement>()
const imageLoaded = ref(false)

// 查询参数
const queryParams = reactive<AdminDetectionListParams>({
  query: '',
  page: 1,
  page_size: 10,
  start_date: '',
  end_date: '',
  min_confidence: undefined
})

// 获取检测记录列表
const fetchDetections = async () => {
  try {
    loading.value = true
    const response = await getAdminDetections(queryParams)
    if (response.code === 200) {
      detectionList.value = response.data.detections
      total.value = response.data.total
    } else {
      ElMessage.error(response.msg || '获取数据失败')
    }
  } catch (error) {
    console.error('获取检测记录失败:', error)
    ElMessage.error('获取检测记录失败')
  } finally {
    loading.value = false
  }
}

// 查看详情
const viewDetail = async (record: AdminDetectionRecord) => {
  try {
    const response = await getAdminDetectionDetail(record.id)
    if (response.code === 200 && response.data) {
      currentDetail.value = response.data
      detailDialogVisible.value = true
      imageLoaded.value = false
      
      // 等待弹窗渲染完成后绘制canvas
      await nextTick()
      drawDetectionCanvas()
    } else {
      ElMessage.error(response.msg || '获取详情失败')
    }
  } catch (error) {
    console.error('获取详情失败:', error)
    ElMessage.error('获取详情失败')
  }
}

// 绘制检测框到canvas
const drawDetectionCanvas = () => {
  if (!currentDetail.value || !canvasRef.value) return
  
  const canvas = canvasRef.value
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  
  const img = new Image()
  img.onload = () => {
    // 设置canvas尺寸
    canvas.width = img.width
    canvas.height = img.height
    
    // 绘制图片
    ctx.drawImage(img, 0, 0)
    
    // 绘制检测框
    const bbox = currentDetail.value!.bbox
    ctx.strokeStyle = '#ff4444'
    ctx.lineWidth = 3
    ctx.strokeRect(
      bbox.x1,
      bbox.y1,
      bbox.x2 - bbox.x1,
      bbox.y2 - bbox.y1
    )
    
    // 绘制标签
    const label = `${currentDetail.value!.fruit_name} (${(currentDetail.value!.confidence * 100).toFixed(1)}%)`
    ctx.fillStyle = '#ff4444'
    ctx.fillRect(bbox.x1, bbox.y1 - 25, ctx.measureText(label).width + 10, 25)
    
    ctx.fillStyle = '#ffffff'
    ctx.font = '16px Arial'
    ctx.fillText(label, bbox.x1 + 5, bbox.y1 - 5)
    
    imageLoaded.value = true
  }
  
  // 优先使用API返回的带标注的图片URL
  let imageUrl = ''
  if (currentDetail.value!.images?.annotated_image_url) {
    imageUrl = `${serverPath}${currentDetail.value!.images.annotated_image_url}`
  } else if (currentDetail.value!.images?.original_image_url) {
    imageUrl = `${serverPath}${currentDetail.value!.images.original_image_url}`
  } else {
    // 回退到之前的逻辑
    imageUrl = `${serverPath}/api/detection-images/${currentDetail.value!.session_id}.jpg`
  }
  
  // 如果图片加载失败，使用示例图片
  img.onerror = () => {
    const svgContent = `
      <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f0f0f0"/>
        <circle cx="200" cy="150" r="80" fill="#ff6b6b"/>
        <text x="200" y="155" text-anchor="middle" font-family="Arial" font-size="16" fill="white">Sample Image</text>
        <text x="200" y="180" text-anchor="middle" font-family="Arial" font-size="12" fill="#666">Image Load Failed</text>
      </svg>
    `
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgContent)
  }
  
  img.src = imageUrl
}

// 删除记录
const deleteRecord = async (id: number) => {
  try {
    await ElMessageBox.confirm('确定要删除这条检测记录吗？', '确认删除', {
      type: 'warning'
    })
    
    const response = await deleteDetection({ detection_id: id })
    if (response.code === 200) {
      ElMessage.success('删除成功')
      await fetchDetections()
    } else {
      ElMessage.error(response.msg || '删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

// 批量删除
const batchDelete = async () => {
  if (selectedIds.value.length === 0) {
    ElMessage.warning('请选择要删除的记录')
    return
  }
  
  try {
    await ElMessageBox.confirm(`确定要删除选中的 ${selectedIds.value.length} 条记录吗？`, '确认批量删除', {
      type: 'warning'
    })
    
    const response = await batchDeleteDetections({ detection_ids: selectedIds.value })
    if (response.code === 200) {
      ElMessage.success('批量删除成功')
      selectedIds.value = []
      await fetchDetections()
    } else {
      ElMessage.error(response.msg || '批量删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量删除失败:', error)
      ElMessage.error('批量删除失败')
    }
  }
}

// 重置查询
const resetQuery = () => {
  Object.assign(queryParams, {
    query: '',
    page: 1,
    page_size: 10,
    start_date: '',
    end_date: '',
    min_confidence: undefined
  })
  fetchDetections()
}

// 处理分页
const handlePageChange = (page: number) => {
  queryParams.page = page
  fetchDetections()
}

const handleSizeChange = (size: number) => {
  queryParams.page_size = size
  queryParams.page = 1
  fetchDetections()
}

// 处理选择
const handleSelectionChange = (selection: AdminDetectionRecord[]) => {
  selectedIds.value = selection.map(item => item.id)
}

// 格式化置信度
const formatConfidence = (confidence: number) => {
  return (confidence * 100).toFixed(1) + '%'
}

// 格式化时间
const formatTime = (timeStr: string) => {
  return new Date(timeStr).toLocaleString('zh-CN')
}

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
  'strawberry': '#ff6b9d',
  'water melon': '#4ade80'
}

const getFruitColor = (fruitName: string) => {
  return fruitColors[fruitName] || '#6b7280'
}

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

// 页面加载时获取数据
onMounted(() => {
  fetchDetections()
})
</script>

<template>
  <div class="history-page">
    <!-- 页面标题和操作区 -->
    <Motion 
      :initial="cardVariants.initial" 
      :animate="cardVariants.animate" 
      :whileHover="cardVariants.whileHover as any"
      :transition="{ ...cardVariants.transition, delay: 0.1 } as any"
    >
      <el-card class="mb-6">
        <template #header>
          <div class="flex items-center justify-between">
            <span class="text-lg font-medium">检测历史记录</span>
            <div class="flex items-center space-x-2">
              <Motion 
                :initial="{ scale: 0.8, opacity: 0 }" 
                :animate="{ scale: 1, opacity: 1 }"
                :whileHover="{ scale: 1.05 }" 
                :transition="{ duration: 0.3, delay: 0.3 }"
              >
                <el-button 
                  type="danger" 
                  :icon="Delete" 
                  :disabled="selectedIds.length === 0"
                  @click="batchDelete"
                >
                  批量删除 ({{ selectedIds.length }})
                </el-button>
              </Motion>
              <Motion 
                :initial="{ scale: 0.8, opacity: 0 }" 
                :animate="{ scale: 1, opacity: 1 }"
                :whileHover="{ scale: 1.05 }" 
                :transition="{ duration: 0.3, delay: 0.4 }"
              >
                <el-button 
                  type="primary" 
                  :icon="Refresh" 
                  :loading="loading" 
                  @click="fetchDetections"
                >
                  刷新
                </el-button>
              </Motion>
            </div>
          </div>
        </template>

        <!-- 查询条件 -->
        <Motion 
          :initial="{ opacity: 0, y: 20 }" 
          :animate="{ opacity: 1, y: 0 }"
          :transition="{ duration: 0.4, delay: 0.2 }"
        >
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <el-input
              v-model="queryParams.query"
              placeholder="搜索水果名称"
              :prefix-icon="Search"
              clearable
              @keyup.enter="fetchDetections"
            />
            
            <el-date-picker
              v-model="queryParams.start_date"
              type="date"
              placeholder="开始日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              :prefix-icon="Calendar"
            />
            
            <el-date-picker
              v-model="queryParams.end_date"
              type="date"
              placeholder="结束日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              :prefix-icon="Calendar"
            />
            
            <el-input-number
              v-model="queryParams.min_confidence"
              placeholder="最小置信度"
              :min="0"
              :max="1"
              :step="0.1"
              :precision="1"
              class="w-full"
            />
          </div>
          
          <div class="flex justify-end space-x-2">
            <el-button @click="resetQuery">重置</el-button>
            <el-button type="primary" :icon="Search" @click="fetchDetections">搜索</el-button>
          </div>
        </Motion>
      </el-card>
    </Motion>

    <!-- 数据表格 -->
    <Motion 
      :initial="cardVariants.initial" 
      :animate="cardVariants.animate" 
      :whileHover="cardVariants.whileHover as any"
      :transition="{ ...cardVariants.transition, delay: 0.3 } as any"
    >
      <el-card>
        <Motion 
          :initial="{ opacity: 0, scale: 0.95 }" 
          :animate="{ opacity: 1, scale: 1 }"
          :transition="{ duration: 0.5, delay: 0.4 }"
        >
          <el-table
            :data="detectionList"
            :loading="loading"
            @selection-change="handleSelectionChange"
            stripe
            class="w-full m-auto"
          >
            <el-table-column type="selection" width="55" />
            
            <el-table-column prop="id" label="ID" width="80" />
            
            <el-table-column label="水果类型" width="160">
              <template #default="{ row }">
                <div class="flex items-center space-x-2">
                  <div 
                    class="w-3 h-3 rounded-full"
                    :style="{ backgroundColor: getFruitColor(row.fruit_name) }"
                  ></div>
                  <span>{{ row.fruit_name }}</span>
                </div>
              </template>
            </el-table-column>
            
            <el-table-column label="置信度" width="150">
              <template #default="{ row }">
                <el-tag 
                  :type="row.confidence >= 0.8 ? 'success' : row.confidence >= 0.6 ? 'warning' : 'danger'"
                  size="small"
                >
                  {{ formatConfidence(row.confidence) }}
                </el-tag>
              </template>
            </el-table-column>
            
            <el-table-column label="检测框" width="250">
              <template #default="{ row }">
                <div class="text-xs text-gray-500">
                  ({{ Math.round(row.bbox.x1) }}, {{ Math.round(row.bbox.y1) }}) - 
                  ({{ Math.round(row.bbox.x2) }}, {{ Math.round(row.bbox.y2) }})
                </div>
              </template>
            </el-table-column>
            
            <el-table-column prop="detection_time" label="检测时间" width="250">
              <template #default="{ row }">
                {{ formatTime(row.detection_time) }}
              </template>
            </el-table-column>
            
            <el-table-column prop="session_id" label="会话ID" width="380" show-overflow-tooltip />
            
            <el-table-column label="操作" width="220" fixed="right">
              <template #default="{ row }">
                <div class="flex space-x-1">
                  <el-button 
                    type="primary" 
                    :icon="View" 
                    size="small" 
                    @click="viewDetail(row)"
                  >
                    详情
                  </el-button>
                  <el-button 
                    type="danger" 
                    :icon="Delete" 
                    size="small" 
                    @click="deleteRecord(row.id)"
                  >
                    删除
                  </el-button>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </Motion>
        
        <!-- 分页 -->
        <Motion 
          :initial="{ opacity: 0, y: 20 }" 
          :animate="{ opacity: 1, y: 0 }"
          :transition="{ duration: 0.4, delay: 0.5 }"
        >
          <div class="flex justify-center mt-6">
            <el-pagination
              v-model:current-page="queryParams.page"
              v-model:page-size="queryParams.page_size"
              :page-sizes="[10, 20, 50, 100]"
              :total="total"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="handleSizeChange"
              @current-change="handlePageChange"
            />
          </div>
        </Motion>
      </el-card>
    </Motion>

    <!-- 详情弹窗 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="检测详情"
      width="800px"
      :before-close="() => { detailDialogVisible = false; currentDetail = null }"
    >
      <div v-if="currentDetail" class="space-y-6">
        <!-- 基本信息 -->
        <Motion 
          :initial="{ opacity: 0, y: 20 }" 
          :animate="{ opacity: 1, y: 0 }"
          :transition="{ duration: 0.4 }"
        >
          <el-card>
            <template #header>
              <div class="flex items-center space-x-2">
                <el-icon><DataAnalysis /></el-icon>
                <span>基本信息</span>
              </div>
            </template>
            
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="text-sm font-medium text-gray-600">检测ID:</label>
                <p class="text-lg">{{ currentDetail.id }}</p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-600">水果类型:</label>
                <div class="flex items-center space-x-2">
                  <div 
                    class="w-4 h-4 rounded-full"
                    :style="{ backgroundColor: getFruitColor(currentDetail.fruit_name) }"
                  ></div>
                  <p class="text-lg">{{ currentDetail.fruit_name }}</p>
                </div>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-600">置信度:</label>
                <p class="text-lg">
                  <el-tag 
                    :type="currentDetail.confidence >= 0.8 ? 'success' : currentDetail.confidence >= 0.6 ? 'warning' : 'danger'"
                  >
                    {{ formatConfidence(currentDetail.confidence) }}
                  </el-tag>
                </p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-600">水果数量:</label>
                <p class="text-lg">
                  <el-tag type="info">{{ currentDetail.fruit_count }}</el-tag>
                </p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-600">检测时间:</label>
                <p class="text-lg">{{ formatTime(currentDetail.detection_time) }}</p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-600">检测框面积:</label>
                <p class="text-lg">{{ Math.round(currentDetail.detection_metadata?.bbox_area || 0) }} px²</p>
              </div>
              <div class="col-span-2">
                <label class="text-sm font-medium text-gray-600">会话ID:</label>
                <p class="text-lg font-mono">{{ currentDetail.session_id }}</p>
              </div>
              <div class="col-span-2">
                <label class="text-sm font-medium text-gray-600">检测框坐标:</label>
                <p class="text-lg font-mono">
                  左上角: ({{ Math.round(currentDetail.bbox.x1) }}, {{ Math.round(currentDetail.bbox.y1) }}) - 
                  右下角: ({{ Math.round(currentDetail.bbox.x2) }}, {{ Math.round(currentDetail.bbox.y2) }})
                </p>
              </div>
              <div class="col-span-2" v-if="currentDetail.detection_metadata?.bbox_center">
                <label class="text-sm font-medium text-gray-600">检测框中心:</label>
                <p class="text-lg font-mono">
                  ({{ Math.round(currentDetail.detection_metadata.bbox_center.x) }}, {{ Math.round(currentDetail.detection_metadata.bbox_center.y) }})
                </p>
              </div>
            </div>
          </el-card>
        </Motion>
        
        <!-- 会话统计信息 -->
        <Motion 
          :initial="{ opacity: 0, y: 20 }" 
          :animate="{ opacity: 1, y: 0 }"
          :transition="{ duration: 0.4, delay: 0.3 }"
          v-if="currentDetail.session_statistics"
        >
          <el-card>
            <template #header>
              <div class="flex items-center space-x-2">
                <el-icon><DataAnalysis /></el-icon>
                <span>会话统计信息</span>
              </div>
            </template>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div class="text-center">
                <div class="text-2xl font-bold text-blue-600">{{ currentDetail.session_statistics.total_fruits_in_session }}</div>
                <div class="text-sm text-gray-500">会话总水果数</div>
              </div>
              <div class="text-center">
                <div class="text-2xl font-bold text-green-600">{{ currentDetail.session_statistics.total_detections_in_session }}</div>
                <div class="text-sm text-gray-500">会话总检测次数</div>
              </div>
              <div class="text-center">
                <div class="text-2xl font-bold text-purple-600">{{ Object.keys(currentDetail.session_statistics.fruit_counts).length }}</div>
                <div class="text-sm text-gray-500">水果种类数</div>
              </div>
            </div>
            
            <div class="mt-4" v-if="Object.keys(currentDetail.session_statistics.fruit_counts).length > 0">
              <h4 class="text-sm font-medium text-gray-600 mb-2">各类水果统计:</h4>
              <div class="flex flex-wrap gap-2">
                <el-tag 
                  v-for="(count, fruitName) in currentDetail.session_statistics.fruit_counts" 
                  :key="fruitName"
                  :color="getFruitColor(fruitName)"
                  effect="dark"
                  class="text-white"
                >
                  {{ fruitName }}: {{ count }}
                </el-tag>
              </div>
            </div>
          </el-card>
        </Motion>
        
        <!-- 检测结果可视化 -->
        <Motion 
          :initial="{ opacity: 0, y: 20 }" 
          :animate="{ opacity: 1, y: 0 }"
          :transition="{ duration: 0.4, delay: 0.4 }"
        >
          <el-card>
            <template #header>
              <div class="flex items-center space-x-2">
                <el-icon><Picture /></el-icon>
                <span>检测结果可视化</span>
              </div>
            </template>
            
            <div class="text-center">
              <div v-if="!imageLoaded" class="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
                <div class="text-center">
                  <el-icon size="48" class="text-gray-400 mb-2"><Picture /></el-icon>
                  <p class="text-gray-500">正在加载图片...</p>
                </div>
              </div>
              
              <canvas 
                ref="canvasRef" 
                class="w-full h-auto border border-gray-200 rounded-lg shadow-sm"
                :class="{ 'hidden': !imageLoaded }"
              ></canvas>
              
              <p class="text-sm text-gray-500 mt-2">
                红色框标识检测到的 {{ currentDetail.fruit_name }}，置信度: {{ formatConfidence(currentDetail.confidence) }}
              </p>
            </div>
          </el-card>
        </Motion>
      </div>
      
      <template #footer>
        <div class="flex justify-end">
          <el-button @click="detailDialogVisible = false">
            <el-icon><Close /></el-icon>
            关闭
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.history-page {
  width: 100%;
  padding: 0;
}

/* 表格样式优化 */
:deep(.el-table) {
  border-radius: 8px;
  overflow: hidden;
}

:deep(.el-table__header) {
  background-color: #f8fafc;
}

:deep(.el-table__row:hover) {
  background-color: #f1f5f9;
}

/* 卡片样式 */
.el-card {
  border-radius: 12px;
  border: none;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  transition: box-shadow 0.3s ease;
}

.el-card:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
}

/* 响应式优化 */
@media (max-width: 768px) {
  .grid {
    grid-template-columns: 1fr;
  }
  
  .flex.space-x-2 {
    flex-direction: column;
    space-x: 0;
    gap: 0.5rem;
  }
}

/* 动画优化 */
@media (prefers-reduced-motion: reduce) {
  .el-card {
    transition: none;
  }
}
</style>
