const CodeModel = require("../../common/models/code/codeModel");
const getCodeDocument = require("../../common/helpers/getCodeDocument");
const codeTypes = require("../../common/models/code/codeTypes");
const WithAuthKoaLambda = require("../../auth/withAuthKoaLambda");
const ConnectMongoose = require("connect-mongoose-lambda");
const sendEmail = require("../helpers/sendEmail");
require("dotenv").config();

const resendEmail = async (user) => {
    //TODO : if user claims change, invalidate the old token
    //or assume that client app uses latest token
    if (user.emailVerified) {
        const err = new Error("Email already verified.")
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
    const emailCode = getCodeDocument(codeType, user.email);
    const updatedEmailCode = await CodeModel.findOneAndUpdate(
        { email: user.email, type: codeType.name },
        emailCode.toObject(),
        { new: true, upsert: true }
    );

    try {
        await sendEmail(updatedEmailCode.email, updatedEmailCode.code, codeType);
    } catch (err) {
        const error = new Error("Email could not be sent");
        error.data = err;
        error.status = 500;
        throw error;
    }
    return {
        message: "Code is refreshed and email is sent.",
        data: {
            email: user.email,
            codeDurationSeconds: codeType.duration
        }
    }
}

module.exports = WithAuthKoaLambda(app => {
    app.use(async ctx => {
        const result = await resendEmail(ctx.request.user);
        ctx.status = 200;
        ctx.body = result;
    });
})