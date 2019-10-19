const CodeModel = require("../../common/models/code/codeModel");
const UserModel = require("../models/userModel");
const codeTypes = require("../../common/models/code/codeTypes");
const CreateKoaLambda = require("create-koa-lambda");
const ConnectMongoose = require("connect-mongoose-lambda");
const emailValidator = require("../../validators/validateEmail");
require("dotenv").config();

const confirmPasswordReset = async (reqBody) => {
    if (!reqBody.code || typeof reqBody.code !== "string") {
        const err = new Error("Field \"code\" of type string is required.");
        err.status = 400;
        throw err;
    }
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
    if (!reqBody.newPassword || typeof reqBody.email !== "string") {
        const err = new Error("Field \"newPassword\" of type string is required.");
        err.status = 400;
        throw err;
    }
    if (!reqBody.confirmNewPassword || typeof reqBody.confirmNewPassword !== "string") {
        const err = new Error("Field \"confirmNewPassword\" of type string is required.");
        err.status = 400;
        throw err;
    }
    if (reqBody.newPassword !== reqBody.confirmNewPassword) {
        const err = new Error("Field \"newPassword\" and \"confirmNewPasswod\" must be equal.");
        err.status = 400;
        throw err;
    }
    const newPassword = reqBody.newPassword.trim();
    if (newPassword.length < 4) {
        const err = new Error("Password's length can't be smaller than 4.");
        err.status = 400;
        err.data = {
            password: newPassword
        }
        throw err;
    }
    ConnectMongoose(undefined, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false,
        useUnifiedTopology: true,
        autoIndex: true
    });

    const codeType = codeTypes.passwordReset;
    const code = reqBody.code;
    const passwordResetCode = await CodeModel.findOne(
        {
            email: reqBody.email,
            type: codeType.name,
            code: code
        }
    );

    if (!passwordResetCode || passwordResetCode.expiresAt < Date.now()) {
        const err = new Error("Invalid code or the code is expired.");
        err.status = 400;
        throw err;
    }

    const userDoc = await UserModel.findOneAndUpdate(
        { email: reqBody.email },
        { password: reqBody.newPassword },
        { new: true }
    );
    if (!userDoc) throw new Error("Unexpected error : user record not found!");

    CodeModel.findByIdAndDelete(passwordResetCode.id).exec()
        .catch(err => console.log("Error: cannot delete code record by its id ! ->", err));

    return userDoc.toObject();
}

module.exports = CreateKoaLambda(app => {
    app.use(async ctx => {
        const result = await confirmPasswordReset(ctx.request.body);
        ctx.status = 200;
        ctx.body = result;
    });
})