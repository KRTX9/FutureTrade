/**
 * Data Manager Component
 * Export, import, and clear trading data
 */

import { useState } from "react";
import {
  clearAllData,
  exportData,
  importData,
  getStorageStats,
} from "../services/simpleStorage";
import toast from "react-hot-toast";
import { Download, Upload, Trash2, Database, AlertTriangle } from "lucide-react";

export default function DataManager() {
  const [stats, setStats] = useState(getStorageStats());
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const refreshStats = () => {
    setStats(getStorageStats());
  };

  const handleExport = () => {
    try {
      const data = exportData();
      if (!data) {
        toast.error("Failed to export data");
        return;
      }

      // Create download link
      const blob = new Blob([data], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `trading-data-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("Data exported successfully");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export data");
    }
  };

  const handleImport = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonString = e.target?.result;
        if (typeof jsonString !== "string") {
          throw new Error("Invalid file content");
        }

        const success = importData(jsonString);
        if (success) {
          toast.success("Data imported successfully");
          refreshStats();
          // Reload page to reflect imported data
          setTimeout(() => window.location.reload(), 1000);
        } else {
          toast.error("Failed to import data");
        }
      } catch (error) {
        console.error("Import error:", error);
        toast.error("Invalid data file");
      }
    };
    reader.readAsText(file);
  };

  const handleClear = () => {
    try {
      const success = clearAllData();
      if (success) {
        toast.success("All data cleared");
        setShowClearConfirm(false);
        refreshStats();
        // Reload page to reflect cleared data
        setTimeout(() => window.location.reload(), 1000);
      } else {
        toast.error("Failed to clear data");
      }
    } catch (error) {
      console.error("Clear error:", error);
      toast.error("Failed to clear data");
    }
  };

  return (
    <div className="bg-[#1a1d21] rounded-xl border border-gray-800 p-6">
      <div className="flex items-center gap-3 mb-6">
        <Database className="w-6 h-6 text-yellow-500" />
        <h3 className="text-xl font-semibold text-white">Data Management</h3>
      </div>

      {/* Storage Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-[#0b0e11] rounded-lg p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
            Balance
          </p>
          <p className="text-xl font-bold text-cyan-400">
            ${(stats.balance || 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-[#0b0e11] rounded-lg p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
            Orders
          </p>
          <p className="text-2xl font-bold text-white">{stats.ordersCount}</p>
        </div>
        <div className="bg-[#0b0e11] rounded-lg p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
            Positions
          </p>
          <p className="text-2xl font-bold text-white">{stats.positionsCount}</p>
        </div>
        <div className="bg-[#0b0e11] rounded-lg p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
            User
          </p>
          <p className="text-2xl font-bold text-white">
            {stats.hasUser ? "✓" : "✗"}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-3">
        {/* Export */}
        <button
          onClick={handleExport}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <Download className="w-5 h-5" />
          <span>Export Data (JSON)</span>
        </button>

        {/* Import */}
        <label className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors cursor-pointer">
          <Upload className="w-5 h-5" />
          <span>Import Data (JSON)</span>
          <input
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
        </label>

        {/* Clear All */}
        {!showClearConfirm ? (
          <button
            onClick={() => setShowClearConfirm(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            <Trash2 className="w-5 h-5" />
            <span>Clear All Data</span>
          </button>
        ) : (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
            <div className="flex items-start gap-3 mb-4">
              <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-400 mb-1">
                  Are you sure?
                </p>
                <p className="text-xs text-gray-400">
                  This will permanently delete all your orders, positions, and
                  settings. This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleClear}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm font-medium"
              >
                Yes, Clear All
              </button>
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors text-sm font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
        <p className="text-xs text-yellow-400">
          <strong>Note:</strong> All data is stored locally in your browser.
          Export regularly to backup your trading history.
        </p>
      </div>
    </div>
  );
}
