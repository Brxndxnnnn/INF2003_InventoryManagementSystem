import express from "express";
import {
  getAllShopInventory,
  getShopInventoryByShop,
  updateShopInventory,
  deleteShopInventory
} from "../controllers/shopInventoryController.js";

const router = express.Router();

router.get("/", getAllShopInventory);
router.get("/shop/:id", getShopInventoryByShop);
router.patch("/:id", updateShopInventory);
router.delete("/:id", deleteShopInventory);

export default router;
