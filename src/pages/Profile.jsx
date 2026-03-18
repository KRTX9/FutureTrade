/**
 * Simple Profile Page
 * Shows username and account information
 */

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TradingLayout from "../Components/Layout/TradingLayout";
import { useAuthStore } from "../stores/authStore";
import useTradingStore from "../stores/tradingStore";
import { ArrowLeft, User } from "lucide-react";
import numeral from "numeral";

export default function Profile() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { wallet, fetchWallet } = useTradingStore();

  useEffect(() => {
    fetchWallet();
  }, [fetchWallet]);

  return (
    <TradingLayout>
      <div className="min-h-screen bg-[#0b0e11]">
        {/* Header */}
        <div className="bg-[#181a20] border-b border-gray-800 px-6 py-4">
          <div className="max-w-4xl mx-auto flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 bg-cyan-500 rounded-full flex items-center justify-center hover:bg-cyan-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>

            <div className="w-12 h-12 bg-cyan-500 rounded-full flex items-center justify-center text-xl font-bold">
              {user?.username?.charAt(0).toUpperCase() || "U"}
            </div>

            <div>
              <h1 className="text-xl font-bold text-white">Profile</h1>
              <p className="text-gray-400 text-sm">{user?.username || "Guest"}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto p-6">
          <div className="space-y-6">
            {/* User Info Card */}
            <div className="bg-[#1a1d21] border border-cyan-500/30 rounded-lg p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-cyan-500 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">{user?.username || "Guest"}</h2>
                  <p className="text-gray-400">Trading Account</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-700">
                <div>
                  <div className="text-gray-400 text-sm">Username</div>
                  <div className="text-white font-medium">{user?.username || "Not logged in"}</div>
                </div>
                <div>
                  <div className="text-gray-400 text-sm">Account Type</div>
                  <div className="text-white font-medium">Demo Trading</div>
                </div>
                <div>
                  <div className="text-gray-400 text-sm">Balance</div>
                  <div className="text-cyan-400 font-medium text-lg">
                    ${numeral(wallet?.balance || 0).format("0,0.00")} USDT
                  </div>
                </div>
                <div>
                  <div className="text-gray-400 text-sm">Status</div>
                  <div className="text-green-400 font-medium">Active</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </TradingLayout>
  );
}
