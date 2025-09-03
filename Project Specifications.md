# HZSystem-UI 模板规范

## 项目概述

HZSystem-UI 是基于 Vue 3 + TypeScript + Vite + DaisyUI + Element Plus 的前端项目模板，提供了完整的开发环境配置和代码规范。

## 技术栈

- **框架**: Vue 3 (Composition API)
- **语言**: TypeScript
- **构建工具**: Vite yarn
- **UI 组件库**: Element Plus + DaisyUI
- **样式**: Tailwind CSS + SCSS
- **动画**: Motion Motion-v
- **路由**: Vue Router 4
- **状态管理**: Pinia
- **国际化**: Vue I18n
- **代码规范**: ESLint + Prettier

## 说明

> [!NOTE]
> 网站标题和 logo 可以通过环境变量配置,logo 组件需要在 **components/icon** 下创建组件。

## 🚀 开发环境配置（重要）

> [!IMPORTANT]
> 实现自动格式化并修复 Eslint 编辑器配置

### 必装插件

VSCode 安装以下插件：

- Vue (Official)
- ESLint
- InlineProblem
- Oxc
- Auto Import
- Prettier
- Path Autocomplete
- Path Intellisense
- eslint-disable-snippets（推荐）

### 配置方法

1. Vue 组件中 右键 > 格式化文档 > 默认 > Vue (Official) 实现自动修复 ESLint 警告
2. 使用 eslint-disable-snippets 快速修复提示注释快速关闭 ESLint 警告

### 环境变量配置

```bash
# .env.development
VITE_APP_ENV=development
VITE_API_BASE_URL=http://localhost:8000/api
VITE_APP_TITLE=HZSystem开发环境

# .env.production
VITE_APP_ENV=production
VITE_API_BASE_URL=https://api.hzsystem.com
VITE_APP_TITLE=HZSystem生产环境
```

使用方式：

```typescript
import.meta.env.VITE_API_BASE_URL
```

## 📁 项目结构规范

> [!IMPORTANT]
> 所有目录不能第二层必须是文件夹，除了index以外只能是文件夹

- `types` - 类型定义，第一层必须为文件夹，定义文件夹下接口用处的类型
- `i18n` - 语言包，可选多语言功能，添加语言添加新的 locale 文件
- `http` - 请求拦截器，可自行根据后端配置，比如统一 post 请求参数类型，token 格式等
- `components` - 组件目录
  - `layout` - 定义页面主布局，自行根据需求修改，增加菜单在 store>options 里面修改即可
  - 组件文件放在 `components` > views|pages > 挂载组件名称 > 组件名称，相当于目录映射关系，方便查找
  - `common` 存放通用组件
- `pages` - 自动路由页面所用组件目录，组件不能写内部component，规范写 components>pages>页面名称>组件名称
- `api` - API 接口定义
- `stores` - Pinia 状态管理
- `router` - 路由配置
- `utils` - 工具函数
- `assets` - 静态资源
- `styles` - 样式文件
- `pages>admin` 只能是后台管理的组件 它有特殊路由 不能顺便存放，其他则正常自动路由目录分类

## 🏷️ 命名规范（核心）

### 文件命名

- **全局配置** 使用 configs 文件夹 菜单栏数据 激活页面等
- **组件文件**: 使用 PascalCase，如 `UserProfile.vue`
- **页面文件**: 使用 PascalCase，如 `Login/index.vue`
- **工具文件**: 使用 camelCase，如 `formatDate.ts`
- **类型文件**: 使用 camelCase，如 `auth.ts`
- **常量文件**: 使用 UPPER_SNAKE_CASE，如 `API_CONSTANTS.ts`

### 变量命名

- **变量/函数**: camelCase，如 `userName`, `getUserInfo`
- **常量**: UPPER_SNAKE_CASE，如 `API_BASE_URL`
- **类型/接口**: PascalCase，如 `UserInfo`, `LoginRequest`
- **枚举**: PascalCase，如 `UserStatus`

## 🧩 组件开发规范（核心）

> [!TIP]
> DOM 必须优化，最大可能避免重复的 DOM，设计重复相关，做成集合对象，声明类型
>
> 让 DOM 结构清晰，减少查看代码时滚动，提高维护性，数据方便管理，方便后续动态数据

### 组件结构

1. script 标签
   - 导入依赖
   - 定义 Props
   - 定义 Emits
   - 响应式数据
   - 计算属性
   - 方法
   - 生命周期
2. template 标签
   - 模板内容
3. style 标签
   - 样式内容
   - 样式变量
   - 样式类名
   - 样式动画
   - 样式媒体查询
4. 动画相关
   - Motion-vue 库
    - Tailwind CSS

### 组件规范

1. **单一职责**: 每个组件只负责一个功能
2. **Props 验证**: 使用 TypeScript 接口定义 Props
3. **事件命名**: 使用动词形式，如 `submit`, `close`, `update`
4. **样式隔离**: 使用 `scoped` 样式
5. **响应式设计**: 使用 Tailwind CSS 响应式类
6. **样式布局**: 背景相关使用 daisyUi 库的组件，适配主题切换

## 🔧 类型定义规范（重要）

> [!TIP]
> 自己创建的类型必须在 factory 导出出去，Provider 是给 factory 导入用的 pvd 导出文件夹内文件的定义类型
>
> factory 是负责对外提供类型的，规范使用类型必须从 factory 导入，不能直接声明文件直接导入类型
>
> 这样设计接口名称不能重复！这也是规范的一环，类型名称必须做到见名知意，重复会出现异常。

### 组件类型定义

> [!IMPORTANT]
> 因为factory工厂模式设置，导出接口命名规范，所用组件名+ 类型名，比如：LoginRequest，必须避免命名重复问题

<details>
<summary>查看示例</summary>

```typescript
// types/apis/auth.ts

// 请求参数类型
export interface LoginRequest {
  username: string
  password: string
  captcha: string
}

// 响应数据类型
export interface LoginResponse {
  success: boolean
  message: string
  code: number
  data?: {
    token: string
    refreshToken?: string
    userInfo: UserInfo
    expiresIn?: number
  }
}

// 用户信息类型
export interface UserInfo {
  id: string | number
  username: string
  email: string
  avatar?: string
  roles: string[]
  permissions: string[]
}
```

### 表单验证类型

```typescript
// 表单验证规则类型
export interface FormValidationRule {
  required?: boolean
  message?: string
  trigger?: string | string[]
  min?: number
  max?: number
  len?: number
  pattern?: RegExp
  validator?: (value: any) => boolean | string
}

// 表单规则集合类型
export interface FormRules {
  [key: string]: FormValidationRule[]
}
```

</details>

## I18n 多语言规范

> [!TIP]
> 在header和管理端Navbar等地方，是用了 i18n 国际化功能，
> 使用处的文字必须添加对应的数据在locale文件夹不能出现未定义的文字

## 🌐 API 接口规范（重要）

### 接口定义

<details>
<summary>查看示例</summary>

```typescript
// api/auth.ts
import type { LoginRequest, LoginResponse } from '@/types/apis/auth'
import { http } from '@/http'

// 登录接口
export const login = (data: LoginRequest): Promise<LoginResponse> => {
  return http.post('/auth/login', data)
}

// 获取用户信息
export const getUserInfo = (): Promise<UserInfoResponse> => {
  return http.get('/auth/user-info')
}
```

</details>

### HTTP 拦截器配置

<details>
<summary>查看示例</summary>

```typescript
// http/index.ts
import axios from 'axios'
import type { AxiosResponse } from 'axios'

// 创建 axios 实例
const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  // 指定请求头
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
http.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// 响应拦截器
http.interceptors.response.use(
  (response: AxiosResponse) => response.data,
  (error) => {
    // 错误处理逻辑
    return Promise.reject(error)
  }
)

export { http }
```

</details>

## ⚡ Vue 开发规范（重要）

> [!TIP]
> 对组件的写法规范

1. **响应式数据管理**: 重复变量是为了一个功能，强制使用对象键值形式而不是多变量，响应式必须遵守
2. **Props 类型声明**: 组件的 props 尽量声明类型，用 Vue 提供的声明器，或者你自己的方式
3. **组合式 API**: 优先使用 Composition API，保持逻辑清晰
4. **事件处理**: 使用明确的事件命名，避免直接操作 DOM

## 🛣️ 路由配置规范

### 路由定义

<details>
<summary>查看示例</summary>

```typescript
// router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/auth',
    component: () => import('@/layouts/AuthLayout.vue'),
    children: [
      {
        path: 'login',
        name: 'Login',
        component: () => import('@/pages/auth/login/index.vue'),
        meta: {
          title: '登录',
          requiresAuth: false
        }
      },
      {
        path: 'register',
        name: 'Register',
        component: () => import('@/pages/auth/Register/index.vue'),
        meta: {
          title: '注册',
          requiresAuth: false
        }
      }
    ]
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/pages/dashboard/index.vue'),
    meta: {
      title: '仪表板',
      requiresAuth: true,
      permissions: ['dashboard:view']
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  // 权限验证逻辑
  next()
})

export default router
```

</details>

## 🎨 样式规范

### Tailwind CSS 使用

> [!TIP]
> tailwind 写出来的组件 需要有稳定性 不需要做很多版样式 需要则用其他方式自行实现版本切换
>
> 首页相关的内容限制使用 daisyUI ，admin端相关只能使用 elementPlus 组件库
>
> 使用 tailwind v4 不再支持 @apply 语法，只能使用组件 class 类名绑定

<details>
<summary>查看示例</summary>

```vue
<template>
  <!-- 响应式布局 -->
  <div class="container mx-auto px-4 sm:px-6 lg:px-8">
    <!-- 卡片组件 -->
    <div class="bg-white rounded-lg shadow-md p-6">
      <!-- 按钮样式 -->
      <button class="btn btn-primary btn-lg w-full sm:w-auto">
        提交
      </button>
    </div>
  </div>
</template>
```

</details>

## 配置文件

> [!TIP]
> 重要的数据或者会经常去访问的数据，必须放配置目录中去统一管理，不能直接写再组件内部变量
>
> 这样就能减少开发时候，频繁查找文件切换组件标签，提高查找速度，增加了开发效率 菜单栏配置等

```typescript
export const serverConfig = {
  baseURL: '/api', // 请求基础地址,可根据环境自定义
  ...
}
```

## ⚙️ 环境配置规范

> [!TIP]
> 环境配置的字段，只能被导入到 configs 文件夹内，其他组件使用只能通过config而不是多次导入

### 环境变量

使用方式：

```typescript
import.meta.env.VITE_API_BASE_URL
```

```bash
# .env.development
VITE_APP_ENV=development
VITE_API_BASE_URL=http://localhost:8000/api
VITE_APP_TITLE=HZSystem开发环境

# .env.production
VITE_APP_ENV=production
VITE_API_BASE_URL=https://api.hzsystem.com
VITE_APP_TITLE=HZSystem生产环境
```

### Vite 配置

> [!IMPORTANT]
> 实现了根据环境切换配置，如不需要这样的功能，配置 viteConfig>baseConfig 即可

## 📋 代码质量规范（重要）

### ESLint 配置

关闭特定规则:

<details>
<summary>查看示例</summary>

```javascript
// eslint.config.js
export default antfu({
  ...
  rules: {
    // 关闭 console 警告
    'no-console': 'off',
    // 关闭 TypeScript 函数返回类型检查
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    'vue/no-restricted-v-bind': 'off',
    'n/prefer-global/process': 'off',
    'eslint/no-unused-vars': 'warn',
    // 对某些规则配置 编辑器警告悬浮获得提示
    //打开链接查看规则英文名 复制键过来 值根据文档配置 或者直接 off 关闭即可
  },
})
```

</details>

### Git 提交规范

```text
feat: 新功能
fix: 修复bug
docs: 文档更新
style: 代码格式调整
refactor: 代码重构
test: 测试相关
chore: 构建过程或辅助工具的变动

示例:
feat: 添加用户登录功能
fix: 修复登录表单验证问题
docs: 更新API文档
```

## ai 提示

1. 使用原型图生成页面时，将原型图的icon 优先替换 elementPlusIcon 或者再 components>icon 创建组件，不能使用 emoji
2. 页面对接口时，如果后续接口参数发生更新，你同样也需要自己去查找定义类型接口，更新对应的参数类型，防止编辑器问题提示
3. 管理端ui风格需要与 pages>admin>dashboard 一致,客户端ui风格需要与 pages>knowledge 也可以参考 pages>stats
4. public>res.json 这文件通常是为了给ai看响应体类型，而不是数据通过这个文件来获取，数据是通过接口来获取的，方便ai查看
5. Typescript 一定不能出现异常，更新了数据结构ts也必须修改，不能出现任何ts类型错误
6. 对接后端时：页面中的部分ui，后端接口并没有提供数据，请直接移除并看情况调整ui布局，前端适应后端的数据，没用的东西直接移除，不要保留空的ui元素

## 🚀 最佳实践（重要）

### 🚀 性能优化

1. **懒加载**: 路由和组件使用动态导入
2. **代码分割**: 合理使用 Vite 的代码分割功能
3. **缓存策略**: 合理设置 HTTP 缓存
4. **图片优化**: 使用 WebP 格式，实现懒加载
5. **Bundle 分析**: 定期分析打包体积，优化依赖
6. **Tree Shaking**: 确保未使用的代码被正确移除

### 🔒 安全规范

1. **XSS 防护**: 避免使用 `v-html`，使用内容安全策略
2. **CSRF 防护**: 使用 CSRF Token
3. **敏感信息**: 不在前端存储敏感信息
4. **权限控制**: 前后端双重权限验证
5. **依赖安全**: 定期检查依赖包安全漏洞
6. **HTTPS**: 生产环境强制使用 HTTPS

### 🛠️ 可维护性

1. **代码注释**: 复杂逻辑必须添加注释
2. **文档更新**: 及时更新技术文档
3. **版本管理**: 使用语义化版本号
4. **依赖管理**: 定期更新依赖包
5. **代码审查**: 建立代码审查机制
6. **单元测试**: 核心业务逻辑编写测试用例

## 🧪 测试规范

### 单元测试

> [!NOTE]
> 前端测试：维护成本大于收益，选择性实施

- **核心业务逻辑**: 必须编写单元测试
- **工具函数**: 建议编写测试用例
- **组件测试**: 可选，复杂组件建议测试
- **E2E 测试**: 关键业务流程建议覆盖

## 🚀 部署规范

### Docker 配置

```dockerfile
# Dockerfile
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### CI/CD 配置

> [!TIP]
> GitHub 实现推送仓库自动编译检测，可选：自动部署、发布 release 等

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - run: npm run test
```

## 📋 总结

本规范涵盖了 HZSystem-UI 项目的核心开发规范，按重要性排序：

### 🔥 核心规范（必须遵守）

1. **开发环境配置** - 确保团队开发环境一致
2. **组件开发规范** - 保证代码质量和可维护性
3. **命名规范** - 提高代码可读性
4. **类型定义规范** - 确保类型安全
5. **API 接口规范** - 统一接口调用方式
6. **Vue 开发规范** - 规范 Vue 组件开发
7. **代码质量规范** - 保证代码质量

### ⚡ 重要规范（建议遵守）

- 路由配置规范
- 样式规范
- 最佳实践

### 📚 参考规范（可选）

- 环境配置规范
- 测试规范
- 部署规范

遵循这些规范可以确保项目的一致性、可维护性和可扩展性，提高团队开发效率和代码质量。

> [!IMPORTANT]
> 建议定期回顾和更新这些规范，以适应技术发展和项目需求的变化。
