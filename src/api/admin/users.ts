import type {
  User,
  UserQueryParams,
  UserListResponse,
  ApiResponse
} from '@/types/components/admin'
import serviceAxios from '@/http'

// 获取用户列表
export function getUsersAPI(params: UserQueryParams): Promise<UserListResponse> {
  return serviceAxios({
    url: '/hzadmin/admin/user/users/',
    method: 'get',
    params: {
      ...params,
      query: params.query,
    },
  })
}

// 添加用户
export function addUserAPI(data: Omit<User, 'id'>): Promise<ApiResponse> {
  return serviceAxios({
    url: '/hzadmin/admin/user/users/addUser/',
    method: 'put',
    data: {
      ...data,
      id: -1,
      password: '123456'
    }
  })
}

// 修改用户
export function editUserAPI(data: User): Promise<ApiResponse> {
  return serviceAxios({
    url: `/hzadmin/admin/user/users/editUser/${data.id}/`,
    method: 'post',
    data
  })
}

// 查看用户详情
export function userDetailAPI(id: number): Promise<ApiResponse> {
  return serviceAxios({
    url: `/hzadmin/admin/user/users/${id}/`,
    method: 'get',
    params: { id }
  })
}

// 删除用户
export function deleteUserAPI(id: number): Promise<ApiResponse> {
  return serviceAxios({
    url: '/hzadmin/admin/user/users/delete/',
    method: 'post',
    data: { user_id: id }
  })
}