const UserModel = require("../models/userModel");
const EmailCode = require("../models/emailCode");
const CreateKoaLambda = require("create-koa-lambda");
const ConnectMongoose = require("connect-mongoose-lambda");
const sendEmail = require("../helpers/sendEmail");
require("dotenv").config();
console.log("Node env ->", process.env.NODE_ENV);

const createUser = async (inputModel) => {
    const user = new UserModel();
    user.email = inputModel.email;
    user.password = inputModel.password;
    user.firstName = inputModel.firstName;
    user.lastName = inputModel.lastName;
    user.mobilePhone = inputModel.mobilePhone;
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
    var res = null;
    try {
        res = await user.save();
    } catch (err) {
        if (err.code === 11000) {
            err.status = 400;
            err.message = "Email is alredy in use";
            err.data = {
                email: user.email
            }
        }
        throw err;
    }

    const emailCode = new EmailCode({ email: res.email });
    console.log("email code ->", emailCode.code)
    await emailCode.save();
    await sendEmail(res.email, emailCode.code);
    return res.toObject();
}

module.exports = CreateKoaLambda(app => {
    app.use(async ctx => {
        const result = await createUser(ctx.request.body);
        ctx.status = 200;
        ctx.body = result;
    });
})