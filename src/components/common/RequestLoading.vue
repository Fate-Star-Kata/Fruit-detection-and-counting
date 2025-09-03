<template>
  <Teleport to="body">
    <Transition name="fade">
      <div class="fixed inset-0 z-[9998] flex items-center justify-center backdrop-blur-[3.5px] bg-black/18"
        @click.stop>
        <div class="flex flex-col items-center space-y-4">
          <!-- 现代点状加载动画 -->
          <div class="loading-spinner">
            <div class="spinner-ring"></div>
            <div class="spinner-ring"></div>
            <div class="spinner-ring"></div>
          </div>

          <!-- 加载文本 -->
          <div class="text-white text-sm font-medium">
            {{ loadingText }}
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRequestLoadingStore } from '@/stores/common/requestLoading'

const requestLoadingStore = useRequestLoadingStore()

const loadingText = computed(() => requestLoadingStore.loadingText)
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 环形加载动画 */
.loading-spinner {
  position: relative;
  width: 40px;
  height: 40px;
}

.spinner-ring {
  position: absolute;
  width: 100%;
  height: 100%;
  border: 2px solid transparent;
  border-radius: 50%;
  animation: spin 2s linear infinite;
}

.spinner-ring:nth-child(1) {
  border-top-color: #3b82f6;
  animation-delay: 0s;
}

.spinner-ring:nth-child(2) {
  border-right-color: #8b5cf6;
  animation-delay: -0.5s;
  width: 80%;
  height: 80%;
  top: 10%;
  left: 10%;
}

.spinner-ring:nth-child(3) {
  border-bottom-color: #06d6a0;
  animation-delay: -1s;
  width: 60%;
  height: 60%;
  top: 20%;
  left: 20%;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}
</style>
