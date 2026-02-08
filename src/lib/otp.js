/**
 * OTP Utility Functions
 * 
 * Provides functions for generating and verifying OTP codes
 */

import bcryptjs from 'bcryptjs';

/**
 * Generate a 6-digit OTP code
 * @returns {string} 6-digit OTP code
 */
export function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Hash OTP before storing in database
 * @param {string} otp - Plain OTP code
 * @returns {Promise<string>} Hashed OTP
 */
export async function hashOTP(otp) {
    const salt = await bcryptjs.genSalt(10);
    return await bcryptjs.hash(otp, salt);
}

/**
 * Verify OTP matches hashed version
 * @param {string} otp - Plain OTP code
 * @param {string} hashedOTP - Hashed OTP from database
 * @returns {Promise<boolean>} True if OTP matches
 */
export async function verifyOTP(otp, hashedOTP) {
    return await bcryptjs.compare(otp, hashedOTP);
}

/**
 * Generate OTP expiration time (10 minutes from now)
 * @returns {Date} Expiration timestamp
 */
export function getOTPExpiration() {
    return new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
}
