import pool from '../db.js';
import { createNotification } from "./notificationController.js";

// Get all order items
export const getAllOrderItems = async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT * FROM order_item");
        res.status(200).json(rows);
    } 
    catch (err) {
        console.error("Error fetching order items:", err);
        res.status(500).json({ message: err.message });
    }
};

// Get all order items by supplier name with product name(nested LEFT JOIN since product name needs 2 FKs to access order_item -> supplier_product -> product)
export const getOrderItemsBySupplier = async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await pool.query(`
            SELECT o.*, p.product_name FROM order_item o 
            LEFT JOIN supplier_product sp ON o.supplier_product_id = sp.supplier_product_id 
            LEFT JOIN product p ON sp.product_id = p.product_id
            WHERE sp.supplier_id = ?`, [id]);
        res.status(200).json(rows);
    } 
    catch (err) {
        console.error("Error fetching order items:", err);
        res.status(500).json({ message: err.message });
    }
};

// Get order items by order ID
export const getOrderItemsByOrderId = async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await pool.query(`
            SELECT o.*, p.product_name FROM order_item o 
            LEFT JOIN supplier_product sp ON o.supplier_product_id = sp.supplier_product_id 
            LEFT JOIN product p ON sp.product_id = p.product_id
            WHERE order_id = ?`, [id]);
        res.status(200).json(rows);
    } 
    catch (err) {
        console.error(`Error fetching items for order ${id}:`, err);
        res.status(500).json({ message: err.message });
    }
};

// Edit order item (only PATCH status)
export const updateOrderItem = async (req, res) => {
  const { id } = req.params;           // order_item_id
  const { item_status } = req.body;    // approved | rejected | delivered

  try {
    // 1) Update order item status
    const [result] = await pool.query(
      `UPDATE order_item 
       SET item_status = ?, updated_at = NOW() 
       WHERE order_item_id = ?`,
      [item_status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Order item not found." });
    }

    // 2) Fetch necessary info
    const [rows] = await pool.query(
      `SELECT 
          oi.order_item_id,
          oi.order_id,
          oi.supplier_product_id,
          sp.supplier_id,
          s.user_id AS supplier_user_id,
          o.shop_id,
          sh.user_id AS shop_user_id,
          sh.shop_name,
          p.product_name
        FROM order_item oi
        JOIN supplier_product sp ON oi.supplier_product_id = sp.supplier_product_id
        JOIN supplier s ON sp.supplier_id = s.supplier_id
        JOIN product p ON sp.product_id = p.product_id
        JOIN \`order\` o ON oi.order_id = o.order_id
        JOIN shop sh ON o.shop_id = sh.shop_id
        WHERE oi.order_item_id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(500).json({ message: "Order data missing for notification." });
    }

    const info = rows[0];
    const shopUserId = info.shop_user_id;
    const supplierUserId = info.supplier_user_id;

    // 3) Notification logic
    if (item_status === "approved" || item_status === "rejected") {
      // Notify the SHOP
      const action = item_status === "approved" ? "approved" : "rejected";

      await createNotification({
        user_id: shopUserId,
        type: "ORDER_ITEM_STATUS",
        message: `Your order item (#${info.order_item_id} - ${info.product_name}) from ${info.shop_name} has been ${action}.`,
        payload: {
          order_item_id: id,
          order_id: info.order_id,
          shop_id: info.shop_id,
          supplier_id: info.supplier_id,
          status: item_status
        }
      });
    }

    if (item_status === "delivered") {
      // Notify the SUPPLIER
      await createNotification({
        user_id: supplierUserId,
        type: "ORDER_ITEM_DELIVERED",
        message: `Shop ${info.shop_name} has confirmed delivery for item (#${info.order_item_id}).`,
        payload: {
          order_item_id: id,
          order_id: info.order_id,
          shop_id: info.shop_id,
          supplier_id: info.supplier_id,
          status: item_status
        }
      });
    }

    res.status(200).json({ message: "Order item status updated successfully." });

  } catch (err) {
    console.error(`Error updating order item ${id}:`, err);
    res.status(500).json({ message: err.message });
  }
};

// Delete order item
export const deleteOrderItem = async (req, res) => {
    const { id } = req.params;

    try {
        await pool.query("DELETE FROM order_item WHERE order_item_id = ?", [id]);
        res.status(200).json({ message: "Order item deleted successfully." });
    } 
    catch (err) {
        console.error(`Error deleting order item ${id}:`, err);
        res.status(500).json({ message: err.message });
    }
};
