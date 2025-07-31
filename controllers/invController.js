const invModel = require("../models/inventory-model");
const utilities = require("../utilities/");
const { validationResult } = require("express-validator");

// Controller to build management view
invCont = {};

invCont.buildManagementView = async function (req, res, next) {
	try {
		const nav = await utilities.getNav();
		const classificationSelect = await utilities.buildClassificationList();
		const message = req.flash("message"); // ✅
		res.render("./inventory/management", {
			title: "Vehicle Management",
			nav,
			classificationSelect,
			errors: null,
			message: req.flash("message"), // ✅ Add this line
		});
	} catch (error) {
		next(error);
	}
};

// Controller to build Add Classification form
invCont.buildAddClassification = async function (req, res, next) {
	try {
		const nav = await utilities.getNav();
		res.render("./inventory/add-classification", {
			title: "Add New Classification",
			nav,
			errors: null,
			classification_name: "",
			message: req.flash("message"), // ✅ Add this line
		});
	} catch (error) {
		next(error);
	}
};

// Controller to build Add Vehicle form
invCont.buildAddVehicle = async function (req, res, next) {
	try {
		const classifications = await invModel.getClassifications(); // ✅ this should return rows
		const nav = await utilities.getNav();
		const message = req.flash("message");

		res.render("./inventory/add-inventory", {
			title: "Add New Vehicle",
			nav,
			classifications, // ✅ send this object directly
			errors: null,
			vehicle: {}, // for sticky form values
			message,
		});
	} catch (error) {
		console.error("Error loading add-inventory view:", error);
		next(error);
	}
};

// Controller to build classification view
invCont.buildByClassificationId = async function (req, res, next) {
	try {
		const classification_id = req.params.classificationId;
		const data = await invModel.getInventoryByClassificationId(
			classification_id
		);
		const grid = utilities.buildClassificationGrid(data);
		const nav = await utilities.getNav();
		const classificationName =
			data.length > 0 ? data[0].classification_name : "Unknown";

		res.render("./inventory/classification", {
			title: `${classificationName} Vehicles`,
			nav,
			grid,
			message: req.flash("message") || null, // ✅ Prevent EJS crash
			errors: null,
		});
	} catch (error) {
		next(error);
	}
};

// Controller to process classification form submission
invCont.addClassification = async function (req, res, next) {
	const { classification_name } = req.body;
	const errors = validationResult(req);
	const nav = await utilities.getNav();

	if (!errors.isEmpty()) {
		return res.render("./inventory/add-classification", {
			title: "Add New Classification",
			nav,
			errors: errors.array(),
			classification_name,
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

// Controller to process add vehicle form submission
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
	const message = req.flash("message"); // ✅ Add this line

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
		const classificationList = await utilities.buildClassificationList(
			classification_id
    ); // Optional preselected
    const message = req.flash("message");
		return res.render("./inventory/add-inventory", {
			title: "Add New Vehicle",
			nav,
			classificationList,
			errors: errors.array(),
			vehicle,
			message,
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
