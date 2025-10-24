import express from "express";
import {
  getAllSupplierProducts,
  getSupplierProductById,
  getSupplierProductBySupplier,
  createSupplierProduct,
  updateSupplierProduct,
  deleteSupplierProduct
} from "../controllers/supplierProductController.js";

const router = express.Router();

router.get("/", getAllSupplierProducts);
router.get("/:id", getSupplierProductById);
router.get("/supplier/:id", getSupplierProductBySupplier);
router.post("/", createSupplierProduct);
router.patch("/:id", updateSupplierProduct);
router.delete("/:id", deleteSupplierProduct);

export default router;
