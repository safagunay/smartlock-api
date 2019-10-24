const CodeModel = require("../../common/models/code/codeModel");
const codeTypes = require("../../common/models/code/codeTypes");
//require("dotenv").config();


const getUserEmail = async (qrCode) => {
    const codeType = codeTypes.qr;

    const code = await CodeModel.findOne({
        code: qrCode,
        type: codeType.name
    });
    if (code) return {
        email: code.email,
        isExpired: code.expiresAt < (Date.now() - 3000)
    }

    return code;
}

module.exports = getUserEmail;