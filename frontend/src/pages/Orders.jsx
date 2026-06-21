import React, { useEffect, useState } from "react";
import apiClient from "../api/api.client";
import { useAuth } from "../context/AuthContext";

const OrderCard = ({ order, isBuyer, cardStyle, secondaryTextStyle }) => {
  const otherParty = isBuyer ? order.sellerId : order.buyerId;
  const productPrice = order.productId?.price || 0;
  const totalPrice = productPrice * order.quantity;
  
  return (
    <div 
      className="w-full border rounded-[2rem] p-6 md:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl group"
      style={cardStyle}
    >
      {/* Left side: Image and Product Details */}
      <div className="flex flex-row items-center gap-6 flex-1 min-w-0 w-full">
        {/* Product Image */}
        <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl overflow-hidden flex-shrink-0 bg-blue-600/5 border" style={{ borderColor: "var(--mui-palette-divider)" }}>
          {order.productId?.images?.[0]?.url ? (
            <img 
              src={order.productId.images[0].url} 
              alt={order.productId.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center opacity-25">
               <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </div>

        {/* Text Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
              isBuyer ? "bg-blue-600 text-white" : "bg-green-600 text-white"
            }`}>
              {isBuyer ? "Purchase" : "Sale"}
            </span>
            <span className="text-[9px] font-bold opacity-30 uppercase tracking-widest" style={secondaryTextStyle}>
              ID: #{order._id.slice(-6)}
            </span>
          </div>
          
          <h3 className="text-lg md:text-xl font-black uppercase tracking-tight truncate mb-1" style={{ color: "var(--mui-palette-text-primary)" }}>
            {order.productId?.title || "Unknown Product"}
          </h3>

          <div className="flex flex-col gap-1 text-[11px] font-black uppercase tracking-wider opacity-60" style={secondaryTextStyle}>
            <p className="flex items-center gap-1">
              <span>{isBuyer ? "Seller:" : "Buyer:"}</span>
              <span className="text-blue-500">{otherParty?.userName || "Unknown"}</span>
              <span className="opacity-40 font-medium">({otherParty?.email || "No email"})</span>
            </p>
            <p className="text-[9px] font-bold opacity-40 mt-1 uppercase">
              Deal Date: {new Date(order.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          </div>
        </div>
      </div>

      {/* Right side: Pricing and Transaction Status */}
      <div className="sm:text-right flex flex-row sm:flex-col justify-between sm:justify-center items-center sm:items-end gap-4 w-full sm:w-auto border-t sm:border-t-0 pt-4 sm:pt-0" style={{ borderColor: "var(--mui-palette-divider)" }}>
        <div>
          <span className="text-2xl md:text-3xl font-black text-blue-600 tracking-tight block">
            ₹{totalPrice.toLocaleString()}
          </span>
          <span className="text-[10px] font-black opacity-40 uppercase tracking-widest block mt-0.5" style={secondaryTextStyle}>
            {order.quantity} unit(s) × ₹{productPrice.toLocaleString()}
          </span>
        </div>

        <div className="flex flex-col sm:items-end">
          <span className="text-[10px] font-black text-green-500 uppercase tracking-widest flex items-center gap-1.5 bg-green-500/5 px-3 py-1 rounded-full border border-green-500/10">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            {order.orderStatus}
          </span>
        </div>
      </div>
    </div>
  );
};

const Orders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("bought"); // 'bought' or 'sold'

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await apiClient.get("/orders/my-orders");
        setOrders(response.data.data || []);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: "var(--mui-palette-background-default)" }}>
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Separate bought and sold
  const boughtOrders = orders.filter(
    (order) => order.buyerId?._id === user?._id || order.buyerId === user?._id
  );
  const soldOrders = orders.filter(
    (order) => order.sellerId?._id === user?._id || order.sellerId === user?._id
  );

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

  return (
    <div 
      className="p-4 md:p-8 w-full max-w-full min-h-screen text-left" 
      style={{ ...themedStyle, scrollbarGutter: "stable" }}
    >
      {/* Header */}
      <div className="mb-10 text-left">
        <h1 className="text-4xl font-black uppercase tracking-tighter" style={{ color: "var(--mui-palette-text-primary)" }}>
          Market History
        </h1>
        <p className="font-bold uppercase tracking-widest text-[10px] md:text-xs mt-2 opacity-50" style={secondaryTextStyle}>
          Track your campus deals, sales, and acquisitions
        </p>
      </div>

      {/* Redesigned Sleek Left-Aligned Tab Switcher */}
      <div className="flex border-b mb-8" style={{ borderColor: "var(--mui-palette-divider)" }}>
        <button
          onClick={() => setActiveTab("bought")}
          className={`relative pb-4 px-2 text-xs md:text-sm font-black uppercase tracking-widest transition-all duration-300 cursor-pointer bg-transparent outline-none border-0 ${
            activeTab === "bought" 
              ? "text-blue-600" 
              : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          }`}
        >
          What I Bought ({boughtOrders.length})
          {activeTab === "bought" && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-t-full" />
          )}
        </button>
        
        <button
          onClick={() => setActiveTab("sold")}
          className={`relative pb-4 px-2 ml-8 text-xs md:text-sm font-black uppercase tracking-widest transition-all duration-300 cursor-pointer bg-transparent outline-none border-0 ${
            activeTab === "sold" 
              ? "text-blue-600" 
              : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          }`}
        >
          What I Sold ({soldOrders.length})
          {activeTab === "sold" && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-t-full" />
          )}
        </button>
      </div>

      {/* Full Width Horizontal Cards display (Absolute Stability and Zero Collapsing Layout) */}
      <div className="relative min-h-[550px] w-full">
        {/* Bought Orders */}
        <div className={activeTab === "bought" ? "block" : "hidden"}>
          {boughtOrders.length === 0 ? (
            <div 
              className="w-full rounded-[2rem] p-20 text-center border border-dashed transition-all" 
              style={{ 
                borderColor: "var(--mui-palette-divider)", 
                backgroundColor: "rgba(128,128,128,0.02)" 
              }}
            >
              <div className="w-16 h-16 rounded-full bg-gray-500/5 flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0a2 2 0 01-2 2H6a2 2 0 01-2-2m16 0l-8 5-8-5" />
                </svg>
              </div>
              <h3 className="text-xl font-black uppercase tracking-tight mb-1" style={{ color: "var(--mui-palette-text-primary)" }}>
                No Purchases Yet
              </h3>
              <p className="font-semibold text-xs uppercase tracking-widest opacity-40" style={secondaryTextStyle}>
                Items you acquire from campus will appear here
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-6 w-full">
              {boughtOrders.map((order) => (
                <OrderCard 
                  key={order._id} 
                  order={order} 
                  isBuyer={true} 
                  cardStyle={cardStyle} 
                  secondaryTextStyle={secondaryTextStyle} 
                />
              ))}
            </div>
          )}
        </div>

        {/* Sold Orders */}
        <div className={activeTab === "sold" ? "block" : "hidden"}>
          {soldOrders.length === 0 ? (
            <div 
              className="w-full rounded-[2rem] p-20 text-center border border-dashed transition-all" 
              style={{ 
                borderColor: "var(--mui-palette-divider)", 
                backgroundColor: "rgba(128,128,128,0.02)" 
              }}
            >
              <div className="w-16 h-16 rounded-full bg-gray-500/5 flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0a2 2 0 01-2 2H6a2 2 0 01-2-2m16 0l-8 5-8-5" />
                </svg>
              </div>
              <h3 className="text-xl font-black uppercase tracking-tight mb-1" style={{ color: "var(--mui-palette-text-primary)" }}>
                No Sales Yet
              </h3>
              <p className="font-semibold text-xs uppercase tracking-widest opacity-40" style={secondaryTextStyle}>
                Your sold marketplace gear records will appear here
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-6 w-full">
              {soldOrders.map((order) => (
                <OrderCard 
                  key={order._id} 
                  order={order} 
                  isBuyer={false} 
                  cardStyle={cardStyle} 
                  secondaryTextStyle={secondaryTextStyle} 
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Orders;