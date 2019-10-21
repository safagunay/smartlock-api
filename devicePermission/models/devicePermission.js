const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const schema = new Schema(
    {
        deviceOwnerEmail: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        },
        description: {
            type: String,
            maxlength: 50,
            trim: true,
        },
        deviceCode: {
            type: String,
            required: true,
            index: true
        },
        isDeleted: {
            type: Boolean,
            default: false
        },
        expiresAt: {
            type: Date
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

module.exports = mongoose.model("devicePermissions", schema);