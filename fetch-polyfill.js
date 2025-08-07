// 修复 React Native fetch polyfill 中 Response 构造错误的问题
// 当网络请求失败返回状态码 0 时，避免 RangeError

const originalFetch = global.fetch

if (originalFetch) {
  global.fetch = function(url, options) {
    return originalFetch(url, options).catch(error => {
      // 如果是网络错误，创建一个模拟的响应对象
      if (error.message === 'Network request failed' || error.name === 'TypeError') {
        return {
          ok: false,
          status: 500, // 使用 500 而不是 0
          statusText: 'Network Error',
          headers: new Map(),
          url: url,
          text: () => Promise.resolve(''),
          json: () => Promise.resolve({}),
          blob: () => Promise.resolve(new Blob()),
        }
      }
      throw error
    })
  }
}

// 额外的 Response 构造器保护
const OriginalResponse = global.Response
if (OriginalResponse) {
  global.Response = function(body, init) {
    // 确保状态码在有效范围内
    if (init && init.status === 0) {
      init = { ...init, status: 500, statusText: 'Network Error' }
    }
    return new OriginalResponse(body, init)
  }
  
  // 保持原型链
  global.Response.prototype = OriginalResponse.prototype
  Object.setPrototypeOf(global.Response, OriginalResponse)
}