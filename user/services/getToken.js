const UserModel = require("../models/userModel");
const CreateKoaLambda = require("../../common/modules/create-koa-lambda");
const ConnectMongoose = require("connect-mongoose-lambda");
const jwt = require("jsonwebtoken");
console.log("Node env ->", process.env.NODE_ENV);

const getToken = async (inputModel) => {
    var user = new UserModel();
    user.email = inputModel.email;
    user.password = inputModel.password;
    try {
        await user.validate();
    } catch (err) {
        err.status = 400;
        throw err;
    }
    ConnectMongoose(undefined, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false,
        useUnifiedTopology: true,
        autoIndex: true
    });
    var res = {};
    try {
        user = await UserModel.findOne({ email: user.email, password: user.password });
        if (!user) {
            const error = new Error("Invalid email or password.");
            error.status = 401;
            throw error;
        }
    } catch (err) {
        throw err;
    };
    res.user = user.toObject();
    res.token = jwt.sign(res.user, process.env.SECRET);
    return res;
}

module.exports = CreateKoaLambda(app => {
    app.use(async ctx => {
        const result = await getToken(ctx.request.body);
        ctx.status = 200;
        ctx.body = result;
    });
})