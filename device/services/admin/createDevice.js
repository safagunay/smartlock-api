const DeviceModel = require("../../models/device");
const WithAuthKoaLambda = require("../../../auth/withAuthKoaLambda");
const ConnectMongoose = require("connect-mongoose-lambda");

const createDevice = async (user) => {
    if (!user.roles || !user.roles.includes("admin")) {
        const err = new Error();
        err.status = 401;
        throw err;
    }
    ConnectMongoose(undefined, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false,
        useUnifiedTopology: true,
        autoIndex: true
    });
    var device = new DeviceModel();
    device = await DeviceModel.create(device);
    return {
        id: device.id,
        code: device.code,
        secret: device.secret,
        createdAt: device.createdAt
    };
}

module.exports = WithAuthKoaLambda(app => {
    app.use(async ctx => {
        const result = await createDevice(ctx.request.user);
        ctx.status = 200;
        ctx.body = result;
    });
})