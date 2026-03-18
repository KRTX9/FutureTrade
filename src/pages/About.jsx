/**
 * About Page
 * Company information - KRTX9 Capital Management
 */

import { Link } from "react-router-dom";
import {
  TrendingUp,
  Shield,
  Users,
  Globe,
  Mail,
  Twitter,
  Linkedin,
  Github,
  ArrowLeft,
  Target,
  Eye,
  Award,
  Clock,
  Lock,
  Zap,
  BarChart3,
  ChevronRight,
} from "lucide-react";

const teamValues = [
  {
    icon: Shield,
    title: "Security First",
    description:
      "Your assets are protected by industry-leading security measures, including cold storage and multi-signature wallets.",
  },
  {
    icon: Zap,
    title: "High Performance",
    description:
      "Our platform is built for speed with sub-millisecond execution and 99.99% uptime guarantee.",
  },
  {
    icon: Users,
    title: "User-Centric Design",
    description:
      "Every feature is designed with our traders in mind, providing intuitive and powerful tools.",
  },
  {
    icon: Globe,
    title: "Global Access",
    description:
      "Trade from anywhere in the world with our 24/7 platform and multilingual support.",
  },
];

const stats = [
  { value: "$10B+", label: "Trading Volume" },
  { value: "100K+", label: "Active Traders" },
  { value: "50+", label: "Trading Pairs" },
  { value: "99.99%", label: "Uptime" },
];



function About() {
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
                to="/dashboard"
                className="text-gray-400 hover:text-white transition-colors text-sm font-medium"
              >
                Dashboard
              </Link>
              <Link
                to="/trading/futures"
                className="text-gray-400 hover:text-white transition-colors text-sm font-medium"
              >
                Futures
              </Link>
              <Link
                to="/about"
                className="text-white transition-colors text-sm font-medium"
              >
                About
              </Link>
            </nav>

            {/* Back Button */}
            <Link
              to="/dashboard"
              className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back to Dashboard</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 via-transparent to-orange-500/10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 relative">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              About{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
                KRTX9 Capital
              </span>
            </h1>
            <p className="text-gray-400 text-lg md:text-xl max-w-3xl mx-auto">
              We are on a mission to make professional-grade cryptocurrency
              derivatives trading accessible to everyone. Our platform combines
              cutting-edge technology with institutional-grade security to
              provide the best trading experience.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-[#181a20] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-400 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid md:grid-cols-2 gap-12">
          <div className="bg-[#1a1d21] rounded-2xl p-8 border border-gray-800">
            <div className="w-14 h-14 rounded-full bg-yellow-500/10 flex items-center justify-center mb-6">
              <Target className="w-7 h-7 text-yellow-500" />
            </div>
            <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
            <p className="text-gray-400 leading-relaxed">
              To democratize cryptocurrency derivatives trading by providing
              institutional-grade tools and infrastructure to traders of all
              levels. We believe everyone should have access to professional
              trading capabilities without the complexity traditionally
              associated with financial markets.
            </p>
          </div>

          <div className="bg-[#1a1d21] rounded-2xl p-8 border border-gray-800">
            <div className="w-14 h-14 rounded-full bg-orange-500/10 flex items-center justify-center mb-6">
              <Eye className="w-7 h-7 text-orange-500" />
            </div>
            <h2 className="text-2xl font-bold mb-4">Our Vision</h2>
            <p className="text-gray-400 leading-relaxed">
              To become the world's most trusted and innovative cryptocurrency
              derivatives exchange. We envision a future where trading is
              seamless, secure, and accessible to everyone, powered by
              cutting-edge technology and unwavering commitment to our users.
            </p>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="bg-[#181a20] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Core Values</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              These principles guide everything we do at KRTX9 Capital Management
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {teamValues.map((value, index) => (
              <div
                key={index}
                className="bg-[#0b0e11] rounded-xl p-6 border border-gray-800"
              >
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center mb-4">
                  <value.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{value.title}</h3>
                <p className="text-gray-400 text-sm">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

   

      {/* Products Section */}
      <section className="bg-[#181a20] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Products</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Professional trading tools for every level of expertise
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Link
              to="/trading/futures"
              className="group bg-[#0b0e11] rounded-xl p-8 border border-gray-800 hover:border-yellow-500/50 transition-all"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
                  <TrendingUp className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold group-hover:text-yellow-400 transition-colors">
                  Perpetual Futures
                </h3>
              </div>
              <p className="text-gray-400 mb-4">
                Trade cryptocurrency perpetual contracts with up to 125x
                leverage. Access real-time market data, advanced charting, and
                professional risk management tools.
              </p>
              <div className="flex items-center text-yellow-500 text-sm font-medium">
                Start Trading <ChevronRight className="w-4 h-4 ml-1" />
              </div>
            </Link>

            <Link
              to="/trading/portfolio"
              className="group bg-[#0b0e11] rounded-xl p-8 border border-gray-800 hover:border-cyan-500/50 transition-all"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                  <BarChart3 className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold group-hover:text-cyan-400 transition-colors">
                  Portfolio Management
                </h3>
              </div>
              <p className="text-gray-400 mb-4">
                Track your positions, monitor performance, and manage your trading portfolio with comprehensive analytics and real-time updates.
              </p>
              <div className="flex items-center text-cyan-500 text-sm font-medium">
                View Portfolio <ChevronRight className="w-4 h-4 ml-1" />
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-2xl p-12 text-center border border-yellow-500/30">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Trading?</h2>
          <p className="text-gray-400 max-w-2xl mx-auto mb-8">
            Join thousands of traders who trust KRTX9 Capital Management for
            their cryptocurrency derivatives trading needs.
          </p>
          <Link
            to="/trading/futures"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-semibold rounded-lg hover:opacity-90 transition-opacity"
          >
            Start Trading Now <ChevronRight className="w-5 h-5" />
          </Link>
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

export default About;
