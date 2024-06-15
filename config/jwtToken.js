const jwt = require ('jsonwebtoken');

const generateToken = (id, role) =>{  // For login
    /* 
        TODO 
        - Consider reducing expiration time due to sensitive data
        - Create an easier way to refresh on frontend 
    */
    return jwt.sign({id, role}, process.env.JWT_SECRET, {expiresIn: '1d'});
}

const verificationToken = (id, role) =>{  // For email verification, etc.
    /* 
        TODO 
        - Consider reducing expiration time due to sensitive data
        - Create an easier way to refresh on frontend 
    */
    return jwt.sign({id, role}, process.env.JWT_SECRET, {expiresIn: '600000'});
}

module.exports = {
    generateToken,
    verificationToken
}