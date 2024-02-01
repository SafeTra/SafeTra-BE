const express = require ('express');
const authRouter = require ('./routes/authRoutes');
const { notFound, errorHandler } = require('./middlewares/errorHandler');
const dotenv = require('dotenv').config();
const app = express();
const dbConnect = require ('./config/dbConnect');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const morgan = require('morgan')
const PORT = process.env.PORT;
dbConnect();


app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser())

app.use('/api/user', authRouter);


app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`server is listening at ${PORT}`)
});