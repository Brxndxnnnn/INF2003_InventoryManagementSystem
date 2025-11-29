import pool from "../db.js";
import jwt from "jsonwebtoken";

export const registerUser = async (req, res) => {
  const { email, password, user_type } = req.body;

  try {
    await pool.query(
      "INSERT INTO user (email, password, user_type, created_at, updated_at) VALUES (?, SHA2(?, 256), ?, NOW(), NOW())",
      [email, password, user_type, 1]
    );

    res.status(201).json({ message: "User registered successfully." });
  } 
  catch (err) {
    console.error("Error registering user:", err);
    res.status(500).json({ message: err.message });
  }
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Validate login credentials
    const [rows] = await pool.query(
      "SELECT * FROM user WHERE email = ? AND password = SHA2(?, 256)",
      [email, password]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const user = rows[0];

    // Update last_login
    await pool.query(
      "UPDATE user SET last_login = NOW() WHERE user_id = ?",
      [user.user_id]
    );

    // Build JWT payload
    const payload = {
      user_id: user.user_id,
      user_type: user.user_type,
      email: user.email,
    };

    // Sign JWT
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    // Return token + user info
    res.status(200).json({
      message: "Login successful.",
      token,
      user: {
        user_id: user.user_id,
        email: user.email,
        user_type: user.user_type,
      },
    });
  } catch (err) {
    console.error("Error logging in user:", err);
    res.status(500).json({ message: err.message });
  }
};

