import http from '@/http/index'

// 统一的API响应类型
interface ApiResponse<T> {
  success: boolean
  msg: string
  data: T
  code: number
}

// CPU监控信息类型
interface CpuInfo {
  cpu_percent: number
  cpu_count: number
  cpu_freq: {
    current: number
    min: number
    max: number
  }
  timestamp: string
}

// 内存监控信息类型
interface MemoryInfo {
  memory: {
    total: number
    available: number
    used: number
    percent: number
  }
  swap: {
    total: number
    used: number
    free: number
    percent: number
  }
  timestamp: string
}

// 磁盘监控信息类型
interface DiskInfo {
  disk_info: Array<{
    device: string
    mountpoint: string
    fstype: string
    total: number
    used: number
    free: number
    percent: number
  }>
  timestamp: string
}

// 网络监控信息类型
interface NetworkInfo {
  network_info: {
    bytes_sent: number
    bytes_recv: number
    packets_sent: number
    packets_recv: number
    errin: number
    errout: number
    dropin: number
    dropout: number
  }
  timestamp: string
}

// 进程监控信息类型
interface ProcessInfo {
  processes: Array<{
    pid: number
    name: string
    cpu_percent: number
    memory_percent: number
    memory_info: {
      rss: number
      vms: number
    }
    status: string
    create_time: string
  }>
  total_processes: number
  timestamp: string
}

// GPU监控信息类型
interface GpuInfo {
  gpu_available: boolean
  gpu_info?: Array<{
    id: number
    name: string
    load: number
    memory_used: number
    memory_total: number
    memory_util: number
    temperature: number
  }>
  message?: string
  timestamp: string
}

// 系统概览信息类型
interface SystemOverview {
  system_info: {
    platform: string
    processor: string
    architecture: string
    hostname: string
    boot_time: string
    uptime: string
  }
  resource_summary: {
    cpu_percent: number
    memory_percent: number
    disk_percent: number
    network_bytes_sent: number
    network_bytes_recv: number
  }
  alerts: Array<{
    type: string
    message: string
    value: number
  }>
  timestamp: string
}

/**
 * 获取CPU监控信息
 * @returns Promise<ApiResponse<CpuInfo>>
 */
const getCpuMonitor = (): Promise<ApiResponse<CpuInfo>> => {
  return http.get('/hzadmin/client/monitor/cpu/')
}

/**
 * 获取内存监控信息
 * @returns Promise<ApiResponse<MemoryInfo>>
 */
const getMemoryMonitor = (): Promise<ApiResponse<MemoryInfo>> => {
  return http.get('/hzadmin/client/monitor/memory/')
}

/**
 * 获取磁盘监控信息
 * @returns Promise<ApiResponse<DiskInfo>>
 */
const getDiskMonitor = (): Promise<ApiResponse<DiskInfo>> => {
  return http.get('/hzadmin/client/monitor/disk/')
}

/**
 * 获取网络监控信息
 * @returns Promise<ApiResponse<NetworkInfo>>
 */
const getNetworkMonitor = (): Promise<ApiResponse<NetworkInfo>> => {
  return http.get('/hzadmin/client/monitor/network/')
}

/**
 * 获取进程监控信息
 * @param params 查询参数
 * @param params.limit 返回进程数量限制
 * @param params.sort_by 排序字段
 * @returns Promise<ApiResponse<ProcessInfo>>
 */
const getProcessMonitor = (params?: { limit?: number; sort_by?: string }): Promise<ApiResponse<ProcessInfo>> => {
  return http.get('/hzadmin/client/monitor/process/', { params })
}

/**
 * 获取GPU监控信息
 * @returns Promise<ApiResponse<GpuInfo>>
 */
const getGpuMonitor = (): Promise<ApiResponse<GpuInfo>> => {
  return http.get('/hzadmin/client/monitor/gpu/')
}

/**
 * 获取系统概览信息
 * @returns Promise<ApiResponse<SystemOverview>>
 */
const getSystemOverview = (): Promise<ApiResponse<SystemOverview>> => {
  return http.get('/hzadmin/client/monitor/overview/')
}

// 统一导出监控API
export const monitorApi = {
  getCpuMonitor,
  getMemoryMonitor,
  getDiskMonitor,
  getNetworkMonitor,
  getProcessMonitor,
  getGpuMonitor,
  getSystemOverview
}

// 支持按需导入
export {
  getCpuMonitor,
  getMemoryMonitor,
  getDiskMonitor,
  getNetworkMonitor,
  getProcessMonitor,
  getGpuMonitor,
  getSystemOverview
}

// 导出类型定义
export type {
  ApiResponse,
  CpuInfo,
  MemoryInfo,
  DiskInfo,
  NetworkInfo,
  ProcessInfo,
  GpuInfo,
  SystemOverview
}