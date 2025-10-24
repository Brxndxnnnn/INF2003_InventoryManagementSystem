import pool from '../db.js';

// Get all supplier products
export const getAllSupplierProducts = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM supplier_product");
    res.status(200).json(rows);
  } 
  catch (err) {
    console.error("Error fetching supplier products:", err);
    res.status(500).json({ message: err.message });
  }
};

// Get supplier product by ID
export const getSupplierProductById = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query("SELECT * FROM supplier_product WHERE supplier_product_id = ?", [id]);
    res.status(200).json(rows[0]);
  } 
  catch (err) {
    console.error(`Error fetching supplier product with ID ${id}:`, err);
    res.status(500).json({ message: err.message });
  }
};

// Create new supplier product
export const createSupplierProduct = async (req, res) => {
  const { product_id, supplier_id, sku, unit_price, min_order_quantity, stock_quantity, is_available } = req.body;

  // Backend validation (Empty fields)
  if (!product_id || !supplier_id || !sku || !unit_price) {
    return res.status(400).json({ message: "Missing required fields." });
  }

  try {
    // Check if product exists (foreign key validation)
    const [product] = await pool.query("SELECT * FROM product WHERE product_id = ?", [product_id]);
    if (product.length === 0) {
      return res.status(404).json({ message: "Product not found." });
    }

    // Check if supplier exists
    const [supplier] = await pool.query("SELECT * FROM supplier WHERE supplier_id = ?", [supplier_id]);
    if (supplier.length === 0) {
      return res.status(404).json({ message: "Supplier not found." });
    }

    // Check if SKU already exists
    const [existing] = await pool.query("SELECT * FROM supplier_product WHERE sku = ?", [sku]);
    if (existing.length > 0) {
      return res.status(409).json({ message: "SKU already exists." });
    }

    // Insert into db
    await pool.query(
      `INSERT INTO supplier_product (
        product_id, supplier_id, sku, unit_price, min_order_quantity, stock_quantity, is_available, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        product_id, 
        supplier_id, 
        sku, 
        unit_price, 
        min_order_quantity || null, 
        stock_quantity || 0, 
        is_available ?? 1
      ]
    );

    res.status(201).json({ message: "Supplier product created successfully." });
  } 
  catch (err) {
    console.error("Error creating supplier product:", err);
    res.status(500).json({ message: err.message });
  }
};

// Update supplier product
export const updateSupplierProduct = async (req, res) => {
  const { id } = req.params;
  const { product_id, supplier_id, sku, unit_price, min_order_quantity, stock_quantity, is_available } = req.body;

  // Backend validation
  if (!product_id && !supplier_id && !sku && !unit_price && !min_order_quantity && !stock_quantity && is_available === undefined) {
    return res.status(400).json({ message: "No fields provided for update." });
  }

  try {
    // Check if supplier product exists
    const [record] = await pool.query("SELECT * FROM supplier_product WHERE supplier_product_id = ?", [id]);
    if (record.length === 0) {
      return res.status(404).json({ message: "Supplier product not found." });
    }

    // Update query (coalesce to keep existing values if not provided)
    await pool.query(
      `UPDATE supplier_product
       SET 
         product_id = COALESCE(?, product_id),
         supplier_id = COALESCE(?, supplier_id),
         sku = COALESCE(?, sku),
         unit_price = COALESCE(?, unit_price),
         min_order_quantity = COALESCE(?, min_order_quantity),
         stock_quantity = COALESCE(?, stock_quantity),
         is_available = COALESCE(?, is_available),
         updated_at = NOW()
       WHERE supplier_product_id = ?`,
      [product_id, supplier_id, sku, unit_price, min_order_quantity, stock_quantity, is_available, id]
    );

    res.status(200).json({ message: "Supplier product updated successfully." });
  } 
  catch (err) {
    console.error(`Error updating supplier product with ID ${id}:`, err);
    res.status(500).json({ message: err.message });
  }
};

// Delete supplier product
export const deleteSupplierProduct = async (req, res) => {
  const { id } = req.params;

  try {
    // Check if supplier product exists
    const [record] = await pool.query("SELECT * FROM supplier_product WHERE supplier_product_id = ?", [id]);
    if (record.length === 0) {
      return res.status(404).json({ message: "Supplier product not found." });
    }

    // Delete record
    await pool.query("DELETE FROM supplier_product WHERE supplier_product_id = ?", [id]);

    res.status(200).json({ message: "Supplier product deleted successfully." });
  } 
  catch (err) {
    console.error(`Error deleting supplier product with ID ${id}:`, err);
    res.status(500).json({ message: err.message });
  }
};
