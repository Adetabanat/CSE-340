const invModel = require("../models/inventory-model.js");
const utilities = require("../utilities/");
const { validationResult } = require("express-validator");

const invCont = {};

/* ***************************
 *  Vehicle Management view
 * ************************** */
invCont.buildManagementView = async function (req, res, next) {
  try {
    const nav = await utilities.getNav();
    const classificationSelect = await utilities.buildClassificationList();
    const classifications = (await invModel.getClassifications()) || [];

    res.render("./inventory/management", {
      title: "Vehicle Management",
      nav,
      classificationSelect,
      classifications,
      message: req.flash("message") || [],
      errors: [],
    });
  } catch (error) {
    next(error);
  }
};

/* ***************************
 *  Add Classification form
 * ************************** */
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

/* ***************************
 *  Add Vehicle form
 * ************************** */
invCont.buildAddVehicle = async function (req, res, next) {
  try {
    const nav = await utilities.getNav();
    const classifications = (await invModel.getClassifications()) || [];

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

/* ***************************
 *  Vehicles by Classification
 * ************************** */
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

/* ***************************
 *  Build Vehicle Detail View
 * ************************** */
invCont.buildByInventoryId = async function (req, res, next) {
  try {
    const inv_id = parseInt(req.params.inv_id);
    const item = await invModel.getInventoryById(inv_id);
    const nav = await utilities.getNav();
    const detailHTML = utilities.buildDetailView(item); 

    res.render("./inventory/detail", {
      title: `${item.inv_make} ${item.inv_model}`,
      nav,
      detailHTML,
      message: req.flash("message") || [],
      errors: [],
    });
  } catch (error) {
    next(error);
  }
};


/* ***************************
 *  Add Classification submission
 * ************************** */
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

/* ***************************
 *  Add Vehicle submission
 * ************************** */
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
  const classifications = (await invModel.getClassifications()) || [];

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
      classifications,
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

/* ***************************
 *  Show Delete Confirmation View
 * ************************** */
invCont.buildDeleteConfirmation = async function (req, res, next) {
  try {
    const inv_id = parseInt(req.params.inv_id);
    const nav = await utilities.getNav();
    const item = await invModel.getInventoryById(inv_id);

    if (!item) {
      req.flash("message", "Vehicle not found.");
      return res.redirect("/inv");
    }

    const itemName = `${item.inv_make} ${item.inv_model}`;

    res.render("./inventory/delete-confirm", {
      title: "Delete " + itemName,
      nav,
      item,
      errors: [],
      message: req.flash("message") || [],
    });
  } catch (error) {
    next(error);
  }
};

/* ***************************
 *  Delete Inventory Item (POST)
 * ************************** */
invCont.deleteInventoryById = async function (req, res, next) {
  const inv_id = parseInt(req.body.inv_id);

  try {
    if (isNaN(inv_id)) {
      req.flash("message", "Invalid vehicle ID.");
      return res.redirect("/inv");
    }

    const result = await invModel.deleteInventoryById(inv_id);

    if (result) {
      req.flash("message", "Vehicle successfully deleted.");
      res.redirect("/inv");
    } else {
      req.flash("message", "Failed to delete the vehicle.");
      res.redirect(`/inv/delete/${inv_id}`);
    }
  } catch (error) {
    next(error);
  }
};

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id);
  const invData = await invModel.getInventoryByClassificationId(classification_id);

  if (invData.length && invData[0].inv_id) {
    return res.json(invData);
  } else {
    next(new Error("No data returned"));
  }
};


/* ***************************
 *  Build edit inventory view
 * ************************** */
invCont.editInventoryView = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id)
  let nav = await utilities.getNav()
  const itemData = await invModel.getInventoryById(inv_id)
  const classificationSelect = await utilities.buildClassificationList(itemData.classification_id)
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`
  res.render("./inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    message: req.flash("message") || [],
    errors: [],
    classificationSelect: classificationSelect,
    errors: null,
    vehicle: itemData,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_description: itemData.inv_description,
    inv_image: itemData.inv_image,
    inv_thumbnail: itemData.inv_thumbnail,
    inv_price: itemData.inv_price,
    inv_miles: itemData.inv_miles,
    inv_color: itemData.inv_color,
    classification_id: itemData.classification_id
  })
}

/* ***************************
 *  Update Inventory Data
 * ************************** */
invCont.updateInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
  const {
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id,
  } = req.body
  const updateResult = await invModel.updateInventory(
    inv_id,  
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id
  )

  if (updateResult) {
    const itemName = updateResult.inv_make + " " + updateResult.inv_model
    req.flash("notice", `The ${itemName} was successfully updated.`)
    res.redirect("/inv/")
  } else {
    const classificationSelect = await utilities.buildClassificationList(classification_id)
    const itemName = `${inv_make} ${inv_model}`
    req.flash("notice", "Sorry, the insert failed.")
    res.status(501).render("inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classificationSelect: classificationSelect,
    errors: null,
    inv_id,
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
    classification_id
    })
  }
}



module.exports = invCont;
