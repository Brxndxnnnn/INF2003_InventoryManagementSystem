import pool from '../db.js';

export const getAllShops = async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT * FROM shop");
        res.status(200).json(rows);
    } 
    catch (err) {
        console.error("Error fetching shops:", err);
        res.status(500).json({ message: err.message });
    }
};

export const getShopsByUserId = async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await pool.query("SELECT * FROM shop WHERE user_id = ?", [id]);
        res.status(200).json(rows);
    } 
    catch (err) {
        console.error(`Error fetching shops for user ${id}:`, err);
        res.status(500).json({ message: err.message });
    }
};

export const getShopById = async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await pool.query("SELECT * FROM shop WHERE shop_id = ?", [id]);
        res.status(200).json(rows[0]);
    } 
    catch (err) {
        console.error(`Error fetching shops for user ${id}:`, err);
        res.status(500).json({ message: err.message });
    }
};

export const createShop = async (req, res) => {
    const { user_id, shop_name, shop_address, shop_contact_number, shop_email, shop_uen } = req.body;

    try {
    // Check if user exists (foreign key validation)
    const [user] = await pool.query("SELECT * FROM user WHERE user_id = ?", [user_id]);
    if (user.length === 0) {
        return res.status(404).json({ message: "User not found." });
    }

    // Insert into db
    await pool.query(
        `INSERT INTO shop (
        user_id, shop_name, shop_address, shop_contact_number, 
        shop_email, shop_uen, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [user_id, shop_name, shop_address || null, shop_contact_number || null, shop_email || null, shop_uen || null]
    );

    res.status(201).json({ message: "Shop created successfully." });
    } 
    catch (err) {
    res.status(500).json({ message: err.message });
    }
};

export const updateShop = async (req, res) => {
  const { id } = req.params;
  const { shop_name, shop_address, shop_contact_number, shop_email, shop_uen } = req.body;

  // Backend validation
  if (!shop_name && !shop_address && !shop_contact_number && !shop_email && !shop_uen) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    // Check if shop exists
    const [shop] = await pool.query("SELECT * FROM shop WHERE shop_id = ?", [id]);
    if (shop.length === 0) {
      return res.status(404).json({ message: "Shop not found." });
    }

    // Update query (coalesce to keep existing values if not provided)
    await pool.query(
      `UPDATE shop
       SET 
         shop_name = COALESCE(?, shop_name),
         shop_address = COALESCE(?, shop_address),
         shop_contact_number = COALESCE(?, shop_contact_number),
         shop_email = COALESCE(?, shop_email),
         shop_uen = COALESCE(?, shop_uen),
         updated_at = NOW()
       WHERE shop_id = ?`,
      [shop_name, shop_address, shop_contact_number, shop_email, shop_uen, id]
    );

    res.status(200).json({ message: "Shop updated successfully." });
  } 
  catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteShop = async (req, res) => {
  const { id } = req.params;

  try {
    // Check if shop exists
    const [shop] = await pool.query("SELECT * FROM shop WHERE shop_id = ?", [id]);
    if (shop.length === 0) {
      return res.status(404).json({ message: "Shop not found." });
    }

    // Delete record
    await pool.query("DELETE FROM shop WHERE shop_id = ?", [id]);

    res.status(200).json({ message: "Shop deleted successfully." });
  } 
  catch (err) {
    console.error(`Error deleting shop with ID ${id}:`, err);
    res.status(500).json({ message: err.message });
  }
};

