import express from "express";
import {
  getAllOrderItems,
  getOrderItemsByOrderId,
  createOrderItem,
  deleteOrderItem
} from "../controllers/orderItemController.js";

const router = express.Router();

router.get("/", getAllOrderItems);
router.get("/order/:id", getOrderItemsByOrderId);
router.post("/", createOrderItem);
router.delete("/:id", deleteOrderItem);

export default router;
