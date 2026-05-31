import Cart from "../models/Cart.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";

function toOrderItem(cartItem) {
  return {
    product: cartItem.product._id,
    name: cartItem.product.name || cartItem.nameSnapshot,
    image: cartItem.product.images?.[0] || cartItem.imageSnapshot || "",
    quantity: cartItem.quantity,
    unitPrice: cartItem.product.price,
    totalPrice: cartItem.quantity * cartItem.product.price
  };
}

export async function placeOrder(req, res) {
  try {
    const { shippingAddress, paymentMethod = "cod", pricing = {} } = req.body || {};

    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.phone || !shippingAddress.line1) {
      return res.status(400).json({ message: "shippingAddress with required fields is missing" });
    }

    const cart = await Cart.findOne({ user: req.user.userId }).populate("items.product");
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    for (const item of cart.items) {
      if (!item.product || !item.product.isActive) {
        return res.status(400).json({ message: `Product unavailable in cart: ${item.nameSnapshot}` });
      }

      if (item.quantity > item.product.stock) {
        return res.status(400).json({ message: `Insufficient stock for ${item.product.name}` });
      }
    }

    const orderItems = cart.items.map(toOrderItem);
    const subtotal = orderItems.reduce((sum, item) => sum + item.totalPrice, 0);
    const shippingFee = Math.max(0, Number(pricing.shippingFee) || 0);
    const tax = Math.max(0, Number(pricing.tax) || 0);
    const discount = Math.max(0, Number(pricing.discount) || 0);

    const order = await Order.create({
      user: req.user.userId,
      items: orderItems,
      shippingAddress,
      paymentMethod,
      pricing: {
        subtotal,
        shippingFee,
        tax,
        discount,
        grandTotal: Math.max(0, subtotal + shippingFee + tax - discount)
      },
      status: "placed",
      paymentStatus: paymentMethod === "cod" ? "pending" : "paid"
    });

    for (const item of cart.items) {
      await Product.updateOne(
        { _id: item.product._id },
        {
          $inc: { stock: -item.quantity }
        }
      );
    }

    cart.items = [];
    await cart.save();

    return res.status(201).json({ order, message: "Order placed successfully" });
  } catch (_error) {
    return res.status(500).json({ message: "Failed to place order" });
  }
}

export async function getMyOrders(req, res) {
  try {
    const orders = await Order.find({ user: req.user.userId }).sort({ createdAt: -1 }).lean();
    return res.json({ orders });
  } catch (_error) {
    return res.status(500).json({ message: "Failed to load orders" });
  }
}

export async function listAllOrders(_req, res) {
  try {
    const orders = await Order.find().sort({ createdAt: -1 }).populate("user", "username email").lean();
    return res.json({ orders });
  } catch (_error) {
    return res.status(500).json({ message: "Failed to load orders" });
  }
}

export async function updateOrderStatus(req, res) {
  try {
    const { status } = req.body || {};
    if (!status) {
      return res.status(400).json({ message: "status is required" });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.orderId,
      { status },
      { new: true, runValidators: true }
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    return res.json({ order, message: "Order status updated" });
  } catch (_error) {
    return res.status(400).json({ message: "Failed to update order status" });
  }
}
