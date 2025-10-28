import pool from "../db.js";

// Get all orders
export const getAllOrders = async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT * FROM `order`");
        res.status(200).json(rows);
    } 
    catch (err) {
        console.error("Error fetching orders:", err);
        res.status(500).json({ message: err.message });
    }
};

// Get order by Shop
export const getOrderByShop = async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await pool.query("SELECT * FROM `order` WHERE shop_id = ? ORDER BY created_at DESC", [id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: "Order not found." });
        }
        res.status(200).json(rows);
    } 
    catch (err) {
        console.error(`Error fetching order ${id}:`, err);
        res.status(500).json({ message: err.message });
    }
};

// Get order by ID
export const getOrderById = async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await pool.query("SELECT * FROM `order` WHERE order_id = ?", [id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: "Order not found." });
        }
        res.status(200).json(rows[0]);
    } 
    catch (err) {
        console.error(`Error fetching order ${id}:`, err);
        res.status(500).json({ message: err.message });
    }
};

// Create a new order
export const createOrder = async (req, res) => {
    const { shop_id, total_price } = req.body;

    try {
        const [result] = await pool.query(
            `INSERT INTO \`order\` (shop_id,  total_price, created_at, updated_at)
             VALUES (?, ?, NOW(), NOW())`,
            [shop_id, total_price]
        );

        res.status(201).json({ order_id: result.insertId, message: "Order created successfully." });
    } 
    catch (err) {
        console.error("Error creating order:", err);
        res.status(500).json({ message: err.message });
    }
};

// Delete order
export const deleteOrder = async (req, res) => {
    const { id } = req.params;

    try {
        const [order] = await pool.query("SELECT * FROM `order` WHERE order_id = ?", [id]);
        if (order.length === 0) {
            return res.status(404).json({ message: "Order not found." });
        }

        await pool.query("DELETE FROM `order` WHERE order_id = ?", [id]);
        res.status(200).json({ message: "Order deleted successfully." });
    } 
    catch (err) {
        console.error(`Error deleting order ${id}:`, err);
        res.status(500).json({ message: err.message });
    }
};

// Calculate/update order total price
export const updateOrderTotal = async (req, res) => {
  const { id } = req.params;

  try {
    // Get total sum of order_items 
    const [rows] = await pool.query(
      `SELECT SUM(unit_price * quantity_ordered) AS total_price 
       FROM order_item 
       WHERE order_id = ?`,
      [id]
    );

    const totalPrice = rows[0].total_price || 0;

    // Update total_price
    await pool.query(
      `UPDATE \`order\` 
       SET total_price = ?, updated_at = NOW() 
       WHERE order_id = ?`,
      [totalPrice, id]
    );

    res.status(200).json({message: "Order total updated successfully.",});
  } 
  catch (err) {
    console.error(`Error updating total for order ${id}:`, err);
    res.status(500).json({ message: err.message });
  }
};

