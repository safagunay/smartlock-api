const bearerToken = require("koa-bearer-token");
const CreateKoaLambda = require("create-koa-lambda");
const jwt = require("jsonwebtoken");

module.exports = (appHandler, config) => {
    const extendedAppHandler = app => {
        app.use(bearerToken());
        app.use(async (ctx, next) => {
            if (!ctx.request.token) {
                const err = new Error("Include bearer token to authenticate");
                err.status = 401;
                throw err;
            }
            try {
                ctx.request.user = jwt.verify(ctx.request.token, process.env.SECRET);
            } catch (err) {
                console.log("jwt verification error ->", err);
                const error = new Error("Invalid token");
                error.status = 401;
                throw error;
            }
            return next();
        });
        appHandler(app);
    };
    return CreateKoaLambda(extendedAppHandler, config);

}