const ExifReader = require('exifreader');
const fs = require('fs');

/**
 * Calculates Haversine distance between two sets of GPS coordinates in kilometers.
 */
const calculateDistanceKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(2));
};

/**
 * Parses EXIF metadata from a local image file path and verifies against target coordinates.
 * @param {string} filePath - Absolute path to local uploaded image
 * @param {number|null} targetLat - Challenge target latitude
 * @param {number|null} targetLng - Challenge target longitude
 */
const extractAndVerifyExif = async (filePath, targetLat, targetLng) => {
  try {
    if (!filePath || !fs.existsSync(filePath)) {
      return { exifLatitude: null, exifLongitude: null, exifVerified: false, exifDistanceKm: null };
    }

    const buffer = fs.readFileSync(filePath);
    const tags = ExifReader.load(buffer, { expanded: true });

    if (!tags.gps || !tags.gps.Latitude || !tags.gps.Longitude) {
      return { exifLatitude: null, exifLongitude: null, exifVerified: false, exifDistanceKm: null };
    }

    const exifLatitude = Number(tags.gps.Latitude);
    const exifLongitude = Number(tags.gps.Longitude);

    if (isNaN(exifLatitude) || isNaN(exifLongitude)) {
      return { exifLatitude: null, exifLongitude: null, exifVerified: false, exifDistanceKm: null };
    }

    // If target coordinates are provided, compute distance
    let distanceKm = null;
    let verified = false;

    if (targetLat !== null && targetLng !== null && !isNaN(targetLat) && !isNaN(targetLng)) {
      distanceKm = calculateDistanceKm(exifLatitude, exifLongitude, targetLat, targetLng);
      // Photo is verified on-site if taken within 3.0 km of reported challenge coordinates
      verified = distanceKm <= 3.0;
    } else {
      // If user provided no map pin, having valid GPS tags is considered geotagged
      verified = true;
    }

    return {
      exifLatitude: Number(exifLatitude.toFixed(6)),
      exifLongitude: Number(exifLongitude.toFixed(6)),
      exifVerified: verified,
      exifDistanceKm: distanceKm,
    };
  } catch (error) {
    // If image doesn't contain EXIF metadata or parsing fails, return graceful default
    return { exifLatitude: null, exifLongitude: null, exifVerified: false, exifDistanceKm: null };
  }
};

module.exports = { extractAndVerifyExif, calculateDistanceKm };
