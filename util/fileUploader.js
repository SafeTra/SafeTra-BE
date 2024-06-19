const { PutObjectCommand } = require("@aws-sdk/client-s3");
const { s3Client } = require("../config/awsConfig");
const { AWS_CREDENTIALS } = require("../config/env");
const multer = require("multer");
const multerS3 = require("multer-s3");


const fileUploader = async ( file, name ) => {
    // Setting up S3 upload parameters
    // const contents = []
    // for (const img of files) {
    //     console.log(img)
        
    //     contents.push({
    //         Bucket: AWS_CREDENTIALS.S3_BUCKET_NAME,
    //         Key: img.name,
    //         Body: Buffer.from(img.data, 'binary'),
    //     });
    // }

    try {
        await s3Client.send(
            new PutObjectCommand({
                Bucket: AWS_CREDENTIALS.S3_BUCKET,
                Key: name,
                Body: Buffer.from(file.data, 'binary'),
            })
        );
        
        return true
    } catch (error) {
        return false;
    }
}

const multipleUploader = multer({
    storage: multerS3({
      s3: s3Client,
      bucket: AWS_CREDENTIALS.S3_BUCKET,
      acl: 'public-read',
      metadata: function (req, file, cb) {
        cb(null, {fieldName: file.fieldname});
      },
      key: function (req, file, cb) {
        cb(null, file.name)
      }
    })
})

module.exports = {
    fileUploader,
    multipleUploader
}