// with this I don't have to write try-catch blocks in async functions!!!
// This middleware will get the error of async functions!!!!
// I will propagate the error to the globalErrorHandling middleware!

module.exports = fn => {
  return (req, res, next) => {
    fn(req, res, next).catch(err => next(err));
  };
};
