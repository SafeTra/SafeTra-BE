require('dotenv').config()

// mailing credentials
const ZEPTO_CREDENTIALS = {
    baseUrl: process.env.ZEPTO_URL,
    authToken: process.env.ZEPTO_TOKEN,
    noReply: process.env.NO_REPLY_ADDRESS,
}

// AWS credentials
const AWS_CREDENTIALS= {
    ACCESS_KEY: process.env.ACCESS_KEY,
    SECRET_ACCESS_KEY: process.env.SECRET_ACCESS_KEY,
    REGION: process.env.REGION,
    S3_BUCKET: process.env.S3_BUCKET,
    ACCOUNT_ID: process.env.ACCOUNT_ID,
    S3_URL: process.env.S3_URL,
    AWS_BASE_URL: process.env.AWS_BASE_URL
}

// DB credentials
const DATABASE_CREDENTIALS = {
    DB_NAME: process.env.DATABASE_NAME,
    DB_PASSWORD: process.env.DATABASE_PASSWORD,
    DB_URI: process.env.MONGO_ATLAS
}

// FLW credentials
const FLW_CREDENTIALS = {
    PUBLIC_KEY: process.env.FLW_PUBLIC_KEY, 
    SECRET_KEY: process.env.FLW_SECRET_KEY
}

// Basic credentials
const FE_BASE_URL=process.env.FRONTEND_URL

// JWT
const JWT_SECRET=process.env.JWT_SECRET

// PAGINATION
const PAGE_LIMIT = Number(process.env.PAGE_LIMIT)

// FILES
const MB = process.env.FILE_SIZE_LIMIT




module.exports = {
    ZEPTO_CREDENTIALS,
    DATABASE_CREDENTIALS,
    FLW_CREDENTIALS,
    FE_BASE_URL,
    JWT_SECRET,
    PAGE_LIMIT,
    AWS_CREDENTIALS,
    MB
}