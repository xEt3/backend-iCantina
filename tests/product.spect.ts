import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import bodyParser from 'body-parser';
import fs from 'fs';
import { User } from '../models/user.model';
import { Product } from '../models/product.model';

let chai = require('chai');
let chaiHttp = require('chai-http');
const expect = require('chai').expect;
chai.use(chaiHttp);
const url = 'http://localhost:3000';
let users: any[] = []
let products: any[] = [];
let token = '';
let productAux: any;


describe('UserTest: ', () => {
    before((done) => {
        mongoose.connect('mongodb://localhost:27017/testiCantina', { useUnifiedTopology: true, useNewUrlParser: true, useCreateIndex: true, useFindAndModify: false }, function () {
            mongoose.connection.db.dropDatabase(async function () {
                const user = {
                    name: 'admin',
                    mail: 'admin',
                    admin: true,
                    employee: true,
                    password: bcrypt.hashSync('123456', 10)
                }
                users.push(user);
                for (let i = 0; i < 5; i++) {
                    const user = {
                        name: 'testing' + i,
                        mail: 'testing' + i,
                        password: bcrypt.hashSync('123456', 10)
                    }
                    users.push(user);
                }
                users.push(user);
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
                done()
            });
        });
    });

    it('should generate token', (done) => {
        chai.request(url)
            .post(`/user/login`)
            .send({ mail: users[0].mail, password: '123456' })
            .end(function (err: any, res: any) {
                token = res.body.token;
                expect(res).to.have.status(200);
                done()
            });
    });

    describe('create product', () => {

        it('should insert product', (done) => {
            chai.request(url)
                .post('/product')
                .send({ name: 'product test', price: 12 })
                .set({ 'x-token': token })
                .end(function (err: any, res: any) {
                    expect(res).to.have.status(200);
                    expect(res.ok).to.equals(true);
                    done();
                });
        });

        it('should recive error invalid parameters', (done) => {
            chai.request(url)
                .post('/product')
                .send({ mensaje: 'post1' })
                .set({ 'x-token': token })
                .end(function (err: any, res: any) {
                    expect(res).to.have.status(400);
                    expect(res.ok).to.equals(false);
                    done();
                });
        });

        it('should receive an error, invalid token', (done) => {
            chai.request(url)
                .post('/product')
                .end(function (err: any, res: any) {
                    expect(res).to.have.status(401);
                    expect(res.ok).to.equals(false)
                    done();
                });
        });

    });

    describe('get products', () => {

        it('should get a product ', (done) => {
            chai.request(url)
                .get(`/product`)
                .set({ 'x-token': token })
                .end(function (err: any, res: any) {
                    expect(res).to.have.status(200);
                    expect(res.body.ok).to.equals(true);
                    expect(res.body.products.length).to.equals(10);
                    done();
                });
        });

        it('should return an empty array', (done) => {
            chai.request(url)
                .get('/product?page=10')
                .set({ 'x-token': token })
                .end(function (err: any, res: any) {
                    expect(res).to.have.status(200);
                    expect(res.body.ok).to.equals(true)
                    expect(res.body.products.length).to.equals(0);
                    done();
                });
        });

        it('should return an error invalid page', (done) => {
            chai.request(url)
                .get('/product?page=-1')
                .set({ 'x-token': token })
                .end(function (err: any, res: any) {
                    expect(res).to.have.status(400);
                    expect(res.body.ok).to.equals(false)
                    done();
                });
        });

    });

    describe('get products availlable', () => {

        it('should get a 5 product availables ', (done) => {
            chai.request(url)
                .get(`/product/availables`)
                .end(function (err: any, res: any) {
                    expect(res).to.have.status(200);
                    expect(res.body.ok).to.equals(true);
                    expect(res.body.products.length).to.equals(5);
                    done();
                });
        });

        it('should return an empty array', (done) => {
            chai.request(url)
                .get('/product/availables?page=2')
                .end(function (err: any, res: any) {
                    expect(res).to.have.status(200);
                    expect(res.body.ok).to.equals(true)
                    expect(res.body.products.length).to.equals(0);
                    done();
                });
        });

        it('should return an error invalid page', (done) => {
            chai.request(url)
                .get('/product/availables?page=-1')
                .end(function (err: any, res: any) {
                    expect(res).to.have.status(400);
                    expect(res.body.ok).to.equals(false)
                    done();
                });
        });

    });

    describe('delete product', () => {

        it('should return ok and delete product', (done) => {
            chai.request(url)
                .delete(`/product/remove/${products[0]._id}`)
                .set({ 'x-token': token })
                .end(function (err: any, res: any) {
                    expect(res).to.have.status(200);
                    expect(res.body.product.name).to.equals(products[0].name);
                    expect(res.body.ok).to.equals(true);
                    done();
                });
        });

        it('should return error post was deleted', (done) => {
            chai.request(url)
                .delete(`/product/remove/${products[0]._id}`)
                .set({ 'x-token': token })
                .end(function (err: any, res: any) {
                    expect(res).to.have.status(404);
                    expect(res.body.ok).to.equals(false);
                    done();
                });
        });

    });


    describe('upload file', () => {

        it('Should upload image file', (done) => {
            chai.request(url)
                .post('/product/upload')
                .set({ 'x-token': token })
                .attach('image', fs.readFileSync('qricon.png'), 'test.png')
                .end(function (err: any, res: any) {
                    expect(res).to.have.status(200);
                    expect(res.body.ok).to.equals(true);
                    expect(res.body.usr.imgsTemp.length).to.equals(1);
                    users[0] = res.body.usr
                    done();
                });
        });


        it('Should return 400 error no  file', (done) => {
            chai.request(url)
                .post('/product/upload')
                .set({ 'x-token': token })
                .end(function (err: any, res: any) {
                    expect(res).to.have.status(400);
                    expect(res.body.ok).to.equals(false);
                    done();
                });
        })

        it('Should 409 error no image file', (done) => {
            chai.request(url)
                .post('/product/upload')
                .set({ 'x-token': token })
                .attach('image', fs.readFileSync('.gitignore'), 'read.me')
                .end(function (err: any, res: any) {
                    expect(res).to.have.status(409);
                    expect(res.body.ok).to.equals(false);
                    done();
                });
        })
    })

    describe('Delete temp file', () => {

        it('should delete the first user0 image', (done) => {
            chai.request(url)
                .delete(`/product/image/temp/${users[0].imgsTemp[0]}`)
                .set({ 'x-token': token })
                .end(function (err: any, res: any) {
                    expect(res).to.have.status(200);
                    expect(res.body.ok).to.equals(true);
                    expect(res.body.usr.imgsTemp.length).to.equals(0);
                    users[0] = res.body.usr
                    done();
                });
        })

        it('should return error incorrect file name', (done) => {
            chai.request(url)
                .delete(`/product/image/temp/dfd`)
                .set({ 'x-token': token })
                .end(function (err: any, res: any) {
                    expect(res).to.have.status(404);
                    expect(res.body.ok).to.equals(false);
                    done();
                });
        })
    })

    describe('delete temp folder', () => {


        it('Should upload image file', (done) => {
            chai.request(url)
                .post('/product/upload')
                .set({ 'x-token': token })
                .attach('image', fs.readFileSync('qricon.png'), 'test.png')
                .end(function (err: any, res: any) {
                    expect(res).to.have.status(200);
                    expect(res.body.ok).to.equals(true);
                    expect(res.body.usr.imgsTemp.length).to.equals(1);
                    users[0] = res.body.usr
                    done();
                });
        });

        it('shoul delete user0 temp folder', (done) => {
            chai.request(url)
                .delete(`/product/image/temp`)
                .set({ 'x-token': token })
                .end(function (err: any, res: any) {
                    expect(res).to.have.status(200);
                    expect(res.body.ok).to.equals(true);
                    expect(res.body.usr.imgsTemp.length).to.equals(0);
                    users[0] = res.body.usr
                    done();
                });
        });

        it('shoul return error cause user0 does not have temp folder', (done) => {
            chai.request(url)
                .delete(`/product/image/temp`)
                .set({ 'x-token': token })
                .end(function (err: any, res: any) {
                    expect(res).to.have.status(404);
                    expect(res.body.ok).to.equals(false);
                    done();
                });
        });

        it('shoul return error cause token is not correct', (done) => {
            chai.request(url)
                .delete(`/product/image/temp`)
                .end(function (err: any, res: any) {
                    expect(res).to.have.status(401);
                    expect(res.body.ok).to.equals(false);
                    done();
                });
        });
    })

    describe('get image product', () => {
        it('Should upload image file', (done) => {
            chai.request(url)
                .post('/product/upload')
                .set({ 'x-token': token })
                .attach('image', fs.readFileSync('qricon.png'), 'test.png')
                .end(function (err: any, res: any) {
                    expect(res).to.have.status(200);
                    expect(res.body.ok).to.equals(true);
                    expect(res.body.usr.imgsTemp.length).to.equals(1);
                    done();
                });
        });

        it('should insert a product', (done) => {
            chai.request(url)
                .post('/product')
                .send({ name: 'product with image',price:12 })
                .set({ 'x-token': token })
                .end(function (err: any, res: any) {
                    expect(res).to.have.status(200);
                    expect(res.body.ok).to.equals(true);
                    productAux = res.body.product;
                    done();
                });
        });

        it('should receive image product just created', (done) => {
            chai.request(url)
                .get(`/product/image/${productAux.user}/${productAux.imgs[0]}`)
                .end(function (err: any, res: any) {
                    expect(res).to.have.status(200);
                    done();
                });
        });

    });


    describe('Update User', () => {
        it('Should change the name product', (done) => {
            chai.request(url)
                .post(`/product/update/${products[1]._id}`)
                .send({ name: 'new product name' })
                .set({ 'x-token': token })
                .end(function (err: any, res: any) {
                    expect(res).to.have.status(200);
                    expect(res.body.product.name).equals('new product name');
                    products[1]=res.body.product;
                    done()
                });
        })

        it('Should change the available satatus', (done) => {
            chai.request(url)
                .post(`/product/update/${products[1]._id}`)
                .send({ available: true})
                .set({ 'x-token': token })
                .end(function (err: any, res: any) {
                    expect(res).to.have.status(200);
                    expect(res.body.product.available).equals(true);
                    products[1]=res.body.product;
                    done()
                });
        })

        it('Should change the price', (done) => {
            chai.request(url)
                .post(`/product/update/${products[1]._id}`)
                .send({ price: 13, nose:'o'})
                .set({ 'x-token': token })
                .end(function (err: any, res: any) {
                    expect(res).to.have.status(200);
                    expect(res.body.product.price).equals(13);
                    products[1]=res.body.product;
                    done()
                });
        })

        it('Should return error available invalid', (done) => {
            chai.request(url)
                .post(`/product/update/${products[1]._id}`)
                .send({ available: '13'})
                .set({ 'x-token': token })
                .end(function (err: any, res: any) {
                    expect(res).to.have.status(400);
                    done()
                });
        })
    });

    describe('Delete image product', () => {

        it('should delete the first user0 image', (done) => {
            chai.request(url)
                .delete(`/product/image/product/${productAux._id}/${productAux.imgs[0]}`)
                .set({ 'x-token': token })
                .end(function (err: any, res: any) {
                    expect(res).to.have.status(200);
                    expect(res.body.ok).to.equals(true);
                    expect(res.body.product.imgs.length).to.equals(0);
                    done();
                });
        })

        // it('should return error incorrect file name', (done) => {
        //     chai.request(url)
        //         .delete(`/product/image/temp/dfd`)
        //         .set({ 'x-token': token })
        //         .end(function (err: any, res: any) {
        //             expect(res).to.have.status(404);
        //             expect(res.body.ok).to.equals(false);
        //             done();
        //         });
        // })
    })





    // after((done) => {
    //     mongoose.connect('mongodb://localhost:27017/testiPost', { useUnifiedTopology: true, useNewUrlParser: true, useCreateIndex: true, useFindAndModify: false }, function () {
    //         mongoose.connection.db.dropDatabase(function () {
    //             done()
    //         });
    //     })
    // });
});


