const jwt = require ('jsonwebtoken');

const generateToken = (id, role) =>{
    /* 
        TODO 
        - Consider reducing expiration time due to sensitive data
        - Create an easier way to refresh on frontend 
    */
    return jwt.sign({id, role}, process.env.JWT_SECRET, {expiresIn: '1d'});
}

module.exports = {generateToken}