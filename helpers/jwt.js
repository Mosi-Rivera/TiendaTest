const jwt = require('jsonwebtoken');
const _export = {};

_export.sign = (user) => jwt.sign(
    { _id: user._id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
);

module.exports = _export;