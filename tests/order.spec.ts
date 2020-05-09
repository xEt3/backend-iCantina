import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import bodyParser from 'body-parser';
import fs from 'fs';
import { User } from '../models/user.model';
import { Product } from '../models/product.model';
import { Order, IOrder } from '../models/order.model';

let chai = require('chai');
let chaiHttp = require('chai-http');
const expect = require('chai').expect;
chai.use(chaiHttp);
const url = 'http://localhost:3000';
let users: any[] = []
let products: any[] = [];
let orders: any[] = [];
let orderAux: any;
let token = '';
let productAux: any;
let productOrder: any[] = [];

describe('ProductTest: ', () => {
    before((done) => {
        mongoose.connect('mongodb://localhost:27017/testiCantina', { useUnifiedTopology: true, useNewUrlParser: true, useCreateIndex: true, useFindAndModify: false }, function () {
            mongoose.connection.db.dropDatabase(async function () {
                const user = {
                    name: 'Ignacio Belmonte',
                    mail: 'belmonteperona@gmail.com',
                    uid:'113857485189568934662',
                    img: 'https://lh3.googleusercontent.com/a-/AOh14GhO_lwilOXsSx--2I0yvXEgUE9dYZHLqTlRpMcd49Q=s96-c',
                    admin: true,
                    employee: true,
                }
                users.push(user);
                for (let i = 0; i < 5; i++) {
                    const user = {
                        name: 'testing' + i,
                        mail: 'testing' + i,
                        uid:i
                    }
                    users.push(user);
                }
                await User.create(users).then((usuarios) => {
                    users = usuarios;
                });
                for (let i = 0; i < 21; i++) {
                    const product = {
                        name: 'product' + i + ' - admin',
                        price: 12,
                        user: String(users[0]._id)
                    }
                    products.push(product);
                }
                for (let i = 0; i < 5; i++) {
                    const product = {
                        name: 'product available' + i + ' - admin',
                        price: 12,
                        available: true,
                        user: String(users[0]._id)
                    }
                    products.push(product);
                }
                await Product.create(products).then(productDB => {
                    products = productDB;
                })
                productOrder.push({ product: products[0]._id, amount: 1, price: 2 }, { product: products[0]._id, amount: 1 });
                for (let i = 0; i < 5; i++) {
                    const order = {
                        client: users[0]._id,
                        products: productOrder,
                        price: 24,
                    }
                    orders.push(order);
                }
                for (let i = 0; i < 5; i++) {
                    const order = {
                        client: users[1]._id,
                        products: productOrder,
                        price: 24,
                    }
                    orders.push(order);
                }
                await Order.create(orders).then(orderDB => {
                    orders = orderDB;
                })
                done()
            });
        });
    });
    it('should generate token', (done) => {
        chai.request(url)
            .post(`/user/login`)
            .send({ uid: users[0].uid })
            .end(function (err: any, res: any) {
                token = res.body.token;
                expect(res).to.have.status(200);
                done()
            });
    });

    describe('create order', () => {
        it('should insert order with 2 product and cost 24', (done) => {
            chai.request(url)
                .post('/order')
                .send({ products: productOrder, desc: 'descripcion', imgs: ['img'] })
                .set({ 'x-token': token })
                .end(function (err: any, res: any) {
                    expect(res).to.have.status(200);
                    expect(res.ok).to.equals(true);
                    expect(res.body.order.products.length).to.equals(2);
                    expect(res.body.order.price).to.equals(24);
                    expect(res.body.order.client).to.equals(String(users[0]._id));
                    expect(res.body.order.desc).to.equals('descripcion');
                    orderAux = res.body.order
                    done();
                });
        });
        it('should return error no products', (done) => {
            chai.request(url)
                .post('/order')
                .send({ products: [{ nada: 'nada' }] })
                .set({ 'x-token': token })
                .end(function (err: any, res: any) {
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
                .end(function (err: any, res: any) {
                    expect(res).to.have.status(200);
                    expect(res.body.ok).to.equals(true);
                    expect(res.body.orders.length).to.equals(6);
                    done();
                });
        });
    });

    describe('get orders unfinish', () => {
        it('should get a orders unfinished ', (done) => {
            chai.request(url)
                .get(`/order/unfinished`)
                .set({ 'x-token': token })
                .end(function (err: any, res: any) {
                    expect(res).to.have.status(200);
                    expect(res.body.ok).to.equals(true);
                    expect(res.body.orders.length).to.equals(11);
                    res.body.orders.forEach((order: IOrder) => {
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
                .end(function (err: any, res: any) {
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
                .end(function (err: any, res: any) {
                    expect(res).to.have.status(404);
                    expect(res.body.ok).to.equals(false);
                    done();
                });
        });
    });

    describe('mark as done order', () => {
        it('should marks as done by user0', (done) => {
            chai.request(url)
                .post(`/order/markAsDone/${orders[0]._id}`)
                .set({ 'x-token': token })
                .end(function (err: any, res: any) {
                    expect(res).to.have.status(200);
                    expect(res.body.ok).to.equals(true);
                    expect(res.body.order.done).to.equals(true);
                    expect(res.body.order.employee).to.equals(String(users[0]._id));
                    done();
                });
        });

        it('should return error order not found', (done) => {
            chai.request(url)
                .post(`/order/markAsDone/232`)
                .set({ 'x-token': token })
                .end(function (err: any, res: any) {
                    expect(res).to.have.status(404);
                    expect(res.body.ok).to.equals(false);
                    done();
                });
        });
    });

    describe('mark as ready order', () => {
        it('should marks as done by user0', (done) => {
            chai.request(url)
                .post(`/order/markAsReady/${orders[2]._id}`)
                .set({ 'x-token': token })
                .end(function (err: any, res: any) {
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
                .end(function (err: any, res: any) {
                    expect(res).to.have.status(404);
                    expect(res.body.ok).to.equals(false);
                    done();
                });
        });
    });

    describe('get orders client', () => {
        it('should get user 1 orders ', (done) => {
            chai.request(url)
                .get(`/order/client/${users[1]._id}`)
                .set({ 'x-token': token })
                .end(function (err: any, res: any) {
                    expect(res).to.have.status(200);
                    expect(res.body.ok).to.equals(true);
                    expect(res.body.orders.length).to.equals(5);
                    res.body.orders.forEach((element: any) => {
                        expect(element.client).to.equals(String(users[1]._id));
                    });
                    done();
                });
        });

        it('should get an empty array', (done) => {
            chai.request(url)
                .get(`/order/client/${users[4]._id}`)
                .set({ 'x-token': token })
                .end(function (err: any, res: any) {
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
                .end(function (err: any, res: any) {
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
                .end(function (err: any, res: any) {
                    expect(res).to.have.status(200);
                    expect(res.body.ok).to.equals(true);
                    expect(res.body.orders.length).to.equals(1);
                    res.body.orders.forEach((element: any) => {
                        expect(element.client).to.equals(String(users[0]._id));
                    });
                    done();
                });
        });

        it('should get an empty array', (done) => {
            chai.request(url)
                .get(`/order/employee/${users[4]._id}`)
                .set({ 'x-token': token })
                .end(function (err: any, res: any) {
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
                .end(function (err: any, res: any) {
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
                .end(function (err: any, res: any) {
                    expect(res).to.have.status(200);
                    expect(res.body.ok).to.equals(true);
                    expect(res.body.orders.length).to.equals(10);
                    done();
                });
        });

        it('should get an empty array', (done) => {
            chai.request(url)
                .get(`/order/history?page=10`)
                .set({ 'x-token': token })
                .end(function (err: any, res: any) {
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
                .end(function (err: any, res: any) {
                    expect(res).to.have.status(400);
                    expect(res.body.ok).to.equals(false);
                    done();
                });
        });
    });

    // after((done) => {
    //     mongoose.connect('mongodb://localhost:27017/testiPost', { useUnifiedTopology: true, useNewUrlParser: true, useCreateIndex: true, useFindAndModify: false }, function () {
    //         mongoose.connection.db.dropDatabase(function () {
    //             done()
    //         });
    //     })
    // });
});
