"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const file_system_1 = __importDefault(require("../classes/file-system"));
const autenticacion_1 = require("../middlewares/autenticacion");
const product_model_1 = require("../models/product.model");
const user_model_1 = require("../models/user.model");
const productRoutes = express_1.Router();
const fileSystem = new file_system_1.default();
productRoutes.get('/', [autenticacion_1.verificacionTokenEmployee], (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let page = Number(req.query.page - 1) || 0;
        let saltar = page * 10;
        const products = yield product_model_1.Product.find().limit(10).skip(saltar).sort({ _id: -1 }).exec();
        res.json({
            ok: true,
            products
        });
    }
    catch (error) {
        res.status(400).json({
            ok: false,
            error: 'invalid page'
        });
    }
}));
productRoutes.get('/availables/search/:term', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const term = req.params.term;
    try {
        let page = Number(req.query.page - 1) || 0;
        let skip = page * 10;
        const products = yield product_model_1.Product.find({ name: { $regex: term, $options: "i" }, available: true }).limit(10).skip(skip).sort({ _id: -1 }).exec();
        res.json({
            ok: true,
            products
        });
    }
    catch (error) {
        res.status(400).json({
            ok: false,
            error: 'invalid page'
        });
    }
}));
productRoutes.get('/search/:term', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const term = req.params.term;
    try {
        let page = Number(req.query.page - 1) || 0;
        let saltar = page * 10;
        const products = yield product_model_1.Product.find({ name: { $regex: term, $options: "i" } }).limit(10).skip(saltar).sort({ _id: -1 }).exec();
        res.json({
            ok: true,
            products
        });
    }
    catch (error) {
        res.status(400).json({
            ok: false,
            error: 'invalid page'
        });
    }
}));
productRoutes.get('/availables', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let page = Number(req.query.page - 1) || 0;
        let saltar = page * 10;
        const products = yield product_model_1.Product.find({ available: true }).limit(10).skip(saltar).sort({ _id: -1 }).exec();
        res.json({
            ok: true,
            products
        });
    }
    catch (error) {
        res.status(400).json({
            ok: false,
            error: 'invalid page'
        });
    }
}));
productRoutes.post('/', [autenticacion_1.verificacionTokenEmployee], (req, res, next) => {
    const body = req.body;
    body.user = req.user._id;
    const images = fileSystem.moverImgsFormTempToProduct(req.user._id);
    body.imgs = images;
    product_model_1.Product.create(body).then((productDB) => __awaiter(void 0, void 0, void 0, function* () {
        res.json({
            ok: true,
            product: productDB
        });
    })).catch(err => {
        res.status(400).json({
            ok: false,
            err
        });
    });
});
productRoutes.delete('/remove/:idProduct', [autenticacion_1.verificacionTokenEmployee], (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const idProduct = req.params.idProduct;
    let product = null;
    try {
        product = yield product_model_1.Product.findById(idProduct).exec();
    }
    catch (error) {
    }
    if (product) {
        product_model_1.Product.findByIdAndDelete(idProduct).exec().then(productDeleted => {
            if (productDeleted) {
                fileSystem.deleteImagesProduct(req.user._id, productDeleted.imgs);
                return res.json({
                    ok: true,
                    product: productDeleted
                });
            }
        }).catch(err => {
            res.json({
                ok: false,
                err
            });
        });
    }
    else {
        return res.status(404).json({
            ok: false,
            message: 'post not found'
        });
    }
}));
//Subir fichero
productRoutes.post('/upload', [autenticacion_1.verificacionTokenEmployee], (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.files) {
        return res.status(400).json({
            ok: false,
            message: 'Not file selected'
        });
    }
    const file = req.files.image;
    if (!file) {
        return res.status(400).json({
            ok: false,
            message: 'Not file selected'
        });
    }
    //Restriccion solo imagen
    if (!file.mimetype.includes('image')) {
        return res.status(409).json({
            ok: false,
            message: 'file is not a image'
        });
    }
    fileSystem.saveTempImage(file, req.user._id).then((imageName) => __awaiter(void 0, void 0, void 0, function* () {
        const usr = yield user_model_1.User.findById(req.user._id).exec();
        if (!usr || !usr.imgsTemp) {
            return res.status(404).json({
                ok: false,
                message: 'No se obtubo el user'
            });
        }
        usr.imgsTemp.push(imageName);
        yield user_model_1.User.findByIdAndUpdate(usr._id, usr).exec();
        //Control image size with file.size TO-DO
        console.log('Uploaded image from user ' + usr.name + ',image name :' + imageName + ' ,size: ' + file.size);
        return res.json({
            ok: true,
            ImageName: imageName,
            usr
        });
    })).catch(err => {
        return res.status(400).json({
            ok: false,
            message: 'Error save image',
            err
        });
    });
}));
productRoutes.delete('/image/temp/:imageName', [autenticacion_1.verificacionTokenEmployee], (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const imageName = req.params.imageName;
    if (!imageName) {
        return res.status(404).json({
            ok: false,
            message: 'Invalid name'
        });
    }
    const usr = yield user_model_1.User.findById(req.user._id).exec();
    if (!usr || !usr.imgsTemp) {
        return res.status(404).json({
            ok: true,
            message: 'Usuario not found'
        });
    }
    const index = usr.imgsTemp.indexOf(imageName);
    if (index < 0) {
        return res.status(404).json({
            ok: false,
            message: 'Image name is not on user imgsTemp array',
            usr
        });
    }
    if (fileSystem.deleteTempFile(req.user._id, imageName)) {
        usr.imgsTemp.splice(index, 1);
        yield user_model_1.User.findByIdAndUpdate(usr._id, usr).exec();
        res.json({
            ok: true,
            message: `${imageName} deleted`,
            usr
        });
    }
    else {
        res.status(400).json({
            ok: false,
            message: 'Invalid Name'
        });
    }
}));
//Eliminar carpeta temporal
productRoutes.delete('/image/temp', [autenticacion_1.verificacionTokenEmployee], (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const usr = yield user_model_1.User.findById(req.user._id).exec();
    if (!usr) {
        return res.status(404).json({
            ok: false,
            message: 'User not found'
        });
    }
    usr.imgsTemp = [];
    yield user_model_1.User.findByIdAndUpdate(usr._id, usr);
    if (fileSystem.deleteTempFolder(req.user._id)) {
        res.json({
            ok: true,
            usr,
            message: `Deleted ${req.user._id} temp folder`
        });
    }
    else {
        res.status(404).json({
            ok: false,
            message: 'Not found ' + req.user._id + ' user temp folder'
        });
    }
}));
productRoutes.get('/image/:userid/:img', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const userID = req.params.userid;
    const img = req.params.img;
    const user = yield user_model_1.User.findById(userID).exec();
    // if (!user) {
    //     return res.status(400).json({
    //         ok: false,
    //         usuario: user,
    //         message: 'usuario not found'
    //     })
    // }
    const pathImg = fileSystem.getImgUrl(userID, img); // Si no es correcta la imagen devulve imagen por defecto
    return res.sendFile(pathImg);
}));
// actualizar usuario
productRoutes.post('/update/:idProduct', [autenticacion_1.verificacionTokenEmployee], (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let product;
    let idProduct = req.params.idProduct;
    try {
        const productdb = yield product_model_1.Product.findById(idProduct).exec();
        if (!productdb) {
            throw 'err';
        }
        product = {
            name: req.body.name || productdb.name,
            price: req.body.price || productdb.price,
            available: req.body.available
        };
        if (product.available === null) {
            product.available = productdb.available;
        }
    }
    catch (error) {
        return res.status(404).json({
            ok: false,
            message: 'Invalid ID'
        });
    }
    try {
        product_model_1.Product.findByIdAndUpdate(idProduct, product, { new: true }, (err, productDB) => __awaiter(void 0, void 0, void 0, function* () {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }
            ;
            if (!productDB) {
                return res.status(404).json({
                    ok: false,
                    message: 'Invalid ID'
                });
            }
            const product = yield product_model_1.Product.findById(idProduct).exec();
            console.log("Update product ", product);
            res.json({
                ok: true,
                product
            });
        }));
    }
    catch (error) {
        return res.status(404).json({
            ok: false,
            message: 'Invalid type id'
        });
    }
}));
productRoutes.delete('/image/product/:idProduct/:imageName', [autenticacion_1.verificacionTokenEmployee], (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const imageName = req.params.imageName;
    const idProduct = req.params.idProduct;
    if (!imageName) {
        return res.status(404).json({
            ok: false,
            message: 'Invalid name'
        });
    }
    if (!idProduct) {
        return res.status(404).json({
            ok: false,
            message: 'Invalid product'
        });
    }
    const product = yield product_model_1.Product.findById(idProduct).exec();
    if (!product) {
        return res.status(404).json({
            ok: true,
            message: 'Product not found'
        });
    }
    const index = product.imgs.indexOf(imageName);
    if (index < 0) {
        return res.status(404).json({
            ok: false,
            message: 'Image name is not on product imgs array',
            product
        });
    }
    if (fileSystem.deleteImageProduct(req.user._id, imageName)) {
        product.imgs.splice(index, 1);
        yield product_model_1.Product.findByIdAndUpdate(idProduct, product).exec();
        res.json({
            ok: true,
            message: `${imageName} deleted`,
            product
        });
    }
    else {
        res.status(400).json({
            ok: false,
            message: 'Invalid Name'
        });
    }
}));
exports.default = productRoutes;
