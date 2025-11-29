import express from "express";
import cors from "cors";
import userRoute from './routes/userRoute.js';
import authRoute from './routes/authRoute.js';
import shopRoute from './routes/shopRoute.js';
import supplierRoute from './routes/supplierRoute.js';
import categoryRoute from './routes/categoryRoute.js';
import productRoute from './routes/productRoute.js';
import shopInventoryRoute from  './routes/shopInventoryRoute.js'
import supplierProductRoute from './routes/supplierProductRoute.js';
import orderRoute from './routes/orderRoute.js';
import orderItemRoute from './routes/orderItemRoute.js';
import analyticsRoute from './routes/analyticsRoute.js';
import notificationRoute from './routes/notificationRoute.js';
import { connectMongo } from "./mongoClient.js";
import dotenv from "dotenv";
dotenv.config();

const app = express()

// Enable CORS (frontend-backend communication since they both have different ports)
app.use(
  cors({
    origin: ["http://localhost:5173", /\.vercel\.app$/],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  })
);

// Allow JSON request bodies
app.use(express.json());

// Routes
app.use("/api/user", userRoute)
app.use("/api/auth", authRoute)
app.use("/api/shop", shopRoute)
app.use("/api/supplier", supplierRoute)
app.use("/api/category", categoryRoute)
app.use("/api/product", productRoute)
app.use("/api/shop-inventory", shopInventoryRoute)
app.use("/api/supplier-product", supplierProductRoute)
app.use("/api/order", orderRoute)
app.use("/api/order-item", orderItemRoute)
app.use("/api/analytics", analyticsRoute)
app.use("/api/notification", notificationRoute)

const PORT = process.env.CLIENT_PORT || 5001;

const start = async () => {
  // 1) connect to Mongo
  await connectMongo();

  // 2) start Express
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
};

start();
