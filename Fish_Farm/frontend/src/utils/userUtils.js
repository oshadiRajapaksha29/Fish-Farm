/**
 * User utility functions for the Aqua-peak app
 * Handles storing and retrieving user information from localStorage
 */

// Save user contact information (email or phone)
export const saveUserContact = (contact) => {
  if (contact) {
    localStorage.setItem('userContact', contact);
  }
};

// Get user contact information
export const getUserContact = () => {
  return localStorage.getItem('userContact');
};

// Check if user is logged in (has contact info)
export const isUserLoggedIn = () => {
  return !!getUserContact();
};

// Clear user data on logout
export const clearUserData = () => {
  localStorage.removeItem('userContact');
  // You can add more user-related data to clear here
};

// Set user contact on successful checkout
export const saveContactFromCheckout = (contactInfo) => {
  if (contactInfo && contactInfo.emailOrPhone) {
    saveUserContact(contactInfo.emailOrPhone);
  }
};

export default {
  saveUserContact,
  getUserContact,
  isUserLoggedIn,
  clearUserData,
  saveContactFromCheckout
};
