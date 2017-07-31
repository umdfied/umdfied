const store = {users: {}};
const ipfilter = require('ip-filter');
const opts = {
  duration: 10 * 60, // 10 minutes
  whiteList: [],
  blackList: [],
  accessLimited: 'Too Many Requests.',
  accessForbidden: 'This is forbidden area for you.',
  max: 50
};

const isLimit = ip => {
  const now = Date.now();
  const reset = now + opts.duration;
  const userInfo = store.users[ip];
  if (!userInfo) {
    store.users[ip] = { reset, limit: opts.max};
    return {block: false, reset: store.users[ip].reset, limit: store.users[ip].limit};
  }
  if (userInfo.limit < 1 && userInfo.reset > now) {
    return {block: true, reset: store.users[ip].reset, limit: store.users[ip].limit};
  }
  store.users[ip].limit -= 1;

  if (userInfo.reset < now) {
    store.users[ip] = { reset, limit: opts.max};
  }

  return {block: false, reset: store.users[ip].reset, limit: store.users[ip].limit};
};

module.exports = () => async (ctx, next) => {
  const ip = ctx.ip;
  if (!ip) {
    return next();
  }
  if (ipfilter(ip, opts.blackList)) {
    ctx.throw(403, opts.accessForbidden);
  }
  if (ipfilter(ip, opts.whiteList)) {
    return next();
  }
  const blocked = isLimit(ip);
  ctx.set('X-RateLimit-Reset', blocked.reset);
  ctx.set('X-RateLimit-Limit', blocked.limit);
  if (blocked.block === true) {
    ctx.throw(429, opts.accessLimited);
  }

  await next();
};
