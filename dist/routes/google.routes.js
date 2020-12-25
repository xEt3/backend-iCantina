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
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_model_1 = require("../models/user.model");
const googleRoutes = express_1.Router();
googleRoutes.post('/auth', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const uid = req.body.uid;
    if (req.body.uid && req.body.mail) {
        let user;
        try {
            user = yield user_model_1.User.findOne({ uid: req.body.uid }).exec();
        }
        catch (error) {
        }
        if (user) {
            res.redirect(307, '/user/login');
        }
        else {
            res.redirect(307, '/user/create');
        }
    }
    else {
        return res.status(400).json({
            ok: false,
            error: 'Bad request'
        });
    }
}));
exports.default = googleRoutes;
