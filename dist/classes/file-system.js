"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const uniqid_1 = __importDefault(require("uniqid"));
class FileSystem {
    constructor() { }
    moverImgsFormTempToProduct(userID) {
        const pathTmp = path_1.default.resolve(__dirname, '../uploads', userID, 'temp');
        const pathProduct = path_1.default.resolve(__dirname, '../uploads', userID, 'product');
        if (!fs_1.default.existsSync(pathTmp)) {
            return [];
        }
        if (!fs_1.default.existsSync(pathProduct)) {
            fs_1.default.mkdirSync(pathProduct);
        }
        const imagenesTemp = this.obtenerImagenesEnTemp(userID);
        imagenesTemp.forEach(imagen => {
            fs_1.default.renameSync(`${pathTmp}/${imagen}`, `${pathProduct}/${imagen}`);
        });
        return imagenesTemp;
    }
    obtenerImagenesEnTemp(userID) {
        const pathTmp = path_1.default.resolve(__dirname, '../uploads', userID, 'temp');
        return fs_1.default.readdirSync(pathTmp) || [];
    }
    deleteImagesProduct(idUsuario, imgs) {
        imgs.forEach(img => {
            const pathFile = path_1.default.resolve(__dirname, `../uploads/${idUsuario}/product`, img);
            this.deleteFile(pathFile);
        });
    }
    deleteImageProduct(idUser, img) {
        const pathFile = path_1.default.resolve(__dirname, `../uploads/${idUser}/product`, img);
        return this.deleteFile(pathFile);
    }
    deleteTempFile(idUser, fileName) {
        const pathFile = path_1.default.resolve(__dirname, `../uploads/${idUser}/temp`, fileName);
        return this.deleteFolder(pathFile);
    }
    deleteTempFolder(idUsuario) {
        const pathFile = path_1.default.resolve(__dirname, `../uploads/${idUsuario}/temp`);
        return this.deleteFile(pathFile);
    }
    deleteFile(path) {
        if (fs_1.default.existsSync(path)) {
            fs_1.default.rmSync(path, { recursive: true });
            return true;
        }
        else {
            return false;
        }
    }
    deleteFolder(path) {
        if (fs_1.default.existsSync(path)) {
            fs_1.default.unlinkSync(path);
            return true;
        }
        else {
            return false;
        }
    }
    saveTempImage(file, userID) {
        return new Promise((resolve, reject) => {
            const pathTmp = this.createUserFolder(userID);
            const fileName = this.createFileName(file.name);
            file.mv(`${pathTmp}/${fileName}`, (err) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(fileName);
                }
            });
        });
    }
    createUserFolder(userID) {
        const pathUser = path_1.default.resolve(__dirname, '../uploads', userID);
        const pathUserTemp = pathUser + '/temp';
        const existUserFolder = fs_1.default.existsSync(pathUser);
        const existTempFolder = fs_1.default.existsSync(pathUserTemp);
        if (!existUserFolder) {
            fs_1.default.mkdirSync(pathUser);
        }
        if (!existTempFolder) {
            fs_1.default.mkdirSync(pathUserTemp);
        }
        return pathUserTemp;
    }
    createFileName(fileName) {
        const nameArr = fileName.split('.');
        const extension = nameArr[nameArr.length - 1];
        const idUniq = uniqid_1.default();
        return `${idUniq}.${extension}`;
    }
    getImgUrl(userId, img) {
        const pathPhoto = path_1.default.resolve(__dirname, '../uploads', userId, 'product', img);
        if (fs_1.default.existsSync(pathPhoto)) {
            return pathPhoto;
        }
        else {
            return path_1.default.resolve(__dirname, '../assets/defaultImagen.jpg');
        }
    }
}
exports.default = FileSystem;
