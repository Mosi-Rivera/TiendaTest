const email_validator = require("email-validator");
const roles = require('../config/roles');
const gender = require('../config/genders');
const gender_arr = Object.values(gender);
const roles_arr = Object.values(roles);
const password_validation_regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d !"#%&'()*+,-/:;<=>?@[\]^_`{|}~]{5,}$/;
const _export = {};

_export.validatePassword = (password) => (password && password.match(password_validation_regex));

_export.validateEmail = (email) => (email && email_validator.validate(email));

_export.validateGender = (gender) => (gender && gender_arr.indexOf(gender) != -1);

module.exports = _export;