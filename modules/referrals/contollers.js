const { Referral } = require('./models');
const { User } = require('../users/models');
const crypto = require('crypto');
const querystring = require('querystring');
const CryptoJS = require('crypto-js');


const generateLink = async (req, res) => {
    const { id } = req.params;
    const userId = req.user._id.toString();
    console.log()
    try {
        // const user = await User.findOne({ id: userId });
        const encryptedText = CryptoJS.AES.encrypt(userId, process.env.URL_SECRET_KEY).toString();
        const baseUrl = process.env.FRONTEND_URL; // Replace with your base URL
        const encryptedParam = encodeURIComponent(encryptedText); // Encode encrypted text for URL

        const queryParams = {
            referrer: encryptedParam
        };

        const finalUrl = `${baseUrl}/referral?${querystring.stringify(queryParams)}`;
        // if (!user) return res.status(401).json({ success: false, message: 'This user id was not found.' });


        res.status(200).json({
            success: true,
            message: 'Referral url generated.',
            data: {
                url:finalUrl
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Error fetching users' });
    }
}



const validateLink = async ( req, res) => {

    const { link } = req.query;
    const decodedEncryptedText = decodeURIComponent(link);

    const bytes = CryptoJS.AES.decrypt(decodedEncryptedText, process.env.URL_SECRET_KEY);
    const decryptedText = bytes.toString(CryptoJS.enc.Utf8);

    let user = await User.findOne({ id: decryptedText});
    if (!user) return res.status(400).json({ success: false, message: 'This referral link is not valid' });

    // const s = new Referral({referee: 'test' , referrer: decryptedText});
    // await s.save();
    
    return res.status(200).json({
        success: true,
        message: 'Url is validate',
        data: {
            s
        }
    })
}



module.exports = {
    generateLink,
    validateLink,
}