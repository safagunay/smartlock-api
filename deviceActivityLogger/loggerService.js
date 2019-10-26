const Web3 = require("web3");
const abi = require("./abi.json");
const address = Web3.utils.toChecksumAddress(process.env.CONTRACT_ADDRESS);
const web3 = new Web3(process.env.REMOTE_NODE);
const contract = new web3.eth.Contract(abi, address, {
    from: process.env.CONTRACT_OWNER_ACCOUNT
});
const NonceModel = require("./nonceModel");

const addLogToDevice = async (devCode, log) => {
    const logString = `${log.email},${log.time},${log.isSuccessful};`;
    const devCodeInt = parseInt(devCode);
    try {
        const nonce = await NonceModel.findOneAndUpdate({}, { $inc: { 'value': 1 } });
        console.log("nonce ->", nonce);
        const tx = contract.methods.addLog(devCodeInt, logString).encodeABI();
        const tx_signed = await web3.eth.accounts.signTransaction({
            nonce: nonce.value,
            to: address,
            data: tx,
            gas: 500000
        }, process.env.ACCOUNT_PK);
        const receipt = await web3.eth.sendSignedTransaction(tx_signed.rawTransaction);
        console.log(`${logString} ->`, receipt);
    } catch (err) {
        console.log(err);
    }

}

const getDeviceLogs = (devCode) => {
    const devCodeInt = parseInt(devCode);
    return contract.methods.getLogs(devCodeInt).call();
}

module.exports = {
    addLogToDevice: addLogToDevice,
    getDeviceLogs: getDeviceLogs
}


// from flask import Flask
// from flask import jsonify
// from flask import request
// from flask import session
// from web3 import Web3
// import json

// from app import app

// ganacheUrl = "http://127.0.0.1:8545"
// web3 = Web3(Web3.HTTPProvider(ganacheUrl))

// # connect account 0
// web3.eth.defaultAccount = web3.eth.accounts[0]

// abi = json.loads('[{"inputs": [], "payable": false, "stateMutability": "nonpayable", "type": "constructor", "signature": "constructor" }, { "constant": false, "inputs": [ { "name": "devId", "type": "uint256" }, { "name": "log", "type": "string" } ], "name": "addLog", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function", "signature": "0x36d10002" }, { "constant": true, "inputs": [ { "name": "devId", "type": "uint256" } ], "name": "getLogs", "outputs": [ { "name": "", "type": "string" } ], "payable": false, "stateMutability": "view", "type": "function", "signature": "0x1124c05a"}]')

// # address where we deploy the contract
// address = web3.toChecksumAddress("0x3bbD0d11ECdc0300298159afF2f8981A69F9Be89")
// contract = web3.eth.contract(address=address, abi=abi)

// logs = [];

// @app.route("/addLog", methods=['POST'])
// def add_log():
//     params = request.get_json()
//     id = int(params['id'])
//     log = params['log']
//     tx_hash = contract.functions.addLog(id, log).transact()
//     web3.eth.waitForTransactionReceipt(tx_hash)
//     #session['log'] = log
//     return jsonify({'id':id, 'log':log})


// @app.route("/getLogs", methods=['POST'])
// def getLogs():
//     params = request.get_json()
//     id = int(params['id'])
//     logs = contract.functions.getLogs(id).call()
//     return logs;
//     #return session['log']