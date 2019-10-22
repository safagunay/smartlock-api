const DevicePermission = require("../models/devicePermission");
const DeviceModel = require("../../device/models/device");
const WithAuthKoaLambda = require("../../auth/withAuthKoaLambda");
const UserModel = require("../../user/models/userModel");
const ConnectMongoose = require("connect-mongoose-lambda");

const addPermission = async (reqBody, user) => {
    var devicePermission = new DevicePermission();

    devicePermission.deviceOwnerEmail = user.email;
    devicePermission.email = reqBody.email;
    devicePermission.description = reqBody.description;
    devicePermission.deviceCode = reqBody.deviceCode;
    devicePermission.expiresAt = reqBody.expiresAt;
    try {
        await devicePermission.validate();
    } catch (err) {
        err.status = 400;
        throw err;
    }

    ConnectMongoose(undefined, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false,
        useUnifiedTopology: true,
        autoIndex: true
    });

    if (!await UserModel.findOne({ email: devicePermission.email, emailVerified: true })) {
        const err = new Error("email not found or the email is not verified");
        err.status = 400;
        throw err;
    }

    const device = await DeviceModel.findOne({
        code: devicePermission.deviceCode,
        ownerEmail: user.email
    });
    if (!device) {
        const err = new Error("device not found");
        err.status = 400;
        throw err;
    }

    devicePermission = await DevicePermission.findOneAndUpdate({
        deviceCode: device.code,
        email: devicePermission.email
    }, devicePermission.toObject(), { upsert: true, new: true });

    return devicePermission.toObject();
}

module.exports = WithAuthKoaLambda(app => {
    app.use(async ctx => {
        const result = await addPermission(
            ctx.request.body,
            ctx.request.user
        );
        ctx.status = 200;
        ctx.body = result;
    });
})