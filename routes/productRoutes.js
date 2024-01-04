const express = require('express');
const Product = require('../models/Product');
const { userIsAdmin } = require('../middleware/route_guards');
const passport = require('passport');
const genders = require('../config/genders');
const { createNextUrl, createPreviousUrl, paginationQuery, createBaseUrl, parseLimit, parseOffset } = require('../helpers/pagination');
const { validateGender } = require('../helpers/input_validation');
const sizes = require('../config/sizes');
const ChangeLog = require('../models/ChangeLog');
const router = express.Router();

router.get('/', async (req, res) => {
    let {color, brand, limit, gender, offset, size, minPrice, maxPrice} = req.query;
    try
    {
        limit = parseLimit(limit);
        offset = parseOffset(offset);
        const query = {};
        if (color) query.color = color;
        if (brand) query.brand = brand;
        if (gender) query.gender = gender;
        if (size) query['quantities.' + size] = {$gt: 0};
        if (minPrice && maxPrice) query.$and = [
            {price: {$gte: minPrice}},
            {price: {$lte: maxPrice}}
        ];
        else if (minPrice) query.price = {$gte: minPrice};
        else if (maxPrice) query.price = {$lte: maxPrice};
        const [products, count] = await paginationQuery(
            Product,
            query,
            offset,
            limit,
            {
                _id: true,
                image_url: true,
                name: true,
                price: true
            }
        );
        const full_url = createBaseUrl(req, '/api/products');
        req.query.limit = limit;
        res.status(200).json({
            products,
            next: createNextUrl(full_url, req.query, offset, limit, count),
            previous: createPreviousUrl(full_url, req.query, offset, limit, count)
        });
    }
    catch(err)
    {
        console.log(err);
        res.status(500).json({message: err.message});
    }
});

router.get('/search/:match', async (req, res) => {
    const {match} = req.params;
    let {gender, limit, offset} = req.query;
    try
    {
        gender = gender && gender.toUpperCase();
        if (!validateGender(gender))
        {
            req.query.gender = genders.MEN;
            gender = genders.MEN;
        }
        limit = parseLimit(limit);
        offset = parseOffset(offset);
        const regex = new RegExp(match);
        const query_obj = {
            gender: gender,
            $or: [
                { color: { $regex: regex, $options: 'is' } },
                { brand: { $regex: regex, $options: 'is' } },
                { name: { $regex: regex, $options: 'is' } },
                { description: { $regex: regex, $options: 'is' } }
            ]
        };
        const [products, count] = await paginationQuery(
            Product,
            query_obj,
            offset,
            limit,
            {
                _id: true,
                image_url: true,
                name: true,
                price: true
            }
        );
        const full_url = createBaseUrl(req, '/api/products' + req.path);
        res.status(200).json({
            products,
            gender,
            next: createNextUrl(full_url, req.query, offset, limit, count),
            previous: createPreviousUrl(full_url, req.query, offset, limit, count)
        });
    }
    catch(err)
    {
        console.log(err);
        res.status(500).json({message: err.message});
    }
});

router.post('/create', passport.authenticate('jwt', {session: false}), userIsAdmin, async (req, res) => {
    const {
        name,
        image,
        gender,
        description,
        brand,
        color,
        price,
        xs,
        s,
        m,
        l,
        xl
    } = req.body;
    try
    {
        //TODO: SAVE IMAGE TO AWS STORAGE AND GET IMAGE_URL
        const image_url = image;
        const new_product = new Product({
            name,
            description,
            image_url,
            gender,
            quantities: {
                [sizes.XS]: xs,
                [sizes.S]: s,
                [sizes.M]: m,
                [sizes.L]: l,
                [sizes.XL]: xl
            },
            brand,
            color,
            price
        });
        const product = await new_product.save();
        await ChangeLog.saveNewCreateLog(req.user, product);
        res.status(200).json(product);
    }
    catch(err)
    {
        res.status(500).send(err.toString());
    }
});

router.put('/edit/:productId', passport.authenticate('jwt', {session: false}), userIsAdmin, async (req, res) => {
    let {productId} = req.params;
    let {
        name,
        image,
        gender,
        description,
        brand,
        color,
        price,
        xs,
        s,
        m,
        l,
        xl
    } = req.body;
    try
    {
        //TODO: Clean and validate integrity of body data;
        //If new image is given remove old image from storage and store new one
        //Pass new image src to query
        let image_url = null;
        if (image)
        {}
        const update_query = {
            name,
            description,
            gender,
            $inc: {
                ["quantities." + sizes.XS]: xs || 0,
                ["quantities." + sizes.S]: s || 0,
                ["quantities." + sizes.M]: m || 0,
                ["quantities." + sizes.L]: l || 0,
                ["quantities." + sizes.XL]: xl || 0
            },
            brand,
            color,
            price
        };
        if (image_url)
            update_query.image_url = image_url;
        const original_product = await Product.findById(productId);
        if (!original_product)
            throw new Error('Invalid product id.');
        const modified_product = await Product.findOneAndUpdate({_id: productId}, update_query, {new: true, runValidators: true});
        await ChangeLog.saveNewModifyLog(req.user, original_product, modified_product);
        res.status(200).json(modified_product);
    }
    catch (err)
    {
        console.log(err);
        res.status(500).send(err.toString());
    }
});

router.delete('/delete', passport.authenticate('jwt', {session: false}), userIsAdmin, async (req, res) => {
    let {ids} = req.query;
    try
    {
        if (!ids)
            throw new Error("No ids provided for deletion.");
        ids = ids.split(',');
        const products = await Product.find({_id: {$in: ids}});
        if (products.length == 0)
            res.status(200).json({
                message: "No products found."
            });
        else
        {
            await Product.deleteMany({_id: {$in: ids}});
            await ChangeLog.saveNewDeleteManyLog(req.user, products);
            res.status(200).json({
                message: "Products succesfuly deleted."
            });
        }
    }
    catch(err)
    {
        console.log(err);
        res.status(500).json({message: err.message});
    }
});

router.get('/popular', async (req, res) => {
    let {limit} = req.query;
    limit = parseLimit(limit, 5);
    try
    {
        const result = await Product.find().sort('-bought_count').limit(limit).select('_id brand image_url name price bought_count');
        res.status(200).json({
            products: result
        });
    }
    catch(err)
    {
        console.log(err);
        res.status(500).json({message: err.message});
    }
});

module.exports = router;