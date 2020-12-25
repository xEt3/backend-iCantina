"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Order = void 0;
const mongoose_1 = require("mongoose");
const orderSchema = new mongoose_1.Schema({
    client: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Client is requiered']
    },
    products: [{
            product: {
                type: mongoose_1.Schema.Types.ObjectId,
                ref: 'Product',
                required: [true, 'product of products is requiered']
            },
            amount: {
                type: Number,
                required: [true, 'amount of products is requiered']
            },
        }],
    price: {
        type: Number,
        required: [true, 'price is required']
    },
    desc: {
        type: String,
        default: ""
    },
    done: {
        type: Boolean,
        default: false
    },
    ready: {
        type: Boolean,
        default: false
    },
    employee: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
    },
    employeeMarkReady: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
    },
    created: {
        type: Date
    },
    deliverDate: {
        type: Date
    },
    readyDate: {
        type: Date
    }
});
orderSchema.pre('save', function (next) {
    this.created = new Date();
    next();
});
exports.Order = mongoose_1.model('Order', orderSchema);
