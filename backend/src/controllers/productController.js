import Product from "../models/Product.js";

function parsePositiveInt(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function parseSort(sortBy) {
  switch (sortBy) {
    case "price-low":
      return { price: 1, createdAt: -1 };
    case "price-high":
      return { price: -1, createdAt: -1 };
    case "rating":
      return { ratingAverage: -1, ratingCount: -1 };
    case "newest":
      return { createdAt: -1 };
    default:
      return { createdAt: -1 };
  }
}

export async function listProducts(req, res) {
  try {
    const page = parsePositiveInt(req.query.page, 1);
    const limit = Math.min(parsePositiveInt(req.query.limit, 24), 100);
    const skip = (page - 1) * limit;

    const q = String(req.query.q || "").trim();
    const category = String(req.query.category || "").trim();

    const filter = { isActive: true };
    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: "i" } },
        { brand: { $regex: q, $options: "i" } },
        { category: { $regex: q, $options: "i" } }
      ];
    }

    if (category && category.toLowerCase() !== "all") {
      filter.category = category;
    }

    const [products, total] = await Promise.all([
      Product.find(filter).sort(parseSort(req.query.sort)).skip(skip).limit(limit).lean(),
      Product.countDocuments(filter)
    ]);

    return res.json({
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit))
      }
    });
  } catch (_error) {
    return res.status(500).json({ message: "Failed to load products" });
  }
}

export async function listCategories(_req, res) {
  try {
    const categories = await Product.distinct("category", { isActive: true });
    categories.sort((a, b) => a.localeCompare(b));
    return res.json({ categories });
  } catch (_error) {
    return res.status(500).json({ message: "Failed to load categories" });
  }
}

export async function getProductById(req, res) {
  try {
    const product = await Product.findById(req.params.productId).lean();
    if (!product || !product.isActive) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.json({ product });
  } catch (_error) {
    return res.status(400).json({ message: "Invalid product id" });
  }
}

export async function createProduct(req, res) {
  try {
    const product = await Product.create(req.body || {});
    return res.status(201).json({ product });
  } catch (_error) {
    return res.status(400).json({ message: "Failed to create product" });
  }
}
