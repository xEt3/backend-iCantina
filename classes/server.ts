import express from 'express';
var fs = require('fs');
var http = require('http');
var https = require('https');


export default class Server {

    public app: express.Application;
    public port: number = 3000;
    privateKey = fs.readFileSync('key.pem', 'utf8');
    certificate = fs.readFileSync('cert.pem', 'utf8');
    credentials = { key: this.privateKey, cert: this.certificate };

    constructor() {
        this.app = express();


    }

    start(callback: Function) {
        const httpServer = http.createServer(this.app);
        const credentials = { key: this.privateKey, cert: this.certificate };
        const httpsServer = https.createServer(credentials, this.app);
        httpsServer.listen(this.port,callback());
        
    }
}