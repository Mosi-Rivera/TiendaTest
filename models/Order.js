const mongoose = require("mongoose");
const sizes = require("../config/sizes");
const Schema = mongoose.Schema;
const Order = new Schema({
    user_id: {type: mongoose.Types.ObjectId, required: true},
    email: {type: String, required: true},
    delivery_info: {
		zip: {type: String, required: true},
		street1: {type: String, required: true},
		street2: {type: String, required: false},
		city: {type: String, required: true},
		region: {type: String, required: true},
		country: {type: String, required: true}
    },
	products: [{
        _id: false,
        product_id: {type: mongoose.Types.ObjectId, required: true},
        name: {type: String, required: true},
        color: {type: String, required: true},
        brand: {type: String, required: true},
        size: {type: String, enum: sizes.getArr(), required: true},
        quantity: {type: Number, required: true},
        price: {type: Number, required: true}
    }],
    total_cost: {type: Number, required: true}
},{
    timestamps: true
});

module.exports = mongoose.model("Order", Order);
