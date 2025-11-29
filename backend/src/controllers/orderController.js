import pool from "../db.js";
import { createNotification } from "./notificationController.js";

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

// Get order by Shop with lazy loading
export const getOrderByShop = async (req, res) => {
  const { id } = req.params;
  const { page = 1, limit = 10 } = req.query;

  const pageNum = Number(page) || 1;
  const limitNum = Number(limit) || 10;
  const offset = (pageNum - 1) * limitNum;

  try {
    const [rows] = await pool.query(
      `SELECT *
       FROM \`order\`
       WHERE shop_id = ?
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [id, limitNum, offset]
    );

    // Just return the rows (like your product search's data.data)
    res.status(200).json(rows);
  } catch (err) {
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

// Create Order + OrderItems + Update total_price in 1 transaction
export const createFullOrder = async (req, res) => {
  const { shop_id, items } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: "Items must be a non-empty array" });
  }

  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    // 1) Create order
    const [orderResult] = await conn.query(
      `INSERT INTO \`order\` (shop_id, total_price, created_at, updated_at) 
       VALUES (?, 0, NOW(), NOW())`,
      [shop_id]
    );

    const orderId = orderResult.insertId;

    // Store inserted order items: {order_item_id, supplier_product_id}
    const insertedItems = [];

    // 2) Insert items
    for (const item of items) {
      const [itemResult] = await conn.query(
        `INSERT INTO order_item (
          order_id, supplier_product_id, quantity_ordered, unit_price, 
          item_status, delivery_notes, created_at, updated_at
        ) VALUES (?, ?, ?, ?, 'pending', ?, NOW(), NOW())`,
        [
          orderId,
          item.supplier_product_id,
          item.quantity_ordered,
          item.unit_price,
          item.delivery_notes || null,
        ]
      );

      insertedItems.push({
        order_item_id: itemResult.insertId,
        supplier_product_id: item.supplier_product_id,
      });
    }

    // 3) Calculate total
    const [rows] = await conn.query(
      `SELECT SUM(unit_price * quantity_ordered) AS total_price 
       FROM order_item WHERE order_id = ?`,
      [orderId]
    );

    const totalPrice = rows[0].total_price || 0;

    // 4) Update order total
    await conn.query(
      `UPDATE \`order\` SET total_price = ?, updated_at = NOW() WHERE order_id = ?`,
      [totalPrice, orderId]
    );

    await conn.commit();

    // 5) Send notifications to supplier
    try {
      // Fetch shop name for message
      const [shopRows] = await pool.query(
        `SELECT shop_name FROM shop WHERE shop_id = ?`,
        [shop_id]
      );

      const shopName = shopRows[0]?.shop_name || "Unknown Shop";

      const supplierProductIds = insertedItems.map(i => i.supplier_product_id);

      const [supplierRows] = await pool.query(
        `SELECT 
          sp.supplier_product_id,
          sp.supplier_id,
          s.user_id,
          s.supplier_name
        FROM supplier_product sp
        JOIN supplier s ON sp.supplier_id = s.supplier_id
        WHERE sp.supplier_product_id IN (?)`,
        [supplierProductIds]
      );

      for (const row of supplierRows) {
        const matchedItem = insertedItems.find(
          (it) => it.supplier_product_id === row.supplier_product_id
        );

        const orderItemId = matchedItem.order_item_id;
        const supplierShopName = row.supplier_name;  // supplier's own shop name

        await createNotification({
          user_id: row.user_id,
          type: "ORDER_PLACED",
          message: `New order (#${orderItemId}) received for ${supplierShopName}.`,
          payload: {
            order_item_id: orderItemId,
            order_id: orderId,
            shop_id,                // buyer's shop
            supplier_id: row.supplier_id,
            supplier_product_id: row.supplier_product_id,
            supplier_shop_name: supplierShopName
          }
        });
      }

    } catch (notifyErr) {
      console.error("Warning: Notification failed but order succeeded:", notifyErr);
    }

    res.status(201).json({
      message: "Order created successfully",
      order_id: orderId,
      total_price: totalPrice,
    });

  } catch (err) {
    console.error("FULL ORDER TRANSACTION ERROR:", err);
    await conn.rollback();
    res.status(500).json({ message: err.message });
  } finally {
    conn.release();
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
