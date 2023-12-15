const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const roles = require('../config/roles');
const document_types = require('../config/document_types');
const { validatePassword } = require('../helpers/input_validation');
require('dotenv').config();

mongoose.connect(process.env.DB_URI)
.then(async () => {
    const email = process.argv[2];
    const user = await User.findOneAndDelete({email: email}, {new: true});
    if (!user)
        throw new Error("User not found.");
    console.log("User document deleted: \n", user);
    mongoose.disconnect();
})
.catch(err => {mongoose.disconnect(); console.log(err.message)});