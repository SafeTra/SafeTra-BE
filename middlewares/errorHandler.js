//error handler for not Found
const notFound = (req, res, next) => {
    const error = new Error (`not found : ${req.originalUrl}`);
    res.status(404);
    next(error);
}

const errorHandler = (err, req, res, next) => {
    const statuscode = res.statusCode == 200 ? 500 : res.statusCode;
    res.status(statuscode);
    res.json({
        message: err?.message,
        stack: err?.stack,
    });
};

module.exports = {errorHandler, notFound}