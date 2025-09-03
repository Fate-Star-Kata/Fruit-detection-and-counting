/**
 * Header 组件相关类型定义
 */

/**
 * 菜单项接口
 */
export interface MenuItem {
  /** 菜单项唯一标识 */
  id: string
  /** 菜单项显示文本 */
  label: string
  /** 菜单项链接地址 */
  href?: string | (() => string)
  /** 菜单项图标 */
  icon?: string | null | Component
  /** 是否禁用 */
  disabled?: boolean
  /** 是否默认展开（仅对有子菜单的项目有效） */
  defaultOpen?: boolean
  /** 子菜单项 */
  children?: MenuItem[]
  /** 菜单项元数据 */
  hide?: boolean
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

/**
 * Header 组件配置接口
 */
export interface HeaderConfig {
  /** 品牌名称 */
  brandName?: string
  /** 品牌链接 */
  brandHref?: string
  /** 菜单项列表 */
  menuItems: MenuItem[]
  /** 是否显示移动端菜单 */
  showMobileMenu?: boolean
  /** 右侧操作按钮配置 */
  actions?: {
    label: string
    href?: string
    onClick?: () => void
    type?: 'primary' | 'secondary' | 'ghost'
  }[]
}

/**
 * 菜单渲染选项
 */
export interface MenuRenderOptions {
  /** 是否为移动端模式 */
  isMobile?: boolean
  /** 最大嵌套层级 */
  maxDepth?: number
  /** 自定义类名 */
  className?: string
}

export interface AdminHeader {
  id: number | string
  title: string
  icon?: string | null
  path: string
  hide?: boolean
  children?: AdminChild[]
}

export interface AdminChild {
  id: number | string
  title: string
  path: string
  icon?: string | null
  hide?: boolean
}