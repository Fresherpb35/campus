import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import apiClient from "../api/api.client";

const Wishlist = () => {
  const navigate = useNavigate();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removeModal, setRemoveModal] = useState({
    open: false,
    productId: null,
    title: "",
  });

  const fetchWishlist = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get("/wishlist/get-all");
      setWishlist(response.data.data || []);
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      toast.error("Failed to load wishlist");
    } finally {
      setLoading(false);
    }
  };

  const handleMessageClick = (productId, sellerId) => {
    const id = sellerId?._id || sellerId;
    if (!id) {
      toast.error("Seller information not available");
      return;
    }
    navigate(`/chats?sellerId=${id}&productId=${productId}`);
  };

  const handleRemove = (productId, title) => {
    setRemoveModal({ open: true, productId, title });
  };

  const confirmRemove = async () => {
    const { productId, title } = removeModal;
    if (!productId) return;
    try {
      await apiClient.post("/wishlist/toggle", { productId });
      setWishlist((prev) => prev.filter((p) => p._id !== productId));
      toast.success(`Removed "${title}" from wishlist`);
    } catch (error) {
      toast.error("Failed to remove item");
    } finally {
      setRemoveModal({ open: false, productId: null, title: "" });
    }
  };

  const cancelRemove = () =>
    setRemoveModal({ open: false, productId: null, title: "" });

  useEffect(() => {
    fetchWishlist();
  }, []);

  // Theme-aware styles
  const themedStyle = {
    color: "var(--mui-palette-text-primary)",
    backgroundColor: "var(--mui-palette-background-default)",
  };

  const cardStyle = {
    backgroundColor: "var(--mui-palette-background-paper)",
    borderColor: "var(--mui-palette-divider)",
  };

  return (
    <div
      className="min-h-screen p-4 md:p-10 transition-all duration-300"
      style={themedStyle}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header Block */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tighter uppercase mb-2">
              My <span className="text-pink-500">Wishlist</span>
            </h1>
            <p className="text-sm sm:text-lg opacity-60 font-medium">
              Your curated collection of campus favorites.
            </p>
          </div>
          <div className="px-4 sm:px-6 py-2 sm:py-3 rounded-2xl bg-pink-500/10 border border-pink-500/20 text-pink-500 font-black uppercase text-xs tracking-widest">
            {wishlist.length} {wishlist.length === 1 ? "Item" : "Items"} Saved
          </div>
        </div>

        {/* Loading Spinner View */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin" />
            <p className="font-black uppercase tracking-widest text-pink-500 animate-pulse">
              Syncing your favorites...
            </p>
          </div>
        ) : wishlist.length === 0 ? (
          /* Empty State View */
          <div
            className="text-center py-32 border-2 border-dashed rounded-[3rem] transition-all"
            style={{ 
              borderColor: "var(--mui-palette-divider)",
              backgroundColor: "var(--mui-palette-background-paper)" 
            }}
          >
            <div className="w-24 h-24 mx-auto mb-6 bg-pink-500/10 text-pink-500 rounded-full flex items-center justify-center">
              <svg
                className="w-12 h-12"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 006.364-6.364 4.5 4.5 0 00-6.364 0L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </div>
            <h3 className="text-3xl font-black mb-3">Wishlist is empty</h3>
            <p className="max-w-md mx-auto mb-8 px-4 opacity-70">
              You haven't saved any items yet. Browse the marketplace and
              "heart" the things you love!
            </p>
            <Link
              to="/products"
              className="inline-block px-10 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all hover:-translate-y-1"
            >
              Browse Marketplace
            </Link>
          </div>
        ) : (
          /* Populated Wishlist Layout */
          <div className="flex flex-col gap-6">
            {wishlist.map((product) => (
              <div
                key={product._id}
                className="group flex flex-col md:flex-row w-full rounded-3xl overflow-hidden border transition-all duration-500 hover:shadow-2xl hover:border-pink-500/30"
                style={cardStyle}
              >
                {/* Image Section */}
                <div className="relative w-full md:w-72 h-56 md:h-auto shrink-0 overflow-hidden bg-neutral-800/10 dark:bg-white/5">
                  <img
                    src={
                      product.images?.[0]?.url ||
                      "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'><rect width='400' height='300' fill='%23f3f4f6'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='20' fill='%239ca3af'>No Image</text></svg>"
                    }
                    alt={product.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  {product.category && (
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-[10px] font-black text-white uppercase tracking-widest border border-white/20">
                        {product.category}
                      </span>
                    </div>
                  )}
                </div>

                {/* Content Section */}
                <div className="flex-1 flex flex-col justify-between p-6 min-w-0">
                  {/* Top Block: Title & Price Metadata */}
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                    <div className="min-w-0 flex-1">
                      <h3
                        className="text-2xl font-black tracking-tight mb-2 truncate"
                        style={{ color: "var(--mui-palette-text-primary)" }}
                        title={product.title}
                      >
                        {product.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-3 text-xs font-bold opacity-60 uppercase tracking-widest">
                        {product.college?.collegeName && (
                          <>
                            <span className="flex items-center gap-1.5 text-blue-500 shrink-0">
                              <svg
                                className="w-4 h-4"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              {product.college.collegeName}
                            </span>
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                          </>
                        )}
                        <span className="shrink-0">Qty: {product.quantity ?? 1}</span>
                      </div>
                    </div>

                    <div className="flex flex-col items-start sm:items-end shrink-0">
                      <span className="text-2xl font-black text-blue-600">
                        ₹{(product.price || 0).toLocaleString("en-IN")}
                      </span>
                      {product.inStock && (product.quantity > 0) ? (
                        <div className="flex items-center gap-1.5 mt-1">
                          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                          <span className="text-[10px] font-black opacity-50 uppercase tracking-widest">
                            In Stock
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 mt-1">
                          <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                          <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">
                            Sold Out
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bottom Block: Description & CTA actions */}
                  <div
                    className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between pt-4 border-t gap-4"
                    style={{ borderColor: "var(--mui-palette-divider)" }}
                  >
                    <p className="text-sm opacity-60 line-clamp-2 max-w-xl italic">
                      {product.description ? `"${product.description}"` : "No description provided."}
                    </p>
                    
                    <div className="flex flex-row items-center gap-3 justify-end">
                      <button
                        onClick={() => handleRemove(product._id, product.title)}
                        aria-label={`Remove ${product.title} from wishlist`}
                        className="group/remove p-3 rounded-2xl transition-all duration-300 cursor-pointer border border-transparent bg-red-500/10 hover:bg-red-600 hover:text-white text-red-500 shrink-0"
                        title="Remove from Wishlist"
                      >
                        <svg
                          className="w-6 h-6 fill-current transition-transform duration-300 group-hover/remove:scale-110"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                      
                      <button
                        onClick={() => navigate(`/product/${product._id}`)}
                        className="flex-1 sm:flex-none flex items-center gap-2 px-5 py-3 rounded-2xl border border-blue-600 text-blue-600 font-black text-xs uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all cursor-pointer active:scale-95 justify-center"
                      >
                        Details
                      </button>
                      
                      <button
                        onClick={() => handleMessageClick(product._id, product.seller)}
                        className="flex-1 sm:flex-none flex items-center gap-2 px-6 py-3 rounded-2xl bg-blue-600 text-white font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 active:scale-95 cursor-pointer justify-center"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2.5"
                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                          />
                        </svg>
                        Message
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Remove confirmation modal */}
        {removeModal.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={cancelRemove}
            />
            <div
              className="relative w-full max-w-md p-6 rounded-3xl shadow-2xl transition-all"
              style={{
                backgroundColor: "var(--mui-palette-background-paper)",
                border: "1px solid var(--mui-palette-divider)",
                color: "var(--mui-palette-text-primary)"
              }}
            >
              <h3 className="text-xl font-black mb-2">Remove from wishlist</h3>
              <p className="text-sm opacity-70 mb-6 leading-relaxed">
                Are you sure you want to remove <span className="font-bold">"{removeModal.title}"</span> from your
                wishlist? This action can be undone by adding it again.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={cancelRemove}
                  className="px-5 py-2.5 rounded-xl border font-bold text-xs uppercase tracking-wider transition-all cursor-pointer hover:opacity-80"
                  style={{ 
                    borderColor: "var(--mui-palette-divider)",
                    color: "var(--mui-palette-text-primary)"
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmRemove}
                  className="px-5 py-2.5 rounded-xl bg-red-600 text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer hover:bg-red-700 shadow-lg shadow-red-600/20"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;