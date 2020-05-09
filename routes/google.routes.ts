import { Router, Request, Response, NextFunction } from "express";
import { verificaToken, verificacionTokenEmployee } from '../middlewares/autenticacion';
import { Product } from '../models/product.model';
import { User } from '../models/user.model';
import { Order } from '../models/order.model';
import { config } from '../config'
const googleRoutes = Router();

googleRoutes.post('/auth', async (req: any, res: Response, next: NextFunction) => {
    const uid = req.body.uid;
    if (req.body.uid && req.body.mail) {
        let user
        try {
            user = await User.findOne({ uid: req.body.uid }).exec();
        } catch (error) {

        }
        if (user) {
            res.redirect(307, '/user/login')
        } else {
            res.redirect(307, '/user/create')
        }
    } else {
        return res.status(400).json({
            ok: false,
            error: 'Bad request'
        })
    }
})


export default googleRoutes;
