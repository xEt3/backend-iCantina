import { Router, Request, Response, NextFunction } from "express";
import { verificacionTokenEmployee } from '../middlewares/autenticacion';
import { Product } from '../models/product.model';
import FileSystem from '../classes/file-system';
import { FileUpload } from '../interfaces/file-upload';
import { User } from '../models/user.model';


const productRoutes = Router();
const fileSystem = new FileSystem();

productRoutes.get('/', [verificacionTokenEmployee], async (req: any, res: Response, next: NextFunction) => {
    try {
        let page = Number(req.query.page - 1) || 0;
        let saltar = page * 10;
        const products = await Product.find().limit(10).skip(saltar).sort({ _id: -1 }).exec();
        res.json({
            ok: true,
            products
        })
    } catch (error) {
        res.status(400).json({
            ok: false,
            error: 'invalid page'
        })
    }
})

productRoutes.get('/availables/search/:term', async (req: any, res: Response, next: NextFunction) => {
    const term = req.params.term;
    try {
        let page = Number(req.query.page - 1) || 0;
        let skip = page * 10;
        const products = await Product.find({ name: { $regex: term, $options: "i" }, available: true }).limit(10).skip(skip).sort({ _id: -1 }).exec();
        res.json({
            ok: true,
            products
        })
    } catch (error) {
        res.status(400).json({
            ok: false,
            error: 'invalid page'
        })
    }
})

productRoutes.get('/search/:term', async (req: any, res: Response, next: NextFunction) => {
    const term = req.params.term;
    try {
        let page = Number(req.query.page - 1) || 0;
        let saltar = page * 10;
        const products = await Product.find({ name: { $regex: term, $options: "i" } }).limit(10).skip(saltar).sort({ _id: -1 }).exec();
        res.json({
            ok: true,
            products
        })
    } catch (error) {
        res.status(400).json({
            ok: false,
            error: 'invalid page'
        })
    }
})

productRoutes.get('/availables', async (req: any, res: Response, next: NextFunction) => {
    try {
        let page = Number(req.query.page - 1) || 0;
        let saltar = page * 10;
        const products = await Product.find({ available: true }).limit(10).skip(saltar).sort({ _id: -1 }).exec();
        res.json({
            ok: true,
            products
        })
    } catch (error) {
        res.status(400).json({
            ok: false,
            error: 'invalid page'
        })
    }
})

productRoutes.post('/', [verificacionTokenEmployee], (req: any, res: Response, next: NextFunction) => {
    const body = req.body;
    body.user = req.user._id
    const images = fileSystem.moverImgsFormTempToProduct(req.user._id);
    body.imgs = images;
    Product.create(body).then(async productDB => {
        res.json({
            ok: true,
            product: productDB
        })
    }).catch(err => {
        res.status(400).json({
            ok: false,
            err
        })
    });
})


productRoutes.delete('/remove/:idProduct', [verificacionTokenEmployee], async (req: any, res: Response, next: NextFunction) => {
    const idProduct = req.params.idProduct;
    let product = null;
    try {
        product = await Product.findById(idProduct).exec();
    } catch (error) {

    }
    if (product) {
        Product.findByIdAndDelete(idProduct).exec().then(productDeleted => {
            if (productDeleted) {
                fileSystem.deleteImagesProduct(req.user._id, productDeleted.imgs)
                return res.json({
                    ok: true,
                    product: productDeleted
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
            message: 'post not found'
        })
    }
});

//Subir fichero
productRoutes.post('/upload', [verificacionTokenEmployee], async (req: any, res: Response, next: NextFunction) => {
    if (!req.files) {
        return res.status(400).json({
            ok: false,
            message: 'Not file selected'
        });
    }
    const file: FileUpload = req.files.image
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
    fileSystem.saveTempImage(file, req.user._id).then(async (imageName: string) => {
        const usr = await User.findById(req.user._id).exec();
        if (!usr) {
            return res.status(404).json({
                ok: false,
                message: 'No se obtubo el user'
            })
        }
        usr.imgsTemp.push(imageName);
        await User.findByIdAndUpdate(usr._id, usr).exec();
        //Control image size with file.size TO-DO
        console.log('Uploaded image from user ' + usr.name + ',image name :' + imageName + ' ,size: ' + file.size);

        return res.json({
            ok: true,
            ImageName: imageName,
            usr
        })
    }).catch(err => {
        return res.status(400).json({
            ok: false,
            message: 'Error save image',
            err
        });
    });
});

productRoutes.delete('/image/temp/:imageName', [verificacionTokenEmployee], async (req: any, res: Response, next: NextFunction) => {
    const imageName = req.params.imageName;
    if (!imageName) {
        return res.status(404).json({
            ok: false,
            message: 'Invalid name'
        })
    }
    const usr = await User.findById(req.user._id).exec();
    if (!usr) {
        return res.status(404).json({
            ok: true,
            message: 'Usuario not found'
        })
    }
    const index = usr.imgsTemp.indexOf(imageName);
    if (index < 0) {
        return res.status(404).json({
            ok: false,
            message: 'Image name is not on user imgsTemp array',
            usr
        })
    }
    if (fileSystem.deleteTempFile(req.user._id, imageName)) {
        usr.imgsTemp.splice(index, 1);
        await User.findByIdAndUpdate(usr._id, usr).exec();
        res.json({
            ok: true,
            message: `${imageName} deleted`,
            usr
        })
    } else {
        res.status(400).json({
            ok: false,
            message: 'Invalid Name'
        })
    }
});

//Eliminar carpeta temporal
productRoutes.delete('/image/temp', [verificacionTokenEmployee], async (req: any, res: Response, next: NextFunction) => {
    const usr = await User.findById(req.user._id).exec();
    if (!usr) {
        return res.status(404).json({
            ok: false,
            message: 'User not found'
        })
    }
    usr.imgsTemp = [];
    await User.findByIdAndUpdate(usr._id, usr);
    if (fileSystem.deleteTempFolder(req.user._id)) {
        res.json({
            ok: true,
            usr,
            message: `Deleted ${req.user._id} temp folder`
        })
    } else {
        res.status(404).json({
            ok: false,
            message: 'Not found ' + req.user._id + ' user temp folder'
        })
    }
});


productRoutes.get('/image/:userid/:img', async (req: any, res: Response, next: NextFunction) => {
    const userID = req.params.userid;
    const img = req.params.img;
    const user = await User.findById(userID).exec()
    // if (!user) {
    //     return res.status(400).json({
    //         ok: false,
    //         usuario: user,
    //         message: 'usuario not found'
    //     })
    // }
    const pathImg = fileSystem.getImgUrl(userID, img)  // Si no es correcta la imagen devulve imagen por defecto
    return res.sendFile(pathImg)
});

// actualizar usuario
productRoutes.post('/update/:idProduct', [verificacionTokenEmployee], async (req: any, res: Response) => {
    let product: any;
    let idProduct = req.params.idProduct;
    try {
        const productdb = await Product.findById(idProduct).exec();
        if (!productdb) {
            throw 'err';
        }
        product = {
            name: req.body.name || productdb.name,
            price: req.body.price || productdb.price,
            available: req.body.available
        }
        if (product.available === null) {
            product.available = productdb.available
        }

    } catch (error) {
        return res.status(404).json({
            ok: false,
            message: 'Invalid ID'
        });
    }
    try {
        Product.findByIdAndUpdate(idProduct, product, { new: true }, async (err, productDB) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                })
            };
            if (!productDB) {
                return res.status(404).json({
                    ok: false,
                    message: 'Invalid ID'
                });
            }
            const product = await Product.findById(idProduct).exec();
            console.log("Update product ", product)
            res.json({
                ok: true,
                product
            });
        });
    } catch (error) {
        return res.status(404).json({
            ok: false,
            message: 'Invalid type id'
        });
    }
});
productRoutes.delete('/image/product/:idProduct/:imageName', [verificacionTokenEmployee], async (req: any, res: Response, next: NextFunction) => {
    const imageName = req.params.imageName;
    const idProduct = req.params.idProduct;
    if (!imageName) {
        return res.status(404).json({
            ok: false,
            message: 'Invalid name'
        })
    }
    if (!idProduct) {
        return res.status(404).json({
            ok: false,
            message: 'Invalid product'
        })
    }
    const product = await Product.findById(idProduct).exec();
    if (!product) {
        return res.status(404).json({
            ok: true,
            message: 'Product not found'
        })
    }
    const index = product.imgs.indexOf(imageName);
    if (index < 0) {
        return res.status(404).json({
            ok: false,
            message: 'Image name is not on product imgs array',
            product
        })
    }
    if (fileSystem.deleteImageProduct(req.user._id, imageName)) {
        product.imgs.splice(index, 1);
        await Product.findByIdAndUpdate(idProduct, product).exec();
        res.json({
            ok: true,
            message: `${imageName} deleted`,
            product
        })
    } else {
        res.status(400).json({
            ok: false,
            message: 'Invalid Name'
        })
    }
});




export default productRoutes;

