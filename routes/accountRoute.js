const express = require("express");
const router = new express.Router();
const utilities = require("../utilities");
const accountController = require("../controllers/accountController");
const regValidate = require('../utilities/account-validation');
const invController = require("../controllers/invController");
const invValidation = require("../utilities/inventory-validation");
const { checkEmployeeOrAdmin } = require("../utilities");

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

// Logout route
router.get("/logout", utilities.handleErrors(accountController.logout));

// Inventory routes

// Add new vehicle
router.get(
  "/add",
  checkEmployeeOrAdmin,
  utilities.handleErrors(invController.buildAddVehicle)
);

router.post(
  "/add",
  checkEmployeeOrAdmin,
  invValidation.inventoryRules(),
  invValidation.checkInventoryData,
  utilities.handleErrors(invController.addInventory)
);

// Edit vehicle
router.get(
  "/edit/:inv_id",
  checkEmployeeOrAdmin,
  utilities.handleErrors(invController.editInventoryView)
);

router.post(
  "/edit/:inv_id",
  checkEmployeeOrAdmin,
  invValidation.inventoryRules(),
  invValidation.checkUpdateData,
  utilities.handleErrors(invController.updateInventory)
);

// Delete vehicle
router.get(
  "/delete/:inv_id",
  checkEmployeeOrAdmin,
  utilities.handleErrors(invController.buildDeleteConfirmation)
);

router.post(
  "/delete",
  checkEmployeeOrAdmin,
  utilities.handleErrors(invController.deleteInventoryById)
);

// Account update views
router.get("/update/:id", utilities.checkLogin, utilities.handleErrors(accountController.buildUpdateView));
router.post(
  "/update/:id",
  utilities.checkLogin,
  regValidate.updateRules(),
  regValidate.checkUpdateData,
  utilities.handleErrors(accountController.updateAccount)
);


// Process password change
router.post(
  "/password",
  utilities.checkLogin,
  regValidate.passwordRules(),
  regValidate.checkPasswordData,
  utilities.handleErrors(accountController.updatePassword)
);

module.exports = router;
