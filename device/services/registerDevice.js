const DeviceModel = require("../models/device");
const WithAuthKoaLambda = require("../../auth/withAuthKoaLambda");
const ConnectMongoose = require("connect-mongoose-lambda");

const registerDevice = async (reqBody, user) => {
    if (!user.emailVerified) {
        const err = new Error("user's email is not verified.");
        err.status = 400;
        throw err;
    }
    var deviceCode = reqBody.code;
    var deviceName = reqBody.name;
    if (!deviceCode || typeof deviceCode !== "string") {
        const err = new Error("Field 'code' of string type is required.");
        err.status = 400;
        throw err;
    }
    if (deviceCode.length > 50) {
        const err = new Error("The field 'code' can't be longer than 50 characters");
        err.status = 400;
        throw err;
    }
    if (!deviceName || typeof deviceName !== "string") {
        const err = new Error("Field 'name' of string type is required.");
        err.status = 400;
        throw err;
    }
    deviceName = deviceName.trim();
    if (deviceName.length < 1) {
        const err = new Error("The field 'name' is required");
        err.status = 400;
        throw err;
    }
    if (deviceName.length > 50) {
        const err = new Error("The field 'name' can't be longer than 50 characters");
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

    const device = await DeviceModel.findOneAndUpdate({
        code: deviceCode,
        ownerEmail: { $exists: false }
    }, { ownerEmail: user.email, name: deviceName, registeredAt: Date.now() }, { new: true });
    if (!device) {
        const err = new Error("device not found");
        err.status = 400;
        throw err;
    }
    return device.toObject();
}

module.exports = WithAuthKoaLambda(app => {
    app.use(async ctx => {
        const result = await registerDevice(
            ctx.request.body,
            ctx.request.user
        );
        ctx.status = 200;
        ctx.body = result;
    });
})