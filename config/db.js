'use strict';
const mongoose = require('mongoose');

module.exports = async cb => {
    try
    {
        await mongoose.connect(process.env.DB_URI);
        if (cb)
            cb();
    }
    catch(err)
    {
        console.log(err);
        process.exit(1);
    }
}