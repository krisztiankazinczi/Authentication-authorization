const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const userRouter = require('./routes/userRoutes');

const app = express();

// 1) Global MIDDLEWARES

// set security HTTP headers
app.use(helmet());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// This limiter will accept 100 request from the user in an hour - agains DOS and Brute force
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour'
});
app.use('/api', limiter); // number of remaining allowed requests will be sent in res.header

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

//Data sanitization agains NoSQL query injection
app.use(mongoSanitize()); // remove all kind of $sign etc needed to filter in mongodb

//Data sanitization agains cross site scripting
app.use(xss()); // converts html code to not html code!!

//Prevent parameter pollution - clear up query string if duplicated keys exists
app.use(hpp());

app.use(express.static(`${__dirname}/public`));

// 3) ROUTES
app.use('/api/v1/users', userRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

//Error handler have to be at the end!!
app.use(globalErrorHandler);

module.exports = app;
