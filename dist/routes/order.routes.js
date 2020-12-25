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
const autenticacion_1 = require("../middlewares/autenticacion");
const order_model_1 = require("../models/order.model");
const product_model_1 = require("../models/product.model");
const user_model_1 = require("../models/user.model");
const orderRoutes = express_1.Router();
orderRoutes.get('/myOrders', [autenticacion_1.verificaToken], (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const orders = yield order_model_1.Order.find({ client: req.user._id }).sort({ _id: -1 }).populate('products.product').populate('employee').exec();
        return res.json({
            ok: true,
            orders
        });
    }
    catch (error) {
        return res.status(400).json({
            ok: false,
            error: 'invalid page'
        });
    }
}));
orderRoutes.get('/history', [autenticacion_1.verificacionTokenEmployee], (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let page = Number(req.query.page - 1) || 0;
        let skip = page * 10;
        const orders = yield order_model_1.Order.find().sort({ _id: -1 }).limit(10).skip(skip).populate('products.product').populate('employee').populate('client').populate('employeeMarkReady').exec();
        return res.json({
            ok: true,
            orders
        });
    }
    catch (error) {
        return res.status(400).json({
            ok: false,
            error: 'invalid page'
        });
    }
}));
orderRoutes.get('/unfinished', [autenticacion_1.verificacionTokenEmployee], (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const orders = yield order_model_1.Order.find({ done: false }).sort({ _id: -1 }).populate('products.product').populate('employee').populate('client').populate('employeeMarkReady').exec();
        return res.json({
            ok: true,
            orders
        });
    }
    catch (error) {
        return res.status(400).json({
            ok: false,
            error: 'error'
        });
    }
}));
orderRoutes.delete('/remove/:idOrder', [autenticacion_1.verificacionTokenEmployee], (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const idOrder = req.params.idOrder;
    let order = null;
    try {
        order = yield order_model_1.Order.findById(idOrder).exec();
    }
    catch (error) {
    }
    if (order) {
        order_model_1.Order.findByIdAndDelete(idOrder).exec().then(orderDeleted => {
            if (orderDeleted) {
                return res.json({
                    ok: true,
                    order: orderDeleted
                });
            }
        }).catch(err => {
            res.json({
                ok: false,
                err
            });
        });
    }
    else {
        return res.status(404).json({
            ok: false,
            message: 'Order not found'
        });
    }
}));
//Create order
orderRoutes.post('/', [autenticacion_1.verificaToken], (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const products = req.body.products;
    const desc = req.body.desc;
    const client = req.user._id;
    let price = 0;
    if (!products) {
        return res.status(400).json({
            ok: false,
            message: 'invalid order, has not products '
        });
    }
    let productsNames = '';
    try {
        for (let i = 0; i < products.length; i++) {
            let product = yield product_model_1.Product.findById(products[i].product).exec();
            if (!product || products[i].amount <= 0) {
                throw 'error';
            }
            price += product.price * products[i].amount;
            productsNames += product.name + ', ';
        }
        if (price === 0) {
            throw 'error';
        }
    }
    catch (error) {
        return res.status(400).json({
            ok: false,
            message: 'Error while calulated the price'
        });
    }
    const order = {
        products,
        desc,
        client,
        price
    };
    order_model_1.Order.create(order).then((orderDB) => __awaiter(void 0, void 0, void 0, function* () {
        console.log('Create new order from user ' + req.user.mail, orderDB);
        push_notifications_1.default.sendNotificationToAllEmployees('Nuevo Pedido!', `${req.user.name} ha pedido ${productsNames.substring(0, productsNames.length - 2)}`);
        return res.json({
            ok: true,
            order: orderDB
        });
    })).catch(err => {
        return res.status(400).json({
            ok: false,
            err
        });
    });
}));
orderRoutes.post('/markAsDone/:idOrder', [autenticacion_1.verificacionTokenEmployee], (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const idOrder = req.params.idOrder;
    let order;
    try {
        order = yield order_model_1.Order.findById(idOrder).exec();
        if (!order) {
            throw 'error';
        }
        order.done = true;
        if (!order.ready) {
            order.ready = true;
            order.employeeMarkReady = req.user._id;
            order.readyDate = new Date();
        }
        order.deliverDate = new Date();
        order.employee = req.user._id;
        order_model_1.Order.findByIdAndUpdate(idOrder, order).exec((orderDB) => __awaiter(void 0, void 0, void 0, function* () {
            const orderNew = yield order_model_1.Order.findById(idOrder).exec();
            console.log('User ' + req.user.mail + ' mark as done order ', orderNew);
            res.json({
                ok: true,
                order: orderNew
            });
            push_notifications_1.default.sendNotificationToUser('Pedido Entregado!', 'Tu pedido ha sido entregado por ' + req.user.name, orderNew.client);
            return;
        }));
    }
    catch (error) {
        return res.status(404).json({
            ok: false,
            message: 'order not found'
        });
    }
}));
orderRoutes.post('/markAsReady/:idOrder', [autenticacion_1.verificacionTokenEmployee], (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const idOrder = req.params.idOrder;
    let order;
    try {
        order = yield order_model_1.Order.findById(idOrder).exec();
        if (!order) {
            throw 'error';
        }
        order.ready = true;
        order.employeeMarkReady = req.user._id;
        order.readyDate = new Date();
        order_model_1.Order.findByIdAndUpdate(idOrder, order).exec((orderDB) => __awaiter(void 0, void 0, void 0, function* () {
            const orderNew = yield order_model_1.Order.findById(idOrder).exec();
            console.log('User ' + req.user.mail + ' mark as ready order ', orderNew);
            res.json({
                ok: true,
                order: orderNew
            });
            push_notifications_1.default.sendNotificationToUser('Pedido Listo!', 'Tu pedido esta listo, puedes pasar a recogerlo en la cantina', order.client);
            return;
        }));
    }
    catch (error) {
        return res.status(404).json({
            ok: false,
            message: 'order not found'
        });
    }
}));
orderRoutes.post('/markAsNoReady/:idOrder', [autenticacion_1.verificacionTokenEmployee], (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const idOrder = req.params.idOrder;
    let order;
    try {
        order = yield order_model_1.Order.findById(idOrder).exec();
        if (!order) {
            throw 'error';
        }
        order.ready = false;
        order.employeeMarkReady = null;
        order.readyDate = null;
        order_model_1.Order.findByIdAndUpdate(idOrder, order).exec((orderDB) => __awaiter(void 0, void 0, void 0, function* () {
            const orderNew = yield order_model_1.Order.findById(idOrder).exec();
            console.log('User ' + req.user.mail + ' mark as no ready order ', orderNew);
            return res.json({
                ok: true,
                order: orderNew
            });
        }));
    }
    catch (error) {
        return res.status(404).json({
            ok: false,
            message: 'order not found'
        });
    }
}));
orderRoutes.get('/client/:idClient', [autenticacion_1.verificacionTokenEmployee], (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const idClient = req.params.idClient;
    let client;
    try {
        client = yield user_model_1.User.findById(idClient).exec();
        if (!client) {
            return res.status(404).json({
                ok: false,
                message: 'Client not found'
            });
        }
    }
    catch (error) {
        return res.status(400).json({
            ok: false,
            message: 'invalid id client'
        });
    }
    try {
        let page = Number(req.query.page - 1) || 0;
        let skip = page * 10;
        const orders = yield order_model_1.Order.find({ client: idClient }).limit(10).skip(skip).sort({ _id: -1 }).populate('products.product').populate('employee').populate('client').populate('employeeMarkReady').exec();
        return res.json({
            ok: true,
            orders
        });
    }
    catch (error) {
        return res.status(400).json({
            ok: false,
            error: 'invalid page'
        });
    }
}));
orderRoutes.get('/employee/:idEmployee', [autenticacion_1.verificacionTokenEmployee], (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const idEmployee = req.params.idEmployee;
    let employee;
    try {
        employee = yield user_model_1.User.findById(idEmployee).exec();
        if (!employee) {
            return res.status(404).json({
                ok: false,
                message: 'Employee not found'
            });
        }
    }
    catch (error) {
        return res.status(400).json({
            ok: false,
            message: 'invalid id client'
        });
    }
    try {
        let page = Number(req.query.page - 1) || 0;
        let skip = page * 10;
        const orders = yield order_model_1.Order.find({ employee: idEmployee }).limit(10).skip(skip).sort({ _id: -1 }).exec();
        return res.json({
            ok: true,
            orders
        });
    }
    catch (error) {
        return res.status(400).json({
            ok: false,
            error: 'invalid page'
        });
    }
}));
exports.default = orderRoutes;
