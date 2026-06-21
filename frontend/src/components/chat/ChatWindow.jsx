import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import apiClient from "../../api/api.client";

const ChatWindow = ({ messages, currentUser, otherParticipant, activeChat, updateActiveChat }) => {
  const scrollRef = useRef();
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!otherParticipant) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center" style={{ backgroundColor: "var(--mui-palette-background-default)" }}>
        <div className="w-24 h-24 bg-blue-500/10 rounded-3xl flex items-center justify-center mb-6 rotate-12">
          <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <h3 className="text-3xl font-black uppercase tracking-tighter mb-2" style={{ color: "var(--mui-palette-text-primary)" }}>Your Hub</h3>
        <p className="max-w-xs text-sm font-medium opacity-50 uppercase tracking-widest" style={{ color: "var(--mui-palette-text-secondary)" }}>
          Pick a chat and start dealing. Campus marketplace at your fingertips.
        </p>
      </div>
    );
  }

  const product = activeChat?.productId;
  const currentUserId = currentUser?._id || currentUser?.id;
  const isSeller = product?.seller?.toString() === String(currentUserId);

  const handleMarkAsSold = () => {
    setIsConfirmModalOpen(true);
  };

  const confirmMarkAsSold = async () => {
    setIsConfirmModalOpen(false);
    try {
      // 1. Generate the completed order
      await apiClient.post("/orders/create", {
        productId: product._id,
        buyerId: otherParticipant._id,
        sellerId: currentUser._id,
        quantity: activeChat.quantity || 1,
      });

      // 2. Mark the product listing as completely sold out (inStock: false) in DB
      await apiClient.patch(`/products/mark-as-sold/${product._id}`);

      toast.success("Listing marked as Sold and order generated successfully!");
      
      // 3. Update local state to reflect sold out status immediately
      if (updateActiveChat) {
        updateActiveChat({ 
          ...activeChat, 
          productId: { 
            ...product, 
            quantity: 0,
            inStock: false 
          } 
        });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to process sale");
    }
  };


  const handleQuantityChange = async (e) => {
    const newQty = parseInt(e.target.value);
    if (isNaN(newQty) || newQty < 1) return;
    
    try {
      const response = await apiClient.patch(`/chat/update-quantity/${activeChat._id}`, {
        quantity: newQty
      });
      if (updateActiveChat) {
        updateActiveChat(response.data);
      }
      toast.info(`Quantity updated to ${newQty}`);
    } catch (error) {
      toast.error("Failed to update quantity");
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden" style={{ backgroundColor: "var(--mui-palette-background-default)" }}>
      {/* Chat Header */}
      <div className="p-4 border-b flex items-center justify-between backdrop-blur-md sticky top-0 z-10" style={{ borderColor: "var(--mui-palette-divider)", backgroundColor: "var(--mui-palette-background-paper)" }}>
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black uppercase shadow-lg shadow-blue-500/20">
            {otherParticipant?.userName?.charAt(0)}
          </div>
          <div>
            <h3 className="font-black uppercase tracking-tight text-sm" style={{ color: "var(--mui-palette-text-primary)" }}>{otherParticipant?.userName}</h3>
            <div className="flex items-center gap-1.5 text-[10px] font-black text-green-500 uppercase tracking-widest">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              Online
            </div>
          </div>
        </div>
      </div>

      {/* Product Context Card - Sticky below header */}
      {product ? (
        <div className="px-6 py-3 border-b transition-all" style={{ borderColor: "var(--mui-palette-divider)", backgroundColor: "var(--mui-palette-background-paper)" }}>
          <div className="p-3 rounded-2xl border flex items-center gap-4 bg-gray-500/5 hover:bg-gray-500/10 transition-colors" style={{ borderColor: "var(--mui-palette-divider)" }}>
            <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-blue-600/10 flex items-center justify-center">
              {product.images?.[0]?.url ? (
                <img 
                  src={product.images[0].url} 
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <svg className="w-6 h-6 text-blue-600 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              {product.title ? (
                <>
                  <h4 className="font-black text-xs uppercase truncate tracking-tight" style={{ color: "var(--mui-palette-text-primary)" }}>
                    {product.title}
                  </h4>
                  <p className="text-blue-600 font-black text-xs mt-0.5">₹{product.price?.toLocaleString()}</p>
                </>
              ) : (
                <div className="space-y-2">
                  <div className="h-3 w-32 bg-gray-500/10 rounded animate-pulse" />
                  <div className="h-2 w-16 bg-blue-500/10 rounded animate-pulse" />
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              {isSeller ? (
                <button 
                  onClick={handleMarkAsSold}
                  disabled={!product.inStock || !product.title}
                  className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                    product.inStock && product.title
                      ? "bg-green-500 text-white hover:bg-green-600 shadow-lg shadow-green-500/20 active:scale-95 cursor-pointer" 
                      : "bg-gray-500/20 text-gray-500 opacity-50 cursor-not-allowed"
                  }`}
                >
                  {product.inStock ? "Mark as Sold" : "Sold Out"}
                </button>
              ) : (
                <div className="flex flex-col items-end gap-1">
                  <span className="text-[8px] font-black opacity-40 uppercase tracking-widest">Select Quantity</span>
                  <input 
                    type="number" 
                    min="1" 
                    max={product.quantity || 1}
                    value={activeChat.quantity || 1}
                    onChange={handleQuantityChange}
                    className="w-16 px-2 py-1 bg-blue-500/10 rounded-lg border border-blue-500/20 text-xs font-black text-blue-600 text-center outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}


      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
        {messages.map((msg, index) => {
          const senderId = msg.sender?._id || msg.sender;
          const senderIdStr = senderId ? String(senderId) : null;
          const currentUserIdStr = currentUser?._id ? String(currentUser._id) : (currentUser?.id ? String(currentUser.id) : null);
          const isOwn = senderIdStr && currentUserIdStr && senderIdStr === currentUserIdStr;

          if (!isOwn) {
            // Helpful debug when messages appear on wrong side
            console.debug("ChatWindow ownership check:", { senderId: senderIdStr, currentUserId: currentUserIdStr, msg });
          }

          // Handle Product Context Separator
          if (msg.messageType === "product" && msg.productId) {
            const p = msg.productId;
            return (
              <div key={msg._id || index} className="flex flex-col items-center py-8 animate-in fade-in zoom-in duration-700">
                <div className="bg-blue-600/5 px-6 py-2 rounded-full mb-6 border border-blue-600/10 backdrop-blur-sm shadow-inner">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 opacity-60">Topic: Item Inquiry</span>
                </div>
                <div className="w-full max-w-sm rounded-[2rem] border p-4 flex items-center gap-5 bg-gray-500/5 hover:bg-gray-500/10 transition-all shadow-xl group/card" style={{ borderColor: "var(--mui-palette-divider)" }}>
                  <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gray-500/10 flex-shrink-0 shadow-lg group-hover/card:scale-105 transition-transform flex items-center justify-center">
                    {p.images?.[0]?.url ? (
                      <img src={p.images[0].url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <svg className="w-8 h-8 text-blue-600 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <h5 className="font-black text-sm uppercase truncate mb-1" style={{ color: "var(--mui-palette-text-primary)" }}>{p.title}</h5>
                    <p className="text-blue-600 font-black text-xs">₹{p.price?.toLocaleString()}</p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-blue-600/10 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            );
          }

          return (
            <div
              key={msg._id || index}
              className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
            >
              <div className={`flex flex-col ${isOwn ? "items-end" : "items-start"} max-w-[80%]`}>
                <div
                  className={`p-4 rounded-2xl text-sm font-medium shadow-sm transition-all hover:shadow-md ${
                    isOwn
                      ? "bg-blue-600 text-white rounded-tr-none"
                      : "rounded-tl-none border"
                  }`}
                  style={!isOwn ? { 
                    borderColor: "var(--mui-palette-divider)", 
                    backgroundColor: "var(--mui-palette-background-paper)",
                    color: "var(--mui-palette-text-primary)" 
                  } : {}}
                >
                  <p className="leading-relaxed">{msg.text}</p>
                </div>
                <span className="text-[9px] mt-1.5 font-black uppercase opacity-30 tracking-widest px-1">
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={scrollRef} />
      </div>

      {/* Confirm Sale Modal */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer" 
            onClick={() => setIsConfirmModalOpen(false)}
          />
          
          {/* Modal Container */}
          <div 
            className="relative w-full max-w-md p-8 rounded-[2.5rem] border shadow-2xl flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-200"
            style={{
              backgroundColor: "var(--mui-palette-background-paper)",
              borderColor: "var(--mui-palette-divider)",
            }}
          >
            {/* Header Icon */}
            <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>

            {/* Content */}
            <h3 className="text-2xl font-black uppercase tracking-tighter mb-3" style={{ color: "var(--mui-palette-text-primary)" }}>
              Confirm Sale
            </h3>
            <p className="text-xs font-semibold leading-relaxed mb-6 opacity-75" style={{ color: "var(--mui-palette-text-secondary)" }}>
              Are you sure you want to mark this item as sold? This will deduct the quantity from the product inventory and generate a completed order for the buyer.
            </p>

            {/* Quick Details Box */}
            <div className="w-full p-4 rounded-2xl bg-gray-500/5 border mb-8 flex flex-col gap-2.5 text-left" style={{ borderColor: "var(--mui-palette-divider)" }}>
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold opacity-50 uppercase tracking-widest" style={{ color: "var(--mui-palette-text-secondary)" }}>Item:</span>
                <span className="font-black uppercase truncate max-w-[200px]" style={{ color: "var(--mui-palette-text-primary)" }}>{product?.title}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold opacity-50 uppercase tracking-widest" style={{ color: "var(--mui-palette-text-secondary)" }}>Buyer:</span>
                <span className="font-black uppercase" style={{ color: "var(--mui-palette-text-primary)" }}>{otherParticipant?.userName}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold opacity-50 uppercase tracking-widest" style={{ color: "var(--mui-palette-text-secondary)" }}>Qty:</span>
                <span className="font-black text-blue-600">{activeChat.quantity || 1} unit(s)</span>
              </div>
              <div className="flex justify-between items-center text-xs border-t pt-2" style={{ borderColor: "var(--mui-palette-divider)" }}>
                <span className="font-bold opacity-50 uppercase tracking-widest" style={{ color: "var(--mui-palette-text-secondary)" }}>Total Price:</span>
                <span className="font-black text-green-500">₹{((product?.price || 0) * (activeChat.quantity || 1)).toLocaleString()}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 w-full">
              <button
                onClick={() => setIsConfirmModalOpen(false)}
                className="flex-1 py-4 border rounded-xl font-black text-xs uppercase tracking-widest bg-transparent hover:bg-gray-500/5 transition-all cursor-pointer active:scale-95 outline-none"
                style={{ borderColor: "var(--mui-palette-divider)", color: "var(--mui-palette-text-primary)" }}
              >
                Cancel
              </button>
              <button
                onClick={confirmMarkAsSold}
                className="flex-1 py-4 bg-green-500 hover:bg-green-600 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-green-500/20 transition-all cursor-pointer active:scale-95 outline-none border-0"
              >
                Confirm Sale
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatWindow;
