import axios from 'axios'
import serverConfig from '@/configs'
import router from '@/router'
import { useRequestLoadingStore } from '@/stores/common/requestLoading'

// 创建 axios 请求实例
const serviceAxios = axios.create({
  baseURL: serverConfig.baseURL, // 基础请求地址
  timeout: serverConfig.connectTimeout, // 请求超时设置
  withCredentials: false, // 跨域请求是否需要携带 cookie
})
// 创建请求拦截
serviceAxios.interceptors.request.use(
  (config) => {
    // 显示请求加载动画
    const requestLoadingStore = useRequestLoadingStore()
    requestLoadingStore.showLoading('请求中...')

    // 如果开启 token 认证
    if (serverConfig.useTokenAuthorization) {
      config.headers.Authorization = localStorage.getItem('token') // 请求头携带 token
    }

    // 处理 multipart/form-data
    const contentType = config.headers['content-type'] || config.headers['Content-Type']
    if (contentType === 'multipart/form-data') {
      if (!(config.data instanceof FormData)) {
        // 如果不是 FormData，转换为 FormData
        const formData = new FormData()
        if (config.data && typeof config.data === 'object') {
          Object.keys(config.data).forEach(key => {
            formData.append(key, config.data[key])
          })
        }
        config.data = formData
      }
      // 删除 Content-Type 让浏览器自动设置边界
      delete config.headers['content-type']
      delete config.headers['Content-Type']
    }
    else if (!contentType) {
      // 设置默认请求头
      if (config.method === 'post' || config.method === 'put') {
        config.headers['content-type'] = 'application/json'
      } else {
        config.headers['content-type'] = 'application/x-www-form-urlencoded'
      }
    }

    // 如果是对象且Content-Type为application/json，序列化为JSON字符串
    if (config.data && typeof config.data === 'object' && !(config.data instanceof FormData) &&
      (config.headers['content-type'] === 'application/json' || config.headers['Content-Type'] === 'application/json')) {
      config.data = JSON.stringify(config.data)
    }

    return config
  },
  (error) => {
    Promise.reject(error)
  },
)

// 创建响应拦截
serviceAxios.interceptors.response.use(
  (res) => {
    // 隐藏请求加载动画
    const requestLoadingStore = useRequestLoadingStore()
    requestLoadingStore.hideLoading()

    const data = res.data
    // 处理自己的业务逻辑，比如判断 token 是否过期等等
    // 代码块
    if (data.code === 401) {
      router.push("/auth/login")
      console.error("未登录或登录过期，请重新登录")
    } else if (data.code === 500) {
      throw new Error("服务器处理异常")
    }

    return data
  },
  (error) => {
    // 隐藏请求加载动画
    const requestLoadingStore = useRequestLoadingStore()
    requestLoadingStore.hideLoading()

    let message = ''
    if (error && error.response) {
      switch (error.response.status) {
        case 302:
          message = '接口重定向了！'
          break
        case 400:
          message = '参数不正确！'
          break
        case 401:
          router.push("/auth/login")
          message = '您未登录，或者登录已经超时，请先登录！'
          break
        case 403:
          message = '您没有权限操作！'
          break
        case 404:
          message = `请求地址出错: ${error.response.config.url}`
          break
        case 408:
          message = '请求超时！'
          break
        case 409:
          message = '系统已存在相同数据！'
          break
        case 500:
          message = '服务器内部错误！'
          break
        case 501:
          message = '服务未实现！'
          break
        case 502:
          message = '网关错误！'
          break
        case 503:
          message = '服务不可用！'
          break
        case 504:
          message = '服务暂时无法访问，请稍后再试！'
          break
        case 505:
          message = 'HTTP 版本不受支持！'
          break
        default:
          message = '异常问题，请联系管理员！'
          break
      }
    }
    return Promise.reject(message)
  },
)
export default serviceAxios

export { serverConfig }
