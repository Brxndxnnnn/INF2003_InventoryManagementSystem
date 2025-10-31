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

export const searchProduct = async (req, res) => {
  const { q, categoryId } = req.query; 
  // e.g. /api/product/search?q=coke
  // or /api/product/search?categoryId=2
  // or /api/product/search?q=coke&categoryId=2

  try {
    // Base query
    let sql = `
      SELECT 
        p.*,
        c.category_name
      FROM product p
      LEFT JOIN category c ON p.category_id = c.category_id
    `;
    const params = [];

    // WHERE (optional fulltext in BOOLEAN MODE)
    if (q && q.trim() !== "") {
      sql += `
        WHERE MATCH(p.product_name, p.description)
        AGAINST (? IN BOOLEAN MODE)
      `;
      params.push(`${q}*`);
    }

    // Filter by category if provided
    if (categoryId) {
      sql += q && q.trim() !== "" ? " AND " : " WHERE ";
      sql += `p.category_id = ?`;
      params.push(categoryId);
    }

    // Order by product name alphabetically
    sql += `
      ORDER BY p.product_name ASC
    `;

    // Execute query
    const [rows] = await pool.query(sql, params);
    res.status(200).json(rows);
  } catch (err) {
    console.error("Error searching products:", err);
    res.status(500).json({ message: err.message });
  }
};