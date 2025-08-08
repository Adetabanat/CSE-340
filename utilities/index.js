const invModel = require("../models/inventory-model");
const jwt = require("jsonwebtoken")
require("dotenv").config()

const Util = {};

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function () {
  try {
    const data = await invModel.getClassifications(); // Already returns rows
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

/* **************************************
 * Build the detail view HTML 
 ************************************** */
Util.buildDetailView = function (data) {
  return `
    <div class="vehicle-detail">
      <img src="${data.inv_image}" alt="Image of ${data.inv_make} ${data.inv_model}">
      <div class="vehicle-info">
        <h2>${data.inv_make} ${data.inv_model} (${data.inv_year})</h2>
        <h3>$${Number(data.inv_price).toLocaleString()}</h3>
        <p><strong>Mileage:</strong> ${Number(data.inv_miles).toLocaleString()} miles</p>
        <p><strong>Color:</strong> ${data.inv_color}</p>
        <p>${data.inv_description}</p>
      </div>
    </div>
  `;
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

/**
 * Builds a dropdown list of vehicle classifications for forms
 */
Util.buildClassificationList = async function (classification_id = null) {
  let data = await invModel.getClassifications(); // data is an array
  let classificationList =
    '<select name="classification_id" id="classificationList" required>';
  classificationList += "<option value=''>Choose a Classification</option>";
  
  data.forEach((row) => {
    classificationList += `<option value="${row.classification_id}"`;
    if (
      classification_id != null &&
      row.classification_id == classification_id
    ) {
      classificationList += " selected";
    }
    classificationList += `>${row.classification_name}</option>`;
  });

  classificationList += "</select>";
  return classificationList;
}



Util.checkLogin = (req, res, next) => {
  if (req.session && req.session.loggedin) {
    next();
  } else {
    req.flash("message", "Please log in.");
    res.redirect("/account/login");
  }
};



/* ****************************************
 * Middleware For Handling Errors
 * Wrap other functions in this for 
 * General Error Handling
 **************************************** */
/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for 
 * General Error Handling
 **************************************** */
Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

/* ****************************************
* Middleware to check token validity
**************************************** */
Util.checkJWTToken = (req, res, next) => {
 if (req.cookies.jwt) {
  jwt.verify(
   req.cookies.jwt,
   process.env.ACCESS_TOKEN_SECRET,
   function (err, accountData) {
    if (err) {
     req.flash("Please log in")
     res.clearCookie("jwt")
     return res.redirect("/account/login")
    }
    res.locals.accountData = accountData
    res.locals.loggedin = 1
    next()
   })
 } else {
  next()
 }
}


module.exports = Util;
