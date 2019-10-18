const EmailCode = require("../models/emailCode");
const WithAuthKoaLambda = require("../../auth/withAuthKoaLambda");
const ConnectMongoose = require("connect-mongoose-lambda");
const sendEmail = require("../helpers/sendEmail");
require("dotenv").config();

const resendEmail = async (user) => {
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

    const emailCode = new EmailCode();
    emailCode.email = user.email;
    const updatedEmailCode = await EmailCode.findOneAndUpdate(
        { email: user.email },
        emailCode.toObject(),
        { new: true }
    );
    if (!updatedEmailCode) {
        //verified users emailcode record may be deleted
        const err = new Error("Unexpected error: unverified user exist without email code");
        err.status = 500;
        throw err;
    }
    try {
        sendEmail(updatedEmailCode.email, updatedEmailCode.code);
    } catch (err) {
        const error = new Error("Email could not be sent");
        error.data = err;
        error.status = 500;
        throw error;
    }
}

module.exports = WithAuthKoaLambda(app => {
    app.use(async ctx => {
        const result = await resendEmail(ctx.request.user);
        ctx.status = 200;
        ctx.body = result;
    });
})