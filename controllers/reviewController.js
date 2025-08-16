const utilities = require("../utilities");
const reviewModel = require("../models/review-model");

/* Show review form */
async function buildReviewForm(req, res) {
  const nav = await utilities.getNav();
  const inv_id = req.params.inv_id;
  res.render("reviews/reviewForm", {
    title: "Add Review",
    nav,
    inv_id,
     rating: "",   // ✅ ensure it's always defined
    comment: "",
    message: req.flash("notice") || [], rating: "",   // ✅ ensure it's always defined
    comment: "",
    errors: [],
  });
}

/* Process review submission */
async function processReview(req, res) {
  const nav = await utilities.getNav();
  const { inv_id, rating, comment } = req.body;
  const account_id = res.locals.clientId;

  // Server-side validation
  const errors = [];
  const ratingNum = parseInt(rating, 10);
  if (!rating || ratingNum < 1 || ratingNum > 5) errors.push("Rating must be between 1 and 5.");
  if (!comment || comment.trim().length === 0) errors.push("Comment is required.");
  if (comment && comment.length > 500) errors.push("Comment cannot exceed 500 characters.");

  if (errors.length > 0) {
    return res.status(400).render("reviews/reviewForm", {
      title: "Add Review",
      nav,
      inv_id,
      message: req.flash("notice") || [],
      errors,
      rating,
      comment,
    });
  }

  try {
    await reviewModel.addReview(inv_id, account_id, ratingNum, comment.trim());
    req.flash("notice", "Review submitted successfully.");
    return res.redirect(`/inv/detail/${inv_id}`); // redirect back to vehicle detail
  } catch (error) {
    console.error("Review submission error:", error);
    req.flash("notice", "Error submitting review, please try again.");
    return res.status(500).render("reviews/reviewForm", {
      title: "Add Review",
      nav,
      inv_id,
      message: req.flash("notice") || [],
      errors: [],
      rating,
      comment,
    });
  }
}

module.exports = {
  buildReviewForm,
  processReview,
};
