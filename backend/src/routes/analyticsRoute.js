import express from "express";
import {
    getInventoryValueByCategory,
    getMonthlyOrders,
    getLowStockProducts,
} from "../controllers/analyticsController.js";
import { 
        authenticateToken,
        requireRole,
 } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/shop/:id/inventory-value", authenticateToken, requireRole("shop"), getInventoryValueByCategory);
router.get("/shop/:id/monthly-orders", authenticateToken, requireRole("shop"), getMonthlyOrders);
router.get("/shop/:id/low-stock", authenticateToken, requireRole("shop"), getLowStockProducts);

export default router;

