const CodeModel = require("../../common/models/code/codeModel");
const codeTypes = require("../../common/models/code/codeTypes");
//require("dotenv").config();


const getUserEmail = async (qrCode) => {
    const codeType = codeTypes.qr;

    const code = await CodeModel.findOne({
        code: qrCode,
        type: codeType.name
    });
    const time = Date.now();
    if (code) return {
        email: code.email,
        isExpired: code.expiresAt < (time - 3000),
        time: time
    }

    return {
        time: time
    }
}

module.exports = getUserEmail;