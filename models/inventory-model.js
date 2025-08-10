const pool = require("../database");

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications() {
  try {
    const result = await pool.query(
      "SELECT * FROM public.classification ORDER BY classification_name"
    );
    return result.rows;
  } catch (error) {
    console.error("getClassifications error:", error);
    throw error;
  }
}

/* ***************************
 *  Get inventory item by inv_id with classification info
 * ************************** */
async function getVehicleById(inv_id) {
  try {
    const sql = `
      SELECT i.*, c.classification_name
      FROM public.inventory AS i
      JOIN public.classification AS c
        ON i.classification_id = c.classification_id
      WHERE i.inv_id = $1
    `;
    const result = await pool.query(sql, [inv_id]);
    return result.rows[0]; // single vehicle object with classification_name
  } catch (error) {
    console.error("getVehicleById error:", error);
    throw error;
  }
}

/* ***************************
 *  Get inventory items and classification_name by classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
  try {
    const sql = `
      SELECT i.*, c.classification_name 
      FROM public.inventory AS i 
      JOIN public.classification AS c 
        ON i.classification_id = c.classification_id 
      WHERE i.classification_id = $1
      ORDER BY i.inv_make, i.inv_model
    `;
    const result = await pool.query(sql, [classification_id]);
    return result.rows; // array of vehicles
  } catch (error) {
    console.error("getInventoryByClassificationId error:", error);
    throw error;
  }
}

/* ***************************
 *  Add a new classification
 * ************************** */
async function addClassification(classification_name) {
  try {
    const sql = `
      INSERT INTO public.classification (classification_name)
      VALUES ($1)
      RETURNING *
    `;
    const result = await pool.query(sql, [classification_name]);
    return result.rows[0]; // newly inserted classification
  } catch (error) {
    console.error("addClassification error:", error);
    throw error;
  }
}

/* ***************************
 *  Add a new inventory item
 * ************************** */
async function addInventory(vehicle) {
  const sql = `
    INSERT INTO public.inventory (
      classification_id, inv_make, inv_model, inv_description,
      inv_image, inv_thumbnail, inv_price, inv_year,
      inv_miles, inv_color
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
    RETURNING *
  `;
  const values = [
    vehicle.classification_id,
    vehicle.inv_make,
    vehicle.inv_model,
    vehicle.inv_description,
    vehicle.inv_image,
    vehicle.inv_thumbnail,
    vehicle.inv_price,
    vehicle.inv_year,
    vehicle.inv_miles,
    vehicle.inv_color,
  ];

  try {
    const result = await pool.query(sql, values);
    return result.rows[0]; // newly added vehicle
  } catch (error) {
    console.error("addInventory error:", error);
    throw error;
  }
}

/* ***************************
 *  Delete Inventory Item by inv_id
 * ************************** */
async function deleteInventoryById(inv_id) {
  try {
    const sql = `DELETE FROM public.inventory WHERE inv_id = $1`;
    const result = await pool.query(sql, [inv_id]);
    return result.rowCount > 0; // return true if deleted
  } catch (error) {
    console.error("deleteInventoryById error:", error);
    throw error;
  }
}

/* ***************************
 *  Update Inventory Item by inv_id
 * ************************** */
async function updateInventory(
  inv_id,
  inv_make,
  inv_model,
  inv_description,
  inv_image,
  inv_thumbnail,
  inv_price,
  inv_year,
  inv_miles,
  inv_color,
  classification_id
) {
  try {
    const sql = `
      UPDATE public.inventory
      SET inv_make = $1,
          inv_model = $2,
          inv_description = $3,
          inv_image = $4,
          inv_thumbnail = $5,
          inv_price = $6,
          inv_year = $7,
          inv_miles = $8,
          inv_color = $9,
          classification_id = $10
      WHERE inv_id = $11
      RETURNING *
    `;
    const values = [
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_miles,
      inv_color,
      classification_id,
      inv_id,
    ];
    const result = await pool.query(sql, values);
    return result.rows[0]; // updated vehicle
  } catch (error) {
    console.error("updateInventory error:", error);
    throw error;
  }
}

module.exports = {
  getClassifications,
  getInventoryByClassificationId,
  getVehicleById,
  addClassification,
  addInventory,
  deleteInventoryById,
  updateInventory,
};
