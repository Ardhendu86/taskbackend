import express from "express";
import multer from "multer";
import { Category } from "../models/Category.js";
import { Product } from "../models/Product.js";

const router = express.Router();

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage });
const uploadImages = upload.fields([
  { name: "images", maxCount: 5 },
  { name: "images[]", maxCount: 5 }
]);

const normalizeCategoryIds = (rawCategoryIds) => {
  if (!rawCategoryIds) return [];

  if (Array.isArray(rawCategoryIds)) {
    return rawCategoryIds.filter(Boolean);
  }

  if (typeof rawCategoryIds === "string") {
    try {
      const parsed = JSON.parse(rawCategoryIds);
      if (Array.isArray(parsed)) return parsed.filter(Boolean);
    } catch (e) {
      console.log("Something went wrong!", e);
    }

    return rawCategoryIds
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean);
  }

  return [];
};

const extractImageFilenames = (req) => {
  if (!req.files) return [];

  if (Array.isArray(req.files)) {
    return req.files.map((file) => file.filename);
  }

  const imageFiles = [
    ...(req.files.images || []),
    ...(req.files["images[]"] || [])
  ];

  return imageFiles.map((file) => file.filename);
};

const parseExistingImages = (rawExistingImages) => {
  if (!rawExistingImages) return null;

  if (Array.isArray(rawExistingImages)) {
    return rawExistingImages.filter(Boolean);
  }

  if (typeof rawExistingImages === "string") {
    try {
      const parsed = JSON.parse(rawExistingImages);
      if (Array.isArray(parsed)) {
        return parsed.filter(Boolean);
      }
    } catch {
      return null;
    }
  }

  return null;
};

router.get("/seed", async (req, res) => {
  await Category.insertMany([
    { name: "Electronics" },
    { name: "Clothing" },
    { name: "Books" }
  ]);
  res.send("Categories Added");
});

router.get("/categories", async (req, res) => {
  try {
    const data = await Category.find();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/product", uploadImages, async (req, res) => {
  try {
    const { name } = req.body;
    const category_ids = normalizeCategoryIds(req.body.category_ids || req.body.category_id);
    const images = extractImageFilenames(req);

    const product = new Product({
      name,
      category_ids,
      category_id: category_ids[0] || null,
      images
    });

    await product.save();
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/products", async (req, res) => {
  try {
    const data = await Product.find()
      .populate("category_ids")
      .populate("category_id");
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete("/product/:id", async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/product/:id", uploadImages, async (req, res) => {
  try {
    const { name } = req.body;
    const category_ids = normalizeCategoryIds(req.body.category_ids || req.body.category_id);
    const newImages = extractImageFilenames(req);
    const existingProduct = await Product.findById(req.params.id);

    if (!existingProduct) {
      return res.status(404).json({ error: "Product not found" });
    }

    const parsedExistingImages = parseExistingImages(req.body.existing_images);
    const keptExistingImages = parsedExistingImages !== null
      ? parsedExistingImages
      : (existingProduct.images || []);
    const images = [...keptExistingImages, ...newImages];

    let updateData = {
      name,
      category_ids,
      category_id: category_ids[0] || null,
      images
    };

    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;