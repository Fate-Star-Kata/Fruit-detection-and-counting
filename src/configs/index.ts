import type { AdminHeader } from '@/types/factory'
import type { MenuItem } from '@/types/components/header'
import { defineAsyncComponent } from 'vue';
import { connect } from 'echarts';

//获得资源服务地址
const FileUploadUrl: string = (import.meta.env.VITE_FILE_UPLOAD_URL as string)
  .startsWith("http") ? import.meta.env.VITE_FILE_UPLOAD_URL : window.location.protocol + "//" + window.location.host + "/api" + import.meta.env.VITE_FILE_UPLOAD_URL;

const serverConfig = {
  baseURL: import.meta.env.MODE === 'development' ? '/api' : (import.meta.env.VITE_SERVER_PATH || '/api'),

  connectTimeout: 1000,// 连接超时设置

  useTokenAuthorization: false, // 是否开启 token 认证

  FileUploadUrl,

  VITE_APP_TITLE: import.meta.env.VITE_APP_TITLE,

  VITE_APP_LOGO: null,

  VITE_APP_VERSION: import.meta.env.VITE_APP_VERSION,

  SERVER_PATH: import.meta.env.VITE_SERVER_PATH || '/api',

  WEBSOCKET_PATH: import.meta.env.VITE_WEBSOCKET_PATH || '/api',
}

// 解决生产 动态导入 Logo 组件
try {
  const logoName = import.meta.env.VITE_APP_LOGO
  if (logoName) {
    serverConfig.VITE_APP_LOGO = defineAsyncComponent({
      loader: () => import(`@/components/icon/${logoName}.vue`),
      errorComponent: () => null,
      loadingComponent: () => null,
      onError: (error, _retry, fail, _attempts) => {
        console.warn(`Failed to load logo component: ${logoName}`, error)
        fail()
      }
    })
  } else {
    serverConfig.VITE_APP_LOGO = null
  }
} catch (error) {
  console.warn('Error setting up logo component:', error)
  serverConfig.VITE_APP_LOGO = null
}

export default serverConfig
