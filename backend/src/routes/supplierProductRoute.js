import express from "express";
import {
  getAllSupplierProducts,
  getSupplierProductById,
  getSupplierProductBySupplier,
  createSupplierProduct,
  updateSupplierProduct,
  deleteSupplierProduct
} from "../controllers/supplierProductController.js";
import { 
        authenticateToken,
        requireRole,
 } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getAllSupplierProducts);
router.get("/:id", getSupplierProductById);
router.get("/supplier/:id", getSupplierProductBySupplier);
router.post("/", authenticateToken, requireRole("supplier"), createSupplierProduct);
router.patch("/:id", authenticateToken, requireRole("supplier"), updateSupplierProduct);
router.delete("/:id", authenticateToken, requireRole("supplier"), deleteSupplierProduct);

export default router;
