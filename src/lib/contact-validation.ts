/**
 * Strict Input Validation and Anti-Bot / Anti-Spam utilities
 * Used across both Client Forms and Server Actions for Lead & Contact management.
 */

// Common dummy / spam test names
const FORBIDDEN_NAMES = new Set([
  "test", "testing", "asdf", "qwerty", "dummy", "admin", "administrator",
  "null", "undefined", "sample", "unknown", "none", "nobody", "fake", "user"
]);

// Dummy phone numbers to reject
const FORBIDDEN_PHONES = new Set([
  "0000000000", "1111111111", "2222222222", "3333333333", "4444444444",
  "5555555555", "6666666666", "7777777777", "8888888888", "9999999999",
  "1234567890", "0987654321", "9876543210", "0123456789", "9876501234"
]);

/**
 * Validates human full name:
 * - 3 to 60 characters
 * - Letters, spaces, hyphens, apostrophes and periods only
 * - Must contain at least 2 distinct letters
 * - Disallows obvious bot/test strings
 */
export function validateFullName(name: string): { isValid: boolean; error?: string; cleanName: string } {
  if (!name || typeof name !== "string") {
    return { isValid: false, error: "Please enter your full name.", cleanName: "" };
  }

  const clean = name.trim().replace(/\s+/g, " ");

  if (clean.length < 3) {
    return { isValid: false, error: "Name must be at least 3 characters long.", cleanName: clean };
  }

  if (clean.length > 60) {
    return { isValid: false, error: "Name must not exceed 60 characters.", cleanName: clean };
  }

  // Must only contain letters, spaces, hyphens, periods, or apostrophes
  if (!/^[a-zA-Z\s.'-]+$/.test(clean)) {
    return { isValid: false, error: "Name should only contain alphabetic letters.", cleanName: clean };
  }

  // Disallow names that are just one repeating letter (e.g. "aaaa")
  const uniqueLetters = new Set(clean.toLowerCase().replace(/[^a-z]/g, ""));
  if (uniqueLetters.size < 2) {
    return { isValid: false, error: "Please provide a valid, real full name.", cleanName: clean };
  }

  // Check forbidden test / bot names
  if (FORBIDDEN_NAMES.has(clean.toLowerCase())) {
    return { isValid: false, error: "Please provide your actual name.", cleanName: clean };
  }

  return { isValid: true, cleanName: clean };
}

/**
 * Validates Indian Mobile Number:
 * - Strips +91, 0 prefix, spaces, dashes
 * - Must be exactly 10 digits
 * - Must start with 6, 7, 8, or 9
 * - Rejects dummy/sequential numbers
 */
export function validateMobileNumber(phone: string): { isValid: boolean; error?: string; cleanPhone: string } {
  if (!phone || typeof phone !== "string") {
    return { isValid: false, error: "Mobile number is required.", cleanPhone: "" };
  }

  // Remove non-digit characters
  let digits = phone.replace(/\D/g, "");

  // If 12 digits starting with 91, strip 91
  if (digits.length === 12 && digits.startsWith("91")) {
    digits = digits.slice(2);
  }
  // If 11 digits starting with 0, strip leading 0
  else if (digits.length === 11 && digits.startsWith("0")) {
    digits = digits.slice(1);
  }

  if (digits.length !== 10) {
    return { 
      isValid: false, 
      error: "Please enter a valid 10-digit mobile number.", 
      cleanPhone: digits 
    };
  }

  // Check Indian mobile prefix: must start with 6, 7, 8, or 9
  if (!/^[6-9]/.test(digits)) {
    return { 
      isValid: false, 
      error: "Mobile number must start with 6, 7, 8, or 9.", 
      cleanPhone: digits 
    };
  }

  // Check for forbidden dummy numbers
  if (FORBIDDEN_PHONES.has(digits)) {
    return { 
      isValid: false, 
      error: "Please enter your genuine 10-digit mobile number.", 
      cleanPhone: digits 
    };
  }

  return { isValid: true, cleanPhone: digits };
}

/**
 * Validates Email Address:
 * - RFC compliant format
 * - Length between 5 and 100 characters
 * - Valid domain structure
 */
export function validateEmailAddress(email: string): { isValid: boolean; error?: string; cleanEmail: string } {
  if (!email || typeof email !== "string") {
    return { isValid: false, error: "Email address is required.", cleanEmail: "" };
  }

  const clean = email.trim().toLowerCase();

  if (clean.length < 5 || clean.length > 100) {
    return { isValid: false, error: "Email address is invalid.", cleanEmail: clean };
  }

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(clean)) {
    return { isValid: false, error: "Please enter a valid email address (e.g., student@domain.com).", cleanEmail: clean };
  }

  return { isValid: true, cleanEmail: clean };
}

/**
 * Validates 6-digit Indian PIN Code:
 * - Exactly 6 digits
 * - Must not start with 0
 */
export function validatePinCode(pin: string): { isValid: boolean; error?: string; cleanPin: string } {
  if (!pin || typeof pin !== "string") {
    return { isValid: false, error: "PIN code is required.", cleanPin: "" };
  }

  const clean = pin.replace(/\D/g, "");

  if (clean.length !== 6 || !/^[1-9]\d{5}$/.test(clean)) {
    return { isValid: false, error: "Please enter a valid 6-digit postal PIN code.", cleanPin: clean };
  }

  return { isValid: true, cleanPin: clean };
}

/**
 * Anti-Spam link & content inspection
 * Detects excessive URLs or spam indicators in messages
 */
export function detectSpamContent(text?: string): { isSpam: boolean; reason?: string } {
  if (!text) return { isSpam: false };

  // Detect script tags or HTML injection
  if (/<script|<\/script|javascript:|onerror=/i.test(text)) {
    return { isSpam: true, reason: "Forbidden HTML/Script tags detected." };
  }

  // Count URLs
  const urlMatches = text.match(/https?:\/\/|www\./gi);
  if (urlMatches && urlMatches.length > 2) {
    return { isSpam: true, reason: "Message contains excessive links." };
  }

  return { isSpam: false };
}
