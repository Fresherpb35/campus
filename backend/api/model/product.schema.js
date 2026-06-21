import mongoose, { mongo } from "mongoose";

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    price: {
      type: Number,
      required: true,
    },
    images: [
      {
        url: String,
        public_id: String,
      },
    ],
    quantity: {
      type: Number,
    },
    category: {
      type: String,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Auth",
    },
    college: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "College",
    },
    inStock: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

export const Product = mongoose.model("Product", productSchema);