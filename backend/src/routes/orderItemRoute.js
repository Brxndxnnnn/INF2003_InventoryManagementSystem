import express from "express";
import {
  getAllOrderItems,
  getOrderItemsBySupplier,
  getOrderItemsByOrderId,
  createOrderItem,
  updateOrderItem,
  deleteOrderItem
} from "../controllers/orderItemController.js";

const router = express.Router();

router.get("/", getAllOrderItems);
router.get("/supplier/:id", getOrderItemsBySupplier);
router.get("/:id", getOrderItemsByOrderId);
router.post("/", createOrderItem);
router.patch("/:id", updateOrderItem);
router.delete("/:id", deleteOrderItem);

export default router;
