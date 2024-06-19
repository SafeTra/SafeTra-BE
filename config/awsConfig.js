const AWS = require('aws-sdk');
const { AWS_CREDENTIALS } = require('./env');
const { S3Client } = require('@aws-sdk/client-s3');

AWS.config.update({
    accessKeyId: AWS_CREDENTIALS.ACCESS_KEY, // Access key ID
    secretAccesskey: AWS_CREDENTIALS.SECRET_ACCESS_KEY, // Secret access key
    region: AWS_CREDENTIALS.REGION //Region
})

const s3Client = new S3Client({
    region: AWS_CREDENTIALS.REGION,
    credentials: {
        accessKeyId: AWS_CREDENTIALS.ACCESS_KEY,
        accountId: AWS_CREDENTIALS.ACCOUNT_ID,
        secretAccessKey: AWS_CREDENTIALS.SECRET_ACCESS_KEY
    }
})

const  BASE_FILE_URL = `https://${AWS_CREDENTIALS.S3_BUCKET}.s3.${AWS_CREDENTIALS.REGION}.${AWS_CREDENTIALS.AWS_BASE_URL}/`

module.exports = {
    s3Client,
    BASE_FILE_URL
}