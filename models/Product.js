import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: String,
  category_ids: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category"
    }
  ],
  category_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category"
  },
  images: {
    type: [String],
    default: []
  }
}, { timestamps: true });

export const Product = mongoose.model("Product", productSchema);
