const mailjet = require('node-mailjet')
    .connect(process.env.MJ_APIKEY_PUBLIC, process.env.MJ_APIKEY_PRIVATE);
const app_config = require("../../config");

module.exports = (email, code, codeType) => {
    var subject;
    var textPart
    switch (codeType.name) {
        case "email":
            subject = "Verify your email address";
            textPart = `Use the following code in ${codeType.duration / 60} minutes to verify your email address.\n${code}`;
            break;
        case "passwordReset":
            subject = "Reset your password";
            textPart = `Use the following code in ${codeType.duration / 60} minutes to reset your password.\n${code}`;
            break;
        default:
            subject = "verification code";
            textPart = `Use the following verification code in ${codeType.duration / 60} minutes\n${code}`;
    };
    const request = mailjet
        .post("send", { 'version': 'v3.1' })
        .request({
            "Messages": [
                {
                    "From": {
                        "Email": app_config.senderEmail,
                    },
                    "To": [
                        {
                            "Email": email,
                        }
                    ],
                    "Subject": subject,
                    "TextPart": textPart
                }
            ]
        })
    return request
        .then((result) => {
            console.log(result.body)
            return result;
        });
}

