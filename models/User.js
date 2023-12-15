const mongoose = require("mongoose");
const roles = require("../config/roles");
const email_validator = require("email-validator");
const sizes = require("../config/sizes");
const Schema = mongoose.Schema;
const validateEmail = (email) => email_validator.validate(email);
const User = new Schema({
	email: {type: String, required: true, unique: true},
	password: {type: String, required: true },
	role: {type: String, enum: Object.values(roles) , default: roles.CUSTOMER, required: true},
	refresh_token: {type: String, required: false},
	delivery_addresses: [{
		zip: {type: String, required: true},
		street1: {type: String, required: true},
		street2: {type: String, required: false},
		city: {type: String, required: true},
		region: {type: String, required: true},
		country: {type: String, required: true}
	}],
	cart: [{
		_id: false,
        product: {type: mongoose.Types.ObjectId, required: true, ref: 'Product'},
        size: {type: String, enum: [sizes.XS, sizes.S, sizes.M, sizes.L, sizes.XL], required: true},
        quantity: {type: Number, required: true}
    }]
},{
    timestamps: true
});

User.methods.addProductToCart = function(id, size, quantity) {
	id = id.toString();
	for (const item of this.cart)
	{
		if (item.product.toString() === id && size == item.size)
		{
			item.quantity += parseInt(quantity);
			return;
		}
	}
	this.cart.push({product: id, quantity, size});
}

module.exports = mongoose.model("User", User);
