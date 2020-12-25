"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = require("mongoose");
const userSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: [true, 'name is required']
    },
    mail: {
        type: String,
        required: [true, 'mail is required']
    },
    img: {
        type: String,
        default: null
    },
    admin: {
        type: Boolean,
        default: false
    },
    uid: {
        type: String,
        unique: true,
        required: [true, 'uid is required']
    },
    employee: {
        type: Boolean,
        default: false
    }, imgsTemp: [{
            type: String
        }],
    created: {
        type: Date
    }
});
userSchema.methods.toJSON = function () {
    var obj = this.toObject();
    delete obj.uid;
    return obj;
};
userSchema.pre('save', function (next) {
    this.created = new Date();
    next();
});
exports.User = mongoose_1.model('User', userSchema);
