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
    return result.rowCount > 0;
  } catch (error) {
    console.error("Error registering account:", error);
    throw new Error("Account registration failed.");
  }
}

module.exports = {
  checkExistingEmail,
  accountRegister,
};
