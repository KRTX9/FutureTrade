/**
 * History Page - Simplified
 * Shows order history with pagination
 */

import { useEffect, useState } from "react";
import TradingLayout from "../Components/Layout/TradingLayout";
import useTradingStore from "../stores/tradingStore";
import { History as HistoryIcon, ChevronLeft, ChevronRight } from "lucide-react";
import clsx from "clsx";
import numeral from "numeral";

const TABS = [
  { id: "orders", label: "Orders" },
];

const ITEMS_PER_PAGE = 15;

export default function History() {
  const [activeTab, setActiveTab] = useState("orders");
  const [currentPage, setCurrentPage] = useState(1);
  const { orders, loading, fetchOrders } = useTradingStore();

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Sort orders by timestamp (newest first)
  const sortedOrders = [...orders].sort((a, b) => {
    return new Date(b.timestamp) - new Date(a.timestamp);
  });

  // Calculate pagination
  const totalPages = Math.ceil(sortedOrders.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedOrders = sortedOrders.slice(startIndex, endIndex);

  // Reset to page 1 when orders change
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [orders.length, currentPage, totalPages]);

  return (
    <TradingLayout>
      <div className="min-h-screen bg-[#0b0e11] p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <HistoryIcon className="w-8 h-8 text-cyan-400" />
              Trading History
            </h1>
            <p className="text-gray-400">
              View your order history ({orders.length} total orders)
            </p>
          </div>

          {/* Tabs */}
          <div className="bg-[#1a1d21] border border-cyan-500/30 rounded-lg overflow-hidden">
            <div className="flex border-b border-gray-800">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={clsx(
                    "px-6 py-4 text-sm font-medium transition-colors relative",
                    activeTab === tab.id
                      ? "text-cyan-400"
                      : "text-gray-400 hover:text-white",
                  )}
                >
                  {tab.label}
                  {activeTab === tab.id && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400" />
                  )}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="p-6">
              {loading.orders ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500" />
                </div>
              ) : orders.length === 0 ? (
                <div className="py-12 text-center text-gray-400">
                  No order history
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-gray-400 text-xs border-b border-gray-800">
                          <th className="text-left py-3 px-4 font-medium">
                            Time
                          </th>
                          <th className="text-left py-3 px-2 font-medium">
                            Symbol
                          </th>
                          <th className="text-left py-3 px-2 font-medium">
                            Type
                          </th>
                          <th className="text-left py-3 px-2 font-medium">
                            Side
                          </th>
                          <th className="text-right py-3 px-2 font-medium">
                            Price
                          </th>
                          <th className="text-right py-3 px-2 font-medium">
                            Qty
                          </th>
                          <th className="text-right py-3 px-2 font-medium">
                            PnL
                          </th>
                          <th className="text-left py-3 px-2 font-medium">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedOrders.map((order) => {
                          const realizedPnL = order.realizedPnL || 0;
                          const isClosing = order.closedPosition;

                          return (
                            <tr
                              key={order.id}
                              className="border-b border-gray-800/50 hover:bg-gray-800/30"
                            >
                              <td className="py-3 px-4 text-gray-400 text-xs">
                                {new Date(order.timestamp).toLocaleString()}
                              </td>
                              <td className="py-3 px-2 text-white font-medium">
                                {order.symbol}
                              </td>
                              <td className="py-3 px-2 text-white">
                                {order.order_type || order.type}
                              </td>
                              <td className="py-3 px-2">
                                <span
                                  className={clsx(
                                    "text-xs font-semibold",
                                    order.side === "Buy"
                                      ? "text-green-400"
                                      : "text-red-400",
                                  )}
                                >
                                  {order.side === "Buy" ? "BUY" : "SELL"}
                                </span>
                              </td>
                              <td className="py-3 px-2 text-right text-white">
                                ${numeral(order.price).format("0,0.00")}
                              </td>
                              <td className="py-3 px-2 text-right text-white">
                                {numeral(order.qty).format("0,0.0000")}
                              </td>
                              <td className="py-3 px-2 text-right">
                                {isClosing ? (
                                  <span
                                    className={clsx(
                                      "font-medium",
                                      realizedPnL >= 0
                                        ? "text-green-400"
                                        : "text-red-400",
                                    )}
                                  >
                                    {realizedPnL >= 0 ? "+" : ""}$
                                    {numeral(Math.abs(realizedPnL)).format(
                                      "0,0.00",
                                    )}
                                  </span>
                                ) : (
                                  <span className="text-gray-500">-</span>
                                )}
                              </td>
                              <td className="py-3 px-2">
                                <span
                                  className={clsx(
                                    "px-2 py-1 rounded text-xs font-medium",
                                    order.status === "Filled"
                                      ? "bg-green-500/20 text-green-400"
                                      : order.status === "Cancelled"
                                        ? "bg-gray-500/20 text-gray-400"
                                        : "bg-cyan-500/20 text-cyan-400",
                                  )}
                                >
                                  {order.status}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-800">
                      <div className="text-sm text-gray-400">
                        Showing {startIndex + 1}-{Math.min(endIndex, orders.length)} of {orders.length} orders
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                          disabled={currentPage === 1}
                          className="p-2 rounded hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed text-gray-400"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => i + 1).map((page) => (
                            <button
                              key={page}
                              onClick={() => setCurrentPage(page)}
                              className={clsx(
                                "px-3 py-1 rounded text-sm transition-colors",
                                currentPage === page
                                  ? "bg-cyan-500 text-white"
                                  : "text-gray-400 hover:bg-gray-700",
                              )}
                            >
                              {page}
                            </button>
                          ))}
                          {totalPages > 10 && <span className="text-gray-500">...</span>}
                        </div>
                        <button
                          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                          disabled={currentPage === totalPages}
                          className="p-2 rounded hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed text-gray-400"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </TradingLayout>
  );
}
