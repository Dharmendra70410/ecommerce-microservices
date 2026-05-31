import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

async function getOrCreateCart(userId) {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
  }
  return cart;
}

export async function getMyCart(req, res) {
  try {
    const cart = await getOrCreateCart(req.user.userId);
    await cart.populate("items.product", "name images price mrp stock isActive");
    return res.json({ cart });
  } catch (_error) {
    return res.status(500).json({ message: "Failed to load cart" });
  }
}

export async function addCartItem(req, res) {
  try {
    const { productId, quantity = 1 } = req.body || {};

    if (!productId) {
      return res.status(400).json({ message: "productId is required" });
    }

    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.stock <= 0) {
      return res.status(400).json({ message: "Product out of stock" });
    }

    const cart = await getOrCreateCart(req.user.userId);
    const index = cart.items.findIndex((item) => item.product.toString() === String(product._id));
    const qty = Math.max(1, Number.parseInt(quantity, 10) || 1);

    if (index >= 0) {
      cart.items[index].quantity = Math.min(product.stock, cart.items[index].quantity + qty);
      cart.items[index].unitPrice = product.price;
      cart.items[index].nameSnapshot = product.name;
      cart.items[index].imageSnapshot = product.images?.[0] || "";
    } else {
      cart.items.push({
        product: product._id,
        quantity: Math.min(product.stock, qty),
        unitPrice: product.price,
        nameSnapshot: product.name,
        imageSnapshot: product.images?.[0] || ""
      });
    }

    await cart.save();
    await cart.populate("items.product", "name images price mrp stock isActive");

    return res.status(201).json({ cart });
  } catch (_error) {
    return res.status(500).json({ message: "Failed to add item to cart" });
  }
}

export async function updateCartItem(req, res) {
  try {
    const { quantity } = req.body || {};
    const targetProductId = req.params.productId;

    if (!targetProductId) {
      return res.status(400).json({ message: "productId is required" });
    }

    const parsedQuantity = Number.parseInt(quantity, 10);
    if (!Number.isFinite(parsedQuantity) || parsedQuantity < 0) {
      return res.status(400).json({ message: "quantity must be a non-negative integer" });
    }

    const cart = await getOrCreateCart(req.user.userId);
    const index = cart.items.findIndex((item) => item.product.toString() === String(targetProductId));

    if (index < 0) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    if (parsedQuantity === 0) {
      cart.items.splice(index, 1);
    } else {
      const product = await Product.findById(targetProductId);
      if (!product || !product.isActive) {
        return res.status(404).json({ message: "Product not found" });
      }

      cart.items[index].quantity = Math.min(product.stock, parsedQuantity);
      cart.items[index].unitPrice = product.price;
      cart.items[index].nameSnapshot = product.name;
      cart.items[index].imageSnapshot = product.images?.[0] || "";
    }

    await cart.save();
    await cart.populate("items.product", "name images price mrp stock isActive");

    return res.json({ cart });
  } catch (_error) {
    return res.status(500).json({ message: "Failed to update cart item" });
  }
}

export async function removeCartItem(req, res) {
  try {
    const targetProductId = req.params.productId;
    const cart = await getOrCreateCart(req.user.userId);

    cart.items = cart.items.filter((item) => item.product.toString() !== String(targetProductId));
    await cart.save();
    await cart.populate("items.product", "name images price mrp stock isActive");

    return res.json({ cart });
  } catch (_error) {
    return res.status(500).json({ message: "Failed to remove cart item" });
  }
}

export async function clearMyCart(req, res) {
  try {
    const cart = await getOrCreateCart(req.user.userId);
    cart.items = [];
    await cart.save();

    return res.json({ cart, message: "Cart cleared" });
  } catch (_error) {
    return res.status(500).json({ message: "Failed to clear cart" });
  }
}
