import { Wishlist } from "../model/wishlist.schema.js";

export const toggleWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.user.id;

    if (!productId) {
      return res.status(400).json({ message: "Product ID is required" });
    }

    const existing = await Wishlist.findOne({ user: userId, product: productId });

    if (existing) {
      await Wishlist.findByIdAndDelete(existing._id);
      return res.status(200).json({
        message: "Removed from wishlist",
        isWishlisted: false,
      });
    } else {
      await Wishlist.create({ user: userId, product: productId });
      return res.status(201).json({
        message: "Added to wishlist",
        isWishlisted: true,
      });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const getWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const wishlistItems = await Wishlist.find({ user: userId })
      .populate({
        path: "product",
        populate: {
          path: "college",
          select: "collegeName",
        },
      })
      .sort({ createdAt: -1 });

    // Filter out items where product might have been deleted
    const filteredItems = wishlistItems.filter((item) => item.product !== null);

    return res.status(200).json({
      data: filteredItems.map((item) => item.product),
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const getWishlistedIds = async (req, res) => {
  try {
    const userId = req.user.id;
    const items = await Wishlist.find({ user: userId }).select("product");
    const ids = items.map((item) => item.product.toString());
    return res.status(200).json({ data: ids });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};