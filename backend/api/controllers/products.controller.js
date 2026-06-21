import { Product } from "../model/product.schema.js";
import jwt from "jsonwebtoken";
// crud:
export const createProduct = async (req, res, next) => {
  try {
    const { title, description, price, quantity, category } = req.body;
    if (!title || !description || !price || !quantity || !category) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }
    const images =
      req.files?.map((file) => ({
        url: file.path,
        public_id: file.filename,
      })) || [];
    const product = await Product.create({
      title,
      description,
      price,
      category,
      quantity,
      images,
      seller: user.id,
      college: user.college,
    });

    return res.status(201).json({
      message: "Product created successfully",
      data: product,
    });
  } catch (err) {
    return res.status(500).json({
      message: err.message,
    });
  }
};

//  read:
export const getAllProducts = async (req, res, next) => {
  try {
    let filters = {
      inStock: true,
    };
    const token = req.cookies?.token;
    if (token) {
      const decoded = await jwt.verify(token, process.env.JWT_SECRET);
      filters.seller = { $ne: decoded.id };
      // Filter by the student's college
      if (decoded.college) {
        filters.college = decoded.college;
      }
    }
    const products = await Product.find(filters).populate("college", "collegeName");
    if (!products || products.length === 0) {
      return res.status(200).json({
        message: "No products Available for your college",
        data: [],
      });
    }
    return res.status(200).json({
      data: products,
    });
  } catch (err) {
    return res.status(500).json({
      message: err.message,
    });
  }
};

//  read:
export const getMyListing = async (req, res, next) => {
  try {
    let filter = {
      seller: req.user.id,
    };
    const products = await Product.find(filter)
      .populate("college", "collegeName")
      .sort({
        createdAt: -1,
      });
    return res.status(200).json({
      data: products,
    });
  } catch (err) {
    return res.status(500).json({
      message: err.message,
    });
  }
};
// update:
export const markAsSold = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await Product.findOneAndUpdate(
      { _id: id, seller: req.user.id },
      { inStock: false },
      { new: true }
    );
    if (!product) {
      return res.status(404).json({
        message: "Product not found or unauthorized",
      });
    }
    return res.status(200).json({
      message: "Product marked as sold successfully",
      data: product,
    });
  } catch (err) {
    return res.status(500).json({
      message: err.message,
    });
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, price, quantity, category, inStock } = req.body;
    
    let updateData = {
      title,
      description,
      price,
      quantity,
      category,
      inStock
    };

    if (req.files && req.files.length > 0) {
      const images = req.files.map((file) => ({
        url: file.path,
        public_id: file.filename,
      }));
      updateData.images = images;
    }

    const product = await Product.findOneAndUpdate(
      { _id: id, seller: req.user.id },
      updateData,
      { new: true }
    );

    if (!product) {
      return res.status(404).json({
        message: "Product not found or unauthorized",
      });
    }

    return res.status(200).json({
      message: "Product updated successfully",
      data: product,
    });
  } catch (err) {
    return res.status(500).json({
      message: err.message,
    });
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await Product.findOneAndDelete({
      _id: id,
      seller: req.user.id,
    });

    if (!product) {
      return res.status(404).json({
        message: "Product not found or unauthorized",
      });
    }

    return res.status(200).json({
      message: "Product deleted successfully",
    });
  } catch (err) {
    return res.status(500).json({
      message: err.message,
    });
  }
};

export const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id)
      .populate("college", "collegeName")
      .populate("seller", "userName email");
    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }
    return res.status(200).json({
      data: product,
    });
  } catch (err) {
    return res.status(500).json({
      message: err.message,
    });
  }
};
