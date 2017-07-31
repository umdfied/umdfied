const bouncer = require('koa-bouncer');

exports.methodOverride = () => async (ctx, next) => {
  if (typeof ctx.request.body === 'undefined') {
    throw new Error('methodOverride middleware must be applied after the body is parsed and ctx.request.body is populated');
  }
  if (ctx.request.body && ctx.request.body._method) {
    ctx.method = ctx.request.body._method.toUpperCase();
    delete ctx.request.body._method;
  }
  await next();
};
exports.removeTrailingSlash = () => async (ctx, next) => {
  if (ctx.path.length > 1 && ctx.path.endsWith('/')) {
    ctx.redirect(ctx.path.slice(0, ctx.path.length - 1));
    return;
  }
  await next();
};
exports.handleBouncerValidationError = () => async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    if (err instanceof bouncer.ValidationError) {
      ctx.flash = {
        message: ['danger', err.message || 'Validation error'],
        params: ctx.request.body,
        bouncer: err.bouncer
      };
      return ctx.redirect('back');
    }
    throw err;
  }
};
