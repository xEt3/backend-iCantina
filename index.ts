import bodyParser from 'body-parser';
import cors from 'cors';
import fileUpload from 'express-fileupload';
import mongoose from 'mongoose';

import Server from './classes/server';
import { config } from './config';
import googleRoutes from './routes/google.routes';
import orderRoutes from './routes/order.routes';
import productRoutes from './routes/product.routes';
import userRoutes from './routes/user.routes';

const server = new Server();


// Body parser
server.app.use(bodyParser.urlencoded({ extended: true }));
server.app.use(bodyParser.json());

//FileUpload
server.app.use(fileUpload());
// Configurar cors
server.app.use(cors({ origin: true, credentials: true }))

//Routas de mi app
server.app.use('/user', userRoutes);
server.app.use('/product', productRoutes);
server.app.use('/order', orderRoutes);
server.app.use('/google', googleRoutes);

//Conectar db
mongoose.connect(config.database_url,
    { useUnifiedTopology: true, useNewUrlParser: true, useCreateIndex: true, useFindAndModify: false }, (err) => {
        if (err) {
            console.error('Error: Cant connect with data base');
        } else {
            console.log('DB online')
        }
    });


server.start(() => {
    var os = require('os');
    let ifaces: any = os.networkInterfaces();
    let address: any='127.0.0.1';

    Object.keys(ifaces).forEach(function (ifname) {
        let alias = 0;
        ifaces[ifname].forEach(function (iface:any) {
            if ('IPv4' !== iface.family || iface.internal !== false) {
                // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
                return;
            }

            if (alias >= 1) {
                // this single interface has multiple ipv4 addresses
            } else {
                // this interface has only one ipv4 adress
                address=iface.address
            }
            ++alias;
        });

    });
    console.log(`Server running on ${address}:${server.port}`);

});

