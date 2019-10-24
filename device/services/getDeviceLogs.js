const getLogs = require("../../deviceActivityLogger").getDeviceLogs;
const DeviceModel = require("../models/device");
const WithAuthKoaLambda = require("../../auth/withAuthKoaLambda");
const ConnectMongoose = require("connect-mongoose-lambda");

const getDeviceLogs = async (user, reqBody) => {
    ConnectMongoose(undefined, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false,
        useUnifiedTopology: true,
        autoIndex: true
    });

    const device = await DeviceModel.findOne({ code: reqBody.deviceCode, ownerEmail: user.email });
    if (!device) {
        const error = new Error("Device not found.");
        error.status = 400;
        throw error;
    }

    try {
        return await getLogs(device.code);
    } catch (err) {
        const error = new Error("Could not retrieve device logs!");
        error.status = 500;
        error.data = err;
        throw err;
    }
}

module.exports = WithAuthKoaLambda(app => {
    app.use(async ctx => {
        const result = await getDeviceLogs(ctx.request.user, ctx.request.body);
        ctx.status = 200;
        ctx.body = result;
    });
})