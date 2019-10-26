const axios = require("./axios");
const addLogToDevice = async (devCode, log) => {
    const options = {
        method: 'post',
        data: {
            deviceCode: devCode,
            log: log
        }
    };
    try {
        const res = await axios(options);
        console.log(res.data);
    } catch (err) {
        console.log(err);
    }
}

const getDeviceLogs = async (devCode) => {
    const options = {
        method: 'get',
        data: {
            deviceCode: devCode
        }
    }
    const res = await axios(options);
    return res.data;
}

module.exports = {
    addLogToDevice: addLogToDevice,
    getDeviceLogs: getDeviceLogs
}