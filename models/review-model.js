const pool = require("../database");

/**
 * Add a new review
 * @param {number} inv_id - vehicle id
 * @param {number} account_id - user id
 * @param {number} rating - 1 to 5
 * @param {string} comment - review text
 * @returns inserted review row
 */
async function addReview(inv_id, account_id, rating, comment) {
  try {
    const sql = `
      INSERT INTO reviews (inv_id, account_id, rating, comment)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const result = await pool.query(sql, [inv_id, account_id, rating, comment]);
    return result.rows[0];
  } catch (error) {
    console.error("Error adding review:", error);
    throw new Error("Database error adding review.");
  }
}

/**
 * Get all reviews for a vehicle
 * @param {number} inv_id - vehicle id
 * @returns array of reviews with user info
 */
async function getReviewsByInventory(inv_id) {
  try {
    const sql = `
      SELECT r.review_id, r.rating, r.comment, r.created_at,
             a.account_firstname, a.account_lastname
      FROM reviews r
      JOIN account a ON r.account_id = a.account_id
      WHERE r.inv_id = $1
      ORDER BY r.created_at DESC
    `;
    const result = await pool.query(sql, [inv_id]);
    return result.rows;
  } catch (error) {
    console.error("Error getting reviews:", error);
    throw new Error("Database error fetching reviews.");
  }
}

module.exports = {
  addReview,
  getReviewsByInventory,
};
