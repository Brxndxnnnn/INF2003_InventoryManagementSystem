import pool from '../db.js';

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

// Get order items by order ID
export const getOrderItemsByOrderId = async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await pool.query("SELECT * FROM order_item WHERE order_id = ?", [id]);
        res.status(200).json(rows);
    } 
    catch (err) {
        console.error(`Error fetching items for order ${id}:`, err);
        res.status(500).json({ message: err.message });
    }
};

// Create a new order item
export const createOrderItem = async (req, res) => {
    const { order_id, supplier_product_id, quantity_ordered, unit_price, estimated_delivery_date, delivery_notes } = req.body;

    // Backend validation
    if (!order_id || !supplier_product_id || !quantity_ordered || !unit_price) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    try {
        await pool.query(
            `INSERT INTO order_item (
                order_id, supplier_product_id, quantity_ordered, unit_price,
                item_status, estimated_delivery_date, delivery_notes, created_at, updated_at
            ) VALUES (?, ?, ?, ?, 'pending', ?, ?, NOW(), NOW())`,
            [order_id, supplier_product_id, quantity_ordered, unit_price, estimated_delivery_date || null, delivery_notes || null]
        );

        res.status(201).json({ message: "Order item created successfully." });
    } 
    catch (err) {
        console.error("Error creating order item:", err);
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
