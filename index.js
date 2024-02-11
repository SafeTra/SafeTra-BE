const express = require('express');
const authRouter = require('./routes/authRoutes');
const kycRoute = require('./routes/kycRoute');
const { notFound, errorHandler } = require('./middlewares/errorHandler');
const dotenv = require('dotenv');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const cors = require('cors');

// Set path to .env
dotenv.config({ path: './config.env' });
const app = express();

// Trust Proxy
app.enable('trust proxy');

// IMPLEMENT CORS - SET "Access Control Allow Origin Header"
app.use(cors());

// Handle Non-simple requests(Options Requests)
app.options('*', cors());

// Helmet - Set security http headers
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        scriptSrc: ["'self'", 'https://cdnjs.cloudflare.com'],
      },
    },
  })
);

// Rate Limiting Middleware
// 100 Requests per hour
const limiter = rateLimit({
  max: 50,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!',
});
app.use('/api', limiter);

// Data Sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data Sanitization against XSS
app.use(xss());

const dbConnect = require('./config/dbConnect');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const PORT = process.env.PORT;
dbConnect();

app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(compression());

app.use('/api/user', authRouter);
app.use('/api/kyc', kycRoute);

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`server is listening at ${PORT}`);
});
