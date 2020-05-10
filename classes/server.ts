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
        const privateKey = fs.readFileSync('privkey.pem', 'utf8');
        const certificate = fs.readFileSync('cert.pem', 'utf8');
        const ca = fs.readFileSync('chain.pem', 'utf8');

        const credentials = {
            key: privateKey,
            cert: certificate,
            ca: ca
        };
        // const privateKey = fs.readFileSync('play.bitcraft.es_privkey.pem');
        // const certificate = fs.readFileSync('play.bitcraft.es_cert.pem');
        // const ca = fs.readFileSync('chain.pem')
        // const httpServer = http.createServer(this.app);
        // const credentials = { key: privateKey, cert: certificate ,ca:ca};
        const httpsServer = https.createServer(credentials, this.app);
        // httpsServer.listen(this.port,callback());

        httpsServer.listen(443, () => {
            console.log('HTTPS Server running on port 443');
        });
    }
}