const pool = require("../database");

/* **********************
 *   Check for existing email
 * ********************* */
async function checkExistingEmail(account_email) {
  try {
    const sql = "SELECT 1 FROM account WHERE account_email = $1";
    const result = await pool.query(sql, [account_email]);
    return result.rowCount > 0; // return true if email exists
  } catch (error) {
    console.error("Error checking existing email:", error);
    throw new Error("Database error checking email.");
  }
}

/* *****************************
 * Return account data using email
 * ***************************** */
async function getAccountByEmail(account_email) {
  try {
    const sql = `
      SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_password
      FROM account WHERE account_email = $1
    `;
    const result = await pool.query(sql, [account_email]);
    return result.rows[0];
  } catch (error) {
    console.error("Error getting account by email:", error);
    throw new Error("Database error getting account.");
  }
}

/* *****************************
*   Register new account
* *************************** */
async function registerAccount(account_firstname, account_lastname, account_email, account_password) {
  try {
    const sql = `
      INSERT INTO account (account_firstname, account_lastname, account_email, account_password, account_type)
      VALUES ($1, $2, $3, $4, 'Client')
      RETURNING *
    `;
    const result = await pool.query(sql, [account_firstname, account_lastname, account_email, account_password]);
    return result.rows[0]; // return the newly created account row
  } catch (error) {
    console.error("Error registering account:", error);
    throw new Error("Database error registering account.");
  }
}

/* *****************************
 * Update account info
 * ***************************** */
async function updateAccount({ account_id, account_firstname, account_lastname, account_email, account_password }) {
  try {
    // Base SQL for update
    let sql = `
      UPDATE account
      SET account_firstname = $1,
          account_lastname = $2,
          account_email = $3
    `;
    const params = [account_firstname, account_lastname, account_email];
    let paramIndex = 4;

    if (account_password) {
      sql += `, account_password = $${paramIndex}`;
      params.push(account_password);
      paramIndex++;
    }

    sql += ` WHERE account_id = $${paramIndex} RETURNING *`;
    params.push(account_id);

    const result = await pool.query(sql, params);
    return result.rows[0]; // return updated account
  } catch (error) {
    console.error("Error updating account:", error);
    throw new Error("Database error updating account.");
  }
}

/* *****************************
 * Get account by ID
 * ***************************** */
async function getAccountById(account_id) {
  try {
    const sql = `
      SELECT account_id, account_firstname, account_lastname, account_email, account_type
      FROM account WHERE account_id = $1
    `;
    const result = await pool.query(sql, [account_id]);
    return result.rows[0];
  } catch (error) {
    console.error("Error getting account by ID:", error);
    throw new Error("Database error getting account by ID.");
  }
}

/* *****************************
 * Update password only
 * ***************************** */
async function updatePassword(account_id, hashedPassword) {
  try {
    const sql = `UPDATE account SET account_password = $1 WHERE account_id = $2 RETURNING *`;
    const result = await pool.query(sql, [hashedPassword, account_id]);
    return result.rows[0]; // return updated account
  } catch (error) {
    console.error("Error updating password:", error);
    throw new Error("Database error updating password.");
  }
}

module.exports = {
  checkExistingEmail,
  registerAccount,
  getAccountByEmail,
  updateAccount,
  getAccountById,
  updatePassword,
};
