const morgan = require('morgan');
const express = require('express');
const session = require ("express-session");
const cors = require('cors');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
const dotenv = require('dotenv').config();
const PORT = process.env.PORT || 3000;
const { notFound, errorHandler } = require('./middlewares/errorHandler');
const dbConnect = require('./config/dbConnect');
const { authRouter, route: authPath } = require('./modules/auth/routes');
const { userRouter, route: userPath } = require('./modules/users/routes');
const { transactionRouter, route: transactionPath } = require('./modules/transactions/routes');
<<<<<<< HEAD
const { itemRouter, route: itemPath } = require('./modules/items/routes');
const { fileRouter, route: filePath } = require('./modules/files/routes');
const fileUpload = require('express-fileupload');
=======
const { referralRouter, route: referralPath } = require('./modules/referrals/routes');
>>>>>>> 90d542be1d1e066fe10a53d5b4105dc2dbf68120

const app = express();

// Trust Proxy
app.enable('trust proxy');

// IMPLEMENT CORS - SET "Access Control Allow Origin Header"
app.use(
  cors({
    origin: '*',
  })
);

// Handle Non-simple requests(Options Requests)
app.options('*', cors());

app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(session({
  secret: process.env.JWT_SECRET,
  resave: false,
  saveUninitialized: true,
}));

// Connect DB
dbConnect();

// Set up Cron to prevent Render server from sleeping
app.get('/stay-awake', (req, res, next) => {
  res.status(200);
  res.send({ message: 'Wake up' });
});

const apiVersion = '/api/v1'

// Todo: home route returning api version

app.use(apiVersion + userPath, userRouter);
app.use(apiVersion + authPath, authRouter);
app.use(apiVersion + transactionPath, transactionRouter);
<<<<<<< HEAD
app.use(apiVersion + itemPath, itemRouter);
app.use(apiVersion + filePath, fileRouter);
=======
app.use(apiVersion + referralPath, referralRouter);
>>>>>>> 90d542be1d1e066fe10a53d5b4105dc2dbf68120


app.use(notFound);
app.use(errorHandler);
app.use(fileUpload())

// console.log(
//   `https://safetra.s3.eu-west-2.amazonaws.com/b32d8371-eb5d-4d04-8310-d5115a8ff283__1718791583352.jpg` == `https://safetra.s3.eu-west-2.amanzonaws.com/b32d8371-eb5d-4d04-8310-d5115a8ff283__1718791583352.jpg`
// )


app.listen(PORT, () => {
  console.log(`server is listening at ${PORT}`);
});