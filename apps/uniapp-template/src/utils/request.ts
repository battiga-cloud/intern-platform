// src/utils/request.ts

// 根据环境变量获取接口地址，本地开发可以先写死或配置在 .env 文件中
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// 定义后端返回的数据基本结构 (根据你 NestJS 的返回格式调整)
export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
}

// 扩展 uni.request 的选项配置
interface CustomRequestOptions extends UniApp.RequestOptions {
  hideLoading?: boolean; // 是否隐藏请求时的 loading 效果
}

/**
 * 核心请求封装
 */
const request = <T = any>(options: CustomRequestOptions): Promise<ApiResponse<T>> => {
  return new Promise((resolve, reject) => {
    // 1. 请求前拦截：处理 Token 和 Loading
    if (!options.hideLoading) {
      uni.showLoading({ title: '加载中...', mask: true });
    }

    const token = uni.getStorageSync('access_token');
    const header: Record<string, any> = {
      'Content-Type': 'application/json',
      ...options.header,
    };

    // 如果本地存在 Token，则统一自动携带在请求头中
    if (token) {
      header['Authorization'] = `Bearer ${token}`;
    }

    // 2. 发起真实的网络请求
    uni.request({
      url: options.url.startsWith('http') ? options.url : BASE_URL + options.url,
      method: options.method || 'GET',
      data: options.data,
      header: header,
      timeout: 10000, // 10秒超时
      
      success: (res) => {
        const { statusCode, data } = res;
        const responseData = data as ApiResponse<T>;

        // 3. 响应拦截：全局状态码处理
        if (statusCode === 401 || responseData.code === 401) {
          // Token 过期或未授权
          uni.removeStorageSync('access_token');
          uni.removeStorageSync('userInfo');
          
          uni.showToast({
            title: '登录已过期，请重新登录',
            icon: 'none',
            duration: 2000,
          });

          // 延迟跳转，让用户看清 Toast
          setTimeout(() => {
            uni.reLaunch({ url: '/pages/login/index' });
          }, 1500);
          
          reject(new Error('Unauthorized'));
        } 
        else if (statusCode >= 200 && statusCode < 300) {
          // 业务层面：进一步判断后端的自定义 code (假设 200 或 0 为成功)
          // 这里你需要根据 NestJS 实际封装的结构来判断
          resolve(responseData);
        } 
        else {
          // 其他 HTTP 错误 (如 400, 403, 500)
          uni.showToast({
            title: responseData.message || '系统繁忙，请稍后再试',
            icon: 'none',
          });
          reject(responseData);
        }
      },
      
      fail: (err) => {
        // 网络异常 (断网、服务器宕机等)
        uni.showToast({ title: '网络连接失败，请检查网络', icon: 'none' });
        reject(err);
      },
      
      complete: () => {
        // 请求完成，关闭 loading
        if (!options.hideLoading) {
          uni.hideLoading();
        }
      }
    });
  });
};

// 导出一个更为语义化的快捷方法集合
export default {
  get<T = any>(url: string, data?: any, options?: CustomRequestOptions) {
    return request<T>({ ...options, url, method: 'GET', data });
  },
  post<T = any>(url: string, data?: any, options?: CustomRequestOptions) {
    return request<T>({ ...options, url, method: 'POST', data });
  },
  put<T = any>(url: string, data?: any, options?: CustomRequestOptions) {
    return request<T>({ ...options, url, method: 'PUT', data });
  },
  delete<T = any>(url: string, data?: any, options?: CustomRequestOptions) {
    return request<T>({ ...options, url, method: 'DELETE', data });
  }
};
