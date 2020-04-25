
import { Schema, model, Document } from "mongoose";

const orderSchema = new Schema({
    client: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Client is requiered']
    },
    products: [{
        product: {
            type: Schema.Types.ObjectId,
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
        type: String
    },
    done: {
        type: Boolean,
        default: false
    },
    employee: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    created: {
        type: Date
    },
    deliverDate: {
        type: Date
    }
});

orderSchema.pre<IOrder>('save', function (next) {
    this.created = new Date();
    next();
});

export interface IOrder extends Document {
    client: string,
    products: { product: string, amount: number }[],
    price: number,
    desc: string,
    done: boolean,
    created: Date,
    deliverDate: Date
}

export const Order = model<IOrder>('Order', orderSchema)