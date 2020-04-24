
import jwt from 'jsonwebtoken';
export class Token {

    private static seed: string = 'seed-secretisimo';
    private static caducidad: string = '30d';

    constructor() { }

    static getJwtToken(payload: any): string {
        return jwt.sign({
            user: payload
        }, this.seed, { expiresIn: this.caducidad })
    }

    static comprobarToken(token: string) {
        return new Promise((resolve, reject) => {
            jwt.verify(token, this.seed, (err, decoded) => {
                if (err) {
                    reject();
                } else {
                    resolve(decoded);
                }
            })
        })

    }

}