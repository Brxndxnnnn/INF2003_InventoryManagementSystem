import express from "express";
import {
  getAllShopInventory,
  getShopInventoryByShop,
  updateShopInventory,
  deleteShopInventory
} from "../controllers/shopInventoryController.js";
import { 
        authenticateToken,
        requireRole,
 } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getAllShopInventory);
router.get("/shop/:id", authenticateToken, requireRole("shop"), getShopInventoryByShop);
router.patch("/:id", authenticateToken, requireRole("shop"), updateShopInventory);
router.delete("/:id", authenticateToken, requireRole("shop"), deleteShopInventory);

export default router;
