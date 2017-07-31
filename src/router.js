const Router = require('koa-router');
const belt = require('./belt');
const router = new Router();

function apiResponse(ctx, succ, msg) {
  ctx.status = 200;
  ctx.type = 'json';
  ctx.body = JSON.stringify({success: succ, message: msg});
}

router.get('/', async ctx => {
  await ctx.render('main');
});
router.post('/umdfied', async ctx => {
  ctx.validateBody('pkg').isString().trim();
  ctx.validateBody('version').optional().isString().trim();
  const pkg = ctx.vals.pkg;
  const version = ctx.vals.version;
  const cdnUrl = await belt.umdfied(pkg, version, ctx.ip);
  if (!cdnUrl) {
    apiResponse(ctx, false, 'Module/Package Not Found');
    return;
  }
  apiResponse(ctx, true, {url: cdnUrl});
});
router.get('/umdfied/:pkg/:version', async ctx => {
  ctx.validateParam('pkg').isString().trim();
  ctx.validateParam('version').optional().isString().trim();
  const pkg = ctx.vals.pkg;
  const version = ctx.vals.version;

  const cdnUrl = await belt.umdfied(pkg, version, ctx.ip);
  if (!cdnUrl) {
    apiResponse(ctx, false, 'Module/Package Not Found');
    return;
  }
  apiResponse(ctx, true, {url: cdnUrl});
});
module.exports = router;
