"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verificacionTokenAdmin = exports.verificacionTokenEmployee = exports.verificaToken = void 0;
const token_1 = require("../classes/token");
const verificaToken = (req, res, next) => {
    const token = req.get('x-token');
    token_1.Token.comprobarToken(token).then((decode) => {
        // console.log('Verificacion Token',decode)
        req.user = decode.user;
        next();
    }).catch(err => {
        res.status(401).json({
            ok: false,
            mensaje: 'Error token verification'
        });
    });
};
exports.verificaToken = verificaToken;
const verificacionTokenEmployee = (req, res, next) => {
    const token = req.get('x-token');
    token_1.Token.comprobarToken(token).then((decode) => {
        if (decode.user.employee) {
            req.user = decode.user;
            next();
        }
        else {
            res.status(401).json({
                ok: false,
                mensaje: 'Error, you are not employee'
            });
        }
    }).catch(err => {
        res.status(401).json({
            ok: false,
            mensaje: 'Error token'
        });
    });
};
exports.verificacionTokenEmployee = verificacionTokenEmployee;
const verificacionTokenAdmin = (req, res, next) => {
    const token = req.get('x-token');
    token_1.Token.comprobarToken(token).then((decode) => {
        if (decode.user.admin) {
            req.user = decode.user;
            next();
        }
        else {
            res.status(401).json({
                ok: false,
                mensaje: 'Error, you are not admin'
            });
        }
    }).catch(err => {
        res.status(401).json({
            ok: false,
            mensaje: 'Error token'
        });
    });
};
exports.verificacionTokenAdmin = verificacionTokenAdmin;
