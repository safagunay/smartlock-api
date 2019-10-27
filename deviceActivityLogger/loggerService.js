const axios = require("./axios");
const addLogToDevice = (data) => {
    const options = {
        method: 'post',
        data: data
    };
    try {
        axios(options);
    } catch (err) {
        console.log(err);
    }
    // await new Promise((resolve, reject) => {
    //     setTimeout(() => resolve(), 100);
    // })
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