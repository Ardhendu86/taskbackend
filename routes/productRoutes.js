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

router.post("/product", upload.array("images", 5), async (req, res) => {
  try {
    const { name, category_id } = req.body;

    const images = req.files.map(file => file.filename);

    const product = new Product({
      name,
      category_id,
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
    const data = await Product.find().populate("category_id");
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

router.put("/product/:id", upload.array("images", 5), async (req, res) => {
  try {
    const { name, category_id } = req.body;

    let updateData = {
      name,
      category_id
    };

    if (req.files && req.files.length > 0) {
      updateData.images = req.files.map(file => file.filename);
    }

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