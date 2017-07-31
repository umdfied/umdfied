require('dotenv').config();
const Koa = require('koa');
const ratelimit = require('./ratelimit');
const config = require('./config');
const bouncer = require('koa-bouncer');
const mw = require('./mw');
const nunjucksRender = require('koa-nunjucks-async');

const app = new Koa();

app.poweredBy = false;
app.proxy = true;
app.use(ratelimit());
const nunjucksOptions = {
  ext: '.html',
  noCache: false,
  throwOnUndefined: false,
  filters: { json: x => JSON.stringify(x, null, '  ') }
};

app.use(require('koa-helmet')());
app.use(require('koa-compress')());
app.use(require('koa-better-static2')('public', { maxage: 1209600 * 100 }));
if (process.env.NODE_ENV !== 'production') {
  app.use(require('koa-logger')());
}
app.use(require('koa-body')());
app.use(mw.methodOverride());
app.use(mw.removeTrailingSlash());
app.use(bouncer.middleware());
app.use(mw.handleBouncerValidationError());
app.use(nunjucksRender('views', nunjucksOptions));
const router = require('./router');
app.use(router.routes());
app.use(router.allowedMethods());

app.start = (port = config.PORT) => {
  app.listen(port, () => {
    console.log('Listening on port', port);
  });
};
module.exports = app;
