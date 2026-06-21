import React, { useEffect, useState } from "react";
import apiClient from "../../api/api.client";
import { toast } from "react-toastify";

const UsersRequests = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/auth/admin/get-users");
      setUsers(res.data?.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleVerify = async (id) => {
    if (!id) return;
    setProcessingId(id);
    try {
      await apiClient.post(`/auth/admin/verify-user/${id}`);
      toast.success("User verified");
      setUsers((prev) => prev.filter((u) => u._id !== id));
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to verify user");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id) => {
    if (!id) return;
    // simple confirmation
    const ok = window.confirm('Reject this user request? This will remove the user.');
    if (!ok) return;
    setProcessingId(id);
    try {
      await apiClient.post(`/auth/admin/reject-user/${id}`);
      toast.success("User rejected");
      setUsers((prev) => prev.filter((u) => u._id !== id));
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to reject user");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="w-full flex justify-center items-start p-4 md:p-8">
      <div className="w-full max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black uppercase">User Verification Requests</h1>
            <p className="text-sm opacity-70">Approve pending signups to grant access.</p>
          </div>
        </div>

        <div className="rounded-2xl p-6 border shadow-sm" style={{ backgroundColor: "var(--mui-palette-background-paper)" }}>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-10 gap-4">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <p className="font-bold uppercase tracking-wider text-blue-500">Loading requests...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed rounded-xl opacity-60">
              <h3 className="text-xl font-bold mb-2">No pending requests</h3>
              <p className="text-sm">There are currently no user verification requests.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {users.map((u) => (
                <div key={u._id} className="flex flex-col p-4 rounded-xl border transition-shadow hover:shadow-lg" style={{ backgroundColor: "var(--mui-palette-background-default)" }}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="font-black text-lg uppercase">{u.userName}</div>
                      <div className="text-sm text-gray-500">{u.email}</div>
                      <div className="text-xs text-gray-400 mt-2">College: {u.college?.collegeName || '-'}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleVerify(u._id)}
                        disabled={processingId === u._id}
                        className={`px-4 py-2 rounded-xl font-black text-sm uppercase tracking-wider transition-all ${processingId === u._id ? 'bg-gray-400 text-white' : 'bg-green-600 text-white hover:bg-green-700'}`}
                      >
                        {processingId === u._id ? 'Processing...' : 'Verify'}
                      </button>
                      <button
                        onClick={() => handleReject(u._id)}
                        disabled={processingId === u._id}
                        className={`px-4 py-2 rounded-xl font-black text-sm uppercase tracking-wider transition-all ${processingId === u._id ? 'bg-gray-400 text-white' : 'bg-red-600 text-white hover:bg-red-700'}`}
                      >
                        {processingId === u._id ? 'Processing...' : 'Reject'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UsersRequests;
