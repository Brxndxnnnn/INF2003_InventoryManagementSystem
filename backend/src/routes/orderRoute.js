import express from "express";
import {
  getAllOrders,
  getOrderByShop,
  getOrderById,
  createOrder,
  deleteOrder,
} from "../controllers/orderController.js";

const router = express.Router();

router.get("/", getAllOrders);
router.get("/shop/:id", getOrderByShop);
router.get("/:id", getOrderById);
router.post("/", createOrder);
router.delete("/:id", deleteOrder);

export default router;
