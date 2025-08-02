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
  console.log("➡️ Register handler hit");

  let nav;
  try {
    nav = await utilities.getNav();
  } catch (e) {
    console.error("❌ Error getting navigation:", e);
    nav = [];
  }

  const { account_firstname, account_lastname, account_email, account_password } = req.body;
  console.log("📥 Request body:", req.body);

  try {
    const emailExists = await accountModel.checkExistingEmail(account_email);
    if (emailExists) {
      console.warn("⚠️ Email already exists:", account_email);
      req.flash("notice", "Email already exists. Please use a different one.");
      return res.status(400).render("account/register", {
        title: "Register",
        nav,
        message: req.flash("notice"),
        errors: null,
      });
    }

    const hashedPassword = await bcrypt.hash(account_password, 10);
    console.log("🔐 Hashed password created");

    const regResult = await accountModel.accountRegister(
      account_firstname,
      account_lastname,
      account_email,
      hashedPassword
    );

    console.log("🧾 Registration result:", regResult);

    if (regResult?.rowCount > 0) {
      req.flash("notice", `🎉 Congratulations ${account_firstname}, you're registered! Please log in.`);
      return res.status(201).render("account/login", {
        title: "Login",
        nav,
        message: req.flash("notice"),
      });
    } else {
      console.error("❌ Registration failed: no rows inserted");
      req.flash("notice", "Sorry, registration failed. Please try again.");
      return res.status(500).render("account/register", {
        title: "Register",
        nav,
        message: req.flash("notice"),
        errors: null,
      });
    }

  } catch (error) {
    console.error("💥 Registration error:", error);
    req.flash("notice", "There was an unexpected error during registration.");
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
 