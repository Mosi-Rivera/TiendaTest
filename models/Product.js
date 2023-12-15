const mongoose = require("mongoose");
const colors = require('../config/colors');
const genders = require('../config/genders');
const genders_arr = Object.values(genders);
const colors_arr = Object.values(colors);
const Schema = mongoose.Schema;
const sizes = require('../config/sizes');
const size_quantity = {type: Number, min: [0, "Cannot have a negative quantity."], default: 0};
const Product = new Schema({
	name: {type: String, required: true},
	description: {type: String, required: true},
	image_url: {type: String, required: true},
	gender: {type: String, enum: genders_arr, default: genders.MEN},
	quantities: {
		[sizes.XS]: size_quantity,
		[sizes.S]: size_quantity,
		[sizes.M]: size_quantity,
		[sizes.L]: size_quantity,
		[sizes.XL]: size_quantity
	},
	brand: {type: String, minLength: [2, "Invalid brand name length."], required: true},
	color: {type: String, enum: colors_arr,  required: true},
	price: {type: Number, min: [0, "Price cannot be negative."], required: true},
	bought_count: {type: Number, default: 0}
},{
    timestamps: true
});

module.exports = mongoose.model("Product", Product);