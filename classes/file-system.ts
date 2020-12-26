import fs from 'fs';
import path from 'path';
import uniqid from 'uniqid';

import { FileUpload } from '../interfaces/file-upload';

export default class FileSystem {

    constructor() {}

    moverImgsFormTempToProduct(userID: string) {
        const pathTmp = path.resolve(__dirname, '../uploads', userID, 'temp');
        const pathProduct = path.resolve(__dirname, '../uploads', userID, 'product');
        if (!fs.existsSync(pathTmp)) {
            return [];
        }
        if (!fs.existsSync(pathProduct)) {
            fs.mkdirSync(pathProduct);
        }
        const imagenesTemp = this.obtenerImagenesEnTemp(userID);
        imagenesTemp.forEach(imagen => {
            fs.renameSync(`${pathTmp}/${imagen}`, `${pathProduct}/${imagen}`);
        })
        return imagenesTemp;
    }

    private obtenerImagenesEnTemp(userID: string) {
        const pathTmp = path.resolve(__dirname, '../uploads', userID, 'temp');
        return fs.readdirSync(pathTmp) || [];

    }

    deleteImagesProduct(idUsuario: string, imgs: string[]) {
        imgs.forEach(img => {
            const pathFile = path.resolve(__dirname, `../uploads/${idUsuario}/product`, img);
            this.deleteFile(pathFile);
        })
    }

    deleteImageProduct(idUser: string, img: string) {
        const pathFile = path.resolve(__dirname, `../uploads/${idUser}/product`, img);
        return this.deleteFile(pathFile);
    }

    deleteTempFile(idUser: string, fileName: string) {
        const pathFile = path.resolve(__dirname, `../uploads/${idUser}/temp`, fileName);
        return this.deleteFolder(pathFile);
    }

    deleteTempFolder(idUsuario: string) {
        const pathFile = path.resolve(__dirname, `../uploads/${idUsuario}/temp`);
        return this.deleteFile(pathFile);
    }

    private deleteFile(path: string): boolean {
        if (fs.existsSync(path)) {
            fs.rmSync(path, { recursive: true });
            return true;
        } else {
            return false;
        }
    }

    private deleteFolder(path: string): boolean {
        if (fs.existsSync(path)) {
            fs.unlinkSync(path);
            return true;
        } else {
            return false;
        }
    }

    saveTempImage(file: FileUpload, userID: string) {
        return new Promise<string>((resolve, reject) => {
            const pathTmp = this.createUserFolder(userID);
            const fileName = this.createFileName(file.name);
            file.mv(`${pathTmp}/${fileName}`, (err: any) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(fileName);
                }
            })
        })
    }

    private createUserFolder(userID: string) {
        const pathUser = path.resolve(__dirname, '../uploads', userID);
        const pathUserTemp = pathUser + '/temp';
        const existUserFolder = fs.existsSync(pathUser);
        const existTempFolder = fs.existsSync(pathUserTemp);
        if (!existUserFolder) {
            fs.mkdirSync(pathUser);
        }
        if (!existTempFolder) {
            fs.mkdirSync(pathUserTemp);
        }
        return pathUserTemp;
    }

    private createFileName(fileName: string) {
        const nameArr = fileName.split('.');
        const extension = nameArr[nameArr.length - 1];
        const idUniq = uniqid();
        return `${idUniq}.${extension}`
    }

    getImgUrl(userId: string, img: string) {
        const pathPhoto = path.resolve(__dirname, '../uploads', userId, 'product', img);
        if (fs.existsSync(pathPhoto)) {
            return pathPhoto;
        } else {
            return path.resolve(__dirname, '../assets/defaultImagen.jpg');
        }
    }
}