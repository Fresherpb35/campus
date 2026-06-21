import { Order } from "../model/order.schema.js";
import { Product } from "../model/product.schema.js";

export const createOrder = async (req, res) => {
  try {
    const { productId, buyerId, sellerId, quantity } = req.body;

    if (!productId || !buyerId || !sellerId || !quantity) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.quantity < quantity) {
      return res.status(400).json({ message: "Insufficient quantity available" });
    }

    // Update product quantity
    product.quantity -= quantity;
    if (product.quantity <= 0) {
      product.inStock = false;
    }
    await product.save();

    const order = await Order.create({
      productId,
      buyerId,
      sellerId,
      quantity,
    });

    res.status(201).json({
      message: "Order generated successfully",
      data: order,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const getMyOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    // Get orders where the user is either buyer or seller
    const orders = await Order.find({
      $or: [{ buyerId: userId }, { sellerId: userId }],
    })
      .populate("productId")
      .populate("buyerId", "userName email")
      .populate("sellerId", "userName email")
      .sort({ createdAt: -1 });

    res.status(200).json({ data: orders });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};