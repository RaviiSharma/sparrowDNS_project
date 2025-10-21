// utils/validateZoneType.js
export const validateZoneType = (kind) => {
    const validTypes = ["Native", "Master", "Slave"];
  
    if (!kind) {
      return { valid: false, message: "Zone type (kind) is required" };
    }
  
    if (!validTypes.includes(kind)) {
      return {
        valid: false,
        message: `Invalid zone type '${kind}'. Allowed values: ${validTypes.join(", ")}`
      };
    }
  
    return { valid: true };
  };
  