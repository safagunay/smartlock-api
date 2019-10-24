const DevicePermission = require("../models/devicePermission");
const DeviceModel = require("../../device/models/device");
const CreateKoaLambda = require("../../common/modules/create-koa-lambda");
const getEmailFromQR = require("../../qrCode/services/getEmail");
const addLogToDevice = require("../../deviceActivityLogger").addLogToDevice;
const ConnectMongoose = require("connect-mongoose-lambda");

const checkPermission = async (reqBody) => {
    const qrCode = reqBody.QRCode;
    const deviceSecret = reqBody.DeviceSecret;

    ConnectMongoose(undefined, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false,
        useUnifiedTopology: true,
        autoIndex: true
    });

    //find device
    const device = await DeviceModel.findOne({
        secret: deviceSecret
    });
    if (!device) {
        const err = new Error("Device not found.");
        err.status = 400;
        throw err;
    }

    //find user
    const emailResult = await getEmailFromQR(qrCode);

    // build log and err objects
    const log = { time: Date.now(), isSuccessful: true, email: "unknown" };
    const err = new Error();
    err.status = 400;
    if (emailResult) {
        log.email = emailResult.email;
        if (emailResult.isExpired) {
            log.isSuccessful = false;
            err.message = "QRCode expired";
        }
        else if (device.ownerEmail !== emailResult.email) {
            const permission = await DevicePermission.findOne(
                {
                    email: emailResult.email,
                    deviceCode: device.code,
                    expiresAt: { $gte: Date.now() }
                }
            );
            if (!permission) {
                log.isSuccessful = false;
                err.message = "Permission not found.";
            }
        }
    }
    else {
        log.isSuccessful = false;
        err.message = "QRCode not found";
    }

    //add log to blockchain and return the result
    await addLogToDevice(device.code, log);
    if (err.message) throw err;
    return emailResult.email;
}

module.exports = CreateKoaLambda(app => {
    app.use(async ctx => {
        const result = await checkPermission(
            ctx.request.body,
            ctx.request.user
        );
        ctx.status = 200;
        ctx.body = result;
    });
})