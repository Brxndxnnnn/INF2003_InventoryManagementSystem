import express from "express";
import {
  getAllSupplierProducts,
  getSupplierProductById,
  createSupplierProduct,
  updateSupplierProduct,
  deleteSupplierProduct
} from "../controllers/supplierProductController.js";

const router = express.Router();

router.get("/", getAllSupplierProducts);
router.get("/:id", getSupplierProductById);
router.post("/", createSupplierProduct);
router.patch("/:id", updateSupplierProduct);
router.delete("/:id", deleteSupplierProduct);

export default router;
