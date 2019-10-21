const mongoose = require("mongoose");
const Schema = mongoose.Schema;
//const bcrypt = require("bcrypt");
const validateEmail = require("../../validators/validateEmail");
const validatePhoneNumber = require("../../validators/validatePhoneNumber");
//const saltRounds = 10;

const userSchema = new Schema(
    {
        email: {
            type: String,
            maxlength: 30,
            required: true,
            trim: true,
            validate: validateEmail,
            unique: true
        },
        password: {
            type: String,
            minlength: 4,
            trim: true,
            required: true
        },
        emailVerified: {
            type: Boolean,
            default: false
        },
        firstName: {
            type: String,
            trim: true,
            maxlength: 30,
        },
        lastName: {
            type: String,
            trim: true,
            maxlength: 30,
        },
        mobilePhone: {
            type: String,
            trim: true,
            maxlength: 20,
            validate: validatePhoneNumber
        },
        createdAt: {
            type: Date,
            default: Date.now
        },
        roles: {
            type: [String],
            default: undefined
        }
    },
    {
        toObject: {
            transform: (doc, ret) => {
                delete ret._id;
                delete ret.__v;
                delete ret.password;
                delete ret.roles;
            }
        },
        toJSON: {
            transform: (doc, ret) => {
                delete ret._id;
                delete ret.__v;
                delete ret.password;
                delete ret.roles;
            }
        }
    });

// userSchema.statics.findNotDeleted = function (id) {
//     if (id) return this.findOne({ _id: id, isDeleted: false });
//     else return this.find({ isDeleted: false });
// };

//hash user password before saving into database
// userSchema.pre('save', function (next) {
//     this.password = bcrypt.hashSync(this.password, saltRounds);
//     next();
// });

module.exports = mongoose.model("user", userSchema);
