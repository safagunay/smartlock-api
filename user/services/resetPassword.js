const CodeModel = require("../../common/models/code/codeModel");
const UserModel = require("../models/userModel");
const codeTypes = require("../../common/models/code/codeTypes");
const getCodeDocument = require("../../common/helpers/getCodeDocument");
const CreateKoaLambda = require("create-koa-lambda");
const ConnectMongoose = require("connect-mongoose-lambda");
const sendEmail = require("../helpers/sendEmail");
const emailValidator = require("../../validators/validateEmail");
require("dotenv").config();

const resetPassword = async (reqBody) => {
    if (!reqBody.email || typeof reqBody.email !== "string") {
        const err = new Error("Field \"email\" of type string is required.");
        err.status = 400;
        throw err;
    }
    if (!emailValidator(reqBody.email)) {
        const err = new Error("Invalid email.");
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
    if (! await UserModel.findOne({ email: reqBody.email })) {
        const err = new Error("Email does not exist.");
        err.status = 400;
        throw err;
    }

    const codeType = codeTypes.passwordReset;
    const code = getCodeDocument(codeType, reqBody.email);
    const savedCode = await CodeModel.findOneAndUpdate({
        email: code.email,
        type: codeType.name
    }, code.toObject(), { new: true, upsert: true });

    try {
        await sendEmail(savedCode.email, savedCode.code, codeType);
    } catch (err) {
        throw err;
    }

    return {
        message: "Password reset token is sent to user's email",
        data: {
            email: savedCode.email,
            codeDurationSeconds: codeType.duration
        }
    }
}

module.exports = CreateKoaLambda(app => {
    app.use(async ctx => {
        const result = await resetPassword(ctx.request.body);
        ctx.status = 200;
        ctx.body = result;
    });
})