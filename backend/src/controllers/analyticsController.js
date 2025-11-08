import pool from "../db.js";

// Get inventory value by category
// Based on user id, we get the related shops, and its shop inventory
// Then we group by category
// Returns shop_name, category_name & total price in a new column called total_value
export const getInventoryValueByCategory = async (req, res) => {
  const { id } = req.params;
  const { shops } = req.query;

  const shopIds = shops ? shops.split(",") : [];

  try {
    const sql = `
      SELECT 
        s.shop_name,
        c.category_name,
        ROUND(SUM(si.current_stock * sp.unit_price), 2) AS total_value
      FROM shop_inventory si
      JOIN product p ON si.product_id = p.product_id
      JOIN category c ON p.category_id = c.category_id
      JOIN supplier_product sp ON sp.product_id = p.product_id
      JOIN shop s ON si.shop_id = s.shop_id
      WHERE s.user_id = ?
        ${shopIds.length ? `AND si.shop_id IN (${shopIds.map(() => "?").join(",")})` : ""}
      GROUP BY c.category_name
      ORDER BY total_value DESC;
    `;

    const params = [id, ...shopIds];
    const [rows] = await pool.query(sql, params);

    res.status(200).json(rows);
  } catch (err) {
    console.error("Error fetching inventory value by category:", err);
    res.status(500).json({ message: "Server error retrieving inventory value by category." });
  }
};


// Get monthly orders
// Based on user id,
// We get all the shop orders
// We create a new month column based on the created_at in the order
// Then group by shop name and month
export const getMonthlyOrders = async (req, res) => {
  const { id } = req.params;
  const { shops } = req.query;
  const shopIds = shops ? shops.split(",") : [];

  try {
    const sql = `
      SELECT 
        s.shop_name,
        DATE_FORMAT(o.created_at, '%Y-%m') AS month,
        COUNT(o.order_id) AS order_count
      FROM \`order\` o
      JOIN shop s ON o.shop_id = s.shop_id
      WHERE s.user_id = ?
      ${shopIds.length ? `AND o.shop_id IN (${shopIds.map(() => "?").join(",")})` : ""}
      GROUP BY s.shop_name, month
      ORDER BY month ASC;
    `;

    const params = [id, ...shopIds];
    const [rows] = await pool.query(sql, params);
    res.status(200).json(rows);
  } catch (err) {
    console.error("Error fetching monthly order trend:", err);
    res.status(500).json({ message: "Server error retrieving monthly order trend." });
  }
};

// Get low stock products
// based on user id, retrieve all related shops and their inventory
// Then find products whose current_stock is below their minimum order quantity
// Return shop_name, product_name, current_stock, min_order_quantity, and a new column called stock status
export const getLowStockProducts = async (req, res) => {
  const { id } = req.params;
  const { shops } = req.query;

  const shopIds = shops ? shops.split(",") : [];

  try {
    const sql = `
      SELECT 
        s.shop_name,
        p.product_name,
        si.current_stock,
        si.reorder_level,
        si.max_stock_level,
        CASE 
          WHEN si.current_stock <= si.reorder_level THEN 'LOW'
          ELSE 'OK'
        END AS stock_status
      FROM shop_inventory si
      JOIN product p ON si.product_id = p.product_id
      JOIN shop s ON si.shop_id = s.shop_id
      WHERE s.user_id = ?
        ${shopIds.length ? `AND si.shop_id IN (${shopIds.map(() => "?").join(",")})` : ""}
        AND si.current_stock <= si.reorder_level
      ORDER BY s.shop_name, p.product_name;
    `;

    const params = [id, ...shopIds];
    const [rows] = await pool.query(sql, params);

    res.status(200).json(rows);
  } catch (err) {
    console.error("Error fetching low-stock products:", err);
    res.status(500).json({ message: "Server error retrieving low-stock products." });
  }
};