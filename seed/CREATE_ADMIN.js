const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const roles = require('../config/roles');
const { validatePassword } = require('../helpers/input_validation');
require('dotenv').config();

mongoose.connect(process.env.DB_URI)
.then(async () => {
    const email = process.argv[2];
    const password = process.argv[3];
    console.log(password);
    if (!validatePassword(password))
        throw new Error("Invalid password: Must contain one lowercase, one uppercase and be at least 5 characters long.");
    const role = roles.ADMIN;
    const hashpass = await bcrypt.hash(password, parseInt(process.env.HASH_SALT));
    const new_user = new User({
        email,
        password: hashpass,
        role
    });
    console.log("Admin created:\n", await new_user.save());
    mongoose.disconnect();
})
.catch(err => {mongoose.disconnect(); console.log(err.message)});