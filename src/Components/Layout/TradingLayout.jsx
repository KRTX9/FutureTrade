import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  TrendingUp,
  Wallet,
  History,
  Settings,
  Menu,
  X,
  Bell,
  User,
  ChevronDown,
  LogOut,
} from "lucide-react";
import { useAuthStore } from "../../stores/authStore";
import clsx from "clsx";

const navItems = [
  {
    name: "Futures",
    path: "/trading/futures",
    icon: TrendingUp,
  },
  {
    name: "Portfolio",
    path: "/trading/portfolio",
    icon: Wallet,
  },
  {
    name: "History",
    path: "/trading/history",
    icon: History,
  },
  {
    name: "Profile",
    path: "/trading/profile",
    icon: User,
  },
];

export default function TradingLayout({ children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen bg-[#0b0e11] text-white flex flex-col">
      {/* Top Header Navigation - Bybit Style */}
      <header className="h-14 bg-[#181a20] border-b border-gray-800 sticky top-0 z-50">
        <div className="h-full px-4 flex items-center justify-between">
          {/* Left side - Logo and Navigation */}
          <div className="flex items-center gap-1">
            {/* Logo */}
            <Link to="/dashboard" className="flex items-center gap-2 mr-6">
              <img
                src="/logor.png"
                alt="KRTX9 Logo"
                className="w-8 h-8 object-contain"
              />
              <span className="font-bold text-xl hidden sm:block tracking-tight">
                KRTX9
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center">
              {navItems.map((item) => {
                const isActive = location.pathname.startsWith(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={clsx(
                      "px-4 py-2 text-sm font-medium transition-colors relative",
                      isActive
                        ? "text-yellow-500"
                        : "text-gray-400 hover:text-white",
                    )}
                  >
                    {item.name}
                    {isActive && (
                      <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-yellow-500" />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right side - User controls */}
          <div className="flex items-center gap-2">
          

            {/* Settings */}
            <Link
              to="/dashboard"
              className="p-2 hover:bg-gray-700/50 rounded-lg"
            >
              <Settings className="w-5 h-5 text-gray-400" />
            </Link>

            {/* User menu */}
            <div className="relative">
              <button
                className="flex items-center gap-2 p-2 hover:bg-gray-700/50 rounded-lg"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
              >
                <div className="w-7 h-7 bg-gray-600 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
                <span className="hidden sm:block text-sm text-gray-300">
                  {user?.email?.split("@")[0] || "User"}
                </span>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>

              {/* Dropdown */}
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-[#1e2026] border border-gray-700 rounded-lg shadow-xl py-1 z-50">
                  <div className="px-4 py-2 border-b border-gray-700">
                    <div className="text-sm font-medium">{user?.email}</div>
                    <div className="text-xs text-gray-400">Demo Account</div>
                  </div>
                  <Link
                    to="/trading/profile"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700/50"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <User className="w-4 h-4" />
                    Account Profile
                  </Link>
                  <Link
                    to="/dashboard"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700/50"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <Settings className="w-4 h-4" />
                    Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-gray-700/50"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 hover:bg-gray-700/50 rounded-lg"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-14 left-0 right-0 bg-[#181a20] border-b border-gray-800 shadow-lg z-40">
            <nav className="p-2">
              {navItems.map((item) => {
                const isActive = location.pathname.startsWith(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={clsx(
                      "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                      isActive
                        ? "bg-yellow-500/10 text-yellow-500"
                        : "text-gray-400 hover:bg-gray-700/50 hover:text-white",
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </header>

      {/* Page content - Full width, no sidebar offset */}
      <main className="flex-1 h-[calc(100vh-3.5rem)] overflow-auto">
        {children}
      </main>
    </div>
  );
}
