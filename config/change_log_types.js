const change_target = {
    USER: "USER",
    PRODUCT: "PRODUCT"
};
const change_action = {
    UPDATE: "UPDATE",
    CREATE: "CREATE",
    DELETE: "DELETE"
};
module.exports = {
    change_target,
    change_action,
    change_target_arr: Object.values(change_target),
    action_arr: Object.values(change_action)
};