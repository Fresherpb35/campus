import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import apiClient from "../api/api.client";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [wishlistedIds, setWishlistedIds] = useState([]);

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const [productRes, wishlistRes] = await Promise.all([
          apiClient.get(`/products/get/${id}`),
          apiClient.get("/wishlist/ids").catch(() => ({ data: { data: [] } })),
        ]);
        setProduct(productRes.data.data);
        setWishlistedIds(wishlistRes.data.data || []);
      } catch (error) {
        console.error("Error fetching product detail:", error);
        toast.error("Failed to load product details");
        navigate("/products");
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [id, navigate]);

  const toggleWishlist = async () => {
    if (!product) return;
    try {
      const response = await apiClient.post("/wishlist/toggle", { productId: product._id });
      if (response.data.isWishlisted) {
        setWishlistedIds([...wishlistedIds, product._id]);
        toast.success("Added to wishlist");
      } else {
        setWishlistedIds(wishlistedIds.filter((itemId) => itemId !== product._id));
        toast.success("Removed from wishlist");
      }
    } catch (error) {
      if (error.response?.status === 401) {
        toast.warning("Please sign in to save items");
      } else {
        toast.error("Wishlist action failed");
      }
    }
  };

  const handleMessageClick = () => {
    if (!product) return;
    if (!product.seller?._id) {
      toast.error("Seller information not available");
      return;
    }
    navigate(`/chats?sellerId=${product.seller._id}&productId=${product._id}`);
  };

  // Theme-aware styles matching the existing theme
  const themedStyle = {
    color: "var(--mui-palette-text-primary)",
    backgroundColor: "var(--mui-palette-background-default)",
  };

  const cardStyle = {
    backgroundColor: "var(--mui-palette-background-paper)",
    borderColor: "var(--mui-palette-divider)",
  };

  const secondaryTextStyle = {
    color: "var(--mui-palette-text-secondary)",
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4" style={themedStyle}>
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="font-bold uppercase tracking-widest text-blue-500 text-xs">
          Loading product details...
        </p>
      </div>
    );
  }

  if (!product) return null;

  const isWishlisted = wishlistedIds.includes(product._id);

  return (
    <div className="min-h-screen p-4 md:p-8 transition-colors duration-300" style={themedStyle}>
      <div className="max-w-5xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-8 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-blue-600 hover:text-blue-700 transition-all cursor-pointer bg-transparent border-0 outline-none"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back
        </button>

        {/* Detail Container */}
        <div 
          className="border rounded-[2.5rem] overflow-hidden shadow-2xl p-6 md:p-10 flex flex-col lg:flex-row gap-10"
          style={cardStyle}
        >
          {/* Gallery Section */}
          <div className="w-full lg:w-1/2 flex flex-col gap-4">
            {/* Active Image Box */}
            <div className="relative aspect-[4/3] rounded-[2rem] overflow-hidden bg-gray-100 border" style={{ borderColor: "var(--mui-palette-divider)" }}>
              <img
                src={product.images?.[activeImageIndex]?.url || "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='600' height='450' viewBox='0 0 600 450'><rect width='600' height='450' fill='%23f3f4f6'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='24' fill='%239ca3af'>No Image</text></svg>"}
                alt={product.title}
                className="w-full h-full object-cover transition-all duration-500"
              />
              <div className="absolute top-4 left-4">
                <span className="px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-[10px] font-bold text-white uppercase tracking-widest border border-white/10 shadow-lg">
                  {product.category}
                </span>
              </div>
              {!product.inStock && (
                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
                  <span className="px-6 py-2 bg-red-600 text-white rounded-full font-black text-xs uppercase tracking-widest shadow-xl">
                    Sold Out
                  </span>
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-all cursor-pointer bg-transparent outline-none ${
                      activeImageIndex === idx ? "border-blue-600 scale-105" : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img src={img.url} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details Info Section */}
          <div className="w-full lg:w-1/2 flex flex-col justify-between">
            <div>
              {/* College & Stock Info */}
              <div className="flex items-center gap-3 text-[10px] font-black opacity-50 uppercase tracking-widest mb-4" style={secondaryTextStyle}>
                <span className="flex items-center gap-1">
                  <svg className="w-3.5 h-3.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  {product.college?.collegeName || "Campus"}
                </span>
                <span>•</span>
                <span>Qty: {product.quantity}</span>
              </div>

              {/* Title & Price */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b" style={{ borderColor: "var(--mui-palette-divider)" }}>
                <h1 className="text-3xl font-black uppercase tracking-tight" style={{ color: "var(--mui-palette-text-primary)" }}>
                  {product.title}
                </h1>
                <div className="flex items-baseline gap-1">
                  <span className="text-sm font-bold text-blue-500">₹</span>
                  <span className="text-4xl font-black text-blue-600 tracking-tighter">
                    {product.price.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="mb-8">
                <h3 className="text-xs font-black uppercase tracking-widest mb-3" style={secondaryTextStyle}>
                  Description
                </h3>
                <p className="text-sm opacity-80 leading-relaxed font-medium" style={{ color: "var(--mui-palette-text-primary)" }}>
                  {product.description}
                </p>
              </div>

              {/* Seller Information */}
              {product.seller && (
                <div className="p-5 rounded-2xl bg-blue-500/5 border border-blue-500/10 mb-8">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-3">
                    Seller Profile
                  </h4>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center font-black text-blue-600 text-sm">
                      {product.seller.userName?.charAt(0).toUpperCase() || "S"}
                    </div>
                    <div>
                      <p className="text-sm font-black uppercase tracking-tight" style={{ color: "var(--mui-palette-text-primary)" }}>
                        {product.seller.userName}
                      </p>
                      <p className="text-xs opacity-60" style={secondaryTextStyle}>
                        {product.seller.email}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={toggleWishlist}
                className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl font-black text-xs uppercase tracking-widest border transition-all cursor-pointer active:scale-[0.98] outline-none bg-transparent ${
                  isWishlisted
                    ? "bg-red-50 text-red-500 border-red-100 hover:bg-red-100"
                    : "bg-transparent text-gray-400 border-gray-300 hover:border-red-500 hover:text-red-500 hover:bg-red-50/20"
                }`}
                style={{
                  borderColor: isWishlisted ? "" : "var(--mui-palette-divider)",
                }}
              >
                <svg
                  className={`w-4 h-4 transition-transform ${isWishlisted ? "fill-current scale-110" : ""}`}
                  fill={isWishlisted ? "currentColor" : "none"}
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 006.364-6.364 4.5 4.5 0 00-6.364 0L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
                {isWishlisted ? "Wishlisted" : "Save to Wishlist"}
              </button>

              <button
                onClick={handleMessageClick}
                disabled={!product.inStock}
                className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl text-white font-black text-xs uppercase tracking-widest transition-all cursor-pointer shadow-lg active:scale-[0.98] outline-none border-0 ${
                  product.inStock ? "bg-blue-600 hover:bg-blue-700 shadow-blue-500/10" : "bg-gray-400 cursor-not-allowed shadow-none"
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.5"
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                Contact Seller
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default ProductDetail;