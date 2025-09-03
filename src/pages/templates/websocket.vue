<template>
  <div class="min-h-full w-full">
    <!-- Header -->
    <section class="relative overflow-hidden">
      <div class="mx-auto max-w-3xl px-4 py-8">
        <div class="flex items-center gap-4">
          <div class="rounded-full w-14 h-14 bg-sky-100 text-sky-600 flex items-center justify-center shadow">
            <el-icon class="text-3xl">
              <Connection />
            </el-icon>
          </div>
          <div>
            <h1 class="text-2xl font-bold tracking-tight">WebSocket 演示</h1>
            <p class="text-gray-500 mt-1 text-sm">演示 WebSocket 实时通信，支持连接、断开、发送与接收消息</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Card -->
    <section class="mx-auto max-w-3xl px-4 pb-10">
      <div class="bg-white/80 backdrop-blur rounded-xl shadow p-6 border border-gray-100/60">
        <form class="flex flex-col sm:flex-row gap-4 items-center mb-6 justify-center" @submit.prevent="handleConnect">
          <button class="btn btn-primary" type="submit" :disabled="isConnected">
            连接
          </button>
          <button class="btn btn-outline btn-error" type="button" @click="handleDisconnect" :disabled="!isConnected">
            断开
          </button>
        </form>

        <div class="mb-4 flex gap-2 items-center">
          <span class="badge" :class="isConnected ? 'badge-success' : 'badge-error'">
            {{ isConnected ? '已连接' : '未连接' }}
          </span>
          <span v-if="statusMsg" class="text-gray-500 text-sm">{{ statusMsg }}</span>
        </div>

        <form class="flex gap-2 mb-6" @submit.prevent="handleSend">
          <input v-model="inputMsg" type="text" class="input input-bordered flex-1" placeholder="输入要发送的消息"
            :disabled="!isConnected" required />
          <button class="btn btn-accent" type="submit" :disabled="!isConnected">发送</button>
        </form>

        <div>
          <h2 class="font-semibold mb-2 text-gray-700">消息记录</h2>
          <div class="h-64 overflow-y-auto bg-gray-50 rounded p-3 border border-gray-100/60">
            <div v-if="messages.length === 0" class="text-gray-400 text-center py-10">暂无消息</div>
            <div v-for="(msg, idx) in messages" :key="idx" class="mb-2 last:mb-0">
              <div :class="[
                'inline-block px-3 py-1 rounded',
                msg.type === 'sent' ? 'bg-sky-100 text-sky-700 ml-auto' : 'bg-emerald-100 text-emerald-700'
              ]" style="max-width: 80%">
                <span class="text-xs opacity-60 mr-2">{{ msg.type === 'sent' ? '我' : '服务端' }}</span>
                {{ msg.text }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Connection } from '@element-plus/icons-vue'
import WebSocketClient from '@/api/websocket/WebSocket'

const url = ref("ws/fruit-detection/") // 默认演示地址
const inputMsg = ref('')
const messages = ref<{ type: 'sent' | 'recv'; text: string }[]>([])
const isConnected = ref(false)
const statusMsg = ref('')
let wsClient: WebSocketClient | null = null

function handleConnect() {
  if (wsClient) return
  statusMsg.value = '正在连接...'
  wsClient = new WebSocketClient(url.value, {
    onOpen: () => {
      isConnected.value = true
      statusMsg.value = '连接成功'
    },
    onMessage: (data) => {
      messages.value.push({ type: 'recv', text: String(data) })
    },
    onClose: () => {
      isConnected.value = false
      statusMsg.value = '连接已关闭'
      wsClient = null
    },
    onError: () => {
      statusMsg.value = '连接出错'
    },
  })
  wsClient.connect()
}

function handleDisconnect() {
  wsClient?.close()
  wsClient = null
}

function handleSend() {
  if (!wsClient || !isConnected.value) return
  wsClient.send(inputMsg.value)
  messages.value.push({ type: 'sent', text: inputMsg.value })
  inputMsg.value = ''
}
</script>

<style scoped>
/* daisyUI + 卡片风格微调 */
.input {
  min-width: 0;
}
</style>