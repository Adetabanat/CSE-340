const express = require("express");
const router = new express.Router();
const utilities = require("../utilities");
const accountController = require("../controllers/accountController");
const regValidate = require('../utilities/account-validation');

// Route to trigger test error
router.get("/trigger-error", (req, res, next) => {
  try {
    throw new Error("Intentional server error for testing.");
  } catch (err) {
    next(err);
  }
});

// Account management view (default /account/)
router.get("/", utilities.checkLogin, utilities.handleErrors(accountController.buildAccountManagement));

// Login and registration views
router.get("/login", accountController.buildLogin);
router.get("/register", utilities.handleErrors(accountController.buildRegister));

// Process registration form
router.post(
  "/register",
  regValidate.registrationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
);

// Process login form
router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLoginData,
  utilities.handleErrors(accountController.accountLogin)
);

module.exports = router;
