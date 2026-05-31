import { Router } from "express";
import {
  getMyOrders,
  listAllOrders,
  placeOrder,
  updateOrderStatus
} from "../controllers/orderController.js";
import { adminMiddleware } from "../middleware/adminMiddleware.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = Router();

router.use(authMiddleware);
router.get("/my", getMyOrders);
router.post("/", placeOrder);
router.get("/", adminMiddleware, listAllOrders);
router.patch("/:orderId/status", adminMiddleware, updateOrderStatus);

export default router;
