const config = require("../../../config");
const randomstring = require("randomstring");
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
        name: "qr",
        duration: config.codeValidDuration["qr"],
        length: 32,
        charset: "alphanumeric"
    }
}