"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const config_1 = require("../config");
var fs = require('fs');
class Server {
    constructor() {
        this.port = config_1.config.port;
        this.app = express_1.default();
    }
    start(callback) {
        const privateKey = fs.readFileSync('privkey.pem', 'utf8');
        const certificate = fs.readFileSync('cert.pem', 'utf8');
        const ca = fs.readFileSync('chain.pem', 'utf8');
        const credentials = {
            key: privateKey,
            cert: certificate,
            ca: ca
        };
        if (config_1.config.isHttps) {
            var webProtocol = require('https');
        }
        else {
            var webProtocol = require('http');
        }
        const webServer = webProtocol.createServer(credentials, this.app);
        webServer.listen(this.port, callback());
    }
}
exports.default = Server;
