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

// Edit order item (only PATCH status)
export const updateOrderItem = async (req, res) => {
    const { id } = req.params;
    const { item_status } = req.body;

    try {
        const [result] = await pool.query(
            `UPDATE order_item 
             SET item_status = ?, updated_at = NOW() 
             WHERE order_item_id = ?`,
            [item_status, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Order item not found." });
        }

        res.status(200).json({ message: "Order item status updated successfully." });
    } 
    catch (err) {
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
