const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const modelName = "codes";

const schema = new Schema(
    {
        email: {
            type: String,
            required: true,
            index: true
        },
        type: {
            type: String,
            required: true
        },
        code: {
            type: String,
            required: true,
            index: true

        },
        expiresAt: {
            type: Date,
            required: true
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