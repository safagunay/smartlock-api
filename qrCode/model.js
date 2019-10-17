const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const randomString = require("randomstring");
const codeDurationSeconds = require("../config").qrCodeDurationInSeconds + 5;
const qrCodeSchema = new Schema(
    {
        email: {
            type: String,
            required: true
        },
        code: {
            type: String,
            default: () => randomString.generate()

        },
        expiresAt: {
            type: Date,
            default: () => Date.now() + codeDurationSeconds * 1000
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

module.exports = mongoose.model("qrCode", qrCodeSchema);