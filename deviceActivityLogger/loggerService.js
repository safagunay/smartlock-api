const axios = require("./axios");
const addLogToDevice = async (data) => {
    const options = {
        method: 'post',
        data: data
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