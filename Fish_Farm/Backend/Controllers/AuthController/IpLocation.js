// utils/ipLocation.js
const axios = require("axios");

async function getIpLocation(ip) {
  try {
    // If localhost or internal IP, skip lookup
    if (ip === "::1" || ip.startsWith("192.") || ip.startsWith("10.")) {
      return { country: "Localhost", region: "Dev", city: "Local" };
    }

    const response = await axios.get(`https://ipwho.is/${ip}`);
    if (response.data.success) {
      return {
        country: response.data.country,
        region: response.data.region,
        city: response.data.city,
      };
    }
    return { country: "Unknown", region: "", city: "" };
  } catch (err) {
    console.error("IP lookup failed:", err.message);
    return { country: "Unknown", region: "", city: "" };
  }
}

module.exports = getIpLocation;
