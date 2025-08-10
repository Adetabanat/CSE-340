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
  const messages = req.flash("notice") || [];
  res.render("account/login", {
    title: "Login",
    nav,
    message: messages,
    errors: [],
  });
}

/* ****************************************
 *  Deliver registration view
 * *************************************** */
async function buildRegister(req, res) {
  const nav = await utilities.getNav();
  const messages = req.flash("notice") || [];
  res.render("account/register", {
    title: "Register",
    nav,
    message: messages,
    errors: [],
  });
}

/* ****************************************
 *  Process login request
 * *************************************** */
async function accountLogin(req, res) {
  const nav = await utilities.getNav();
  const account_email = req.body.account_email?.trim();
  const account_password = req.body.account_password;

  if (!account_email || !account_password) {
    req.flash("notice", "Email and password are required.");
    return res.status(400).render("account/login", {
      title: "Login",
      nav,
      account_email,
      errors: [],
      message: req.flash("notice") || [],
    });
  }

  const accountData = await accountModel.getAccountByEmail(account_email);

  if (!accountData) {
    req.flash("notice", "Invalid email or password.");
    return res.status(400).render("account/login", {
      title: "Login",
      nav,
      account_email,
      errors: [],
      message: req.flash("notice") || [],
    });
  }

  try {
    const isMatch = await bcrypt.compare(account_password, accountData.account_password);
    if (isMatch) {
      delete accountData.account_password;

      const tokenPayload = {
        account_id: accountData.account_id,
        account_type: accountData.account_type,
        account_firstname: accountData.account_firstname,
      };

      const token = jwt.sign(tokenPayload, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1h",
      });

      const cookieOptions = {
        httpOnly: true,
        maxAge: 3600000,
        secure: process.env.NODE_ENV !== "development",
      };

      res.cookie("jwt", token, cookieOptions);
      return res.redirect("/account/");
    } else {
      req.flash("notice", "Invalid email or password.");
      return res.status(400).render("account/login", {
        title: "Login",
        nav,
        account_email,
        errors: [],
        message: req.flash("notice") || [],
      });
    }
  } catch (error) {
    console.error("Login error:", error);
    req.flash("notice", "Login failed due to a server error.");
    return res.status(500).render("account/login", {
      title: "Login",
      nav,
      account_email,
      errors: [],
      message: req.flash("notice") || [],
    });
  }
}

/* ****************************************
 *  Process Registration
 * *************************************** */
async function registerAccount(req, res) {
  const nav = await utilities.getNav();
  const { account_firstname, account_lastname, account_email, account_password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(account_password, 10);

    const regResult = await accountModel.registerAccount(
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
        message: req.flash("notice") || [],
        errors: [],
      });
    } else {
      req.flash("notice", "Sorry, the registration failed.");
      return res.status(400).render("account/register", {
        title: "Register",
        nav,
        message: req.flash("notice") || [],
        errors: [],
      });
    }
  } catch (error) {
    console.error("Registration error:", error);
    req.flash("notice", "Sorry, there was an error processing the registration.");
    return res.status(500).render("account/register", {
      title: "Register",
      nav,
      message: req.flash("notice") || [],
      errors: [],
    });
  }
}

/* ****************************************
 *  Logout user
 * *************************************** */
async function logout(req, res) {
  res.clearCookie("jwt");
  if (req.session) {
    req.session.destroy(() => {
      res.redirect("/");
    });
  } else {
    res.redirect("/");
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
    message: req.flash("notice") || [],
    errors: [],
    loggedin: res.locals.loggedin,
    clientFirstname: res.locals.clientFirstname,
    account_type: res.locals.account_type,
    clientId: res.locals.clientId,
  });
}

/* ****************************************
 * Deliver account update view
 * *************************************** */
async function buildUpdateView(req, res) {
  const nav = await utilities.getNav();
  const account_id = res.locals.clientId || req.body.account_id;

  try {
    const accountData = await accountModel.getAccountById(account_id);
    if (!accountData) {
      req.flash("notice", "Account not found.");
      return res.redirect("/account/");
    }

    res.render("account/update", {
      title: "Update Account",
      nav,
      message: req.flash("notice") || [],
      errors: [],
      clientId: accountData.account_id,
      account_firstname: accountData.account_firstname,
      account_lastname: accountData.account_lastname,
      account_email: accountData.account_email,
    });
  } catch (error) {
    console.error(error);
    req.flash("notice", "Server error loading update page.");
    return res.redirect("/account/");
  }
}

/* ****************************************
 * Process account update (with optional password change)
 * *************************************** */
async function updateAccount(req, res) {
  const nav = await utilities.getNav();
  const account_id = req.params.id; // get ID from URL param
  const { account_firstname, account_lastname, account_email, account_password } = req.body;

  try {
    let updateData = {
      account_id,
      account_firstname,
      account_lastname,
      account_email,
    };

    if (account_password) {
      updateData.account_password = await bcrypt.hash(account_password, 10);
    }

    const updateResult = await accountModel.updateAccount(updateData);

    if (updateResult) {
      const updatedAccount = await accountModel.getAccountById(account_id);

      req.flash("notice", "Account updated successfully.");
      return res.render("account/management", {
        title: "Account Management",
        nav,
        message: req.flash("notice") || [],
        errors: [],
        loggedin: true,
        clientFirstname: updatedAccount.account_firstname,
        account_type: updatedAccount.account_type,
        clientId: updatedAccount.account_id,
      });
    } else {
      req.flash("notice", "Account update failed.");
      return res.status(400).render("account/update", {
        title: "Update Account",
        nav,
        message: req.flash("notice") || [],
        errors: [],
        account_firstname,
        account_lastname,
        account_email,
        clientId: account_id,
      });
    }
  } catch (error) {
    console.error("Account update error:", error);
    req.flash("notice", "Server error during account update.");
    return res.status(500).render("account/update", {
      title: "Update Account",
      nav,
      message: req.flash("notice") || [],
      errors: [],
      account_firstname,
      account_lastname,
      account_email,
      clientId: account_id,
    });
  }
}

/* ****************************************
 * Process password change only
 * *************************************** */
async function updatePassword(req, res) {
  const nav = await utilities.getNav();
  const { account_id, account_password } = req.body;

  if (!account_password) {
    req.flash("notice", "Password is required.");
    return res.redirect("/account/update");
  }

  try {
    const hashedPassword = await bcrypt.hash(account_password, 10);
    const updateResult = await accountModel.updatePassword(account_id, hashedPassword);

    if (updateResult) {
      req.flash("notice", "Password updated successfully.");
      const updatedAccount = await accountModel.getAccountById(account_id);
      return res.render("account/management", {
        title: "Account Management",
        nav,
        message: req.flash("notice") || [],
        errors: [],
        loggedin: true,
        clientFirstname: updatedAccount.account_firstname,
        account_type: updatedAccount.account_type,
        clientId: updatedAccount.account_id,
      });
    } else {
      req.flash("notice", "Password update failed.");
      return res.status(400).render("account/update", {
        title: "Update Account",
        nav,
        message: req.flash("notice") || [],
        errors: [],
        clientId: account_id,
      });
    }
  } catch (error) {
    console.error("Password update error:", error);
    req.flash("notice", "Server error during password update.");
    return res.status(500).render("account/update", {
      title: "Update Account",
      nav,
      message: req.flash("notice") || [],
      errors: [],
      clientId: account_id,
    });
  }
}

module.exports = {
  buildLogin,
  buildRegister,
  registerAccount,
  accountLogin,
  buildAccountManagement,
  logout,
  buildUpdateView,
  updateAccount,
  updatePassword
};
