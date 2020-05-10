import express from 'express';
var fs = require('fs');
var http = require('http');
var https = require('https');


export default class Server {

    public app: express.Application;
    public port: number = 3000;


    constructor() {
        this.app = express();
    }

    start(callback: Function) {
        const privateKey = fs.readFileSync('play.bitcraft.es_privkey.pem');
        const certificate = fs.readFileSync('play.bitcraft.es_cert.pem');
        const ca = fs.readFileSync('chain.pem')
        const httpServer = http.createServer(this.app);
        const credentials = { key: privateKey, cert: certificate ,ca:ca};
        const httpsServer = https.createServer(credentials, this.app);
        httpsServer.listen(this.port,callback());
    }
}