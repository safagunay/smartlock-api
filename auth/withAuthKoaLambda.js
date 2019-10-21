const bearerToken = require("koa-bearer-token");
const CreateKoaLambda = require("../common/modules/create-koa-lambda");
const jwt = require("jsonwebtoken");
const ConnectMongoose = require("connect-mongoose-lambda");
const UserModel = require("../user/models/userModel");

module.exports = (appHandler, config) => {
    const extendedAppHandler = app => {
        app.use(bearerToken());
        app.use(async (ctx, next) => {
            if (!ctx.request.token) {
                const err = new Error("Include bearer token to authenticate");
                err.status = 401;
                throw err;
            }
            var user;
            //TODO : add expiration time to jwt tokens
            try {
                user = jwt.verify(ctx.request.token, process.env.SECRET);
            } catch (err) {
                console.log("jwt verification error ->", err);
                const error = new Error("Invalid token");
                error.status = 401;
                throw error;
            }
            ConnectMongoose(undefined, {
                useNewUrlParser: true,
                useCreateIndex: true,
                useFindAndModify: false,
                useUnifiedTopology: true,
                autoIndex: true
            });
            user = await UserModel.findOne({ email: user.email });
            if (!user) throw Error("User not found");
            ctx.request.user = user;
            return next();
        });
        appHandler(app);
    };
    return CreateKoaLambda(extendedAppHandler, config);

}