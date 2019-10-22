const DevicePermission = require("../models/devicePermission");
const WithAuthKoaLambda = require("../../auth/withAuthKoaLambda");
const ConnectMongoose = require("connect-mongoose-lambda");
const validateEmail = require("../../validators/validateEmail");

const getPermissions = async (reqBody, user) => {
    const deviceCode = reqBody.deviceCode;
    const email = reqBody.email;
    if (!reqBody.deviceCode || typeof reqBody.deviceCode !== "string") {
        const err = new Error("Field 'deviceCode' of type 'string' is required");
        err.status = 400;
        throw err;
    }
    if (email && !validateEmail(email)) {
        const err = new Error("Invalid email address");
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

    const queryObj = {
        deviceOwnerEmail: user.email,
        deviceCode: deviceCode,
        expiresAt: { $gte: Date.now() }
    };
    if (email) {
        queryObj.email = email;
        return await DevicePermission.findOne(queryObj);
    }

    return await DevicePermission.find(queryObj);

}

module.exports = WithAuthKoaLambda(app => {
    app.use(async ctx => {
        const result = await getPermissions(
            ctx.request.body,
            ctx.request.user
        );
        ctx.status = 200;
        ctx.body = result;
    });
})