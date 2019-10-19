const CodeModel = require("../../common/models/code/codeModel");
const UserModel = require("../models/userModel");
const codeTypes = require("../../common/models/code/codeTypes");
const WithAuthKoaLambda = require("../../auth/withAuthKoaLambda");
const ConnectMongoose = require("connect-mongoose-lambda");
require("dotenv").config();

const verifyEmail = async (user, reqBody) => {
    if (user.emailVerified) {
        const err = new Error("Email already verified.")
        err.status = 400;
        throw err;
    }
    if (!reqBody.code || typeof reqBody.code !== "string") {
        const err = new Error("Field: \"code\" of type string is required.")
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

    const codeType = codeTypes.email;
    const code = reqBody.code;
    const emailCode = await CodeModel.findOne(
        {
            email: user.email,
            type: codeType.name,
            code: code
        }
    );

    if (!emailCode || emailCode.expiresAt < Date.now()) {
        //verified users emailcode record may be deleted
        const err = new Error("Invalid code or the code is expired.");
        err.status = 400;
        throw err;
    }

    const userDoc = await UserModel.findOneAndUpdate({ email: user.email }, { emailVerified: true }, { new: true });
    if (!userDoc) throw new Error("Unexpected error : user record not found!");

    CodeModel.findByIdAndDelete(emailCode.id).exec()
        .catch(err => console.log("Error: cannot delete code record by its id ! ->", err));

    return userDoc.toObject();
}

module.exports = WithAuthKoaLambda(app => {
    app.use(async ctx => {
        const result = await verifyEmail(ctx.request.user, ctx.request.body);
        ctx.status = 200;
        ctx.body = result;
    });
})