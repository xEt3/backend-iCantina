
import { Schema, model, Document } from "mongoose";
import bcrypt from 'bcrypt';

const userSchema = new Schema({
    name: {
        type: String,
        required: [true, 'name is required']
    },
    mail: {
        type: String,
        unique: true,
        required: [true, 'mail is required']
    },
    password: {
        type: String,
        required: [true, 'password is required']
    },
    admin: {
        type: Boolean,
        default: false
    },
    employee: {
        type: Boolean,
        default: false
    }, imgsTemp: [{
        type: String
    }]
});
userSchema.methods.toJSON = function () {
    var obj = this.toObject();
    delete obj.password;
    return obj;
}

userSchema.method('comparePassword', function (password: string = ''): boolean {
    return bcrypt.compareSync(password, this.password);
});

export interface Iuser extends Document {
    name: string,
    mail: string,
    password: string,
    admin: boolean,
    employee: boolean,
    imgsTemp: string[]
    comparePassword(password: string): boolean
}

export const User = model<Iuser>('User', userSchema)