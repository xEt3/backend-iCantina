
import { Schema, model, Document } from "mongoose";

const productSchema = new Schema({
    name: {
        type: String,
        required: [true, 'name is required']
    },
    price: {
        type: Number,
        required: [true, 'price is required']
    },
    imgs: [{
        type: String
    }],
    desc: {
        type: String
    },
    available: {
        type: Boolean,
        default: false
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User is requiered']
    }
});

export interface IProduct extends Document {
    name: string,
    price: number,
    imgs: string[],
    desc: string,
    available: boolean,
    user:string
}

export const Product = model<IProduct>('Product', productSchema)