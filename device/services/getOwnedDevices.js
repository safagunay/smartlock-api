const DeviceModel = require("../models/device");
const WithAuthKoaLambda = require("../../auth/withAuthKoaLambda");
const ConnectMongoose = require("connect-mongoose-lambda");

const getOwnedDevices = async (user) => {
    ConnectMongoose(undefined, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false,
        useUnifiedTopology: true,
        autoIndex: true
    });

    return await DeviceModel.find({
        ownerEmail: user.email
    });
}

module.exports = WithAuthKoaLambda(app => {
    app.use(async ctx => {
        const result = await getOwnedDevices(
            ctx.request.user
        );
        ctx.status = 200;
        ctx.body = result;
    });
})