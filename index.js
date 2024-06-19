const fileUpload = require('express-fileupload');
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
const { itemRouter, route: itemPath } = require('./modules/items/routes');
const { fileRouter, route: filePath } = require('./modules/files/routes');
const { referralRouter, route: referralPath } = require('./modules/referrals/routes');

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
app.use(apiVersion + itemPath, itemRouter);
app.use(apiVersion + filePath, fileRouter);
app.use(apiVersion + referralPath, referralRouter);


app.use(notFound);
app.use(errorHandler);
app.use(fileUpload())

app.listen(PORT, () => {
  console.log(`server is listening at ${PORT}`);
});