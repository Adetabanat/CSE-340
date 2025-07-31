const utilities = require("../utilities");
const accountModel = require("../models/account-model");
const bcrypt = require("bcryptjs");

/* ****************************************
 *  Deliver login view
 * *************************************** */
async function buildLogin(req, res) {
  const nav = await utilities.getNav();
  const message = req.flash("notice");
  res.render("account/login", {
    title: "Login",
    nav,
    message,
  });
}

/* ****************************************
 *  Deliver registration view
 * *************************************** */
async function buildRegister(req, res) {
  const nav = await utilities.getNav();
  const message = req.flash("notice");
  res.render("account/register", {
    title: "Register",
    nav,
    message,
    errors: null,
  });
}

/* ****************************************
 *  Process registration
 * *************************************** */
async function registerAccount(req, res) {
  const { account_firstname, account_lastname, account_email, account_password } = req.body;
  const nav = await utilities.getNav();

  const emailExists = await accountModel.checkExistingEmail(account_email);
  if (emailExists) {
    req.flash("notice", "Email already exists. Please use a different one.");
    return res.status(400).render("account/register", {
      title: "Register",
      nav,
      message: req.flash("notice"),
      errors: null,
    });
  }

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(account_password, 10);
  } catch (error) {
    console.error("Password hashing failed:", error);
    req.flash("notice", "There was an error processing your registration.");
    return res.status(500).render("account/register", {
      title: "Register",
      nav,
      message: req.flash("notice"),
      errors: null,
    });
  }

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
      message: req.flash("notice"),
    });
  } else {
    req.flash("notice", "Sorry, the registration failed.");
    return res.status(500).render("account/register", {
      title: "Register",
      nav,
      message: req.flash("notice"),
      errors: null,
    });
  }
}

module.exports = {
  buildLogin,
  buildRegister,
  registerAccount,
};
