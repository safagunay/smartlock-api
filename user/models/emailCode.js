const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const randomString = require("randomstring");
const codeDurationMinutes = require("../../config").emailCodeDurationInMinutes + 1;
const emailCodeSchema = new Schema(
    {
        email: {
            type: String,
            required: true
        },
        code: {
            type: String,
            default: () => randomString.generate({
                length: 4,
                charset: 'numeric'
            })

        },
        expiresAt: {
            type: Date,
            default: () => Date.now() + codeDurationMinutes * 60 * 1000
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

module.exports = mongoose.model("emailCode", emailCodeSchema);