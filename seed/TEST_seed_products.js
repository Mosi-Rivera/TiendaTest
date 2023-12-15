const mongoose = require('mongoose');
const colors = require('../config/colors');
const Product = require('../models/Product');
const genders = require('../config/genders');
const sizes = require('../config/sizes');
require('dotenv').config();
const genders_arr = Object.values(genders);
const colors_arr = Object.values(colors);
const descriptions = [
    'A shirt.',
    'Super duper.',
    'Buy it now.',
    'You will love it.',
    'Why not today?',
    'Ok its on you now.'
];
const brands = [
    "NIKE",
    "ADIDAS",
    "OLD NAVY",
    "H&M"
];
const createProduct = (
    index
) => ({
    name: "A shirt: " + Math.floor( Math.random() * 1000),
    description: descriptions[index % Math.floor(descriptions.length / 2)] + '\n' + descriptions[index % descriptions.length],
    gender: genders_arr[index % genders_arr.length],
    image_url: "https://expertphotography.b-cdn.net/wp-content/uploads/2021/12/Photography-Tshirts-weapon-1.png",
    price: Math.random() * 100,
    brand: brands[index % brands.length],
    color: colors_arr[index % colors_arr.length],
    bought_count: Math.round(Math.random() * 100),
    quantities: {
        [sizes.XS]: Math.floor(Math.random() * 10),
        [sizes.S]:  Math.floor(Math.random() * 10),
        [sizes.M]:  Math.floor(Math.random() * 10),
        [sizes.L]:  Math.floor(Math.random() * 10),
        [sizes.XL]: Math.floor(Math.random() * 10)
    }
});

mongoose.connect(process.env.DB_URI)
.then(async () => {
    const products = [];
    for (let i = 0, l = Math.max(descriptions.length, brands.length, colors_arr.length); i < l; i++)
        products.push(createProduct(i));
    await Product.insertMany(products);
    mongoose.disconnect();
})
.catch(err => console.log(err));