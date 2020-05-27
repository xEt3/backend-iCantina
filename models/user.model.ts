
import { Schema, model, Document } from "mongoose";
import bcrypt from 'bcrypt';

const userSchema = new Schema({
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
        default:null
    },
    admin: {
        type: Boolean,
        default: false
    },
    uid:{
        type:String,
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
}
userSchema.pre<Iuser>('save', function (next) {
    this.created = new Date();
    next();
});

export interface Iuser extends Document {
    name: string,
    mail: string,
    img: string,
    uid:string,
    admin: boolean,
    employee: boolean,
    imgsTemp: string[],
    created: Date
}

export const User = model<Iuser>('User', userSchema)