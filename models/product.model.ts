
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
    img: {
        type: String
    },
    desc: {
        type: String
    },
    available: {
        type: Boolean,
        default: false
    }
});

export interface IProduct extends Document {
    name: string,
    price: number,
    img: string,
    desc: string,
    available: boolean,
}

export const Product = model<IProduct>('Product', productSchema)