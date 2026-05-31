import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 180
    },
    image: {
      type: String,
      default: "",
      trim: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0
    }
  },
  {
    _id: false
  }
);

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator(value) {
          return Array.isArray(value) && value.length > 0;
        },
        message: "Order must have at least one item"
      }
    },
    shippingAddress: {
      fullName: { type: String, required: true, trim: true, maxlength: 120 },
      phone: { type: String, required: true, trim: true, maxlength: 20 },
      line1: { type: String, required: true, trim: true, maxlength: 200 },
      line2: { type: String, default: "", trim: true, maxlength: 200 },
      city: { type: String, required: true, trim: true, maxlength: 100 },
      state: { type: String, required: true, trim: true, maxlength: 100 },
      postalCode: { type: String, required: true, trim: true, maxlength: 20 },
      country: { type: String, required: true, trim: true, maxlength: 100 }
    },
    pricing: {
      subtotal: { type: Number, required: true, min: 0 },
      shippingFee: { type: Number, default: 0, min: 0 },
      tax: { type: Number, default: 0, min: 0 },
      discount: { type: Number, default: 0, min: 0 },
      grandTotal: { type: Number, required: true, min: 0 }
    },
    status: {
      type: String,
      enum: ["placed", "confirmed", "packed", "shipped", "delivered", "cancelled"],
      default: "placed",
      index: true
    },
    paymentMethod: {
      type: String,
      enum: ["cod", "card", "upi", "netbanking", "wallet"],
      default: "cod"
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending"
    },
    placedAt: {
      type: Date,
      default: Date.now,
      index: true
    }
  },
  {
    timestamps: true
  }
);

orderSchema.pre("validate", function syncItemTotals(next) {
  this.items = this.items.map((item) => ({
    ...item,
    totalPrice: item.quantity * item.unitPrice
  }));

  const subtotal = this.items.reduce((sum, item) => sum + item.totalPrice, 0);
  if (!this.pricing) {
    this.pricing = { subtotal, shippingFee: 0, tax: 0, discount: 0, grandTotal: subtotal };
  }

  this.pricing.subtotal = subtotal;
  this.pricing.grandTotal =
    subtotal + (this.pricing.shippingFee || 0) + (this.pricing.tax || 0) - (this.pricing.discount || 0);

  if (this.pricing.grandTotal < 0) {
    this.pricing.grandTotal = 0;
  }

  next();
});

export default mongoose.model("Order", orderSchema);
