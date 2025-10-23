import pool from '../db.js';

export const getAllUsers = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM user");
    res.status(200).json(rows);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getUserById = (req, res) => {
  const { id } = req.params;
  res.status(200).json({ message: `User ${id} fetched` });
};

export const updateUser = (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;
  res.status(200).json({ message: `User ${id} updated`, data: updatedData });
};

export const deleteUser = (req, res) => {
  const { id } = req.params;
  res.status(200).json({ message: `User ${id} deleted` });
};


