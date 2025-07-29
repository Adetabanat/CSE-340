const utilities = require("../utilities");
const accountModel = require("../models/account-model");
const bcrypt = require("bcryptjs");

/* ****************************************
 *  Deliver login view
 * *************************************** */
async function buildLogin(req, res) {
  const nav = await utilities.getNav();
  res.render("account/login", {
    title: "Login",
    nav,
  });
}

/* ****************************************
 *  Deliver registration view
 * *************************************** */
async function buildRegister(req, res) {
  const nav = await utilities.getNav();
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null,
  });
}

/* ****************************************
 *  Process registration
 * *************************************** */
async function registerAccount(req, res) {
  const { account_firstname, account_lastname, account_email, account_password } = req.body;
  const nav = await utilities.getNav();

  // Check if email already exists
  const emailExists = await accountModel.checkExistingEmail(account_email);
  if (emailExists) {
    req.flash("notice", "Email already exists. Please use a different one.");
    return res.status(400).render("account/register", {
      title: "Register",
      nav,
      errors: null,
    });
  }

  // Hash the password
  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(account_password, 10);
  } catch (error) {
    console.error("Password hashing failed:", error);
    req.flash("notice", "There was an error processing your registration.");
    return res.status(500).render("account/register", {
      title: "Register",
      nav,
      errors: null,
    });
  }

  // Register the account
  const regResult = await accountModel.accountRegister(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  );

  if (regResult) {
    req.flash("notice", `Congratulations, you're registered ${account_firstname}. Please log in.`);
    return res.status(201).render("account/login", {
      title: "Login",
      nav,
    });
  } else {
    req.flash("notice", "Sorry, the registration failed.");
    return res.status(500).render("account/register", {
      title: "Register",
      nav,
      errors: null,
    });
  }
}

module.exports = {
  buildLogin,
  buildRegister,
  registerAccount,
};
