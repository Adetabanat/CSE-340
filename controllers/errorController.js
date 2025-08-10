// controllers/errorController.js
function triggerError(req, res, next) {
  try {
    throw new Error("This is a simulated server error.");
  } catch (err) {
    next(err); // Passes the error to the error-handling middleware
  }
}

module.exports = {
  triggerError,
};
