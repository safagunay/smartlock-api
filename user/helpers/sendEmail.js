const mailjet = require('node-mailjet')
    .connect(process.env.MJ_APIKEY_PUBLIC, process.env.MJ_APIKEY_PRIVATE);
const app_config = require("../../config");

module.exports = (email, code) => {
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
                    "Subject": "Verify your email address",
                    "TextPart": `Use the following code to verify your email address in ${app_config.emailCodeDurationInMinutes} minutes\n${code}`,
                }
            ]
        })
    return request
        .then((result) => {
            console.log(result.body)
            return result;
        });
}

