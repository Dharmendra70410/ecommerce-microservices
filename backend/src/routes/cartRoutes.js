import { Router } from "express";
import {
  addCartItem,
  clearMyCart,
  getMyCart,
  removeCartItem,
  updateCartItem
} from "../controllers/cartController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = Router();

router.use(authMiddleware);
router.get("/my", getMyCart);
router.post("/items", addCartItem);
router.patch("/items/:productId", updateCartItem);
router.delete("/items/:productId", removeCartItem);
router.delete("/clear", clearMyCart);

export default router;
