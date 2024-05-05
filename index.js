const express = require('express');
const cors = require('cors');
const authRouter = require('./routes/authRoutes');
const kycRoute = require('./routes/kycRoute');
const { notFound, errorHandler } = require('./middlewares/errorHandler');
const dotenv = require('dotenv').config();
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
const app = express();
const escrowRoute = require ('./routes/escrowRoutes');
const transactionRoute = require ('./routes/transactionRoutes');
const dbConnect = require('./config/dbConnect');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const PORT = process.env.PORT || 3000;
const session = require ("express-session")

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
  saveUninitialized: true
}));

// Connect DB
dbConnect();

// Set up Cron to prevent Render server from sleeping
app.get('/stay-awake', (req, res, next) => {
  res.status(200);
  res.send({ message: 'Wake up' });
});

app.use('/api/user', authRouter);
app.use('/api/kyc', kycRoute);
app.use('/api/transaction', transactionRoute);
app.use('/api/escrow', escrowRoute);

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`server is listening at ${PORT}`);
});
