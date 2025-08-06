// utilities/account-validation.js
const regValidate = require("../utilities/account-validation");
const utilities = require(".");
const { body, validationResult } = require("express-validator");
const accountModel = require("../models/account-model");

const validate = {};

// Registration validation rules
validate.registrationRules = () => {
	return [
		// First Name
		body("account_firstname")
			.trim()
			.notEmpty()
			.isLength({ min: 1 })
			.withMessage("First name is required."),

		// Last Name
		body("account_lastname")
			.trim()
			.notEmpty()
			.isLength({ min: 2 })
			.withMessage("Last name is required."),
		


		// valid email is required and cannot already exist in the database
		body("account_email")
			.trim()
			.isEmail()
			.normalizeEmail() // refer to validator.js docs
			.withMessage("A valid email is required.")
			.custom(async (account_email) => {
				const emailExists = await accountModel.checkExistingEmail(
					account_email
				);
				if (emailExists) {
					throw new Error("Email exists. Please log in or use different email");
				}
			}),

		// Password
		body("account_password")
			.trim()
			.notEmpty()
			.isStrongPassword({
				minLength: 12,
				minLowercase: 1,
				minUppercase: 1,
				minNumbers: 1,
				minSymbols: 1,
			})
			.withMessage("Password does not meet requirements."),
	];
};

// Login validation rules
validate.loginRules = () => {
	return [
		body("account_email")
			.trim()
			.isEmail()
			.normalizeEmail()
			.withMessage("A valid email is required."),
		
		body("account_password")
			.trim()
			.notEmpty()
			.withMessage("Password is required."),
	];
};

validate.checkLoginData = async (req, res, next) => {
  let errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    res.render("account/login", {
      errors: errors.array(),
      title: "Login",
      nav,
      account_email: req.body.account_email,
    });
    return;
  }
  next();
};


/* ******************************
 * Check data and return errors or continue to registration
 * ***************************** */
validate.checkRegData = async (req, res, next) => {
	const { account_firstname, account_lastname, account_email } = req.body;
	let errors = [];
	errors = validationResult(req);
	if (!errors.isEmpty()) {
		let nav = await utilities.getNav();
		res.render("account/register", {
			errors: errors.array(),
			title: "Registration",
			nav,
			account_firstname,
			account_lastname,
			account_email,
			message: [], 
		});
		return;
	}
	next();
};

module.exports = validate;
