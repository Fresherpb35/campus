import React, { useEffect, useState } from "react";
import apiClient from "../api/api.client";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    myListingsCount: 0,
    purchasedOrdersCount: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      // If not logged in, user might be null, but protected route might handle it.
      // To be safe, if we don't have a user, wait or just proceed if token is there.
      try {
        const [listingsRes, ordersRes] = await Promise.all([
          apiClient.get("/products/get-myListing").catch(() => ({ data: { data: [] } })),
          apiClient.get("/orders/my-orders").catch(() => ({ data: { data: [] } })),
        ]);

        const myListings = listingsRes.data.data || [];
        const orders = ordersRes.data.data || [];

        let purchasedCount = 0;
        let revenue = 0;

        orders.forEach((order) => {
          // Identify if current user is buyer
          const isBuyer = order.buyerId?._id === user?._id || order.buyerId === user?._id;

          if (isBuyer) {
            purchasedCount++;
          }
        });

        // Calculate revenue based on listings marked as sold
        myListings.forEach((product) => {
          if (!product.inStock) {
            revenue += product.price || 0;
          }
        });

        // Calculate active listings count
        const activeListingsCount = myListings.filter(p => p.inStock).length;

        setStats({
          myListingsCount: activeListingsCount,
          purchasedOrdersCount: purchasedCount,
          totalRevenue: revenue,
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
    } else {
      setLoading(false);
    }
  }, [user]);

  // Theme-aware styles
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
      <div className="flex items-center justify-center min-h-screen" style={themedStyle}>
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // If user is not logged in, we should ideally ask them to sign in,
  // but ProtectedRoute in App.jsx should handle this for Dashboard if it was protected.
  // Wait, Dashboard is NOT under ProtectedRoute in App.jsx! 
  // Let's check App.jsx again. Path "/" is Dashboard, and it is NOT protected.
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4" style={themedStyle}>
         <div className="max-w-md w-full p-8 rounded-[2rem] border text-center shadow-2xl" style={cardStyle}>
            <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
               <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
               </svg>
            </div>
            <h2 className="text-2xl font-black uppercase tracking-tighter mb-2" style={{ color: "var(--mui-palette-text-primary)" }}>Welcome to Campus Marketplace</h2>
            <p className="text-xs uppercase tracking-widest opacity-60 mb-8" style={secondaryTextStyle}>Please sign in to view your dashboard</p>
            <button 
              onClick={() => navigate("/signin")}
              className="w-full py-4 bg-blue-600 text-white rounded-xl font-black uppercase tracking-widest text-xs hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-[0.98]"
            >
              Sign In
            </button>
         </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto min-h-screen" style={themedStyle}>
      <div className="mb-10 text-center md:text-left">
        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter" style={{ color: "var(--mui-palette-text-primary)" }}>
          Dashboard
        </h1>
        <p className="font-bold uppercase tracking-widest text-[10px] md:text-xs mt-2 opacity-50" style={secondaryTextStyle}>
          Overview of your marketplace activity
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Listings Card */}
        <div 
          onClick={() => navigate("/my-listing")}
          className="border rounded-[2rem] p-8 flex flex-col justify-between transition-all hover:-translate-y-2 hover:shadow-2xl cursor-pointer group"
          style={cardStyle}
        >
          <div className="flex items-center justify-between mb-8">
             <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center transition-transform group-hover:scale-110 group-hover:rotate-3">
                <svg className="w-7 h-7 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
             </div>
             <div className="w-8 h-8 rounded-full border flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" style={{ borderColor: "var(--mui-palette-divider)" }}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                </svg>
             </div>
          </div>
          <div>
            <h3 className="text-5xl font-black tracking-tighter mb-2" style={{ color: "var(--mui-palette-text-primary)" }}>
              {stats.myListingsCount}
            </h3>
            <p className="text-[11px] font-black uppercase tracking-widest opacity-50" style={secondaryTextStyle}>
              Active Listings
            </p>
          </div>
        </div>

        {/* Orders Card */}
        <div 
          onClick={() => navigate("/orders")}
          className="border rounded-[2rem] p-8 flex flex-col justify-between transition-all hover:-translate-y-2 hover:shadow-2xl cursor-pointer group"
          style={cardStyle}
        >
          <div className="flex items-center justify-between mb-8">
             <div className="w-14 h-14 rounded-2xl bg-green-500/10 flex items-center justify-center transition-transform group-hover:scale-110 group-hover:-rotate-3">
                <svg className="w-7 h-7 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
             </div>
             <div className="w-8 h-8 rounded-full border flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" style={{ borderColor: "var(--mui-palette-divider)" }}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                </svg>
             </div>
          </div>
          <div>
            <h3 className="text-5xl font-black tracking-tighter mb-2" style={{ color: "var(--mui-palette-text-primary)" }}>
              {stats.purchasedOrdersCount}
            </h3>
            <p className="text-[11px] font-black uppercase tracking-widest opacity-50" style={secondaryTextStyle}>
              Orders Purchased
            </p>
          </div>
        </div>

        {/* Revenue Card */}
        <div 
          onClick={() => navigate("/orders")}
          className="border rounded-[2rem] p-8 flex flex-col justify-between transition-all hover:-translate-y-2 hover:shadow-2xl cursor-pointer group"
          style={cardStyle}
        >
          <div className="flex items-center justify-between mb-8">
             <div className="w-14 h-14 rounded-2xl bg-orange-500/10 flex items-center justify-center transition-transform group-hover:scale-110 group-hover:rotate-3">
                <svg className="w-7 h-7 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
             </div>
             <div className="w-8 h-8 rounded-full border flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" style={{ borderColor: "var(--mui-palette-divider)" }}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                </svg>
             </div>
          </div>
          <div>
            <h3 className="text-5xl font-black tracking-tighter mb-2" style={{ color: "var(--mui-palette-text-primary)" }}>
              ₹{stats.totalRevenue.toLocaleString()}
            </h3>
            <p className="text-[11px] font-black uppercase tracking-widest opacity-50" style={secondaryTextStyle}>
              Total Revenue
            </p>
          </div>
        </div>
      </div>
      
      {/* Quick Actions or Info */}
      {user && (
         <div className="mt-12 p-8 border rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-6" style={cardStyle}>
            <div className="flex items-center gap-6">
               <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
               </div>
               <div>
                  <h4 className="text-xl font-black uppercase tracking-tighter mb-1" style={{ color: "var(--mui-palette-text-primary)" }}>Ready to sell more?</h4>
                  <p className="text-xs uppercase tracking-widest opacity-60" style={secondaryTextStyle}>List a new item on the marketplace and reach out to buyers.</p>
               </div>
            </div>
            <button 
               onClick={() => navigate("/my-listing")}
               className="w-full md:w-auto px-8 py-4 bg-blue-600 text-white rounded-xl font-black uppercase tracking-widest text-xs hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-[0.98] whitespace-nowrap"
            >
               Create Listing
            </button>
         </div>
      )}
    </div>
  );
};

export default Dashboard;