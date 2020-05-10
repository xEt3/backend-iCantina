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
        const privateKey = fs.readFileSync('play.bitcraft.es_privkey.pem', 'utf8');
        const certificate = fs.readFileSync('play.bitcraft.es_cert.pem', 'utf8');
        const ca = fs.readFileSync('/etc/letsencrypt/path/to/chain.pem')
        const httpServer = http.createServer(this.app);
        const credentials = { key: privateKey, cert: certificate ,ca:ca};
        const httpsServer = https.createServer(credentials, this.app);
        httpsServer.listen(this.port,callback());
    }
}