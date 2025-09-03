<template>
  <Teleport to="body">
    <Transition name="modal" appear>
      <div v-if="visible" class="file-upload-modal-overlay" @click="handleOverlayClick">
        <div class="file-upload-modal" @click.stop>
          <!-- 装饰性背景 -->
          <div class="modal-decoration">
            <div class="decoration-circle decoration-circle-1"></div>
            <div class="decoration-circle decoration-circle-2"></div>
            <div class="decoration-circle decoration-circle-3"></div>
          </div>

          <!-- 头部 -->
          <div class="modal-header">
            <div class="header-content">
              <div class="header-icon">
                <div class="icon-wrapper">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor"
                      stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                    <polyline points="14,2 14,8 20,8" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                      stroke-linejoin="round" />
                    <line x1="12" y1="18" x2="12" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                      stroke-linejoin="round" />
                    <line x1="9" y1="15" x2="12" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                      stroke-linejoin="round" />
                    <line x1="15" y1="15" x2="12" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                      stroke-linejoin="round" />
                  </svg>
                </div>
              </div>
              <div class="title-section">
                <h3 class="modal-title">文件上传</h3>
                <p class="modal-subtitle">拖拽文件到此处或点击选择文件</p>
              </div>
            </div>
            <button class="close-button" @click="handleClose">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                  stroke-linejoin="round" />
                <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                  stroke-linejoin="round" />
              </svg>
            </button>
          </div>

          <!-- 内容区 -->
          <div class="modal-content">
            <FileUpload :max-size="maxSize" :accept="accept" :multiple="multiple" @upload="handleFileUpload"
              @success="handleUploadSuccess" @error="handleUploadError" @progress="handleUploadProgress" />
          </div>

          <!-- 底部信息 -->
          <div class="modal-footer">
            <div class="footer-info">
              <div class="info-grid">
                <div class="info-card">
                  <div class="info-icon">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" stroke-width="2"
                        stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                  </div>
                  <div class="info-content">
                    <span class="info-label">最大大小</span>
                    <span class="info-value">{{ formatFileSize(maxSize) }}</span>
                  </div>
                </div>
                <div class="info-card">
                  <div class="info-icon">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor"
                        stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                      <polyline points="14,2 14,8 20,8" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                        stroke-linejoin="round" />
                    </svg>
                  </div>
                  <div class="info-content">
                    <span class="info-label">支持格式</span>
                    <span class="info-value">{{ acceptedTypesText }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import FileUpload from '../FileUpload/index.vue'

// 定义属性
interface Props {
  visible: boolean
  maxSize?: number
  accept?: string
  multiple?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  maxSize: 10 * 1024 * 1024, // 10MB
  accept: '',
  multiple: true
})

// 定义事件
interface Emits {
  (e: 'update:visible', value: boolean): void
  (e: 'upload', files: File[]): void
  (e: 'success', response: any): void
  (e: 'error', error: any): void
  (e: 'progress', progress: any): void
}

const emit = defineEmits<Emits>()

// 计算属性
const acceptedTypes = computed(() => {
  if (!props.accept) return []
  return props.accept.split(',').map(type => type.trim().replace('.', ''))
})

const acceptedTypesText = computed(() => {
  if (acceptedTypes.value.length === 0) return '所有格式'
  return acceptedTypes.value.join(', ')
})

// 方法
const handleClose = () => {
  emit('update:visible', false)
}

const handleOverlayClick = () => {
  handleClose()
}

const handleFileUpload = (files: File[]) => {
  emit('upload', files)
}

const handleUploadSuccess = (response: any) => {
  emit('success', response)
}

const handleUploadError = (error: any) => {
  emit('error', error)
}

const handleUploadProgress = (progress: any) => {
  emit('progress', progress)
}

// 格式化文件大小
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
</script>

<style scoped>
/* 装饰性背景动画 */
@keyframes float {

  0%,
  100% {
    transform: translateY(0px) rotate(0deg);
  }

  33% {
    transform: translateY(-10px) rotate(120deg);
  }

  66% {
    transform: translateY(5px) rotate(240deg);
  }
}

@keyframes pulse {

  0%,
  100% {
    opacity: 0.6;
    transform: scale(1);
  }

  50% {
    opacity: 0.8;
    transform: scale(1.05);
  }
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.file-upload-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(12px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
}

.file-upload-modal {
  background: linear-gradient(145deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 24px;
  box-shadow:
    0 32px 64px rgba(0, 0, 0, 0.15),
    0 0 0 1px rgba(255, 255, 255, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  width: 100%;
  max-width: 640px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  position: relative;
  animation: slideInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.modal-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  overflow: hidden;
  border-radius: 24px;
}

.decoration-circle {
  position: absolute;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(168, 85, 247, 0.1));
  animation: float 6s ease-in-out infinite;
}

.decoration-circle-1 {
  width: 120px;
  height: 120px;
  top: -60px;
  right: -60px;
  animation-delay: 0s;
}

.decoration-circle-2 {
  width: 80px;
  height: 80px;
  bottom: -40px;
  left: -40px;
  animation-delay: 2s;
}

.decoration-circle-3 {
  width: 60px;
  height: 60px;
  top: 50%;
  right: -30px;
  animation-delay: 4s;
}

.modal-header {
  padding: 32px 32px 0;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  position: relative;
  z-index: 1;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 20px;
  flex: 1;
}

.header-icon {
  position: relative;
}

.icon-wrapper {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow:
    0 8px 32px rgba(99, 102, 241, 0.3),
    0 0 0 1px rgba(255, 255, 255, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  animation: pulse 3s ease-in-out infinite;
}

.icon-wrapper svg {
  width: 28px;
  height: 28px;
  color: white;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.title-section {
  flex: 1;
}

.modal-title {
  margin: 0 0 6px 0;
  font-size: 24px;
  font-weight: 700;
  background: linear-gradient(135deg, #1e293b 0%, #475569 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1.2;
}

.modal-subtitle {
  margin: 0;
  font-size: 15px;
  color: #64748b;
  line-height: 1.4;
  font-weight: 500;
}

.close-button {
  width: 40px;
  height: 40px;
  border: none;
  background: rgba(248, 250, 252, 0.8);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  color: #64748b;
  backdrop-filter: blur(8px);
  border: 1px solid rgba(226, 232, 240, 0.5);
}

.close-button:hover {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  transform: scale(1.05);
  border-color: rgba(239, 68, 68, 0.2);
}

.close-button svg {
  width: 20px;
  height: 20px;
  transition: transform 0.2s ease;
}

.close-button:hover svg {
  transform: rotate(90deg);
}

.modal-content {
  padding: 24px 32px;
  flex: 1;
  overflow-y: auto;
  position: relative;
  z-index: 1;
}

.modal-footer {
  padding: 0 32px 32px;
  position: relative;
  z-index: 1;
}

.footer-info {
  margin-top: 24px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

.info-card {
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(226, 232, 240, 0.5);
  border-radius: 16px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  backdrop-filter: blur(8px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.info-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  border-color: rgba(99, 102, 241, 0.2);
}

.info-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(168, 85, 247, 0.1));
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.info-icon svg {
  width: 20px;
  height: 20px;
  color: #6366f1;
}

.info-content {
  flex: 1;
  min-width: 0;
}

.info-label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
}

.info-value {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  word-break: break-word;
}

/* 动画效果 */
.modal-enter-active,
.modal-leave-active {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .file-upload-modal,
.modal-leave-to .file-upload-modal {
  transform: scale(0.9) translateY(-40px);
  opacity: 0;
}

.modal-enter-to .file-upload-modal,
.modal-leave-from .file-upload-modal {
  transform: scale(1) translateY(0);
  opacity: 1;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .file-upload-modal-overlay {
    padding: 16px;
  }

  .file-upload-modal {
    border-radius: 20px;
    max-height: 95vh;
  }

  .modal-header {
    padding: 24px 24px 0;
  }

  .header-content {
    gap: 16px;
  }

  .icon-wrapper {
    width: 48px;
    height: 48px;
  }

  .icon-wrapper svg {
    width: 24px;
    height: 24px;
  }

  .modal-title {
    font-size: 20px;
  }

  .modal-subtitle {
    font-size: 14px;
  }

  .modal-content {
    padding: 20px 24px;
  }

  .modal-footer {
    padding: 0 24px 24px;
  }

  .info-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .info-card {
    padding: 16px;
  }

  .decoration-circle-1 {
    width: 80px;
    height: 80px;
    top: -40px;
    right: -40px;
  }

  .decoration-circle-2 {
    width: 60px;
    height: 60px;
    bottom: -30px;
    left: -30px;
  }

  .decoration-circle-3 {
    display: none;
  }
}

@media (max-width: 480px) {
  .file-upload-modal-overlay {
    padding: 12px;
  }

  .modal-header {
    padding: 20px 20px 0;
  }

  .header-content {
    gap: 12px;
  }

  .modal-content {
    padding: 16px 20px;
  }

  .modal-footer {
    padding: 0 20px 20px;
  }
}
</style>