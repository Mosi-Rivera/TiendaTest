const roles = require("../config/roles");
const sendUnauthorizedResponse = (res) => res.status(401).json({message: "Unauthorized"});

const methods = {};

methods.userIsAdmin = (req, res, next) => {
    if (req.user.role === roles.ADMIN)
        return next();
    sendUnauthorizedResponse(res);
}

methods.userIsStaff = (req, res, next) => {
    const role = req.user.role;
    if (role === roles.ADMIN || role === roles.STAFF)
        return next();
    sendUnauthorizedResponse(res);
}

methods.userIsCustomer = (req, res, next) => {
    if (req.user.role === roles.CUSTOMER)
        return next();
    sendUnauthorizedResponse(res);
}

module.exports = methods;