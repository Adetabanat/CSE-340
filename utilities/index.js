const invModel = require("../models/inventory-model");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const Util = {};

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function () {
  try {
    const data = await invModel.getClassifications(); // returns array
    let list = "<ul>";
    list += '<li><a href="/" title="Home page">Home</a></li>';
    data.forEach((row) => {
      list += `<li>
        <a href="/inv/type/${row.classification_id}" title="See our inventory of ${row.classification_name} vehicles">
          ${row.classification_name}
        </a>
      </li>`;
    });
    list += "</ul>";
    return list;
  } catch (err) {
    console.error("Error building nav:", err);
    return "<ul><li><a href='/' title='Home page'>Home</a></li></ul>"; // fallback nav
  }
};

Util.buildClassificationList = async function (selectedClassificationId = null) {
  const data = await invModel.getClassifications();
  let classificationList = '<select name="classification_id" id="classificationList" required>';
  classificationList += "<option value=''>Choose a Classification</option>";

  data.forEach((row) => {
    classificationList += `<option value="${row.classification_id}"`;
    if (selectedClassificationId == row.classification_id) {
      classificationList += " selected";
    }
    classificationList += `>${row.classification_name}</option>`;
  });

  classificationList += "</select>";
  return classificationList;
};

/* **************************************
 * Middleware to check token validity
 ************************************** */
Util.checkJWTToken = (req, res, next) => {
  if (req.cookies.jwt) {
    jwt.verify(
      req.cookies.jwt,
      process.env.ACCESS_TOKEN_SECRET,
      function (err, accountData) {
        if (err) {
          req.flash("notice", "Please log in");
          res.clearCookie("jwt");
          return res.redirect("/account/login");
        }
        res.locals.accountData = accountData;
        res.locals.loggedin = true;
        // Ensure these keys match your token payload exactly
        res.locals.clientFirstname = accountData.account_firstname; 
        res.locals.account_type = accountData.account_type;
        res.locals.clientId = accountData.account_id;
        next();
      }
    );
  } else {
    next();
  }
};

/* ****************************************
 * Middleware For Handling Errors
 **************************************** */
Util.handleErrors = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

/* ****************************************
 * Middleware to check if logged in
 **************************************** */
Util.checkLogin = (req, res, next) => {
  if (res.locals.loggedin) {
    return next();
  }
  req.flash("notice", "Please log in to access this page.");

  Util.getNav()
    .then((nav) => {
      res.status(403).render("account/login", {
        title: "Login",
        nav,
        message: req.flash("notice"),
        errors: null,
      });
    })
    .catch((err) => next(err));
};

/* ****************************************
 * Middleware to check if user is Employee or Admin
 **************************************** */
Util.checkEmployeeOrAdmin = async (req, res, next) => {
  if (
    res.locals.loggedin &&
    (res.locals.account_type === "Employee" || res.locals.account_type === "Admin")
  ) {
    return next();
  }

  req.flash("notice", "You must be logged in as an employee or admin to access that page.");

  const nav = await Util.getNav();

  return res.status(403).render("account/login", {
    title: "Login",
    nav,
    message: req.flash("notice"),
    errors: null,
  });
};

/* **************************************
 * Build the classification view HTML
 ************************************** */
Util.buildClassificationGrid = function (data) {
  let grid = "";

  if (data.length > 0) {
    grid = '<ul id="inv-display">';
    data.forEach((vehicle) => {
      grid += `<li>
        <a href="/inv/detail/${vehicle.inv_id}" title="View ${vehicle.inv_make} ${vehicle.inv_model} details">
          <img src="${vehicle.inv_thumbnail}" alt="Image of ${vehicle.inv_make} ${vehicle.inv_model} on CSE Motors" />
        </a>
        <div class="namePrice">
          <hr />
          <h2>
            <a href="/inv/detail/${vehicle.inv_id}" title="View ${vehicle.inv_make} ${vehicle.inv_model} details">
              ${vehicle.inv_make} ${vehicle.inv_model}
            </a>
          </h2>
          <span>$${new Intl.NumberFormat("en-US").format(vehicle.inv_price)}</span>
        </div>
      </li>`;
    });
    grid += "</ul>";
  } else {
    grid = '<p class="notice">Sorry, no matching vehicles could be found.</p>';
  }

  return grid;
};

/* **************************************
 * Build the detailed vehicle view HTML
 ************************************** */
Util.buildDetailView = function (item) {
  if (!item) return '<p class="notice">Vehicle details not available.</p>';

  return `
    <div class="vehicle-detail">
      <h2>${item.inv_make} ${item.inv_model}</h2>
      <img src="${item.inv_image}" alt="Image of ${item.inv_make} ${item.inv_model}" />
      <p>${item.inv_description}</p>
      <ul>
        <li><strong>Year:</strong> ${item.inv_year}</li>
        <li><strong>Price:</strong> $${new Intl.NumberFormat('en-US').format(item.inv_price)}</li>
        <li><strong>Miles:</strong> ${new Intl.NumberFormat('en-US').format(item.inv_miles)}</li>
        <li><strong>Color:</strong> ${item.inv_color}</li>
        <li><strong>Classification:</strong> ${item.classification_name}</li>
      </ul>
    </div>
  `;
};


module.exports = Util;
