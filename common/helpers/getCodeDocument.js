const CodeModel = require("../models/code/codeModel");
const randomstring = require("randomstring");
module.exports = (codeType, email) => {
    const codeDoc = new CodeModel();
    codeDoc.type = codeType.name;
    codeDoc.code = randomstring.generate({
        length: codeType.length,
        charset: codeType.charset
    });
    codeDoc.expiresAt = Date.now() + (codeType.duration) * 1000;
    codeDoc.email = email;
    return codeDoc;
}