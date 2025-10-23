import express from "express";
import {
  getAllShops,
  getShopsByUserId,
  getShopById,
  createShop,
  updateShop,
  deleteShop
} from "../controllers/shopController.js";

const router = express.Router();

router.get("/", getAllShops) //"SELECT * FROM shop"
router.get("/user/:id", getShopsByUserId) //"SELECT * FROM shop WHERE user_id = ?"
router.get("/:id", getShopById) //"SELECT * FROM shop WHERE shop_id = ?"
router.post("/", createShop) // "INSERT INTO shop ..."
router.put("/:id", updateShop) // "UPDATE shop SET ..."
router.delete("/:id", deleteShop) // "DELETE FROM shop WHERE shop_id = ?"

export default router;

