import pool from "../db.js";

// Get inventory value by category
// Based on user id, we get the related shops, and its shop inventory
// Then we group by category
// Returns shop_name, category_name & total price in a new column called total_value
// ADDED VIEWS inventory_value_by_category_v to simplify the query
export const getInventoryValueByCategory = async (req, res) => {
  const { id } = req.params;
  const { shops } = req.query;

  const shopIds = shops ? shops.split(",") : [];

  try {
    let sql = `
      SELECT *
      FROM inventory_value_by_category_v
      WHERE user_id = ?
    `;

    const params = [id];

    if (shopIds.length > 0) {
      sql += ` AND shop_id IN (${shopIds.map(() => "?").join(",")})`;
      params.push(...shopIds);
    }

    const [rows] = await pool.query(sql, params);
    res.status(200).json(rows);
  } catch (err) {
    console.error("Error querying inventory_value_by_category_v:", err);
    res.status(500).json({ message: "Server error retrieving inventory values." });
  }
};



// Get monthly orders
// Based on user id,
// We get all the shop orders
// We create a new month column based on the created_at in the order
// Then group by shop name and month
// ADDED VIEWS monthly_orders_v to simplify
export const getMonthlyOrders = async (req, res) => {
  const { id } = req.params;
  const { shops } = req.query;

  const shopIds = shops ? shops.split(",") : [];

  try {
    let sql = `
      SELECT *
      FROM monthly_orders_v
      WHERE user_id = ?
    `;

    const params = [id];

    if (shopIds.length > 0) {
      sql += ` AND shop_id IN (${shopIds.map(() => "?").join(",")})`;
      params.push(...shopIds);
    }

    sql += " ORDER BY month ASC";

    const [rows] = await pool.query(sql, params);
    res.status(200).json(rows);
  } catch (err) {
    console.error("Error querying monthly_orders_v:", err);
    res.status(500).json({ message: "Server error retrieving monthly orders." });
  }
};


// Get low stock products
// based on user id, retrieve all related shops and their inventory
// Then find products whose current_stock is below their minimum order quantity
// Return shop_name, product_name, current_stock, min_order_quantity, and a new column called stock status
// ADDED VIEWS low_stock_v to simplify the query
export const getLowStockProducts = async (req, res) => {
  const { id } = req.params;
  const { shops } = req.query;

  const shopIds = shops ? shops.split(",") : [];

  try {
    let sql = `
      SELECT *
      FROM low_stock_v
      WHERE user_id = ?
    `;

    const params = [id];

    if (shopIds.length > 0) {
      sql += ` AND shop_id IN (${shopIds.map(() => "?").join(",")})`;
      params.push(...shopIds);
    }

    const [rows] = await pool.query(sql, params);
    res.status(200).json(rows);
  } catch (err) {
    console.error("Error querying low_stock_v:", err);
    res.status(500).json({ message: "Server error retrieving low stock products." });
  }
};
