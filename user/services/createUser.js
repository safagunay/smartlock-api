const UserModel = require("../models/userModel");
const getCodeDocument = require("../../common/helpers/getCodeDocument");
const codeTypes = require("../../common/models/code/codeTypes");
const CreateKoaLambda = require("create-koa-lambda");
const ConnectMongoose = require("connect-mongoose-lambda");
const sendEmail = require("../helpers/sendEmail");
const jwt = require("jsonwebtoken");
require("dotenv").config();

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
    var savedUser;
    try {
        savedUser = await user.save();
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

    const codeType = codeTypes.email;
    const emailCode = getCodeDocument(codeType, savedUser.email);

    const res = {};
    try {
        await emailCode.save();
        await sendEmail(savedUser.email, emailCode.code, codeType);
    } catch (err) {
        console.log("Error: email could not be sent after user is created ->", err);
        res.data = {
            emailSent: false
        };
        res.message = "Email could not be sent with error " + err;
    }

    res.user = savedUser.toObject();
    res.token = jwt.sign(res.user, process.env.SECRET);
    return res;
}

module.exports = CreateKoaLambda(app => {
    app.use(async ctx => {
        const result = await createUser(ctx.request.body);
        ctx.status = 200;
        ctx.body = result;
    });
})