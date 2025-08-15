const express = require("express");
const router = new express.Router();
const reviewController = require("../controllers/reviewController");
const utilities = require("../utilities");

// Show review form - user must be logged in
router.get("/add/:inv_id", utilities.checkLogin, utilities.handleErrors(reviewController.buildReviewForm));

// Process review form POST
router.post("/add", utilities.checkLogin, utilities.handleErrors(reviewController.processReview));

module.exports = router;
