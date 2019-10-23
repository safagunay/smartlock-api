const DevicePermission = require("../models/devicePermission");
const DeviceModel = require("../../device/models/device");
const CreateKoaLambda = require("../../common/modules/create-koa-lambda");
const getEmailFromQR = require("../../qrCode/services/getEmail");

const checkPermission = async (reqBody) => {
    console.log(reqBody);
    const email = await getEmailFromQR(reqBody.QRCode);

    const device = await DeviceModel.findOne({
        secret: reqBody.DeviceSecret
    });

    if (!device) {
        const err = new Error("Device not found.");
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