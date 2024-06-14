const nodemailer = require ('nodemailer');
// mailing credentials
const ZEPTO_CREDENTIALS ={
    baseUrl: process.env.ZEPTO_URL,
    authToken: process.env.ZEPTO_TOKEN,
    noReply: process.env.NO_REPLY_ADDRESS,
}

// AWS credentials

// DB credentials

// DB credentials

module.exports = {
    ZEPTO_CREDENTIALS,
}