const utilities = require("../utilities");
const accountModel = require("../models/account-model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

/* ****************************************
 *  Deliver login view
 * *************************************** */
async function buildLogin(req, res, next) {
	let nav = await utilities.getNav();
	const messages = req.flash("notice");
	res.render("account/login", {
		title: "Login",
		nav,
		message: messages,
		errors: null,
	});
}

/* ****************************************
 *  Deliver registration view
 * *************************************** */
async function buildRegister(req, res) {
	const nav = await utilities.getNav();
	const messages = req.flash("notice");
	res.render("account/register", {
		title: "Register",
		nav,
		message: messages,
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
		req.flash("notice", "Invalid email or password.");
		return res.status(400).render("account/login", {
			title: "Login",
			nav,
			account_email,
			errors: null,
			message: req.flash("notice"),
		}); 
	}

	try {
		const isMatch = await bcrypt.compare(
			account_password,
			accountData.account_password
		);
		if (isMatch) {
			delete accountData.account_password;

			const token = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, {
				expiresIn: "1h", // Use human-readable duration
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
				errors: null,
				message: req.flash("notice"),
			});
		}
	} catch (error) {
		console.error("Login error:", error);
		req.flash("notice", "Login failed due to a server error.");
		return res.status(500).render("account/login", {
			title: "Login",
			nav,
			account_email,
			errors: null,
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
		message: req.flash("notice"),
		errors: null,
	});
}
/* ****************************************
 *  Process Registration
 * *************************************** */
async function registerAccount(req, res) {
	let nav = await utilities.getNav();
	const {
		account_firstname,
		account_lastname,
		account_email,
		account_password,
  } = req.body;
  
  // Hash the password before storing
  let hashedPassword
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the registration.')
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    })
  }

	const regResult = await accountModel.registerAccount(
		account_firstname,
		account_lastname,
		account_email,
		hashedPassword
	);

	if (regResult) {
		req.flash(
			"notice",
			`Congratulations, you're registered ${account_firstname}. Please log in.`
		);
		res.status(201).render("account/login", {
			title: "Login",
			nav,
			message: req.flash("notice"),
			errors: [],
		});
	} else {
		req.flash("notice", "Sorry, the registration failed.");
		res.status(501).render("account/register", {
			title: "Registration",
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
