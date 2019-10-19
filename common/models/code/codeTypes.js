const config = require("../../../config");
module.exports = {
    email: {
        name: "email",
        duration: config.codeValidDuration["email"],
        length: 4,
        charset: "numeric"
    },
    passwordReset: {
        name: "passwordReset",
        duration: config.codeValidDuration["passwordReset"],
        length: 4,
        charset: "numeric"
    },
    qr: {
        name: "passwordReset",
        duration: config.codeValidDuration["passwordReset"],
        length: 4,
        charset: "alphanumeric"
    }
}