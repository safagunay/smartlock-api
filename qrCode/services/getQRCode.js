const CodeModel = require("../../common/models/code/codeModel");
const codeTypes = require("../../common/models/code/codeTypes");
const getCodeDocument = require("../../common/helpers/getCodeDocument");
const WithAuthKoaLambda = require("../../auth/withAuthKoaLambda");
const ConnectMongoose = require("connect-mongoose-lambda");

const getQRCode = async (user) => {
    ConnectMongoose(undefined, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false,
        useUnifiedTopology: true,
        autoIndex: true
    });

    const codeType = codeTypes.qr;
    const qrCode = getCodeDocument(codeType, user.email);
    const savedQRCode = await CodeModel.findOneAndUpdate(
        {
            email: user.email,
            type: codeType.name
        }, qrCode.toObject(),
        { upsert: true, new: true }
    );

    return {
        QRCode: savedQRCode.code,
        DurationInSeconds: codeType.duration,
        ExpiresOnUTC: savedQRCode.expiresAt
    }
}

module.exports = WithAuthKoaLambda(app => {
    app.use(async ctx => {
        const result = await getQRCode(ctx.request.user);
        ctx.status = 200;
        ctx.body = result;
    });
})