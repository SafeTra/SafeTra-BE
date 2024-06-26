const path = require("path");
const { ALLOWED_EXTENSIONS } = require("./enums");
const { MB } = require("../config/env");


// const filesPayloadExists = (req, res, next) => {
//     if (!req.files) return res.status(400).json({ 
//         status: "error", 
//         message: "Missing files" 
//     })

//     next()
// }

 
const FILE_SIZE_LIMIT = MB * 1024 * 1024;  // To Megabytes



const fileSizeLimiter = (req, res, next) => {
    const files = req.files

    const filesOverLimit = []
    // Which files are over the limit?
    Object.keys(files).forEach(key => {
        if (files[key].size > FILE_SIZE_LIMIT) {
            filesOverLimit.push(files[key].name)
        }
    })

    if (filesOverLimit.length) {
        const properVerb = filesOverLimit.length > 1 ? 'are' : 'is';

        const sentence = `Upload failed. ${filesOverLimit.toString()} ${properVerb} over the file size limit of ${MB} MB.`.replaceAll(",", ", ");

        const message = filesOverLimit.length < 3
            ? sentence.replace(",", " and")
            : sentence.replace(/,(?=[^,]*$)/, " and");

        return res.status(413).json({ 
            status: "Failure", 
            message 
        });

    }

    next()
}




const fileExtLimiter = (req, res, next) => {
    
    const allowedExtArray = ALLOWED_EXTENSIONS.IMAGES;
    const files = req.files;

    const fileExtensions = []
    Object.keys(files).forEach(key => {
        fileExtensions.push(path.extname(files[key].name))
    })

    // Are the file extension allowed? 
    const allowed = fileExtensions.every(ext => allowedExtArray.includes(ext))

    if (!allowed) {
        const message = `Upload failed. Only ${allowedExtArray.toString()} files allowed.`.replaceAll(",", ", ");

        return res.status(422).json({ 
            status: "Failure", 
            message 
        });
    }

    next()
}

module.exports = {
    fileExtLimiter,
    fileSizeLimiter
}