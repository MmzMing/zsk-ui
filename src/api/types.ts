// 统一的后端响应格式
export interface ApiResponse<T = unknown> {
  code: number;
  msg: string;
  data: T;
}

// 分页数据通用结构
export interface PageResult<T> {
  list: T[];
  total: number;
}

// 通用分页参数
export interface PageParams {
  page: number;
  pageSize: number;
  [key: string]: unknown;
}
