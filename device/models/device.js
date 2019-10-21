const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const randomString = require("randomstring");

const deviceSchema = new Schema(
    {
        ownerEmail: {
            type: String,
        },
        name: {
            type: String,
            maxlength: 50,
            minlength: 1,
            trim: true
        },
        code: {
            type: String,
            required: true,
            default: () => randomString.generate({
                charset: "numeric",
                length: 12
            }),
            unique: true
        },
        secret: {
            type: String,
            unique: true,
            required: true,
            default: () => randomString.generate()
        },
        createdAt: {
            type: Date,
            default: Date.now
        },
        registeredAt: {
            type: Date
        }
    }, {
    toObject: {
        transform: (doc, ret) => {
            delete ret._id;
            delete ret.__v;
            delete ret.createdAt;
            delete ret.secret;
        }
    },
    toJSON: {
        transform: (doc, ret) => {
            delete ret._id;
            delete ret.__v;
            delete ret.createdAt;
            delete ret.secret;
        }
    }
});

module.exports = mongoose.model("devices", deviceSchema);