import express from "express";
import {
    getInventoryValueByCategory,
    getMonthlyOrders,
    getLowStockProducts,
} from "../controllers/analyticsController.js";

const router = express.Router();

router.get("/shop/:id/inventory-value", getInventoryValueByCategory);
router.get("/shop/:id/monthly-orders", getMonthlyOrders);
router.get("/shop/:id/low-stock", getLowStockProducts);

export default router;

