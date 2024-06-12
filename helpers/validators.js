const { body, check, param, validationResult } = require('express-validator');



async function validateBody(req, res, next) {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(403).json({
            success: false,
            message: 'Request body error.',
            data: {
                ...errors
            }
        });
    }

    next();
}



function passwordField(message) {
    return check('password', message).isStrongPassword({
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 0,
        minSymbols: 0,
        returnScore: false,
        pointsPerUnique: 1,
        pointsPerRepeat: 0.5,
        pointsForContainingLower: 10,
        pointsForContainingUpper: 10,
        pointsForContainingNumber: 10,
        pointsForContainingSymbol: 10,
    });
}

const validateRegisterUserRequest = [
    body('username', 'Please provide a valid username format. e.g johndoe').isString(),
    body('email', 'Please provide a valid email.').isEmail(),
    passwordField('The password you have provided is weak. It must contain alphanumeric [A-z], [0-9] and symbols e.g [? , - ,&] and length of 8 '),
    validateBody
];

const validateLoginRequest = [
    body('email', 'Invalid email address'),
    passwordField('The provided password is incorrect.'),
    validateBody,
];







module.exports = {
    validateLoginRequest,
    validateRegisterUserRequest,
}