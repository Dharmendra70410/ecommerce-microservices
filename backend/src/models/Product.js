import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    productId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 180
    },
    description: {
      type: String,
      default: "",
      trim: true,
      maxlength: 4000
    },
    brand: {
      type: String,
      default: "",
      trim: true,
      maxlength: 120
    },
    category: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
      index: true
    },
    images: {
      type: [String],
      default: [],
      validate: {
        validator(value) {
          return Array.isArray(value) && value.every((url) => typeof url === "string" && url.trim().length > 0);
        },
        message: "Images must be a non-empty string array"
      }
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    mrp: {
      type: Number,
      min: 0,
      default: function defaultMrp() {
        return this.price;
      }
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },
    ratingAverage: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },
    ratingCount: {
      type: Number,
      min: 0,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
    }
  },
  {
    timestamps: true
  }
);

productSchema.pre("validate", function updatePricing(next) {
  if (typeof this.mrp !== "number" || this.mrp < this.price) {
    this.mrp = this.price;
  }
  next();
});

productSchema.virtual("discountPercentage").get(function discountPercentage() {
  if (!this.mrp) {
    return 0;
  }

  const saved = ((this.mrp - this.price) / this.mrp) * 100;
  return saved > 0 ? Math.round(saved) : 0;
});

export default mongoose.model("Product", productSchema);
