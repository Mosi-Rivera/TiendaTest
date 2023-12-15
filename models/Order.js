const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Order = new Schema({
    first_name: {type: String, required: true},
    last_name: {type: String, required: true},
    delivery_info: {
        zip: {type: Number, required: true},
        city: {type: String, required: true},
        country: {type: String, required: true},
        address: {type: String, required: true},
        phone_number: {type: String, required: true}
    },
	cart: [{
        product: {type: mongoose.Types.ObjectId, required: true, ref: 'Product'},
        size: {type: String, enum: ["xs", "s", "m", "l", "xl"], required: true},
        quantity: {type: Number, required: true},
    }],
    total_cost: {type: Number, required: true}
},{
    timestamps: true
});

module.exports = mongoose.model("Order", Order);
