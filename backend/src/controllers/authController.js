import pool from "../db.js";

export const registerUser = async (req, res) => {
  const { email, password, user_type } = req.body;

  try {
    await pool.query(
      "INSERT INTO user (email, password, user_type, is_active, created_at, updated_at) VALUES (?, SHA2(?, 256), ?, ?, NOW(), NOW())",
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
    // Compare by hashing password inside query
    const [rows] = await pool.query(
      "SELECT * FROM user WHERE email = ? AND password = SHA2(?, 256)",
      [email, password]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const user = rows[0];

    // Update last_login timestamp
    await pool.query(
      "UPDATE user SET last_login = NOW() WHERE user_id = ?",
      [user.user_id]
    );

    res.status(200).json({
      message: "Login successful.",
      user: {
        user_id: user.user_id,
        email: user.email,
        user_type: user.user_type,
      },
    });
  } 
  catch (err) {
    console.error("Error logging in user:", err);
    res.status(500).json({ message: err.message });
  }
};
