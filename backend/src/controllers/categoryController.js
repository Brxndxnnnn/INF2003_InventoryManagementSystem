import pool from '../db.js';

// Get all categories
export const getAllCategories = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM category");
    res.status(200).json(rows);
  } 
  catch (err) {
    console.error("Error fetching categories:", err);
    res.status(500).json({ message: err.message });
  }
};

// Get category by ID
export const getCategoryById = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query("SELECT * FROM category WHERE category_id = ?", [id]);
    res.status(200).json(rows[0]);
  } 
  catch (err) {
    console.error(`Error fetching category with ID ${id}:`, err);
    res.status(500).json({ message: err.message });
  }
};

// Create new category
export const createCategory = async (req, res) => {
  const { category_name, description } = req.body;

  try {
    // Check if category already exists (UNIQUE constraint)
    const [existing] = await pool.query(
      "SELECT * FROM category WHERE category_name = ?", 
      [category_name]
    );
    if (existing.length > 0) {
      return res.status(409).json({ message: "Category name already exists." });
    }

    // Insert into db
    await pool.query(
      `INSERT INTO category (category_name, description) VALUES (?, ?)`,
      [category_name, description || null]
    );

    res.status(201).json({ message: "Category created successfully." });
  } 
  catch (err) {
    console.error("Error creating category:", err);
    res.status(500).json({ message: err.message });
  }
};

// Update category
export const updateCategory = async (req, res) => {
  const { id } = req.params;
  const { category_name, description } = req.body;

  // Backend validation
  if (!category_name && !description) {
    return res.status(400).json({ message: "No fields provided for update." });
  }

  try {
    // Check if category exists
    const [category] = await pool.query("SELECT * FROM category WHERE category_id = ?", [id]);
    if (category.length === 0) {
      return res.status(404).json({ message: "Category not found." });
    }

    // Update query (coalesce to keep existing values if not provided)
    await pool.query(
      `UPDATE category
       SET 
         category_name = COALESCE(?, category_name),
         description = COALESCE(?, description)
       WHERE category_id = ?`,
      [category_name, description, id]
    );

    res.status(200).json({ message: "Category updated successfully." });
  } 
  catch (err) {
    console.error(`Error updating category with ID ${id}:`, err);
    res.status(500).json({ message: err.message });
  }
};

// Delete category
export const deleteCategory = async (req, res) => {
  const { id } = req.params;

  try {
    // Check if category exists
    const [category] = await pool.query("SELECT * FROM category WHERE category_id = ?", [id]);
    if (category.length === 0) {
      return res.status(404).json({ message: "Category not found." });
    }

    // Delete record
    await pool.query("DELETE FROM category WHERE category_id = ?", [id]);

    res.status(200).json({ message: "Category deleted successfully." });
  } 
  catch (err) {
    console.error(`Error deleting category with ID ${id}:`, err);
    res.status(500).json({ message: err.message });
  }
};
