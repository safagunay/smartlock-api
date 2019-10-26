const axios = require("axios");
const instance = axios.create({
    baseURL: "https://securesmartlock-blockchain.now.sh/devicelog",
    headers: { 'apikey': process.env.APIKEY_BLOCKCHAIN }
});

module.exports = instance;