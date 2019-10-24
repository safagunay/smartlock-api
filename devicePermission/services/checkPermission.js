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

    const emailResult = await getEmailFromQR(qrCode);

    const device = await DeviceModel.findOne({
        secret: deviceSecret
    });

    if (!device) {
        const err = new Error("Device not found.");
        err.status = 400;
        throw err;
    }

    // add log to blockchain
    const log = { time: Date.now() };
    if (emailResult) {
        log.email = emailResult.email;
        log.isSuccessful = !emailResult.isExpired;
    }
    else {
        log.email = "unknown";
        log.isSuccessful = false;
    }

    addLogToDevice(device.code, log);

    if (emailResult.isExpired) {
        const err = new Error("QRCode expired");
        err.status = 400;
        throw err;
    }

    if (device.ownerEmail === email) return email;

    const permission = await DevicePermission.findOne(
        {
            email: email,
            deviceCode: device.code,
            expiresAt: { $gte: Date.now() }
        }
    );

    if (!permission) {
        const err = new Error("Permission not found.");
        err.status = 400;
        throw err;
    }

    return email;

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