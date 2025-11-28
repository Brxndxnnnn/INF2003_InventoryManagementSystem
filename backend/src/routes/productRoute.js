import express from "express";
import {
  getAllProducts,
  getProductById,
  getProductsByCategory,
  searchProduct,
} from "../controllers/productController.js";

const router = express.Router();

router.get("/", getAllProducts);
router.get("/search", searchProduct)
router.get("/:id", getProductById);
router.get("/category/:id", getProductsByCategory);

export default router;
