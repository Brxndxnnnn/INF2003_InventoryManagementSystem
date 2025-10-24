import express from "express";
import {
  getAllSuppliers,
  getSuppliersByUserId,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier
} from "../controllers/supplierController.js";

const router = express.Router();

router.get("/", getAllSuppliers) //"SELECT * FROM shop"
router.get("/user/:id", getSuppliersByUserId) //"SELECT * FROM shop WHERE user_id = ?"
router.get("/:id", getSupplierById) //"SELECT * FROM shop WHERE shop_id = ?"
router.post("/", createSupplier) // "INSERT INTO shop ..."
router.patch("/:id", updateSupplier) // "UPDATE shop SET ..."
router.delete("/:id", deleteSupplier) // "DELETE FROM shop WHERE shop_id = ?"

export default router;

