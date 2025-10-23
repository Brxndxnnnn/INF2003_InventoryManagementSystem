import pool from "../db.js";
import bcrypt from "bcrypt";

export const registerUser = async (req, res) => {
  const { email, password, user_type } = req.body;

  // Backend validation (Empty fields)
  if (!email || !password || !user_type) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    // Database validation (Existing email)
    const [existingUser] = await pool.query("SELECT * FROM user WHERE email = ?", [email]);
    if (existingUser.length > 0) {
      return res.status(409).json({ message: "Email already registered." });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert into db
    await pool.query(
      "INSERT INTO user (email, password, user_type, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())",
      [email, hashedPassword, user_type, 1]
    );
    res.status(201).json({ message: "User registered successfully." });
  } 
  catch (err) {
    console.error("Error registering user:", err);
    res.status(500).json({ message: err.message });
  }
}

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  // Backend validation (Empty fields)
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  // Backend validation (Email format w/ regex)
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ message: "Invalid email format." });
  }

  try {
    // Database validation (User exists?)
    const [rows] = await pool.query("SELECT * FROM user WHERE email = ?", [email]);
    if (rows.length === 0) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const user = rows[0];

    // Compare hashed password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    // Successful login
    res.status(200).json({ message: "Login successful.", user: { user_id: user.user_id, email: user.email, user_type: user.user_type } });
  }
  catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
}
;
