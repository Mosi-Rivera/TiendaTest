const express = require('express');
const passport = require('passport');
const productRoutes = require('./routes/productRoutes');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const cartRoutes = require('./routes/cartRoutes');
const changelogRoutes = require('./routes/ChangeLogRoutes');
const orderRoutes = require('./routes/OrderRoutes');
const path = require('path');
const dbConfig = require('./config/db');
const ExpressMongoSanitize = require('express-mongo-sanitize');
require('dotenv').config();
const app = express();

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({extended: true}));
app.use(express.json());

app.use(ExpressMongoSanitize());

require('./config/passport_jwt')(passport);
app.use(passport.initialize());

app.use('/api/user', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/changelogs', changelogRoutes);

app.get('*', (req, res) => {
    res.status(404).send("Route does not exist!");
});

dbConfig(() => {
    app.listen(process.env.PORT, () => {
        console.log('Listening on port: ' + process.env.PORT);
    });
});