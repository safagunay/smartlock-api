const axios = require("axios");
const serviceURL = "http://3.19.59.143:3000";
const instance = axios.create({
    baseURL: serviceURL,
    headers: { 'apikey': process.env.APIKEY_BLOCKCHAIN }
});

const io = require('socket.io-client');
const addLogToDevice = async (data) => {
    await new Promise((resolve, reject) => {
        const socket = io(serviceURL);
        socket.on('connect', () => {
            socket.emit('log', data);
            socket.disconnect();
            resolve();
        });
        const printErr = (err) => { console.log("Socket connection error", err); resolve(); }
        socket.on("connect_error", printErr);
        socket.on("connect_timeout", printErr)
        socket.on("error", printErr);
    })
}

const getDeviceLogs = async (devCode) => {
    const options = {
        method: 'get',
        data: {
            deviceCode: devCode
        }
    }
    const res = await instance(options);
    return res.data;
}

module.exports = {
    addLogToDevice: addLogToDevice,
    getDeviceLogs: getDeviceLogs
}