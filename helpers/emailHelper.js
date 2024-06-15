const nodemailer = require ('nodemailer');
const asyncHandler = require ('express-async-handler');
const { ZEPTO_CREDENTIALS } = require('../config/env');
const { SendMailClient } = require("zeptomail");

const sendEmail = (sender, mailSubject, loadedTemplate, addressee) => {
    const url = ZEPTO_CREDENTIALS.baseUrl;
    const token = ZEPTO_CREDENTIALS.authToken;

    let client = new SendMailClient({url, token});
    
    client.sendMail({
        "from": {
            "address": sender,
            "name": "noreply"
        },
        "to": [
            {
                "email_address": {
                    "address": addressee.email,
                    "name": `${addressee.lastName??''} ${addressee.firstName??''}`
                }
            }
        ],
        "subject": mailSubject,
        "htmlbody": loadedTemplate,
    })
    .then((res) => console.log("mail sent"))
    .catch((error) => console.log("mail error"));
};

const loadTemplate = (templateString, loadedValues) => {

    const loadedHtml = templateString.replace(/%\w+%/g, function(all) {
        return loadedValues[all] || all;
    });

    return loadedHtml;
}


module.exports = {
    sendEmail,
    loadTemplate
};


