const express = require("express");
const router = new express.Router();
const invController = require("../controllers/invController");
const utilities = require("../utilities");
const invValidation = require("../utilities/inventory-validation");
const { checkEmployeeOrAdmin } = require("../utilities");

// Inventory Management View (no auth needed)
router.get(
  "/",
  utilities.handleErrors(invController.buildManagementView)
);

// Classification View (no auth needed)
router.get(
  "/type/:classificationId",
  utilities.handleErrors(invController.buildByClassificationId)
);

// Vehicle Detail View (no auth needed)
router.get(
  "/detail/:inv_id",
  utilities.handleErrors(invController.buildByInventoryId)
);

// GET: Add Classification View (employee/admin only)
router.get(
  "/add-classification",
  checkEmployeeOrAdmin,
  utilities.handleErrors(invController.buildAddClassification)
);

// POST: Handle Add Classification Form (employee/admin only)
router.post(
  "/add-classification",
  checkEmployeeOrAdmin,
  invValidation.classificationRules(),
  invValidation.checkClassificationData,
  utilities.handleErrors(invController.addClassification)
);

// GET: Show Add Vehicle Form (employee/admin only)
router.get(
  "/add-inventory",
  checkEmployeeOrAdmin,
  utilities.handleErrors(invController.buildAddVehicle)
);

// POST: Handle Add Vehicle Submission (employee/admin only)
router.post(
  "/add-inventory",
  checkEmployeeOrAdmin,
  invValidation.inventoryRules(),
  invValidation.checkInventoryData,
  utilities.handleErrors(invController.addInventory)
);

// GET: Get Inventory JSON by classification (API, no auth)
router.get(
  "/getInventory/:classification_id",
  utilities.handleErrors(invController.getInventoryJSON)
);

// GET: Show Edit Inventory Form (employee/admin only)
router.get(
  "/edit/:inv_id",
  checkEmployeeOrAdmin,
  utilities.handleErrors(invController.editInventoryView)
);

// POST: Handle Inventory Update Submission (employee/admin only)
router.post(
  "/update",
  checkEmployeeOrAdmin,
  invValidation.inventoryRules(),
  invValidation.checkInventoryData,
  utilities.handleErrors(invController.updateInventory)
);

// GET: Show Delete Confirmation (employee/admin only)
router.get(
  "/delete/:inv_id",
  checkEmployeeOrAdmin,
  utilities.handleErrors(invController.buildDeleteConfirmation)
);

// POST: Handle Inventory Deletion (employee/admin only)
router.post(
  "/delete",
  checkEmployeeOrAdmin,
  utilities.handleErrors(invController.deleteInventoryById)
);

module.exports = router;
