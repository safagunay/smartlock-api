const DevicePermission = require("../models/devicePermission");
const WithAuthKoaLambda = require("../../auth/withAuthKoaLambda");
const ConnectMongoose = require("connect-mongoose-lambda");

const updatePermission = async (reqBody, user) => {
    if (!reqBody.description || !reqBody.expiresAt) {
        const err = new Error("model contains no updatable fields : 'description' || 'expiresAt'");
        err.status = 400;
        throw err;
    }
    var devicePermission = new DevicePermission();

    devicePermission.deviceOwnerEmail = user.email;
    devicePermission.email = reqBody.email;
    devicePermission.deviceCode = reqBody.deviceCode;
    //updatable fields
    devicePermission.description = reqBody.description;
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

    const update = {};
    if (devicePermission.description) update.description = devicePermission.description;
    if (devicePermission.expiresAt) update.expiresAt = devicePermission.expiresAt;

    devicePermission = await DevicePermission.findOneAndUpdate({
        deviceOwnerEmail: user.email,
        deviceCode: devicePermission.deviceCode,
        email: devicePermission.email
    }, update, { new: true });
    if (!devicePermission) {
        const err = new Error("Permission not found");
        err.status = 400;
        throw err;
    }

    return devicePermission.toObject();
}

module.exports = WithAuthKoaLambda(app => {
    app.use(async ctx => {
        const result = await updatePermission(
            ctx.request.body,
            ctx.request.user
        );
        ctx.status = 200;
        ctx.body = result;
    });
})