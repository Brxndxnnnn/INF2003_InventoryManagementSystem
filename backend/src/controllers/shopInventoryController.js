import pool from '../db.js';

// Get all shop inventory records
export const getAllShopInventory = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM shop_inventory");
    res.status(200).json(rows);
  } 
  catch (err) {
    console.error("Error fetching shop inventory:", err);
    res.status(500).json({ message: err.message });
  }
};

// Get shop inventory records by shop id
export const getShopInventoryByShop = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query(`
      SELECT si.*, p.product_name, p.description FROM shop_inventory si
      LEFT JOIN product p ON si.product_id = p.product_id
      WHERE shop_id = ?;
    `, [id]);
    res.status(200).json(rows);
  } 
  catch (err) {
    console.error(`Error fetching shop inventory with shop ID ${id}:`, err);
    res.status(500).json({ message: err.message });
  }
};

// Update shop inventory
export const updateShopInventory = async (req, res) => {
  const { id } = req.params;
  const { shop_id, product_id, current_stock, reorder_level, max_stock_level } = req.body;
  try {
    const [record] = await pool.query("SELECT * FROM shop_inventory WHERE shop_inventory_id = ?", [id]);
    if (record.length === 0) {
      return res.status(404).json({ message: "Shop inventory record not found." });
    }

    await pool.query(
      `UPDATE shop_inventory
       SET 
         shop_id = COALESCE(?, shop_id),
         product_id = COALESCE(?, product_id),
         current_stock = COALESCE(?, current_stock),
         reorder_level = COALESCE(?, reorder_level),
         max_stock_level = COALESCE(?, max_stock_level),
         updated_at = NOW()
       WHERE shop_inventory_id = ?`,
      [shop_id, product_id, current_stock, reorder_level, max_stock_level, id]
    );

    res.status(200).json({ message: "Shop inventory record updated successfully." });
  } 
  catch (err) {
    console.error(`Error updating shop inventory with ID ${id}:`, err);
    res.status(500).json({ message: err.sqlMessage });
  }
};

// Delete shop inventory
export const deleteShopInventory = async (req, res) => {
  const { id } = req.params;

  try {
    const [record] = await pool.query("SELECT * FROM shop_inventory WHERE shop_inventory_id = ?", [id]);
    if (record.length === 0) {
      return res.status(404).json({ message: "Shop inventory record not found." });
    }

    await pool.query("DELETE FROM shop_inventory WHERE shop_inventory_id = ?", [id]);

    res.status(200).json({ message: "Shop inventory record deleted successfully." });
  } 
  catch (err) {
    console.error(`Error deleting shop inventory with ID ${id}:`, err);
    res.status(500).json({ message: err.message });
  }
};
