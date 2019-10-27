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
    const log = { time: emailResult.time, isSuccessful: 1, email: "unknown" };
    const err = new Error();
    err.data = {};
    err.data.log = log;
    err.status = 400;
    if (emailResult.email) {
        log.email = emailResult.email;
        if (emailResult.isExpired) {
            log.isSuccessful = 0;
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
                log.isSuccessful = 0;
                err.message = "Permission not found.";
            }
        }
    }
    else {
        log.isSuccessful = 0;
        err.message = "QRCode not found";
    }

    //add log to blockchain and return the result
    addLogToDevice(device.code, log);
    if (err.message) throw err;
    return log;
}

module.exports = CreateKoaLambda(app => {
    app.use(async ctx => {
        const result = await checkPermission(
            ctx.request.body
        );
        ctx.status = 200;
        ctx.body = result;
    });
})