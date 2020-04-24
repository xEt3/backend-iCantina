import { Request, Response, NextFunction } from 'express'
import { Token } from '../classes/token';

export const verificaToken = (req: any, res: Response, next: NextFunction) => {
    const token = req.get('x-token');
    Token.comprobarToken(token).then((decode: any) => {
        // console.log('Verificacion Token',decode)
        req.user = decode.user
        next();
    }).catch(err => {
        res.status(401).json({
            ok: false,
            mensaje: 'Error token verification'
        })
    })
}