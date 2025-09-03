// 水果检测相关API类型定义

// 基础API响应类型
export interface BaseApiResponse<T = any> {
  code: number;
  msg: string | null;
  data: T;
}

// 水果检测请求参数
export interface FruitDetectionRequest {
  image: string; // Base64编码的PNG图片数据
}

// 检测结果中的边界框
export interface BoundingBox {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

// 单个水果检测结果
export interface FruitDetection {
  fruit_name: string;
  confidence: number;
  bbox: BoundingBox;
  class_id: number;
  price: number;
  timestamp: number;
}

// 水果检测响应数据
export interface FruitDetectionData {
  detections: FruitDetection[];
  total_count: number;
  session_id: string;
}

// 水果检测响应
export interface FruitDetectionResponse extends BaseApiResponse<FruitDetectionData> {}

// 模型性能统计 - 整体性能
export interface OverallPerformance {
  fruit_name: string;
  total_detections: number;
  avg_confidence: number;
  last_updated: string;
}

// 模型性能统计 - 24小时统计
export interface Recent24hStats {
  fruit_name: string;
  count_24h: number;
  avg_confidence_24h: number;
}

// 模型性能统计数据
export interface ModelPerformanceData {
  overall_performance: OverallPerformance[];
  recent_24h_stats: Recent24hStats[];
  total_detections_all_time: number;
  total_detections_24h: number;
}

// 模型性能统计响应
export interface ModelPerformanceResponse extends BaseApiResponse<ModelPerformanceData> {}

// 模型设置
export interface ModelSettings {
  confidence_threshold: number;
  iou_threshold: number;
  model_path: string;
  updated_time: string;
}

// 模型设置响应
export interface ModelSettingsResponse extends BaseApiResponse<ModelSettings> {}

// 模型设置更新请求
export interface ModelSettingsUpdateRequest {
  confidence_threshold: number;
  iou_threshold: number;
  model_path: string;
}

// 模型设置更新响应数据
export interface ModelSettingsUpdateData {
  message: string;
  settings: ModelSettings;
}

// 模型设置更新响应
export interface ModelSettingsUpdateResponse extends BaseApiResponse<ModelSettingsUpdateData> {}

// 模型信息数据
export interface ModelInfoData {
  model_loaded: boolean;
  confidence_threshold: number;
  iou_threshold: number;
  supported_fruits: string[];
  model_path: string;
  current_confidence_threshold: number;
  current_iou_threshold: number;
  settings_updated: string;
}

// 模型信息响应
export interface ModelInfoResponse extends BaseApiResponse<ModelInfoData> {}

// 检测历史中的边界框（与检测结果相同）
export interface HistoryBoundingBox {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

// 检测历史记录
export interface DetectionHistory {
  id: number;
  fruit_name: string;
  confidence: number;
  bbox: HistoryBoundingBox;
  detection_time: string;
  session_id: string;
  images: {
    original_image: string | null;
    annotated_image: string | null;
    original_image_url: string | null;
    annotated_image_url: string | null;
  };
}

// 检测历史响应数据
export interface DetectionHistoryData {
  history: DetectionHistory[];
  total_count: number;
  returned_count: number;
}

// 检测历史响应
export interface DetectionHistoryResponse extends BaseApiResponse<DetectionHistoryData> {}

// 检测历史查询参数
export interface DetectionHistoryParams {
  fruit_name?: string;
  limit?: number;
}

// ==================== 管理端接口类型定义 ====================

// 管理端检测记录列表查询参数
export interface AdminDetectionListParams {
  query?: string;
  page?: number;
  page_size?: number;
  start_date?: string;
  end_date?: string;
  min_confidence?: number;
}

// 管理端检测记录项
export interface AdminDetectionRecord {
  id: number;
  fruit_name: string;
  confidence: number;
  bbox: BoundingBox;
  detection_time: string;
  session_id: string;
}

// 管理端检测记录详情项（包含更多信息）
export interface AdminDetectionDetail {
  id: number;
  fruit_name: string;
  confidence: number;
  bbox: BoundingBox;
  detection_time: string;
  session_id: string;
  fruit_count: number;
  images: {
    original_image: string;
    annotated_image: string;
    original_image_url: string;
    annotated_image_url: string;
  };
  session_statistics: {
    fruit_counts: Record<string, number>;
    total_fruits_in_session: number;
    total_detections_in_session: number;
  };
  current_fruit_counts: Record<string, number>;
  detection_metadata: {
    bbox_area: number;
    bbox_center: {
      x: number;
      y: number;
    };
  };
}

// 管理端检测记录列表响应数据
export interface AdminDetectionListData {
  total: number;
  page: number;
  page_size: number;
  detections: AdminDetectionRecord[];
}

// 管理端检测记录列表响应
export interface AdminDetectionListResponse extends BaseApiResponse<AdminDetectionListData> {}

// 管理端检测记录详情响应
export interface AdminDetectionDetailResponse extends BaseApiResponse<AdminDetectionDetail | null> {}

// 删除检测记录请求
export interface DeleteDetectionRequest {
  detection_id: number;
}

// 批量删除检测记录请求
export interface BatchDeleteDetectionRequest {
  detection_ids: number[];
}

// 删除操作响应
export interface DeleteDetectionResponse extends BaseApiResponse<null> {}

// 检测统计查询参数
export interface DetectionStatsParams {
  days: number;
}

// 水果统计项
export interface FruitStat {
  fruit_name: string;
  count: number;
  avg_confidence: number;
}

// 每日统计项
export interface DailyStat {
  date: string;
  count: number;
}

// 检测统计数据
export interface DetectionStatsData {
  total_detections: number;
  avg_confidence: number;
  fruit_stats: FruitStat[];
  daily_stats: DailyStat[];
  period_days: number;
}

// 检测统计响应
export interface DetectionStatsResponse extends BaseApiResponse<DetectionStatsData> {}

// 管理端模型设置数据
export interface AdminModelSettingsData {
  id: number;
  confidence_threshold: number;
  iou_threshold: number;
  model_path: string;
  is_active: boolean;
  created_time: string;
  updated_time: string;
  model_info: {
    model_loaded: boolean;
    confidence_threshold: number;
    iou_threshold: number;
    supported_fruits: string[];
    model_path: string;
  };
}

// 管理端模型设置响应
export interface AdminModelSettingsResponse extends BaseApiResponse<AdminModelSettingsData> {}

// 管理端模型设置更新请求
export interface AdminModelSettingsUpdateRequest {
  confidence_threshold: number;
  iou_threshold: number;
}

// 管理端模型设置更新响应
export interface AdminModelSettingsUpdateResponse extends BaseApiResponse<null> {}

// 管理端模型性能项
export interface AdminModelPerformanceItem {
  id: number;
  fruit_name: string;
  total_detections: number;
  avg_confidence: number;
  last_updated: string;
}

// 管理端模型性能数据
export interface AdminModelPerformanceData {
  performances: AdminModelPerformanceItem[];
  total_detections: number;
  overall_avg_confidence: number;
  fruit_types_count: number;
}

// 管理端模型性能响应
export interface AdminModelPerformanceResponse extends BaseApiResponse<AdminModelPerformanceData> {}

// 模型性能重置请求
export interface ModelPerformanceResetRequest {
  action: 'reset_all';
}

// 模型性能重置响应
export interface ModelPerformanceResetResponse extends BaseApiResponse<null> {}