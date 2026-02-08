// Pincode geocoding utility for Indian pincodes
// This is a simplified version - in production, you'd use a complete pincode database

// Sample pincode data for major Indian cities (expand as needed)
const pincodeData = {
    // Mumbai
    '400001': { city: 'Mumbai', state: 'Maharashtra', lat: 18.9388, lng: 72.8354 },
    '400051': { city: 'Mumbai', state: 'Maharashtra', lat: 19.0596, lng: 72.8295 },
    '400070': { city: 'Mumbai', state: 'Maharashtra', lat: 19.0176, lng: 72.8561 },

    // Delhi
    '110001': { city: 'New Delhi', state: 'Delhi', lat: 28.6448, lng: 77.2167 },
    '110016': { city: 'New Delhi', state: 'Delhi', lat: 28.5672, lng: 77.2100 },
    '110092': { city: 'New Delhi', state: 'Delhi', lat: 28.6903, lng: 77.2140 },

    // Bangalore
    '560001': { city: 'Bangalore', state: 'Karnataka', lat: 12.9716, lng: 77.5946 },
    '560066': { city: 'Bangalore', state: 'Karnataka', lat: 12.9941, lng: 77.5850 },
    '560103': { city: 'Bangalore', state: 'Karnataka', lat: 13.0343, lng: 77.5977 },

    // Chennai
    '600001': { city: 'Chennai', state: 'Tamil Nadu', lat: 13.0827, lng: 80.2707 },
    '600020': { city: 'Chennai', state: 'Tamil Nadu', lat: 13.0569, lng: 80.2425 },
    '600101': { city: 'Chennai', state: 'Tamil Nadu', lat: 13.1185, lng: 80.2474 },

    // Hyderabad
    '500001': { city: 'Hyderabad', state: 'Telangana', lat: 17.3850, lng: 78.4867 },
    '500081': { city: 'Hyderabad', state: 'Telangana', lat: 17.4065, lng: 78.4772 },

    // Kolkata
    '700001': { city: 'Kolkata', state: 'West Bengal', lat: 22.5726, lng: 88.3639 },
    '700091': { city: 'Kolkata', state: 'West Bengal', lat: 22.4984, lng: 88.3466 },

    // Pune
    '411001': { city: 'Pune', state: 'Maharashtra', lat: 18.5204, lng: 73.8567 },
    '411057': { city: 'Pune', state: 'Maharashtra', lat: 18.4574, lng: 73.8508 },

    // Ahmedabad
    '380001': { city: 'Ahmedabad', state: 'Gujarat', lat: 23.0225, lng: 72.5714 },
    '380015': { city: 'Ahmedabad', state: 'Gujarat', lat: 23.0302, lng: 72.5070 },
};

/**
 * Get coordinates and location details from Indian pincode
 * @param {string} pincode - 6-digit Indian pincode
 * @returns {object|null} - { city, state, coordinates: [lng, lat] } or null if not found
 */
export function getPincodeCoordinates(pincode) {
    if (!pincode || typeof pincode !== 'string') {
        return null;
    }

    // Validate pincode format
    const pincodeRegex = /^[1-9][0-9]{5}$/;
    if (!pincodeRegex.test(pincode)) {
        return null;
    }

    const data = pincodeData[pincode];
    if (!data) {
        // If exact pincode not found, try to estimate based on first 3 digits (postal zone)
        const zone = pincode.substring(0, 3);
        const zoneLookup = findByZone(zone);
        if (zoneLookup) {
            return zoneLookup;
        }
        return null;
    }

    return {
        city: data.city,
        state: data.state,
        coordinates: [data.lng, data.lat], // GeoJSON format: [longitude, latitude]
    };
}

/**
 * Find approximate location based on postal zone (first 3 digits of pincode)
 * @param {string} zone - First 3 digits of pincode
 * @returns {object|null}
 */
function findByZone(zone) {
    // Postal zone mapping (simplified)
    const zoneMap = {
        '110': { city: 'Delhi', state: 'Delhi', lat: 28.6139, lng: 77.2090 },
        '400': { city: 'Mumbai', state: 'Maharashtra', lat: 19.0760, lng: 72.8777 },
        '560': { city: 'Bangalore', state: 'Karnataka', lat: 12.9716, lng: 77.5946 },
        '600': { city: 'Chennai', state: 'Tamil Nadu', lat: 13.0827, lng: 80.2707 },
        '500': { city: 'Hyderabad', state: 'Telangana', lat: 17.3850, lng: 78.4867 },
        '700': { city: 'Kolkata', state: 'West Bengal', lat: 22.5726, lng: 88.3639 },
        '411': { city: 'Pune', state: 'Maharashtra', lat: 18.5204, lng: 73.8567 },
        '380': { city: 'Ahmedabad', state: 'Gujarat', lat: 23.0225, lng: 72.5714 },
    };

    const data = zoneMap[zone];
    if (!data) {
        return null;
    }

    return {
        city: data.city,
        state: data.state,
        coordinates: [data.lng, data.lat],
    };
}

/**
 * Calculate distance between two points using Haversine formula
 * @param {number} lat1 - Latitude of point 1
 * @param {number} lon1 - Longitude of point 1
 * @param {number} lat2 - Latitude of point 2
 * @param {number} lon2 - Longitude of point 2
 * @returns {number} - Distance in kilometers
 */
export function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return Math.round(distance * 10) / 10; // Round to 1 decimal place
}

/**
 * Convert degrees to radians
 * @param {number} deg - Degrees
 * @returns {number} - Radians
 */
function toRad(deg) {
    return deg * (Math.PI / 180);
}

/**
 * Format distance for display
 * @param {number} distanceKm - Distance in kilometers
 * @returns {string} - Formatted distance string
 */
export function formatDistance(distanceKm) {
    if (distanceKm < 1) {
        return `${Math.round(distanceKm * 1000)} m`;
    } else if (distanceKm < 10) {
        return `~${distanceKm.toFixed(1)} km`;
    } else {
        return `~${Math.round(distanceKm)} km`;
    }
}

/**
 * Get all available pincodes (for autocomplete/validation)
 * @returns {string[]} - Array of valid pincodes
 */
export function getAvailablePincodes() {
    return Object.keys(pincodeData);
}

/**
 * Validate pincode format
 * @param {string} pincode - Pincode to validate
 * @returns {boolean} - True if valid format
 */
export function isValidPincodeFormat(pincode) {
    const pincodeRegex = /^[1-9][0-9]{5}$/;
    return pincodeRegex.test(pincode);
}
