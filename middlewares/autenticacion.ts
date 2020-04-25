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

export const verificacionTokenEmployee = (req: any, res: Response, next: NextFunction) => {
    const token = req.get('x-token');
    Token.comprobarToken(token).then((decode: any) => {
        if (decode.user.employee) {
            req.user = decode.user
            next();
        } else {
            res.status(401).json({
                ok: false,
                mensaje: 'Error, you are not employee'
            })
        }
    }).catch(err => {
        res.status(401).json({
            ok: false,
            mensaje: 'Error token'
        })
    })
}

export const verificacionTokenAdmin = (req: any, res: Response, next: NextFunction) => {
    const token = req.get('x-token');
    Token.comprobarToken(token).then((decode: any) => {
        if (decode.user.admin) {
            req.user = decode.user
            next();
        } else {
            res.status(401).json({
                ok: false,
                mensaje: 'Error, you are not admin'
            })
        }
    }).catch(err => {
        res.status(401).json({
            ok: false,
            mensaje: 'Error token'
        })
    })
}