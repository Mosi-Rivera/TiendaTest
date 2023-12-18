const express = require('express');
const passport = require('passport');
const User = require('../models/User');
const { default: mongoose } = require('mongoose');
const Product = require('../models/Product');
const Order = require('../models/Order');
const router = express.Router();

router.get('/', passport.authenticate('jwt', {session: false}), async (req, res) => {
    const user_id = req.user._id;
    try
    {
        const response = await User.findById(user_id).select('cart').populate('cart.product', 'quantities name image_url price _id price');
        res.status(200).json({
            cart: response.cart
        });
    }
    catch(err)
    {
        console.log(err);
        res.status(500).json(err.message);
    }
});

router.post('/add', passport.authenticate('jwt', {session: false}), async (req, res) => {
    const user_id = req.user._id;
    const {
        productId,
        size,
        quantity
    } = req.body;
    try
    {
        const product = Product.findOne({_id: productId, ['quantities.' + size]: {$gte: quantity}}).select('');
        if (!product)
            throw new Error("Not enough stock.");
        const update_query = {
            $push: {cart: {product: productId, size, quantity}}
        };
        const user = await User.findById(user_id);
        user.addProductToCart(productId, size, quantity);
        await user.save();
        res.status(200).json({message: "Product added to card successfuly."});
    }
    catch(err)
    {
        console.log(err);
        res.status(500).send(err.message);
    }
});

const getChangedItems = (cart, response_arr) => {
    const product_obj = {};
    for (const product of cart)
        product_obj[product._id] = product;
    for (const product in response_arr)
    {
        if (product)
            delete product_obj[product._id];
    }
    return (product_obj);
};

router.post('/checkout', passport.authenticate('jwt', {session: false}), async (req, res) => {
    const address_index = req.body.address_index;
    const user_id = req.user._id;
    const user = await User.findById(user_id).populate('cart.product', '_id name color brand price');
    if (!address_index || !user || !user.delivery_addresses[address_index] || user.cart.length == 0)
        return res.status(500).json({message: "Something went wrong. Try again later."});
    const session = await mongoose.startSession();
    session.startTransaction();
    try
    {
        const response_arr = await Promise.all(user.cart.map(({product, size, quantity}, i) => Product.findOneAndUpdate(
            {_id: product._id, ['quantities.' + size]: { $gte: quantity} },
            { $inc: { ['quantities.' + size]: -quantity } },
            { runValidators: true, new: true }
        )));
        if (response_arr.indexOf(null) !== -1)
            return res.status(500).json({message: "Something went wrong"});
        await User.findByIdAndUpdate(user_id, {$set: {cart: []}});
        const new_order = new Order({
            user_id: user._id,
            email: user.email,
            delivery_info: user.delivery_addresses[address_index],
            products: user.cart.map(({product, size, quantity}) => ({
                product_id: product._id,
                name: product.name,
                color: product.color,
                brand: product.brand,
                price: product.price,
                size,
                quantity
            })),
            total_cost: user.cart.reduce((price, {quantity, product}) => price + product.price * quantity, 0)
        });
        const order = await new_order.save();
        session.commitTransaction();
        res.status(200).json({ order });
    }
    catch(err)
    {
        console.log(err);
        await session.abortTransaction();
        res.status(500).send(err.message);
    }
    finally
    {
        session.endSession();
    }
});

module.exports = router;