const getOptions = (opt) => opt === true ? undefined : opt;

/**
 * creates koa app and gives it to the handler function
 * @param appHandler: (app: Koa) => any
 * @param config: ({
 *   logger: bool | object (default: true, pass koa-logger options to customize),
 *   helmet: bool | object (default: true, pass koa-helmet options to customize),
 *   bodyParser: bool | object (default: true, pass koa-bodyparser options to customize),
 *   catchError: null | function (default: respond (err.status)(err.message) or 500(Internal Server Error) and console.warn the error, pass custom error handler (ctx, err) => any),
 *   respond: bool | object (default: true, pass koa-respond options to customize),
 *   listen: bool | number (default: false, listen port)
 * })
 */
const createKoaLambda = (appHandler, config) => {
  const Koa = require("koa");
  const app = new Koa();

  //TODO: implement apiKey message filter
  // app.use(async (ctx, next) => {
  //   next();
  // })

  if (!config) {
    config = {};
  }

  const {
    logger = true,
    helmet = true,
    bodyParser = true,
    catchError = (ctx, err) => {
      ctx.status = err.status || 500;
      if (ctx.status === 500)
        console.warn('An error happened, ', err);
      ctx.body = {
        status: ctx.status,
        error: Math.floor(ctx.status / 100) === 5 ? err.message || 'Internal Server Error' : err.message,
        data: err.data
      };
    },
    respond = true,
    listen = false
  } = config;

  if (logger) {
    app.use(require("koa-logger")(getOptions(logger)));
  }
  if (helmet) {
    app.use(require("koa-helmet")(getOptions(helmet)));
  }
  if (bodyParser) {
    app.use(require("koa-bodyparser")(getOptions(bodyParser)));
  }
  if (catchError) {
    app.use(async (ctx, next) => {
      try {
        await next();
      } catch (err) {
        catchError(ctx, err);
      }
    })
  }
  if (respond) {
    app.use(require("koa-respond")(getOptions(respond)));
  }
  if (listen && typeof listen === 'number') {
    app.listen(listen);
  }

  appHandler(app);

  return app.callback();
};

module.exports = createKoaLambda;
