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
const mongoose_1 = __importDefault(require("mongoose"));
const config_1 = require("../config");
const order_model_1 = require("../models/order.model");
const product_model_1 = require("../models/product.model");
const user_model_1 = require("../models/user.model");
let chai = require('chai');
let chaiHttp = require('chai-http');
const expect = require('chai').expect;
chai.use(chaiHttp);
const url = config_1.config.baseURL;
let users = [];
let products = [];
let orders = [];
let orderAux;
let token = '';
let productAux;
let productOrder = [];
describe('Order test: ', () => {
    before((done) => {
        mongoose_1.default.connect(config_1.config.database_url_local, { useUnifiedTopology: true, useNewUrlParser: true, useCreateIndex: true, useFindAndModify: false }, function () {
            mongoose_1.default.connection.db.dropDatabase(function () {
                return __awaiter(this, void 0, void 0, function* () {
                    const user = {
                        name: 'Ignacio Belmonte',
                        mail: 'belmonteperona@gmail.com',
                        uid: '113857485189568934662',
                        img: 'https://lh3.googleusercontent.com/a-/AOh14GhO_lwilOXsSx--2I0yvXEgUE9dYZHLqTlRpMcd49Q=s96-c',
                        admin: true,
                        employee: true,
                    };
                    users.push(user);
                    for (let i = 0; i < 3; i++) {
                        const user = {
                            name: 'testing' + i,
                            mail: 'testing' + i,
                            uid: i
                        };
                        users.push(user);
                    }
                    yield user_model_1.User.create(users).then((usuarios) => {
                        users = usuarios;
                    });
                    for (let i = 0; i < 3; i++) {
                        const product = {
                            name: 'product' + i + ' - admin',
                            price: 12,
                            user: String(users[0]._id)
                        };
                        products.push(product);
                    }
                    for (let i = 0; i < 3; i++) {
                        const product = {
                            name: 'product available' + i + ' - admin',
                            price: 12,
                            available: true,
                            user: String(users[0]._id)
                        };
                        products.push(product);
                    }
                    yield product_model_1.Product.create(products).then(productDB => {
                        products = productDB;
                    });
                    productOrder.push({ product: products[0]._id, amount: 1, price: 2 }, { product: products[0]._id, amount: 1 });
                    for (let j = 0; j < 2; j++) {
                        const order = {
                            client: users[0]._id,
                            products: productOrder,
                            price: 24,
                        };
                        orders.push(order);
                    }
                    yield order_model_1.Order.create(orders).then(orderDB => {
                        orders = orderDB;
                    });
                    done();
                });
            });
        });
    });
    it('should generate token', (done) => {
        chai.request(url)
            .post(`/user/login`)
            .send({ uid: users[0].uid })
            .end(function (err, res) {
            token = res.body.token;
            expect(res).to.have.status(200);
            done();
        });
    });
    describe('create order', () => {
        it('should insert order with 2 product and cost 24', (done) => {
            chai.request(url)
                .post('/order')
                .send({ products: productOrder, desc: 'descripcion', imgs: ['img'] })
                .set({ 'x-token': token })
                .end(function (err, res) {
                expect(res).to.have.status(200);
                expect(res.ok).to.equals(true);
                expect(res.body.order.products.length).to.equals(2);
                expect(res.body.order.price).to.equals(24);
                expect(res.body.order.client).to.equals(String(users[0]._id));
                expect(res.body.order.desc).to.equals('descripcion');
                orderAux = res.body.order;
                done();
            });
        });
        it('should return error no products', (done) => {
            chai.request(url)
                .post('/order')
                .send({ products: [{ nada: 'nada' }] })
                .set({ 'x-token': token })
                .end(function (err, res) {
                expect(res).to.have.status(400);
                expect(res.ok).to.equals(false);
                done();
            });
        });
    });
    describe('get my orders', () => {
        it('should get my orders ', (done) => {
            chai.request(url)
                .get(`/order/myOrders`)
                .set({ 'x-token': token })
                .end(function (err, res) {
                expect(res).to.have.status(200);
                expect(res.body.ok).to.equals(true);
                done();
            });
        });
    });
    describe('get orders unfinish', () => {
        it('should get a orders unfinished ', (done) => {
            chai.request(url)
                .get(`/order/unfinished`)
                .set({ 'x-token': token })
                .end(function (err, res) {
                expect(res).to.have.status(200);
                expect(res.body.ok).to.equals(true);
                res.body.orders.forEach((order) => {
                    expect(order.done).to.equals(false);
                });
                done();
            });
        });
    });
    describe('delete order', () => {
        it('should return ok and delete order', (done) => {
            chai.request(url)
                .delete(`/order/remove/${orderAux._id}`)
                .set({ 'x-token': token })
                .end(function (err, res) {
                expect(res).to.have.status(200);
                expect(res.body.order._id).to.equals(orderAux._id);
                expect(res.body.ok).to.equals(true);
                done();
            });
        });
        it('should return error post was deleted', (done) => {
            chai.request(url)
                .delete(`/order/remove/${orderAux._id}`)
                .set({ 'x-token': token })
                .end(function (err, res) {
                expect(res).to.have.status(404);
                expect(res.body.ok).to.equals(false);
                done();
            });
        });
    });
    describe('mark as done order', () => {
        it('should marks as done by user0', (done) => {
            console.log(`/order/markAsDone/${orders[0]._id}`);
            chai.request(url)
                .post(`/order/markAsDone/${orders[0]._id}`)
                .set({ 'x-token': token })
                .end(function (err, res) {
                expect(res).to.have.status(200);
                expect(res.body.ok).to.equals(true);
                expect(res.body.order.done).to.equals(true);
                done();
            });
        });
        it('should return error order not found', (done) => {
            chai.request(url)
                .post(`/order/markAsDone/232`)
                .set({ 'x-token': token })
                .end(function (err, res) {
                expect(res).to.have.status(404);
                expect(res.body.ok).to.equals(false);
                done();
            });
        });
    });
    describe('mark as ready order', () => {
        it('should marks as done by user0', (done) => {
            chai.request(url)
                .post(`/order/markAsReady/${orders[1]._id}`)
                .set({ 'x-token': token })
                .end(function (err, res) {
                expect(res).to.have.status(200);
                expect(res.body.ok).to.equals(true);
                expect(res.body.order.ready).to.equals(true);
                expect(res.body.order.employeeMarkReady).to.equals(String(users[0]._id));
                done();
            });
        });
        it('should return error order not found', (done) => {
            chai.request(url)
                .post(`/order/markAsReady/232`)
                .set({ 'x-token': token })
                .end(function (err, res) {
                expect(res).to.have.status(404);
                expect(res.body.ok).to.equals(false);
                done();
            });
        });
    });
    describe('get orders client', () => {
        it('should get user 1 orders ', (done) => {
            chai.request(url)
                .get(`/order/client/${users[0]._id}`)
                .set({ 'x-token': token })
                .end(function (err, res) {
                expect(res).to.have.status(200);
                expect(res.body.ok).to.equals(true);
                res.body.orders.forEach((element) => {
                    expect(element.client._id).to.equals(String(users[0]._id));
                });
                done();
            });
        });
        it('should get an empty array', (done) => {
            chai.request(url)
                .get(`/order/client/${users[2]._id}`)
                .set({ 'x-token': token })
                .end(function (err, res) {
                expect(res).to.have.status(200);
                expect(res.body.ok).to.equals(true);
                expect(res.body.orders.length).to.equals(0);
                done();
            });
        });
        it('should return error invalid client ', (done) => {
            chai.request(url)
                .get(`/order/client/34`)
                .set({ 'x-token': token })
                .end(function (err, res) {
                expect(res).to.have.status(400);
                expect(res.body.ok).to.equals(false);
                done();
            });
        });
    });
    describe('get orders employee', () => {
        it('should get user0 orders made', (done) => {
            chai.request(url)
                .get(`/order/employee/${users[0]._id}`)
                .set({ 'x-token': token })
                .end(function (err, res) {
                expect(res).to.have.status(200);
                expect(res.body.ok).to.equals(true);
                expect(res.body.orders.length).to.equals(1);
                res.body.orders.forEach((element) => {
                    expect(element.client).to.equals(String(users[0]._id));
                });
                done();
            });
        });
        it('should get an empty array', (done) => {
            chai.request(url)
                .get(`/order/employee/${users[2]._id}`)
                .set({ 'x-token': token })
                .end(function (err, res) {
                expect(res).to.have.status(200);
                expect(res.body.ok).to.equals(true);
                expect(res.body.orders.length).to.equals(0);
                done();
            });
        });
        it('should return error invalid employee ', (done) => {
            chai.request(url)
                .get(`/order/employee/34`)
                .set({ 'x-token': token })
                .end(function (err, res) {
                expect(res).to.have.status(400);
                expect(res.body.ok).to.equals(false);
                done();
            });
        });
    });
    describe('get orders history', () => {
        it('should return 10 orders', (done) => {
            chai.request(url)
                .get(`/order/history?page=1`)
                .set({ 'x-token': token })
                .end(function (err, res) {
                expect(res).to.have.status(200);
                expect(res.body.ok).to.equals(true);
                done();
            });
        });
        it('should get an empty array', (done) => {
            chai.request(url)
                .get(`/order/history?page=10`)
                .set({ 'x-token': token })
                .end(function (err, res) {
                expect(res).to.have.status(200);
                expect(res.body.ok).to.equals(true);
                expect(res.body.orders.length).to.equals(0);
                done();
            });
        });
        it('should return error invalid employee ', (done) => {
            chai.request(url)
                .get(`/order/history?page=-1`)
                .set({ 'x-token': token })
                .end(function (err, res) {
                expect(res).to.have.status(400);
                expect(res.body.ok).to.equals(false);
                done();
            });
        });
    });
});
