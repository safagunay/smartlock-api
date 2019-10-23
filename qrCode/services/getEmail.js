const CodeModel = require("../../common/models/code/codeModel");
const codeTypes = require("../../common/models/code/codeTypes");
const ConnectMongoose = require("connect-mongoose-lambda");
//require("dotenv").config();


const getUserEmail = async (qrCode) => {
    const codeType = codeTypes.qr;

    if (!qrCode || typeof qrCode !== "string") {
        const err = new Error("Field 'QRCode' of type 'string' is required");
        err.status = 400;
        throw err;
    }
    // if (qrCode.length < codeType.length) {
    //     const err = new Error("Invalid QRCode");
    //     err.status = 400;
    //     throw err;
    // }
    ConnectMongoose(undefined, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false,
        useUnifiedTopology: true,
        autoIndex: true
    });

    const code = await CodeModel.findOne({
        code: qrCode,
        type: codeType.name,
        expiresAt: { $gte: Date.now() }
    });
    if (!code) {
        const err = new Error("Email not found from QRCode");
        err.status = 400;
        throw err;
    }
    return code.email;
}

module.exports = getUserEmail;