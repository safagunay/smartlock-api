const Koa = require('koa');
const NonceModel = require("../deviceActivityLogger/nonceModel");
const ConnectMongoose = require("connect-mongoose-lambda");
//const app = new Koa();

const Web3 = require("web3");
require("dotenv").config();
const web3 = new Web3(process.env.REMOTE_NODE);

const getCount = async () => {
    ConnectMongoose();
    const nonce = await web3.eth.getTransactionCount(process.env.CONTRACT_OWNER_ACCOUNT);
    console.log(nonce);
    const docs = await NonceModel.find({});
    console.log(docs);
    // const doc = new NonceModel();
    // doc.value = nonce;
    // await doc.save();
    // const getDoc = await NonceModel.findOneAndUpdate({}, { $inc: { 'value': 1 } });
    // console.log(getDoc.value);
}

getCount();

// app.use(async ctx => {
//     const nonce = await web3.eth.getTransactionCount(process.env.CONTRACT_OWNER_ACCOUNT);
//     console.log(nonce);
//     ctx.body = 'Hello World';
// });

// app.listen(3000);