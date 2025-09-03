# 菜单数据使用说明

## 概述

菜单数据已从 `Header.vue` 组件迁移到 `useOptionsStore` 中，作为网站相关数据的一部分进行统一管理。

## 使用方式

### 1. 获取默认菜单数据

```typescript
import { useOptionsStore } from '@/stores/options'

const optionsStore = useOptionsStore()

// 获取当前菜单项（如果自定义菜单为空，则返回默认菜单）
const menuItems = optionsStore.getCurrentMenuItems

// 获取默认菜单项
const defaultMenuItems = optionsStore.defaultMenuItems
```

### 2. 自定义菜单数据

```typescript
import type { MenuItem } from '@/types/components/header'
import { useOptionsStore } from '@/stores/options'

const optionsStore = useOptionsStore()

// 设置自定义菜单
const customMenuItems: MenuItem[] = [
  {
    id: 'custom-dashboard',
    label: '自定义仪表板',
    href: '/custom-dashboard',
    icon: 'dashboard',
  },
  // ... 更多菜单项
]

optionsStore.setMenuItems(customMenuItems)
```

### 3. 重置为默认菜单

```typescript
import { useOptionsStore } from '@/stores/options'

const optionsStore = useOptionsStore()

// 重置为默认菜单
optionsStore.resetMenuItems()
```

## 类型定义

菜单项使用 `MenuItem` 接口，定义在 `@/types/components/header.d.ts` 中：

```typescript
export interface MenuItem {
  /** 菜单项唯一标识 */
  id: string
  /** 菜单项显示文本 */
  label: string
  /** 菜单项链接地址 */
  href?: string
  /** 菜单项图标 */
  icon?: string
  /** 是否禁用 */
  disabled?: boolean
  /** 是否默认展开（仅对有子菜单的项目有效） */
  defaultOpen?: boolean
  /** 子菜单项 */
  children?: MenuItem[]
  /** 菜单项元数据 */
  meta?: {
    /** 权限标识 */
    permission?: string
    /** 是否在菜单中隐藏 */
    hidden?: boolean
    /** 排序权重 */
    order?: number
    [key: string]: any
  }
}
```

## 优势

1. **集中管理**：菜单数据统一在 store 中管理，便于维护
2. **类型安全**：保持完整的 TypeScript 类型限制
3. **灵活性**：支持默认菜单和自定义菜单的切换
4. **国际化支持**：菜单标签支持多语言
5. **响应式**：基于 Vue 3 的响应式系统，数据变化自动更新UI

## 注意事项

- 菜单数据支持多级嵌套结构
- 所有菜单项必须有唯一的 `id`
- 国际化标签需要在对应的语言文件中定义
- 图标字段为可选，可以根据项目需要使用不同的图标库
