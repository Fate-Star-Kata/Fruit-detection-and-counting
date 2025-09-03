// WebSocketClient.ts
type WebSocketCallbacks = {
  onOpen?: () => void // 连接成功回调
  onMessage?: (data: string | ArrayBuffer | Blob) => void // 收到消息回调
  onClose?: (event: CloseEvent) => void // 连接关闭回调
  onError?: (event: Event) => void // 连接错误回调
}

interface WebSocketOptions {
  reconnectInterval?: number // 重连间隔 ms
  maxReconnectAttempts?: number // 最大重连次数
  heartbeatInterval?: number // 心跳间隔 ms
  heartbeatMsg?: string // 心跳消息
}

export default class WebSocketClient {
  private ws: WebSocket | null = null
  private url: string
  private callbacks: WebSocketCallbacks
  private options: Required<WebSocketOptions>
  private reconnectAttempts = 0
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null
  private manualClose = false // 是否手动关闭

  constructor(url: string, callbacks: WebSocketCallbacks = {}, options: WebSocketOptions = {}) {
    this.url = url
    this.callbacks = callbacks

    // 默认配置
    this.options = {
      reconnectInterval: options.reconnectInterval ?? 3000,
      maxReconnectAttempts: options.maxReconnectAttempts ?? 5,
      heartbeatInterval: options.heartbeatInterval ?? 20000,
      heartbeatMsg: options.heartbeatMsg ?? 'ping',
    }
  }

  // 建立连接
  connect() {
    if (this.ws) {
      console.warn('WebSocket 已连接，无法重复连接')
      return
    }

    this.manualClose = false
    this.ws = new WebSocket(this.url)

    this.ws.onopen = () => {
      this.callbacks.onOpen?.()
      this.reconnectAttempts = 0 // 重连计数清零
      this.startHeartbeat()
    }

    this.ws.onmessage = (event: MessageEvent) => {
      this.callbacks.onMessage?.(event.data)
    }

    this.ws.onclose = (event: CloseEvent) => {
      this.callbacks.onClose?.(event)
      this.ws = null
      this.stopHeartbeat()

      if (!this.manualClose) {
        this.tryReconnect()
      }
    }

    this.ws.onerror = (event: Event) => {
      this.callbacks.onError?.(event)
    }
  }

  // 尝试重连
  private tryReconnect() {
    if (this.reconnectAttempts >= this.options.maxReconnectAttempts) {
      console.warn('已达到最大重连次数，停止重连')
      return
    }

    this.reconnectAttempts++
    setTimeout(() => {
      console.log(`🔄 正在重连... (第 ${this.reconnectAttempts} 次)`)
      this.connect()
    }, this.options.reconnectInterval)
  }

  // 启动心跳
  private startHeartbeat() {
    this.stopHeartbeat()
    this.heartbeatTimer = setInterval(() => {
      if (this.isConnected()) {
        this.send(this.options.heartbeatMsg)
      }
    }, this.options.heartbeatInterval)
  }

  // 停止心跳
  private stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
    }
  }

  // 发送消息
  send(data: string | object | ArrayBuffer | Blob) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.error('WebSocket 未连接，无法发送消息')
      return
    }

    if (typeof data === 'object' && !(data instanceof ArrayBuffer) && !(data instanceof Blob)) {
      this.ws.send(JSON.stringify(data)) // 对象自动转 JSON
    } else {
      this.ws.send(data)
    }
  }

  // 手动关闭
  close(code?: number, reason?: string) {
    this.manualClose = true
    this.stopHeartbeat()
    if (this.ws) {
      this.ws.close(code, reason)
      this.ws = null
    }
  }

  // 是否连接中
  isConnected() {
    return this.ws?.readyState === WebSocket.OPEN
  }
}
