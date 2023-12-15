const mongoose = require('mongoose');
const { change_target_arr, action_arr, change_target, change_action } = require('../config/change_log_types');
const Schema = mongoose.Schema;

const ChangeLog = new Schema({
    user_id: {type: mongoose.Types.ObjectId, required: true, ref: 'User'},
    target_product_id: {type: mongoose.Types.ObjectId, ref: 'Product'},
    target_user_id: {type: mongoose.Types.ObjectId, ref: 'User'},
    target_type: {type: String, enum: change_target_arr, required: true},
    action: {type: String, enum: action_arr, required: true},
    description: {type: String, required: false}
},{
    timestamps: {
        createdAt: true,
        updatedAt: false
    }
});

const putQuotationsIfString = (value) => {
    console.log(value, typeof value);
    if (typeof value === 'string')
        return ("\"" + value + "\"");
    return (value);
}

const createChangeStr = (old_fields, new_fields, key_path = "") => {
    if (!old_fields || !new_fields)
        return ("");
    let str = "";
    for (const key in new_fields)
    {
        if (typeof new_fields[key] == 'object')
        {
            if (new_fields[key] instanceof Date)
                continue;
            str += createChangeStr(old_fields[key], new_fields[key], (key_path ? key_path + '.' : "") + key + '.');
        }
        else if (old_fields[key] !== new_fields[key])
            str += `${key_path + key}: ${putQuotationsIfString(old_fields[key])} -> ${putQuotationsIfString(new_fields[key])}\n`;
    }
    return (str);
}

ChangeLog.statics.saveNewCreateLog = (user, product) => {
    const new_log = new ChangeLogModel({
        user_id: user._id,
        target_product_id: product._id,
        target_type: change_target.PRODUCT,
        action: change_action.CREATE,
        description: `${user.email} created "${product.name}".`
    });
    return new_log.save();
}

ChangeLog.statics.saveNewDeleteLog = (user, product) => {
    const new_log = new ChangeLogModel({
        user_id: user._id,
        target_product_id: product._id,
        target_type: change_target.PRODUCT,
        action: change_action.DELETE,
        description: `${user.email} deleted "${product.name}".`
    });
    return new_log.save();
}

ChangeLog.statics.saveNewDeleteManyLog = (user, products) => {
    return ChangeLogModel.bulkSave(
        products.map(product => (new ChangeLogModel({
            user_id: user._id,
            target_product_id: product._id,
            target_type: change_target.PRODUCT,
            action: change_action.DELETE,
            description: `${user.email} deleted "${product.name}".`
        })))
    );
}

ChangeLog.statics.saveNewModifyLog = (user, old_product, new_product) => {
    old_product = old_product.toObject();
    new_product = new_product.toObject();
    const new_log = new ChangeLogModel({
        user_id: user._id,
        target_product_id: new_product._id,
        target_type: change_target.PRODUCT,
        action: change_action.UPDATE,
        description: `${user.email} changed the following fields:\n${createChangeStr(old_product, new_product)}`
    });
    return new_log.save();
}

ChangeLog.statics.saveNewChangeRoleLog = (user, changed_user) => {
    const new_log = new ChangeLogModel({
        user_id: user._id,
        target_user_id: changed_user._id,
        target_type: change_target.USER,
        action: change_action.UPDATE,
        description: `${user.email} changed ${changed_user.email}'s role to ${changed_user.role}`
    });
    return new_log.save();
}

const ChangeLogModel = mongoose.model('ChangeLog', ChangeLog);

module.exports = ChangeLogModel;