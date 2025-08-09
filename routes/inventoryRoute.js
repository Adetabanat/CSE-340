const express = require("express");
const router = new express.Router();
const invController = require("../controllers/invController");
const utilities = require("../utilities");
const invValidation = require("../utilities/inventory-validation");


// Inventory Management View
router.get(
  "/",
  utilities.handleErrors(invController.buildManagementView)
);

// Classification View
router.get(
  "/type/:classificationId",
  utilities.handleErrors(invController.buildByClassificationId)
);

// Vehicle Detail View
router.get(
  "/detail/:inv_id",
  utilities.handleErrors(invController.buildByInventoryId)
);

// GET: Add Classification View
router.get(
  "/add-classification",
  utilities.handleErrors(invController.buildAddClassification)
);

// POST: Handle Add Classification Form
router.post(
  "/add-classification",
  invValidation.classificationRules(),
  invValidation.checkClassificationData,
  utilities.handleErrors(invController.addClassification)
);

// GET: Show Add Vehicle Form
router.get(
  "/add-inventory",
  utilities.handleErrors(invController.buildAddVehicle)
);

// POST: Handle Add Vehicle Submission
router.post(
  "/add-inventory",
  invValidation.inventoryRules(),
  invValidation.checkInventoryData,
  utilities.handleErrors(invController.addInventory)
);
router.get(
  "/getInventory/:classification_id",
  utilities.handleErrors(invController.getInventoryJSON)
);

// GET: Show Edit Inventory Form
// GET: Show Edit Inventory Form
router.get(
  "/edit/:inv_id",
  utilities.handleErrors(invController.editInventoryView)
);

// POST: Handle Inventory Update Submission
router.post(
  "/update",
  invValidation.inventoryRules(),
  invValidation.checkInventoryData,
  utilities.handleErrors(invController.updateInventory)
);


router.get("/delete/:inv_id", invController.buildDeleteConfirmation);
router.post("/delete", invController.deleteInventoryById);


module.exports = router;
