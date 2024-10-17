
require('module-alias/register');
require('dotenv').config();
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const pool = require('database/db');
const indexRouter = require('@routes/index');
const usersRouter = require('@routes/users');
const authRouter = require('@routes/authRoutes');
const app = express();
const { log, logError } = require('logs/logger');
const session = require('express-session');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set `secure: true` in production (requires HTTPS)
}));
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/auth', authRouter)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});
// Gracefully close pool when the application shuts down
const gracefulShutdown = () => {
  log('Shutting down the application...');
  pool.end((err) => {
    if (err) {
      logError('Error closing the database pool:', err);
    } else {
      log('Database pool closed.');
    }
    process.exit(err ? 1 : 0);
  });
};

// Handle SIGINT (Ctrl+C) for graceful shutdown
process.on('SIGINT', gracefulShutdown);

// Handle SIGTERM for shutdown (often used in production environments)
process.on('SIGTERM', gracefulShutdown);

// Handle uncaught exceptions or unhandled promise rejections
process.on('uncaughtException', (error) => {
  logError('Uncaught exception:', error);
  gracefulShutdown();
});

process.on('unhandledRejection', (error) => {
  logError('Unhandled promise rejection:', error);
  gracefulShutdown();
});
module.exports = app;
