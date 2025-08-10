const { body, validationResult } = require("express-validator");
const invModel = require("../models/inventory-model");
const utilities = require("../utilities/index");

const inventoryRules = () => {
  return [
    body("inv_make").trim().notEmpty().withMessage("Please provide a make."),
    body("inv_model").trim().notEmpty().withMessage("Please provide a model."),
    body("inv_year")
      .isInt({ min: 1900, max: new Date().getFullYear() + 1 })
      .withMessage("Please enter a valid year."),
    body("inv_description").trim().notEmpty().withMessage("Please provide a description."),
    body("inv_image").trim().notEmpty().withMessage("Please provide an image path."),
    body("inv_thumbnail").trim().notEmpty().withMessage("Please provide a thumbnail path."),
    body("inv_price").isFloat({ min: 0 }).withMessage("Please enter a valid price."),
    body("inv_miles").isInt({ min: 0 }).withMessage("Please enter valid mileage."),
    body("inv_color").trim().notEmpty().withMessage("Please enter a color."),
    body("classification_id").isInt({ min: 1 }).withMessage("Please choose a valid classification."),
  ];
};

const checkInventoryData = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const nav = await utilities.getNav();
    const classifications = await invModel.getClassifications();
    return res.render("inventory/add-inventory", {
      title: "Add Inventory",
      nav,
      errors: errors.array(),
      classifications,
      vehicle: {
        classification_id: req.body.classification_id,
        inv_make: req.body.inv_make,
        inv_model: req.body.inv_model,
        inv_year: req.body.inv_year,
        inv_description: req.body.inv_description,
        inv_image: req.body.inv_image,
        inv_thumbnail: req.body.inv_thumbnail,
        inv_price: req.body.inv_price,
        inv_miles: req.body.inv_miles,
        inv_color: req.body.inv_color,
      },
      message: req.flash("message"),
    });
  }
  next();
};

const checkUpdateData = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const nav = await utilities.getNav();
    const classifications = await invModel.getClassifications();
    return res.render("inventory/edit-inventory", {
      title: "Edit Inventory",
      nav,
      errors: errors.array(),
      classifications,
      vehicle: {
        classification_id: req.body.classification_id,
        inv_id: req.body.inv_id,
        inv_make: req.body.inv_make,
        inv_model: req.body.inv_model,
        inv_year: req.body.inv_year,
        inv_description: req.body.inv_description,
        inv_image: req.body.inv_image,
        inv_thumbnail: req.body.inv_thumbnail,
        inv_price: req.body.inv_price,
        inv_miles: req.body.inv_miles,
        inv_color: req.body.inv_color,
      },
      message: req.flash("message"),
    });
  }
  next();
};

// Classification validation rules
const classificationRules = () => {
  return [
    body("classification_name")
      .trim()
      .notEmpty()
      .withMessage("Please provide a classification name.")
      .isAlphanumeric()
      .withMessage("Classification name must be alphanumeric."),
  ];
};

// Classification data checker
const checkClassificationData = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const nav = await utilities.getNav();
    return res.render("inventory/add-classification", {
      title: "Add Classification",
      nav,
      errors: errors.array(),
      classification_name: req.body.classification_name,
      message: req.flash("message"),
    });
  }
  next();
};

module.exports = {
  inventoryRules,
  checkInventoryData,
  classificationRules,
  checkClassificationData,
  checkUpdateData,
};
