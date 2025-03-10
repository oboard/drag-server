// 为浏览器环境提供简单的 process polyfill
if (typeof window !== 'undefined') {
  // @ts-ignore - 忽略类型检查，直接设置process对象
  window.process = window.process || {};
  
  // @ts-ignore - 确保process.env存在
  if (!window.process.env) window.process.env = {};

  // @ts-ignore - 添加path模块的polyfill
  window._path = window._path || {
    resolve: (...paths: string[]) => {
      return paths.join('/').replace(/\/+/g, '/');
    },
    dirname: (path: string) => {
      return path.split('/').slice(0, -1).join('/');
    },
    basename: (path: string) => {
      return path.split('/').pop() || '';
    }
  };
}

export {}; 