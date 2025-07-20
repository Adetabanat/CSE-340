const invModel = require("../models/inventory-model");
const utilities = require("../utilities/");

const invCont = {};

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId;
  const data = await invModel.getInventoryByClassificationId(classification_id);
  const grid = await utilities.buildClassificationGrid(data);
  let nav = await utilities.getNav();
  const className = data[0].classification_name;
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  });
};

/* ***************************
 *  Build single vehicle detail view
 * ************************** */
invCont.buildInventoryDetail = async function (req, res, next) {
  const invId = req.params.inv_id;
  const data = await invModel.getInventoryById(invId);

  if (!data) {
    return next({ status: 404, message: "Vehicle not found" });
  }

  const nav = await utilities.getNav();
  const detailView = utilities.buildDetailView(data);

  res.render("inventory/detail", {
    title: `${data.inv_make} ${data.inv_model}`,
    nav,
    detailView,
  });
};

module.exports = invCont;
