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
 *  Get inventory item by inv_id
 * ************************** */
async function getInventoryById(inv_id) {
	try {
		const result = await pool.query(
			"SELECT * FROM public.inventory WHERE inv_id = $1",
			[inv_id]
		);
		return result.rows[0]; // Returns a single object
	} catch (error) {
		console.error("getInventoryById error:", error);
		throw error;
	}
}

/* ***************************
 *  Get inventory items and classification_name by classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
	try {
		const data = await pool.query(
			`SELECT * FROM public.inventory AS i 
       JOIN public.classification AS c 
       ON i.classification_id = c.classification_id 
       WHERE i.classification_id = $1`,
			[classification_id]
		);
		return data.rows; // Returns an array
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
      RETURNING *;
    `;
		const result = await pool.query(sql, [classification_name]);
		return result.rows[0]; // Returns the inserted row
	} catch (error) {
		console.error("addClassification error:", error);
		throw error;
	}
}

async function addInventory(vehicle) {
	const sql = `
    INSERT INTO inventory (
      classification_id, inv_make, inv_model, inv_description,
      inv_image, inv_thumbnail, inv_price, inv_year,
      inv_miles, inv_color
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
    RETURNING *;
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
    return result.rows[0];
  } catch (error) {
    console.error("addInventory error:", error);
    throw error;
  }
}

module.exports = {
	getClassifications,
	getInventoryByClassificationId,
	getInventoryById,
	addClassification,
	addInventory,
};
