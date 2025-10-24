import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

let pool;

const createPool = () => {
// Connection pool for Express
const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,

    // Pool config (the AWS RDS will go inactive after awhile so these settings help to keep it alive)
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,      // forces TCP keep-alive
    keepAliveInitialDelay: 0,   // prevents connection sleep
});

  // Pool error handling
  pool.on("error", (err) => {
    console.error("MySQL pool error:", err.code);

    // Attempt to rebuild the pool on network errors
    if (["PROTOCOL_CONNECTION_LOST", "ECONNRESET", "ETIMEDOUT"].includes(err.code)) {
      console.log("Reinitializing MySQL connection pool...");
      createPool();
    } else {
      console.error("Unhandled MySQL error:", err);
    }
  });

  return pool;
};

pool = createPool();

setInterval(async () => {
  try {
    await pool.query("SELECT 1");
    console.log("MySQL keep-alive successful");
  } 
  catch (err) {
    console.error(err.message);
  }
}, 300000);

export default pool;