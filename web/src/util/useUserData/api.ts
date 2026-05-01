import ky from 'ky';

export const AuthUrl = (() => {
  const { protocol, host } = window.location;

  // 让 kuriko 的开发环境可以跑起来，后续需要支持开发环境免登录
  if (host.startsWith('localhost:')) {
    return `${protocol}//localhost:5174`;
  }

  // 不考虑 a.co.uk 这种顶级域名
  //  n.novelia.cc => auth.novelia.cc
  //  test.com => auth.test.com
  const parts = host.split('.');
  const baseDomain = parts.length > 2 ? parts.slice(-2).join('.') : host;
  return `${protocol}//auth.${baseDomain}`;
})();

// Auth API 请求走主前端 Vite 代理避免跨域，iframe 登录仍用 AuthUrl
const AuthApiBase = (() => {
  if (window.location.host.startsWith('localhost:')) {
    return ''; // 同源，由 Vite proxy 转发到 Go Auth 后端
  }
  return AuthUrl;
})();

const client = ky.create({
  prefixUrl: AuthApiBase + '/api/v1',
  credentials: 'include',
});

export const AuthApi = {
  refresh: (app: string) =>
    client.post(`auth/refresh`, { searchParams: { app } }).text(),
  logout: () => client.post(`auth/logout`).text(),
};
