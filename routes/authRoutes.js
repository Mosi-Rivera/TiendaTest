const {nanoid} = require('nanoid');
const bcrypt = require('bcryptjs');
const express = require('express');
const {
    validatePassword,
    validateDocumentType,
    validateDocumentNumber,
    validateRole,
    validateEmail
} = require('../helpers/input_validation');
const User = require('../models/User');
const jwt_helpers = require('../helpers/jwt');
const passport = require('passport');
const { userIsAdmin } = require('../middleware/route_guards');
const router = express.Router();

router.post('/register', async (req, res) => {
    const {email, password, role} = req.body;
    try
    {
        if (
            !validateEmail(email) ||
            !validatePassword(password)
        )
            throw new Error('Invalid or missing user information.');
        const hashpass = await bcrypt.hash(password, parseInt(process.env.HASH_SALT));
        const new_user = new User({email, password: hashpass, role});
        await new_user.save();
        res.status(201).json({
            message: "User registered succesfully.",
            user: {
                email,
                role
            }
        });
    }
    catch(err)
    {
        res.status(401).send({message: err.message});
    }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    console.log(req.body);
    try
    {
        if (!email || !password)
            throw new Error("Invalid email or password.");
        const user = await User.findOne({email});
        if (!user)
            throw new Error("Invalid email or password.");
        if (!await bcrypt.compare(password, user.password))
            throw new Error('Invalid email or password.');
        const token = jwt_helpers.sign(user);
        const refresh_token = nanoid(48);
        user.refresh_token = refresh_token;
        await user.save();
        res.status(200).json({
            message: "Logged in succesfully.",
            token,
            refresh_token
        });
    }
    catch(err)
    {
        res.status(500).json({message: err.message});
    }
});

router.post('/token', async (req, res) => {
    const { refresh_token } = req.body; 
    try
    {
        const user = await User.findOne({refresh_token});
        if (!user)
            throw new Error("Invalid refresh token.");
        const token = jwt_helpers.sign(user);
        res.status(200).json({message: "New access token granted.", token});

    }
    catch(err)
    {
        res.status(500).json({message: err.message});
    }
});

router.post('/logout', passport.authenticate('jwt', {session: false}), async (req, res) => {
    const {refresh_token} = req.body;
    console.log(refresh_token, req.user);
    try
    {
        const user = await User.findOne({refresh_token, _id: req.user._id});
        if (!user)
            throw new Error("Invalid refresh token.");
        user.refresh_token = null;
        user.save();
        res.status(200).json({message: "User logged out successfuly"});
    }
    catch(err)
    {
        res.status(500).json({message: err.message});
    }
});

module.exports = router;