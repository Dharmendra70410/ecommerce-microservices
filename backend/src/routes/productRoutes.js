import { Router } from "express";
import {
  createProduct,
  getProductById,
  listCategories,
  listProducts
} from "../controllers/productController.js";
import { adminMiddleware } from "../middleware/adminMiddleware.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/", listProducts);
router.get("/categories", listCategories);
router.get("/:productId", getProductById);
router.post("/", authMiddleware, adminMiddleware, createProduct);

export default router;
