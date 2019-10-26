const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const modelName = "nonces";

const schema = new Schema(
    {
        value: {
            type: Number,
            required: true,
        }
    }, {
    toObject: {
        transform: (doc, ret) => {
            delete ret._id;
            delete ret.__v;
        }
    },
    toJSON: {
        transform: (doc, ret) => {
            delete ret._id;
            delete ret.__v;
        }
    }
});

module.exports = mongoose.model(modelName, schema);