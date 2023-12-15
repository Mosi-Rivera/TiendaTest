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

router.post('/checkout', passport.authenticate('jwt', {session: false}), async (req, res) => {
    const user_id = req.user._id;
    const user = await User.findById(user_id);
    if (user.cart.length == 0)
        res.status(500).json({message: "Cart is empty."});
    const session = await mongoose.startSession();
    session.startTransaction();
    try
    {
        const bulk_write_ops = user.cart.map((item, i) => ({
            updateOne: {
                filter: {_id: item._id },
                update: { $inc: { ['quantities.' + item.size]: -item.quantity } },
                runValidators: true
            }
        }));
        await Product.bulkWrite(bulk_write_ops);
        await User.findByIdAndUpdate(user_id, {$set: {cart: []}});
        const new_order = new Order({});
        new_order.save();
        session.commitTransaction();
        res.status.json({ order });
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