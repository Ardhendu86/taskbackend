import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import productRoutes from "./routes/productRoutes.js";
import { Category } from "./models/Category.js";
import dotenv from "dotenv";

const app = express();
dotenv.config();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log("Mongo Connected");

    const existingCategories = await Category.countDocuments();
    if (existingCategories === 0) {
      await Category.insertMany([
        { name: "Electronics" },
        { name: "Clothing" },
        { name: "Books" }
      ]);
      console.log("Categories seeded successfully");
    }
  })
  .catch(err => console.log(err));

app.use("/api", productRoutes);
app.get("/test", (req, res) => {
  res.send("TEST OK");
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));