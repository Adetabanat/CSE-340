const pool = require("../database");

/* **********************
 * Check for existing email
 * ********************* */
async function checkExistingEmail(account_email) {
  try {
    const sql = "SELECT * FROM account WHERE account_email = $1";
    const result = await pool.query(sql, [account_email]);
    return result.rowCount > 0;
  } catch (error) {
    console.error("Error checking existing email:", error);
    throw new Error("Database query failed while checking email.");
  }
}


/* *****************************
* Return account data using email address
* ***************************** */
async function getAccountByEmail (account_email) {
  try {
    const result = await pool.query(
      'SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_password FROM account WHERE account_email = $1',
      [account_email])
    return result.rows[0]
  } catch (error) {
    return new Error("No matching email found")
  }
}


/* **********************
 * Register new account
 * ********************* */
async function accountRegister(firstname, lastname, email, hashedPassword) {
  try {
    const sql = `
      INSERT INTO account (account_firstname, account_lastname, account_email, account_password)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    const result = await pool.query(sql, [firstname, lastname, email, hashedPassword]);
    console.log("✅ New account inserted:", result.rows[0]); // Optional debug
    return result; // Return full result, not boolean
  } catch (error) {
    console.error("Error registering account:", error);
    throw new Error("Account registration failed.");
  }
}


module.exports = {
  checkExistingEmail,
  accountRegister,
  getAccountByEmail,
};
