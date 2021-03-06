import {
  NextFunction,
  Response,
  Router,
} from 'express';

import PushNotification from '../classes/push-notifications';
import {
  verificacionTokenEmployee,
  verificaToken,
} from '../middlewares/autenticacion';
import { Order } from '../models/order.model';
import { Product } from '../models/product.model';
import { User } from '../models/user.model';

const orderRoutes = Router();

orderRoutes.get('/myOrders', [verificaToken], async (req: any, res: Response, next: NextFunction) => {
    try {
        const orders = await Order.find({ client: req.user._id }).sort({ _id: -1 }).populate('products.product').populate('employee').exec();
        return res.json({
            ok: true,
            orders
        })
    } catch (error) {
        return res.status(400).json({
            ok: false,
            error: 'invalid page'
        })
    }
})

orderRoutes.get('/history', [verificacionTokenEmployee], async (req: any, res: Response, next: NextFunction) => {
    try {
        let page = Number(req.query.page - 1) || 0;
        let skip = page * 10;
        const orders = await Order.find().sort({ _id: -1 }).limit(10).skip(skip).populate('products.product').populate('employee').populate('client').populate('employeeMarkReady').exec();
        return res.json({
            ok: true,
            orders
        })
    } catch (error) {
        return res.status(400).json({
            ok: false,
            error: 'invalid page'
        })
    }
})

orderRoutes.get('/unfinished', [verificacionTokenEmployee], async (req: any, res: Response, next: NextFunction) => {
    try {
        const orders = await Order.find({ done: false }).sort({ _id: -1 }).populate('products.product').populate('employee').populate('client').populate('employeeMarkReady').exec();
        return res.json({
            ok: true,
            orders
        })
    } catch (error) {
        return res.status(400).json({
            ok: false,
            error: 'error'
        })
    }
})

orderRoutes.delete('/remove/:idOrder', [verificacionTokenEmployee], async (req: any, res: Response, next: NextFunction) => {
    const idOrder = req.params.idOrder;
    let order = null;
    try {
        order = await Order.findById(idOrder).exec();
    } catch (error) {

    }
    if (order) {
        Order.findByIdAndDelete(idOrder).exec().then(orderDeleted => {
            if (orderDeleted) {
                return res.json({
                    ok: true,
                    order: orderDeleted
                })
            }
        }).catch(err => {
            res.json({
                ok: false,
                err
            });
        });
    } else {
        return res.status(404).json({
            ok: false,
            message: 'Order not found'
        })
    }
});

//Create order
orderRoutes.post('/', [verificaToken], async (req: any, res: Response, next: NextFunction) => {
    const products: [{ product: string, amount: number }] = req.body.products;
    const desc = req.body.desc;
    const client = req.user._id
    let price = 0;
    if (!products) {
        return res.status(400).json({
            ok: false,
            message: 'invalid order, has not products '
        })
    }
    let productsNames='';
    try {
        for (let i = 0; i < products.length; i++) {
            let product = await Product.findById(products[i].product).exec();
            if (!product || products[i].amount <= 0) {
                throw 'error'
            }
            price += product.price * products[i].amount;
            productsNames+=product.name+', '
        }
        if (price === 0) {
            throw 'error'
        }
    } catch (error) {
        return res.status(400).json({
            ok: false,
            message: 'Error while calulated the price'
        })
    }
    const order = {
        products,
        desc,
        client,
        price
    }
    Order.create(order).then(async orderDB => {
        console.log('Create new order from user ' + req.user.mail, orderDB);
        PushNotification.sendNotificationToAllEmployees('Nuevo Pedido!',`${req.user.name} ha pedido ${productsNames.substring(0,productsNames.length-2)}`);
        return res.json({
            ok: true,
            order: orderDB
        })
    }).catch(err => {
        return res.status(400).json({
            ok: false,
            err
        })
    });
})

orderRoutes.post('/markAsDone/:idOrder', [verificacionTokenEmployee], async (req: any, res: Response, next: NextFunction) => {
    const idOrder = req.params.idOrder;
    let order: any;
    try {
        order = await Order.findById(idOrder).exec();
        if (!order) {
            throw 'error'
        }
        order.done = true;
        if (!order.ready) {
            order.ready = true;
            order.employeeMarkReady = req.user._id;
            order.readyDate = new Date();
        }
        order.deliverDate = new Date();
        order.employee = req.user._id;
        Order.findByIdAndUpdate(idOrder, order).exec(async orderDB => {
            const orderNew:any = await Order.findById(idOrder).exec();
            console.log('User ' + req.user.mail + ' mark as done order ', orderNew)
            res.json({
                ok: true,
                order: orderNew
            })
            PushNotification.sendNotificationToUser('Pedido Entregado!','Tu pedido ha sido entregado por '+req.user.name,orderNew.client);
            return;
        })
    } catch (error) {
        return res.status(404).json({
            ok: false,
            message: 'order not found'
        })
    }
});

orderRoutes.post('/markAsReady/:idOrder', [verificacionTokenEmployee], async (req: any, res: Response, next: NextFunction) => {
    const idOrder = req.params.idOrder;
    let order: any;
    try {
        order = await Order.findById(idOrder).exec();
        if (!order) {
            throw 'error'
        }
        order.ready = true;
        order.employeeMarkReady = req.user._id;
        order.readyDate = new Date();
        Order.findByIdAndUpdate(idOrder, order).exec(async orderDB => {
            const orderNew = await Order.findById(idOrder).exec();
            console.log('User ' + req.user.mail + ' mark as ready order ', orderNew);
            res.json({
                ok: true,
                order: orderNew
            })
            PushNotification.sendNotificationToUser('Pedido Listo!','Tu pedido esta listo, puedes pasar a recogerlo en la cantina',order.client);
            return;
        })
    } catch (error) {
        return res.status(404).json({
            ok: false,
            message: 'order not found'
        })
    }
});

orderRoutes.post('/markAsNoReady/:idOrder', [verificacionTokenEmployee], async (req: any, res: Response, next: NextFunction) => {
    const idOrder = req.params.idOrder;
    let order: any;
    try {
        order = await Order.findById(idOrder).exec();
        if (!order) {
            throw 'error'
        }
        order.ready = false;
        order.employeeMarkReady = null;
        order.readyDate = null;

        Order.findByIdAndUpdate(idOrder, order).exec(async orderDB => {

            const orderNew = await Order.findById(idOrder).exec();
            console.log('User ' + req.user.mail + ' mark as no ready order ', orderNew)
            return res.json({
                ok: true,
                order: orderNew
            })
        })
    } catch (error) {
        return res.status(404).json({
            ok: false,
            message: 'order not found'
        })
    }
});

orderRoutes.get('/client/:idClient', [verificacionTokenEmployee], async (req: any, res: Response, next: NextFunction) => {
    const idClient = req.params.idClient;
    let client: any;
    try {
        client = await User.findById(idClient).exec();
        if (!client) {
            return res.status(404).json({
                ok: false,
                message: 'Client not found'
            })
        }
    } catch (error) {
        return res.status(400).json({
            ok: false,
            message: 'invalid id client'
        })
    }
    try {
        let page = Number(req.query.page - 1) || 0;
        let skip = page * 10;
        const orders = await Order.find({ client: idClient }).limit(10).skip(skip).sort({ _id: -1 }).populate('products.product').populate('employee').populate('client').populate('employeeMarkReady').exec();
        return res.json({
            ok: true,
            orders
        })
    } catch (error) {
        return res.status(400).json({
            ok: false,
            error: 'invalid page'
        })
    }
})

orderRoutes.get('/employee/:idEmployee', [verificacionTokenEmployee], async (req: any, res: Response, next: NextFunction) => {
    const idEmployee = req.params.idEmployee;
    let employee: any;
    try {
        employee = await User.findById(idEmployee).exec();
        if (!employee) {
            return res.status(404).json({
                ok: false,
                message: 'Employee not found'
            })
        }
    } catch (error) {
        return res.status(400).json({
            ok: false,
            message: 'invalid id client'
        })
    }
    try {
        let page = Number(req.query.page - 1) || 0;
        let skip = page * 10;
        const orders = await Order.find({ employee: idEmployee }).limit(10).skip(skip).sort({ _id: -1 }).exec();
        return res.json({
            ok: true,
            orders
        })
    } catch (error) {
        return res.status(400).json({
            ok: false,
            error: 'invalid page'
        })
    }
})

export default orderRoutes;
