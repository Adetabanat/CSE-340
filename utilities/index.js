const invModel = require("../models/inventory-model");

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

module.exports = Util;
