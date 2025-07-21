const express = require("express")
const router = new express.Router()
const invController = require("../controllers/invController")
const utilities = require("../utilities")

// Classification View
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId))

// Vehicle Detail View
router.get("/detail/:inv_id", utilities.handleErrors(invController.buildInventoryDetail))

module.exports = router
