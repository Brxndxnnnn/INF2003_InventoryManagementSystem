import pool from '../db.js';

// Get all suppliers
export const getAllSuppliers = async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT * FROM supplier");
        res.status(200).json(rows);
    } 
    catch (err) {
        console.error("Error fetching suppliers:", err);
        res.status(500).json({ message: err.message });
    }
};

// Get suppliers by user ID
export const getSuppliersByUserId = async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await pool.query("SELECT * FROM supplier WHERE user_id = ?", [id]);
        res.status(200).json(rows);
    } 
    catch (err) {
        console.error(`Error fetching suppliers for user ${id}:`, err);
        res.status(500).json({ message: err.message });
    }
};

// Get supplier by supplier ID
export const getSupplierById = async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await pool.query("SELECT * FROM supplier WHERE supplier_id = ?", [id]);
        res.status(200).json(rows[0]);
    } 
    catch (err) {
        console.error(`Error fetching supplier ${id}:`, err);
        res.status(500).json({ message: err.message });
    }
};

export const createSupplier = async (req, res) => {
    const { user_id, supplier_name, supplier_address, supplier_contact_number, supplier_email, supplier_uen } = req.body;

    try {
        // Check if user exists (foreign key validation)
        const [user] = await pool.query("SELECT * FROM user WHERE user_id = ?", [user_id]);
        if (user.length === 0) {
            return res.status(404).json({ message: "User not found." });
        }

        // Insert into db
        await pool.query(
            `INSERT INTO supplier (
            user_id, supplier_name, supplier_address, supplier_contact_number, 
            supplier_email, supplier_uen, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
            [user_id, supplier_name, supplier_address || null, supplier_contact_number || null, supplier_email || null, supplier_uen || null]
        );

        res.status(201).json({ message: "Supplier created successfully." });
    } 
    catch (err) {
        console.error("Error creating supplier:", err);
        res.status(500).json({ message: err.message });
    }
};

export const updateSupplier = async (req, res) => {
    const { id } = req.params;
    const { supplier_name, supplier_address, supplier_contact_number, supplier_email, supplier_uen } = req.body;

    // Backend validation
    if (!supplier_name && !supplier_address && !supplier_contact_number && !supplier_email && !supplier_uen) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    try {
        // Check if supplier exists
        const [supplier] = await pool.query("SELECT * FROM supplier WHERE supplier_id = ?", [id]);
        if (supplier.length === 0) {
            return res.status(404).json({ message: "Supplier not found." });
        }

        // Update query (coalesce to keep existing values if not provided)
        await pool.query(
            `UPDATE supplier
             SET 
               supplier_name = COALESCE(?, supplier_name),
               supplier_address = COALESCE(?, supplier_address),
               supplier_contact_number = COALESCE(?, supplier_contact_number),
               supplier_email = COALESCE(?, supplier_email),
               supplier_uen = COALESCE(?, supplier_uen),
               updated_at = NOW()
             WHERE supplier_id = ?`,
            [supplier_name, supplier_address, supplier_contact_number, supplier_email, supplier_uen, id]
        );

        res.status(200).json({ message: "Supplier updated successfully." });
    } 
    catch (err) {
        console.error(`Error updating supplier ${id}:`, err);
        res.status(500).json({ message: err.message });
    }
};

export const deleteSupplier = async (req, res) => {
    const { id } = req.params;

    try {
        // Check if supplier exists
        const [supplier] = await pool.query("SELECT * FROM supplier WHERE supplier_id = ?", [id]);
        if (supplier.length === 0) {
            return res.status(404).json({ message: "Supplier not found." });
        }

        // Delete record
        await pool.query("DELETE FROM supplier WHERE supplier_id = ?", [id]);

        res.status(200).json({ message: "Supplier deleted successfully." });
    } 
    catch (err) {
        console.error(`Error deleting supplier with ID ${id}:`, err);
        res.status(500).json({ message: err.message });
    }
};


// Search suppliers with optional fulltext filter + hide-empty option
// SELECT 
//     s.*,
//     COUNT(sp.supplier_product_id) AS product_count
// FROM supplier s
// LEFT JOIN supplier_product sp 
//     ON s.supplier_id = sp.supplier_id
// //WHERE MATCH(s.supplier_name, s.supplier_email, s.supplier_uen, s.supplier_contact_number)
// //      AGAINST ('Hakim etc <-- SEARCH QUERY*' IN BOOLEAN MODE)
// GROUP BY s.supplier_id
// HAVING product_count > 0
// ORDER BY s.supplier_name ASC;
export const searchSupplier = async (req, res) => {
  const { q, hideEmpty, page = 1, limit = 10 } = req.query;

  const pageNum = Number(page) || 1;
  const limitNum = Number(limit) || 10;
  const offset = (pageNum - 1) * limitNum;

  try {
    let sql = `
      SELECT s.*, COUNT(sp.supplier_product_id) AS product_count
      FROM supplier s
      LEFT JOIN supplier_product sp ON s.supplier_id = sp.supplier_id
    `;
    const params = [];

    // fulltext WHERE
    if (q && q.trim() !== "") {
      sql += `
        WHERE MATCH(s.supplier_name, s.supplier_email, s.supplier_uen, s.supplier_contact_number)
        AGAINST (? IN BOOLEAN MODE)
      `;
      params.push(`${q}*`);
    }

    // group + optional having + order
    sql += `
      GROUP BY s.supplier_id
      ${hideEmpty === "true" ? "HAVING product_count > 0" : ""}
      ORDER BY s.supplier_name ASC
      LIMIT ? OFFSET ?
    `;

    params.push(limitNum, offset);

    const [rows] = await pool.query(sql, params);
    res.status(200).json(rows);
  } catch (err) {
    console.error("Error searching suppliers:", err);
    res.status(500).json({ message: err.message });
  }
};


