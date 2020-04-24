import { FileUpload } from '../interfaces/file-upload';
import path from 'path';
import fs from 'fs';
import uniqid from 'uniqid';
import { Usuario } from '../models/user.model';

export default class FileSystem {

    constructor() { }

    moverImgsEnTempToPost(userID: string) {
        const pathTmp = path.resolve(__dirname, '../uploads', userID, 'temp');
        const pathPost = path.resolve(__dirname, '../uploads', userID, 'post');
        if (!fs.existsSync(pathTmp)) {
            return [];
        }
        if (!fs.existsSync(pathPost)) {
            fs.mkdirSync(pathPost);
        }
        const imagenesTemp = this.obtenerImagenesEnTemp(userID);
        imagenesTemp.forEach(imagen => {
            fs.renameSync(`${pathTmp}/${imagen}`, `${pathPost}/${imagen}`);
        })
        return imagenesTemp;
    }

    private obtenerImagenesEnTemp(userID: string) {
        const pathTmp = path.resolve(__dirname, '../uploads', userID, 'temp');
        return fs.readdirSync(pathTmp) || [];

    }

    eliminarImagenesPost(idUsuario:string,imgs:string[]){
        imgs.forEach(img=>{
            const pathFile = path.resolve(__dirname, `../uploads/${idUsuario}/post`, img);
            this.eliminarFichero(pathFile);
        })
    }

    eliminarFicheroTemp(idUsuario: string, nombreFichero: string) {
        const pathFile = path.resolve(__dirname, `../uploads/${idUsuario}/temp`, nombreFichero);
        return this.eliminarCarpeta(pathFile);
    }

    eliminarCarpetaTemp(idUsuario: string) {
        const pathFile = path.resolve(__dirname, `../uploads/${idUsuario}/temp`);
        return this.eliminarFichero(pathFile);
    }

    private eliminarFichero(path: string): boolean {
        if (fs.existsSync(path)) {
            fs.rmdirSync(path, { recursive: true });
            return true;
        } else {
            return false;
        }
    }

    private eliminarCarpeta(path:string):boolean{
        if (fs.existsSync(path)) {
            fs.unlinkSync(path);
            return true;
        } else {
            return false;
        }
    }

    guardarImagenTemporal(file: FileUpload, userID: string) {
        return new Promise<string>((resolve, reject) => {
            const pathTmp = this.crearCarpetaUsuario(userID);
            const nombreArchivo = this.generarNombreArchivo(file.name);
            file.mv(`${pathTmp}/${nombreArchivo}`, (err: any) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(nombreArchivo);
                }
            })
        })
    }

    private crearCarpetaUsuario(userID: string) {
        const pathUser = path.resolve(__dirname, '../uploads', userID);
        const pathUserTemporal = pathUser + '/temp';
        const existeCarpetaUser = fs.existsSync(pathUser);
        const existeCarpetaTemporal = fs.existsSync(pathUserTemporal);
        if (!existeCarpetaUser) {
            fs.mkdirSync(pathUser);
        }
        if (!existeCarpetaTemporal) {
            fs.mkdirSync(pathUserTemporal);
        }
        return pathUserTemporal;
    }

    private generarNombreArchivo(nombreFichero: string) {
        const nombreArr = nombreFichero.split('.');
        const extension = nombreArr[nombreArr.length - 1];
        const idUnico = uniqid();
        return `${idUnico}.${extension}`
    }

    getImgUrl(userId: string, img: string) {
        const pathFoto = path.resolve(__dirname, '../uploads', userId, 'post', img);
        if (fs.existsSync(pathFoto)) {
            return pathFoto;
        } else {
            return path.resolve(__dirname, '../assets/defaultImagen.jpg');
        }
    }
}