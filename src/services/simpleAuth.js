/**
 * Simple Authentication Service
 * Username-only authentication (no passwords)
 * Perfect for demo/paper trading platform
 */

import { getUser, setUser, clearUser } from './simpleStorage';

/**
 * Login with just a username
 * No password required - this is a demo app
 */
export const login = (username) => {
  if (!username || username.trim().length === 0) {
    return {
      success: false,
      error: 'Username is required',
    };
  }

  const trimmedUsername = username.trim();
  
  // Check if username is valid (alphanumeric, underscore, hyphen)
  const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
  if (!usernameRegex.test(trimmedUsername)) {
    return {
      success: false,
      error: 'Username must be 3-20 characters (letters, numbers, _, -)',
    };
  }

  // Store user
  const user = setUser(trimmedUsername);
  
  if (user) {
    return {
      success: true,
      user,
    };
  } else {
    return {
      success: false,
      error: 'Failed to save user',
    };
  }
};

/**
 * Logout - clear user data
 */
export const logout = () => {
  clearUser();
  return {
    success: true,
    message: 'Logged out successfully',
  };
};

/**
 * Get current logged-in user
 */
export const getCurrentUser = () => {
  return getUser();
};

/**
 * Check if user is logged in
 */
export const isLoggedIn = () => {
  const user = getUser();
  return !!user && !!user.username;
};

/**
 * Auto-login if user exists in storage
 */
export const autoLogin = () => {
  const user = getCurrentUser();
  if (user) {
    return {
      success: true,
      user,
    };
  }
  return {
    success: false,
    error: 'No user found',
  };
};

// Default export
export default {
  login,
  logout,
  getCurrentUser,
  isLoggedIn,
  autoLogin,
};
