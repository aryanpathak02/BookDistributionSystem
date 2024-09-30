
const AppError = require('./Utils/ExpressError'); 

const errorHandler = (err, req, res, next) => {
    // Set default values for statusCode and message
    err.statusCode = err.statusCode || 500;
    err.message = err.message || 'Something went wrong!';

    // Send the response
    res.status(err.statusCode).json({
        status: 'error',
        statusCode: err.statusCode,
        message: err.message,
    });
};

module.exports = errorHandler;