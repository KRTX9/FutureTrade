import { create } from "zustand";
import simpleAuth from "../services/simpleAuth";

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  initialize: async () => {
    // Check if user exists in localStorage
    try {
      const result = simpleAuth.autoLogin();
      
      if (result.success) {
        set({ 
          user: result.user, 
          isAuthenticated: true, 
          isLoading: false 
        });
        return { success: true, data: result.user };
      } else {
        set({ user: null, isAuthenticated: false, isLoading: false });
        return { success: false };
      }
    } catch (error) {
      set({ user: null, isAuthenticated: false, isLoading: false });
      return { success: false, error };
    }
  },

  login: async (username) => {
    try {
      // Simple login - just username, no password
      const result = simpleAuth.login(username);

      if (result.success) {
        set({ user: result.user, isAuthenticated: true });
        return { success: true, user: result.user };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return { success: false, error: error.message || "Login failed" };
    }
  },

  register: async (username) => {
    // Same as login for simplified version
    return this.login(username);
  },

  logout: async () => {
    try {
      simpleAuth.logout();
      set({ user: null, isAuthenticated: false });
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      set({ user: null, isAuthenticated: false });
      return { success: false, error };
    }
  },

  updateUser: (userData) => {
    set((state) => ({
      user: { ...state.user, ...userData },
    }));
  },

  setUser: (user) => {
    set({ user });
  },

  setIsAuthenticated: (isAuthenticated) => {
    set({ isAuthenticated });
  },
}));
