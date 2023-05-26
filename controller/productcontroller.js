const express = require('express');
const authMiddleware = require('../middlewares/auth');
const { Op } = require('sequelize');
const fs = require("fs");
const { User, Product } = require('../models/user');
User.hasMany(Product);
Product.belongsTo(User);
const router = express.Router();


router.post('/productreg', authMiddleware, async (req, res) => {
    const { name, price, state, category } = req.body;
    try {
        const user = await User.findByPk(req.userId);
        const product = await user.createProduct({
            name: name,
            price: price,
            state: state,
            category: category,
        });
        return res.send({
            product
        });
    } catch (err) {
        console.log(err);
        return res.status(400).send({ error: 'Registration failed' });
    }
});

router.get('/add/userproduct', authMiddleware, async (req, res) => {
    try {
        const user = await User.findOne({
            where: {
                id: req.user.id
            },
            include: [Product]
        });

        const products = user.Products.map(product => {
            const productObj = product.toJSON();
            productObj.picPath = product.picPath;
            return productObj;
        });

        res.status(200).json({ products });
    } catch (err) {
        console.log(err);
        res.status(500).send('Internal server error');
    }
});

router.post('/remove', authMiddleware, async (req, res) => {
    try {
        const user = await User.findByPk(req.userId);
        console.log(req.body.productId);
        const product = await Product.findByPk(req.body.productId);
        if (product && product.UserId === user.id) {
            await product.destroy();
            return res.send({ Sucess: 'Product removed sucess' });
        } else {
            return res.status(404).send({ error: 'product not found' });
        }

    } catch (err) {
        console.log(err);
        return res.status(400).send({ error: 'Failed to remove the productt' });
    }
});

router.get('/getproduct/:id', authMiddleware, async (req, res) => {

    try {
        const id = req.params.id;
        console.log(id);
        const user = await User.findByPk(req.userId);
        const product = await Product.findOne({
            where: { id: id, UserId: user.id }
        });
        if (product) {
            return res.send({ product });
        } else {
            return res.status(404).send({ error: 'Product not found' });
        }
    } catch (err) {
        console.log(err);
        return res.status(400).send({ error: 'Failed to retrieve user products' });
    }
});

router.get('/getproduct', async (req, res) => {
    const { selectProduct, selectPrice, selectState } = req.query;
    console.log(selectProduct, selectPrice, selectState);
    try {
        const products = await Product.findAll({
            where: {
                category: { [Op.like]: '%' + selectProduct + '%' },
                price: { [Op.lte]: selectPrice },
                state: selectState,
            },
            include: { model: User, attributes: ['name'] },
        });
        const productsWithImages = await Promise.all(products.map(async (product) => {
            const mimeType = 'image/jpg';
            let dataUri = '';
            if (product.pic !== null) {
                const imageBuffer = product.pic;
                const imageBase64 = imageBuffer.toString('base64');
                dataUri = `data:${mimeType};base64,${imageBase64}`;
              }
            return {
                ...product.toJSON(),
                image: dataUri
            };
        }));

        return res.send({ products: productsWithImages });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to retrieve products' });
    }
});

const multer = require("multer");
const upload = multer({ dest: "uploads/" });


router.patch('/product/:id', authMiddleware, upload.single("image"), async (req, res) => {
    try {
        const image = req.file.buffer;
        const productId = req.params.id;
        console.log(req.params.id);
        const user = await User.findByPk(req.userId);
        const product = await Product.findByPk(productId);

        if (!product) {
            return res.status(404).send({ error: 'Product not found' });
        }

        if (product && product.UserId === user.id) {
            const { name, price, state } = req.body;
            await product.update({
                name: name || product.name,
                price: price || product.price,
                state: state || product.state
            });
        }

        if (image) {
            const imagePath = image.path;
            const imageBuffer = fs.readFileSync(imagePath);
            product.pic = imageBuffer;
            await product.save();
            console.log("Image saved in the database");
        } else {
            console.log("No image found");
        }
        return res.send({ product });
    } catch (err) {
        console.log(err);
        return res.status(400).send({ error: 'Failed to update the product' });
    }
});

module.exports = app => app.use('/add', router);