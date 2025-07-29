const express = require("express")
const router = new express.Router()
const utilities = require("../utilities")
const accountController = require("../controllers/accountController")
const regValidate = require('../utilities/account-validation') 

router.get("/trigger-error", (req, res, next) => {
  try {
    throw new Error("Intentional server error for testing.");
  } catch (err) {
    next(err); // Sends error to error-handling middleware
  }
});


// Login View
router.get("/", accountController.buildLogin)
router.get("/login", accountController.buildLogin) 
router.get("/register", utilities.handleErrors(accountController.buildRegister))

// Process the registration data
router.post(
  "/register",
  regValidate.registrationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
)

// Process the login attempt
router.post(
  "/login",
  (req, res) => {
    res.status(200).send('login process')
  }
)

module.exports = router