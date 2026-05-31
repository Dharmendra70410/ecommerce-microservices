import dotenv from "dotenv";
import { connectDB } from "../src/config/db.js";
import Product from "../src/models/Product.js";

dotenv.config();

function buildImageUrl(product) {
  const tokens = [product.name, product.brand, product.category, "product"]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ",")
    .replace(/,+/g, ",")
    .replace(/^,|,$/g, "");

  const query = tokens || "product";
  return `https://source.unsplash.com/1200x900/?${query}`;
}

function needsImageRefresh(images) {
  const first = String(Array.isArray(images) ? images[0] : "").trim();
  if (!first) {
    return true;
  }
  return /example\.com\/images\//i.test(first);
}

async function refreshProductImages() {
  const mongoUri = process.env.FRIEND_MONGODB_URI || process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error("MONGODB_URI or FRIEND_MONGODB_URI is missing in backend/.env");
  }

  await connectDB(mongoUri);

  const products = await Product.find({}, { name: 1, brand: 1, category: 1, images: 1 }).lean();
  const updates = products
    .filter((product) => needsImageRefresh(product.images))
    .map((product) => ({
      updateOne: {
        filter: { _id: product._id },
        update: {
          $set: {
            images: [buildImageUrl(product)]
          }
        }
      }
    }));

  if (!updates.length) {
    console.log("No products required image refresh.");
    return;
  }

  const result = await Product.bulkWrite(updates, { ordered: false });
  console.log(`Product images refreshed: ${result.modifiedCount}`);
}

refreshProductImages()
  .then(() => {
    console.log("Done.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Failed to refresh product images:", error.message);
    process.exit(1);
  });
