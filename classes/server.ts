import express from 'express';

import { config } from '../config';

var fs = require('fs');


export default class Server {

    public app: express.Application;
    public port: number =config.port;

    constructor() {
        this.app = express();
    }

    start(callback: Function) {
        const privateKey = fs.readFileSync('privkey.pem', 'utf8');
        const certificate = fs.readFileSync('cert.pem', 'utf8');
        const ca = fs.readFileSync('chain.pem', 'utf8');
        const credentials = {
            key: privateKey,
            cert: certificate,
            ca: ca
        };
        if(config.isHttps){
            var webProtocol = require('https');
        }else{
            var webProtocol = require('http');
        }
        const webServer = webProtocol.createServer(credentials, this.app);
         webServer.listen(this.port,callback());
    }
}