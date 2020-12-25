"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const express_fileupload_1 = __importDefault(require("express-fileupload"));
const mongoose_1 = __importDefault(require("mongoose"));
const server_1 = __importDefault(require("./classes/server"));
const config_1 = require("./config");
const google_routes_1 = __importDefault(require("./routes/google.routes"));
const order_routes_1 = __importDefault(require("./routes/order.routes"));
const product_routes_1 = __importDefault(require("./routes/product.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const server = new server_1.default();
// Body parser
server.app.use(body_parser_1.default.urlencoded({ extended: true }));
server.app.use(body_parser_1.default.json());
//FileUpload
server.app.use(express_fileupload_1.default());
// Configurar cors
server.app.use(cors_1.default({ origin: true, credentials: true }));
//Routas de mi app
server.app.use('/user', user_routes_1.default);
server.app.use('/product', product_routes_1.default);
server.app.use('/order', order_routes_1.default);
server.app.use('/google', google_routes_1.default);
//Conectar db
mongoose_1.default.connect(config_1.config.database_url, { useUnifiedTopology: true, useNewUrlParser: true, useCreateIndex: true, useFindAndModify: false }, (err) => {
    if (err) {
        console.error('Error: Cant connect with data base');
    }
    else {
        console.log('DB online');
    }
});
server.start(() => {
    var os = require('os');
    let ifaces = os.networkInterfaces();
    let address = '127.0.0.1';
    Object.keys(ifaces).forEach(function (ifname) {
        let alias = 0;
        ifaces[ifname].forEach(function (iface) {
            if ('IPv4' !== iface.family || iface.internal !== false) {
                // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
                return;
            }
            if (alias >= 1) {
                // this single interface has multiple ipv4 addresses
            }
            else {
                // this interface has only one ipv4 adress
                address = iface.address;
            }
            ++alias;
        });
    });
    console.log(`Server running on ${address}:${server.port}`);
});
