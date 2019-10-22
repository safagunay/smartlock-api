const DevicePermission = require("../models/devicePermission");
const WithAuthKoaLambda = require("../../auth/withAuthKoaLambda");
const ConnectMongoose = require("connect-mongoose-lambda");

const deletePermission = async (reqBody, user) => {
    var devicePermission = new DevicePermission();

    devicePermission.deviceOwnerEmail = user.email;
    devicePermission.email = reqBody.email;
    devicePermission.deviceCode = reqBody.deviceCode;
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

    const deleteObj = {
        deviceOwnerEmail: user.email,
        email: devicePermission.email,
        deviceCode: devicePermission.deviceCode
    }

    await DevicePermission.deleteOne(deleteObj);
    if (!devicePermission) {
        const err = new Error("Permission not found");
        err.status = 400;
        throw err;
    }

    return deleteObj;
}

module.exports = WithAuthKoaLambda(app => {
    app.use(async ctx => {
        const result = await deletePermission(
            ctx.request.body,
            ctx.request.user
        );
        ctx.status = 200;
        ctx.body = result;
    });
})