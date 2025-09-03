import type { TableColumn } from '@/types/components/admin'

export const userTableColumns: TableColumn[] = [
  {
    title: '序号',
    dataIndex: 'serialNumber',
    width: 80,
    align: 'center',
  },
  {
    title: '用户名',
    dataIndex: 'username',
    key: 'username'
  },
  {
    title: '邮箱',
    dataIndex: 'email',
    key: 'email'
  },
  {
    title: '状态',
    dataIndex: 'is_active',
    key: 'is_active',
    align: 'center',
    width: 150
  },
  {
    title: '工作人员权限',
    dataIndex: 'is_staff',
    key: 'is_staff',
    align: 'center',
    width: 150
  },
  {
    title: '超级管理员权限',
    dataIndex: 'is_superuser',
    key: 'is_superuser',
    align: 'center',
    width: 150
  },
  {
    title: '操作',
    dataIndex: 'operation',
    key: 'operation',
    align: 'center',
    width: 200,
  }
]

export default userTableColumns