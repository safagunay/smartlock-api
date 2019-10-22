const mongoose = require("mongoose");
const emailValidator = require("../../validators/validateEmail");
const Schema = mongoose.Schema;

const schema = new Schema(
    {
        deviceOwnerEmail: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true,
            validate: emailValidator
        },
        description: {
            type: String,
            maxlength: 250,
            trim: true,
        },
        deviceCode: {
            type: String,
            required: true,
            maxlength: 50,
            minlength: 12,
            trim: true,
            index: true
        },
        expiresAt: {
            type: Date,
            validate: {
                validator: (val) => val > Date.now(),
                message: "expiration date must be a future date"
            }
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

schema.virtual('isExpired').get(function () {
    return this.expiresAt < Date.now();
})

module.exports = mongoose.model("devicePermissions", schema);