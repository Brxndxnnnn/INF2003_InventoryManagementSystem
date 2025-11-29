import pool from '../db.js';
import { getDb } from "../mongoClient.js";

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
  const { q, categoryId, page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  const cacheKey = `q=${q || ""}&category=${categoryId || ""}&page=${page}&limit=${limit}`;

  try {
    // check mongodb cache
    const db = getDb();
    const cacheCol = db.collection("product_list_cache");

    const cached = await cacheCol.findOne({ key: cacheKey });

    if (cached) {
      return res.status(200).json({
        data: cached.data,
        pagination: cached.pagination,
        cached: true
      });
    }

    // run mysql search logic
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

    // Order and pagination
    sql += `
      ORDER BY p.product_name ASC
      LIMIT ? OFFSET ?
    `;
    params.push(Number(limit), Number(offset));

    const [rows] = await pool.query(sql, params);

    // Get total count
    let countSql = `
      SELECT COUNT(*) AS total
      FROM product p
      ${q || categoryId ? "LEFT JOIN category c ON p.category_id = c.category_id" : ""}
    `;
    const countParams = [];

    if (q && q.trim() !== "") {
      countSql += `
        WHERE MATCH(p.product_name, p.description)
        AGAINST (? IN BOOLEAN MODE)
      `;
      countParams.push(`${q}*`);
    }
    if (categoryId) {
      countSql += q && q.trim() !== "" ? " AND " : " WHERE ";
      countSql += `p.category_id = ?`;
      countParams.push(categoryId);
    }

    const [countResult] = await pool.query(countSql, countParams);
    const total = countResult[0].total;

    const responsePayload = {
      data: rows,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
      }
    };

    // save result to cache
    await cacheCol.updateOne(
      { key: cacheKey },
      {
        $set: {
          key: cacheKey,
          data: rows,
          pagination: responsePayload.pagination,
          last_refresh: new Date()
        }
      },
      { upsert: true }
    );

    // return mysql result
    res.status(200).json({ ...responsePayload, cached: false });

  } catch (err) {
    console.error("Error searching products:", err);
    res.status(500).json({ message: err.message });
  }
};

