import  serviceAxios  from '@/http'
import type {
  FruitDetectionRequest,
  FruitDetectionResponse,
  ModelPerformanceResponse,
  ModelSettingsResponse,
  ModelSettingsUpdateRequest,
  ModelSettingsUpdateResponse,
  ModelInfoResponse,
  DetectionHistoryResponse,
  DetectionHistoryParams,
  AdminDetectionListParams,
  AdminDetectionListResponse,
  AdminDetectionDetailResponse,
  AdminDetectionDetail,
  DeleteDetectionRequest,
  DeleteDetectionResponse,
  BatchDeleteDetectionRequest,
  DetectionStatsParams,
  DetectionStatsResponse,
  AdminModelSettingsResponse,
  AdminModelSettingsUpdateRequest,
  AdminModelSettingsUpdateResponse,
  AdminModelPerformanceResponse,
  ModelPerformanceResetRequest,
  ModelPerformanceResetResponse
} from '@/types/apis/PagesApi_T'

// 水果检测接口
export const detectFruit = (data: FruitDetectionRequest): Promise<FruitDetectionResponse> => {
  return serviceAxios({
    method: 'POST',
    url: '/yolo/detect/',
    data,
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

// 获取模型性能统计
export const getModelPerformance = (): Promise<ModelPerformanceResponse> => {
  return serviceAxios({
    method: 'GET',
    url: '/yolo/model/performance/',
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

// 获取模型设置
export const getModelSettings = (): Promise<ModelSettingsResponse> => {
  return serviceAxios({
    method: 'GET',
    url: '/yolo/model/settings/',
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

// 更新模型设置
export const updateModelSettings = (data: ModelSettingsUpdateRequest): Promise<ModelSettingsUpdateResponse> => {
  return serviceAxios({
    method: 'POST',
    url: '/yolo/model/settings/',
    data,
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

// 获取模型信息
export const getModelInfo = (): Promise<ModelInfoResponse> => {
  return serviceAxios({
    method: 'GET',
    url: '/yolo/model/info/',
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

// 获取检测历史
export const getDetectionHistory = (params?: DetectionHistoryParams): Promise<DetectionHistoryResponse> => {
  return serviceAxios({
    method: 'GET',
    url: '/yolo/detection/history/',
    params,
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

// ==================== 管理端接口 ====================

// 获取管理端检测记录列表
export const getAdminDetections = (params?: AdminDetectionListParams): Promise<AdminDetectionListResponse> => {
  return serviceAxios({
    method: 'GET',
    url: '/yolo/admin/fruit-detection/detections/',
    params,
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

// 获取管理端检测记录详情
export const getAdminDetectionDetail = (id: number): Promise<AdminDetectionDetailResponse> => {
  return serviceAxios({
    method: 'GET',
    url: `/yolo/admin/fruit-detection/detections/${id}/`,
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

// 删除检测记录
export const deleteDetection = (data: DeleteDetectionRequest): Promise<DeleteDetectionResponse> => {
  return serviceAxios({
    method: 'POST',
    url: '/yolo/admin/fruit-detection/detections/delete/',
    data,
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

// 批量删除检测记录
export const batchDeleteDetections = (data: BatchDeleteDetectionRequest): Promise<DeleteDetectionResponse> => {
  return serviceAxios({
    method: 'POST',
    url: '/yolo/admin/fruit-detection/detections/batch-delete/',
    data,
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

// 获取检测统计
export const getDetectionStats = (params: DetectionStatsParams): Promise<DetectionStatsResponse> => {
  return serviceAxios({
    method: 'GET',
    url: '/yolo/admin/fruit-detection/detections/stats/',
    params,
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

// 获取管理端模型设置
export const getAdminModelSettings = (): Promise<AdminModelSettingsResponse> => {
  return serviceAxios({
    method: 'GET',
    url: '/yolo/admin/fruit-detection/model/settings/',
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

// 更新管理端模型设置
export const updateAdminModelSettings = (data: AdminModelSettingsUpdateRequest): Promise<AdminModelSettingsUpdateResponse> => {
  return serviceAxios({
    method: 'POST',
    url: '/yolo/admin/fruit-detection/model/settings/',
    data,
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

// 获取管理端模型性能
export const getAdminModelPerformance = (): Promise<AdminModelPerformanceResponse> => {
  return serviceAxios({
    method: 'GET',
    url: '/yolo/admin/fruit-detection/model/performance/',
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

// 重置模型性能
export const resetModelPerformance = (data: ModelPerformanceResetRequest): Promise<ModelPerformanceResetResponse> => {
  return serviceAxios({
    method: 'POST',
    url: '/yolo/admin/fruit-detection/model/performance/',
    data,
    headers: {
      'Content-Type': 'application/json'
    }
  })
}
