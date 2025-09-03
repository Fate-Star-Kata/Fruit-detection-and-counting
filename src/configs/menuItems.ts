import type { AdminHeader, MenuItem } from "@/types/factory";

// 主菜单配置（用于Header组件）
export const defaultMenuItems: MenuItem[] = [
  {
    id: "index",
    label: "menu.index",
    href: "/",
    icon: null,
    hide: false,
  },
  {
    id: "recognize",
    label: "检测",
    href: "/user/recognize",
    icon: null,
    children: [
      {
        id: "imgRealTime",
        label: "图片检测",
        href: "/user/recognize/",
        icon: null,
      },
      {
        id: "realTime",
        label: "实时检测",
        href: "/user/recognize/realTime",
        icon: null,
      },
    ],
  },
  {
    id: "history",
    label: "检测历史",
    href: "/user/history",
    icon: null,
  },
  {
    id: "knowledge",
    label: "知识库",
    href: "/user/knowledge",
    icon: null,
    hide: true,
  },
  {
    id: "templates",
    label: "menu.templates",
    href: "/templates",
    hide: true,
    children: [
      {
        id: "dashboard",
        label: "dashboard",
        href: "/templates/dashboard",
      },
      {
        id: "analytics",
        label: "analytics",
        href: "/templates/analytics",
      },
      {
        id: "knowledge",
        label: "knowledge",
        href: "/templates/knowledge",
      },
      {
        id: "stats",
        label: "stats",
        href: "/templates/stats",
      },
      {
        id: "websocket",
        label: "websocket",
        href: "/templates/websocket",
      },
    ],
  },
  {
    id: "about",
    label: "关于",
    href: "/user/about",
    icon: null,
  },
  {
    id: "system_film",
    label: "menu.system_film",
    href: "/user/system_film",
    hide: true,
    icon: null,
  },
  {
    id: "admin",
    label: "menu.admin",
    href: "/admin",
    icon: null,
  },
];

// 管理后台菜单配置
export const adminMenuItems: AdminHeader[] = [
  {
    id: "1",
    title: "仪表板",
    icon: "Odometer",
    path: "/admin/dashboard",
  },
  {
    id: "2",
    title: "系统监控",
    icon: "Cpu",
    path: "/admin/SystemMonitoring",
  },
  {
    id: "3",
    title: "用户管理",
    icon: "User",
    path: "/admin/userManage",
    // children: [
    //   { id: '2-1', title: '用户列表', icon: 'UserFilled', path: '/admin/userManage' },
    // ]
  },
  {
    id: "4",
    title: "通知管理",
    icon: "Bell",
    path: "/admin/notice",
  },
  {
    id: "history",
    title: "检测历史",
    icon: "MessageBox",
    path: "/admin/history",
  },
  {
    id: "5",
    title: "知识管理",
    icon: "Compass",
    path: "/admin/knowledge",
    hide: true,
  },
  {
    id: "6",
    title: "订单管理",
    icon: "ShoppingCart",
    path: "/admin/orders",
    hide: true,
    children: [
      {
        id: "6-1",
        title: "订单列表",
        icon: "List",
        path: "/admin/orders/list",
      },
      {
        id: "6-2",
        title: "退款管理",
        icon: "RefreshLeft",
        path: "/admin/orders/refunds",
      },
    ],
  },
  {
    id: "8",
    title: "AI 助手",
    icon: "ChatDotRound",
    path: "/admin/ai",
    hide: true,
  },
  {
    id: "10",
    title: "系统设置",
    icon: "Setting",
    path: "/admin/settings",
    hide: true,
    children: [
      {
        id: "10-1",
        title: "基础设置",
        icon: "Tools",
        path: "/admin/settings/basic",
      },
      {
        id: "10-2",
        title: "权限管理",
        icon: "Key",
        path: "/admin/settings/permissions",
      },
      {
        id: "10-3",
        title: "系统日志",
        icon: "DocumentCopy",
        path: "/admin/settings/logs",
      },
    ],
  },
  {
    id: "11",
    title: "操作日志",
    icon: "CollectionTag",
    path: "/admin/log",
  },
  {
    id: "12",
    title: "系统配置",
    icon: "Tools",
    path: "/admin/systemConfig",
  },
];
