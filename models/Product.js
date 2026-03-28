import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: String,
  category_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category"
  },
  images: [String]
}, { timestamps: true });

export const Product = mongoose.model("Product", productSchema);
