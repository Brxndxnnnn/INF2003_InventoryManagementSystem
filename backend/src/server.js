import express from "express";
import cors from "cors";
import userRoute from './routes/userRoute.js';
import authRoute from './routes/authRoute.js';
import shopRoute from './routes/shopRoute.js';
import supplierRoute from './routes/supplierRoute.js';
import categoryRoute from './routes/categoryRoute.js';
import productRoute from './routes/productRoute.js';
import supplierProductRoute from './routes/supplierProductRoute.js';
import orderRoute from './routes/orderRoute.js';
import orderItemRoute from './routes/orderItemRoute.js';

const app = express()

// Enable CORS (frontend-backend communication since they both have different ports)
app.use(
  cors({
    origin: "http://localhost:5173",
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
app.use("/api/supplier-product", supplierProductRoute)
app.use("/api/order", orderRoute)
app.use("/api/order-item", orderItemRoute)

app.listen(process.env.CLIENT_PORT, () =>
  console.log(`Server running on http://localhost:${process.env.CLIENT_PORT}`)
);