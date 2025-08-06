const utilities = require("../utilities");
const accountModel = require("../models/account-model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

/* ****************************************
 *  Deliver login view
 * *************************************** */
async function buildLogin(req, res) {
  const nav = await utilities.getNav();
  res.render("account/login", {
    title: "Login",
    nav,
    errors: null,
    message: req.flash("notice"),
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
    message: req.flash("notice"),
    errors: null,
  });
}

/* ****************************************
 *  Process login request
 * *************************************** */
async function accountLogin(req, res) {
  const nav = await utilities.getNav();
  const { account_email, account_password } = req.body;

  const accountData = await accountModel.getAccountByEmail(account_email);

  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.");
    return res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
      message: req.flash("notice"),
    });
  }

  try {
    const isMatch = await bcrypt.compare(account_password, accountData.account_password);
    if (isMatch) {
      delete accountData.account_password;

      const token = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: 3600 * 1000,
      });

      const cookieOptions = {
        httpOnly: true,
        maxAge: 3600 * 1000,
      };
      if (process.env.NODE_ENV !== "development") {
        cookieOptions.secure = true;
      }

      res.cookie("jwt", token, cookieOptions);
      return res.redirect("/account/");
    } else {
      req.flash("notice", "Please check your credentials and try again.");
      return res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
        message: req.flash("notice"),
      });
    }
  } catch (error) {
    console.error("Login error:", error);
    req.flash("notice", "Something went wrong. Please try again.");
    return res.status(500).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
      message: req.flash("notice"),
    });
  }
}

/* ****************************************
 *  Deliver account management view
 * *************************************** */
async function buildAccountManagement(req, res) {
  const nav = await utilities.getNav();
  res.render("account/management", {
    title: "Account Management",
    nav,
    errors: null,
    message: req.flash("notice"),
  });
}

/* ****************************************
 *  Process registration
 * *************************************** */
async function registerAccount(req, res) {
  const nav = await utilities.getNav();
  const { account_firstname, account_lastname, account_email, account_password } = req.body;

  try {
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

    const hashedPassword = await bcrypt.hash(account_password, 10);

    const regResult = await accountModel.accountRegister(
      account_firstname,
      account_lastname,
      account_email,
      hashedPassword
    );

    if (regResult?.rowCount > 0) {
      req.flash("notice", `🎉 Congratulations ${account_firstname}, you're registered! Please log in.`);
      return res.status(201).render("account/login", {
        title: "Login",
        nav,
        message: req.flash("notice"),
        errors:null
      });
    } else {
      req.flash("notice", "Sorry, registration failed. Please try again.");
      return res.status(500).render("account/register", {
        title: "Register",
        nav,
        message: req.flash("notice"),
        errors: null,
      });
    }
  } catch (error) {
    console.error("Registration error:", error);
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
  accountLogin,
  buildAccountManagement,
};
