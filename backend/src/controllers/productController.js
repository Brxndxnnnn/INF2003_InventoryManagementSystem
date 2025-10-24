import pool from '../db.js';

// Get all products
export const getAllProducts = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM product");
    res.status(200).json(rows);
  } 
  catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).json({ message: err.message });
  }
};

// Get product by ID
export const getProductById = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query("SELECT * FROM product WHERE product_id = ?", [id]);
    res.status(200).json(rows[0]);
  } 
  catch (err) {
    console.error(`Error fetching product with ID ${id}:`, err);
    res.status(500).json({ message: err.message });
  }
};

// Get product by Category
export const getProductsByCategory = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query("SELECT * FROM product WHERE category_id = ?", [id]);
    res.status(200).json(rows);
  } 
  catch (err) {
    console.error(`Error fetching product with ID ${id}:`, err);
    res.status(500).json({ message: err.message });
  }
};

// Create new product
export const createProduct = async (req, res) => {
  const { category_id, product_name, description, unit_of_measure } = req.body;

  // Backend validation (Empty fields)
  if (!category_id || !product_name || !unit_of_measure) {
    return res.status(400).json({ message: "Missing required fields." });
  }

  try {
    // Check if category exists (foreign key validation)
    const [category] = await pool.query("SELECT * FROM category WHERE category_id = ?", [category_id]);
    if (category.length === 0) {
      return res.status(404).json({ message: "Category not found." });
    }

    // Check if product name already exists
    const [existing] = await pool.query("SELECT * FROM product WHERE product_name = ?", [product_name]);
    if (existing.length > 0) {
      return res.status(409).json({ message: "Product name already exists." });
    }

    // Insert into db
    await pool.query(
      `INSERT INTO product (category_id, product_name, description, unit_of_measure, created_at, updated_at)
       VALUES (?, ?, ?, ?, NOW(), NOW())`,
      [category_id, product_name, description || null, unit_of_measure]
    );

    res.status(201).json({ message: "Product created successfully." });
  } 
  catch (err) {
    console.error("Error creating product:", err);
    res.status(500).json({ message: err.message });
  }
};

// Update product
export const updateProduct = async (req, res) => {
  const { id } = req.params;
  const { category_id, product_name, description, unit_of_measure } = req.body;

  // Backend validation
  if (!category_id && !product_name && !description && !unit_of_measure) {
    return res.status(400).json({ message: "No fields provided for update." });
  }

  try {
    // Check if product exists
    const [product] = await pool.query("SELECT * FROM product WHERE product_id = ?", [id]);
    if (product.length === 0) {
      return res.status(404).json({ message: "Product not found." });
    }

    // Update query (coalesce to keep existing values if not provided)
    await pool.query(
      `UPDATE product
       SET 
         category_id = COALESCE(?, category_id),
         product_name = COALESCE(?, product_name),
         description = COALESCE(?, description),
         unit_of_measure = COALESCE(?, unit_of_measure),
         updated_at = NOW()
       WHERE product_id = ?`,
      [category_id, product_name, description, unit_of_measure, id]
    );

    res.status(200).json({ message: "Product updated successfully." });
  } 
  catch (err) {
    console.error(`Error updating product with ID ${id}:`, err);
    res.status(500).json({ message: err.message });
  }
};

// Delete product
export const deleteProduct = async (req, res) => {
  const { id } = req.params;

  try {
    // Check if product exists
    const [product] = await pool.query("SELECT * FROM product WHERE product_id = ?", [id]);
    if (product.length === 0) {
      return res.status(404).json({ message: "Product not found." });
    }

    // Delete record
    await pool.query("DELETE FROM product WHERE product_id = ?", [id]);

    res.status(200).json({ message: "Product deleted successfully." });
  } 
  catch (err) {
    console.error(`Error deleting product with ID ${id}:`, err);
    res.status(500).json({ message: err.message });
  }
};
