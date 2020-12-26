"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const config_1 = require("../config");
const user_model_1 = require("../models/user.model");
let chai = require('chai');
let chaiHttp = require('chai-http');
const expect = require('chai').expect;
chai.use(chaiHttp);
const url = config_1.config.baseURL;
let users = [];
let token;
describe('UserTest: ', () => {
    before((done) => {
        mongoose_1.default.connect(config_1.config.database_url_local, { useUnifiedTopology: true, useNewUrlParser: true, useCreateIndex: true, useFindAndModify: false }, function () {
            mongoose_1.default.connection.db.dropDatabase(function () {
                for (let i = 0; i < 5; i++) {
                    const user = {
                        name: 'testing' + i,
                        mail: 'testing' + i,
                        uid: i
                    };
                    users.push(user);
                }
                const user = {
                    name: 'Ignacio Belmonte',
                    mail: 'belmonteperona@gmail.com',
                    uid: '113857485189568934662',
                    img: 'https://lh3.googleusercontent.com/a-/AOh14GhO_lwilOXsSx--2I0yvXEgUE9dYZHLqTlRpMcd49Q=s96-c',
                    admin: true,
                    employee: true,
                };
                users.push(user);
                user_model_1.User.create(users).then((usersDB) => {
                    users = usersDB;
                    done();
                });
            });
        });
    });
    describe('Users', () => {
        describe('Add user ', () => {
            it('should insert a user', (done) => {
                chai.request(url)
                    .post('/user/create')
                    .send({ name: 'user1', mail: "user1@mail", uid: '123456' })
                    .end(function (err, res) {
                    expect(res).to.have.status(200);
                    expect(res.ok).to.equals(true);
                    expect(res.token).to.not.equals('');
                    done();
                });
            });
            it('should receive an error, empty mail', (done) => {
                chai.request(url)
                    .post('/user/create')
                    .send({ name: 'user1' })
                    .end(function (err, res) {
                    expect(res).to.have.status(400);
                    expect(res.ok).to.equals(false);
                    done();
                });
            });
            it('should receive  error 400 empty field', (done) => {
                chai.request(url)
                    .post('/user/create')
                    .send({ mail: "user2@mail", name: '123456' })
                    .end(function (err, res) {
                    expect(res).to.have.status(400);
                    expect(res.ok).to.equals(false);
                    done();
                });
            });
            it('should receive  error 400 duplicated id', (done) => {
                chai.request(url)
                    .post('/user/create')
                    .send({ name: 'user1', mail: 'mail', uid: users[0].uid })
                    .end(function (err, res) {
                    expect(res).to.have.status(400);
                    expect(res.ok).to.equals(false);
                    done();
                });
            });
        });
        describe('Get all user', () => {
            it('Should return array with all user', (done) => {
                chai.request(url)
                    .get('/user')
                    .end(function (err, res) {
                    expect(res).to.have.status(200);
                    expect(res.body.ok).to.equals(true);
                    expect(res.body.users.length).to.be.at.least(3);
                    expect(res.body.users.length).to.be.at.most(11);
                    done();
                });
            });
            it('should receive an error, invalid page', (done) => {
                chai.request(url)
                    .get('/user/?page=0')
                    .end(function (err, res) {
                    expect(res).to.have.status(400);
                    expect(res.ok).to.equals(false);
                    done();
                });
            });
        });
        describe('Get user', () => {
            it('Should return a single user', (done) => {
                chai.request(url)
                    .get(`/user/get/${users[0]._id}`)
                    .end(function (err, res) {
                    expect(res).to.have.status(200);
                    expect(res.body.ok).to.equals(true);
                    expect(res.body.user.name).to.equals(users[0].name);
                    done();
                });
            });
            it('should receive an error, invalid id user', (done) => {
                chai.request(url)
                    .get('/user/get/00012')
                    .end(function (err, res) {
                    expect(res).to.have.status(404);
                    expect(res.ok).to.equals(false);
                    done();
                });
            });
        });
        describe('Login', () => {
            it('Shold verificate user and return token', (done) => {
                chai.request(url)
                    .post(`/user/login`)
                    .send({ uid: users[0].uid })
                    .end(function (err, res) {
                    expect(res).to.have.status(200);
                    expect(res.body.ok).to.equals(true);
                    expect(res.body.token).to.not.equals('');
                    done();
                });
            });
            it('Shold return erro 400 uid invalid', (done) => {
                chai.request(url)
                    .post(`/user/login`)
                    .send({ uid: 222 })
                    .end(function (err, res) {
                    expect(res).to.have.status(400);
                    expect(res.body.ok).to.equals(false);
                    done();
                });
            });
            it('Shold return error 400 no parameters', (done) => {
                chai.request(url)
                    .post(`/user/login`)
                    .end(function (err, res) {
                    expect(res).to.have.status(400);
                    expect(res.body.ok).to.equals(false);
                    done();
                });
            });
        });
        describe('Change range User', () => {
            before('Login like admin user to do the operations', (done) => {
                chai.request(url)
                    .post(`/user/login`)
                    .send({ uid: users[5].uid })
                    .end(function (err, res) {
                    token = res.body.token;
                    done();
                });
            });
            it('Should change the user0 to employee', (done) => {
                chai.request(url)
                    .post(`/user/changeRange/${users[0]._id}`)
                    .send({ employee: true })
                    .set({ 'x-token': token })
                    .end(function (err, res) {
                    expect(res).to.have.status(200);
                    expect(res.body.ok).to.equals(true);
                    expect(res.body.user.employee).to.equals(true);
                    done();
                });
            });
            it('Should change the user0 to admin', (done) => {
                chai.request(url)
                    .post(`/user/changeRange/${users[0]._id}`)
                    .send({ admin: true })
                    .set({ 'x-token': token })
                    .end(function (err, res) {
                    expect(res).to.have.status(200);
                    expect(res.body.ok).to.equals(true);
                    expect(res.body.user.admin).to.equals(true);
                    done();
                });
            });
            it('Should return error invalid parameter', (done) => {
                chai.request(url)
                    .post(`/user/changeRange/${users[1]._id}`)
                    .send({ admin: 'nose' })
                    .set({ 'x-token': token })
                    .end(function (err, res) {
                    expect(res).to.have.status(400);
                    expect(res.body.ok).to.equals(false);
                    done();
                });
            });
            it('Should return error empty parameter', (done) => {
                chai.request(url)
                    .post(`/user/changeRange/${users[1]._id}`)
                    .set({ 'x-token': token })
                    .end(function (err, res) {
                    expect(res).to.have.status(400);
                    expect(res.body.ok).to.equals(false);
                    done();
                });
            });
            it('Should change the user1 to employee', (done) => {
                chai.request(url)
                    .post(`/user/changeRange/${users[1]._id}`)
                    .send({ employee: true })
                    .set({ 'x-token': token })
                    .end(function (err, res) {
                    expect(res).to.have.status(200);
                    expect(res.body.ok).to.equals(true);
                    expect(res.body.user.employee).to.equals(true);
                    done();
                });
            });
            it('Should return error user 1 is not admin', (done) => {
                chai.request(url)
                    .post(`/user/login`)
                    .send({ uid: users[4].uid })
                    .end(function (err, res) {
                    let tokenUser1 = res.body.token;
                    chai.request(url)
                        .post(`/user/changeRange/${users[1]._id}`)
                        .send({ employee: true })
                        .set({ 'x-token': tokenUser1 })
                        .end(function (err, res) {
                        expect(res).to.have.status(401);
                        done();
                    });
                });
            });
        });
    });
});
