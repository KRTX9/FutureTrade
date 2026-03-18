/**
 * Dashboard Page
 * Professional trading platform dashboard - KRTX9 Capital Management
 */

import { useAuthStore } from "../stores/authStore";
import { Link, useNavigate } from "react-router-dom";
import {
  TrendingUp,
  Wallet,
  History,
  User,
  Shield,
  ArrowRight,
  Globe,
  Mail,
  Twitter,
  Linkedin,
  Github,
  ChevronRight,
  Zap,
  Lock,
  Clock,
  Award,
  LogOut,
} from "lucide-react";

const tradingFeatures = [
  {
    title: "Futures Trading",
    description: "Trade perpetual contracts with leverage",
    icon: TrendingUp,
    path: "/trading/futures",
    color: "from-yellow-500 to-orange-500",
  },
  {
    title: "Portfolio",
    description: "Track your assets and performance in real-time",
    icon: Wallet,
    path: "/trading/portfolio",
    color: "from-green-500 to-emerald-500",
  },
  {
    title: "Trade History",
    description: "Complete record of all your trading activity",
    icon: History,
    path: "/trading/history",
    color: "from-purple-500 to-pink-500",
  },
  {
    title: "Profile",
    description: "Manage your account and settings",
    icon: User,
    path: "/trading/profile",
    color: "from-cyan-500 to-blue-500",
  },
];

const platformFeatures = [
  {
    icon: Zap,
    title: "Lightning Fast Execution",
    description: "Sub-millisecond order processing",
  },
  {
    icon: Lock,
    title: "Bank-Grade Security",
    description: "Multi-layer encryption & cold storage",
  },
  {
    icon: Clock,
    title: "24/7 Trading",
    description: "Trade anytime, anywhere in the world",
  },
  {
    icon: Award,
    title: "Industry Leading",
    description: "Trusted by professionals worldwide",
  },
];

function Dashboard() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-[#0b0e11] text-white">
      {/* Header */}
      <header className="bg-[#181a20] border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/dashboard" className="flex items-center gap-3">
              <img
                src="/logor.png"
                alt="KRTX9 Capital"
                className="w-10 h-10 object-contain"
              />
              <div className="hidden sm:block">
                <span className="font-bold text-lg text-white">KRTX9</span>
                <span className="text-gray-400 text-sm ml-1">
                  Capital Management
                </span>
              </div>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <Link
                to="/trading/futures"
                className="text-gray-400 hover:text-white transition-colors text-sm font-medium"
              >
                Futures
              </Link>
              <Link
                to="/trading/portfolio"
                className="text-gray-400 hover:text-white transition-colors text-sm font-medium"
              >
                Portfolio
              </Link>
              <Link
                to="/about"
                className="text-gray-400 hover:text-white transition-colors text-sm font-medium"
              >
                About
              </Link>
            </nav>

            {/* User Menu */}
            <div className="flex items-center gap-4">
              <Link
                to="/trading/profile"
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-black font-bold text-sm">
                  {user?.username?.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm text-gray-300 hidden sm:block">
                  {user?.username}
                </span>
              </Link>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 via-transparent to-orange-500/10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 relative">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Welcome back,{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
                {user?.username}
              </span>
            </h1>
            <p className="text-gray-400 text-lg mb-8">
              Your professional trading platform for cryptocurrency derivatives.
              Trade with confidence on KRTX9 Capital Management.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/trading/futures"
                className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-semibold rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2"
              >
                Start Trading <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/about"
                className="px-6 py-3 bg-gray-800 text-white font-medium rounded-lg hover:bg-gray-700 transition-colors"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Access Trading Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-bold mb-8">Quick Access</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {tradingFeatures.map((feature) => (
            <Link
              key={feature.path}
              to={feature.path}
              className="group bg-[#1a1d21] rounded-xl p-6 border border-gray-800 hover:border-gray-700 transition-all hover:shadow-lg hover:shadow-yellow-500/5"
            >
              <div
                className={`w-12 h-12 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4`}
              >
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-yellow-400 transition-colors">
                {feature.title}
              </h3>
              <p className="text-gray-400 text-sm mb-4">
                {feature.description}
              </p>
              <div className="flex items-center text-yellow-500 text-sm font-medium">
                Open <ChevronRight className="w-4 h-4 ml-1" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Account Overview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Account Info Card */}
          <div className="lg:col-span-2 bg-[#1a1d21] rounded-xl p-6 border border-gray-800">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-black text-2xl font-bold">
                {user?.username?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white">
                  {user?.username}
                </h3>
                <p className="text-gray-400">{user?.email}</p>
              </div>
              <div className="ml-auto">
                {user?.is_verified ? (
                  <span className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/20 text-green-400 text-sm">
                    <Shield className="w-4 h-4" /> Verified
                  </span>
                ) : (
                  <span className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-yellow-500/20 text-yellow-400 text-sm">
                    <Shield className="w-4 h-4" /> Pending
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-[#0b0e11] rounded-lg p-4">
                <label className="text-xs text-gray-500 uppercase tracking-wide">
                  Full Name
                </label>
                <p className="text-white mt-1">
                  {user?.first_name && user?.last_name
                    ? `${user.first_name} ${user.last_name}`
                    : "Not provided"}
                </p>
              </div>
              <div className="bg-[#0b0e11] rounded-lg p-4">
                <label className="text-xs text-gray-500 uppercase tracking-wide">
                  Member Since
                </label>
                <p className="text-white mt-1">
                  {new Date(user?.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Security Card */}
          <div className="bg-[#1a1d21] rounded-xl p-6 border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-yellow-500" /> Account
            </h3>
            <div className="space-y-3">
              <div className="bg-[#0b0e11] rounded-lg p-3">
                <label className="text-xs text-gray-500 uppercase tracking-wide">
                  Account Type
                </label>
                <p className="text-white mt-1">Demo Trading</p>
              </div>
              <div className="bg-[#0b0e11] rounded-lg p-3">
                <label className="text-xs text-gray-500 uppercase tracking-wide">
                  Status
                </label>
                <p className="text-green-400 mt-1">Active</p>
              </div>
            </div>
            <Link
              to="/trading/profile"
              className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors text-sm"
            >
              <User className="w-4 h-4" /> View Full Profile
            </Link>
          </div>
        </div>
      </section>

      {/* Platform Features */}
      <section className="bg-[#1a1d21] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why KRTX9 Capital?</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Experience professional-grade trading infrastructure designed for
              serious traders
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {platformFeatures.map((feature, index) => (
              <div key={index} className="text-center p-6">
                <div className="w-14 h-14 mx-auto rounded-full bg-yellow-500/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-7 h-7 text-yellow-500" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-400 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0b0e11] border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <img
                  src="/logor.png"
                  alt="KRTX9 Capital"
                  className="w-10 h-10 object-contain"
                />
                <div>
                  <span className="font-bold text-white">KRTX9</span>
                  <span className="text-gray-400 text-sm block">
                    Capital Management
                  </span>
                </div>
              </div>
              <p className="text-gray-500 text-sm">
                Professional cryptocurrency derivatives trading platform. Trade
                with confidence.
              </p>
            </div>

            {/* Products */}
            <div>
              <h4 className="text-white font-semibold mb-4">Products</h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    to="/trading/futures"
                    className="text-gray-400 hover:text-white text-sm transition-colors"
                  >
                    Futures Trading
                  </Link>
                </li>
                <li>
                  <Link
                    to="/trading/portfolio"
                    className="text-gray-400 hover:text-white text-sm transition-colors"
                  >
                    Portfolio Management
                  </Link>
                </li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    to="/about"
                    className="text-gray-400 hover:text-white text-sm transition-colors"
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    to="/trading/profile"
                    className="text-gray-400 hover:text-white text-sm transition-colors"
                  >
                    Account Settings
                  </Link>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white text-sm transition-colors"
                  >
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white text-sm transition-colors"
                  >
                    Privacy Policy
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-white font-semibold mb-4">Contact</h4>
              <ul className="space-y-3">
                <li className="flex items-center gap-2 text-gray-400 text-sm">
                  <Mail className="w-4 h-4" /> support@krtx9capital.com
                </li>
                <li className="flex items-center gap-2 text-gray-400 text-sm">
                  <Globe className="w-4 h-4" /> www.krtx9capital.com
                </li>
              </ul>
              <div className="flex items-center gap-4 mt-4">
                <a
                  href="https://x.com/k9txs"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <Twitter className="w-5 h-5" />
                </a>
                <a
                  href="https://linkedin.com/in/krtx9"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
                <a
                  href="https://github.com/krtx9"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <Github className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 text-sm">
              © {new Date().getFullYear()} KRTX9 Capital Management. All rights
              reserved.
            </p>
            <p className="text-gray-600 text-xs">
              Trading cryptocurrencies involves significant risk. Past
              performance is not indicative of future results.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Dashboard;
