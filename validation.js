//validation
const Joi = require('@hapi/joi');

//register validtion
const registerValidation = data => {
    const schema = Joi.object({
        username: Joi.string().min(3).required(),
        password: Joi.string().min(4).required(),
        cpassword: Joi.string().min(4).required(),
    });

    return schema.validate(data);
};

//login validtion
const loginValidation = data => {
    const schema = Joi.object({
        username: Joi.string().min(3).required(),
        password: Joi.string().min(4).required(),
    });

    return schema.validate(data, schema);
};

module.exports.registerValidation = registerValidation();
module.exports.loginValidation = loginValidation();