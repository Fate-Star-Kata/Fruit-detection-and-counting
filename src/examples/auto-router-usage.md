# 自动路由使用说明

## 概述

项目已成功配置了基于文件系统的自动路由功能，使用 `unplugin-vue-router` 插件实现。

## 功能特性

- **基于文件系统的路由**: 在 `src/pages` 目录下创建 `.vue` 文件即可自动生成对应路由
- **类型安全**: 自动生成 TypeScript 类型定义
- **零配置**: 无需手动配置路由规则
- **支持嵌套路由**: 通过文件夹结构自动生成嵌套路由

## 路由规则

### 基本路由
- `src/pages/index.vue` → `/`
- `src/pages/about.vue` → `/about`
- `src/pages/theme-demo.vue` → `/theme-demo`

### 嵌套路由
- `src/pages/user/index.vue` → `/user`
- `src/pages/user/profile.vue` → `/user/profile`
- `src/pages/user/settings.vue` → `/user/settings`

### 动态路由
- `src/pages/user/[id].vue` → `/user/:id`
- `src/pages/blog/[...slug].vue` → `/blog/:slug(.*)*`

## 使用方法

### 1. 创建新页面

在 `src/pages` 目录下创建 `.vue` 文件：

```vue
<!-- src/pages/contact.vue -->
<template>
  <div>
    <h1>联系我们</h1>
    <p>这是联系页面</p>
  </div>
</template>

<script setup lang="ts">
// 页面逻辑
</script>
```

### 2. 路由导航

使用 `router-link` 或编程式导航：

```vue
<template>
  <!-- 声明式导航 -->
  <router-link to="/contact">联系我们</router-link>
  
  <!-- 编程式导航 -->
  <button @click="goToContact">前往联系页面</button>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const goToContact = () => {
  router.push('/contact')
}
</script>
```

### 3. 获取路由参数

```vue
<!-- src/pages/user/[id].vue -->
<template>
  <div>
    <h1>用户详情</h1>
    <p>用户ID: {{ route.params.id }}</p>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()
</script>
```

## 配置说明

### Vite 配置

```typescript
// vite.config.ts
import VueRouter from 'unplugin-vue-router/vite'

export default defineConfig({
  plugins: [
    VueRouter({
      routesFolder: 'src/pages',  // 页面文件夹
      dts: './typed-router.d.ts', // 类型定义文件
    }),
    // ... 其他插件
  ],
})
```

### 路由配置

```typescript
// src/router/index.ts
import { createMemoryHistory, createRouter } from 'vue-router'
import { routes } from 'vue-router/auto-routes'

const router = createRouter({
  history: createMemoryHistory(),
  routes, // 使用自动生成的路由
})

export default router
```

## 优势

1. **开发效率**: 无需手动配置路由，创建文件即可
2. **类型安全**: 自动生成 TypeScript 类型
3. **维护性**: 文件结构即路由结构，直观易懂
4. **扩展性**: 支持复杂的路由模式和嵌套结构

## 注意事项

- 页面文件必须放在 `src/pages` 目录下
- 文件名将直接映射为路由路径
- 使用 `index.vue` 作为默认页面
- 动态路由使用 `[param]` 语法
- 捕获所有路由使用 `[...param]` 语法