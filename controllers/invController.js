const invModel = require("../models/inventory-model");
const utilities = require("../utilities/");
const { validationResult } = require("express-validator");

const invCont = {};

// Vehicle Management view
invCont.buildManagementView = async function (req, res, next) {
  try {
    const nav = await utilities.getNav();
    const classificationSelect = await utilities.buildClassificationList();
    res.render("./inventory/management", {
      title: "Vehicle Management",
      nav,
      classificationSelect,
      message: req.flash("message") || [],
      errors: [],
    });
  } catch (error) {
    next(error);
  }
};

// Add Classification form
invCont.buildAddClassification = async function (req, res, next) {
  try {
    const nav = await utilities.getNav();
    res.render("./inventory/add-classification", {
      title: "Add New Classification",
      nav,
      classification_name: "",
      message: req.flash("message") || [],
      errors: [],
    });
  } catch (error) {
    next(error);
  }
};

// Add Vehicle form
invCont.buildAddVehicle = async function (req, res, next) {
  try {
    const nav = await utilities.getNav();
    const classifications = await invModel.getClassifications();

    res.render("./inventory/add-inventory", {
      title: "Add New Vehicle",
      nav,
      classifications,
      vehicle: {},
      message: req.flash("message") || [],
      errors: [],
    });
  } catch (error) {
    console.error("Error loading add-inventory view:", error);
    next(error);
  }
};

// Vehicles by Classification
invCont.buildByClassificationId = async function (req, res, next) {
  try {
    const classification_id = req.params.classificationId;
    const data = await invModel.getInventoryByClassificationId(classification_id);
    const grid = utilities.buildClassificationGrid(data);
    const nav = await utilities.getNav();
    const classificationName = data.length > 0 ? data[0].classification_name : "Unknown";

    res.render("./inventory/classification", {
      title: `${classificationName} Vehicles`,
      nav,
      grid,
      message: req.flash("message") || [],
      errors: [],
    });
  } catch (error) {
    next(error);
  }
};

// Add Classification submission
invCont.addClassification = async function (req, res, next) {
  const { classification_name } = req.body;
  const errors = validationResult(req);
  const nav = await utilities.getNav();

  if (!errors.isEmpty()) {
    return res.render("./inventory/add-classification", {
      title: "Add New Classification",
      nav,
      classification_name,
      errors: errors.array(),
      message: req.flash("message") || [],
    });
  }

  try {
    const result = await invModel.addClassification(classification_name);
    if (result) {
      req.flash("message", "New classification added successfully.");
      res.redirect("/inv");
    } else {
      req.flash("message", "Failed to add classification.");
      res.redirect("/inv/add-classification");
    }
  } catch (error) {
    next(error);
  }
};

// Add Vehicle submission
invCont.addInventory = async function (req, res, next) {
  const {
    classification_id,
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
  } = req.body;

  const errors = validationResult(req);
  const nav = await utilities.getNav();
  const classifications = await invModel.getClassifications();

  const vehicle = {
    classification_id,
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
  };

  if (!errors.isEmpty()) {
    return res.render("./inventory/add-inventory", {
      title: "Add New Vehicle",
      nav,
      classifications, // ✅ fixed this
      vehicle,
      errors: errors.array(),
      message: req.flash("message") || [],
    });
  }

  try {
    const result = await invModel.addInventory(vehicle);
    if (result) {
      req.flash("message", "Vehicle added successfully.");
      res.redirect("/inv");
    } else {
      req.flash("message", "Failed to add vehicle.");
      res.redirect("/inv/add-inventory");
    }
  } catch (error) {
    next(error);
  }
};

module.exports = invCont;
