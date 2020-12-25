"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const push_notifications_1 = __importDefault(require("../classes/push-notifications"));
const token_1 = require("../classes/token");
const autenticacion_1 = require("../middlewares/autenticacion");
const order_model_1 = require("../models/order.model");
const user_model_1 = require("../models/user.model");
const userRoutes = express_1.Router();
//Crear un usuario
userRoutes.post('/create', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.body.name || !req.body.mail || !req.body.uid) {
        return res.status(400).json({
            ok: false,
            error: 'Shold indicate name, email, and uid'
        });
    }
    let user;
    try {
        user = yield user_model_1.User.findOne({ uid: req.body.uid }).exec();
    }
    catch (error) {
        return res.status(400).json({
            ok: false,
            error: 'uid error'
        });
    }
    if (user) {
        return res.status(400).json({
            ok: false,
            error: ' User with this mail already exist'
        });
    }
    const usr = {
        name: req.body.name,
        mail: req.body.mail,
        uid: req.body.uid,
        img: req.body.img
    };
    user_model_1.User.create(usr).then(userDB => {
        const userToken = token_1.Token.getJwtToken({
            _id: userDB.id,
            name: userDB.name,
            mail: userDB.mail,
            uid: userDB.uid
        });
        res.json({
            ok: true,
            token: userToken
        });
    }).catch(error => {
        res.status(400).json({
            ok: false,
            err: error
        });
    });
}));
//Get users paginated
userRoutes.get('/', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let page = Number(req.query.page - 1) || 0;
        let skip = page * 10;
        const users = yield user_model_1.User.find().limit(10).skip(skip).sort({ _id: -1 }).exec();
        res.json({
            ok: true,
            users
        });
    }
    catch (error) {
        res.status(400).json({
            ok: false,
            error: 'Invalid page'
        });
    }
}));
//Get user by id
userRoutes.get('/get/:idUser', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const idUser = req.params.idUser;
        const user = yield user_model_1.User.findById(idUser).exec();
        if (user) {
            return res.json({
                ok: true,
                user: user
            });
        }
        else {
            return res.status(404).json({
                ok: false,
                message: 'Invalido id user'
            });
        }
    }
    catch (err) {
        return res.status(404).json({
            ok: false,
            message: 'Invalid id user'
        });
    }
}));
//Get user by term
userRoutes.get('/search/:term', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const term = req.params.term;
    try {
        let page = Number(req.query.page - 1) || 0;
        let skip = page * 10;
        const users = yield user_model_1.User.find({ $or: [{ 'name': { $regex: term, $options: "i" } }, { mail: { $regex: term, $options: "i" } }] }).limit(10).skip(skip).sort({ _id: -1 }).exec();
        res.json({
            ok: true,
            users: users
        });
    }
    catch (error) {
        res.status(400).json({
            ok: false,
            error: 'invalid page'
        });
    }
}));
//Login
userRoutes.post('/login', (req, res) => {
    try {
        user_model_1.User.findOne({ uid: req.body.uid }, (err, userDB) => {
            if (err) {
                return res.status(404).json({
                    ok: false,
                    err
                });
            }
            if (!userDB) {
                return res.status(400).json({
                    ok: false,
                    message: 'Userincorrect'
                });
            }
            const userToken = token_1.Token.getJwtToken({
                _id: userDB.id,
                name: userDB.name,
                mail: userDB.mail,
                admin: userDB.admin,
                employee: userDB.employee
            });
            console.log(userDB.mail + " login");
            res.json({
                ok: true,
                token: userToken
            });
        });
    }
    catch (error) {
        return res.status(400).json({
            ok: false,
            message: 'Mail invalid'
        });
    }
});
// actualizar usuario
userRoutes.post('/update', autenticacion_1.verificaToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = {
        name: req.body.name || req.user.name,
        mail: req.body.mail || req.user.mail,
    };
    try {
        let usr = yield user_model_1.User.findOne({ mail: user.mail }).exec();
        if (usr && user.mail !== req.user.mail) {
            return res.status(400).json({
                ok: false,
                message: 'This mail is alrady in use'
            });
        }
    }
    catch (error) { }
    try {
        user_model_1.User.findByIdAndUpdate(req.user._id, user, { new: true }, (err, userDB) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }
            ;
            if (!userDB) {
                return res.status(404).json({
                    ok: false,
                    message: 'Invalid ID'
                });
            }
            const userToken = token_1.Token.getJwtToken({
                _id: userDB.id,
                name: user.name,
                mail: user.mail,
            });
            console.log('Update user ', user);
            res.json({
                ok: true,
                token: userToken,
                user: userDB
            });
        });
    }
    catch (error) {
        return res.status(404).json({
            ok: false,
            message: 'Invalid type id'
        });
    }
}));
//get usuario from token
userRoutes.get('/me', [autenticacion_1.verificaToken], (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.User.findById(req.user._id).exec();
    if (user) {
        res.json({
            ok: true,
            user: user
        });
    }
    else {
        res.json({
            ok: false,
            message: 'User not found'
        });
    }
}));
userRoutes.post('/changeRange/:idUser', [autenticacion_1.verificacionTokenAdmin], (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const idUser = req.params.idUser;
    let range;
    let userDB;
    try {
        userDB = yield user_model_1.User.findById(idUser).exec();
    }
    catch (error) {
        return res.status(404).json({
            ok: false,
            error
        });
    }
    if (!userDB) {
        return res.status(404).json({
            ok: false,
            message: 'User not found'
        });
    }
    if (req.body.admin === undefined && req.body.employee === undefined) {
        return res.status(400).json({
            ok: false,
            message: 'Empty parameters'
        });
    }
    if (req.body.admin === undefined) {
        req.body.admin = userDB.admin;
    }
    if (req.body.employee === undefined) {
        req.body.employee = userDB.employee;
    }
    const user = {
        admin: req.body.admin,
        employee: req.body.employee
    };
    if (user.admin === true) {
        user.employee = true;
        range = 'Administrador';
    }
    else if (user.employee == true) {
        range = 'Empleado';
    }
    else {
        range = 'Cliente';
    }
    try {
        user_model_1.User.findByIdAndUpdate(idUser, user, { new: true }, (err, userDB) => __awaiter(void 0, void 0, void 0, function* () {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }
            ;
            if (!userDB) {
                return res.status(404).json({
                    ok: false,
                    message: 'Invalid ID'
                });
            }
            console.log('Update range user ' + userDB.name + ", new ranges: " + user);
            res.json({
                ok: true,
                user: yield user_model_1.User.findById(idUser).exec()
            });
            push_notifications_1.default.sendNotificationToUser('Cambio de rango', `${req.user.name} te ha cambiado el rango a ${range}`, idUser);
            return;
        }));
    }
    catch (error) {
        return res.status(404).json({
            ok: false,
            message: 'Invalid type id'
        });
    }
}));
userRoutes.delete('/deleteUser/:idUser', [autenticacion_1.verificacionTokenAdmin], (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const idUser = req.params.idUser;
    let userDB;
    try {
        userDB = yield user_model_1.User.findByIdAndDelete(idUser).exec();
        if (userDB) {
            let ordersUser = yield order_model_1.Order.findOneAndDelete({ client: idUser }).exec();
            while (ordersUser) {
                ordersUser = yield order_model_1.Order.findOneAndDelete({ client: idUser }).exec();
            }
            return res.json({
                ok: true,
                user: userDB
            });
        }
        else {
            console.log('delete user: ', userDB);
            return res.status(404).json({
                ok: false,
                message: 'User not found'
            });
        }
    }
    catch (error) {
        return res.status(404).json({
            ok: false,
            error
        });
    }
}));
exports.default = userRoutes;
